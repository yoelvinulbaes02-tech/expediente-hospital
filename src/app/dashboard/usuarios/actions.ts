'use server'

import { randomInt } from 'crypto'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { logAudit } from '@/lib/audit'
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
  const session = await auth()
  const user = session?.user
  if (!user?.id || String(user.role) !== 'ADMIN') throw new Error('No autorizado')
  return { id: user.id, role: String(user.role) }
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

  if (fullName.length < 3) {
    return { error: 'Escribe el nombre completo', campo: 'fullName', valores }
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'Escribe un correo válido', campo: 'email', valores }
  }
  if (password.length < 6) {
    return { error: 'La contraseña temporal debe tener al menos 6 caracteres', campo: 'password', valores }
  }
  if (!ROLES_VALIDOS.includes(role as RolValido)) {
    return { error: 'Selecciona un rol válido', campo: 'role', valores }
  }

  const existente = await prisma.user.findFirst({
    where: { email: { equals: email, mode: 'insensitive' } },
    select: { id: true },
  })
  if (existente) {
    return { error: 'Ya existe un usuario con ese correo', campo: 'email', valores }
  }

  const passwordHash = await bcrypt.hash(password, 12)

  const nuevo = await prisma.user
    .create({ data: { fullName, email, passwordHash, role: role as RolValido } })
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
    newValue: { usuario: fullName, correo: email, rol: role },
    reason: 'Creación de nuevo usuario',
  })

  revalidatePath('/dashboard/usuarios')
  return { ok: true, creado: `${fullName} (${email})`, valores: {} }
}

export async function toggleUsuario(formData: FormData): Promise<void> {
  const admin = await exigirAdmin()

  const userId = String(formData.get('userId') ?? '')
  const nuevoEstado = formData.get('isActive') === 'true'

  if (!userId || userId === admin.id) return

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

  const objetivo = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, fullName: true, email: true },
  })
  if (!objetivo) return { ok: false, error: 'Usuario no encontrado' }
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

// ─── NUEVA ACCIÓN: EDITAR NOMBRE Y ROL DEL USUARIO ───
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

  const previo = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, fullName: true, email: true, role: true },
  })

  if (!previo) return { ok: false, error: 'Usuario no encontrado' }

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