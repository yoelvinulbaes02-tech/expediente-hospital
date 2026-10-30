'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { logAudit } from '@/lib/audit'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function aceptarEntregaTurno(formData: FormData): Promise<void> {
  const session = await auth()
  if (!session) throw new Error('No autorizado')

  const handoffId = formData.get('handoffId') as string
  const episodeId = formData.get('episodeId') as string
  const nombreNuevoMedico = session.user?.name || ''

  // 1. Buscamos el turno para la auditoría
  const handoff = await prisma.handoff.findUnique({
    where: { id: handoffId }
  })

  if (!handoff) throw new Error('Turno no encontrado')

  // 2. Actualizamos el estado del Handoff a ACEPTADO
  await prisma.handoff.update({
    where: { id: handoffId },
    data: { status: 'ACEPTADO' }
  })

  // 3. ¡LA MAGIA! Actualizamos el médico tratante del paciente al nuevo doctor
  await prisma.episode.update({
    where: { id: episodeId },
    data: { attendingDoctor: nombreNuevoMedico }
  })

  // 4. Guardamos en auditoría doble (el turno y el cambio de médico)
  await logAudit({
    actorId: session.user?.id as string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    actorRole: (session.user as any)?.role,
    action: 'update',
    entity: 'handoff',
    entityId: handoffId,
    patientId: handoff.episodeId,
    episodeId: handoff.episodeId,
    oldValue: { status: 'PENDIENTE' },
    newValue: { status: 'ACEPTADO', nuevoMedico: nombreNuevoMedico },
    reason: 'Entrega de turno aceptada y transferido al nuevo médico',
  })

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/turnos-pendientes')
  redirect('/dashboard/turnos-pendientes')
}