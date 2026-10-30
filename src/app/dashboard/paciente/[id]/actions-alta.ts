'use server'

import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { exigirPermiso, volverAlExpediente } from '@/lib/permisos'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function cerrarExpediente(formData: FormData): Promise<void> {
  const episodeId = String(formData.get('episodeId') ?? '')
  const { userId, role, episode } = await exigirPermiso(episodeId, 'editar')

  const dischargeType = String(formData.get('dischargeType') ?? '').trim()
  const diagnosis = String(formData.get('diagnosis') ?? '').trim()
  if (!dischargeType || !diagnosis) {
    volverAlExpediente(episodeId, 'Indica el tipo de egreso y el diagnóstico de alta')
  }

  const [cerrado, tareas] = await prisma.$transaction([
    prisma.episode.updateMany({
      where: { id: episodeId, status: 'active' },
      data: { status: 'closed' },
    }),
    prisma.task.updateMany({
      where: { episodeId, status: 'pendiente' },
      data: { status: 'cancelada', cancelReason: 'Alta del paciente' },
    }),
  ])
  if (cerrado.count === 0) volverAlExpediente(episodeId, 'El expediente ya estaba cerrado')

  await logAudit({
    actorId: userId,
    actorRole: role,
    action: 'close_episode',
    entity: 'episode',
    entityId: episodeId,
    patientId: episode.patientId,
    episodeId,
    newValue: { dischargeType, diagnosis, status: 'closed', tareasCanceladas: tareas.count },
    reason: `Alta médica: ${dischargeType}. Diagnóstico: ${diagnosis}`,
  })

  revalidatePath('/dashboard')
  redirect('/dashboard')
}