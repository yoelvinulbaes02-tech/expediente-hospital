export type EmergenciaGuardiaMode = 'auto' | 'manual'

export type EmergenciaGuardiaAutoStats = {
  totalVistos: number
  triage: number
  emergencias: number
  ingresosTotales: number
  medicinaInterna: number
  cirugiaCount: number
  ortopediaCount: number
  neurocirugia: number
  enviadosSala: number
  enviadoUci: number
  traslado: number
  referimientos: number
  fallecido: number
  pacientesIngresados: number
  pacientesTraumaShock: number
}

export type EmergenciaGuardiaData = {
  mode: EmergenciaGuardiaMode
  fecha: string
  // Equipo / Team de Servicio
  teamServicio: string
  ortopedia: string
  cirugia: string
  residentesEmergenciologia: string
  residentesMaxilofacial: string
  residentesMedicinaInterna: string
  medicosAsistentes: string
  ma: string
  ri: string
  mg: string
  // Totales
  totalVistos: number
  triage: number
  emergencias: number
  ingresosTotales: number
  // Especialidades
  medicinaInterna: number
  cirugiaCount: number
  ortopediaCount: number
  neurocirugia: number
  // Destinos / Movimientos
  enviadosSala: number
  enviadoUci: number
  traslado: number
  referimientos: number
  fallecido: number
  traidoFallecido: number
  // Procedimientos realizados
  procEkg: number
  procSondaPleurostomia: number
  procTrombolisis: number
  procToracocentesis: number
  procParacentesis: number
  procRcp: number
  procDesfibrilacion: number
  procViaCentral: number
  procSondaVesical: number
  procIntubacion: number
  procCardioversion: number
  // Estado del área
  pacientesIngresados: number
  pacientesTraumaShock: number
  camasDisponibles: number
  situacionesAdministrativas: string
  camillasRetenidas: number
  // Metadatos
  updatedBy: string | null
  updatedByRole: string | null
  updatedAt: string | null
}

export const DEFAULT_EMERGENCIA_GUARDIA: EmergenciaGuardiaData = {
  mode: 'auto',
  fecha: '',
  teamServicio: '',
  ortopedia: '',
  cirugia: '',
  residentesEmergenciologia: '',
  residentesMaxilofacial: '',
  residentesMedicinaInterna: '',
  medicosAsistentes: '',
  ma: '',
  ri: '',
  mg: '',
  totalVistos: 0,
  triage: 0,
  emergencias: 0,
  ingresosTotales: 0,
  medicinaInterna: 0,
  cirugiaCount: 0,
  ortopediaCount: 0,
  neurocirugia: 0,
  enviadosSala: 0,
  enviadoUci: 0,
  traslado: 0,
  referimientos: 0,
  fallecido: 0,
  traidoFallecido: 0,
  procEkg: 0,
  procSondaPleurostomia: 0,
  procTrombolisis: 0,
  procToracocentesis: 0,
  procParacentesis: 0,
  procRcp: 0,
  procDesfibrilacion: 0,
  procViaCentral: 0,
  procSondaVesical: 0,
  procIntubacion: 0,
  procCardioversion: 0,
  pacientesIngresados: 0,
  pacientesTraumaShock: 0,
  camasDisponibles: 0,
  situacionesAdministrativas: '0',
  camillasRetenidas: 0,
  updatedBy: null,
  updatedByRole: null,
  updatedAt: null,
}

function asStr(v: unknown, fallback = ''): string {
  return typeof v === 'string' ? v : fallback
}

function asInt(v: unknown, fallback = 0): number {
  if (typeof v === 'number' && Number.isFinite(v)) return Math.max(0, Math.round(v))
  if (typeof v === 'string' && v.trim() !== '') {
    const n = parseInt(v.trim(), 10)
    if (Number.isFinite(n)) return Math.max(0, n)
  }
  return fallback
}

