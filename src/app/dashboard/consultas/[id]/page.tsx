import { prisma } from '@/lib/prisma'
import { obtenerContextoResidencia } from '@/lib/tenant'
import { ROLES_CLINICOS } from '@/lib/permisos'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { BannerAlergias } from '@/components/BannerAlergias'
import { PrintButton } from '@/components/PrintButton'
import { FormularioConsultaClinica } from '@/components/FormularioConsultaClinica'
import { AntecedentesConsultasRetraibles } from '@/components/AntecedentesConsultasRetraibles'
import { DatosPacienteConsultaCard } from '@/components/DatosPacienteConsultaCard'
import {
  type AntecedentesConsultaState,
  type HistorialVisitaResumen,
  type MapaMetaSecciones,
  type SeccionAutorMeta,
  type SeccionConsultaKey,
  etiquetaRolClinico,
  puedeEditarNotasConsulta,
  tieneNotasClinicasEscritas,
} from '@/lib/consultas-auth'
import {
  agregarAlergiaConsulta,
  marcarSinAlergiasConsulta,
} from '../actions'

const fmtFecha = (d: Date) =>
  d.toLocaleString('es-DO', {
    timeZone: 'America/Santo_Domingo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

function fmtFechaLocalInput(d: Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Santo_Domingo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(d)
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '00'
  const hour = get('hour') === '24' ? '00' : get('hour')
  return `${get('year')}-${get('month')}-${get('day')}T${hour}:${get('minute')}`
}

function parseAuditJson(raw: unknown): Record<string, unknown> | null {
  if (!raw) return null
  if (typeof raw === 'object' && !Array.isArray(raw)) {
    return raw as Record<string, unknown>
  }
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw)
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
        ? (parsed as Record<string, unknown>)
        : null
    } catch {
      return null
    }
  }
  return null
}

const ETIQUETA_ESTADO_CONSULTA: Record<string, string> = {
  PROGRAMADA: 'Programada',
  EN_SALA: 'En sala de espera',
  EN_CONSULTA: 'En consulta',
  COMPLETADA: 'Firmada y cerrada',
  CANCELADA: 'Cancelada',
}

