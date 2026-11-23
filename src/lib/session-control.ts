import { randomBytes } from 'crypto'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'

export const MAX_SESIONES_SIMULTANEAS = 2
export const SESSION_WINDOW_MS = 12 * 60 * 60 * 1000

export function obtenerLimiteSesiones(): number {
  return MAX_SESIONES_SIMULTANEAS
}

export function generarNonceSesion(): string {
  return randomBytes(16).toString('hex')
}

export function resumirDispositivo(ua?: string | null): string {
  const raw = (ua ?? '').trim()
  if (!raw) return 'Desconocido'
  const lower = raw.toLowerCase()

  let os = 'Otro SO'
  if (lower.includes('iphone')) os = 'iPhone'
  else if (lower.includes('ipad')) os = 'iPad'
  else if (lower.includes('android')) os = 'Android'
  else if (lower.includes('windows')) os = 'Windows'
  else if (lower.includes('mac os') || lower.includes('macintosh')) os = 'macOS'
  else if (lower.includes('linux')) os = 'Linux'

  let browser = 'Navegador'
  if (lower.includes('edg/')) browser = 'Edge'
  else if (lower.includes('opr/') || lower.includes('opera')) browser = 'Opera'
  else if (lower.includes('firefox/')) browser = 'Firefox'
  else if (lower.includes('chrome/') || lower.includes('crios/')) browser = 'Chrome'
  else if (lower.includes('safari/')) browser = 'Safari'

  return `${os} · ${browser}`
}

export async function registrarNuevaSesionYEviccionarExceso({
  actorId,
  actorRole,
  ipAddress,
  userAgent,
  sessionNonce,
}: {
  actorId: string
  actorRole: string
  ipAddress?: string
  userAgent?: string
  sessionNonce: string
}): Promise<{ evictedCount: number }> {
  const limite = obtenerLimiteSesiones()
  const desde = new Date(Date.now() - SESSION_WINDOW_MS)

  const eventosRecientes = await prisma.auditLog
    .findMany({
      where: {
        actorId,
        entity: 'auth',
        action: { in: ['login', 'session_evicted', 'logout'] },
        serverTs: { gte: desde },
      },
      orderBy: { serverTs: 'desc' },
      take: 60,
      select: {
        action: true,
        newValue: true,
        ipAddress: true,
        userAgent: true,
      },
    })
    .catch(() => [])

  const revocados = new Set<string>()
  for (const ev of eventosRecientes) {
    if (!ev.newValue || typeof ev.newValue !== 'object' || Array.isArray(ev.newValue)) continue
    const val = ev.newValue as Record<string, unknown>
    if (ev.action === 'session_evicted' && typeof val.evictedNonce === 'string') {
      revocados.add(val.evictedNonce)
    } else if (ev.action === 'logout' && typeof val.logoutNonce === 'string') {
      revocados.add(val.logoutNonce)
    }
  }

  const sesionesActivas: Array<{
    nonce: string
    ipAddress: string | null
    userAgent: string | null
  }> = []
  const vistos = new Set<string>()

  for (const ev of eventosRecientes) {
    if (ev.action !== 'login') continue
    if (!ev.newValue || typeof ev.newValue !== 'object' || Array.isArray(ev.newValue)) continue
    const val = ev.newValue as Record<string, unknown>
    const nonce = typeof val.sessionNonce === 'string' ? val.sessionNonce : ''
    if (!nonce || revocados.has(nonce) || vistos.has(nonce)) continue
    vistos.add(nonce)
    sesionesActivas.push({
      nonce,
      ipAddress: ev.ipAddress,
      userAgent: ev.userAgent,
    })
  }

  // Mantener máximo (limite - 1) sesiones previas para que al entrar esta nueva queden exactamente `limite` (2).
  const aExpulsar = sesionesActivas.slice(Math.max(0, limite - 1))

  for (const vieja of aExpulsar) {
    await logAudit({
      actorId,
      actorRole,
      action: 'session_evicted',
      entity: 'auth',
      newValue: {
        evictedNonce: vieja.nonce,
        evictedIp: vieja.ipAddress,
        evictedDevice: resumirDispositivo(vieja.userAgent),
        replacedByIp: ipAddress ?? null,
        replacedByDevice: resumirDispositivo(userAgent),
        limiteSesiones: limite,
      },
      reason: `Sesión cerrada automáticamente al superar el máximo de ${limite} sesiones simultáneas`,
      ipAddress,
      userAgent,
    })
  }

  await logAudit({
    actorId,
    actorRole,
    action: 'login',
    entity: 'auth',
    newValue: {
      sessionNonce,
      device: resumirDispositivo(userAgent),
    },
    reason: 'Inicio de sesión exitoso',
    ipAddress,
    userAgent,
  })

  return { evictedCount: aExpulsar.length }
}

export async function estaSesionRevocada({
  actorId,
  sessionNonce,
  sessionStartedAt,
}: {
  actorId: string
  sessionNonce: string
  sessionStartedAt?: number | null
}): Promise<{ revocada: boolean; motivo: 'evicted' | 'logout' | null }> {
  const desde = new Date((sessionStartedAt ?? Date.now() - SESSION_WINDOW_MS) - 10_000)

  const eventos = await prisma.auditLog.findMany({
    where: {
      actorId,
      entity: 'auth',
      action: { in: ['session_evicted', 'logout'] },
      serverTs: { gte: desde },
    },
    orderBy: { serverTs: 'desc' },
    take: 30,
    select: {
      action: true,
      newValue: true,
    },
  })

  for (const ev of eventos) {
    if (!ev.newValue || typeof ev.newValue !== 'object' || Array.isArray(ev.newValue)) continue
    const val = ev.newValue as Record<string, unknown>
    if (ev.action === 'session_evicted' && val.evictedNonce === sessionNonce) {
      return { revocada: true, motivo: 'evicted' }
    }
    if (ev.action === 'logout' && val.logoutNonce === sessionNonce) {
      return { revocada: true, motivo: 'logout' }
    }
  }

  return { revocada: false, motivo: null }
}