export function extraerEmergenciaGuardia(extra: unknown): EmergenciaGuardiaData {
  if (!extra || typeof extra !== 'object' || Array.isArray(extra)) {
    return { ...DEFAULT_EMERGENCIA_GUARDIA }
  }
  const obj = extra as Record<string, unknown>
  const g = obj.emergenciaGuardia
  if (!g || typeof g !== 'object' || Array.isArray(g)) {
    return { ...DEFAULT_EMERGENCIA_GUARDIA }
  }
  const raw = g as Record<string, unknown>
  return {
    mode: raw.mode === 'manual' ? 'manual' : 'auto',
    fecha: asStr(raw.fecha),
    teamServicio: asStr(raw.teamServicio),
    ortopedia: asStr(raw.ortopedia),
    cirugia: asStr(raw.cirugia),
    residentesEmergenciologia: asStr(raw.residentesEmergenciologia),
    residentesMaxilofacial: asStr(raw.residentesMaxilofacial),
    residentesMedicinaInterna: asStr(raw.residentesMedicinaInterna),
    medicosAsistentes: asStr(raw.medicosAsistentes),
    ma: asStr(raw.ma),
    ri: asStr(raw.ri),
    mg: asStr(raw.mg),
    totalVistos: asInt(raw.totalVistos),
    triage: asInt(raw.triage),
    emergencias: asInt(raw.emergencias),
    ingresosTotales: asInt(raw.ingresosTotales),
    medicinaInterna: asInt(raw.medicinaInterna),
    cirugiaCount: asInt(raw.cirugiaCount),
    ortopediaCount: asInt(raw.ortopediaCount),
    neurocirugia: asInt(raw.neurocirugia),
    enviadosSala: asInt(raw.enviadosSala),
    enviadoUci: asInt(raw.enviadoUci),
    traslado: asInt(raw.traslado),
    referimientos: asInt(raw.referimientos),
    fallecido: asInt(raw.fallecido),
    traidoFallecido: asInt(raw.traidoFallecido),
    procEkg: asInt(raw.procEkg),
    procSondaPleurostomia: asInt(raw.procSondaPleurostomia),
    procTrombolisis: asInt(raw.procTrombolisis),
    procToracocentesis: asInt(raw.procToracocentesis),
    procParacentesis: asInt(raw.procParacentesis),
    procRcp: asInt(raw.procRcp),
    procDesfibrilacion: asInt(raw.procDesfibrilacion),
    procViaCentral: asInt(raw.procViaCentral),
    procSondaVesical: asInt(raw.procSondaVesical),
    procIntubacion: asInt(raw.procIntubacion),
    procCardioversion: asInt(raw.procCardioversion),
    pacientesIngresados: asInt(raw.pacientesIngresados),
    pacientesTraumaShock: asInt(raw.pacientesTraumaShock),
    camasDisponibles: asInt(raw.camasDisponibles),
    situacionesAdministrativas: asStr(raw.situacionesAdministrativas, '0'),
    camillasRetenidas: asInt(raw.camillasRetenidas),
    updatedBy: typeof raw.updatedBy === 'string' ? raw.updatedBy : null,
    updatedByRole: typeof raw.updatedByRole === 'string' ? raw.updatedByRole : null,
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : null,
  }
}

export const NIVELES_TRIAJE_EMERGENCIA = [
  'Trauma Shock',
  'Emergencia',
  'Urgencia',
  'Prioritario',
  'Triage / Menor',
] as const

export const ESPECIALIDADES_EMERGENCIA = [
  'Medicina Interna',
  'Cirugía',
  'Ortopedia',
  'Neurocirugía',
  'Ginecología y Obstetricia',
  'Urología',
  'Maxilofacial',
  'Emergenciología',
  'UCI / Trauma Shock',
  'Pediatría',
  'Otra',
] as const

export const ESTADOS_CLINICOS_EMERGENCIA = [
  'En observación',
  'Estable',
  'Delicado',
  'Crítico',
  'Trauma Shock',
  'Pendiente sala',
  'Pendiente traslado',
] as const
