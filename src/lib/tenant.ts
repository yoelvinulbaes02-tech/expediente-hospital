import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import type { BillingMode, InterfaceMode, PlanStatus, Residency, User } from '@/generated/prisma'

const DIAS_GRACIA = 5

export type EstadoSuscripcion = {
  modoCobro: BillingMode
  estadoEfectivo: PlanStatus
  bloqueada: boolean
  enGracia: boolean
  porVencer: boolean
  diasRestantes: number | null
  diasGraciaRestantes: number | null
  mensajeAviso: string | null
}

export type ContextoResidencia = {
  user: User
  residency: Residency | null
  suscripcion: EstadoSuscripcion | null
  esSuperAdmin: boolean
  interfaceMode: InterfaceMode
}

export function evaluarPlanEstado({
  isActive,
  planStatus,
  subscriptionEndsAt,
  modoCobro,
}: {
  isActive: boolean
  planStatus: PlanStatus
  subscriptionEndsAt: Date | null
  modoCobro: BillingMode
}): EstadoSuscripcion {
  const esIndividual = modoCobro === 'INDIVIDUAL'

  if (!isActive || planStatus === 'SUSPENDED') {
    return {
      modoCobro,
      estadoEfectivo: 'SUSPENDED',
      bloqueada: true,
      enGracia: false,
      porVencer: false,
      diasRestantes: 0,
      diasGraciaRestantes: 0,
      mensajeAviso: esIndividual
        ? 'Tu suscripción individual está suspendida. Solo tienes acceso de lectura hasta renovar tu plan en "Mi Suscripción".'
        : 'La suscripción mensual de esta residencia está suspendida. Solo se permite lectura de expedientes hasta renovar el plan.',
    }
  }

  if (!subscriptionEndsAt) {
    return {
      modoCobro,
      estadoEfectivo: planStatus,
      bloqueada: false,
      enGracia: planStatus === 'PAST_DUE',
      porVencer: false,
      diasRestantes: null,
      diasGraciaRestantes: null,
      mensajeAviso:
        planStatus === 'PAST_DUE'
          ? esIndividual
            ? 'Tu suscripción individual tiene un pago pendiente de activación.'
            : 'Pago mensual pendiente de confirmación.'
          : null,
    }
  }

  const ahora = new Date()
  const vence = new Date(subscriptionEndsAt)
  const msPorDia = 1000 * 60 * 60 * 24

  if (ahora <= vence) {
    const diasRestantes = Math.max(1, Math.ceil((vence.getTime() - ahora.getTime()) / msPorDia))
    const porVencer = diasRestantes <= 5
    return {
      modoCobro,
      estadoEfectivo: planStatus === 'TRIAL' ? 'TRIAL' : 'ACTIVE',
      bloqueada: false,
      enGracia: false,
      porVencer,
      diasRestantes,
      diasGraciaRestantes: null,
      mensajeAviso: porVencer
        ? esIndividual
          ? `Tu suscripción individual vence en ${diasRestantes} día${diasRestantes === 1 ? '' : 's'}.`
          : `El plan mensual de esta residencia vence en ${diasRestantes} día${diasRestantes === 1 ? '' : 's'}.`
        : null,
    }
  }

  const diasVencida = Math.floor((ahora.getTime() - vence.getTime()) / msPorDia)
  if (diasVencida <= DIAS_GRACIA) {
    const diasGraciaRestantes = Math.max(0, DIAS_GRACIA - diasVencida)
    return {
      modoCobro,
      estadoEfectivo: 'PAST_DUE',
      bloqueada: false,
      enGracia: true,
      porVencer: true,
      diasRestantes: 0,
      diasGraciaRestantes,
      mensajeAviso: esIndividual
        ? `Tu suscripción individual venció. Tienes ${diasGraciaRestantes} día(s) de gracia antes de pasar a solo lectura.`
        : `Suscripción vencida. Tienes ${diasGraciaRestantes} día(s) de gracia antes del paso a solo lectura.`,
    }
  }

  return {
    modoCobro,
    estadoEfectivo: 'SUSPENDED',
    bloqueada: true,
    enGracia: false,
    porVencer: false,
    diasRestantes: 0,
    diasGraciaRestantes: 0,
    mensajeAviso: esIndividual
      ? 'Tu período de gracia individual expiró. Pasaste a modo solo lectura hasta renovar tu suscripción.'
      : 'El período de gracia mensual expiró. La residencia pasó a modo solo lectura hasta registrar el pago.',
  }
}

export function evaluarSuscripcion(
  residency: Residency,
  user?: Pick<User, 'isActive' | 'planStatus' | 'subscriptionEndsAt'> | null
): EstadoSuscripcion {
  const estadoResidencia = evaluarPlanEstado({
    isActive: residency.isActive,
    planStatus: residency.planStatus,
    subscriptionEndsAt: residency.subscriptionEndsAt,
    modoCobro: 'RESIDENCY',
  })

  if (residency.billingMode === 'INDIVIDUAL' && user) {
    // Si la residencia completa está suspendida administrativamente, prevalece el bloqueo global
    if (!residency.isActive || residency.planStatus === 'SUSPENDED') {
      return {
        ...estadoResidencia,
        modoCobro: 'INDIVIDUAL',
      }
    }

    return evaluarPlanEstado({
      isActive: user.isActive,
      planStatus: user.planStatus,
      subscriptionEndsAt: user.subscriptionEndsAt,
      modoCobro: 'INDIVIDUAL',
    })
  }

  return estadoResidencia
}

