'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { logAudit } from '@/lib/audit'
import { calcularPermisos, ROLES_MEDICOS } from '@/lib/permisos'
import { revalidatePath } from 'next/cache'

export type ResultadoLote = { entregados: number; omitidos: string[]; error?: string }

const fallo = (error: string): ResultadoLote => ({ entregados: 0, omitidos: [], error })

export async function entregarLote(formData: FormData): Promise<ResultadoLote> {
  const session = await auth()
  const user = session?.user
  if (!user?.id || !user.email) return fallo('Tu sesión venció. Vuelve a iniciar sesión.')

  const role = String(user.role)
  const nombre = user.name ?? user.email
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

  // El receptor debe ser un médico real y activo
  const receptor = await prisma.user.findFirst({
    where: { email: { equals: recibidoPor, mode: 'insensitive' } },
    select: { email: true, fullName: true, role: true, isActive: true },
  })
  if (!receptor || !receptor.isActive) return fallo('El médico que recibe no es válido.')
  if (!ROLES_MEDICOS.includes(receptor.role)) return fallo('El receptor debe ser médico o residente.')

  const episodios = await prisma.episode.findMany({
    where: { id: { in: episodeIds } },
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