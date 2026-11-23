import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { obtenerContextoResidencia, obtenerTarifaIndividualUsuario } from '@/lib/tenant'
import {
  estaPayPalConfigurado,
  obtenerPrecioPlanPayPal,
  obtenerSuscripcionPayPal,
} from '@/lib/paypal'

export async function POST(req: NextRequest) {
  try {
    const ctx = await obtenerContextoResidencia()
    if (!ctx?.user || !ctx.residency) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
    }
    if (ctx.user.mustChangePassword) {
      return NextResponse.json(
        { error: 'Debes cambiar tu contraseña temporal antes de activar pagos.' },
        { status: 403 }
      )
    }

    if (!estaPayPalConfigurado()) {
      return NextResponse.json(
        { error: 'PayPal aún no está configurado en el servidor.' },
        { status: 503 }
      )
    }

    const body = (await req.json().catch(() => ({}))) as { subscriptionID?: unknown }
    const subscriptionID = String(body.subscriptionID ?? '').trim()
    if (!subscriptionID || subscriptionID.length > 64) {
      return NextResponse.json({ error: 'subscriptionID de PayPal inválido.' }, { status: 400 })
    }

    const sub = await obtenerSuscripcionPayPal(subscriptionID)
    if (sub.status !== 'ACTIVE' && sub.status !== 'APPROVED') {
      return NextResponse.json(
        { error: `La suscripción aún no está activa en PayPal (estado: ${sub.status}).` },
        { status: 400 }
      )
    }

    const customParts = (sub.custom_id ?? '').trim().split('|')
    const customResidencyId = customParts[0]?.trim()
    const customMode = customParts[1]?.trim()
    const customUserId = customParts[2]?.trim()
    const customScope = customParts[3]?.trim() === 'INDIVIDUAL' ? 'INDIVIDUAL' : 'RESIDENCY'

    if (customMode !== 'AUTO' || !customResidencyId || customResidencyId !== ctx.residency.id) {
      return NextResponse.json(
        { error: 'Esta suscripción no corresponde a esta residencia.' },
        { status: 403 }
      )
    }

    if (customScope === 'INDIVIDUAL') {
      if (ctx.residency.billingMode !== 'INDIVIDUAL') {
        return NextResponse.json(
          { error: 'Esta residencia utiliza cobro grupal y no acepta suscripciones individuales.' },
          { status: 400 }
        )
      }
      if (!customUserId || customUserId !== ctx.user.id) {
        return NextResponse.json(
          { error: 'Esta suscripción pertenece a otro usuario.' },
          { status: 403 }
        )
      }
    } else if (ctx.user.role !== 'ADMIN' && ctx.user.role !== 'SUPERADMIN') {
      return NextResponse.json(
        { error: 'Solo el administrador de la residencia puede activar suscripciones grupales.' },
        { status: 403 }
      )
    }

    const tarifaEsperada =
      customScope === 'INDIVIDUAL'
        ? obtenerTarifaIndividualUsuario(ctx.residency, ctx.user)
        : ctx.residency.monthlyPriceUsd

    if (sub.plan_id) {
      const precioPlan = await obtenerPrecioPlanPayPal(sub.plan_id)
      if (
        precioPlan &&
        (precioPlan.currencyCode !== 'USD' || precioPlan.value + 0.01 < tarifaEsperada)
      ) {
        return NextResponse.json(
          { error: 'El plan vinculado en PayPal no coincide con la tarifa vigente.' },
          { status: 400 }
        )
      }
    }

    const lastPaymentAmount = parseFloat(sub.billing_info?.last_payment?.amount?.value ?? '')
    const montoCobrado =
      !Number.isNaN(lastPaymentAmount) && lastPaymentAmount > 0 ? lastPaymentAmount : tarifaEsperada

    const residencyId = ctx.residency.id
    const userId = ctx.user.id
    const userEmail = ctx.user.email
    const tagSub = `[SUB:${subscriptionID}]`

    const resultado = await prisma.$transaction(async (tx) => {
      if (typeof (tx as { $executeRawUnsafe?: unknown }).$executeRawUnsafe === 'function') {
        await tx.$executeRawUnsafe('SELECT pg_advisory_xact_lock(hashtext($1))', subscriptionID)
      }

      const duplicado = await tx.subscriptionPayment.findFirst({
        where: {
          residencyId,
          status: 'APROBADO',
          OR: [{ reference: subscriptionID }, { notes: { contains: tagSub } }],
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

      const nuevaFecha = new Date(base + 30 * 24 * 60 * 60 * 1000)

      await tx.subscriptionPayment.create({
        data: {
          residencyId,
          userId: customScope === 'INDIVIDUAL' ? userId : null,
          billingScope: customScope,
          amountUsd: montoCobrado,
          periodMonths: 1,
          method: 'paypal-suscripcion',
          reference: subscriptionID,
          notes: `Suscripción mensual automática ${customScope === 'INDIVIDUAL' ? 'individual' : 'grupal'} · ${ctx.user.fullName} ${tagSub}`,
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
            lastPaymentNote: `Suscripción automática PayPal ${tagSub}`,
          },
        })
      } else {
        await tx.residency.update({
          where: { id: residencyId },
          data: {
            planStatus: 'ACTIVE',
            isActive: true,
            subscriptionEndsAt: nuevaFecha,
            lastPaymentNote: `Suscripción automática PayPal ${tagSub}`,
          },
        })
      }

      return { alreadyProcessed: false as const, nuevaFecha }
    })

    if (resultado.alreadyProcessed || !resultado.nuevaFecha) {
      return NextResponse.json({ ok: true, alreadyProcessed: true, subscriptionID })
    }

    await logAudit({
      actorId: userId,
      actorRole: String(ctx.user.role),
      action: 'update',
      entity: 'subscription_payment',
      entityId: subscriptionID,
      newValue: {
        residencyId,
        userId: customScope === 'INDIVIDUAL' ? userId : null,
        billingScope: customScope,
        subscriptionID,
        method: 'paypal-suscripcion',
        amountUsd: montoCobrado,
        subscriptionEndsAt: resultado.nuevaFecha.toISOString(),
      },
      reason:
        customScope === 'INDIVIDUAL'
          ? 'Activación de suscripción mensual automática individual vía PayPal'
          : 'Activación de suscripción mensual automática grupal vía PayPal',
    })

    revalidatePath('/dashboard')
    revalidatePath('/dashboard/suscripcion')
    revalidatePath('/dashboard/usuarios')
    revalidatePath('/dashboard/plataforma')
    revalidatePath(`/dashboard/plataforma/residencia/${residencyId}`)

    return NextResponse.json({
      ok: true,
      subscriptionID,
      amountUsd: montoCobrado,
      billingScope: customScope,
      subscriptionEndsAt: resultado.nuevaFecha.toISOString(),
    })
  } catch (err) {
    console.error('Error en /api/paypal/activate-subscription:', err)
    return NextResponse.json(
      { error: 'No se pudo activar la suscripción automática en PayPal.' },
      { status: 500 }
    )
  }
}
