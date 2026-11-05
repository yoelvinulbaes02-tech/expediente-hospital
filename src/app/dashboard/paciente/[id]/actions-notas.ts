'use server'

import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { exigirPermiso, volverAlExpediente } from '@/lib/permisos'
import { revalidatePath } from 'next/cache'

export async function guardarNota(formData: FormData): Promise<void> {
  const episodeId = String(formData.get('episodeId') ?? '')
  const { userId, role, email, episode } = await exigirPermiso(episodeId, 'registrar')

  const subjective = String(formData.get('subjective') ?? '').trim()
  const objective = String(formData.get('objective') ?? '').trim()
  const assessment = String(formData.get('assessment') ?? '').trim()
  const plan = String(formData.get('plan') ?? '').trim()

  if (!subjective || !objective || !assessment || !plan) {
    volverAlExpediente(episodeId, 'Completa los cuatro campos de la nota (S, O, A, P)')
  }

  const nuevaNota = await prisma.note.create({
    data: { episodeId, subjective, objective, assessment, plan, status: 'firmada', createdBy: email },
  })

  await logAudit({
    actorId: userId,
    actorRole: role,
    action: 'create',
    entity: 'note',
    entityId: nuevaNota.id,
    patientId: episode.patientId,
    episodeId,
    newValue: { subjective, objective, assessment, plan },
    reason: 'Nota de evolución firmada',
  })

  revalidatePath(`/dashboard/paciente/${episodeId}`)
}