'use server'

import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { exigirPermiso, volverAlExpediente } from '@/lib/permisos'
import { revalidatePath } from 'next/cache'

export async function guardarNota(formData: FormData): Promise<void> {
  const episodeId = String(formData.get('episodeId') ?? '')
  const { userId, role, email, episode } = await exigirPermiso(episodeId, 'registrar')

  const content = String(formData.get('content') ?? '').trim()

  if (!content || content.length < 5) {
    volverAlExpediente(episodeId, 'Por favor redacta la evolución clínica del paciente')
  }

  const nuevaNota = await prisma.note.create({
    data: {
      episodeId,
      content,
      status: 'firmada',
      createdBy: email,
    },
  })

  await logAudit({
    actorId: userId,
    actorRole: role,
    action: 'create',
    entity: 'note',
    entityId: nuevaNota.id,
    patientId: episode.patientId,
    episodeId,
    newValue: { evolucion: content },
    reason: 'Nota de evolución clínica firmada',
  })

  revalidatePath(`/dashboard/paciente/${episodeId}`)
}