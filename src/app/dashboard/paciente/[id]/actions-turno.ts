'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { logAudit } from '@/lib/audit'
import { exigirPermiso, ROLES_MEDICOS } from '@/lib/permisos'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// Regresa a la pantalla del turno mostrando un mensaje de error
function volverConError(episodeId: string, mensaje: string): never {
  redirect(`/dashboard/paciente/${episodeId}/turno?error=${encodeURIComponent(mensaje)}`)
}

export async function guardarEntregaTurno(formData: FormData): Promise<void> {
  const episodeId = String(formData.get('episodeId') ?? '')
  if (!episodeId) redirect('/dashboard')

  // Solo el médico a cargo del paciente puede entregarlo
  const { userId, role, email, nombre, episode } = await exigirPermiso(episodeId, 'editar')

  const recibidoPor = String(formData.get('recibidoPor') ?? '').trim()
  const observaciones = String(formData.get('observaciones') ?? '').trim() || null

  if (!recibidoPor) volverConError(episodeId, 'Debes seleccionar quién recibe el turno')
  if (recibidoPor.toLowerCase() === email.toLowerCase()) {
    volverConError(episodeId, 'No puedes entregarte el turno a ti mismo')
  }

  // El receptor debe ser un médico real y activo (buscamos por CORREO)
  const receptor = await prisma.user.findFirst({
    where: { email: { equals: recibidoPor, mode: 'insensitive' } },
    select: { email: true, fullName: true, role: true, isActive: true },
  })
  
  if (!receptor) {
    volverConError(episodeId, 'El correo del receptor no existe en el sistema')
  }
  if (!receptor.isActive) {
    volverConError(episodeId, 'El receptor está inactivo')
  }
  if (!ROLES_MEDICOS.includes(receptor.role)) {
    volverConError(episodeId, 'El receptor debe ser médico o residente')
  }

  // Evitar dos entregas pendientes para el mismo paciente
  const pendiente = await prisma.handoff.findFirst({ where: { episodeId, status: 'PENDIENTE' } })
  if (pendiente) volverConError(episodeId, 'Ya existe una entrega pendiente para este paciente')

  const tareasPendientes = await prisma.task.count({ where: { episodeId, status: 'pendiente' } })

  const handoff = await prisma.handoff.create({
    data: {
      episodeId,
      entregadoPor: email,
      recibidoPor: receptor.email,
      observaciones,
      status: 'PENDIENTE',
    },
  })

  await logAudit({
    actorId: userId,
    actorRole: role,
    action: 'create',
    entity: 'handoff',
    entityId: handoff.id,
    patientId: episode.patientId,
    episodeId,
    newValue: {
      entregadoPor: nombre,
      recibidoPor: receptor.fullName,
      observaciones,
      tareasPendientes,
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
  const user = session?.user
  if (!user?.id || !user.email) redirect('/login')

  const handoffId = String(formData.get('handoffId') ?? '')
  const handoff = await prisma.handoff.findUnique({
    where: { id: handoffId },
    include: { episode: { select: { patientId: true, status: true } } },
  })
  if (!handoff) redirect('/dashboard')

  const episodeId = handoff.episodeId
  const role = String(user.role)

  // Solo el receptor designado puede aceptar
  if (handoff.recibidoPor.toLowerCase() !== user.email.toLowerCase()) {
    volverConError(episodeId, 'Solo la persona designada puede aceptar este turno')
  }
  if (!ROLES_MEDICOS.includes(role)) {
    volverConError(episodeId, 'Solo un médico puede recibir la responsabilidad del paciente')
  }
  if (handoff.status !== 'PENDIENTE') volverConError(episodeId, 'Esta entrega ya fue procesada')
  if (handoff.episode.status !== 'active') volverConError(episodeId, 'El expediente ya está cerrado')

  const entregador = await prisma.user.findFirst({
    where: { email: { equals: handoff.entregadoPor, mode: 'insensitive' } },
    select: { fullName: true },
  })
  const nombre = user.name ?? user.email

  // Acepta la entrega Y traspasa la responsabilidad en una sola operación
  const [aceptada] = await prisma.$transaction([
    prisma.handoff.updateMany({
      where: { id: handoffId, status: 'PENDIENTE' },
      data: { status: 'ACEPTADO', aceptadoAt: new Date() },
    }),
    prisma.episode.update({
      where: { id: episodeId },
      data: { responsibleId: user.id, responsibleSince: new Date() },
    }),
  ])
  if (aceptada.count === 0) volverConError(episodeId, 'Esta entrega ya fue procesada')

  await logAudit({
    actorId: user.id,
    actorRole: role,
    action: 'update',
    entity: 'handoff',
    entityId: handoffId,
    patientId: handoff.episode.patientId,
    episodeId,
    oldValue: { status: 'PENDIENTE' },
    newValue: {
      status: 'ACEPTADO',
      nuevoResponsable: nombre,
      entregadoPor: entregador?.fullName ?? handoff.entregadoPor,
    },
    reason: 'Entrega de turno aceptada: asumió la responsabilidad del paciente',
  })

  revalidatePath('/dashboard')
  revalidatePath(`/dashboard/paciente/${episodeId}`)
  revalidatePath(`/dashboard/paciente/${episodeId}/turno`)
  redirect(`/dashboard/paciente/${episodeId}/turno`)
}