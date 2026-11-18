import { NextRequest, NextResponse } from 'next/server'
import { obtenerContextoResidencia } from '@/lib/tenant'
import { crearOrdenPayPal, estaPayPalConfigurado } from '@/lib/paypal'

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
    if (ctx.user.role !== 'ADMIN' && ctx.user.role !== 'SUPERADMIN') {
      return NextResponse.json(
        { error: 'Solo el administrador de la residencia puede realizar pagos.' },
        { status: 403 }
      )
    }

    if (!estaPayPalConfigurado()) {
      return NextResponse.json(
        { error: 'PayPal aún no está configurado en el servidor.' },
        { status: 503 }
      )
    }

    const body = (await req.json().catch(() => ({}))) as { periodMonths?: unknown }
    const periodMonthsRaw = Number(body.periodMonths ?? 1)
    const periodMonths = PERIODOS_VALIDOS.includes(periodMonthsRaw) ? periodMonthsRaw : 1

    const amountUsd = Number((ctx.residency.monthlyPriceUsd * periodMonths).toFixed(2))
    if (amountUsd <= 0) {
      return NextResponse.json(
        { error: 'El monto mensual de esta residencia es $0 USD; no requiere pago.' },
        { status: 400 }
      )
    }

    const orden = await crearOrdenPayPal({
      amountUsd,
      description: `NEXO Suscripción ${ctx.residency.name} (${periodMonths} mes/es)`,
      customId: `${ctx.residency.id}|${periodMonths}|${ctx.user.id}`,
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
