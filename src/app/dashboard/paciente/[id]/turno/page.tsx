import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { guardarEntregaTurno, aceptarEntregaTurno } from '../actions-turno'
import { PrintButton } from '@/components/PrintButton'
import { calcularPermisos } from '@/lib/permisos'

const fmt = (d: Date) => d.toLocaleString('es-DO', { timeZone: 'America/Santo_Domingo' })

export default async function EntregaTurnoPage({
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
      notes: { orderBy: { createdAt: 'desc' }, take: 3 },
      vitals: { orderBy: { createdAt: 'desc' }, take: 1 },
      tasks: { orderBy: { createdAt: 'asc' } },
      handoffs: { orderBy: { createdAt: 'desc' }, take: 20 },
    },
  })

  if (!episode) return <div className="p-8 text-center text-slate-800">Expediente no encontrado.</div>

  const permisos = calcularPermisos(role, userId, episode)
  const pendiente = episode.handoffs.find((h) => h.status === 'PENDIENTE')
  const soyReceptor = !!pendiente && pendiente.recibidoPor.toLowerCase() === miEmail

  // Nombres completos en lugar de correos
  const emails = new Set<string>()
  episode.handoffs.forEach((h) => {
    emails.add(h.entregadoPor)
    emails.add(h.recibidoPor)
  })
  episode.tasks.forEach((t) => {
    if (t.doneBy) emails.add(t.doneBy)
  })
  const usuarios = await prisma.user.findMany({
    where: { email: { in: Array.from(emails) } },
    select: { email: true, fullName: true },
  })
  const nombres: Record<string, string> = Object.fromEntries(usuarios.map((u) => [u.email, u.fullName]))
  const nombreDe = (email: string) => nombres[email] ?? email

  // Médicos disponibles para recibir (solo si yo puedo entregar)
  const puedeEntregar = permisos.puedeEditar && !pendiente
  const doctores = puedeEntregar
    ? await prisma.user.findMany({
        where: { isActive: true, role: { in: ['DOCTOR', 'RESIDENT'] }, id: { not: userId } },
        select: { id: true, fullName: true, email: true },
        orderBy: { fullName: 'asc' },
      })
    : []

   const ahora = new Date().getTime()
  const pendientes = episode.tasks
    .filter((t) => t.status === 'pendiente')
    .sort((a, b) => (a.dueAt?.getTime() ?? Number.MAX_SAFE_INTEGER) - (b.dueAt?.getTime() ?? Number.MAX_SAFE_INTEGER))
  const hechas = episode.tasks.filter((t) => t.status === 'hecha')

  const ultimosVitales = episode.vitals[0]
  const ultimaNota = episode.notes[0]

  return (
    <div className="min-h-screen bg-white p-8 max-w-4xl mx-auto print:p-0">
      {/* Cabecera para imprimir */}
      <div className="hidden print:block border-b-2 border-black pb-4 mb-6">
        <h1 className="text-2xl font-bold text-center">HOSPITAL GENERAL</h1>
        <p className="text-center text-sm">Reporte de Entrega de Turno - SBAR</p>
        <p className="text-center text-xs mt-1">Impreso el: {fmt(new Date())}</p>
      </div>

      {/* Navegación (oculta al imprimir) */}
      <div className="flex justify-between items-center mb-6 print:hidden">
        <Link href={`/dashboard/paciente/${episode.id}`} className="text-sm text-blue-600 hover:underline">
          ← Volver al Expediente
        </Link>
        <PrintButton />
      </div>

      {error && (
        <div className="bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded-lg mb-4 print:hidden">
          ⚠️ {error}
        </div>
      )}

      <div className="border border-slate-300 rounded-xl p-6 print:border-none print:p-0">
        {/* Datos del Paciente */}
        <div className="flex justify-between border-b pb-4 mb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{episode.patient.firstName} {episode.patient.lastName}</h2>
            <p className="text-sm text-slate-600">Exp: {episode.patient.expedienteNumber} • {episode.patient.age} años • {episode.patient.sex}</p>
            <p className="text-sm text-slate-600 mt-1"><strong>A cargo ahora:</strong> {episode.responsible?.fullName ?? 'Sin asignar'}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-blue-800">Hab. {episode.room} - Cama {episode.bed}</p>
            <p className="text-sm text-slate-600">
              Ingreso: {episode.admissionDate.toLocaleDateString('es-DO', { timeZone: 'America/Santo_Domingo' })}
            </p>
          </div>
        </div>

        {/* Alergias */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-red-600 uppercase mb-1">Alergias</h3>
          <div className="flex gap-2 flex-wrap">
            {episode.allergies.map((a) => (
              <span key={a.id} className="border border-red-300 bg-red-50 text-red-700 px-2 py-1 rounded text-sm font-medium">
                {a.allergen} ({a.severity})
              </span>
            ))}
          </div>
        </div>

        {/* S - B - A - R */}
        <div className="space-y-4 text-slate-800 text-sm">
          <div>
            <h3 className="font-bold text-slate-900 border-b">S (Situación Actual)</h3>
            <p className="mt-1"><strong>Motivo de ingreso:</strong> {episode.chiefComplaint}</p>
            <p><strong>Médico Tratante:</strong> {episode.attendingDoctor}</p>
            {ultimosVitales && (
              <p className="mt-2 bg-slate-50 p-2 rounded border">
                <strong>Últimos Signos Vitales:</strong> TA: {ultimosVitales.systolic}/{ultimosVitales.diastolic} • FC: {ultimosVitales.heartRate} • Temp: {ultimosVitales.temperature}°C • SpO2: {ultimosVitales.oxygenSat}%
              </p>
            )}
          </div>

          <div>
            <h3 className="font-bold text-slate-900 border-b">B (Antecedentes / Evolución)</h3>
            {ultimaNota ? (
              <div className="mt-1">
                <p><strong>Última Nota (S):</strong> {ultimaNota.subjective}</p>
                <p><strong>Última Nota (A):</strong> {ultimaNota.assessment}</p>
              </div>
            ) : <p className="text-slate-500 italic mt-1">No hay notas previas.</p>}
          </div>

          <div>
            <h3 className="font-bold text-slate-900 border-b">A (Análisis / Diagnóstico)</h3>
            <p className="mt-1">{ultimaNota ? ultimaNota.assessment : 'Pendiente de evaluación.'}</p>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 border-b">R (Recomendaciones / Plan)</h3>
            <p className="mt-1">{ultimaNota ? ultimaNota.plan : 'Pendiente de indicaciones.'}</p>
          </div>

          {/* Checklist de pendientes */}
          <div>
            <h3 className="font-bold text-slate-900 border-b">☑ Pendientes por hacer ({pendientes.length})</h3>
            {pendientes.length === 0 ? (
              <p className="mt-1 text-slate-500 italic">No hay tareas pendientes.</p>
            ) : (
              <ul className="mt-1 space-y-1">
                {pendientes.map((t) => {
                  const vencida = t.dueAt !== null && t.dueAt.getTime() < ahora
                  return (
                    <li key={t.id} className="flex items-start gap-2">
                      <span>☐</span>
                      <span>
                        {t.title}
                        {t.dueAt && (
                          <span className={vencida ? 'text-red-600 font-bold' : 'text-slate-500'}>
                            {' '}— {fmt(t.dueAt)}{vencida && ' (VENCIDA)'}
                          </span>
                        )}
                      </span>
                    </li>
                  )
                })}
              </ul>
            )}
            {hechas.length > 0 && (
              <div className="mt-3">
                <p className="font-semibold text-slate-700">Ya realizadas ({hechas.length})</p>
                <ul className="mt-1 space-y-1 text-slate-600">
                  {hechas.map((t) => (
                    <li key={t.id} className="flex items-start gap-2">
                      <span>✓</span>
                      <span>
                        {t.title}
                        {t.doneAt && (
                          <span className="text-slate-500"> — {nombreDe(t.doneBy ?? '')} · {fmt(t.doneAt)}</span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Entrega de turno (oculta al imprimir) */}
        <div className="mt-8 pt-6 border-t-2 border-dashed print:hidden">
          <h3 className="text-lg font-bold text-slate-800 mb-3">Entrega de Turno</h3>

          {!permisos.activo ? (
            <p className="bg-slate-100 border rounded-lg p-4 text-sm text-slate-700">
              🔒 El expediente está cerrado. No se pueden hacer entregas de turno.
            </p>
          ) : pendiente ? (
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 space-y-3">
              <p className="text-sm text-indigo-900">
                📋 <strong>Entrega pendiente:</strong> {nombreDe(pendiente.entregadoPor)} entregó este paciente a{' '}
                <strong>{nombreDe(pendiente.recibidoPor)}</strong> el {fmt(pendiente.createdAt)}.
              </p>
              {pendiente.observaciones && (
                <p className="text-sm text-indigo-900"><strong>Observaciones:</strong> {pendiente.observaciones}</p>
              )}
              <p className="text-sm text-indigo-900">
                Hasta que acepte, sigue a cargo <strong>{episode.responsible?.fullName ?? 'nadie'}</strong>.
              </p>
              {soyReceptor ? (
                <form action={aceptarEntregaTurno}>
                  <input type="hidden" name="handoffId" value={pendiente.id} />
                  <button className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium text-sm hover:bg-emerald-700">
                    ✅ Aceptar entrega y asumir al paciente
                  </button>
                  <p className="text-xs text-slate-500 mt-2">
                    Al aceptar, tú quedas a cargo y podrás editar. Quien entregó pasará a solo lectura.
                  </p>
                </form>
              ) : (
                <p className="text-xs text-slate-500">Solo {nombreDe(pendiente.recibidoPor)} puede aceptar esta entrega.</p>
              )}
            </div>
          ) : puedeEntregar ? (
            <form action={guardarEntregaTurno} className="space-y-4 bg-slate-50 p-4 rounded-lg border">
              <input type="hidden" name="episodeId" value={episode.id} />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Entregado por:</label>
                <input disabled value={session.user.name || ''} className="w-full px-3 py-2 border rounded-lg bg-slate-200 text-slate-600" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Recibido por (médico que recibe):</label>
                <select name="recibidoPor" required className="w-full px-3 py-2 border rounded-lg text-slate-900 bg-white">
                  <option value="">Seleccione un médico...</option>
                  {doctores.map((doc) => (
                    <option key={doc.id} value={doc.email}>{doc.fullName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Observaciones adicionales (opcional):</label>
                <textarea name="observaciones" rows={2} className="w-full px-3 py-2 border rounded-lg text-slate-900" placeholder="Ej. Paciente estable, pendiente de laboratorio."></textarea>
              </div>
              <p className="text-xs text-slate-500">
                El paciente seguirá a tu cargo hasta que el médico seleccionado acepte la entrega.
              </p>
              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium text-sm hover:bg-blue-700">
                Entregar paciente
              </button>
            </form>
          ) : (
            <p className="bg-slate-100 border rounded-lg p-4 text-sm text-slate-700">
              {permisos.sinResponsable
                ? 'Este paciente no tiene médico a cargo. Un médico debe presionar "Tomar a cargo" en el expediente antes de poder entregarlo.'
                : `Solo el médico a cargo (${episode.responsible?.fullName}) puede entregar este paciente.`}
            </p>
          )}
        </div>

        {/* Historial de entregas */}
        {episode.handoffs.length > 0 && (
          <div className="mt-6 pt-6 print:hidden">
            <h4 className="font-bold text-slate-700 mb-2 text-sm">Historial de Turnos:</h4>
            <ul className="text-xs text-slate-600 space-y-1">
              {episode.handoffs.map((h) => (
                <li key={h.id}>
                  <strong>{fmt(h.createdAt)}:</strong> {nombreDe(h.entregadoPor)} → {nombreDe(h.recibidoPor)}{' '}
                  {h.status === 'ACEPTADO' ? (
                    <span className="text-emerald-700 font-semibold">
                      ✓ Aceptado{h.aceptadoAt ? ` el ${fmt(h.aceptadoAt)}` : ''}
                    </span>
                  ) : (
                    <span className="text-amber-700 font-semibold">⏳ Pendiente de aceptar</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}