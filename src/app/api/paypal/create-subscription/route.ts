import { NextRequest, NextResponse } from 'next/server'
import {
  calcularTarifaGrupalResidencia,
  contarUsuariosActivosResidencia,
  obtenerContextoResidencia,
  obtenerTarifaIndividualUsuario,
} from '@/lib/tenant'
import {
  asegurarPlanMensualPayPal,
  crearSuscripcionPayPal,
  estaPayPalConfigurado,
} from '@/lib/paypal'
import { registrarAceptacionLegal } from '@/lib/legal'

export async function POST(req: NextRequest) {
  try {
    const ctx = await obtenerContextoResidencia()
    if (!ctx?.user || !ctx.residency) {
      return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
    }
    if (ctx.user.mustChangePassword) {
      return NextResponse.json(
        { error: 'Debes cambiar tu contraseña temporal antes de suscribirte.' },
        { status: 403 }
      )
    }

    const esIndividual = ctx.residency.billingMode === 'INDIVIDUAL'

    if (!esIndividual && ctx.user.role !== 'ADMIN' && ctx.user.role !== 'SUPERADMIN') {
      return NextResponse.json(
        { error: 'Solo el administrador de la residencia puede activar la suscripción grupal.' },
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
      acceptTerms?: unknown
      acceptPrivacy?: unknown
    }

    if (body.acceptTerms !== true || body.acceptPrivacy !== true) {
      return NextResponse.json(
        {
          error:
            'Debes marcar las dos casillas de aceptación de Términos, Reembolso y Privacidad antes de activar el cargo automático.',
        },
        { status: 400 }
      )
    }

    const tarifaMensual = esIndividual
      ? obtenerTarifaIndividualUsuario(ctx.residency, ctx.user)
      : calcularTarifaGrupalResidencia(
          ctx.residency,
          await contarUsuariosActivosResidencia(ctx.residency.id)
        ).totalUsd

    if (tarifaMensual <= 0) {
      return NextResponse.json(
        { error: 'La tarifa asignada es $0 USD; no requiere suscripción de pago en línea.' },
        { status: 400 }
      )
    }

    const scope: 'INDIVIDUAL' | 'RESIDENCY' = esIndividual ? 'INDIVIDUAL' : 'RESIDENCY'

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
        modalidad: 'recurrente_mensual',
        residencyId: ctx.residency.id,
        billingScope: scope,
        amountUsd: Number(tarifaMensual.toFixed(2)),
      },
    })

    const planId = await asegurarPlanMensualPayPal({
      amountUsd: tarifaMensual,
      scopeLabel: scope,
    })

    const origin =
      process.env.NEXTAUTH_URL?.replace(/\/$/, '') || req.nextUrl.origin
    const suscripcion = await crearSuscripcionPayPal({
      planId,
      customId: `${ctx.residency.id}|AUTO|${ctx.user.id}|${scope}`,
      subscriberEmail: ctx.user.email,
      subscriberName: ctx.user.fullName,
      returnUrl: `${origin}/dashboard/suscripcion`,
      cancelUrl: `${origin}/dashboard/suscripcion`,
    })

    return NextResponse.json({ subscriptionID: suscripcion.id })
  } catch (err) {
    console.error('Error en /api/paypal/create-subscription:', err)
    return NextResponse.json(
      { error: 'No se pudo iniciar la suscripción mensual automática en PayPal.' },
      { status: 500 }
    )
  }
}
