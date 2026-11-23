export const OPCIONES_FRECUENCIA_ATB_HD = [
  { codigo: 'c/48h', label: 'Cada 48 horas (c/48h)', intervalHours: 48 },
  { codigo: 'Post-HD', label: 'Post-Hemodiálisis (Post-HD · ciclo ~48h)', intervalHours: 48 },
  { codigo: 'c/24h', label: 'Cada 24 horas (c/24h)', intervalHours: 24 },
  { codigo: 'c/12h', label: 'Cada 12 horas (c/12h)', intervalHours: 12 },
  { codigo: 'c/8h', label: 'Cada 8 horas (c/8h)', intervalHours: 8 },
  { codigo: 'c/72h', label: 'Cada 72 horas (c/72h)', intervalHours: 72 },
  { codigo: 'Dosis única', label: 'Dosis única / Carga inicial', intervalHours: null },
] as const

export type InfoFrecuenciaAtb = {
  codigo: string
  etiqueta: string
  intervalHours: number | null
  es48Horas: boolean
}

export function parsearFrecuenciaAtb(
  shiftLabel?: string | null,
  title?: string | null
): InfoFrecuenciaAtb {
  const fuente = `${shiftLabel ?? ''} ${title ?? ''}`.trim()
  const lower = fuente.toLowerCase()

  if (!fuente) {
    return {
      codigo: 'Post-HD',
      etiqueta: 'Post-HD (ciclo ~48h)',
      intervalHours: 48,
      es48Horas: true,
    }
  }

  if (/\b(c\/?\s*48|cada\s*48|48\s*(h|hr|hrs|hora|horas))\b/i.test(lower)) {
    return {
      codigo: 'c/48h',
      etiqueta: 'Cada 48 horas',
      intervalHours: 48,
      es48Horas: true,
    }
  }

  if (/\b(c\/?\s*72|cada\s*72|72\s*(h|hr|hrs|hora|horas))\b/i.test(lower)) {
    return {
      codigo: 'c/72h',
      etiqueta: 'Cada 72 horas',
      intervalHours: 72,
      es48Horas: false,
    }
  }

  if (/\b(c\/?\s*24|cada\s*24|24\s*(h|hr|hrs|hora|horas))\b/i.test(lower)) {
    return {
      codigo: 'c/24h',
      etiqueta: 'Cada 24 horas',
      intervalHours: 24,
      es48Horas: false,
    }
  }

  if (/\b(c\/?\s*12|cada\s*12|12\s*(h|hr|hrs|hora|horas))\b/i.test(lower)) {
    return {
      codigo: 'c/12h',
      etiqueta: 'Cada 12 horas',
      intervalHours: 12,
      es48Horas: false,
    }
  }

  if (/\b(c\/?\s*8|cada\s*8|8\s*(h|hr|hrs|hora|horas))\b/i.test(lower)) {
    return {
      codigo: 'c/8h',
      etiqueta: 'Cada 8 horas',
      intervalHours: 8,
      es48Horas: false,
    }
  }

  if (/\b(c\/?\s*6|cada\s*6|6\s*(h|hr|hrs|hora|horas))\b/i.test(lower)) {
    return {
      codigo: 'c/6h',
      etiqueta: 'Cada 6 horas',
      intervalHours: 6,
      es48Horas: false,
    }
  }

  if (/post[-\s]?hd|pos[-\s]?hd|posthd|poshd/i.test(lower)) {
    return {
      codigo: 'Post-HD',
      etiqueta: 'Post-Hemodiálisis (~48h)',
      intervalHours: 48,
      es48Horas: true,
    }
  }

  if (/dosis\s*única|dosis\s*unica|stat/i.test(lower)) {
    return {
      codigo: 'Dosis única',
      etiqueta: 'Dosis única',
      intervalHours: null,
      es48Horas: false,
    }
  }

  const customMatch = lower.match(/(?:c\/?\s*|cada\s*)(\d{1,3})\s*(?:h|hr|hrs|horas?)\b/i)
  if (customMatch) {
    const hrs = Math.max(1, Math.min(240, parseInt(customMatch[1], 10)))
    return {
      codigo: `c/${hrs}h`,
      etiqueta: `Cada ${hrs} horas`,
      intervalHours: hrs,
      es48Horas: hrs === 48,
    }
  }

  const limpio = (shiftLabel ?? '').trim() || 'Esquema HD'
  return {
    codigo: limpio,
    etiqueta: limpio,
    intervalHours: null,
    es48Horas: false,
  }
}

