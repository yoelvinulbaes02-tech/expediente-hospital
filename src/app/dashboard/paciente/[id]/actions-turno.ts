'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { logAudit } from '@/lib/audit'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const ROLES_CLINICOS: string[] = ['DOCTOR', 'RESIDENT', 'NURSE']

// Regresa a la pantalla del turno mostrando un mensaje de error
function volverConError(episodeId: string, mensaje: string): never {
  redirect(`/dashboard/paciente/${episodeId}/turno?error=${encodeURIComponent(mensaje)}`)
}

export async function guardarEntregaTurno(formData: FormData): Promise<void> {
  const session = await auth()
  const emailEntrega = session?.user?.email
  if (!session || !emailEntrega) redirect('/login')

  const episodeId = String(formData.get('episodeId') ?? '')
  const recibidoPor = String(formData.get('recibidoPor') ?? '').trim()
  const observaciones = String(formData.get('observaciones') ?? '').trim() || null

  if (!episodeId) redirect('/dashboard')
  if (!recibidoPor) volverConError(episodeId, 'Debes seleccionar quién recibe el turno')

  // Solo personal clínico puede entregar turno
  if (!ROLES_CLINICOS.includes(session.user.role)) {
    volverConError(episodeId, 'Tu rol no tiene permiso para entregar turnos')
  }

  if (recibidoPor.toLowerCase() === emailEntrega.toLowerCase()) {
    volverConError(episodeId, 'No puedes entregarte el turno a ti mismo')
  }

  // El episodio debe existir y estar activo
  const episode = await prisma.episode.findUnique({
    where: { id: episodeId },
    select: { id: true, status: true, patientId: true },
  })
  if (!episode || episode.status !== 'active') {
    volverConError(episodeId, 'El expediente no está activo')
  }

  // El receptor debe ser un usuario real, activo y clínico
  const receptor = await prisma.user.findFirst({
    where: { email: { equals: recibidoPor, mode: 'insensitive' } },
    select: { email: true, role: true, isActive: true },
  })
  if (!receptor || !receptor.isActive) volverConError(episodeId, 'Receptor no válido')
  if (!ROLES_CLINICOS.includes(receptor.role)) {
    volverConError(episodeId, 'El receptor no es personal clínico')
  }

  // Evitar dos entregas pendientes para el mismo paciente
  const pendiente = await prisma.handoff.findFirst({
    where: { episodeId, status: 'PENDIENTE' },
  })
  if (pendiente) {
    volverConError(episodeId, 'Ya existe una entrega pendiente para este paciente')
  }

  const handoff = await prisma.handoff.create({
    data: {
      episodeId,
      entregadoPor: emailEntrega,
      recibidoPor: receptor.email,
      observaciones,
      status: 'PENDIENTE',
    },
  })

  await logAudit({
    actorId: session.user.id,
    actorRole: session.user.role,
    action: 'create',
    entity: 'handoff',
    entityId: handoff.id,
    patientId: episode.patientId,
    episodeId,
    newValue: {
      entregadoPor: emailEntrega,
      recibidoPor: receptor.email,
      observaciones,
      status: 'PENDIENTE',
    },
    reason: 'Entrega de turno solicitada',
  })

  revalidatePath(`/dashboard/paciente/${episodeId}`)
  revalidatePath(`/dashboard/paciente/${episodeId}/turno`)
  redirect(`/dashboard/paciente/${episodeId}/turno`)
}

export async function aceptarEntregaTurno(formData: FormData): Promise<void> {
  const session = await auth()
  const email = session?.user?.email
  if (!session || !email) redirect('/login')

  const handoffId = String(formData.get('handoffId') ?? '')
  const handoff = await prisma.handoff.findUnique({ where: { id: handoffId } })
  if (!handoff) redirect('/dashboard')

  const episodeId = handoff.episodeId

  // Solo el receptor designado puede aceptar
  if (handoff.recibidoPor.toLowerCase() !== email.toLowerCase()) {
    volverConError(episodeId, 'Solo la persona designada puede aceptar este turno')
  }
  if (handoff.status !== 'PENDIENTE') {
    volverConError(episodeId, 'Esta entrega ya fue procesada')
  }

  const episode = await prisma.episode.findUnique({
    where: { id: episodeId },
    select: { patientId: true },
  })

  await prisma.handoff.update({
    where: { id: handoffId },
    data: { status: 'ACEPTADO', aceptadoAt: new Date() },
  })

  await logAudit({
    actorId: session.user.id,
    actorRole: session.user.role,
    action: 'update',
    entity: 'handoff',
    entityId: handoffId,
    patientId: episode?.patientId,
    episodeId,
    oldValue: { status: 'PENDIENTE' },
    newValue: { status: 'ACEPTADO' },
    reason: 'Entrega de turno aceptada',
  })

  revalidatePath(`/dashboard/paciente/${episodeId}`)
  revalidatePath(`/dashboard/paciente/${episodeId}/turno`)
  redirect(`/dashboard/paciente/${episodeId}/turno`)
}