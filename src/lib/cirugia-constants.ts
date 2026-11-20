export const CATEGORIAS_DISPOSITIVOS_CIRUGIA = [
  { key: 'CVC', label: 'Catéter venoso central' },
  { key: 'HD_TEMP', label: 'Catéter temporal de hemodiálisis' },
  { key: 'HD_PERM', label: 'Catéter permanente de hemodiálisis' },
  { key: 'YUGULAR', label: 'Acceso yugular' },
  { key: 'SUBCLAVIO', label: 'Acceso subclavio' },
  { key: 'FEMORAL', label: 'Acceso femoral' },
  { key: 'DRENAJE_PLEURAL', label: 'Catéter drenaje pleural' },
  { key: 'SPBSA', label: 'SPBSA' },
] as const

export type CategoriaDispositivoCirugia = (typeof CATEGORIAS_DISPOSITIVOS_CIRUGIA)[number]['key']

export const ESPECIALIDADES_QUIRURGICAS = [
  'Cirugía General',
  'Traumatología y Ortopedia',
  'Neurocirugía',
  'Urología',
  'Cirugía Cardiovascular',
  'Cirugía Torácica',
  'Cirugía Pediátrica',
  'Ginecología y Obstetricia',
  'Cirugía Plástica y Reconstructiva',
  'Otorrinolaringología',
  'Oftalmología',
  'Otra especialidad quirúrgica',
] as const

export const ESTADOS_CIRUGIA = [
  { value: 'pendiente', label: 'Pendiente', badge: 'bg-amber-100 text-amber-900 border-amber-200' },
  { value: 'en_quirofano', label: 'En quirófano', badge: 'bg-blue-100 text-blue-900 border-blue-200' },
  { value: 'realizada', label: 'Realizada', badge: 'bg-emerald-100 text-emerald-900 border-emerald-200' },
  { value: 'suspendida', label: 'Suspendida', badge: 'bg-red-100 text-red-900 border-red-200' },
] as const

export function calcularImc(
  weight: number | null | undefined,
  unit: string | null | undefined,
  heightCm: number | null | undefined
): {
  imc: number | null
  pesoKg: number | null
  categoria: string
  clase: string
} {
  if (!weight || weight <= 0 || !heightCm || heightCm <= 0) {
    return {
      imc: null,
      pesoKg: weight && weight > 0 ? (unit === 'lb' ? weight * 0.453592 : weight) : null,
      categoria: 'Sin calcular',
      clase: 'bg-slate-100 text-slate-600 border-slate-200',
    }
  }

  const pesoKg = unit === 'lb' ? weight * 0.45359237 : weight
  const tallaM = heightCm / 100
  const imcRaw = pesoKg / (tallaM * tallaM)
  const imc = Math.round(imcRaw * 10) / 10

  if (imc < 18.5) {
    return { imc, pesoKg, categoria: 'Bajo peso', clase: 'bg-sky-100 text-sky-900 border-sky-200' }
  }
  if (imc < 25) {
    return { imc, pesoKg, categoria: 'Normal', clase: 'bg-emerald-100 text-emerald-900 border-emerald-200' }
  }
  if (imc < 30) {
    return { imc, pesoKg, categoria: 'Sobrepeso', clase: 'bg-amber-100 text-amber-900 border-amber-200' }
  }
  if (imc < 35) {
    return { imc, pesoKg, categoria: 'Obesidad I', clase: 'bg-orange-100 text-orange-900 border-orange-200' }
  }
  if (imc < 40) {
    return { imc, pesoKg, categoria: 'Obesidad II', clase: 'bg-red-100 text-red-900 border-red-200' }
  }
  return { imc, pesoKg, categoria: 'Obesidad III', clase: 'bg-rose-200 text-rose-950 border-rose-300' }
}

