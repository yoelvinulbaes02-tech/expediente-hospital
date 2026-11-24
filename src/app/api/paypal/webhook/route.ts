import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { calcularTarifaGrupalResidencia } from '@/lib/tenant'
import {
  estaPayPalConfigurado,
  estaPayPalWebhookConfigurado,
  limpiarTagSuscripcionDeNota,
  obtenerSuscripcionPayPal,
  verificarFirmaWebhookPayPal,
} from '@/lib/paypal'

type PayPalWebhookBody = {
  id?: string
  event_type?: string
  resource?: {
    id?: string
    billing_agreement_id?: string
    custom_id?: string
    amount?: { total?: string; currency?: string }
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!estaPayPalConfigurado() || !estaPayPalWebhookConfigurado()) {
      return NextResponse.json(
        { error: 'PayPal Webhook no está configurado en este entorno.' },
        { status: 503 }
      )
    }

    const rawBody = await req.text()
    let event: PayPalWebhookBody
    try {
      event = JSON.parse(rawBody) as PayPalWebhookBody
    } catch {
      return NextResponse.json({ error: 'Payload inválido.' }, { status: 400 })
    }

    const firmaValida = await verificarFirmaWebhookPayPal(req.headers, event)
    if (!firmaValida) {
      return NextResponse.json({ error: 'Firma de webhook PayPal inválida.' }, { status: 401 })
    }

    const eventType = String(event.event_type ?? '')
    const resource = event.resource ?? {}

    if (eventType === 'PAYMENT.SALE.COMPLETED' || eventType === 'BILLING.SUBSCRIPTION.ACTIVATED') {
      const subscriptionId =
        eventType === 'PAYMENT.SALE.COMPLETED'
          ? String(resource.billing_agreement_id ?? '').trim()
          : String(resource.id ?? '').trim()

      if (!subscriptionId) {
        return NextResponse.json({ ok: true, ignored: 'Sin subscriptionId vinculado' })
      }

      const sub = await obtenerSuscripcionPayPal(subscriptionId)
      if (sub.status !== 'ACTIVE' && sub.status !== 'APPROVED') {
        return NextResponse.json({ ok: true, ignored: `Estado ${sub.status}` })
      }

      const customParts = (sub.custom_id ?? '').trim().split('|')
      const residencyId = customParts[0]?.trim()
      const customMode = customParts[1]?.trim()
      const userId = customParts[2]?.trim()
      const scope = customParts[3]?.trim() === 'INDIVIDUAL' ? 'INDIVIDUAL' : 'RESIDENCY'

      if (customMode !== 'AUTO' || !residencyId) {
        return NextResponse.json({ ok: true, ignored: 'custom_id externo' })
      }

      const saleId =
        eventType === 'PAYMENT.SALE.COMPLETED' && resource.id
          ? String(resource.id).trim()
          : subscriptionId
      const tagSub = `[SUB:${subscriptionId}]`
      const montoParsed = parseFloat(
        resource.amount?.total ?? sub.billing_info?.last_payment?.amount?.value ?? '0'
      )

      const resultado = await prisma.$transaction(async (tx) => {
        if (typeof (tx as { $executeRawUnsafe?: unknown }).$executeRawUnsafe === 'function') {
          await tx.$executeRawUnsafe('SELECT pg_advisory_xact_lock(hashtext($1))', `${subscriptionId}:${saleId}`)
        }

        const residency = await tx.residency.findUnique({
          where: { id: residencyId },
          select: {
            id: true,
            monthlyPriceUsd: true,
            individualPriceUsd: true,
            subscriptionEndsAt: true,
            surgicalStatsExtra: true,
          },
        })
        if (!residency) return { processed: false as const, reason: 'Residencia no encontrada' }

        let targetUser: { id: string; email: string; fullName: string; role: string; individualPriceUsd: number | null; subscriptionEndsAt: Date | null } | null = null
        if (userId) {
          targetUser = await tx.user.findFirst({
            where: { id: userId, residencyId: residency.id },
            select: {
              id: true,
              email: true,
              fullName: true,
              role: true,
              individualPriceUsd: true,
              subscriptionEndsAt: true,
            },
          })
        }

        if (scope === 'INDIVIDUAL' && !targetUser) {
          return { processed: false as const, reason: 'Usuario no encontrado' }
        }

        const existeSale = await tx.subscriptionPayment.findFirst({
          where: {
            residencyId: residency.id,
            status: 'APROBADO',
            reference: saleId,
          },
        })
        if (existeSale) {
          return { processed: false as const, reason: 'Pago ya acreditado' }
        }

        // Evitar duplicar el primer cobro si activate-subscription lo registró en los últimos 20 días
        const pagoRecienteSub = await tx.subscriptionPayment.findFirst({
          where: {
            residencyId: residency.id,
            status: 'APROBADO',
            OR: [{ reference: subscriptionId }, { notes: { contains: tagSub } }],
          },
          orderBy: { createdAt: 'desc' },
        })
        if (
          pagoRecienteSub &&
          Date.now() - pagoRecienteSub.createdAt.getTime() < 20 * 24 * 60 * 60 * 1000
        ) {
          return { processed: false as const, reason: 'Ciclo inicial ya acreditado' }
        }

        const activosResidencia =
          scope === 'RESIDENCY'
            ? await tx.user.count({
                where: { residencyId: residency.id, isActive: true, role: { not: 'SUPERADMIN' } },
              })
            : 0
        const tarifaEsperada =
          scope === 'INDIVIDUAL'
            ? (targetUser?.individualPriceUsd ?? residency.individualPriceUsd)
            : calcularTarifaGrupalResidencia(residency, activosResidencia).totalUsd
        const montoUsd = !Number.isNaN(montoParsed) && montoParsed > 0 ? montoParsed : tarifaEsperada

        const baseActual =
          scope === 'INDIVIDUAL'
            ? targetUser?.subscriptionEndsAt?.getTime() ?? 0
            : residency.subscriptionEndsAt?.getTime() ?? 0
        const base = Math.max(Date.now(), baseActual)
        const nuevaFecha = new Date(base + 30 * 24 * 60 * 60 * 1000)

        await tx.subscriptionPayment.create({
          data: {
            residencyId: residency.id,
            userId: scope === 'INDIVIDUAL' && targetUser ? targetUser.id : null,
            billingScope: scope,
            amountUsd: montoUsd,
            periodMonths: 1,
            method: 'paypal-suscripcion',
            reference: saleId,
            notes: `Renovación automática mensual PayPal ${tagSub}${targetUser ? ` · ${targetUser.fullName}` : ''}`,
            status: 'APROBADO',
            requestedBy: targetUser?.email ?? sub.subscriber?.email_address ?? 'paypal-webhook',
            reviewedBy: 'paypal-webhook',
            reviewedAt: new Date(),
          },
        })

        if (scope === 'INDIVIDUAL' && targetUser) {
          await tx.user.update({
            where: { id: targetUser.id },
            data: {
              planStatus: 'ACTIVE',
              subscriptionEndsAt: nuevaFecha,
              lastPaymentNote: `Suscripción automática PayPal ${tagSub}`,
            },
          })
        } else {
          await tx.residency.update({
            where: { id: residency.id },
            data: {
              planStatus: 'ACTIVE',
              isActive: true,
              subscriptionEndsAt: nuevaFecha,
              lastPaymentNote: `Suscripción automática PayPal ${tagSub}`,
            },
          })
        }

        return {
          processed: true as const,
          residencyId: residency.id,
          actorId: targetUser?.id ?? userId ?? residency.id,
          actorRole: targetUser?.role ?? 'ADMIN',
          montoUsd,
          nuevaFecha,
        }
      })

      if (resultado.processed) {
        if (resultado.actorId) {
          await logAudit({
            actorId: resultado.actorId,
            actorRole: resultado.actorRole,
            action: 'update',
            entity: 'subscription_payment',
            entityId: saleId,
            newValue: {
              subscriptionId,
              saleId,
              amountUsd: resultado.montoUsd,
              subscriptionEndsAt: resultado.nuevaFecha.toISOString(),
              via: 'paypal-webhook',
            },
            reason: `Renovación mensual automática acreditada vía Webhook PayPal (${eventType})`,
          }).catch(() => undefined)
        }

        revalidatePath('/dashboard')
        revalidatePath('/dashboard/suscripcion')
        revalidatePath('/dashboard/plataforma')
      }

      return NextResponse.json({ ok: true, ...resultado })
    }

    if (
      eventType === 'BILLING.SUBSCRIPTION.CANCELLED' ||
      eventType === 'BILLING.SUBSCRIPTION.SUSPENDED' ||
      eventType === 'BILLING.SUBSCRIPTION.PAYMENT.FAILED'
    ) {
      const subscriptionId = String(resource.id ?? '').trim()
      if (!subscriptionId) {
        return NextResponse.json({ ok: true, ignored: 'Sin subscriptionId' })
      }

      const sub = await obtenerSuscripcionPayPal(subscriptionId).catch(() => null)
      const customParts = (sub?.custom_id ?? resource.custom_id ?? '').trim().split('|')
      const residencyId = customParts[0]?.trim()
      const userId = customParts[2]?.trim()
      const scope = customParts[3]?.trim() === 'INDIVIDUAL' ? 'INDIVIDUAL' : 'RESIDENCY'

      if (residencyId) {
        const esFalloPago = eventType === 'BILLING.SUBSCRIPTION.PAYMENT.FAILED'
        if (scope === 'INDIVIDUAL' && userId) {
          const u = await prisma.user.findFirst({
            where: { id: userId, residencyId },
            select: { id: true, role: true, lastPaymentNote: true },
          })
          if (u) {
            await prisma.user.update({
              where: { id: u.id },
              data: {
                lastPaymentNote: esFalloPago
                  ? `${u.lastPaymentNote ?? `[SUB:${subscriptionId}]`} · Fallo de cobro PayPal`
                  : `${limpiarTagSuscripcionDeNota(u.lastPaymentNote)} · Renovación automática detenida (${eventType})`.trim(),
              },
            })
            await logAudit({
              actorId: u.id,
              actorRole: String(u.role),
              action: 'update',
              entity: 'subscription_payment',
              entityId: subscriptionId,
              newValue: { eventType, subscriptionId },
              reason: `Evento Webhook PayPal: ${eventType}`,
            }).catch(() => undefined)
          }
        } else {
          const r = await prisma.residency.findUnique({
            where: { id: residencyId },
            select: { id: true, lastPaymentNote: true },
          })
          if (r) {
            await prisma.residency.update({
              where: { id: r.id },
              data: {
                lastPaymentNote: esFalloPago
                  ? `${r.lastPaymentNote ?? `[SUB:${subscriptionId}]`} · Fallo de cobro PayPal`
                  : `${limpiarTagSuscripcionDeNota(r.lastPaymentNote)} · Renovación automática detenida (${eventType})`.trim(),
              },
            })
            if (userId) {
              await logAudit({
                actorId: userId,
                actorRole: 'ADMIN',
                action: 'update',
                entity: 'subscription_payment',
                entityId: subscriptionId,
                newValue: { eventType, subscriptionId },
                reason: `Evento Webhook PayPal: ${eventType}`,
              }).catch(() => undefined)
            }
          }
        }
        revalidatePath('/dashboard/suscripcion')
        revalidatePath('/dashboard/plataforma')
      }

      return NextResponse.json({ ok: true, eventType })
    }

    return NextResponse.json({ ok: true, ignored: eventType })
  } catch (err) {
    console.error('Error en /api/paypal/webhook:', err)
    return NextResponse.json({ error: 'Error procesando webhook de PayPal.' }, { status: 500 })
  }
}
