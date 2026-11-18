'use server'

import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { obtenerContextoResidencia } from '@/lib/tenant'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const METODOS_MANUALES_VALIDOS = ['transferencia', 'deposito', 'cheque']

export async function solicitarPagoMensual(formData: FormData): Promise<void> {
  const ctx = await obtenerContextoResidencia()
  if (!ctx?.user || !ctx.residency) redirect('/login')
  if (ctx.user.mustChangePassword) redirect('/dashboard/perfil?force=true')
  if (ctx.user.role !== 'ADMIN' && ctx.user.role !== 'SUPERADMIN') {
    redirect('/dashboard')
  }

  const periodMonthsRaw = parseInt(String(formData.get('periodMonths') ?? '1'), 10)
  const periodMonths = [1, 3, 6, 12].includes(periodMonthsRaw) ? periodMonthsRaw : 1
  const methodRaw = String(formData.get('method') ?? 'transferencia').trim().toLowerCase()
  const method = METODOS_MANUALES_VALIDOS.includes(methodRaw) ? methodRaw : 'transferencia'
  const reference = String(formData.get('reference') ?? '').trim()
  const notesRaw = String(formData.get('notes') ?? '').trim()
  const notes = notesRaw ? notesRaw.slice(0, 500) : null

  if (!reference || reference.length < 3 || reference.length > 100) {
    redirect(
      '/dashboard/suscripcion?error=' +
        encodeURIComponent('Indica un número de referencia válido (entre 3 y 100 caracteres).')
    )
  }

  const duplicadoPendiente = await prisma.subscriptionPayment.findFirst({
    where: {
      residencyId: ctx.residency.id,
      status: 'PENDIENTE',
      reference: { equals: reference, mode: 'insensitive' },
    },
    select: { id: true },
  })
  if (duplicadoPendiente) {
    redirect(
      '/dashboard/suscripcion?error=' +
        encodeURIComponent('Ya existe un comprobante pendiente de revisión con esa misma referencia.')
    )
  }

  const amountUsd = ctx.residency.monthlyPriceUsd * periodMonths

  const pago = await prisma.subscriptionPayment.create({
    data: {
      residencyId: ctx.residency.id,
      amountUsd,
      periodMonths,
      method,
      reference,
      notes,
      status: 'PENDIENTE',
      requestedBy: ctx.user.email,
    },
  })

  await logAudit({
    actorId: ctx.user.id,
    actorRole: String(ctx.user.role),
    action: 'create',
    entity: 'subscription_payment',
    entityId: pago.id,
    newValue: {
      residencyId: ctx.residency.id,
      amountUsd,
      periodMonths,
      method,
      reference,
    },
    reason: 'Solicitud de renovación mensual de residencia',
  })

  revalidatePath('/dashboard/suscripcion')
  revalidatePath('/dashboard/plataforma')
  redirect('/dashboard/suscripcion?ok=1')
}