export function calcularDiasAntibiotico(
  startedAt: Date | string,
  stoppedAt?: Date | string | null
): number {
  const inicio = new Date(startedAt).getTime()
  const fin = stoppedAt ? new Date(stoppedAt).getTime() : Date.now()
  if (Number.isNaN(inicio) || Number.isNaN(fin)) return 1
  const diffDias = Math.floor(Math.max(0, fin - inicio) / (1000 * 60 * 60 * 24)) + 1
  return Math.max(1, diffDias)
}

export type TeamServicioData = {
  ma: string
  r4: string
  r3: string
  r2: string
  r1: string
  autoMode: boolean
  updatedBy: string | null
  updatedAt: string | null
}

export function resolverTeamAutomatico({
  usuarios,
  episodios,
}: {
  usuarios: { fullName: string; role: string }[]
  episodios: { admittingDoctor: string | null; attendingDoctor: string | null }[]
}): { ma: string; r4: string; r3: string; r2: string; r1: string } {
  const detectarNivel = (texto: string): 'MA' | 'R4' | 'R3' | 'R2' | 'R1' | null => {
    const t = texto.toUpperCase()
    if (/\bR4\b|\(R4\)/.test(t)) return 'R4'
    if (/\bR3\b|\(R3\)/.test(t)) return 'R3'
    if (/\bR2\b|\(R2\)/.test(t)) return 'R2'
    if (/\bR1\b|\(R1\)/.test(t)) return 'R1'
    if (/\bMA\b|\(MA\)|ADJUNTO/.test(t)) return 'MA'
    return null
  }

  let ma = ''
  let r4 = ''
  let r3 = ''
  let r2 = ''
  let r1 = ''

  const limpiarEtiqueta = (s: string) => s.trim()

  // 1. Buscar primero en usuarios activos con etiqueta explícita en su nombre
  for (const u of usuarios) {
    const nivel = detectarNivel(u.fullName)
    if (nivel === 'MA' && !ma) ma = limpiarEtiqueta(u.fullName)
    else if (nivel === 'R4' && !r4) r4 = limpiarEtiqueta(u.fullName)
    else if (nivel === 'R3' && !r3) r3 = limpiarEtiqueta(u.fullName)
    else if (nivel === 'R2' && !r2) r2 = limpiarEtiqueta(u.fullName)
    else if (nivel === 'R1' && !r1) r1 = limpiarEtiqueta(u.fullName)
  }

  // 2. Completar desde episodios activos si se registraron médicos con su nivel
  for (const ep of episodios) {
    const candidatos = [ep.admittingDoctor, ep.attendingDoctor].filter(Boolean) as string[]
    for (const c of candidatos) {
      const nivel = detectarNivel(c)
      if (nivel === 'MA' && !ma) ma = limpiarEtiqueta(c)
      else if (nivel === 'R4' && !r4) r4 = limpiarEtiqueta(c)
      else if (nivel === 'R3' && !r3) r3 = limpiarEtiqueta(c)
      else if (nivel === 'R2' && !r2) r2 = limpiarEtiqueta(c)
      else if (nivel === 'R1' && !r1) r1 = limpiarEtiqueta(c)
    }
  }

  // 3. Si aún falta MA, usar primer DOCTOR activo
  if (!ma) {
    const doc = usuarios.find((u) => u.role === 'DOCTOR')
    if (doc) ma = doc.fullName
  }

  // 4. Si faltan residentes R4..R1, asignar residentes disponibles sin duplicar nombres
  const usados = new Set([ma, r4, r3, r2, r1].filter(Boolean))
  const residentesDisponibles = usuarios
    .filter((u) => u.role === 'RESIDENT' && !usados.has(u.fullName))
    .map((u) => u.fullName)

  for (const nombre of residentesDisponibles) {
    if (!r4) {
      r4 = nombre
      usados.add(nombre)
    } else if (!r3) {
      r3 = nombre
      usados.add(nombre)
    } else if (!r2) {
      r2 = nombre
      usados.add(nombre)
    } else if (!r1) {
      r1 = nombre
      usados.add(nombre)
    }
  }

  return { ma, r4, r3, r2, r1 }
}
