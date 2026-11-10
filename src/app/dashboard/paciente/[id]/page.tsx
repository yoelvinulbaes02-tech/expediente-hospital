import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { BannerAlergias } from '@/components/BannerAlergias'
import { ChecklistTareas } from '@/components/ChecklistTareas'
import Link from 'next/link'
import { agregarAlergia, marcarSinAlergias } from './actions'
import { guardarNota } from './actions-notas'
import { guardarSignosVitales } from './actions-vitales'
import { tomarACargo, reasignarResponsable } from './actions-responsable'
import {
  cambiarUbicacion,
  modificarDatosPaciente,
  modificarDiagnosticos,
} from './actions-clinicas'
import { GraficasSignos, type RegistroVital } from '@/components/GraficasSignos'
import { calcularPermisos } from '@/lib/permisos'

// Componentes clínicos
import { NotasImportantes } from '@/components/NotasImportantes'
import { BloqueNefrologico } from '@/components/BloqueNefrologico'
import { SeccionAntecedentes } from '@/components/SeccionAntecedentes'
import { ReportesLaboratorio } from '@/components/ReportesLaboratorio'
import { ReportesEstudios } from '@/components/ReportesEstudios'
import { FormularioNotaEvolucion } from '@/components/FormularioNotaEvolucion'

const ETIQUETA_ROL: Record<string, string> = {
  ADMIN: 'Administrador',
  DOCTOR: 'Médico',
  RESIDENT: 'Residente',
  NURSE: 'Enfermería',
  LAB: 'Laboratorio',
  READONLY: 'Solo lectura',
}

const fechaCorta = (d: Date) =>
  d.toLocaleString('es-DO', {
    timeZone: 'America/Santo_Domingo',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })

