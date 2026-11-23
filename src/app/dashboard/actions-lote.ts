'use server'

import { prisma } from '@/lib/prisma'
import { obtenerSesionSegura } from '@/auth'
import { logAudit } from '@/lib/audit'
import { calcularPermisos, ROLES_CLINICOS, ROLES_MEDICOS } from '@/lib/permisos'
import { obtenerContextoResidencia, verificarEscrituraResidencia } from '@/lib/tenant'
import { revalidatePath } from 'next/cache'

export type ResultadoLote = { entregados: number; omitidos: string[]; error?: string }

const fallo = (error: string): ResultadoLote => ({ entregados: 0, omitidos: [], error })

export async function entregarLote(formData: FormData): Promise<ResultadoLote> {
  const ctx = await obtenerContextoResidencia()
  if (!ctx?.residency) return fallo('Tu sesión venció. Vuelve a iniciar sesión.')

  const checkSuscripcion = await verificarEscrituraResidencia(ctx.residency.id)
  if (!checkSuscripcion.ok) return fallo(checkSuscripcion.error)

  const user = ctx.user
  const role = String(user.role)
  const nombre = user.fullName ?? user.email
  const recibidoPor = String(formData.get('recibidoPor') ?? '').trim()

  let episodeIds: string[] = []
  try {
    const parsed = JSON.parse(String(formData.get('episodeIds') ?? '[]'))
    if (Array.isArray(parsed)) episodeIds = parsed.filter((x): x is string => typeof x === 'string')
  } catch {
    return fallo('La selección no es válida.')
  }
  episodeIds = Array.from(new Set(episodeIds))

  if (episodeIds.length === 0) return fallo('Selecciona al menos un paciente.')
  if (episodeIds.length > 50) return fallo('Puedes entregar un máximo de 50 pacientes a la vez.')
  if (!recibidoPor) return fallo('Selecciona el médico que recibe.')
  if (recibidoPor.toLowerCase() === user.email.toLowerCase()) {
    return fallo('No puedes entregarte pacientes a ti mismo.')
  }

  // El receptor debe ser un médico real, activo y de la misma residencia
  const receptor = await prisma.user.findFirst({
    where: {
      email: { equals: recibidoPor, mode: 'insensitive' },
      residencyId: ctx.residency.id,
    },
    select: { email: true, fullName: true, role: true, isActive: true },
  })
  if (!receptor || !receptor.isActive) return fallo('El médico que recibe no es válido para esta residencia.')
  if (!ROLES_MEDICOS.includes(receptor.role)) return fallo('El receptor debe ser médico o residente.')

  const episodios = await prisma.episode.findMany({
    where: {
      id: { in: episodeIds },
      residencyId: ctx.residency.id,
    },
    include: {
      patient: { select: { firstName: true, lastName: true } },
      handoffs: { where: { status: 'PENDIENTE' }, select: { id: true } },
      _count: { select: { tasks: { where: { status: 'pendiente' } } } },
    },
  })

  const omitidos: string[] = []
  if (episodios.length < episodeIds.length) {
    omitidos.push(`${episodeIds.length - episodios.length} paciente(s) no encontrado(s)`)
  }

  let entregados = 0
  for (const e of episodios) {
    const paciente = `${e.patient.firstName} ${e.patient.lastName}`
    const permisos = calcularPermisos(role, user.id, e)

    if (!permisos.activo) { omitidos.push(`${paciente}: expediente cerrado`); continue }
    if (!permisos.puedeEditar) { omitidos.push(`${paciente}: no estás a cargo de este paciente`); continue }
    if (e.handoffs.length > 0) { omitidos.push(`${paciente}: ya tiene una entrega pendiente`); continue }

    const handoff = await prisma.handoff.create({
      data: {
        episodeId: e.id,
        entregadoPor: user.email,
        recibidoPor: receptor.email,
        observaciones: 'Entrega en lote desde el dashboard',
        status: 'PENDIENTE',
      },
    })

    await logAudit({
      actorId: user.id,
      actorRole: role,
      action: 'create',
      entity: 'handoff',
      entityId: handoff.id,
      patientId: e.patientId,
      episodeId: e.id,
      newValue: {
        entregadoPor: nombre,
        recibidoPor: receptor.fullName,
        tareasPendientes: e._count.tasks,
        status: 'PENDIENTE',
      },
      reason: 'Entrega de turno en lote',
    })

    revalidatePath(`/dashboard/paciente/${e.id}`)
    entregados++
  }

  revalidatePath('/dashboard')
  return { entregados, omitidos }
}

export async function completarTareaDesdeDashboard(
  taskId: string
): Promise<{ ok: boolean; error?: string }> {
  const session = await obtenerSesionSegura()
  const user = session?.user
  if (!user?.id) {
    return { ok: false, error: 'Tu sesión venció. Vuelve a iniciar sesión.' }
  }

  const usuarioDb = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      role: true,
      email: true,
      residencyId: true,
      isActive: true,
      mustChangePassword: true,
    },
  })
  if (!usuarioDb?.isActive) {
    return { ok: false, error: 'Tu usuario está inactivo.' }
  }
  if (usuarioDb.mustChangePassword) {
    return { ok: false, error: 'Debes cambiar tu contraseña temporal antes de continuar.' }
  }

  const role = String(usuarioDb.role)
  if (!ROLES_CLINICOS.includes(role)) {
    return { ok: false, error: 'No tienes permiso para marcar pendientes.' }
  }

  const tarea = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      episode: {
        select: { id: true, patientId: true, status: true, residencyId: true },
      },
    },
  })

  if (!tarea) {
    return { ok: false, error: 'La tarea no existe.' }
  }

  if (role !== 'SUPERADMIN') {
    if (
      !usuarioDb.residencyId ||
      !tarea.episode.residencyId ||
      tarea.episode.residencyId !== usuarioDb.residencyId
    ) {
      return { ok: false, error: 'No tienes acceso a este expediente.' }
    }
  }

  const checkSuscripcion = await verificarEscrituraResidencia(
    tarea.episode.residencyId ?? usuarioDb.residencyId
  )
  if (!checkSuscripcion.ok) {
    return { ok: false, error: checkSuscripcion.error }
  }

  if (tarea.episode.status !== 'active') {
    return { ok: false, error: 'El expediente está cerrado.' }
  }

  const actualizacion = await prisma.task.updateMany({
    where: { id: taskId, status: 'pendiente' },
    data: {
      status: 'hecha',
      doneBy: user.email,
      doneAt: new Date(),
    },
  })

  if (actualizacion.count === 0) {
    return { ok: false, error: 'Esta tarea ya fue actualizada por otra persona.' }
  }

  await logAudit({
    actorId: user.id,
    actorRole: role,
    action: 'update',
    entity: 'task',
    entityId: taskId,
    patientId: tarea.episode.patientId,
    episodeId: tarea.episodeId,
    oldValue: { tarea: tarea.title, estado: tarea.status },
    newValue: { tarea: tarea.title, estado: 'hecha' },
    reason: 'Tarea marcada como realizada desde vista general',
  })

  revalidatePath('/dashboard')
  revalidatePath(`/dashboard/paciente/${tarea.episodeId}`)
  return { ok: true }
}