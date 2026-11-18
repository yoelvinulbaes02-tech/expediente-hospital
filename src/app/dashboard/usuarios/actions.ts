'use server'

import { randomInt } from 'crypto'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { obtenerContextoResidencia } from '@/lib/tenant'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'

const ROLES_VALIDOS = ['ADMIN', 'DOCTOR', 'RESIDENT', 'NURSE', 'LAB', 'READONLY'] as const
type RolValido = (typeof ROLES_VALIDOS)[number]

type EstadoCrear = {
  ok?: boolean
  error?: string
  campo?: 'fullName' | 'email' | 'password' | 'role'
  creado?: string
  valores?: { fullName?: string; email?: string; role?: string }
}

type ResultadoReset = {
  ok: boolean
  error?: string
  password?: string
  nombre?: string
  correo?: string
}

async function exigirAdmin() {
  const ctx = await obtenerContextoResidencia()
  if (!ctx?.user || !ctx.residency) throw new Error('No autorizado')
  if (ctx.user.mustChangePassword) throw new Error('Debes cambiar tu contraseña temporal antes de continuar.')
  if (ctx.user.role !== 'ADMIN' && ctx.user.role !== 'SUPERADMIN') {
    throw new Error('No autorizado')
  }
  return {
    id: ctx.user.id,
    role: String(ctx.user.role),
    residencyId: ctx.residency.id,
    maxActiveUsers: ctx.residency.maxActiveUsers,
    suscripcionBloqueada: ctx.suscripcion?.bloqueada ?? false,
  }
}

function generarClaveTemporal(largo = 10): string {
  const alfabeto = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'
  let clave = ''
  for (let i = 0; i < largo; i++) clave += alfabeto[randomInt(alfabeto.length)]
  return clave
}

export async function crearUsuario(
  _anterior: EstadoCrear,
  formData: FormData
): Promise<EstadoCrear> {
  const admin = await exigirAdmin()

  const fullName = String(formData.get('fullName') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')
  const role = String(formData.get('role') ?? '')

  const valores = { fullName, email, role }

  if (admin.suscripcionBloqueada) {
    return {
      error: 'La suscripción mensual está suspendida. Renueva el plan para crear nuevos usuarios.',
      valores,
    }
  }

  if (fullName.length < 3) {
    return { error: 'Escribe el nombre completo', campo: 'fullName', valores }
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'Escribe un correo válido', campo: 'email', valores }
  }
  if (
    password.length < 8 ||
    !/[a-zA-Z]/.test(password) ||
    !/\d/.test(password)
  ) {
    return {
      error: 'La contraseña temporal debe tener al menos 8 caracteres, incluyendo letras y números',
      campo: 'password',
      valores,
    }
  }
  if (!ROLES_VALIDOS.includes(role as RolValido)) {
    return { error: 'Selecciona un rol válido', campo: 'role', valores }
  }

  const activosEnResidencia = await prisma.user.count({
    where: { residencyId: admin.residencyId, isActive: true },
  })
  if (activosEnResidencia >= admin.maxActiveUsers) {
    return {
      error: `Tu residencia alcanzó el límite de ${admin.maxActiveUsers} usuarios activos. Amplía tu plan en "Suscripción".`,
      valores,
    }
  }

  const existente = await prisma.user.findFirst({
    where: { email: { equals: email, mode: 'insensitive' } },
    select: { id: true },
  })
  if (existente) {
    return { error: 'Ya existe un usuario con ese correo en la plataforma', campo: 'email', valores }
  }

  const passwordHash = await bcrypt.hash(password, 12)

  const nuevo = await prisma.user
    .create({
      data: {
        fullName,
        email,
        passwordHash,
        role: role as RolValido,
        residencyId: admin.residencyId,
        mustChangePassword: true,
      },
    })
    .catch((e: unknown) => {
      if ((e as { code?: string })?.code === 'P2002') return null
      throw e
    })
  if (!nuevo) {
    return { error: 'Ya existe un usuario con ese correo', campo: 'email', valores }
  }

  await logAudit({
    actorId: admin.id,
    actorRole: admin.role,
    action: 'create',
    entity: 'user',
    entityId: nuevo.id,
    newValue: { usuario: fullName, correo: email, rol: role, residencyId: admin.residencyId },
    reason: 'Creación de nuevo usuario en la residencia',
  })

  revalidatePath('/dashboard/usuarios')
  return { ok: true, creado: `${fullName} (${email})`, valores: {} }
}

export async function toggleUsuario(formData: FormData): Promise<void> {
  const admin = await exigirAdmin()

  const userId = String(formData.get('userId') ?? '')
  const nuevoEstado = formData.get('isActive') === 'true'

  if (!userId || userId === admin.id) return

  const objetivo = await prisma.user.findFirst({
    where: { id: userId, residencyId: admin.residencyId, role: { not: 'SUPERADMIN' } },
    select: { id: true },
  })
  if (!objetivo) return

  if (nuevoEstado) {
    const activosEnResidencia = await prisma.user.count({
      where: { residencyId: admin.residencyId, isActive: true },
    })
    if (activosEnResidencia >= admin.maxActiveUsers) return
  }

  const usuario = await prisma.user.update({
    where: { id: userId },
    data: { isActive: nuevoEstado },
    select: { fullName: true, email: true },
  })

  await logAudit({
    actorId: admin.id,
    actorRole: admin.role,
    action: 'update',
    entity: 'user',
    entityId: userId,
    oldValue: { isActive: !nuevoEstado },
    newValue: { isActive: nuevoEstado, usuario: usuario.fullName, correo: usuario.email },
    reason: `Usuario ${nuevoEstado ? 'activado' : 'desactivado'}`,
  })

  revalidatePath('/dashboard/usuarios')
}

