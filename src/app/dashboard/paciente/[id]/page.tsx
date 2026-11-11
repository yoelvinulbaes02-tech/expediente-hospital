import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { BannerAlergias } from '@/components/BannerAlergias'
import { ChecklistTareas } from '@/components/ChecklistTareas'
import Link from 'next/link'
import { agregarAlergia, marcarSinAlergias } from './actions'
import { guardarNota } from './actions-notas'
import { guardarSignosVitales, modificarSignosVitales } from './actions-vitales'
import {
  cambiarUbicacion,
  modificarDatosPaciente,
  modificarDiagnosticos,
  transferirAPropio,
  finalizarInterconsulta,
  transferirAInterconsulta,
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
import { BotonImprimirSignos } from '@/components/BotonImprimirSignos'
import { TratamientoActual } from '@/components/TratamientoActual'

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const role = String((session.user as any)?.role ?? 'READONLY')

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
      currentTreatment: true,
      treatmentUpdatedBy: true,
      treatmentUpdatedAt: true,
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
      vitals: { orderBy: { createdAt: 'desc' }, take: 30 },
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

  let diasHospital: number | null = null
  if (episode.hospitalAdmissionDate) {
    const diffHosp = new Date().getTime() - new Date(episode.hospitalAdmissionDate).getTime()
    diasHospital = Math.max(1, Math.floor(diffHosp / (1000 * 60 * 60 * 24)) + 1)
  }

  // Recolectar emails de firmas
  const emails = new Set<string>()
  episode.notes.forEach((n) => emails.add(n.createdBy))
  episode.vitals.forEach((v) => {
    emails.add(v.recordedBy)
    if (v.updatedBy) emails.add(v.updatedBy)
  })
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
  if (episode.treatmentUpdatedBy) {
    emails.add(episode.treatmentUpdatedBy)
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
          <div className="bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded-lg mb-4 print:hidden">
            ⚠️ {error}
          </div>
        )}

        {esSoloLectura && (
          <div className="bg-amber-100 border border-amber-300 text-amber-800 px-4 py-3 rounded-lg mb-6 flex items-center justify-between print:hidden">
            <div className="flex items-center gap-2">
              <span className="text-xl">🔒</span>
              <strong>Expediente Cerrado:</strong> {esInterconsulta ? 'Esta interconsulta ha sido finalizada y dada de alta.' : 'Este paciente ha sido dado de alta.'}
            </div>
            <Link href="/dashboard/archivo" className="text-sm font-bold underline hover:text-amber-900">Volver al Archivo</Link>
          </div>
        )}

        {/* CABECERA PRINCIPAL */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
          <div>
            <Link href="/dashboard" className="text-sm text-blue-600 hover:underline mb-2 inline-block font-medium print:hidden">
              ← Volver a NEXO
            </Link>

            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
                {episode.patient.firstName} {episode.patient.lastName}
              </h1>

              {/* MODIFICAR DATOS DEL PACIENTE */}
              {permisos.puedeRegistrar && (
                <details className="relative inline-block print:hidden">
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
                          <label className="block text-[11px] text-slate-500">Edad:</label>
                          <input name="age" type="number" defaultValue={episode.patient.age ?? ''} className="w-full px-2 py-1 border rounded text-xs text-slate-900" />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-500">Sexo:</label>
                          <select name="sex" defaultValue={episode.patient.sex} className="w-full px-2 py-1 border rounded text-xs bg-white text-slate-900">
                            <option value="Masculino">Masculino</option>
                            <option value="Femenino">Femenino</option>
                          </select>
                        </div>
                      </div>
                      <button type="submit" className="w-full bg-slate-800 text-white text-xs py-1.5 rounded-lg font-bold hover:bg-slate-900 mt-1 cursor-pointer">
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

          {/* ACCIONES SUPERIORES */}
          <div className="flex flex-wrap items-center gap-2 print:hidden">
            {!esSoloLectura && (
              <Link href={`/dashboard/paciente/${episode.id}/turno`} className="bg-indigo-600 text-white px-3.5 py-2 rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm">
                📋 Entrega de Turno
              </Link>
            )}

            {/* BOTÓN ALTA O FINALIZAR INTERCONSULTA */}
            {!esSoloLectura && (
              esInterconsulta ? (
                permisos.puedeDarAlta && (
                  <details className="relative">
                    <summary className="list-none cursor-pointer bg-red-600 text-white px-3.5 py-2 rounded-lg text-xs font-bold hover:bg-red-700 transition-colors shadow-sm">
                      🚪 Finalizar Interconsulta (Dar de Alta)
                    </summary>
                    <div className="absolute right-0 mt-2 w-80 bg-white p-4 rounded-xl border border-red-200 shadow-xl z-30 text-left">
                      <p className="text-xs font-bold text-red-900 mb-1">Cierre de Interconsulta:</p>
                      <p className="text-[11px] text-slate-500 mb-2">
                        Escriba la conclusión médica y recomendaciones finales para cerrar la interconsulta:
                      </p>
                      <form action={finalizarInterconsulta} className="space-y-2">
                        <input type="hidden" name="episodeId" value={episode.id} />
                        <textarea
                          name="conclusion"
                          required
                          rows={3}
                          placeholder="Ej. Paciente compensado. Se suspende seguimiento por el servicio..."
                          className="w-full px-2.5 py-1.5 border rounded-lg text-xs text-slate-900"
                        />
                        <button type="submit" className="w-full bg-red-600 text-white text-xs py-1.5 rounded font-bold hover:bg-red-700 cursor-pointer">
                          Confirmar y Finalizar Interconsulta
                        </button>
                      </form>
                    </div>
                  </details>
                )
              ) : (
                permisos.puedeDarAlta && (
                  <Link href={`/dashboard/paciente/${episode.id}/alta`} className="bg-red-600 text-white px-3.5 py-2 rounded-lg text-xs font-bold hover:bg-red-700 transition-colors shadow-sm">
                    🚪 Dar de Alta
                  </Link>
                )
              )
            )}

            {/* SI ES INTERCONSULTA -> BOTÓN VERDE PARA PASAR A SALA */}
            {!esSoloLectura && esInterconsulta && (
              <details className="relative">
                <summary className="list-none cursor-pointer bg-emerald-600 text-white px-3.5 py-2 rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors shadow-sm">
                  🔄 Ingresar a Sala (Pasar a Propio)
                </summary>
                <div className="absolute right-0 mt-2 w-80 bg-white p-4 rounded-xl border border-emerald-300 shadow-xl z-30 text-left">
                  <p className="text-xs font-bold text-emerald-900 mb-1">Traslado a Paciente Propio:</p>
                  <p className="text-[11px] text-slate-500 mb-2">
                    Asigne la habitación de sala para transferir este paciente a su servicio directo:
                  </p>
                  <form action={transferirAPropio} className="space-y-2">
                    <input type="hidden" name="episodeId" value={episode.id} />
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600">Habitación de Sala *</label>
                      <input name="room" required placeholder="Ej. 104" className="w-full px-2 py-1 border rounded text-xs text-slate-900" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600">Cama de Sala *</label>
                      <input name="bed" required placeholder="Ej. A" className="w-full px-2 py-1 border rounded text-xs text-slate-900" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600">Médico Tratante / Residente:</label>
                      <input name="attendingDoctor" placeholder="Ej. Dra. Gómez (R3)" className="w-full px-2 py-1 border rounded text-xs text-slate-900" />
                    </div>
                    <button type="submit" className="w-full bg-emerald-700 text-white text-xs py-1.5 rounded font-bold hover:bg-emerald-800 mt-1 cursor-pointer">
                      Confirmar Ingreso a Sala
                    </button>
                  </form>
                </div>
              </details>
            )}

            {/* SI ES PACIENTE PROPIO (SALA) -> BOTÓN PÚRPURA PARA TRASLADAR A INTERCONSULTA */}
            {!esSoloLectura && !esInterconsulta && permisos.puedeRegistrar && (
              <details className="relative">
                <summary className="list-none cursor-pointer bg-purple-600 text-white px-3.5 py-2 rounded-lg text-xs font-bold hover:bg-purple-700 transition-colors shadow-sm">
                  🔄 Pasar a Interconsulta
                </summary>
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 p-4 rounded-xl border border-purple-300 dark:border-purple-700 shadow-2xl z-30 text-left">
                  <p className="text-xs font-bold text-purple-900 dark:text-purple-300 mb-1">
                    Traslado a Interconsulta:
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                    Indique los datos del servicio receptor para mover este paciente a Interconsultas:
                  </p>
                  <form action={transferirAInterconsulta} className="space-y-2">
                    <input type="hidden" name="episodeId" value={episode.id} />
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                        Servicio / Especialidad Receptora *
                      </label>
                      <input
                        name="consultingDepartment"
                        required
                        placeholder="Ej. UCI, Nefrología, Cirugía..."
                        className="w-full px-2.5 py-1.5 border rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                        Residente o Médico Receptor:
                      </label>
                      <input
                        name="consultingResident"
                        placeholder="Ej. Dr. Martínez (R2)"
                        className="w-full px-2.5 py-1.5 border rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                          Ubicación / Sala *
                        </label>
                        <input
                          name="room"
                          required
                          defaultValue={episode.room ?? ''}
                          placeholder="Ej. UCI, 302"
                          className="w-full px-2 py-1 border rounded text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                          Cama *
                        </label>
                        <input
                          name="bed"
                          required
                          defaultValue={episode.bed ?? ''}
                          placeholder="Ej. 1 o A"
                          className="w-full px-2 py-1 border rounded text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                        Motivo de Interconsulta / Traslado *
                      </label>
                      <textarea
                        name="chiefComplaint"
                        required
                        rows={2}
                        placeholder="Ej. Evaluación por falla renal aguda / requerimiento de diálisis..."
                        className="w-full px-2.5 py-1.5 border rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-purple-700 text-white text-xs py-2 rounded-lg font-bold hover:bg-purple-800 transition-colors shadow-sm mt-1 cursor-pointer"
                    >
                      Confirmar Pase a Interconsulta
                    </button>
                  </form>
                </div>
              </details>
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
                        <button type="submit" className="w-full bg-blue-600 text-white text-xs py-1.5 rounded font-bold hover:bg-blue-700 cursor-pointer">
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

        {/* DIAGNÓSTICOS CON BOTÓN MODIFICAR */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {esInterconsulta ? 'Motivo y Diagnóstico de Interconsulta' : 'Diagnósticos del Paciente'}
              </span>
              {permisos.puedeRegistrar && (
                <details className="inline-block relative print:hidden">
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
                      <button type="submit" className="w-full bg-blue-600 text-white text-xs py-1.5 rounded-lg font-bold hover:bg-blue-700 cursor-pointer">
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

        {/* TRATAMIENTO MÉDICO ACTUAL CON TEXTO LIBRE Y FIRMA */}
        <TratamientoActual
          episodeId={episode.id}
          tratamiento={episode.currentTreatment}
          actualizadoPor={episode.treatmentUpdatedBy}
          actualizadoAt={episode.treatmentUpdatedAt}
          nombres={nombres}
          roles={roles}
          puedeRegistrar={permisos.puedeRegistrar}
        />

        {/* 1. NOTAS IMPORTANTES */}
        <div className="print:hidden">
          <NotasImportantes
            episodeId={episode.id}
            alertas={episode.importantAlerts}
            nombres={nombres}
            puedeRegistrar={permisos.puedeRegistrar}
          />
        </div>

        {/* 2. ACCESO VASCULAR, VIRALES, TIPIFICACIÓN Y TFG */}
        <div className="print:hidden">
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
        </div>

        <div className="print:hidden">
          <BannerAlergias alergias={episode.allergies} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Columna Izquierda */}
          <div className="lg:col-span-1 space-y-6 print:hidden">
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
                    {episode.hospitalAdmissionDate && (
                      <p>
                        <strong>Ingreso general al Hospital:</strong> {fechaCorta(episode.hospitalAdmissionDate)} (Día {diasHospital})
                      </p>
                    )}
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

            {/* FORMULARIO DE SIGNOS VITALES */}
            {permisos.puedeRegistrar && (
              esInterconsulta ? (
                <div className="bg-white p-5 rounded-xl shadow-sm border border-purple-200">
                  <div className="flex items-center gap-2 border-b pb-2 mb-4">
                    <span className="text-lg">💧</span>
                    <h2 className="text-base font-bold text-purple-900">Reporte de Diuresis</h2>
                  </div>
                  <form action={guardarSignosVitales} className="space-y-3">
                    <input type="hidden" name="episodeId" value={episode.id} />
                    <div>
                      <label className="block text-xs font-bold text-sky-800 mb-1">
                        Diuresis (mL) *
                      </label>
                      <input
                        name="diuresis"
                        type="number"
                        inputMode="numeric"
                        required
                        placeholder="Ej. 650"
                        className="w-full px-3 py-2 border rounded-lg text-sm text-slate-900 font-bold focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Peso actual:
                      </label>
                      <div className="flex gap-2">
                        <input
                          name="weight"
                          type="number"
                          step="0.1"
                          placeholder="Ej. 70 o 154"
                          className="flex-1 px-3 py-1.5 border rounded-lg text-xs text-slate-900"
                        />
                        <select name="weightUnit" className="w-16 px-1.5 py-1.5 border rounded-lg text-xs bg-slate-100 font-bold">
                          <option value="kg">kg</option>
                          <option value="lb">lb</option>
                        </select>
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-purple-700 text-white py-2.5 rounded-lg text-xs font-bold hover:bg-purple-800 transition-colors shadow-sm cursor-pointer"
                    >
                      Guardar Reporte de Diuresis
                    </button>
                  </form>
                </div>
              ) : (
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

                      {/* PESO CON SELECTOR KG / LB */}
                      <div>
                        <label className="block text-xs font-bold text-emerald-800 mb-1">Peso</label>
                        <div className="flex gap-1">
                          <input name="weight" type="number" inputMode="decimal" step="0.1" placeholder="70.5" className="flex-1 px-2 py-1 border rounded text-xs text-slate-900" />
                          <select name="weightUnit" className="px-1.5 py-1 border rounded text-xs bg-slate-100 font-bold">
                            <option value="kg">kg</option>
                            <option value="lb">lb</option>
                          </select>
                        </div>
                      </div>

                      <div className="col-span-2">
                        <label className="block text-xs font-bold text-sky-800 mb-1">Diuresis (mL)</label>
                        <input name="diuresis" type="number" inputMode="numeric" placeholder="Ej. 600" className={entradaVital} />
                      </div>
                    </div>
                    <button type="submit" className="w-full bg-emerald-600 text-white px-4 py-3 md:py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors mt-2 cursor-pointer">
                      Guardar Signos
                    </button>
                  </form>
                </div>
              )
            )}

            {/* Alergias */}
            {permisos.puedeRegistrar && (
              <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 space-y-4">
                <h2 className="text-lg font-bold text-slate-800 border-b pb-2">Gestión de Alergias</h2>
                
                <form action={marcarSinAlergias}>
                  <input type="hidden" name="episodeId" value={episode.id} />
                  <button type="submit" className="w-full bg-emerald-50 text-emerald-800 border border-emerald-300 px-3 py-2 rounded-lg text-xs font-bold hover:bg-emerald-100 transition-colors cursor-pointer">
                    ✅ Marcar: Paciente Niega Alergias
                  </button>
                </form>

                <form action={agregarAlergia} className="space-y-3 pt-2 border-t">
                  <p className="text-xs font-bold text-slate-700">O registrar alergia conocida:</p>
                  <input type="hidden" name="episodeId" value={episode.id} />
                  <input name="allergen" required className="w-full px-3 py-2 border rounded-lg text-base md:text-sm text-slate-900" placeholder="Alérgeno (Ej. Penicilina, AINEs...)" />
                  <input name="reaction" className="w-full px-3 py-2 border rounded-lg text-base md:text-sm text-slate-900" placeholder="Reacción (opcional, ej. Edema, rash)" />
                  <button type="submit" className="w-full bg-red-600 text-white px-4 py-3 md:py-2 rounded-lg text-sm font-medium hover:bg-red-700 cursor-pointer">
                    Guardar Alergia
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Columna Derecha */}
          <div className="lg:col-span-2 space-y-6">
            <div className="print:hidden">
              <ChecklistTareas
                episodeId={episode.id}
                tareas={episode.tasks}
                nombres={nombres}
                roles={roles}
                puedeMarcar={permisos.puedeMarcarTareas}
                puedeEditar={permisos.puedeEditar}
                puedeAgregar={permisos.puedeRegistrar}
              />
            </div>

            {/* 4. REPORTES DE LABORATORIO */}
            <div className="print:hidden">
              <ReportesLaboratorio
                episodeId={episode.id}
                reportes={episode.labReports}
                nombres={nombres}
                roles={roles}
                puedeRegistrar={permisos.puedeRegistrar}
              />
            </div>

            {/* 5. REPORTES DE ESTUDIOS */}
            <div className="print:hidden">
              <ReportesEstudios
                episodeId={episode.id}
                estudios={episode.studyReports}
                nombres={nombres}
                puedeRegistrar={permisos.puedeRegistrar}
              />
            </div>

            {/* Tendencia */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 print:hidden">
              <h2 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4">
                {esInterconsulta ? 'Control y Tendencia de Diuresis' : 'Tendencia de Signos Vitales, Peso y Diuresis'}
              </h2>
              <GraficasSignos registros={registrosGrafica} />
            </div>

            {/* TABLA DE SIGNOS VITALES */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 overflow-x-auto print:border-none print:shadow-none print:p-0">
              <div className="flex justify-between items-center border-b pb-2 mb-4">
                <h2 className="text-lg font-bold text-slate-800">
                  {esInterconsulta ? 'Historial de Diuresis' : 'Últimos Signos Vitales'}
                </h2>
                <BotonImprimirSignos />
              </div>

              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-600">
                  <tr>
                    <th className="px-3 py-2 whitespace-nowrap">Fecha / Hora</th>
                    {!esInterconsulta && <th className="px-3 py-2">TA</th>}
                    {!esInterconsulta && <th className="px-3 py-2">FC</th>}
                    {!esInterconsulta && <th className="px-3 py-2">Temp</th>}
                    {!esInterconsulta && <th className="px-3 py-2">SpO2</th>}
                    <th className="px-3 py-2">Peso</th>
                    <th className="px-3 py-2 font-bold text-sky-800">Diuresis</th>
                    <th className="px-3 py-2">Registró</th>
                    {permisos.puedeRegistrar && <th className="px-3 py-2 text-right print:hidden">Editar</th>}
                  </tr>
                </thead>
                <tbody>
                  {episode.vitals.map((v) => (
                    <tr key={v.id} className="border-b hover:bg-slate-50">
                      <td className="px-3 py-2 text-slate-500 whitespace-nowrap">{fechaCorta(v.createdAt)}</td>
                      {!esInterconsulta && (
                        <td className={`px-3 py-2 font-medium ${esAnormal('sys', v.systolic) ? 'text-red-600 bg-red-50' : 'text-slate-800'}`}>
                          {v.systolic ? `${v.systolic}/${v.diastolic}` : '—'}
                        </td>
                      )}
                      {!esInterconsulta && <td className="px-3 py-2 text-slate-800">{v.heartRate ?? '—'}</td>}
                      {!esInterconsulta && <td className="px-3 py-2 text-slate-800">{v.temperature ?? '—'}</td>}
                      {!esInterconsulta && <td className="px-3 py-2 text-slate-800">{v.oxygenSat ?? '—'}</td>}
                      <td className="px-3 py-2 font-bold text-emerald-700">
                        {v.weight ? `${v.weight} ${v.weightUnit ?? 'kg'}` : '—'}
                      </td>
                      <td className="px-3 py-2 font-bold text-sky-800">{v.diuresis ? `${v.diuresis} mL` : '—'}</td>
                      <td className="px-3 py-2 text-slate-500 whitespace-nowrap">
                        <span>{nombres[v.recordedBy] ?? v.recordedBy}</span>
                        {v.updatedBy && (
                          <span className="block text-[10px] text-amber-700 font-medium">
                            Editado por {nombres[v.updatedBy] ?? v.updatedBy}
                          </span>
                        )}
                      </td>

                      {/* BOTÓN ✏️ PARA EDITAR TOMA */}
                      {permisos.puedeRegistrar && (
                        <td className="px-3 py-2 text-right print:hidden">
                          <details className="relative inline-block text-left">
                            <summary className="list-none cursor-pointer text-blue-600 hover:text-blue-800 font-semibold">
                              ✏️
                            </summary>
                            <div className="absolute right-0 mt-1 w-64 bg-white p-3 rounded-xl border border-slate-300 shadow-xl z-30">
                              <p className="text-xs font-bold text-slate-800 mb-2 border-b pb-1">
                                Corregir toma de signos:
                              </p>
                              <form action={modificarSignosVitales} className="space-y-2">
                                <input type="hidden" name="episodeId" value={episode.id} />
                                <input type="hidden" name="vitalId" value={v.id} />
                                <div className="grid grid-cols-2 gap-1.5">
                                  <div>
                                    <label className="block text-[10px] text-slate-500">Sistólica:</label>
                                    <input name="systolic" defaultValue={v.systolic ?? ''} type="number" className="w-full px-1.5 py-1 border rounded text-xs" />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] text-slate-500">Diastólica:</label>
                                    <input name="diastolic" defaultValue={v.diastolic ?? ''} type="number" className="w-full px-1.5 py-1 border rounded text-xs" />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] text-slate-500">FC:</label>
                                    <input name="heartRate" defaultValue={v.heartRate ?? ''} type="number" className="w-full px-1.5 py-1 border rounded text-xs" />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] text-slate-500">Temp:</label>
                                    <input name="temperature" defaultValue={v.temperature ?? ''} type="number" step="0.1" className="w-full px-1.5 py-1 border rounded text-xs" />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] text-slate-500">Peso:</label>
                                    <input name="weight" defaultValue={v.weight ?? ''} type="number" step="0.1" className="w-full px-1.5 py-1 border rounded text-xs" />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] text-slate-500">Unidad:</label>
                                    <select name="weightUnit" defaultValue={v.weightUnit ?? 'kg'} className="w-full px-1 py-1 border rounded text-xs bg-white">
                                      <option value="kg">kg</option>
                                      <option value="lb">lb</option>
                                    </select>
                                  </div>
                                  <div className="col-span-2">
                                    <label className="block text-[10px] text-slate-500">Diuresis (mL):</label>
                                    <input name="diuresis" defaultValue={v.diuresis ?? ''} type="number" className="w-full px-1.5 py-1 border rounded text-xs" />
                                  </div>
                                </div>
                                <button type="submit" className="w-full bg-slate-800 text-white text-xs py-1 rounded font-bold hover:bg-slate-900 mt-1 cursor-pointer">
                                  Guardar Corrección
                                </button>
                              </form>
                            </div>
                          </details>
                        </td>
                      )}
                    </tr>
                  ))}
                  {episode.vitals.length === 0 && (
                    <tr><td colSpan={esInterconsulta ? 5 : 9} className="text-center py-4 text-slate-400">No hay registros aún.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* 6. EVOLUCIÓN */}
            {permisos.puedeRegistrar && (
              <div className="print:hidden">
                <FormularioNotaEvolucion episodeId={episode.id} action={guardarNota} />
              </div>
            )}

            {/* Historial de Notas */}
            <div className="space-y-4 print:hidden">
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