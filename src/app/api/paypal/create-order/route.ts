import { NextRequest, NextResponse } from 'next/server'
import { obtenerContextoResidencia, obtenerTarifaIndividualUsuario } from '@/lib/tenant'
import { crearOrdenPayPal, estaPayPalConfigurado } from '@/lib/paypal'
import { registrarAceptacionLegal } from '@/lib/legal'

const PERIODOS_VALIDOS = [1, 3, 6, 12]

export async function POST(req: NextRequest) {
  try {
    const ctx = await obtenerContextoResidencia()
    if (!ctx?.user || !ctx.residency) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
    }
    if (ctx.user.mustChangePassword) {
      return NextResponse.json(
        { error: 'Debes cambiar tu contraseña temporal antes de realizar pagos.' },
        { status: 403 }
      )
    }

    const esIndividual = ctx.residency.billingMode === 'INDIVIDUAL'

    if (!esIndividual && ctx.user.role !== 'ADMIN' && ctx.user.role !== 'SUPERADMIN') {
      return NextResponse.json(
        { error: 'Solo el administrador de la residencia puede realizar pagos grupales.' },
        { status: 403 }
      )
    }

    if (!estaPayPalConfigurado()) {
      return NextResponse.json(
        { error: 'PayPal aún no está configurado en el servidor.' },
        { status: 503 }
      )
    }

    const body = (await req.json().catch(() => ({}))) as {
      periodMonths?: unknown
      acceptTerms?: unknown
      acceptPrivacy?: unknown
    }

    if (body.acceptTerms !== true || body.acceptPrivacy !== true) {
      return NextResponse.json(
        {
          error:
            'Debes marcar las dos casillas de aceptación de Términos, Reembolso y Privacidad antes de pagar.',
        },
        { status: 400 }
      )
    }

    const periodMonthsRaw = Number(body.periodMonths ?? 1)
    const periodMonths = PERIODOS_VALIDOS.includes(periodMonthsRaw) ? periodMonthsRaw : 1

    const tarifaMensual = esIndividual
      ? obtenerTarifaIndividualUsuario(ctx.residency, ctx.user)
      : ctx.residency.monthlyPriceUsd
    const amountUsd = Number((tarifaMensual * periodMonths).toFixed(2))

    if (amountUsd <= 0) {
      return NextResponse.json(
        { error: 'La tarifa asignada es $0 USD; no requiere pago en línea.' },
        { status: 400 }
      )
    }

    const scope = esIndividual ? 'INDIVIDUAL' : 'RESIDENCY'
    const description = esIndividual
      ? `NEXO Individual ${ctx.user.fullName} - ${ctx.residency.name} (${periodMonths}m)`
      : `NEXO Suscripción ${ctx.residency.name} (${periodMonths} mes/es)`

    const ipAddress =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim().slice(0, 64) ||
      req.headers.get('x-real-ip')?.trim().slice(0, 64) ||
      undefined
    const userAgent = req.headers.get('user-agent')?.trim().slice(0, 255) || undefined

    await registrarAceptacionLegal({
      actorId: ctx.user.id,
      actorRole: String(ctx.user.role),
      canal: 'suscripcion_checkout',
      ipAddress,
      userAgent,
      detalleExtra: {
        residencyId: ctx.residency.id,
        billingScope: scope,
        periodMonths,
        amountUsd,
      },
    })

    const orden = await crearOrdenPayPal({
      amountUsd,
      description,
      customId: `${ctx.residency.id}|${periodMonths}|${ctx.user.id}|${scope}`,
    })

    return NextResponse.json({ orderID: orden.id })
  } catch (err) {
    console.error('Error en /api/paypal/create-order:', err)
    return NextResponse.json(
      { error: 'No se pudo iniciar la orden de PayPal. Intenta nuevamente.' },
      { status: 500 }
    )
  }
}
