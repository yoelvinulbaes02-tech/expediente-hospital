import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { obtenerContextoResidencia } from '@/lib/tenant'
import { capturarOrdenPayPal, estaPayPalConfigurado } from '@/lib/paypal'

const PERIODOS_VALIDOS = [1, 3, 6, 12]

export async function POST(req: NextRequest) {
  try {
    const ctx = await obtenerContextoResidencia()
    if (!ctx?.user || !ctx.residency) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
    }
    if (ctx.user.role !== 'ADMIN' && ctx.user.role !== 'SUPERADMIN') {
      return NextResponse.json(
        { error: 'Solo el administrador de la residencia puede confirmar pagos.' },
        { status: 403 }
      )
    }

    if (!estaPayPalConfigurado()) {
      return NextResponse.json(
        { error: 'PayPal aún no está configurado en el servidor.' },
        { status: 503 }
      )
    }

    const body = (await req.json().catch(() => ({}))) as { orderID?: unknown }
    const orderID = String(body.orderID ?? '').trim()
    if (!orderID) {
      return NextResponse.json({ error: 'Falta el orderID de PayPal.' }, { status: 400 })
    }

    // Evitar doble acreditación si ya fue procesada esta orden
    const yaProcesada = await prisma.subscriptionPayment.findFirst({
      where: {
        residencyId: ctx.residency.id,
        status: 'APROBADO',
        OR: [{ reference: orderID }, { notes: { contains: orderID } }],
      },
    })
    if (yaProcesada) {
      return NextResponse.json({ ok: true, alreadyProcessed: true })
    }

    const captura = await capturarOrdenPayPal(orderID)
    if (captura.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: `El pago aún no se completó en PayPal (estado: ${captura.status}).` },
        { status: 400 }
      )
    }

    const pagoCapture = captura.purchase_units?.[0]?.payments?.captures?.[0]
    if (!pagoCapture || pagoCapture.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'No se encontró una captura completada en PayPal.' },
        { status: 400 }
      )
    }

    const customParts = (pagoCapture.custom_id ?? '').split('|')
    const customResidencyId = customParts[0] || ctx.residency.id
    const periodParsed = parseInt(customParts[1] ?? '1', 10)
    const periodMonths = PERIODOS_VALIDOS.includes(periodParsed) ? periodParsed : 1

    if (customResidencyId !== ctx.residency.id) {
      return NextResponse.json(
        { error: 'Esta orden de pago pertenece a otra residencia.' },
        { status: 403 }
      )
    }

    const montoEsperado = Number((ctx.residency.monthlyPriceUsd * periodMonths).toFixed(2))
    const montoCobrado = parseFloat(pagoCapture.amount?.value ?? '0')
    if (isNaN(montoCobrado) || montoCobrado + 0.01 < montoEsperado) {
      return NextResponse.json(
        { error: 'El monto capturado en PayPal no coincide con la tarifa del plan.' },
        { status: 400 }
      )
    }

    const captureRef = pagoCapture.id || orderID
    const yaCapturado = await prisma.subscriptionPayment.findFirst({
      where: { residencyId: ctx.residency.id, reference: captureRef, status: 'APROBADO' },
    })
    if (yaCapturado) {
      return NextResponse.json({ ok: true, alreadyProcessed: true })
    }

    const base =
      ctx.residency.subscriptionEndsAt && ctx.residency.subscriptionEndsAt.getTime() > Date.now()
        ? ctx.residency.subscriptionEndsAt.getTime()
        : Date.now()
    const nuevaFecha = new Date(base + periodMonths * 30 * 24 * 60 * 60 * 1000)

    await prisma.$transaction([
      prisma.subscriptionPayment.create({
        data: {
          residencyId: ctx.residency.id,
          amountUsd: montoCobrado,
          periodMonths,
          method: 'paypal',
          reference: captureRef,
          notes: `Pago en línea PayPal (Orden ${orderID})`,
          status: 'APROBADO',
          requestedBy: ctx.user.email,
          reviewedBy: 'paypal-automatico',
          reviewedAt: new Date(),
        },
      }),
      prisma.residency.update({
        where: { id: ctx.residency.id },
        data: {
          planStatus: 'ACTIVE',
          isActive: true,
          subscriptionEndsAt: nuevaFecha,
          lastPaymentNote: `PayPal automático ${captureRef} (+${periodMonths} mes/es)`,
        },
      }),
    ])

    await logAudit({
      actorId: ctx.user.id,
      actorRole: String(ctx.user.role),
      action: 'update',
      entity: 'subscription_payment',
      entityId: captureRef,
      newValue: {
        residencyId: ctx.residency.id,
        orderID,
        captureRef,
        amountUsd: montoCobrado,
        periodMonths,
        subscriptionEndsAt: nuevaFecha.toISOString(),
      },
      reason: 'Renovación automática de suscripción vía PayPal',
    })

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/suscripcion')
    revalidatePath('/dashboard/plataforma')

    return NextResponse.json({
      ok: true,
      subscriptionEndsAt: nuevaFecha.toISOString(),
      periodMonths,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error confirmando el pago con PayPal.'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}