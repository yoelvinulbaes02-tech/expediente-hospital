'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { logAudit } from '@/lib/audit'
import { revalidatePath } from 'next/cache'

export async function guardarNota(formData: FormData) {
  const session = await auth()
  if (!session) throw new Error('No autorizado')

  const episodeId = formData.get('episodeId') as string
  const subjective = formData.get('subjective') as string
  const objective = formData.get('objective') as string
  const assessment = formData.get('assessment') as string
  const plan = formData.get('plan') as string

  const nuevaNota = await prisma.note.create({
    data: {
      episodeId,
      subjective,
      objective,
      assessment,
      plan,
      status: 'firmada',
      createdBy: session.user?.email || 'desconocido',
    }
  })

  await logAudit({
    actorId: session.user?.id as string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    actorRole: (session.user as any)?.role,
    action: 'create',
    entity: 'note',
    entityId: nuevaNota.id,
    episodeId,
    newValue: { subjective, objective, assessment, plan },
    reason: 'Nota de evolución firmada',
  })

  revalidatePath(`/dashboard/paciente/${episodeId}`)
}