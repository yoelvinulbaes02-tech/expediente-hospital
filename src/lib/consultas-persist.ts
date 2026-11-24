import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { ROLES_CLINICOS, ROLES_MEDICOS } from '@/lib/permisos'
import {
  type SeccionConsultaKey,
  puedeEditarNotasConsulta,
  tieneNotasClinicasEscritas,
} from '@/lib/consultas-auth'
import { obtenerContextoResidencia, verificarEscrituraResidencia } from '@/lib/tenant'
import { revalidatePath } from 'next/cache'

export type PayloadConsultaClinica = {
  consultationId: string
  accion?: 'guardar' | 'finalizar' | 'reabrir'
  visitType?: string
  chiefComplaint?: string
  bloodPressure?: string | null
  heartRate?: string | number | null
  temperature?: string | number | null
  oxygenSat?: string | number | null
  weight?: string | number | null
  weightUnit?: string | null
  heightCm?: string | number | null
  historyIllness?: string | null
  physicalExam?: string | null
  diagnosis?: string | null
  treatmentPlan?: string | null
  labOrders?: string | null
  notes?: string | null
  nextAppointment?: string | null
}

function aTextoOpcional(v: unknown): string | null {
  if (v === null || v === undefined) return null
  const s = String(v).trim()
  return s ? s : null
}

function aEnteroOpcional(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null
  const n = typeof v === 'number' ? Math.trunc(v) : parseInt(String(v).trim(), 10)
  return Number.isFinite(n) ? n : null
}

function aDecimalOpcional(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null
  const n = typeof v === 'number' ? v : parseFloat(String(v).trim())
  return Number.isFinite(n) ? n : null
}

