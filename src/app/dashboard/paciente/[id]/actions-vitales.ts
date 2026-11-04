'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { logAudit } from '@/lib/audit'
import { revalidatePath } from 'next/cache'

export async function guardarSignosVitales(formData: FormData) {
  const session = await auth()
  if (!session) throw new Error('No autorizado')

  const episodeId = formData.get('episodeId') as string
  
  const parseNum = (val: FormDataEntryValue | null) => val ? Number(val) : null

  const systolic = parseNum(formData.get('systolic'))
  const diastolic = parseNum(formData.get('diastolic'))
  const heartRate = parseNum(formData.get('heartRate'))
  const respiratoryRate = parseNum(formData.get('respiratoryRate'))
  const temperature = parseNum(formData.get('temperature'))
  const oxygenSat = parseNum(formData.get('oxygenSat'))
  const glucose = parseNum(formData.get('glucose'))
  const painScale = parseNum(formData.get('painScale')) // <-- NUEVO

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
      recordedBy: session.user?.email || 'desconocido'
    }
  })

  await logAudit({
    actorId: session.user?.id as string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    actorRole: (session.user as any)?.role,
    action: 'create',
    entity: 'vital_sign',
    entityId: nuevoRegistro.id,
    episodeId,
    newValue: { systolic, diastolic, heartRate, temperature, oxygenSat, glucose, painScale },
  })

  revalidatePath(`/dashboard/paciente/${episodeId}`)
}