export async function resetearPassword(userId: string): Promise<ResultadoReset> {
  const admin = await exigirAdmin()

  const objetivo = await prisma.user.findFirst({
    where: { id: userId, residencyId: admin.residencyId, role: { not: 'SUPERADMIN' } },
    select: { id: true, fullName: true, email: true },
  })
  if (!objetivo) return { ok: false, error: 'Usuario no encontrado en tu residencia' }
  if (objetivo.id === admin.id) {
    return { ok: false, error: 'Para cambiar tu propia contraseña usa "Mi Perfil"' }
  }

  const temporal = generarClaveTemporal()
  const passwordHash = await bcrypt.hash(temporal, 12)

  await prisma.user.update({
    where: { id: objetivo.id },
    data: { passwordHash, mustChangePassword: true },
  })

  await logAudit({
    actorId: admin.id,
    actorRole: admin.role,
    action: 'update',
    entity: 'user',
    entityId: objetivo.id,
    newValue: { usuario: objetivo.fullName, correo: objetivo.email, debeCambiarla: true },
    reason: 'Contraseña temporal reseteada por el administrador',
  })

  revalidatePath('/dashboard/usuarios')
  return { ok: true, password: temporal, nombre: objetivo.fullName, correo: objetivo.email }
}

export async function editarUsuario(
  userId: string,
  fullName: string,
  role: string
): Promise<{ ok: boolean; error?: string }> {
  const admin = await exigirAdmin()

  const nombreLimpio = fullName.trim()
  if (nombreLimpio.length < 3) {
    return { ok: false, error: 'El nombre debe tener al menos 3 caracteres' }
  }
  if (!ROLES_VALIDOS.includes(role as RolValido)) {
    return { ok: false, error: 'Selecciona un rol válido' }
  }

  const previo = await prisma.user.findFirst({
    where: { id: userId, residencyId: admin.residencyId, role: { not: 'SUPERADMIN' } },
    select: { id: true, fullName: true, email: true, role: true },
  })

  if (!previo) return { ok: false, error: 'Usuario no encontrado en tu residencia' }

  await prisma.user.update({
    where: { id: userId },
    data: {
      fullName: nombreLimpio,
      role: role as RolValido,
    },
  })

  await logAudit({
    actorId: admin.id,
    actorRole: admin.role,
    action: 'update',
    entity: 'user',
    entityId: userId,
    oldValue: { fullName: previo.fullName, role: previo.role },
    newValue: { fullName: nombreLimpio, role },
    reason: `Nombre/rol de usuario modificado por administrador: "${previo.fullName}" -> "${nombreLimpio}"`,
  })

  revalidatePath('/dashboard/usuarios')
  revalidatePath('/dashboard')
  return { ok: true }
}

export async function eliminarUsuario(
  userId: string
): Promise<{ ok: boolean; error?: string }> {
  const admin = await exigirAdmin()

  if (!userId || userId === admin.id) {
    return { ok: false, error: 'No puedes eliminar tu propio usuario administrador.' }
  }

  const objetivo = await prisma.user.findFirst({
    where: { id: userId, residencyId: admin.residencyId, role: { not: 'SUPERADMIN' } },
    select: { id: true, fullName: true, email: true, role: true },
  })
  if (!objetivo) {
    return { ok: false, error: 'Usuario no encontrado en tu residencia.' }
  }

  const [auditCount, episodesCount, consultCount] = await Promise.all([
    prisma.auditLog.count({ where: { actorId: userId } }),
    prisma.episode.count({ where: { responsibleId: userId } }),
    prisma.consultation.count({ where: { doctorId: userId } }),
  ])

  if (auditCount > 0 || episodesCount > 0 || consultCount > 0) {
    return {
      ok: false,
      error:
        'Este usuario tiene registros clínicos o de auditoría asociados y no puede eliminarse por trazabilidad legal. Usa "Desactivar" para bloquear su acceso.',
    }
  }

  try {
    await prisma.user.delete({ where: { id: userId } })
  } catch (e: unknown) {
    if ((e as { code?: string })?.code === 'P2003') {
      return {
        ok: false,
        error:
          'Este usuario tiene registros asociados y no puede eliminarse. Usa "Desactivar" para bloquear su acceso.',
      }
    }
    throw e
  }

  await logAudit({
    actorId: admin.id,
    actorRole: admin.role,
    action: 'delete',
    entity: 'user',
    entityId: userId,
    oldValue: { fullName: objetivo.fullName, email: objetivo.email, role: objetivo.role },
    reason: `Usuario eliminado por administrador: ${objetivo.fullName} (${objetivo.email})`,
  })

  revalidatePath('/dashboard/usuarios')
  revalidatePath('/dashboard')
  return { ok: true }
}