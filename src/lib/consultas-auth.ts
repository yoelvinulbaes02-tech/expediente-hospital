export const ROLES_CLINICOS_CONSULTA: readonly string[] = [
  'SUPERADMIN',
  'ADMIN',
  'DOCTOR',
  'RESIDENT',
  'NURSE',
  'LAB',
]

export const ROLES_MEDICOS_CONSULTA: readonly string[] = ['DOCTOR', 'RESIDENT']

export const ETIQUETA_ROL_CLINICO: Record<string, string> = {
  SUPERADMIN: 'Superadmin',
  ADMIN: 'Admin / Dirección',
  DOCTOR: 'Médico',
  RESIDENT: 'Residente',
  NURSE: 'Enfermería',
  LAB: 'Laboratorio',
  READONLY: 'Solo lectura',
}

export function etiquetaRolClinico(rol?: string | null): string {
  if (!rol) return 'Personal clínico'
  return ETIQUETA_ROL_CLINICO[rol] ?? rol
}

export type SeccionConsultaKey =
  | 'antropometria'
  | 'signos'
  | 'motivo'
  | 'enfermedad'
  | 'examen'
  | 'diagnostico'
  | 'receta'
  | 'laboratorio'
  | 'notas'

export type SeccionAutorMeta = {
  byName: string
  byRole: string
  atIso: string
}

export type MapaMetaSecciones = Partial<Record<SeccionConsultaKey, SeccionAutorMeta>>

export type AntecedentesConsultaState = {
  pathological: string
  surgical: string
  medications: string
  family: string
  habits: string
  authorName: string | null
  authorRole: string | null
  updatedAtIso: string | null
}

export const TIPOS_CONSULTA_EXTERNA = [
  'Consulta general',
  'Glomerulopatías',
  'Biopsias',
  'Pre-diálisis',
  'Hemodiálisis',
] as const

export type TipoConsultaExterna = (typeof TIPOS_CONSULTA_EXTERNA)[number]

export const ANALITICAS_BIOPSIA = ['Completo', 'Pendiente'] as const

export const AGUJA_BIOPSIA = [
  'Utilizar la del centro',
  'Disponible en el centro',
  'Externa',
  'Pendiente',
] as const

export const KIT_BIOPSIA = ['Pendiente', 'Listo'] as const

export const ARS_BIOPSIA = [
  'Pendiente',
  'En proceso',
  'Autorizada',
  'Privado',
] as const

export type BiopsyRecordItem = {
  id: string
  patientId: string | null
  status: 'agendada' | 'realizada'
  patientName: string
  phone: string | null
  labsStatus: string | null
  needleStatus: string | null
  kitStatus: string | null
  scheduledDate: string | null
  senasaAuth: string | null
  note: string | null
  performedDate: string | null
  complications: string | null
  report: string | null
  highlightTag: 'normal' | 'programada' | 'alerta' | 'completada'
  createdByName: string
  createdByRole: string
  createdAt: string
  updatedByName: string | null
  updatedByRole: string | null
  updatedAt: string | null
  performedByName: string | null
  performedByRole: string | null
  performedAt: string | null
}

export type OutpatientHemodialysisItem = {
  id: string
  patientId: string | null
  firstName: string
  lastName: string
  expedienteNumber: string | null
  age: number | null
  sex: string | null
  phone: string | null
  cedula: string | null
  bloodType: string | null
  diagnosisAndTime: string | null
  medications: string | null
  allergies: string | null
  allergyReaction: string | null
  transfusions: string | null
  referredFromCenter: string | null
  firstTimeInCenter: string | null
  otherDialysisModality: string | null
  pathologicalHistory: string | null
  surgicalHistory: string | null
  familyHistory: string | null
  habitCoffee: string | null
  habitTobacco: string | null
  habitAlcohol: string | null
  habitDrugs: string | null
  habitOther: string | null
  viralHiv: string | null
  viralHbsag: string | null
  viralHvc: string | null
  labHgb: string | null
  labHct: string | null
  labUrea: string | null
  labCr: string | null
  labK: string | null
  labBloodType: string | null
  labOther: string | null
  imagingSonography: string | null
  imagingCt: string | null
  imagingOther: string | null
  accessAvFistula: string | null
  accessGraft: string | null
  accessTunneledCatheter: string | null
  accessFavi: string | null
  clinicalNotes: string | null
  isActive: boolean
  createdByName: string
  createdByRole: string
  createdAt: string
  updatedByName: string | null
  updatedByRole: string | null
  updatedAt: string | null
}

export type HistorialVisitaResumen = {
  id: string
  consultationDate: string
  status: string
  visitType: string
  consultationType?: string | null
  doctorId: string | null
  doctorName: string | null
  doctorRole: string | null
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
  if (!ROLES_CLINICOS_CONSULTA.includes(user.role)) return false

  // Si la consulta ya tiene un médico autor asignado, nadie más puede modificarla
  if (consulta.doctorId) {
    return consulta.doctorId === user.id
  }

  // Si aún no tiene doctorId pero ya tiene notas clínicas escritas, solo quien las escribió puede editarlas
  if (tieneNotasClinicasEscritas(consulta)) {
    const autorEmail = (consulta.updatedBy || consulta.createdBy || '').trim().toLowerCase()
    if (autorEmail) {
      return autorEmail === user.email.trim().toLowerCase()
    }
    return false
  }

  return true
}
