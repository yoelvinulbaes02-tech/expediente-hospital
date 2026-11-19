import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { obtenerContextoResidencia, obtenerTarifaIndividualUsuario } from '@/lib/tenant'
import { capturarOrdenPayPal, estaPayPalConfigurado } from '@/lib/paypal'

const PERIODOS_VALIDOS = [1, 3, 6, 12]

export async function POST(req: NextRequest) {
  try {
    const ctx = await obtenerContextoResidencia()
    if (!ctx?.user || !ctx.residency) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
    }
    if (ctx.user.mustChangePassword) {
      return NextResponse.json(
        { error: 'Debes cambiar tu contraseña temporal antes de confirmar pagos.' },
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
    if (!orderID || orderID.length > 64) {
      return NextResponse.json({ error: 'orderID de PayPal inválido.' }, { status: 400 })
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

    if ((pagoCapture.amount?.currency_code ?? '').toUpperCase() !== 'USD') {
      return NextResponse.json(
        { error: 'La moneda capturada en PayPal no corresponde a USD.' },
        { status: 400 }
      )
    }

    const rawCustomId = (
      pagoCapture.custom_id ??
      captura.purchase_units?.[0]?.custom_id ??
      ''
    ).trim()
    const customParts = rawCustomId.split('|')
    const customResidencyId = customParts[0]?.trim()
    const periodParsed = parseInt(customParts[1] ?? '', 10)
    const periodMonths = PERIODOS_VALIDOS.includes(periodParsed) ? periodParsed : 1
    const customUserId = customParts[2]?.trim()
    const customScope = customParts[3]?.trim() === 'INDIVIDUAL' ? 'INDIVIDUAL' : 'RESIDENCY'

    if (!customResidencyId || customResidencyId !== ctx.residency.id) {
      return NextResponse.json(
        { error: 'Esta orden de pago no corresponde a esta residencia.' },
        { status: 403 }
      )
    }

    if (customScope === 'INDIVIDUAL') {
      if (ctx.residency.billingMode !== 'INDIVIDUAL') {
        return NextResponse.json(
          { error: 'Esta residencia utiliza pago grupal y no acepta cobros individuales.' },
          { status: 400 }
        )
      }
      if (!customUserId || customUserId !== ctx.user.id) {
        return NextResponse.json(
          { error: 'Esta orden de pago pertenece a otro usuario.' },
          { status: 403 }
        )
      }
    } else if (ctx.user.role !== 'ADMIN' && ctx.user.role !== 'SUPERADMIN') {
      return NextResponse.json(
        { error: 'Solo el administrador de la residencia puede confirmar pagos grupales.' },
        { status: 403 }
      )
    }

    const tarifaEsperada =
      customScope === 'INDIVIDUAL'
        ? obtenerTarifaIndividualUsuario(ctx.residency, ctx.user)
        : ctx.residency.monthlyPriceUsd
    const montoEsperado = Number((tarifaEsperada * periodMonths).toFixed(2))
    const montoCobrado = parseFloat(pagoCapture.amount?.value ?? '0')
    if (isNaN(montoCobrado) || montoCobrado + 0.01 < montoEsperado) {
      return NextResponse.json(
        { error: 'El monto capturado en PayPal no coincide con la tarifa del plan.' },
        { status: 400 }
      )
    }

    const captureRef = pagoCapture.id || orderID
    const metodoPago = captura.payment_source?.card ? 'tarjeta (PayPal)' : 'paypal'
    const residencyId = ctx.residency.id
    const userId = ctx.user.id
    const userEmail = ctx.user.email

    const resultado = await prisma.$transaction(async (tx) => {
      if (typeof (tx as { $executeRawUnsafe?: unknown }).$executeRawUnsafe === 'function') {
        await tx.$executeRawUnsafe('SELECT pg_advisory_xact_lock(hashtext($1))', orderID)
      }

      const duplicado = await tx.subscriptionPayment.findFirst({
        where: {
          residencyId,
          status: 'APROBADO',
          OR: [{ reference: captureRef }, { reference: orderID }, { notes: { contains: orderID } }],
        },
      })
      if (duplicado) {
        return { alreadyProcessed: true as const, nuevaFecha: null }
      }

      let base = Date.now()
      if (customScope === 'INDIVIDUAL') {
        const userActual = await tx.user.findUnique({
          where: { id: userId },
          select: { subscriptionEndsAt: true },
        })
        if (userActual?.subscriptionEndsAt && userActual.subscriptionEndsAt.getTime() > base) {
          base = userActual.subscriptionEndsAt.getTime()
        }
      } else {
        const resActual = await tx.residency.findUnique({
          where: { id: residencyId },
          select: { subscriptionEndsAt: true },
        })
        if (resActual?.subscriptionEndsAt && resActual.subscriptionEndsAt.getTime() > base) {
          base = resActual.subscriptionEndsAt.getTime()
        }
      }

      const nuevaFecha = new Date(base + periodMonths * 30 * 24 * 60 * 60 * 1000)

      await tx.subscriptionPayment.create({
        data: {
          residencyId,
          userId: customScope === 'INDIVIDUAL' ? userId : null,
          billingScope: customScope,
          amountUsd: montoCobrado,
          periodMonths,
          method: metodoPago,
          reference: captureRef,
          notes: `Pago en línea ${customScope === 'INDIVIDUAL' ? 'individual' : 'grupal'} ${metodoPago} (Orden ${orderID})`,
          status: 'APROBADO',
          requestedBy: userEmail,
          reviewedBy: 'paypal-automatico',
          reviewedAt: new Date(),
        },
      })

      if (customScope === 'INDIVIDUAL') {
        await tx.user.update({
          where: { id: userId },
          data: {
            planStatus: 'ACTIVE',
            subscriptionEndsAt: nuevaFecha,
            lastPaymentNote: `${metodoPago} ${captureRef} (+${periodMonths} mes/es)`,
          },
        })
      } else {
        await tx.residency.update({
          where: { id: residencyId },
          data: {
            planStatus: 'ACTIVE',
            isActive: true,
            subscriptionEndsAt: nuevaFecha,
            lastPaymentNote: `${metodoPago} ${captureRef} (+${periodMonths} mes/es)`,
          },
        })
      }

      return { alreadyProcessed: false as const, nuevaFecha }
    })

    if (resultado.alreadyProcessed || !resultado.nuevaFecha) {
      return NextResponse.json({ ok: true, alreadyProcessed: true, captureRef })
    }

    await logAudit({
      actorId: userId,
      actorRole: String(ctx.user.role),
      action: 'update',
      entity: 'subscription_payment',
      entityId: captureRef,
      newValue: {
        residencyId,
        userId: customScope === 'INDIVIDUAL' ? userId : null,
        billingScope: customScope,
        orderID,
        captureRef,
        method: metodoPago,
        amountUsd: montoCobrado,
        periodMonths,
        subscriptionEndsAt: resultado.nuevaFecha.toISOString(),
      },
      reason:
        customScope === 'INDIVIDUAL'
          ? 'Renovación automática de suscripción individual vía PayPal / Tarjeta'
          : 'Renovación automática de suscripción grupal vía PayPal / Tarjeta',
    })

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/suscripcion')
    revalidatePath('/dashboard/usuarios')
    revalidatePath('/dashboard/plataforma')
    revalidatePath(`/dashboard/plataforma/residencia/${residencyId}`)

    return NextResponse.json({
      ok: true,
      captureRef,
      amountUsd: montoCobrado,
      billingScope: customScope,
      subscriptionEndsAt: resultado.nuevaFecha.toISOString(),
      periodMonths,
    })
  } catch (err) {
    console.error('Error en /api/paypal/capture-order:', err)
    return NextResponse.json(
      { error: 'No se pudo confirmar el pago con PayPal. Si se realizó el cargo, contacta a soporte.' },
      { status: 500 }
    )
  }
}
