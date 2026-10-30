'use server'

import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { exigirPermiso, volverAlExpediente } from '@/lib/permisos'
import { revalidatePath } from 'next/cache'

function parseNum(val: FormDataEntryValue | null, entero = true): number | null {
  if (val === null || String(val).trim() === '') return null
  const n = Number(val)
  if (Number.isNaN(n)) return null
  return entero ? Math.round(n) : n
}

export async function guardarSignosVitales(formData: FormData): Promise<void> {
  const episodeId = String(formData.get('episodeId') ?? '')
  const { userId, role, email, episode } = await exigirPermiso(episodeId, 'vitales')

  const systolic = parseNum(formData.get('systolic'))
  const diastolic = parseNum(formData.get('diastolic'))
  const heartRate = parseNum(formData.get('heartRate'))
  const respiratoryRate = parseNum(formData.get('respiratoryRate'))
  const temperature = parseNum(formData.get('temperature'), false)
  const oxygenSat = parseNum(formData.get('oxygenSat'))
  const glucose = parseNum(formData.get('glucose'))
  const painScale = parseNum(formData.get('painScale'))

  const valores = { systolic, diastolic, heartRate, respiratoryRate, temperature, oxygenSat, glucose, painScale }
  if (Object.values(valores).every((v) => v === null)) {
    volverAlExpediente(episodeId, 'Ingresa al menos un signo vital')
  }

  const nuevoRegistro = await prisma.vitalSign.create({
    data: { episodeId, ...valores, recordedBy: email },
  })

  await logAudit({
    actorId: userId,
    actorRole: role,
    action: 'create',
    entity: 'vital_sign',
    entityId: nuevoRegistro.id,
    patientId: episode.patientId,
    episodeId,
    newValue: valores,
    reason: 'Signos vitales registrados',
  })

  revalidatePath(`/dashboard/paciente/${episodeId}`)
}