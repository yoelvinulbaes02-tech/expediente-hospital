'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { logAudit } from '@/lib/audit'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'

export async function crearUsuario(formData: FormData) {
  const session = await auth()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!session || (session.user as any)?.role !== 'ADMIN') throw new Error('No autorizado')

  const fullName = formData.get('fullName') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const role = formData.get('role') as any

  const passwordHash = await bcrypt.hash(password, 12)

  const nuevo = await prisma.user.create({
    data: { fullName, email, passwordHash, role }
  })

  await logAudit({
    actorId: session.user?.id as string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    actorRole: (session.user as any)?.role,
    action: 'create',
    entity: 'user',
    entityId: nuevo.id,
    newValue: { fullName, email, role },
    reason: 'Creación de nuevo usuario',
  })

  revalidatePath('/dashboard/usuarios')
}