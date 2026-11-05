'use server'

import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { exigirPermiso, volverAlExpediente } from '@/lib/permisos'
import { revalidatePath } from 'next/cache'

export async function agregarAlergia(formData: FormData): Promise<void> {
  const episodeId = String(formData.get('episodeId') ?? '')
  const { userId, role, email, episode } = await exigirPermiso(episodeId, 'registrar')

  const allergen = String(formData.get('allergen') ?? '').trim()
  const type = String(formData.get('type') ?? 'otro')
  const severity = String(formData.get('severity') ?? '')
  const reaction = String(formData.get('reaction') ?? '').trim()

  if (!allergen) volverAlExpediente(episodeId, 'Escribe el alérgeno')
  if (!['leve', 'moderada', 'grave'].includes(severity)) {
    volverAlExpediente(episodeId, 'Selecciona la gravedad de la alergia')
  }

  await prisma.$transaction([
    prisma.allergy.deleteMany({
      where: { episodeId, status: { in: ['sin_alergias', 'no_evaluada'] } },
    }),
    prisma.allergy.create({
      data: {
        patientId: episode.patientId,
        episodeId,
        allergen,
        type,
        severity,
        reaction,
        status: 'evaluada',
        createdBy: email,
      },
    }),
  ])

  await logAudit({
    actorId: userId,
    actorRole: role,
    action: 'create',
    entity: 'allergy',
    patientId: episode.patientId,
    episodeId,
    newValue: { allergen, type, severity, reaction },
    reason: 'Registro de nueva alergia en expediente',
  })

  revalidatePath(`/dashboard/paciente/${episodeId}`)
  revalidatePath('/dashboard')
}