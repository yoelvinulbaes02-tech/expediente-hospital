import { ROLES_CLINICOS } from '@/lib/permisos'

export type SeccionConsultaKey =
  | 'signos'
  | 'motivo'
  | 'enfermedad'
  | 'examen'
  | 'diagnostico'
  | 'receta'
  | 'laboratorio'
  | 'notas'

export type BloqueAntecedenteConsulta = {
  id: string
  fechaIso: string
  authorId: string | null
  authorName: string
  pathological: string | null
  surgical: string | null
  medications: string | null
  family: string | null
  habits: string | null
}

export type BloqueSeccionConsulta = {
  id: string
  seccion: SeccionConsultaKey
  fechaIso: string
  authorId: string | null
  authorName: string
  consultationId: string | null
  // Signos
  bloodPressure?: string | null
  heartRate?: number | null
  temperature?: number | null
  oxygenSat?: number | null
  weight?: number | null
  weightUnit?: string | null
  heightCm?: number | null
  // Motivo
  visitType?: string | null
  chiefComplaint?: string | null
  // Textuales (enfermedad, examen, diagnostico, receta, laboratorio, notas)
  contenido?: string | null
}

export type HistorialVisitaResumen = {
  id: string
  consultationDate: string
  status: string
  visitType: string
  doctorId: string | null
  doctorName: string | null
  chiefComplaint: string
  bloodPressure: string | null
  heartRate: number | null
  temperature: number | null
  oxygenSat: number | null
  weight: number | null
  weightUnit: string | null
  heightCm: number | null
  historyIllness: string | null
  physicalExam: string | null
  diagnosis: string | null
  treatmentPlan: string | null
  labOrders: string | null
  notes: string | null
}

export function normalizarTextoClinico(texto?: string | null): string {
  return (texto ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

export function normalizarNombreCompleto(
  firstName?: string | null,
  lastName?: string | null
): string {
  return normalizarTextoClinico(`${firstName ?? ''} ${lastName ?? ''}`)
}

export function tieneNotasClinicasEscritas(c: {
  status?: string | null
  historyIllness?: string | null
  physicalExam?: string | null
  diagnosis?: string | null
  treatmentPlan?: string | null
  labOrders?: string | null
  notes?: string | null
}): boolean {
  return Boolean(
    c.status === 'COMPLETADA' ||
      c.historyIllness?.trim() ||
      c.physicalExam?.trim() ||
      c.diagnosis?.trim() ||
      c.treatmentPlan?.trim() ||
      c.labOrders?.trim() ||
      c.notes?.trim()
  )
}

export function puedeEditarNotasConsulta(
  consulta: {
    doctorId?: string | null
    updatedBy?: string | null
    createdBy?: string | null
    status?: string | null
    historyIllness?: string | null
    physicalExam?: string | null
    diagnosis?: string | null
    treatmentPlan?: string | null
    labOrders?: string | null
    notes?: string | null
  },
  user: {
    id: string
    email: string
    role: string
  }
): boolean {
  if (!ROLES_CLINICOS.includes(user.role)) return false

  if (!tieneNotasClinicasEscritas(consulta)) {
    return true
  }

  if (consulta.doctorId) {
    return consulta.doctorId === user.id
  }

  const autorEmail = (consulta.updatedBy || consulta.createdBy || '').trim().toLowerCase()
  if (autorEmail) {
    return autorEmail === user.email.trim().toLowerCase()
  }

  return false
}