export function obtenerTarifaIndividualUsuario(
  residency: Pick<Residency, 'individualPriceUsd'>,
  user: Pick<User, 'individualPriceUsd'>
): number {
  return user.individualPriceUsd ?? residency.individualPriceUsd
}

export async function asegurarResidenciaPrincipal(): Promise<Residency> {
  let principal = await prisma.residency.findFirst({
    where: {
      OR: [{ slug: 'residencia-principal' }, { interfaceMode: 'HOSPITALIZACION' }],
    },
    orderBy: { createdAt: 'asc' },
  })

  if (!principal) {
    principal = await prisma.residency.create({
      data: {
        name: 'Residencia Principal (Hospital)',
        slug: 'residencia-principal',
        specialty: 'Nefrología / Medicina Hospitalaria',
        interfaceMode: 'HOSPITALIZACION',
        planName: 'Plan Residencia Mensual',
        billingMode: 'RESIDENCY',
        monthlyPriceUsd: 49,
        individualPriceUsd: 15,
        maxActiveUsers: 50,
        planStatus: 'ACTIVE',
        isActive: true,
      },
    })
  }

  await Promise.all([
    prisma.user.updateMany({
      where: { residencyId: null, role: { not: 'SUPERADMIN' } },
      data: { residencyId: principal.id },
    }),
    prisma.patient.updateMany({
      where: { residencyId: null },
      data: { residencyId: principal.id },
    }),
    prisma.episode.updateMany({
      where: { residencyId: null },
      data: { residencyId: principal.id },
    }),
  ])

  return principal
}

export async function obtenerContextoResidencia(): Promise<ContextoResidencia | null> {
  const session = await auth()
  if (!session?.user?.id) return null

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { residency: true },
  })

  if (!user || !user.isActive) return null

  if (user.role === 'SUPERADMIN') {
    const residency = user.residency ?? null
    return {
      user,
      residency,
      suscripcion: residency ? evaluarSuscripcion(residency, user) : null,
      esSuperAdmin: true,
      interfaceMode: residency?.interfaceMode ?? 'HOSPITALIZACION',
    }
  }

  let residency = user.residency
  if (!residency) {
    residency = await asegurarResidenciaPrincipal()
    await prisma.user.update({
      where: { id: user.id },
      data: { residencyId: residency.id },
    })
  }

  return {
    user,
    residency,
    suscripcion: evaluarSuscripcion(residency, user),
    esSuperAdmin: false,
    interfaceMode: residency.interfaceMode,
  }
}

export async function verificarEscrituraResidencia(
  residencyId: string | null | undefined,
  userId?: string | null
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!residencyId) return { ok: true }
  const residency = await prisma.residency.findUnique({
    where: { id: residencyId },
  })
  if (!residency) return { ok: false, error: 'Residencia no encontrada.' }

  if (residency.billingMode === 'INDIVIDUAL') {
    if (!residency.isActive || residency.planStatus === 'SUSPENDED') {
      return {
        ok: false,
        error:
          'Esta residencia está suspendida temporalmente por administración de plataforma.',
      }
    }

    let targetUserId = userId ?? null
    if (!targetUserId) {
      const session = await auth()
      targetUserId = session?.user?.id ?? null
    }
    if (!targetUserId) {
      return { ok: false, error: 'Sesión inválida para validar suscripción individual.' }
    }

    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { isActive: true, planStatus: true, subscriptionEndsAt: true, role: true },
    })
    if (!user || !user.isActive) {
      return { ok: false, error: 'Tu usuario se encuentra inactivo.' }
    }
    if (user.role === 'SUPERADMIN') return { ok: true }

    const estadoUsuario = evaluarPlanEstado({
      isActive: user.isActive,
      planStatus: user.planStatus,
      subscriptionEndsAt: user.subscriptionEndsAt,
      modoCobro: 'INDIVIDUAL',
    })
    if (estadoUsuario.bloqueada) {
      return {
        ok: false,
        error:
          'Tu suscripción individual está vencida o suspendida. Renuévala en "Mi Suscripción" para continuar registrando.',
      }
    }
    return { ok: true }
  }

  const estado = evaluarPlanEstado({
    isActive: residency.isActive,
    planStatus: residency.planStatus,
    subscriptionEndsAt: residency.subscriptionEndsAt,
    modoCobro: 'RESIDENCY',
  })
  if (estado.bloqueada) {
    return {
      ok: false,
      error:
        'La suscripción mensual de esta residencia está vencida o suspendida. Renueva el plan en "Suscripción" para continuar registrando.',
    }
  }
  return { ok: true }
}
