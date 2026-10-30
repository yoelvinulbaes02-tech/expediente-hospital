'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { logAudit } from '@/lib/audit'
import { revalidatePath } from 'next/cache'

export async function entregarLote(formData: FormData) {
  const session = await auth()
  if (!session) throw new Error('No autorizado')

  const episodeIdsJSON = formData.get('episodeIds') as string
  const recibidoPor = formData.get('recibidoPor') as string
  
  if (!episodeIdsJSON) return
  const episodeIds = JSON.parse(episodeIdsJSON) as string[]

  // Creamos un Handoff por cada paciente seleccionado
  for (const episodeId of episodeIds) {
    await prisma.handoff.create({
      data: {
        episodeId,
        entregadoPor: session.user?.name || session.user?.email || 'Desconocido',
        recibidoPor,
        status: 'PENDIENTE',
        observaciones: 'Entrega en lote desde el dashboard',
      }
    })

    // Auditoría por cada paciente
    await logAudit({
      actorId: session.user?.id as string,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      actorRole: (session.user as any)?.role,
      action: 'create',
      entity: 'handoff',
      episodeId,
      newValue: { entregadoPor: session.user?.name, recibidoPor, status: 'PENDIENTE' },
      reason: 'Entrega de turno en lote',
    })
  }

  // Refrescamos el dashboard
  revalidatePath('/dashboard')
}