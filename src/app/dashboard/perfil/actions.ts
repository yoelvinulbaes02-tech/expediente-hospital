'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { logAudit } from '@/lib/audit'
import bcrypt from 'bcryptjs'
import { revalidatePath } from 'next/cache'

export async function cambiarPassword(formData: FormData) {
  const session = await auth()
  if (!session) throw new Error('No autorizado')

  const currentPassword = formData.get('currentPassword') as string
  const newPassword = formData.get('newPassword') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (newPassword !== confirmPassword) {
    throw new Error('Las contraseñas nuevas no coinciden')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user?.id }
  })

  if (!user) throw new Error('Usuario no encontrado')

  // Verificar la contraseña actual
  const valid = await bcrypt.compare(currentPassword, user.passwordHash)
  if (!valid) throw new Error('La contraseña actual es incorrecta')

  // Encriptar y guardar la nueva
  const newPasswordHash = await bcrypt.hash(newPassword, 12)
  await prisma.user.update({
    where: { id: user.id },
    data: { 
      passwordHash: newPasswordHash,
      mustChangePassword: false // <-- IMPORTANTE: Quitamos la obligación
    }
  })

  // Guardar en auditoría
  await logAudit({
    actorId: session.user?.id as string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    actorRole: (session.user as any)?.role,
    action: 'update',
    entity: 'user',
    entityId: user.id,
    reason: 'Cambio de contraseña por el usuario',
  })

  revalidatePath('/dashboard/perfil')
}