'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { logAudit } from '@/lib/audit'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function cerrarExpediente(formData: FormData) {
  const session = await auth()
  if (!session) throw new Error('No autorizado')

  const episodeId = formData.get('episodeId') as string
  const dischargeType = formData.get('dischargeType') as string
  const diagnosis = formData.get('diagnosis') as string

  const episode = await prisma.episode.update({
    where: { id: episodeId },
    data: { status: 'closed' }
  })

  await logAudit({
    actorId: session.user?.id as string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    actorRole: (session.user as any)?.role,
    action: 'close_episode',
    entity: 'episode',
    entityId: episodeId,
    patientId: episode.patientId,
    episodeId: episodeId,
    newValue: { dischargeType, diagnosis, status: 'closed' },
    reason: `Alta médica: ${dischargeType}. Diagnóstico: ${diagnosis}`,
  })

  revalidatePath('/dashboard')
  redirect('/dashboard')
}