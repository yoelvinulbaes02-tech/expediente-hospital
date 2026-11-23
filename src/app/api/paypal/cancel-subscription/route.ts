import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { obtenerContextoResidencia } from '@/lib/tenant'
import {
  cancelarSuscripcionPayPal,
  estaPayPalConfigurado,
  extraerSuscripcionActivaDeNota,
  limpiarTagSuscripcionDeNota,
} from '@/lib/paypal'

export async function POST() {
  try {
    const ctx = await obtenerContextoResidencia()
    if (!ctx?.user || !ctx.residency) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
    }
    if (ctx.user.mustChangePassword) {
      return NextResponse.json(
        { error: 'Debes cambiar tu contraseña temporal antes de gestionar tu suscripción.' },
        { status: 403 }
      )
    }

    const esIndividual = ctx.residency.billingMode === 'INDIVIDUAL'
    if (!esIndividual && ctx.user.role !== 'ADMIN' && ctx.user.role !== 'SUPERADMIN') {
      return NextResponse.json(
        { error: 'Solo el administrador puede cancelar la renovación automática de la residencia.' },
        { status: 403 }
      )
    }

    if (!estaPayPalConfigurado()) {
      return NextResponse.json(
        { error: 'PayPal aún no está configurado en el servidor.' },
        { status: 503 }
      )
    }

    const notaActual = esIndividual ? ctx.user.lastPaymentNote : ctx.residency.lastPaymentNote
    const subId = extraerSuscripcionActivaDeNota(notaActual)

    if (!subId) {
      return NextResponse.json(
        { error: 'No hay una suscripción automática activa vinculada a esta cuenta.' },
        { status: 404 }
      )
    }

    await cancelarSuscripcionPayPal(
      subId,
      `Cancelación solicitada por ${ctx.user.fullName} desde NEXO`
    )

    const notaLimpia = limpiarTagSuscripcionDeNota(notaActual)
    const nuevaNota = notaLimpia
      ? `${notaLimpia} · Renovación automática cancelada`
      : 'Renovación automática cancelada por el titular'

    if (esIndividual) {
      await prisma.user.update({
        where: { id: ctx.user.id },
        data: { lastPaymentNote: nuevaNota },
      })
    } else {
      await prisma.residency.update({
        where: { id: ctx.residency.id },
        data: { lastPaymentNote: nuevaNota },
      })
    }

    await logAudit({
      actorId: ctx.user.id,
      actorRole: String(ctx.user.role),
      action: 'update',
      entity: 'subscription_payment',
      entityId: subId,
      newValue: {
        subscriptionID: subId,
        billingScope: esIndividual ? 'INDIVIDUAL' : 'RESIDENCY',
        residencyId: ctx.residency.id,
        cancelledAt: new Date().toISOString(),
      },
      reason: 'Cancelación de renovación automática mensual PayPal (se mantiene vigencia ya pagada)',
    })

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/suscripcion')
    revalidatePath('/dashboard/plataforma')

    return NextResponse.json({ ok: true, cancelledSubscriptionId: subId })
  } catch (err) {
    console.error('Error en /api/paypal/cancel-subscription:', err)
    return NextResponse.json(
      { error: 'No se pudo cancelar la suscripción automática en PayPal.' },
      { status: 500 }
    )
  }
}
