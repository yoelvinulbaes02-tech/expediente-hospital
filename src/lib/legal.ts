import { headers } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'

export const LEGAL_VERSION_ACTUAL = '2026-11'

export type CanalAceptacionLegal = 'primer_acceso' | 'suscripcion_checkout'

export async function obtenerMetaSolicitudHttp(): Promise<{
  ipAddress?: string
  userAgent?: string
}> {
  try {
    const h = await headers()
    const xff = h.get('x-forwarded-for')
    const realIp = h.get('x-real-ip')
    const ipRaw = xff?.split(',')[0]?.trim() || realIp?.trim()
    const uaRaw = h.get('user-agent')?.trim()
    return {
      ipAddress: ipRaw ? ipRaw.slice(0, 64) : undefined,
      userAgent: uaRaw ? uaRaw.slice(0, 255) : undefined,
    }
  } catch {
    return {}
  }
}

export async function obtenerUltimaAceptacionLegal(userId: string): Promise<{
  aceptada: boolean
  fechaIso: string | null
  version: string | null
  canal: string | null
}> {
  try {
    const ultimo = await prisma.auditLog.findFirst({
      where: {
        actorId: userId,
        entity: 'legal_acceptance',
        action: 'consent',
      },
      orderBy: { serverTs: 'desc' },
      select: {
        serverTs: true,
        newValue: true,
      },
    })

    if (!ultimo) {
      return { aceptada: false, fechaIso: null, version: null, canal: null }
    }

    const payload =
      ultimo.newValue && typeof ultimo.newValue === 'object'
        ? (ultimo.newValue as Record<string, unknown>)
        : null

    return {
      aceptada: true,
      fechaIso: ultimo.serverTs.toISOString(),
      version: typeof payload?.legalVersion === 'string' ? payload.legalVersion : LEGAL_VERSION_ACTUAL,
      canal: typeof payload?.channel === 'string' ? payload.channel : null,
    }
  } catch (err) {
    console.error('[legal] Error consultando aceptación legal previa:', err)
    return { aceptada: false, fechaIso: null, version: null, canal: null }
  }
}

export async function registrarAceptacionLegal({
  actorId,
  actorRole,
  canal,
  detalleExtra,
  ipAddress,
  userAgent,
}: {
  actorId: string
  actorRole: string
  canal: CanalAceptacionLegal
  detalleExtra?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
}) {
  const metaHttp =
    ipAddress || userAgent ? { ipAddress, userAgent } : await obtenerMetaSolicitudHttp()

  return logAudit({
    actorId,
    actorRole,
    action: 'consent',
    entity: 'legal_acceptance',
    entityId: actorId,
    ipAddress: metaHttp.ipAddress,
    userAgent: metaHttp.userAgent,
    newValue: {
      channel: canal,
      legalVersion: LEGAL_VERSION_ACTUAL,
      acceptedTerms: true,
      acceptedPrivacy: true,
      documents: ['/terminos', '/privacidad', '/cookies', '/reembolso'],
      acceptedAtIso: new Date().toISOString(),
      ...(detalleExtra ?? {}),
    },
    reason:
      canal === 'suscripcion_checkout'
        ? `Aceptación de Términos, Reembolso y Privacidad en pago de suscripción (v${LEGAL_VERSION_ACTUAL})`
        : `Aceptación de Términos, Privacidad, Cookies y Reembolso en primer acceso (v${LEGAL_VERSION_ACTUAL})`,
  })
}
