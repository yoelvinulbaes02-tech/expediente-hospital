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

export async function editarNota(formData: FormData): Promise<void> {
  const episodeId = String(formData.get('episodeId') ?? '')
  const noteId = String(formData.get('noteId') ?? '')
  const { userId, role, email, episode } = await exigirPermiso(episodeId, 'registrar')

  if (!noteId) {
    volverAlExpediente(episodeId, 'Identificador de nota inválido')
  }

  const previa = await prisma.note.findFirst({
    where: { id: noteId, episodeId },
  })
  if (!previa) {
    volverAlExpediente(episodeId, 'La nota de evolución no existe en este expediente')
  }

  if (previa.createdBy.trim().toLowerCase() !== email.trim().toLowerCase()) {
    volverAlExpediente(episodeId, 'Solo el autor original de esta nota de evolución puede editarla')
  }

  const esNotaLibre = previa.content !== null

  if (esNotaLibre) {
    const content = String(formData.get('content') ?? '').trim()
    if (!content || content.length < 5) {
      volverAlExpediente(episodeId, 'La evolución clínica debe tener al menos 5 caracteres')
    }

    if (content === (previa.content ?? '').trim()) {
      revalidatePath(`/dashboard/paciente/${episodeId}`)
      return
    }

    await prisma.note.update({
      where: { id: noteId },
      data: {
        content,
        updatedBy: email,
        updatedAt: new Date(),
      },
    })

    await logAudit({
      actorId: userId,
      actorRole: role,
      action: 'update',
      entity: 'note',
      entityId: noteId,
      patientId: episode.patientId,
      episodeId,
      oldValue: {
        evolucion: previa.content,
        createdBy: previa.createdBy,
        updatedBy: previa.updatedBy,
      },
      newValue: {
        evolucion: content,
        updatedBy: email,
      },
      reason: 'Nota de evolución clínica editada',
    })
  } else {
    const subjective = String(formData.get('subjective') ?? '').trim()
    const objective = String(formData.get('objective') ?? '').trim()
    const assessment = String(formData.get('assessment') ?? '').trim()
    const plan = String(formData.get('plan') ?? '').trim()

    if (!subjective || !objective || !assessment || !plan) {
      volverAlExpediente(episodeId, 'Completa los cuatro campos S, O, A y P de la evolución')
    }

    await prisma.note.update({
      where: { id: noteId },
      data: {
        subjective,
        objective,
        assessment,
        plan,
        updatedBy: email,
        updatedAt: new Date(),
      },
    })

    await logAudit({
      actorId: userId,
      actorRole: role,
      action: 'update',
      entity: 'note',
      entityId: noteId,
      patientId: episode.patientId,
      episodeId,
      oldValue: {
        subjective: previa.subjective,
        objective: previa.objective,
        assessment: previa.assessment,
        plan: previa.plan,
        createdBy: previa.createdBy,
        updatedBy: previa.updatedBy,
      },
      newValue: {
        subjective,
        objective,
        assessment,
        plan,
        updatedBy: email,
      },
      reason: 'Nota de evolución SOAP editada',
    })
  }

  revalidatePath(`/dashboard/paciente/${episodeId}`)
}