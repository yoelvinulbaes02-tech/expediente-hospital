import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

// EXPORTACIÓN REQUERIDA POR ACTIONS-TURNO Y TURNO/PAGE
export const ROLES_MEDICOS = ['DOCTOR', 'RESIDENT'] as const
export const ROLES_CLINICOS = ['ADMIN', 'DOCTOR', 'RESIDENT', 'NURSE', 'LAB'] as const

export type Permisos = {
  activo: boolean
  esAdmin: boolean
  esMedico: boolean
  esResponsable: boolean
  sinResponsable: boolean
  puedeRegistrar: boolean
  puedeEditar: boolean
  puedeMarcarTareas: boolean
  puedeDarAlta: boolean
  puedeTomar: boolean
  puedeReasignar: boolean
  puedeEntregar: boolean
}

export function volverAlExpediente(episodeId: string, error: string): never {
  redirect(`/dashboard/paciente/${episodeId}?error=${encodeURIComponent(error)}`)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function calcularPermisos(role: string, userId: string, episode: any): Permisos {
  const activo = episode?.status === 'active'
  const esAdmin = role === 'ADMIN'
  const esMedico = role === 'DOCTOR' || role === 'RESIDENT'
  const esClinico = esAdmin || esMedico || role === 'NURSE' || role === 'LAB'
  const esResponsable = episode?.responsibleId === userId
  const sinResponsable = !episode?.responsibleId

  // CUALQUIER MÉDICO O RESIDENTE PUEDE DAR EL ALTA A CUALQUIER PACIENTE
  const puedeDarAlta = activo && (esAdmin || esMedico)
  const puedeEditar = activo && (esAdmin || esMedico || esResponsable)
  const puedeTomar = activo && (esAdmin || esMedico) && (!esResponsable || sinResponsable)
  const puedeReasignar = activo && esAdmin
  const puedeEntregar = activo && (esAdmin || esResponsable || esMedico)

  return {
    activo,
    esAdmin,
    esMedico,
    esResponsable,
    sinResponsable,
    puedeRegistrar: activo && esClinico,
    puedeEditar,
    puedeMarcarTareas: activo && esClinico,
    puedeDarAlta,
    puedeTomar,
    puedeReasignar,
    puedeEntregar,
  }
}

export async function exigirPermiso(
  episodeId: string,
  accion: 'registrar' | 'editar' | 'tareas' | 'alta'
) {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const userId = session.user.id
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const role = String((session.user as any)?.role ?? 'READONLY')
  const email = session.user.email ?? ''

  const episode = await prisma.episode.findUnique({
    where: { id: episodeId },
    select: { id: true, patientId: true, status: true, responsibleId: true, serviceType: true },
  })

  if (!episode) redirect('/dashboard')

  if (episode.status !== 'active') {
    volverAlExpediente(episodeId, 'El expediente está cerrado (paciente dado de alta).')
  }

  const esAdmin = role === 'ADMIN'
  const esMedico = role === 'DOCTOR' || role === 'RESIDENT'
  const esClinico = esAdmin || esMedico || role === 'NURSE' || role === 'LAB'
  const esResponsable = episode.responsibleId === userId

  if (accion === 'registrar' && !esClinico) {
    volverAlExpediente(episodeId, 'No tienes permiso para registrar datos clínicos.')
  }

  if (accion === 'tareas' && !esClinico) {
    volverAlExpediente(episodeId, 'No tienes permiso para gestionar pendientes.')
  }

  // ACCIÓN DE ALTA O EDICIÓN: PERMITIDA A CUALQUIER MÉDICO, RESIDENTE O ADMIN
  if ((accion === 'editar' || accion === 'alta') && !esAdmin && !esMedico && !esResponsable) {
    volverAlExpediente(episodeId, 'Solo médicos o residentes de guardia pueden realizar esta acción.')
  }

  return { userId, role, email, episode }
}