export function parsearEsquemaDosis(title: string): {
  dosisInicial: string
  dosisIntervalo: string | null
} {
  const limpio = title.trim()
  // Reconoce separadores como "· Luego ...", ", luego ...", "→ ..."
  const match = limpio.match(/^(.*?)\s*(?:·\s*luego\b|,\s*luego\b|→\s*(?:luego\s*)?)\s*(.+)$/i)
  if (match && match[1].trim() && match[2].trim()) {
    return {
      dosisInicial: match[1].trim(),
      dosisIntervalo: match[2].trim(),
    }
  }
  return {
    dosisInicial: limpio,
    dosisIntervalo: null,
  }
}

export function componerTituloAtb(dosisPrincipal: string, dosisIntervalo?: string | null): string {
  const base = dosisPrincipal.trim()
  const mant = (dosisIntervalo ?? '').trim()
  if (!mant) return base
  if (base.toLowerCase().includes(mant.toLowerCase())) return base
  return `${base} · Luego ${mant}`
}

export function extraerNombreBaseAtb(dosisInicial: string): string {
  const tokens = dosisInicial.trim().split(/\s+/)
  return tokens[0] ?? ''
}

export function calcularConteoAntibiotico({
  eventDateIso,
  durationDays,
  shiftLabel,
  title,
  lastCheckAtIso,
  ahoraIso,
  dosisRegistradas,
}: {
  eventDateIso: string | null
  durationDays: number | null
  shiftLabel: string | null
  title: string
  lastCheckAtIso: string | null
  ahoraIso: string
  dosisRegistradas: number
}) {
  const freq = parsearFrecuenciaAtb(shiftLabel, title)
  const esquema = parsearEsquemaDosis(title)

  const ahoraMs = new Date(ahoraIso).getTime()
  const inicioMs = eventDateIso ? new Date(eventDateIso).getTime() : NaN
  const ultimoCheckMs = lastCheckAtIso ? new Date(lastCheckAtIso).getTime() : NaN

  const diasTranscurridos =
    !Number.isNaN(inicioMs) && !Number.isNaN(ahoraMs)
      ? Math.max(1, Math.floor(Math.max(0, ahoraMs - inicioMs) / (1000 * 60 * 60 * 24)) + 1)
      : null

  const horasDesdeInicio =
    !Number.isNaN(inicioMs) && !Number.isNaN(ahoraMs)
      ? Math.max(0, (ahoraMs - inicioMs) / (1000 * 60 * 60))
      : 0

  const refUltimaMs = !Number.isNaN(ultimoCheckMs) ? ultimoCheckMs : inicioMs
  const horasDesdeUltima =
    !Number.isNaN(refUltimaMs) && !Number.isNaN(ahoraMs)
      ? Math.max(0, (ahoraMs - refUltimaMs) / (1000 * 60 * 60))
      : 0

  let dosisSegunFrecuencia: number | null = null
  let totalDosisPlanificadas: number | null = null
  let tocaNuevaDosis = false
  let horasRestantesProxima: number | null = null
  const horasTranscurridasDesdeUltima: number | null =
    !Number.isNaN(refUltimaMs) && !Number.isNaN(ahoraMs) ? Math.floor(horasDesdeUltima) : null

  if (freq.intervalHours) {
    dosisSegunFrecuencia = Math.max(1, Math.floor(horasDesdeInicio / freq.intervalHours) + 1)
    if (durationDays && durationDays > 0) {
      totalDosisPlanificadas = Math.max(1, Math.ceil((durationDays * 24) / freq.intervalHours))
    }

    if (!lastCheckAtIso) {
      // Aún no se registra dosis aplicada manualmente
      tocaNuevaDosis = true
      horasRestantesProxima = 0
    } else if (horasDesdeUltima >= freq.intervalHours) {
      tocaNuevaDosis = true
      horasRestantesProxima = 0
    } else {
      tocaNuevaDosis = false
      horasRestantesProxima = Math.max(1, Math.ceil(freq.intervalHours - horasDesdeUltima))
    }
  }

  // Si es esquema c/48h (o Post-HD) con dosis de inicio + dosis de mantenimiento,
  // a partir de la 1.ª dosis registrada o al cumplirse las 48h la dosis activa cambia a la del intervalo.
  const enFaseIntervalo =
    Boolean(esquema.dosisIntervalo) &&
    (dosisRegistradas >= 1 ||
      (freq.intervalHours !== null && horasDesdeInicio >= freq.intervalHours))

  const dosisVigente = enFaseIntervalo && esquema.dosisIntervalo
    ? esquema.dosisIntervalo
    : esquema.dosisInicial

  return {
    freq,
    esquema,
    diasTranscurridos,
    dosisSegunFrecuencia,
    totalDosisPlanificadas,
    dosisRegistradas,
    tocaNuevaDosis,
    horasRestantesProxima,
    horasTranscurridasDesdeUltima,
    enFaseIntervalo,
    dosisVigente,
  }
}
