'use server'

import { prisma } from '@/lib/prisma'
import { Prisma } from '@/generated/prisma'
import { logAudit } from '@/lib/audit'
import { exigirPermiso, volverAlExpediente } from '@/lib/permisos'
import { type DrainageItem } from '@/lib/cirugia-constants'
import { revalidatePath } from 'next/cache'

const CAMPOS = [
  { campo: 'systolic', etiqueta: 'Presión sistólica', min: 40, max: 300, entero: true },
  { campo: 'diastolic', etiqueta: 'Presión diastólica', min: 20, max: 200, entero: true },
  { campo: 'heartRate', etiqueta: 'Frecuencia cardíaca', min: 20, max: 300, entero: true },
  { campo: 'respiratoryRate', etiqueta: 'Frecuencia respiratoria', min: 4, max: 80, entero: true },
  { campo: 'temperature', etiqueta: 'Temperatura', min: 30, max: 45, entero: false },
  { campo: 'oxygenSat', etiqueta: 'SpO2', min: 30, max: 100, entero: true },
  { campo: 'glucose', etiqueta: 'Glucosa', min: 10, max: 1500, entero: true },
  { campo: 'weight', etiqueta: 'Peso', min: 1, max: 1000, entero: false },
  { campo: 'diuresis', etiqueta: 'Diuresis', min: 0, max: 15000, entero: true },
  { campo: 'drainage', etiqueta: 'Drenaje', min: 0, max: 15000, entero: true },
] as const

function parseDrainagesJson(raw: string, episodeId: string): DrainageItem[] | null {
  if (!raw.trim()) return null
  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return null
    const items: DrainageItem[] = []
    for (const entry of parsed) {
      if (!entry || typeof entry !== 'object') continue
      const obj = entry as Record<string, unknown>
      const name = String(obj.name ?? '').trim()
      const notes = String(obj.notes ?? '').trim() || null
      const volRaw = obj.volumeMl
      let volumeMl: number | null = null
      if (volRaw !== null && volRaw !== undefined && String(volRaw).trim() !== '') {
        const n = Number(volRaw)
        if (!Number.isFinite(n) || !Number.isInteger(n) || n < 0 || n > 15000) {
          volverAlExpediente(episodeId, 'Drenaje: el volumen debe ser un número entero entre 0 y 15000 mL')
        }
        volumeMl = n
      }
      if (name || volumeMl !== null || notes) {
        items.push({ name: name || 'Drenaje', volumeMl, notes })
      }
    }
    return items
  } catch {
    return null
  }
}

function resumirDrenajes(items: DrainageItem[]): {
  totalDrainage: number | null
  notesSummary: string | null
} {
  if (items.length === 0) return { totalDrainage: null, notesSummary: null }
  const conVol = items.filter((i) => i.volumeMl !== null)
  const totalDrainage = conVol.length > 0 ? conVol.reduce((acc, i) => acc + (i.volumeMl ?? 0), 0) : null
  const notesSummary = items
    .map((i) => {
      const parts = [i.name]
      if (i.volumeMl !== null) parts.push(`${i.volumeMl} mL`)
      if (i.notes) parts.push(`(${i.notes})`)
      return parts.join(' · ')
    })
    .join(' | ')
  return { totalDrainage, notesSummary: notesSummary || null }
}

export async function guardarSignosVitales(formData: FormData): Promise<void> {
  const episodeId = String(formData.get('episodeId') ?? '')
  const { userId, role, email, episode } = await exigirPermiso(episodeId, 'registrar')
  const weightUnit = String(formData.get('weightUnit') ?? 'kg').trim()
  const rawDrainagesJson = String(formData.get('drainagesJson') ?? '')
  const multiDrainages = formData.has('drainagesJson')
    ? parseDrainagesJson(rawDrainagesJson, episodeId)
    : null
  let drainageNotes = String(formData.get('drainageNotes') ?? '').trim() || null

  const valores: Record<string, number | null> = {}

  for (const c of CAMPOS) {
    const texto = String(formData.get(c.campo) ?? '').trim()
    if (texto === '') {
      valores[c.campo] = null
      continue
    }
    const n = Number(texto)
    if (!Number.isFinite(n)) {
      volverAlExpediente(episodeId, `${c.etiqueta}: escribe un número válido`)
    }
    if (c.entero && !Number.isInteger(n)) {
      volverAlExpediente(episodeId, `${c.etiqueta}: escribe un número entero`)
    }
    if (n < c.min || n > c.max) {
      volverAlExpediente(episodeId, `${c.etiqueta} fuera del rango válido (${c.min} a ${c.max})`)
    }
    valores[c.campo] = n
  }

  let drainage = valores.drainage
  let drainagesData: DrainageItem[] | null = null
  if (multiDrainages !== null) {
    drainagesData = multiDrainages
    const resumen = resumirDrenajes(multiDrainages)
    drainage = resumen.totalDrainage
    drainageNotes = resumen.notesSummary
    valores.drainage = drainage
  }

  const {
    systolic,
    diastolic,
    heartRate,
    respiratoryRate,
    temperature,
    oxygenSat,
    glucose,
    weight,
    diuresis,
  } = valores

  if (
    Object.values(valores).every((v) => v === null) &&
    !drainageNotes &&
    (!drainagesData || drainagesData.length === 0)
  ) {
    volverAlExpediente(episodeId, 'Escribe al menos un signo vital, diuresis o drenaje')
  }
  if ((systolic === null) !== (diastolic === null)) {
    volverAlExpediente(episodeId, 'Escribe la presión sistólica y la diastólica juntas')
  }
  if (systolic !== null && diastolic !== null && diastolic >= systolic) {
    volverAlExpediente(episodeId, 'La presión diastólica debe ser menor que la sistólica')
  }

  const nuevoRegistro = await prisma.vitalSign.create({
    data: {
      episodeId,
      systolic,
      diastolic,
      heartRate,
      respiratoryRate,
      temperature,
      oxygenSat,
      glucose,
      weight,
      weightUnit: weight ? weightUnit : 'kg',
      diuresis,
      drainage,
      drainageNotes,
      drainages: drainagesData && drainagesData.length > 0 ? drainagesData : Prisma.DbNull,
      recordedBy: email,
    },
  })

  await logAudit({
    actorId: userId,
    actorRole: role,
    action: 'create',
    entity: 'vital_sign',
    entityId: nuevoRegistro.id,
    patientId: episode.patientId,
    episodeId,
    newValue: {
      systolic,
      diastolic,
      heartRate,
      respiratoryRate,
      temperature,
      oxygenSat,
      glucose,
      weight,
      weightUnit,
      diuresis,
      drainage,
      drainageNotes,
      drainages: drainagesData,
    },
    reason: 'Registro de signos vitales, diuresis y drenajes',
  })

  revalidatePath(`/dashboard/paciente/${episodeId}`)
}

