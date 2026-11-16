'use server'

import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { obtenerContextoResidencia, verificarEscrituraResidencia } from '@/lib/tenant'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function aceptarEntregaTurno(formData: FormData): Promise<void> {
  const ctx = await obtenerContextoResidencia()
  if (!ctx?.user) throw new Error('No autorizado')

  const handoffId = String(formData.get('handoffId') ?? '')
  const episodeId = String(formData.get('episodeId') ?? '')
  const nombreNuevoMedico = ctx.user.fullName || ''

  const handoff = await prisma.handoff.findUnique({
    where: { id: handoffId },
    include: { episode: { select: { residencyId: true, patientId: true } } },
  })

  if (!handoff) throw new Error('Turno no encontrado')

  if (
    !ctx.esSuperAdmin &&
    ctx.residency &&
    handoff.episode.residencyId &&
    handoff.episode.residencyId !== ctx.residency.id
  ) {
    throw new Error('No autorizado')
  }

  const checkSuscripcion = await verificarEscrituraResidencia(
    handoff.episode.residencyId ?? ctx.residency?.id
  )
  if (!checkSuscripcion.ok) {
    throw new Error(checkSuscripcion.error)
  }

  await prisma.handoff.update({
    where: { id: handoffId },
    data: { status: 'ACEPTADO', aceptadoAt: new Date() },
  })

  await prisma.episode.update({
    where: { id: episodeId },
    data: {
      attendingDoctor: nombreNuevoMedico,
      responsibleId: ctx.user.id,
      responsibleSince: new Date(),
    },
  })

  await logAudit({
    actorId: ctx.user.id,
    actorRole: String(ctx.user.role),
    action: 'update',
    entity: 'handoff',
    entityId: handoffId,
    patientId: handoff.episode.patientId,
    episodeId: handoff.episodeId,
    oldValue: { status: 'PENDIENTE' },
    newValue: { status: 'ACEPTADO', nuevoMedico: nombreNuevoMedico },
    reason: 'Entrega de turno aceptada y transferido al nuevo médico',
  })

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/turnos-pendientes')
  redirect('/dashboard/turnos-pendientes')
}