'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { logAudit } from '@/lib/audit'
import bcrypt from 'bcryptjs'
import { revalidatePath } from 'next/cache'

type Campo = 'currentPassword' | 'newPassword' | 'confirmPassword'

export async function cambiarPassword(
  
  _estadoAnterior: { ok?: boolean; error?: string; campo?: Campo },
  formData: FormData
): Promise<{ ok?: boolean; error?: string; campo?: Campo }> {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Tu sesión expiró. Vuelve a iniciar sesión.' }

  const currentPassword = String(formData.get('currentPassword') ?? '')
  const newPassword = String(formData.get('newPassword') ?? '')
  const confirmPassword = String(formData.get('confirmPassword') ?? '')

  if (!currentPassword) {
    return { error: 'Escribe tu contraseña actual', campo: 'currentPassword' }
  }
  if (
    newPassword.length < 8 ||
    !/[a-zA-Z]/.test(newPassword) ||
    !/\d/.test(newPassword)
  ) {
    return {
      error: 'La nueva contraseña debe tener al menos 8 caracteres, incluyendo letras y números',
      campo: 'newPassword',
    }
  }
  if (newPassword !== confirmPassword) {
    return { error: 'Las contraseñas nuevas no coinciden', campo: 'confirmPassword' }
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  })
  if (!user || !user.isActive) {
    return { error: 'Usuario no encontrado o desactivado' }
  }

  // Verificar la contraseña actual
  const valid = await bcrypt.compare(currentPassword, user.passwordHash)
  if (!valid) {
    return { error: 'Contraseña actual incorrecta', campo: 'currentPassword' }
  }

  if (newPassword === currentPassword) {
    return { error: 'La nueva contraseña debe ser diferente a la actual', campo: 'newPassword' }
  }

  // Encriptar y guardar la nueva
  const newPasswordHash = await bcrypt.hash(newPassword, 12)
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: newPasswordHash,
      mustChangePassword: false, // Quitamos la obligación de cambiarla
    },
  })

  // Guardar en auditoría
  await logAudit({
    actorId: user.id,
    actorRole: String(user.role),
    action: 'update',
    entity: 'user',
    entityId: user.id,
    reason: 'Cambio de contraseña por el usuario',
  })

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/perfil')
  return { ok: true }
}