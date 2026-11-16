'use server'

import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { obtenerContextoResidencia } from '@/lib/tenant'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function solicitarPagoMensual(formData: FormData): Promise<void> {
  const ctx = await obtenerContextoResidencia()
  if (!ctx?.user || !ctx.residency) redirect('/login')
  if (ctx.user.role !== 'ADMIN' && ctx.user.role !== 'SUPERADMIN') {
    redirect('/dashboard')
  }

  const periodMonthsRaw = parseInt(String(formData.get('periodMonths') ?? '1'), 10)
  const periodMonths = [1, 3, 6, 12].includes(periodMonthsRaw) ? periodMonthsRaw : 1
  const method = String(formData.get('method') ?? 'transferencia').trim() || 'transferencia'
  const reference = String(formData.get('reference') ?? '').trim()
  const notes = String(formData.get('notes') ?? '').trim() || null

  if (!reference) {
    redirect('/dashboard/suscripcion?error=' + encodeURIComponent('Indica el número de referencia o comprobante de pago.'))
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