export default async function ConsultaDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const ctx = await obtenerContextoResidencia()
  if (!ctx?.user) redirect('/login')
  if (ctx.user.mustChangePassword) redirect('/dashboard/perfil?force=true')

  const { id } = await params

  const consulta = await prisma.consultation.findUnique({
    where: { id },
    include: {
      residency: true,
      doctor: {
        select: { id: true, fullName: true, role: true },
      },
      patient: {
        include: {
          medicalHistory: true,
          allergies: { orderBy: { createdAt: 'desc' } },
          consultations: {
            include: {
              doctor: { select: { id: true, fullName: true, role: true } },
            },
            orderBy: { consultationDate: 'asc' },
          },
        },
      },
    },
  })

  if (!consulta) {
    return <div className="p-8 text-center text-slate-800">Consulta no encontrada.</div>
  }

  if (!ctx.esSuperAdmin) {
    if (!ctx.residency || consulta.residencyId !== ctx.residency.id) {
      redirect('/dashboard')
    }
  }

  const [logsConsulta, logUltimoAntecedente] = await Promise.all([
    prisma.auditLog.findMany({
      where: {
        entity: 'consultation',
        entityId: consulta.id,
      },
      orderBy: { serverTs: 'asc' },
      take: 250,
      select: {
        actorRole: true,
        newValue: true,
        serverTs: true,
        actor: {
          select: { fullName: true, email: true, role: true },
        },
      },
    }),
    prisma.auditLog.findFirst({
      where: {
        patientId: consulta.patientId,
        entity: 'medical_history',
      },
      orderBy: { serverTs: 'desc' },
      select: {
        actorRole: true,
        newValue: true,
        serverTs: true,
        actor: {
          select: { fullName: true, email: true, role: true },
        },
      },
    }),
  ])

  // Construir el último modificador por cada acápite (nombre, rol, fecha/hora)
  const metaSecciones: MapaMetaSecciones = {}
  const seccionesValidas: SeccionConsultaKey[] = [
    'antropometria',
    'signos',
    'motivo',
    'enfermedad',
    'examen',
    'diagnostico',
    'receta',
    'laboratorio',
    'notas',
  ]

  for (const log of logsConsulta) {
    const data = parseAuditJson(log.newValue)
    if (!data) continue
    const byName =
      (typeof data.authorName === 'string' && data.authorName) ||
      log.actor?.fullName ||
      log.actor?.email ||
      'Personal clínico'
    const byRole =
      (typeof data.authorRole === 'string' && data.authorRole) ||
      log.actorRole ||
      String(log.actor?.role ?? '')
    const atIso = log.serverTs.toISOString()

    const changed = Array.isArray(data.changedSections)
      ? data.changedSections.filter((s): s is SeccionConsultaKey =>
          typeof s === 'string' && seccionesValidas.includes(s as SeccionConsultaKey)
        )
      : []

    if (changed.length > 0) {
      for (const sec of changed) {
        metaSecciones[sec] = { byName, byRole, atIso }
      }
    } else {
      // Compatibilidad con registros anteriores que no guardaban changedSections
      if (data.weight !== undefined || data.heightCm !== undefined) {
        metaSecciones.antropometria = { byName, byRole, atIso }
      }
      if (
        data.bloodPressure !== undefined ||
        data.heartRate !== undefined ||
        data.temperature !== undefined ||
        data.oxygenSat !== undefined
      ) {
        metaSecciones.signos = { byName, byRole, atIso }
      }
      if (
        data.chiefComplaint !== undefined ||
        data.visitType !== undefined ||
        data.consultationType !== undefined
      ) {
        metaSecciones.motivo = { byName, byRole, atIso }
      }
      if (data.diagnosis !== undefined) {
        metaSecciones.diagnostico = { byName, byRole, atIso }
      }
      if (data.treatmentPlan !== undefined) {
        metaSecciones.receta = { byName, byRole, atIso }
      }
    }
  }

  // Fallback para secciones con datos que provienen de registros previos sin log detallado
  const fallbackMeta: SeccionAutorMeta | null =
    consulta.doctorName || consulta.updatedBy || consulta.createdBy
      ? {
          byName: consulta.doctorName || consulta.updatedBy || consulta.createdBy,
          byRole: consulta.doctor?.role ? String(consulta.doctor.role) : '',
          atIso: (consulta.updatedAt || consulta.createdAt).toISOString(),
        }
      : null

  if (fallbackMeta) {
    if (
      !metaSecciones.antropometria &&
      (consulta.weight !== null || consulta.heightCm !== null)
    ) {
      metaSecciones.antropometria = fallbackMeta
    }
    if (
      !metaSecciones.signos &&
      (consulta.bloodPressure ||
        consulta.heartRate !== null ||
        consulta.temperature !== null ||
        consulta.oxygenSat !== null)
    ) {
      metaSecciones.signos = fallbackMeta
    }
    if (!metaSecciones.motivo && consulta.chiefComplaint) metaSecciones.motivo = fallbackMeta
    if (!metaSecciones.enfermedad && consulta.historyIllness) metaSecciones.enfermedad = fallbackMeta
    if (!metaSecciones.examen && consulta.physicalExam) metaSecciones.examen = fallbackMeta
    if (!metaSecciones.diagnostico && consulta.diagnosis) metaSecciones.diagnostico = fallbackMeta
    if (!metaSecciones.receta && consulta.treatmentPlan) metaSecciones.receta = fallbackMeta
    if (!metaSecciones.laboratorio && consulta.labOrders) metaSecciones.laboratorio = fallbackMeta
    if (!metaSecciones.notas && consulta.notes) metaSecciones.notas = fallbackMeta
  }

  const mh = consulta.patient.medicalHistory
  const mhLogData = parseAuditJson(logUltimoAntecedente?.newValue)
  const antecedentesInicial: AntecedentesConsultaState = {
    pathological: mh?.pathological ?? '',
    surgical: mh?.surgical ?? '',
    medications: mh?.medications ?? '',
    family: mh?.family ?? '',
    habits: mh?.habits ?? '',
    authorName:
      (typeof mhLogData?.authorName === 'string' && mhLogData.authorName) ||
      logUltimoAntecedente?.actor?.fullName ||
      mh?.updatedBy ||
      null,
    authorRole:
      (typeof mhLogData?.authorRole === 'string' && mhLogData.authorRole) ||
      logUltimoAntecedente?.actorRole ||
      null,
    updatedAtIso:
      logUltimoAntecedente?.serverTs.toISOString() ??
      (mh ? mh.updatedAt.toISOString() : null),
  }

  const historialVisitas: HistorialVisitaResumen[] = consulta.patient.consultations
    .filter((v) => v.residencyId === consulta.residencyId)
    .map((v) => ({
      id: v.id,
      consultationDate: v.consultationDate.toISOString(),
      status: v.status,
      consultationType: v.consultationType ?? 'Consulta general',
      visitType: v.visitType,
      doctorId: v.doctorId,
      doctorName: v.doctorName,
      doctorRole: v.doctor?.role ? String(v.doctor.role) : null,
      chiefComplaint: v.chiefComplaint,
      bloodPressure: v.bloodPressure,
      heartRate: v.heartRate,
      temperature: v.temperature,
      oxygenSat: v.oxygenSat,
      weight: v.weight,
      weightUnit: v.weightUnit,
      heightCm: v.heightCm,
      historyIllness: v.historyIllness,
      physicalExam: v.physicalExam,
      diagnosis: v.diagnosis,
      treatmentPlan: v.treatmentPlan,
      labOrders: v.labOrders,
      notes: v.notes,
    }))

  const suscripcionBloqueada = !ctx.esSuperAdmin && (ctx.suscripcion?.bloqueada ?? false)
  const puedeEditar = ROLES_CLINICOS.includes(ctx.user.role) && !suscripcionBloqueada
  const tieneNotas = tieneNotasClinicasEscritas(consulta)
  const autorDeEstaConsulta = puedeEditarNotasConsulta(consulta, ctx.user)
  const esCerrada = consulta.status === 'COMPLETADA' || consulta.status === 'CANCELADA'
  const puedeEditarNotas = puedeEditar && autorDeEstaConsulta && !esCerrada
  const bloqueadoPorAutoria =
    puedeEditar && !autorDeEstaConsulta && (Boolean(consulta.doctorId) || tieneNotas)
  const autorNotas = consulta.doctorName || consulta.updatedBy || consulta.createdBy || null

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* BARRA SUPERIOR FIJA CON NOMBRE DEL PACIENTE */}
      <div className="sticky top-0 z-40 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 print:hidden">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/dashboard"
              className="text-xs font-bold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-2.5 py-1.5 rounded-lg transition-colors shrink-0 whitespace-nowrap"
            >
              ← Pacientes
            </Link>
            <div className="min-w-0">
              <p className="text-sm md:text-base font-extrabold text-slate-900 dark:text-white truncate">
                {consulta.patient.firstName} {consulta.patient.lastName}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate tabular-nums">
                Exp: <strong>{consulta.patient.expedienteNumber}</strong>
                {consulta.patient.age !== null ? ` · ${consulta.patient.age} años` : ''}
                {` · ${consulta.patient.sex}`}
                {consulta.patient.phone ? ` · Tel: ${consulta.patient.phone}` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
              {ETIQUETA_ESTADO_CONSULTA[consulta.status] ?? consulta.status}
            </span>
            <PrintButton bloqueado={suscripcionBloqueada} />
          </div>
        </div>
      </div>

      {/* CABECERA SOLO PARA IMPRESIÓN DE RECETA / RESUMEN */}
      {suscripcionBloqueada ? (
        <div className="hidden print:block max-w-4xl mx-auto p-8 m-8 border-2 border-red-400 rounded-xl text-center">
          <h1 className="text-lg font-bold text-red-900">Impresión de consulta bloqueada</h1>
          <p className="text-sm text-red-800 mt-2">
            La suscripción está vencida o suspendida. Renueva el plan en Mi Suscripción para habilitar la impresión de resúmenes y recetas.
          </p>
        </div>
      ) : (
        <div className="hidden print:block max-w-4xl mx-auto p-6 border-b-2 border-slate-900 mb-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-xl font-black text-slate-900">{consulta.residency.name}</h1>
              <p className="text-xs text-slate-600">{consulta.residency.specialty}</p>
            </div>
            <div className="text-right text-xs text-slate-600 tabular-nums">
              <p>Fecha: {fmtFecha(consulta.consultationDate)}</p>
              <p>Exp: {consulta.patient.expedienteNumber}</p>
            </div>
          </div>
          <p className="mt-3 text-sm font-bold text-slate-900">
            Paciente: {consulta.patient.firstName} {consulta.patient.lastName} ({consulta.patient.age ?? '—'} años · {consulta.patient.sex})
          </p>
          {consulta.doctorName && (
            <p className="text-xs text-slate-700">
              Médico tratante: {consulta.doctorName}
              {consulta.doctor?.role ? ` (${etiquetaRolClinico(String(consulta.doctor.role))})` : ''}
            </p>
          )}
        </div>
      )}

      <div className={`max-w-6xl mx-auto p-4 md:p-8 space-y-6 ${suscripcionBloqueada ? 'print:hidden' : ''}`}>
        {suscripcionBloqueada && (
          <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-900 dark:text-red-200 px-4 py-3 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs print:hidden">
            <p>
              <strong>Suscripción suspendida:</strong> Puedes consultar este expediente en pantalla por continuidad clínica, pero la edición y la impresión están bloqueadas hasta regularizar el pago.
            </p>
            <Link
              href="/dashboard/suscripcion"
              className="shrink-0 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg font-bold"
            >
              Renovar suscripción →
            </Link>
          </div>
        )}

        <div className="print:hidden">
          <BannerAlergias alergias={consulta.patient.allergies} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* COLUMNA IZQUIERDA: DATOS, ALERGIAS Y ANTECEDENTES */}
          <div className="lg:col-span-1 space-y-5 print:hidden">
            <DatosPacienteConsultaCard
              consultationId={consulta.id}
              puedeEditar={puedeEditar}
              puedeEditarFechaRegistro={puedeEditarNotas}
              paciente={{
                firstName: consulta.patient.firstName,
                lastName: consulta.patient.lastName,
                expedienteNumber: consulta.patient.expedienteNumber,
                age: consulta.patient.age,
                sex: consulta.patient.sex,
                phone: consulta.patient.phone,
                cedula: consulta.patient.cedula,
                bloodType: consulta.patient.bloodType,
              }}
              registro={{
                consultationDateLabel: fmtFecha(consulta.consultationDate),
                consultationDateLocal: fmtFechaLocalInput(consulta.consultationDate),
                doctorName: consulta.doctorName,
                doctorRole: consulta.doctor?.role ? String(consulta.doctor.role) : null,
                estadoLabel: ETIQUETA_ESTADO_CONSULTA[consulta.status] ?? consulta.status,
              }}
            />

            {puedeEditar && (
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 space-y-3">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">
                  Alergias
                </h2>
                <form action={marcarSinAlergiasConsulta}>
                  <input type="hidden" name="consultationId" value={consulta.id} />
                  <button type="submit" className="w-full bg-emerald-50 text-emerald-800 border border-emerald-300 px-3 py-2 rounded-lg text-xs font-bold hover:bg-emerald-100 cursor-pointer">
                    ✅ Marcar: Niega Alergias
                  </button>
                </form>
                <form action={agregarAlergiaConsulta} className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <input type="hidden" name="consultationId" value={consulta.id} />
                  <input name="allergen" required placeholder="Alérgeno (Ej. Penicilina)" className="w-full px-2.5 py-1.5 border rounded-lg text-xs" />
                  <input name="reaction" placeholder="Reacción (opcional)" className="w-full px-2.5 py-1.5 border rounded-lg text-xs" />
                  <button type="submit" className="w-full bg-red-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-red-700 cursor-pointer">
                    Agregar Alergia
                  </button>
                </form>
              </div>
            )}

            <AntecedentesConsultasRetraibles
              consultationId={consulta.id}
              inicial={antecedentesInicial}
              puedeEditar={puedeEditar}
            />
          </div>

          {/* COLUMNA DERECHA: FORMULARIO CLÍNICO PRINCIPAL */}
          <div className="lg:col-span-2">
            <FormularioConsultaClinica
              puedeEditar={puedeEditarNotas}
              puedeCambiarTipo={puedeEditar && consulta.status !== 'CANCELADA'}
              puedeCrearNuevaAtencion={puedeEditar}
              autorNotas={autorNotas}
              bloqueadoPorAutoria={bloqueadoPorAutoria}
              historialVisitas={historialVisitas}
              metaSeccionesInicial={metaSecciones}
              usuarioActual={{
                fullName: ctx.user.fullName,
                role: String(ctx.user.role),
              }}
              consulta={{
                id: consulta.id,
                status: consulta.status,
                consultationType: consulta.consultationType ?? 'Consulta general',
                visitType: consulta.visitType,
                chiefComplaint: consulta.chiefComplaint,
                bloodPressure: consulta.bloodPressure,
                heartRate: consulta.heartRate,
                temperature: consulta.temperature,
                oxygenSat: consulta.oxygenSat,
                weight: consulta.weight,
                weightUnit: consulta.weightUnit,
                heightCm: consulta.heightCm,
                historyIllness: consulta.historyIllness,
                physicalExam: consulta.physicalExam,
                diagnosis: consulta.diagnosis,
                treatmentPlan: consulta.treatmentPlan,
                labOrders: consulta.labOrders,
                nextAppointment: consulta.nextAppointment
                  ? consulta.nextAppointment.toISOString().slice(0, 10)
                  : null,
                notes: consulta.notes,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