// ─── MODIFICAR TOMA DE SIGNOS VITALES / PESO / DRENAJES (CON TRAZABILIDAD) ───
export async function modificarSignosVitales(formData: FormData): Promise<void> {
  const episodeId = String(formData.get('episodeId') ?? '')
  const vitalId = String(formData.get('vitalId') ?? '')
  const { userId, role, email, episode } = await exigirPermiso(episodeId, 'registrar')
  const weightUnit = String(formData.get('weightUnit') ?? 'kg').trim()
  const tieneMultiDrenajes = formData.has('drainagesJson')
  const multiDrainages = tieneMultiDrenajes
    ? parseDrainagesJson(String(formData.get('drainagesJson') ?? ''), episodeId)
    : null
  const tieneCampoDrainageNotes = formData.has('drainageNotes')
  let drainageNotes = tieneCampoDrainageNotes
    ? String(formData.get('drainageNotes') ?? '').trim() || null
    : undefined

  const previo = await prisma.vitalSign.findFirst({
    where: { id: vitalId, episodeId },
  })
  if (!previo) volverAlExpediente(episodeId, 'Registro de signos no encontrado en este expediente')

  const valores: Record<string, number | null> = {}

  for (const c of CAMPOS) {
    // Si el formulario no incluye el campo (ej. sin peso en MI/Cirugía), conservar valor previo
    if (!formData.has(c.campo)) {
      valores[c.campo] = (previo[c.campo] as number | null) ?? null
      continue
    }
    const texto = String(formData.get(c.campo) ?? '').trim()
    if (texto === '') {
      valores[c.campo] = null
      continue
    }
    const n = Number(texto)
    if (!Number.isFinite(n)) {
      volverAlExpediente(episodeId, `${c.etiqueta}: escribe un número válido`)
    }
    if (c.entero && !Number.isInteger(n)) {
      volverAlExpediente(episodeId, `${c.etiqueta}: escribe un número entero`)
    }
    if (n < c.min || n > c.max) {
      volverAlExpediente(episodeId, `${c.etiqueta} fuera del rango válido (${c.min} a ${c.max})`)
    }
    valores[c.campo] = n
  }

  let drainagesUpdate: { drainages: Prisma.InputJsonValue | typeof Prisma.DbNull } | Record<string, never> = {}
  if (tieneMultiDrenajes) {
    const lista = multiDrainages ?? []
    const resumen = resumirDrenajes(lista)
    valores.drainage = resumen.totalDrainage
    drainageNotes = resumen.notesSummary
    drainagesUpdate = {
      drainages: lista.length > 0 ? lista : Prisma.DbNull,
    }
  }

  if ((valores.systolic === null) !== (valores.diastolic === null)) {
    volverAlExpediente(episodeId, 'Escribe la presión sistólica y la diastólica juntas')
  }
  if (valores.systolic !== null && valores.diastolic !== null && valores.diastolic >= valores.systolic) {
    volverAlExpediente(episodeId, 'La presión diastólica debe ser menor que la sistólica')
  }

  await prisma.vitalSign.update({
    where: { id: vitalId },
    data: {
      ...valores,
      weightUnit: valores.weight ? weightUnit : previo.weightUnit,
      ...(drainageNotes !== undefined ? { drainageNotes } : {}),
      ...drainagesUpdate,
      updatedBy: email,
      updatedAt: new Date(),
    },
  })

  await logAudit({
    actorId: userId,
    actorRole: role,
    action: 'update',
    entity: 'vital_sign',
    entityId: vitalId,
    patientId: episode.patientId,
    episodeId,
    oldValue: previo,
    newValue: {
      ...valores,
      ...(drainageNotes !== undefined ? { drainageNotes } : {}),
      ...(tieneMultiDrenajes ? { drainages: multiDrainages } : {}),
      updatedBy: email,
    },
    reason: 'Corrección / modificación de toma de signos vitales',
  })

  revalidatePath(`/dashboard/paciente/${episodeId}`)
}