export async function persistirConsultaClinica(payload: PayloadConsultaClinica): Promise<{
  ok: boolean
  error?: string
  finalizada?: boolean
  reabierta?: boolean
  savedAtIso?: string
  changedSections?: SeccionConsultaKey[]
  authorName?: string
  authorRole?: string
  doctorId?: string | null
}> {
  const ctx = await obtenerContextoResidencia()
  if (!ctx?.user) {
    return { ok: false, error: 'Sesión expirada. Inicia sesión nuevamente.' }
  }
  if (ctx.user.mustChangePassword) {
    return { ok: false, error: 'Debes cambiar tu contraseña temporal antes de continuar.' }
  }
  if (!ROLES_CLINICOS.includes(ctx.user.role)) {
    return { ok: false, error: 'No tienes permisos clínicos para modificar consultas.' }
  }

  const consultationId = String(payload.consultationId ?? '').trim()
  if (!consultationId) {
    return { ok: false, error: 'Falta el identificador de la consulta.' }
  }

  const consulta = await prisma.consultation.findUnique({
    where: { id: consultationId },
    select: {
      id: true,
      residencyId: true,
      patientId: true,
      status: true,
      visitType: true,
      chiefComplaint: true,
      bloodPressure: true,
      heartRate: true,
      temperature: true,
      oxygenSat: true,
      weight: true,
      weightUnit: true,
      heightCm: true,
      historyIllness: true,
      physicalExam: true,
      diagnosis: true,
      treatmentPlan: true,
      labOrders: true,
      nextAppointment: true,
      notes: true,
      doctorId: true,
      doctorName: true,
      createdBy: true,
      updatedBy: true,
    },
  })

  if (!consulta) {
    return { ok: false, error: 'Consulta no encontrada.' }
  }

  if (!ctx.esSuperAdmin && (!ctx.residency || consulta.residencyId !== ctx.residency.id)) {
    return { ok: false, error: 'No tienes acceso a esta residencia.' }
  }

  const check = await verificarEscrituraResidencia(consulta.residencyId)
  if (!check.ok) {
    return { ok: false, error: check.error }
  }

  const accion = payload.accion ?? 'guardar'

  if (!puedeEditarNotasConsulta(consulta, ctx.user)) {
    const autor = consulta.doctorName || consulta.updatedBy || 'el médico autor'
    return {
      ok: false,
      error: `Esta consulta pertenece a ${autor}. No puedes modificar lo que otro médico registró en consulta.`,
    }
  }

  if ((consulta.status === 'COMPLETADA' || consulta.status === 'CANCELADA') && accion !== 'reabrir') {
    return {
      ok: false,
      error: 'Esta consulta ya está cerrada y no admite modificaciones directas. Crea una nueva visita si el paciente regresó.',
    }
  }

  const chiefComplaint =
    payload.chiefComplaint !== undefined
      ? String(payload.chiefComplaint).trim()
      : consulta.chiefComplaint

  if (chiefComplaint.length < 2) {
    return { ok: false, error: 'El motivo de consulta es obligatorio.' }
  }

  const visitType =
    payload.visitType !== undefined
      ? String(payload.visitType).trim() || 'Primera vez'
      : consulta.visitType

  const bloodPressure =
    payload.bloodPressure !== undefined ? aTextoOpcional(payload.bloodPressure) : consulta.bloodPressure
  const heartRate =
    payload.heartRate !== undefined ? aEnteroOpcional(payload.heartRate) : consulta.heartRate
  const temperature =
    payload.temperature !== undefined ? aDecimalOpcional(payload.temperature) : consulta.temperature
  const oxygenSat =
    payload.oxygenSat !== undefined ? aEnteroOpcional(payload.oxygenSat) : consulta.oxygenSat
  const weight =
    payload.weight !== undefined ? aDecimalOpcional(payload.weight) : consulta.weight
  const weightUnit =
    payload.weightUnit !== undefined
      ? String(payload.weightUnit ?? 'kg').trim() || 'kg'
      : consulta.weightUnit ?? 'kg'
  const heightCm =
    payload.heightCm !== undefined ? aDecimalOpcional(payload.heightCm) : consulta.heightCm

  const historyIllness =
    payload.historyIllness !== undefined
      ? aTextoOpcional(payload.historyIllness)
      : consulta.historyIllness
  const physicalExam =
    payload.physicalExam !== undefined ? aTextoOpcional(payload.physicalExam) : consulta.physicalExam
  const diagnosis =
    payload.diagnosis !== undefined ? aTextoOpcional(payload.diagnosis) : consulta.diagnosis
  const treatmentPlan =
    payload.treatmentPlan !== undefined
      ? aTextoOpcional(payload.treatmentPlan)
      : consulta.treatmentPlan
  const labOrders =
    payload.labOrders !== undefined ? aTextoOpcional(payload.labOrders) : consulta.labOrders
  const notes = payload.notes !== undefined ? aTextoOpcional(payload.notes) : consulta.notes

  let nextAppointment = consulta.nextAppointment
  if (payload.nextAppointment !== undefined) {
    const nextStr = String(payload.nextAppointment ?? '').trim()
    if (!nextStr) {
      nextAppointment = null
    } else {
      const parsed = new Date(`${nextStr}T09:00:00-04:00`)
      if (Number.isNaN(parsed.getTime())) {
        return { ok: false, error: 'La fecha de próxima cita no es válida.' }
      }
      nextAppointment = parsed
    }
  }

  // Detectar exactamente qué acápites cambiaron para registrar su autoría y trazabilidad
  const changedSections: SeccionConsultaKey[] = []
  const oldDiff: Record<string, unknown> = {}
  const newDiff: Record<string, unknown> = {}

  const track = (sec: SeccionConsultaKey, field: string, oldVal: unknown, newVal: unknown) => {
    const o = oldVal instanceof Date ? oldVal.toISOString().slice(0, 10) : (oldVal ?? null)
    const n = newVal instanceof Date ? newVal.toISOString().slice(0, 10) : (newVal ?? null)
    if (o !== n) {
      oldDiff[field] = o
      newDiff[field] = n
      if (!changedSections.includes(sec)) {
        changedSections.push(sec)
      }
    }
  }

  track('signos', 'bloodPressure', consulta.bloodPressure, bloodPressure)
  track('signos', 'heartRate', consulta.heartRate, heartRate)
  track('signos', 'temperature', consulta.temperature, temperature)
  track('signos', 'oxygenSat', consulta.oxygenSat, oxygenSat)
  track('signos', 'weight', consulta.weight, weight)
  track('signos', 'weightUnit', consulta.weightUnit ?? 'kg', weightUnit)
  track('signos', 'heightCm', consulta.heightCm, heightCm)

  track('motivo', 'visitType', consulta.visitType, visitType)
  track('motivo', 'chiefComplaint', consulta.chiefComplaint, chiefComplaint)
  track('motivo', 'nextAppointment', consulta.nextAppointment, nextAppointment)

  track('enfermedad', 'historyIllness', consulta.historyIllness, historyIllness)
  track('examen', 'physicalExam', consulta.physicalExam, physicalExam)
  track('diagnostico', 'diagnosis', consulta.diagnosis, diagnosis)
  track('receta', 'treatmentPlan', consulta.treatmentPlan, treatmentPlan)
  track('laboratorio', 'labOrders', consulta.labOrders, labOrders)
  track('notas', 'notes', consulta.notes, notes)

  const nuevoEstado =
    accion === 'finalizar'
      ? 'COMPLETADA'
      : accion === 'reabrir'
        ? 'EN_CONSULTA'
        : consulta.status === 'PROGRAMADA' || consulta.status === 'EN_SALA'
          ? 'EN_CONSULTA'
          : consulta.status

  const statusCambio = nuevoEstado !== consulta.status
  if (statusCambio) {
    oldDiff.status = consulta.status
    newDiff.status = nuevoEstado
  }

  if (changedSections.length === 0 && !statusCambio && accion === 'guardar') {
    return {
      ok: true,
      savedAtIso: new Date().toISOString(),
      changedSections: [],
      authorName: ctx.user.fullName,
      authorRole: String(ctx.user.role),
      doctorId: consulta.doctorId,
    }
  }

  const yaTieneNotas = tieneNotasClinicasEscritas(consulta)
  const escribeNotasClinicas = Boolean(
    historyIllness ||
      physicalExam ||
      diagnosis ||
      treatmentPlan ||
      labOrders ||
      notes ||
      accion === 'finalizar'
  )

  const esMedicoOAdmin = ROLES_MEDICOS.includes(ctx.user.role) || ctx.user.role === 'ADMIN'
  const asignarAutor =
    !consulta.doctorId &&
    esMedicoOAdmin &&
    (escribeNotasClinicas || changedSections.some((s) => s !== 'signos') || !yaTieneNotas)

  const updated = await prisma.consultation.update({
    where: { id: consultationId },
    data: {
      visitType,
      chiefComplaint,
      bloodPressure,
      heartRate,
      temperature,
      oxygenSat,
      weight,
      weightUnit,
      heightCm,
      historyIllness,
      physicalExam,
      diagnosis,
      treatmentPlan,
      labOrders,
      nextAppointment,
      notes,
      status: nuevoEstado,
      updatedBy: ctx.user.email,
      ...(asignarAutor ? { doctorId: ctx.user.id, doctorName: ctx.user.fullName } : {}),
    },
    select: {
      updatedAt: true,
      doctorId: true,
    },
  })

  await logAudit({
    actorId: ctx.user.id,
    actorRole: String(ctx.user.role),
    action: 'update',
    entity: 'consultation',
    entityId: consultationId,
    patientId: consulta.patientId,
    oldValue: Object.keys(oldDiff).length > 0 ? oldDiff : null,
    newValue: {
      ...newDiff,
      changedSections,
      authorName: ctx.user.fullName,
      authorRole: String(ctx.user.role),
    },
    reason:
      accion === 'finalizar'
        ? 'Consulta médica finalizada y firmada'
        : accion === 'reabrir'
          ? 'Consulta reabierta por su médico autor'
          : `Actualización automática de consulta (${changedSections.join(', ') || 'estado'})`,
  })

  revalidatePath('/dashboard')
  revalidatePath(`/dashboard/consultas/${consultationId}`)

  return {
    ok: true,
    finalizada: accion === 'finalizar',
    reabierta: accion === 'reabrir',
    savedAtIso: updated.updatedAt.toISOString(),
    changedSections,
    authorName: ctx.user.fullName,
    authorRole: String(ctx.user.role),
    doctorId: updated.doctorId,
  }
}
