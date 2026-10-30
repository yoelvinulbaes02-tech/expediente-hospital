'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { logAudit } from '@/lib/audit'
import { revalidatePath } from 'next/cache'

export async function agregarAlergia(formData: FormData) {
  const session = await auth()
  if (!session) throw new Error('No autorizado')

  const episodeId = formData.get('episodeId') as string
  const patientId = formData.get('patientId') as string
  const allergen = formData.get('allergen') as string
  const type = formData.get('type') as string
  const severity = formData.get('severity') as string
  const reaction = formData.get('reaction') as string

  await prisma.allergy.deleteMany({
    where: { 
      episodeId,
      status: { in: ['sin_alergias', 'no_evaluada'] }
    }
  })

  await prisma.allergy.create({
    data: {
      patientId,
      episodeId,
      allergen,
      type,
      severity,
      reaction,
      status: 'evaluada',
      createdBy: session.user?.email || 'desconocido'
    }
  })

  await logAudit({
    actorId: session.user?.id as string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    actorRole: (session.user as any)?.role,
    action: 'create',
    entity: 'allergy',
    patientId,
    episodeId,
    newValue: { allergen, type, severity, reaction },
    reason: 'Registro de nueva alergia en expediente'
  })

  revalidatePath(`/dashboard/paciente/${episodeId}`)
}