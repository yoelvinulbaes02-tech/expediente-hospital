import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { BannerAlergias } from '@/components/BannerAlergias'
import { ChecklistTareas } from '@/components/ChecklistTareas'
import Link from 'next/link'
import { agregarAlergia } from './actions'
import { guardarNota } from './actions-notas'
import { guardarSignosVitales } from './actions-vitales'
import { tomarACargo, reasignarResponsable } from './actions-responsable'
import { GraficaTemperatura } from '@/components/GraficaTemperatura'
import { calcularPermisos } from '@/lib/permisos'

export default async function ExpedientePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const { id } = await params
  const { error } = await searchParams
  const userId = session.user.id
  const role = String(session.user.role)
  const miEmail = (session.user.email ?? '').toLowerCase()

  const episode = await prisma.episode.findUnique({
    where: { id },
    include: {
      patient: true,
      allergies: true,
      responsible: { select: { fullName: true } },
      notes: { orderBy: { createdAt: 'desc' } },
      vitals: { orderBy: { createdAt: 'desc' }, take: 10 },
      tasks: { orderBy: { createdAt: 'asc' } },
      handoffs: { where: { status: 'PENDIENTE' }, take: 1 },
    },
  })

  if (!episode) return <div className="p-8 text-center text-slate-800">Expediente no encontrado.</div>

  const permisos = calcularPermisos(role, userId, episode)
  const esSoloLectura = !permisos.activo
  const entregaPendiente = episode.handoffs[0]

  // Nombres completos en lugar de correos
  const emails = new Set<string>()
  episode.notes.forEach((n) => emails.add(n.createdBy))
  episode.tasks.forEach((t) => {
    emails.add(t.createdBy)
    if (t.doneBy) emails.add(t.doneBy)
  })
  if (entregaPendiente) {
    emails.add(entregaPendiente.entregadoPor)
    emails.add(entregaPendiente.recibidoPor)
  }
  const usuarios = await prisma.user.findMany({
    where: { email: { in: Array.from(emails) } },
    select: { email: true, fullName: true },
  })
  const nombres: Record<string, string> = Object.fromEntries(usuarios.map((u) => [u.email, u.fullName]))

  // Lista de médicos para reasignar (solo la ve el administrador)
  const medicos =
    role === 'ADMIN' && permisos.activo
      ? await prisma.user.findMany({
          where: { isActive: true, role: { in: ['DOCTOR', 'RESIDENT'] } },
          select: { id: true, fullName: true },
          orderBy: { fullName: 'asc' },
        })
      : []

  // Lógica para resaltar valores fuera de rango
  const esAnormal = (tipo: string, valor: number | null) => {
    if (!valor) return false
    if (tipo === 'temp') return valor < 36.0 || valor > 37.5
    if (tipo === 'fc') return valor < 60 || valor > 100
    if (tipo === 'sys') return valor < 90 || valor > 140
    if (tipo === 'dia') return valor < 60 || valor > 90
    if (tipo === 'spo2') return valor < 95
    return false
  }

  // Formatear datos para la gráfica
  const datosGrafica = episode.vitals
    .filter((v) => v.temperature !== null)
    .map((v) => ({ valor: v.temperature!, fecha: v.createdAt.toISOString() }))

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Mensaje de error (permisos, validaciones) */}
        {error && (
          <div className="bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded-lg mb-4">
            ⚠️ {error}
          </div>
        )}

        {/* Banner de Solo Lectura (expediente cerrado) */}
        {esSoloLectura && (
          <div className="bg-amber-100 border border-amber-300 text-amber-800 px-4 py-3 rounded-lg mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🔒</span>
              <strong>Expediente Cerrado:</strong> Este paciente ha sido dado de alta. Estás viendo el historial en modo de solo lectura.
            </div>
            <Link href="/dashboard/archivo" className="text-sm font-bold underline hover:text-amber-900">Volver al Archivo</Link>
          </div>
        )}

        {/* Quién está a cargo */}
        {!esSoloLectura &&
          (permisos.esResponsable ? (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-lg mb-4">
              ✅ <strong>Tú estás a cargo</strong> de este paciente. Puedes editar su información.
            </div>
          ) : permisos.sinResponsable ? (
            <div className="bg-amber-50 border border-amber-300 text-amber-900 px-4 py-3 rounded-lg mb-4 flex flex-wrap items-center justify-between gap-3">
              <span>⚠️ <strong>Este paciente no tiene médico a cargo.</strong></span>
              {permisos.puedeTomarACargo && (
                <form action={tomarACargo}>
                  <input type="hidden" name="episodeId" value={episode.id} />
                  <button className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-700">
                    Tomar a cargo
                  </button>
                </form>
              )}
            </div>
          ) : (
            <div className="bg-slate-100 border border-slate-300 text-slate-700 px-4 py-3 rounded-lg mb-4">
              👁️ <strong>Solo lectura.</strong> Paciente a cargo de <strong>{episode.responsible?.fullName}</strong>.
              {permisos.puedeRegistrarVitales && ' Puedes registrar signos vitales.'}
              {permisos.puedeMarcarTareas && ' Puedes marcar tareas del checklist.'}
            </div>
          ))}

        {/* Entrega de turno pendiente */}
        {entregaPendiente && !esSoloLectura && (
          <div className="bg-indigo-50 border border-indigo-200 text-indigo-900 px-4 py-3 rounded-lg mb-4 flex flex-wrap items-center justify-between gap-3">
            <span>
              📋 <strong>Entrega de turno pendiente:</strong>{' '}
              {nombres[entregaPendiente.entregadoPor] ?? entregaPendiente.entregadoPor} entregó este paciente a{' '}
              <strong>{nombres[entregaPendiente.recibidoPor] ?? entregaPendiente.recibidoPor}</strong>. Hasta que acepte,
              sigue a cargo {episode.responsible?.fullName ?? 'nadie'}.
            </span>
            {entregaPendiente.recibidoPor.toLowerCase() === miEmail && (
              <Link href={`/dashboard/paciente/${episode.id}/turno`} className="font-bold underline">
                Revisar y aceptar →
              </Link>
            )}
          </div>
        )}

        {/* Reasignar (solo administrador) */}
        {role === 'ADMIN' && permisos.activo && (
          <details className="bg-white border border-slate-200 rounded-lg mb-4 px-4 py-3">
            <summary className="text-sm font-medium text-slate-700 cursor-pointer">
              🔁 Reasignar médico a cargo (administrador)
            </summary>
            <form action={reasignarResponsable} className="flex flex-wrap gap-2 mt-3">
              <input type="hidden" name="episodeId" value={episode.id} />
              <select name="nuevoResponsableId" required className="px-3 py-2 border rounded-lg text-sm bg-white text-slate-900">
                <option value="">Seleccionar médico…</option>
                {medicos.map((m) => (
                  <option key={m.id} value={m.id}>{m.fullName}</option>
                ))}
              </select>
              <input name="motivo" required placeholder="Motivo (obligatorio)" className="flex-1 min-w-[12rem] px-3 py-2 border rounded-lg text-sm text-slate-900" />
              <button className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-900">Reasignar</button>
            </form>
          </details>
        )}

        {/* Cabecera */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <Link href={esSoloLectura ? '/dashboard/archivo' : '/dashboard'} className="text-sm text-blue-600 hover:underline mb-2 inline-block">
              ← Volver a la lista
            </Link>
            <h1 className="text-3xl font-bold text-slate-800">{episode.patient.firstName} {episode.patient.lastName}</h1>
            <p className="text-slate-500">Exp: {episode.patient.expedienteNumber} • {episode.patient.age} años • {episode.patient.sex}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!esSoloLectura && (
              <Link href={`/dashboard/paciente/${episode.id}/turno`} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
                📋 Entrega de Turno
              </Link>
            )}
            {permisos.puedeEditar && (
              <Link href={`/dashboard/paciente/${episode.id}/alta`} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors shadow-sm">
                🚪 Dar de Alta
              </Link>
            )}
            <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-bold border border-blue-200 text-lg">
              Hab. {episode.room} - Cama {episode.bed}
            </div>
          </div>
        </div>

        <BannerAlergias alergias={episode.allergies} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Columna Izquierda */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4">Datos del Ingreso</h2>
              <p className="text-sm text-slate-600 mb-2"><strong>Motivo:</strong> {episode.chiefComplaint}</p>
              <p className="text-sm text-slate-600 mb-2"><strong>Médico:</strong> {episode.attendingDoctor}</p>
              <p className="text-sm text-slate-600 mb-2"><strong>A cargo ahora:</strong> {episode.responsible?.fullName ?? 'Sin asignar'}</p>
            </div>

            {/* Signos Vitales: médico a cargo o enfermería */}
            {permisos.puedeRegistrarVitales && (
              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                <h2 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4">Registrar Signos Vitales</h2>
                <form action={guardarSignosVitales} className="space-y-3">
                  <input type="hidden" name="episodeId" value={episode.id} />
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Presión (Sist/Diast)</label>
                      <div className="flex gap-1">
                        <input name="systolic" type="number" placeholder="120" className="w-full px-2 py-1 border rounded text-sm text-slate-900" />
                        <input name="diastolic" type="number" placeholder="80" className="w-full px-2 py-1 border rounded text-sm text-slate-900" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">F. Cardíaca</label>
                      <input name="heartRate" type="number" placeholder="75" className="w-full px-2 py-1 border rounded text-sm text-slate-900" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">F. Resp.</label>
                      <input name="respiratoryRate" type="number" placeholder="16" className="w-full px-2 py-1 border rounded text-sm text-slate-900" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Temp (°C)</label>
                      <input name="temperature" type="number" step="0.1" placeholder="36.5" className="w-full px-2 py-1 border rounded text-sm text-slate-900" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">SpO2 (%)</label>
                      <input name="oxygenSat" type="number" placeholder="98" className="w-full px-2 py-1 border rounded text-sm text-slate-900" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Glucosa</label>
                      <input name="glucose" type="number" placeholder="100" className="w-full px-2 py-1 border rounded text-sm text-slate-900" />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors mt-2">Guardar Signos</button>
                </form>
              </div>
            )}

            {/* Alergias: solo el médico a cargo */}
            {permisos.puedeEditar && (
              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                <h2 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4">Agregar Alergia</h2>
                <form action={agregarAlergia} className="space-y-3">
                  <input type="hidden" name="episodeId" value={episode.id} />
                  <input name="allergen" required className="w-full px-3 py-2 border rounded-lg text-sm text-slate-900" placeholder="Alérgeno (Ej. Mariscos)" />
                  <select name="severity" required className="w-full px-3 py-2 border rounded-lg text-sm bg-white text-slate-900">
                    <option value="leve">Leve</option>
                    <option value="moderada">Moderada</option>
                    <option value="grave">Grave</option>
                  </select>
                  <input type="hidden" name="type" value="otro" />
                  <input type="hidden" name="reaction" value="" />
                  <button type="submit" className="w-full bg-slate-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-900">Guardar Alergia</button>
                </form>
              </div>
            )}
          </div>

          {/* Columna Derecha */}
          <div className="lg:col-span-2 space-y-6">
            {/* Checklist: lo primero que ve quien recibe el turno */}
            <ChecklistTareas
              episodeId={episode.id}
              tareas={episode.tasks}
              nombres={nombres}
              puedeMarcar={permisos.puedeMarcarTareas}
              puedeEditar={permisos.puedeEditar}
            />

            {/* Gráfica de Temperatura */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4">Tendencia de Temperatura</h2>
              <GraficaTemperatura datos={datosGrafica} />
            </div>

            {/* Historial de Signos Vitales */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
              <h2 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4">Últimos Signos Vitales</h2>
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-100 text-slate-600">
                  <tr>
                    <th className="px-3 py-2">Hora</th>
                    <th className="px-3 py-2">TA</th>
                    <th className="px-3 py-2">FC</th>
                    <th className="px-3 py-2">Temp</th>
                    <th className="px-3 py-2">SpO2</th>
                  </tr>
                </thead>
                <tbody>
                  {episode.vitals.map((v) => (
                    <tr key={v.id} className="border-b">
                      <td className="px-3 py-2 text-xs text-slate-500">{v.createdAt.toLocaleTimeString('es-DO', { timeZone: 'America/Santo_Domingo' })}</td>
                      <td className={`px-3 py-2 font-medium ${esAnormal('sys', v.systolic) ? 'text-red-600 bg-red-50' : 'text-slate-800'}`}>
                        {v.systolic}/{v.diastolic}
                      </td>
                      <td className={`px-3 py-2 font-medium ${esAnormal('fc', v.heartRate) ? 'text-red-600 bg-red-50' : 'text-slate-800'}`}>{v.heartRate}</td>
                      <td className={`px-3 py-2 font-medium ${esAnormal('temp', v.temperature) ? 'text-red-600 bg-red-50' : 'text-slate-800'}`}>{v.temperature}</td>
                      <td className={`px-3 py-2 font-medium ${esAnormal('spo2', v.oxygenSat) ? 'text-red-600 bg-red-50' : 'text-slate-800'}`}>{v.oxygenSat}</td>
                    </tr>
                  ))}
                  {episode.vitals.length === 0 && (
                    <tr><td colSpan={5} className="text-center py-4 text-slate-400">No hay signos vitales registrados.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Notas SOAP: solo el médico a cargo */}
            {permisos.puedeEditar && (
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h2 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4">Nueva Nota de Evolución (SOAP)</h2>
                <form action={guardarNota} className="space-y-4">
                  <input type="hidden" name="episodeId" value={episode.id} />
                  <textarea name="subjective" rows={2} required className="w-full px-3 py-2 border rounded-lg text-sm text-slate-900" placeholder="S (Subjetivo): Lo que refiere el paciente..."></textarea>
                  <textarea name="objective" rows={2} required className="w-full px-3 py-2 border rounded-lg text-sm text-slate-900" placeholder="O (Objetivo): Signos vitales, hallazgos..."></textarea>
                  <textarea name="assessment" rows={2} required className="w-full px-3 py-2 border rounded-lg text-sm text-slate-900" placeholder="A (Análisis): Impresión diagnóstica..."></textarea>
                  <textarea name="plan" rows={2} required className="w-full px-3 py-2 border rounded-lg text-sm text-slate-900" placeholder="P (Plan): Tratamiento, indicaciones..."></textarea>
                  <button type="submit" className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors">Firmar y Guardar Nota</button>
                </form>
              </div>
            )}

            {/* Historial de Notas */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-800">Historial de Notas</h2>
              {episode.notes.length === 0 && <p className="text-slate-500 text-sm">No hay notas registradas.</p>}
              {episode.notes.map((nota) => (
                <div key={nota.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                  <div className="flex justify-between items-center border-b pb-2 mb-3">
                    <p className="text-sm font-bold text-blue-700">Firmado por: {nombres[nota.createdBy] ?? nota.createdBy}</p>
                    <p className="text-xs text-slate-500">{nota.createdAt.toLocaleString('es-DO', { timeZone: 'America/Santo_Domingo' })}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-700">
                    <div><span className="font-bold text-slate-900">S:</span> {nota.subjective}</div>
                    <div><span className="font-bold text-slate-900">O:</span> {nota.objective}</div>
                    <div><span className="font-bold text-slate-900">A:</span> {nota.assessment}</div>
                    <div><span className="font-bold text-slate-900">P:</span> {nota.plan}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}