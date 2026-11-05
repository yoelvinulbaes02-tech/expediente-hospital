import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export const ROLES_MEDICOS: string[] = ['DOCTOR', 'RESIDENT']
export const ROLES_CLINICOS: string[] = ['DOCTOR', 'RESIDENT', 'NURSE']
const ROLES_MARCAR_TAREAS: string[] = ['DOCTOR', 'RESIDENT', 'NURSE', 'LAB']

export type EpisodioParaPermisos = { status: string; responsibleId: string | null }

export function calcularPermisos(role: string, userId: string, episode: EpisodioParaPermisos) {
  const activo = episode.status === 'active'
  const esMedico = ROLES_MEDICOS.includes(role)
  const esResponsable = episode.responsibleId === userId
  const sinResponsable = episode.responsibleId === null
  const medicoACargo = activo && esMedico && esResponsable
  const clinico = activo && ROLES_CLINICOS.includes(role)

  return {
    activo,
    esResponsable,
    sinResponsable,
    puedeTomarACargo: activo && esMedico && sinResponsable,
    // Solo el médico a cargo: entregar turno, dar de alta y cancelar tareas
    puedeEditar: medicoACargo,
    // Cualquier usuario clínico: agregar notas, signos vitales, alergias y tareas
    puedeRegistrar: clinico,
    puedeRegistrarVitales: clinico, // alias, por compatibilidad con otros archivos
    // Marcar tareas: personal clínico y laboratorio
    puedeMarcarTareas: activo && ROLES_MARCAR_TAREAS.includes(role),
  }
}

export type Accion = 'editar' | 'registrar' | 'vitales' | 'tareas' | 'tomar'

export function volverAlExpediente(episodeId: string, mensaje: string): never {
  redirect(`/dashboard/paciente/${episodeId}?error=${encodeURIComponent(mensaje)}`)
}

// Verifica sesión + permiso. Si no hay permiso, regresa al expediente con un mensaje.
export async function exigirPermiso(episodeId: string, accion: Accion) {
  const session = await auth()
  const user = session?.user
  if (!user?.id) redirect('/login')
  if (!episodeId) redirect('/dashboard')

  const episode = await prisma.episode.findUnique({
    where: { id: episodeId },
    select: { id: true, status: true, patientId: true, responsibleId: true },
  })
  if (!episode) redirect('/dashboard')

  const role = String(user.role)
  const permisos = calcularPermisos(role, user.id, episode)
  const permitido = {
    editar: permisos.puedeEditar,
    registrar: permisos.puedeRegistrar,
    vitales: permisos.puedeRegistrar,
    tareas: permisos.puedeMarcarTareas,
    tomar: permisos.puedeTomarACargo,
  }[accion]

  if (!permitido) {
    let motivo = 'Solo el médico a cargo puede modificar este paciente'
    if (!permisos.activo) {
      motivo = 'El expediente está cerrado'
    } else if (accion === 'registrar' || accion === 'vitales') {
      motivo = 'Tu rol no puede agregar información al expediente'
    } else if (accion === 'tareas') {
      motivo = 'Tu rol no puede marcar tareas'
    } else if (accion === 'tomar') {
      motivo = 'No puedes tomar a cargo este paciente'
    } else if (permisos.sinResponsable && ROLES_MEDICOS.includes(role)) {
      motivo = 'Este paciente no tiene médico a cargo. Presiona "Tomar a cargo" primero.'
    }
    volverAlExpediente(episodeId, motivo)
  }

  return {
    userId: user.id,
    role,
    email: user.email ?? 'desconocido',
    nombre: user.name ?? user.email ?? 'desconocido',
    episode,
  }
}