const fechaHoraCompleta = (d: Date) => {
  const f = new Date(d)
  return f.toLocaleString('es-DO', {
    timeZone: 'America/Santo_Domingo',
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

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
    select: {
      id: true,
      serviceType: true,
      consultingDepartment: true,
      consultingResident: true,
      hospitalAdmissionDate: true,
      status: true,
      responsibleId: true,
      admissionDate: true,
      admissionType: true,
      attendingDoctor: true,
      admittingDoctor: true,
      primaryDiagnosis: true,
      secondaryDiagnoses: true,
      chiefComplaint: true,
      initialWeight: true,
      initialWeightUnit: true,
      room: true,
      bed: true,
      patient: {
        include: {
          medicalHistory: true,
        },
      },
      allergies: true,
      responsible: { select: { fullName: true } },
      notes: { orderBy: { createdAt: 'desc' } },
      vitals: { orderBy: { createdAt: 'desc' }, take: 20 },
      tasks: { orderBy: { createdAt: 'asc' } },
      handoffs: { where: { status: 'PENDIENTE' }, take: 1 },
      importantAlerts: { orderBy: { createdAt: 'desc' } },
      gfrRecords: { orderBy: { createdAt: 'desc' } },
      labReports: { orderBy: { createdAt: 'desc' } },
      studyReports: { orderBy: { createdAt: 'desc' } },
      viralSerologies: { orderBy: { updatedAt: 'desc' }, take: 1 },
      vascularAccesses: { where: { isActive: true }, take: 1 },
    },
  })

  if (!episode) return <div className="p-8 text-center text-slate-800">Expediente no encontrado.</div>

  const permisos = calcularPermisos(role, userId, episode)
  const esSoloLectura = !permisos.activo
  const entregaPendiente = episode.handoffs[0]
  const esInterconsulta = episode.serviceType === 'interconsulta'

  // Cálculo de estancia
  const diffTiempo = new Date().getTime() - new Date(episode.admissionDate).getTime()
  const diasEstancia = Math.max(1, Math.floor(diffTiempo / (1000 * 60 * 60 * 24)) + 1)

  // Recolectar emails de firmas
  const emails = new Set<string>()
  episode.notes.forEach((n) => emails.add(n.createdBy))
  episode.vitals.forEach((v) => emails.add(v.recordedBy))
  episode.importantAlerts.forEach((a) => emails.add(a.createdBy))
  episode.labReports.forEach((l) => emails.add(l.createdBy))
  episode.studyReports.forEach((s) => emails.add(s.createdBy))
  episode.tasks.forEach((t) => {
    emails.add(t.createdBy)
    if (t.doneBy) emails.add(t.doneBy)
  })
  if (episode.patient.medicalHistory?.updatedBy) {
    emails.add(episode.patient.medicalHistory.updatedBy)
  }
  if (episode.patient.bloodTypeRecordedBy) {
    emails.add(episode.patient.bloodTypeRecordedBy)
  }
  episode.vascularAccesses.forEach((va) => emails.add(va.createdBy))
  episode.viralSerologies.forEach((vs) => emails.add(vs.recordedBy))
  episode.gfrRecords.forEach((gfr) => emails.add(gfr.recordedBy))

  if (entregaPendiente) {
    emails.add(entregaPendiente.entregadoPor)
    emails.add(entregaPendiente.recibidoPor)
  }

  const usuarios = await prisma.user.findMany({
    where: { email: { in: Array.from(emails) } },
    select: { email: true, fullName: true, role: true },
  })
  const nombres: Record<string, string> = Object.fromEntries(usuarios.map((u) => [u.email, u.fullName]))
  const roles: Record<string, string> = Object.fromEntries(usuarios.map((u) => [u.email, u.role]))

  const medicos =
    role === 'ADMIN' && permisos.activo
      ? await prisma.user.findMany({
          where: { isActive: true, role: { in: ['DOCTOR', 'RESIDENT'] } },
          select: { id: true, fullName: true },
          orderBy: { fullName: 'asc' },
        })
      : []

  const esAnormal = (tipo: string, valor: number | null) => {
    if (!valor) return false
    if (tipo === 'temp') return valor < 36.0 || valor > 37.5
    if (tipo === 'fc') return valor < 60 || valor > 100
    if (tipo === 'sys') return valor < 90 || valor > 140
    if (tipo === 'dia') return valor < 60 || valor > 90
    if (tipo === 'spo2') return valor < 95
    return false
  }

  const num = (x: unknown): number | null => (x === null || x === undefined ? null : Number(x))
  const registrosGrafica: RegistroVital[] = episode.vitals.map((v) => ({
    fecha: v.createdAt.toISOString(),
    systolic: num(v.systolic),
    diastolic: num(v.diastolic),
    heartRate: num(v.heartRate),
    respiratoryRate: num(v.respiratoryRate),
    temperature: num(v.temperature),
    oxygenSat: num(v.oxygenSat),
    glucose: num(v.glucose),
    weight: num(v.weight),
    diuresis: num(v.diuresis),
  }))

  const entradaVital =
    'w-full px-2 py-2 md:py-1 border rounded text-base md:text-sm text-slate-900'

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {error && (
          <div className="bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded-lg mb-4">
            ⚠️ {error}
          </div>
        )}

        {esSoloLectura && (
          <div className="bg-amber-100 border border-amber-300 text-amber-800 px-4 py-3 rounded-lg mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🔒</span>
              <strong>Expediente Cerrado:</strong> Este paciente ha sido dado de alta.
            </div>
            <Link href="/dashboard/archivo" className="text-sm font-bold underline hover:text-amber-900">Volver al Archivo</Link>
          </div>
        )}

        {/* CABECERA PRINCIPAL CON EDICIÓN DE NOMBRE Y DATOS */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          <div>
            <Link href="/dashboard" className="text-sm text-blue-600 hover:underline mb-2 inline-block font-medium">
              ← Volver a Shift Tracker
            </Link>

            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
                {episode.patient.firstName} {episode.patient.lastName}
              </h1>

              {/* BOTÓN: MODIFICAR DATOS DEL PACIENTE */}
              {permisos.puedeRegistrar && (
                <details className="relative inline-block">
                  <summary className="list-none cursor-pointer text-xs bg-white text-slate-600 px-2.5 py-1 rounded-lg border border-slate-300 hover:bg-slate-50 font-medium">
                    ✏️ Modificar datos
                  </summary>
                  <div className="absolute left-0 mt-2 w-72 bg-white p-4 rounded-xl border border-slate-300 shadow-xl z-30 text-left">
                    <p className="text-xs font-bold text-slate-800 mb-2 border-b pb-1">
                      Modificar Nombre y Datos:
                    </p>
                    <form action={modificarDatosPaciente} className="space-y-2">
                      <input type="hidden" name="episodeId" value={episode.id} />
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500">Nombres:</label>
                        <input name="firstName" defaultValue={episode.patient.firstName} required className="w-full px-2 py-1 border rounded text-xs text-slate-900" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-500">Apellidos:</label>
                        <input name="lastName" defaultValue={episode.patient.lastName} required className="w-full px-2 py-1 border rounded text-xs text-slate-900" />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-500">Edad:</label>
                          <input name="age" type="number" defaultValue={episode.patient.age ?? ''} className="w-full px-2 py-1 border rounded text-xs text-slate-900" />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-500">Sexo:</label>
                          <select name="sex" defaultValue={episode.patient.sex} className="w-full px-2 py-1 border rounded text-xs bg-white text-slate-900">
                            <option value="Masculino">Masculino</option>
                            <option value="Femenino">Femenino</option>
                          </select>
                        </div>
                      </div>
                      <button type="submit" className="w-full bg-slate-800 text-white text-xs py-1.5 rounded-lg font-bold hover:bg-slate-900 mt-1">
                        Guardar Corrección
                      </button>
                    </form>
                  </div>
                </details>
              )}

              {esInterconsulta && (
                <span className="bg-purple-100 text-purple-900 border border-purple-300 text-xs font-bold px-2.5 py-1 rounded-lg">
                  📋 Interconsulta ({episode.consultingDepartment})
                </span>
              )}
            </div>

            <p className="text-slate-500 text-sm mt-0.5">
              Exp: <strong>{episode.patient.expedienteNumber}</strong> • {episode.patient.age} años • {episode.patient.sex}
            </p>

            <div className="mt-2 inline-flex flex-wrap items-center gap-2 bg-slate-200/70 border border-slate-300 px-3 py-1 rounded-lg text-xs text-slate-800">
              <span>
                📅 <strong>{esInterconsulta ? 'Interconsulta:' : 'Ingreso a Sala:'}</strong> {fechaHoraCompleta(episode.admissionDate)}
              </span>
              <span className="font-bold text-blue-700 bg-white px-2 py-0.5 rounded shadow-2xs">
                Día {diasEstancia} de {esInterconsulta ? 'interconsulta' : 'internamiento'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {!esSoloLectura && (
              <Link href={`/dashboard/paciente/${episode.id}/turno`} className="bg-indigo-600 text-white px-3.5 py-2 rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm">
                📋 Entrega de Turno
              </Link>
            )}
            {permisos.puedeEditar && (
              <Link href={`/dashboard/paciente/${episode.id}/alta`} className="bg-red-600 text-white px-3.5 py-2 rounded-lg text-xs font-bold hover:bg-red-700 transition-colors shadow-sm">
                🚪 Dar de Alta
              </Link>
            )}

            {/* UBICACIÓN */}
            <div className="relative">
              <div className="bg-blue-100 text-blue-900 px-3.5 py-1.5 rounded-lg font-bold border border-blue-200 text-sm md:text-base flex items-center gap-2">
                <span>{esInterconsulta ? `${episode.room} - Cama ${episode.bed}` : `Hab. ${episode.room} - Cama ${episode.bed}`}</span>
                {permisos.puedeRegistrar && (
                  <details className="inline-block relative">
                    <summary className="list-none cursor-pointer text-xs bg-white text-blue-700 px-2 py-0.5 rounded border border-blue-300 hover:bg-blue-50 font-normal">
                      ✏️ Cambiar
                    </summary>
                    <div className="absolute right-0 mt-2 w-64 bg-white p-3 rounded-xl border border-slate-300 shadow-xl z-30 text-left">
                      <p className="text-xs font-bold text-slate-700 mb-2">Reubicar cama / servicio:</p>
                      <form action={cambiarUbicacion} className="space-y-2">
                        <input type="hidden" name="episodeId" value={episode.id} />
                        <div>
                          <label className="block text-[11px] text-slate-500">Habitación / Sala:</label>
                          <input name="room" defaultValue={episode.room ?? ''} required className="w-full px-2 py-1 border rounded text-xs text-slate-900" />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-500">Cama:</label>
                          <input name="bed" defaultValue={episode.bed ?? ''} required className="w-full px-2 py-1 border rounded text-xs text-slate-900" />
                        </div>
                        <button type="submit" className="w-full bg-blue-600 text-white text-xs py-1.5 rounded font-bold hover:bg-blue-700">
                          Guardar Reubicación
                        </button>
                      </form>
                    </div>
                  </details>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* RECUADRO FIJO DE DIAGNÓSTICOS CON BOTÓN MODIFICAR */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {esInterconsulta ? 'Motivo y Diagnóstico de Interconsulta' : 'Diagnósticos del Paciente'}
              </span>

              {/* BOTÓN: MODIFICAR DIAGNÓSTICOS */}
              {permisos.puedeRegistrar && (
                <details className="inline-block relative">
                  <summary className="list-none cursor-pointer text-[11px] text-blue-600 hover:text-blue-800 font-semibold underline">
                    ✏️ Modificar diagnósticos
                  </summary>
                  <div className="absolute left-0 mt-2 w-80 bg-white p-4 rounded-xl border border-slate-300 shadow-xl z-30 text-left">
                    <p className="text-xs font-bold text-slate-800 mb-2">Actualizar diagnósticos:</p>
                    <form action={modificarDiagnosticos} className="space-y-2">
                      <input type="hidden" name="episodeId" value={episode.id} />
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600">Diagnóstico Principal *</label>
                        <input
                          name="primaryDiagnosis"
                          defaultValue={episode.primaryDiagnosis ?? ''}
                          required
                          className="w-full px-2.5 py-1.5 border rounded-lg text-xs text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600">Diagnósticos Secundarios:</label>
                        <textarea
                          name="secondaryDiagnoses"
                          rows={2}
                          defaultValue={episode.secondaryDiagnoses ?? ''}
                          className="w-full px-2.5 py-1.5 border rounded-lg text-xs text-slate-900"
                        />
                      </div>
                      <button type="submit" className="w-full bg-blue-600 text-white text-xs py-1.5 rounded-lg font-bold hover:bg-blue-700">
                        Guardar Diagnósticos
                      </button>
                    </form>
                  </div>
                </details>
              )}
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              {esInterconsulta ? (
                <>
                  <span className="bg-purple-100 text-purple-900 px-2.5 py-1 rounded-md font-bold">
                    Depto: {episode.consultingDepartment}
                  </span>
                  <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md font-medium">
                    Residente a cargo: {episode.consultingResident}
                  </span>
                </>
              ) : (
                <>
                  {episode.admittingDoctor && (
                    <span className="text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                      <strong>MA que ingresó:</strong> {episode.admittingDoctor}
                    </span>
                  )}
                  {episode.attendingDoctor && (
                    <span className="text-blue-800 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">
                      <strong>Médico tratante:</strong> {episode.attendingDoctor}
                    </span>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-blue-600 text-white text-xs uppercase px-2 py-0.5 rounded font-bold">Principal</span>
              <p className="text-base font-bold text-slate-800">
                {episode.primaryDiagnosis || episode.chiefComplaint || 'Sin diagnóstico registrado'}
              </p>
            </div>
            {episode.secondaryDiagnoses && (
              <p className="text-sm text-slate-600 pl-1">
                <strong>Secundarios:</strong> {episode.secondaryDiagnoses}
              </p>
            )}
          </div>
        </div>

        {/* 1. NOTAS IMPORTANTES */}
        <NotasImportantes
          episodeId={episode.id}
          alertas={episode.importantAlerts}
          nombres={nombres}
          puedeRegistrar={permisos.puedeRegistrar}
        />

        {/* 2. ACCESO VASCULAR, VIRALES, TIPIFICACIÓN Y TFG */}
        <BloqueNefrologico
          episodeId={episode.id}
          acceso={episode.vascularAccesses[0] ?? null}
          virales={episode.viralSerologies[0] ?? null}
          tfgActual={episode.gfrRecords[0] ?? null}
          tipificacion={{
            bloodType: episode.patient.bloodType,
            recordedBy: episode.patient.bloodTypeRecordedBy,
            updatedAt: episode.patient.bloodTypeUpdatedAt,
          }}
          nombres={nombres}
          roles={roles}
          puedeRegistrar={permisos.puedeRegistrar}
        />

        <BannerAlergias alergias={episode.allergies} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Columna Izquierda */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4">
                {esInterconsulta ? 'Datos de la Interconsulta' : 'Datos del Ingreso a Sala'}
              </h2>
              
              <div className="space-y-2 text-sm text-slate-700">
                <p>
                  <strong>{esInterconsulta ? 'Fecha de Solicitud:' : 'Fecha y Hora de Ingreso:'}</strong>
                  <span className="block text-xs font-semibold text-blue-800 mt-0.5">
                    {fechaHoraCompleta(episode.admissionDate)}
                  </span>
                </p>
                <p>
                  <strong>Tiempo de Estancia:</strong>{' '}
                  <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                    Día {diasEstancia} de {esInterconsulta ? 'interconsulta' : 'internamiento'}
                  </span>
                </p>

                {episode.initialWeight && (
                  <p>
                    <strong>Peso inicial al ingreso:</strong>{' '}
                    <span className="font-bold text-emerald-800">
                      {episode.initialWeight} {episode.initialWeightUnit ?? 'kg'}
                    </span>
                  </p>
                )}

                {esInterconsulta ? (
                  <>
                    <p><strong>Servicio solicitante:</strong> {episode.consultingDepartment}</p>
                    <p><strong>Residente interconsultado:</strong> {episode.consultingResident}</p>
                    <p><strong>Motivo:</strong> {episode.chiefComplaint}</p>
                  </>
                ) : (
                  <>
                    <p><strong>Forma de ingreso:</strong> {episode.admissionType}</p>
                    <p><strong>Motivo:</strong> {episode.chiefComplaint}</p>
                    <p><strong>MA que ingresó:</strong> {episode.admittingDoctor ?? 'No especificado'}</p>
                    <p><strong>Médico tratante:</strong> {episode.attendingDoctor}</p>
                    <p><strong>A cargo ahora:</strong> {episode.responsible?.fullName ?? 'Sin asignar'}</p>
                  </>
                )}
              </div>
            </div>

            {/* 3. ANTECEDENTES */}
            <SeccionAntecedentes
              episodeId={episode.id}
              antecedentes={episode.patient.medicalHistory}
              nombres={nombres}
              roles={roles}
              puedeRegistrar={permisos.puedeRegistrar}
            />

            {/* SIGNOS VITALES */}
            {permisos.puedeRegistrar && (
              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                <h2 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4">Registrar Signos Vitales</h2>
                <form action={guardarSignosVitales} className="space-y-3">
                  <input type="hidden" name="episodeId" value={episode.id} />
                  <div className="grid grid-cols-2 gap-3 md:gap-2">
                    <div className="col-span-2">
                      <label className="block text-xs font-medium text-slate-700 mb-1">Presión (Sist/Diast)</label>
                      <div className="flex gap-2 md:gap-1">
                        <input name="systolic" type="number" inputMode="numeric" placeholder="120" className={entradaVital} />
                        <input name="diastolic" type="number" inputMode="numeric" placeholder="80" className={entradaVital} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">F. Cardíaca</label>
                      <input name="heartRate" type="number" inputMode="numeric" placeholder="75" className={entradaVital} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">F. Resp.</label>
                      <input name="respiratoryRate" type="number" inputMode="numeric" placeholder="16" className={entradaVital} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Temp (°C)</label>
                      <input name="temperature" type="number" inputMode="decimal" step="0.1" placeholder="36.5" className={entradaVital} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">SpO2 (%)</label>
                      <input name="oxygenSat" type="number" inputMode="numeric" placeholder="98" className={entradaVital} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Glucosa (mg/dL)</label>
                      <input name="glucose" type="number" inputMode="numeric" placeholder="100" className={entradaVital} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-emerald-800 mb-1">Peso (kg)</label>
                      <input name="weight" type="number" inputMode="decimal" step="0.1" placeholder="70.5" className={entradaVital} />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-sky-800 mb-1">Diuresis (mL)</label>
                      <input name="diuresis" type="number" inputMode="numeric" placeholder="Ej. 600" className={entradaVital} />
                    </div>
                  </div>
                  <button type="submit" className="w-full bg-emerald-600 text-white px-4 py-3 md:py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors mt-2">Guardar Signos</button>
                </form>
              </div>
            )}

            {/* Alergias */}
            {permisos.puedeRegistrar && (
              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 space-y-4">
                <h2 className="text-lg font-bold text-slate-800 border-b pb-2">Gestión de Alergias</h2>
                
                <form action={marcarSinAlergias}>
                  <input type="hidden" name="episodeId" value={episode.id} />
                  <button type="submit" className="w-full bg-emerald-50 text-emerald-800 border border-emerald-300 px-3 py-2 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-colors">
                    ✅ Marcar: Paciente Niega Alergias
                  </button>
                </form>

                <form action={agregarAlergia} className="space-y-3 pt-2 border-t">
                  <p className="text-xs font-bold text-slate-700">O registrar alergia conocida:</p>
                  <input type="hidden" name="episodeId" value={episode.id} />
                  <input name="allergen" required className="w-full px-3 py-2 border rounded-lg text-base md:text-sm text-slate-900" placeholder="Alérgeno (Ej. Penicilina, AINEs...)" />
                  <input name="reaction" className="w-full px-3 py-2 border rounded-lg text-base md:text-sm text-slate-900" placeholder="Reacción (opcional, ej. Edema, rash)" />
                  <button type="submit" className="w-full bg-red-600 text-white px-4 py-3 md:py-2 rounded-lg text-sm font-medium hover:bg-red-700">Guardar Alergia</button>
                </form>
              </div>
            )}
          </div>

          {/* Columna Derecha */}
          <div className="lg:col-span-2 space-y-6">
            <ChecklistTareas
              episodeId={episode.id}
              tareas={episode.tasks}
              nombres={nombres}
              puedeMarcar={permisos.puedeMarcarTareas}
              puedeEditar={permisos.puedeEditar}
              puedeAgregar={permisos.puedeRegistrar}
            />

            {/* 4. REPORTES DE LABORATORIO */}
            <ReportesLaboratorio
              episodeId={episode.id}
              reportes={episode.labReports}
              nombres={nombres}
              roles={roles}
              puedeRegistrar={permisos.puedeRegistrar}
            />

            {/* 5. REPORTES DE ESTUDIOS */}
            <ReportesEstudios
              episodeId={episode.id}
              estudios={episode.studyReports}
              nombres={nombres}
              puedeRegistrar={permisos.puedeRegistrar}
            />

            {/* Tendencia */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4">
                {esInterconsulta ? 'Control y Tendencia de Diuresis' : 'Tendencia de Signos Vitales, Peso y Diuresis'}
              </h2>
              <GraficasSignos registros={registrosGrafica} />
            </div>

            {/* Tabla de Signos */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
              <h2 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4">Últimos Signos Vitales</h2>
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-100 text-slate-600">
                  <tr>
                    <th className="px-3 py-2 whitespace-nowrap">Fecha / Hora</th>
                    <th className="px-3 py-2">TA</th>
                    <th className="px-3 py-2">FC</th>
                    <th className="px-3 py-2">Temp</th>
                    <th className="px-3 py-2">SpO2</th>
                    <th className="px-3 py-2">Peso</th>
                    <th className="px-3 py-2">Diuresis</th>
                    <th className="px-3 py-2">Registró</th>
                  </tr>
                </thead>
                <tbody>
                  {episode.vitals.map((v) => (
                    <tr key={v.id} className="border-b">
                      <td className="px-3 py-2 text-xs text-slate-500 whitespace-nowrap">{fechaCorta(v.createdAt)}</td>
                      <td className={`px-3 py-2 font-medium ${esAnormal('sys', v.systolic) ? 'text-red-600 bg-red-50' : 'text-slate-800'}`}>
                        {v.systolic ? `${v.systolic}/${v.diastolic}` : '—'}
                      </td>
                      <td className="px-3 py-2 text-slate-800">{v.heartRate ?? '—'}</td>
                      <td className="px-3 py-2 text-slate-800">{v.temperature ?? '—'}</td>
                      <td className="px-3 py-2 text-slate-800">{v.oxygenSat ?? '—'}</td>
                      <td className="px-3 py-2 font-bold text-emerald-700">{v.weight ? `${v.weight} kg` : '—'}</td>
                      <td className="px-3 py-2 font-bold text-sky-800">{v.diuresis ? `${v.diuresis} mL` : '—'}</td>
                      <td className="px-3 py-2 text-xs text-slate-500 whitespace-nowrap">{nombres[v.recordedBy] ?? v.recordedBy}</td>
                    </tr>
                  ))}
                  {episode.vitals.length === 0 && (
                    <tr><td colSpan={8} className="text-center py-4 text-slate-400">No hay signos vitales registrados.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* 6. EVOLUCIÓN */}
            {permisos.puedeRegistrar && (
              <FormularioNotaEvolucion episodeId={episode.id} action={guardarNota} />
            )}

            {/* Historial de Notas */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-800">Historial de Evoluciones</h2>
              {episode.notes.length === 0 && <p className="text-slate-500 text-sm">No hay evoluciones registradas.</p>}
              {episode.notes.map((nota) => (
                <div key={nota.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
                  <div className="flex flex-wrap justify-between items-center gap-2 border-b pb-2 mb-3">
                    <p className="text-sm font-bold text-blue-700">
                      Firmado por: {nombres[nota.createdBy] ?? nota.createdBy}
                      {roles[nota.createdBy] && (
                        <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-bold">
                          {ETIQUETA_ROL[roles[nota.createdBy]] ?? roles[nota.createdBy]}
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-slate-500">{nota.createdAt.toLocaleString('es-DO', { timeZone: 'America/Santo_Domingo' })}</p>
                  </div>
                  
                  {nota.content ? (
                    <p className="text-sm text-slate-800 whitespace-pre-line leading-relaxed">
                      {nota.content}
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-700">
                      <div><span className="font-bold text-slate-900">S:</span> {nota.subjective}</div>
                      <div><span className="font-bold text-slate-900">O:</span> {nota.objective}</div>
                      <div><span className="font-bold text-slate-900">A:</span> {nota.assessment}</div>
                      <div><span className="font-bold text-slate-900">P:</span> {nota.plan}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}