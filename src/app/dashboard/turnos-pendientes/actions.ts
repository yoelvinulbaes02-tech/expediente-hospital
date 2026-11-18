'use server'

import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { ROLES_MEDICOS } from '@/lib/permisos'
import { obtenerContextoResidencia, verificarEscrituraResidencia } from '@/lib/tenant'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function aceptarEntregaTurno(formData: FormData): Promise<void> {
  const ctx = await obtenerContextoResidencia()
  if (!ctx?.user) throw new Error('No autorizado')
  if (ctx.user.mustChangePassword) redirect('/dashboard/perfil?force=true')

  const role = String(ctx.user.role)
  if (!ROLES_MEDICOS.includes(role)) {
    throw new Error('Solo médicos o residentes pueden aceptar la responsabilidad de un paciente.')
  }

  const handoffId = String(formData.get('handoffId') ?? '')
  const episodeId = String(formData.get('episodeId') ?? '')
  const nombreNuevoMedico = ctx.user.fullName || ctx.user.email

  const handoff = await prisma.handoff.findUnique({
    where: { id: handoffId },
    include: {
      episode: {
        select: { id: true, residencyId: true, patientId: true, status: true },
      },
    },
  })

  if (!handoff || handoff.episodeId !== episodeId) throw new Error('Turno no encontrado')

  if (!ctx.esSuperAdmin) {
    if (
      !ctx.residency ||
      !handoff.episode.residencyId ||
      handoff.episode.residencyId !== ctx.residency.id
    ) {
      throw new Error('No autorizado')
    }
  }

  if (handoff.recibidoPor.toLowerCase() !== ctx.user.email.toLowerCase()) {
    throw new Error('Solo el médico receptor designado puede aceptar este turno.')
  }
  if (handoff.status !== 'PENDIENTE') {
    throw new Error('Esta entrega de turno ya fue procesada.')
  }
  if (handoff.episode.status !== 'active') {
    throw new Error('El expediente está cerrado.')
  }

  const checkSuscripcion = await verificarEscrituraResidencia(
    handoff.episode.residencyId ?? ctx.residency?.id
  )
  if (!checkSuscripcion.ok) {
    throw new Error(checkSuscripcion.error)
  }

  const [handoffAct, episodeAct] = await prisma.$transaction([
    prisma.handoff.updateMany({
      where: { id: handoffId, status: 'PENDIENTE' },
      data: { status: 'ACEPTADO', aceptadoAt: new Date() },
    }),
    prisma.episode.updateMany({
      where: { id: episodeId, status: 'active' },
      data: {
        attendingDoctor: nombreNuevoMedico,
        responsibleId: ctx.user.id,
        responsibleSince: new Date(),
      },
    }),
  ])

  if (handoffAct.count === 0 || episodeAct.count === 0) {
    throw new Error('Esta entrega de turno ya fue procesada o el expediente cerró.')
  }

  await logAudit({
    actorId: ctx.user.id,
    actorRole: role,
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
  revalidatePath(`/dashboard/paciente/${episodeId}`)
  redirect('/dashboard/turnos-pendientes')
}