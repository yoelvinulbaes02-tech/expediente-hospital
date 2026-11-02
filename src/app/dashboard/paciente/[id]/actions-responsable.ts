'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { logAudit } from '@/lib/audit'
import { exigirPermiso, volverAlExpediente, ROLES_MEDICOS } from '@/lib/permisos'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function tomarACargo(formData: FormData): Promise<void> {
  const episodeId = String(formData.get('episodeId') ?? '')
  const { userId, role, nombre, episode } = await exigirPermiso(episodeId, 'tomar')

  // Solo se asigna si sigue sin responsable (evita que dos médicos lo tomen a la vez)
  const r = await prisma.episode.updateMany({
    where: { id: episodeId, responsibleId: null, status: 'active' },
    data: { responsibleId: userId, responsibleSince: new Date(), attendingDoctor: nombre },
  })
  if (r.count === 0) volverAlExpediente(episodeId, 'Otro médico ya tomó a cargo este paciente')

  await logAudit({
    actorId: userId,
    actorRole: role,
    action: 'take_charge',
    entity: 'episode',
    entityId: episodeId,
    patientId: episode.patientId,
    episodeId,
    oldValue: { responsable: null },
    newValue: { responsable: nombre },
    reason: 'Tomó a cargo al paciente',
  })

  revalidatePath(`/dashboard/paciente/${episodeId}`)
  revalidatePath('/dashboard')
  redirect(`/dashboard/paciente/${episodeId}`)
}

export async function reasignarResponsable(formData: FormData): Promise<void> {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  if (String(session.user.role) !== 'ADMIN') redirect('/dashboard')

  const episodeId = String(formData.get('episodeId') ?? '')
  const nuevoId = String(formData.get('nuevoResponsableId') ?? '')
  const motivo = String(formData.get('motivo') ?? '').trim()
  if (!episodeId) redirect('/dashboard')

  if (motivo.length < 5) volverAlExpediente(episodeId, 'Escribe el motivo de la reasignación')

  const episode = await prisma.episode.findUnique({
    where: { id: episodeId },
    select: { status: true, patientId: true, responsible: { select: { fullName: true } } },
  })
  if (!episode || episode.status !== 'active') volverAlExpediente(episodeId, 'El expediente no está activo')

  const nuevo = await prisma.user.findUnique({
    where: { id: nuevoId },
    select: { id: true, fullName: true, role: true, isActive: true },
  })
  if (!nuevo || !nuevo.isActive || !ROLES_MEDICOS.includes(nuevo.role)) {
    volverAlExpediente(episodeId, 'El nuevo responsable debe ser un médico activo')
  }

  await prisma.episode.update({
    where: { id: episodeId },
    data: {
      responsibleId: nuevo.id,
      responsibleSince: new Date(),
      attendingDoctor: nuevo.fullName,
    },
  })

  await logAudit({
    actorId: session.user.id,
    actorRole: String(session.user.role),
    action: 'reassign',
    entity: 'episode',
    entityId: episodeId,
    patientId: episode.patientId,
    episodeId,
    oldValue: { responsable: episode.responsible?.fullName ?? null },
    newValue: { responsable: nuevo.fullName },
    reason: motivo,
  })

  revalidatePath(`/dashboard/paciente/${episodeId}`)
  revalidatePath('/dashboard')
  redirect(`/dashboard/paciente/${episodeId}`)
}