export async function registrarCierreSesionNonce({
  actorId,
  actorRole,
  sessionNonce,
}: {
  actorId: string
  actorRole: string
  sessionNonce?: string | null
}) {
  if (!sessionNonce) return
  try {
    await logAudit({
      actorId,
      actorRole,
      action: 'logout',
      entity: 'auth',
      newValue: { logoutNonce: sessionNonce },
      reason: 'Cierre de sesión manual del usuario',
    })
  } catch (err) {
    console.error('[session-control] Error registrando cierre de sesión:', err)
  }
}

export type AlertaCuentaCompartida = {
  userId: string
  fullName: string
  email: string
  role: string
  residencyId: string | null
  residencyName: string
  billingMode: string
  evictions24h: number
  evictions7d: number
  logins24h: number
  uniqueIps24h: number
  uniqueDevices24h: number
  dispositivos24h: string[]
  lastEventAt: string
  lastIp: string | null
  riesgoScore: number
}

export async function obtenerAlertasCuentasCompartidas(): Promise<{
  alertas: AlertaCuentaCompartida[]
  totalExpulsiones24h: number
}> {
  const ahora = Date.now()
  const hace24h = new Date(ahora - 24 * 60 * 60 * 1000)
  const hace7d = new Date(ahora - 7 * 24 * 60 * 60 * 1000)

  const eventos = await prisma.auditLog
    .findMany({
      where: {
        entity: 'auth',
        action: { in: ['login', 'session_evicted'] },
        serverTs: { gte: hace7d },
      },
      orderBy: { serverTs: 'desc' },
      take: 1500,
      select: {
        actorId: true,
        actorRole: true,
        action: true,
        ipAddress: true,
        userAgent: true,
        serverTs: true,
        actor: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
            residencyId: true,
            residency: {
              select: {
                name: true,
                billingMode: true,
              },
            },
          },
        },
      },
    })
    .catch(() => [])

  type Acum = {
    userId: string
    fullName: string
    email: string
    role: string
    residencyId: string | null
    residencyName: string
    billingMode: string
    evictions24h: number
    evictions7d: number
    logins24h: number
    ips24h: Set<string>
    devices24h: Set<string>
    lastEventAt: Date
    lastIp: string | null
  }

  const porUsuario = new Map<string, Acum>()
  let totalExpulsiones24h = 0

  for (const ev of eventos) {
    if (!ev.actor || ev.actor.role === 'SUPERADMIN') continue
    const es24h = ev.serverTs >= hace24h

    if (ev.action === 'session_evicted' && es24h) {
      totalExpulsiones24h += 1
    }

    const actual = porUsuario.get(ev.actorId) ?? {
      userId: ev.actor.id,
      fullName: ev.actor.fullName,
      email: ev.actor.email,
      role: String(ev.actor.role),
      residencyId: ev.actor.residencyId ?? null,
      residencyName: ev.actor.residency?.name ?? 'Sin residencia',
      billingMode: ev.actor.residency?.billingMode ?? 'RESIDENCY',
      evictions24h: 0,
      evictions7d: 0,
      logins24h: 0,
      ips24h: new Set<string>(),
      devices24h: new Set<string>(),
      lastEventAt: ev.serverTs,
      lastIp: ev.ipAddress ?? null,
    }

    if (ev.serverTs > actual.lastEventAt) {
      actual.lastEventAt = ev.serverTs
      actual.lastIp = ev.ipAddress ?? actual.lastIp
    }

    if (ev.action === 'session_evicted') {
      actual.evictions7d += 1
      if (es24h) actual.evictions24h += 1
    } else if (ev.action === 'login' && es24h) {
      actual.logins24h += 1
    }

    if (es24h) {
      if (ev.ipAddress) actual.ips24h.add(ev.ipAddress)
      const disp = resumirDispositivo(ev.userAgent)
      if (disp !== 'Desconocido') actual.devices24h.add(disp)
    }

    porUsuario.set(ev.actorId, actual)
  }

  const alertas: AlertaCuentaCompartida[] = []
  for (const item of porUsuario.values()) {
    const uniqueIps24h = item.ips24h.size
    const uniqueDevices24h = item.devices24h.size
    const sospechosa =
      item.evictions24h >= 1 ||
      item.evictions7d >= 2 ||
      uniqueIps24h >= 4 ||
      uniqueDevices24h >= 3

    if (!sospechosa) continue

    const riesgoScore =
      item.evictions24h * 10 +
      item.evictions7d * 3 +
      uniqueDevices24h * 3 +
      uniqueIps24h

    alertas.push({
      userId: item.userId,
      fullName: item.fullName,
      email: item.email,
      role: item.role,
      residencyId: item.residencyId,
      residencyName: item.residencyName,
      billingMode: item.billingMode,
      evictions24h: item.evictions24h,
      evictions7d: item.evictions7d,
      logins24h: item.logins24h,
      uniqueIps24h,
      uniqueDevices24h,
      dispositivos24h: Array.from(item.devices24h),
      lastEventAt: item.lastEventAt.toISOString(),
      lastIp: item.lastIp,
      riesgoScore,
    })
  }

  alertas.sort((a, b) => b.riesgoScore - a.riesgoScore)

  return { alertas, totalExpulsiones24h }
}
