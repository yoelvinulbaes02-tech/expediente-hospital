'use server'

import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { exigirPermiso, volverAlExpediente } from '@/lib/permisos'
import { revalidatePath } from 'next/cache'

export async function agregarAlergia(formData: FormData): Promise<void> {
  const episodeId = String(formData.get('episodeId') ?? '')
  const { userId, role, email, episode } = await exigirPermiso(episodeId, 'registrar')

  const allergen = String(formData.get('allergen') ?? '').trim()
  const reaction = String(formData.get('reaction') ?? '').trim()

  if (!allergen) volverAlExpediente(episodeId, 'Escribe el alérgeno')

  // Se eliminan registros previos de "sin_alergias" o "no_evaluada" al añadir una real
  await prisma.$transaction([
    prisma.allergy.deleteMany({
      where: { episodeId, status: { in: ['sin_alergias', 'no_evaluada'] } },
    }),
    prisma.allergy.create({
      data: {
        patientId: episode.patientId,
        episodeId,
        allergen,
        type: 'otro',
        severity: 'no_especificada',
        reaction: reaction || null,
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
    newValue: { allergen, reaction },
    reason: 'Registro de nueva alergia en expediente',
  })

  revalidatePath(`/dashboard/paciente/${episodeId}`)
  revalidatePath('/dashboard')
}

export async function marcarSinAlergias(formData: FormData): Promise<void> {
  const episodeId = String(formData.get('episodeId') ?? '')
  const { userId, role, email, episode } = await exigirPermiso(episodeId, 'registrar')

  // Reemplaza cualquier alergia anterior por el estado de negada
  await prisma.$transaction([
    prisma.allergy.deleteMany({
      where: { episodeId },
    }),
    prisma.allergy.create({
      data: {
        patientId: episode.patientId,
        episodeId,
        allergen: 'Ninguna',
        type: 'otro',
        severity: 'no_especificada',
        reaction: 'Niega alergias',
        status: 'sin_alergias',
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
    newValue: { status: 'sin_alergias', allergen: 'Ninguna' },
    reason: 'Paciente niega alergias conocidas',
  })

  revalidatePath(`/dashboard/paciente/${episodeId}`)
  revalidatePath('/dashboard')
}