export const CATEGORIAS_DISPOSITIVOS_ORTOPEDIA = [
  { key: 'FERULA', label: 'Férula de yeso / fibra' },
  { key: 'YESO_CIRCULAR', label: 'Yeso circular' },
  { key: 'TRACCION_ESQUELETICA', label: 'Tracción esquelética' },
  { key: 'TRACCION_CUTANEA', label: 'Tracción cutánea' },
  { key: 'FIJADOR_EXTERNO', label: 'Fijador externo (pines/clavos)' },
  { key: 'INMOVILIZADOR_CABESTRILLO', label: 'Inmovilizador / Cabestrillo' },
  { key: 'ORTESIS_BOTA', label: 'Rodillera / Bota Walker / Órtesis' },
  { key: 'COLLARIN_CORSE', label: 'Collarín cervical / Corsé' },
] as const

export type CategoriaDispositivoOrtopedia =
  (typeof CATEGORIAS_DISPOSITIVOS_ORTOPEDIA)[number]['key']

export const SUBESPECIALIDADES_ORTOPEDIA = [
  'Ortopedia y Traumatología General',
  'Trauma Ortopédico (Fracturas)',
  'Cadera y Rodilla (Artroplastia)',
  'Columna Vertebral',
  'Hombro y Codo',
  'Mano y Muñeca',
  'Pie y Tobillo',
  'Ortopedia Pediátrica',
  'Medicina Deportiva / Artroscopia',
  'Reconstrucción Ósea / Fijación Externa',
] as const

export const ESTADOS_ORTOPEDIA = [
  {
    value: 'pendiente',
    label: 'Pendiente de Qx',
    badge: 'bg-amber-100 text-amber-900 border-amber-200',
  },
  {
    value: 'en_quirofano',
    label: 'En quirófano',
    badge: 'bg-blue-100 text-blue-900 border-blue-200',
  },
  {
    value: 'realizada',
    label: 'Intervención realizada',
    badge: 'bg-emerald-100 text-emerald-900 border-emerald-200',
  },
  {
    value: 'manejo_conservador',
    label: 'Manejo conservador',
    badge: 'bg-teal-100 text-teal-900 border-teal-200',
  },
  {
    value: 'suspendida',
    label: 'Suspendida',
    badge: 'bg-red-100 text-red-900 border-red-200',
  },
] as const

export const LATERALIDADES_ORTOPEDIA = [
  'Derecha',
  'Izquierda',
  'Bilateral',
  'Axial / Columna',
  'No aplica',
] as const

export const PAUTAS_CARGA_ORTOPEDIA = [
  'Sin apoyo (Descarga total)',
  'Carga parcial (con muletas / andador)',
  'Carga progresiva según tolerancia',
  'Apoyo total / Deambulación asistida',
  'Reposo en cama / Elevación de extremidad',
] as const

export const OPCIONES_LLENADO_CAPILAR = [
  '< 2 seg (Normal)',
  '>= 2 seg (Retardado)',
] as const

export const OPCIONES_PULSOS_DISTALES = [
  'Presentes y simétricos',
  'Disminuidos',
  'Ausentes / Solo Doppler',
] as const

export const OPCIONES_SENSIBILIDAD_DISTAL = [
  'Conservada',
  'Hipoestesia / Parestesias',
  'Anestesia distal',
] as const

export const OPCIONES_MOTILIDAD_DISTAL = [
  'Conservada',
  'Limitada por dolor',
  'Déficit motor / Paresia',
] as const

export const PRESETS_DRENAJES_ORTOPEDIA = [
  'Hemovac',
  'Drenaje aspirativo',
  'Drenaje subfascial',
  'Jackson-Pratt',
  'Penrose',
  'VAC / Terapia negativa',
] as const

export function calcularDiasPostQx(
  surgeryDate: Date | string | null | undefined,
  surgeryStatus?: string | null
): number | null {
  if (!surgeryDate || surgeryStatus !== 'realizada') return null
  const qxMs = new Date(surgeryDate).getTime()
  if (Number.isNaN(qxMs)) return null
  const diff = Date.now() - qxMs
  if (diff < 0) return null
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}
