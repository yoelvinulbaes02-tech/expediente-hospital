'use server'

import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { exigirPermiso, volverAlExpediente } from '@/lib/permisos'
import { revalidatePath } from 'next/cache'

const CAMPOS = [
  { campo: 'systolic', etiqueta: 'Presión sistólica', min: 40, max: 300, entero: true },
  { campo: 'diastolic', etiqueta: 'Presión diastólica', min: 20, max: 200, entero: true },
  { campo: 'heartRate', etiqueta: 'Frecuencia cardíaca', min: 20, max: 300, entero: true },
  { campo: 'respiratoryRate', etiqueta: 'Frecuencia respiratoria', min: 4, max: 80, entero: true },
  { campo: 'temperature', etiqueta: 'Temperatura', min: 30, max: 45, entero: false },
  { campo: 'oxygenSat', etiqueta: 'SpO2', min: 30, max: 100, entero: true },
  { campo: 'glucose', etiqueta: 'Glucosa', min: 10, max: 1500, entero: true },
  { campo: 'painScale', etiqueta: 'Dolor', min: 0, max: 10, entero: true },
  { campo: 'diuresis', etiqueta: 'Diuresis', min: 0, max: 15000, entero: true },
] as const

export async function guardarSignosVitales(formData: FormData): Promise<void> {
  const episodeId = String(formData.get('episodeId') ?? '')
  const { userId, role, email, episode } = await exigirPermiso(episodeId, 'registrar')

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

  const { systolic, diastolic, heartRate, respiratoryRate, temperature, oxygenSat, glucose, painScale, diuresis } = valores

  if (Object.values(valores).every((v) => v === null)) {
    volverAlExpediente(episodeId, 'Escribe al menos un signo vital o diuresis')
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
      painScale,
      diuresis,
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
    newValue: { systolic, diastolic, heartRate, respiratoryRate, temperature, oxygenSat, glucose, painScale, diuresis },
    reason: 'Registro de signos vitales y diuresis',
  })

  revalidatePath(`/dashboard/paciente/${episodeId}`)
}