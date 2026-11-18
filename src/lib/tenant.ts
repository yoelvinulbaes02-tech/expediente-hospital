import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import type { InterfaceMode, PlanStatus, Residency, User } from '@/generated/prisma'

const DIAS_GRACIA = 5

export type EstadoSuscripcion = {
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

export function evaluarSuscripcion(residency: Residency): EstadoSuscripcion {
  if (!residency.isActive || residency.planStatus === 'SUSPENDED') {
    return {
      estadoEfectivo: 'SUSPENDED',
      bloqueada: true,
      enGracia: false,
      porVencer: false,
      diasRestantes: 0,
      diasGraciaRestantes: 0,
      mensajeAviso:
        'La suscripción mensual de esta residencia está suspendida. Solo se permite lectura de expedientes hasta renovar el plan.',
    }
  }

  if (!residency.subscriptionEndsAt) {
    return {
      estadoEfectivo: residency.planStatus,
      bloqueada: false,
      enGracia: residency.planStatus === 'PAST_DUE',
      porVencer: false,
      diasRestantes: null,
      diasGraciaRestantes: null,
      mensajeAviso:
        residency.planStatus === 'PAST_DUE'
          ? 'Pago mensual pendiente de confirmación.'
          : null,
    }
  }

  const ahora = new Date()
  const vence = new Date(residency.subscriptionEndsAt)
  const msPorDia = 1000 * 60 * 60 * 24

  if (ahora <= vence) {
    const diasRestantes = Math.max(1, Math.ceil((vence.getTime() - ahora.getTime()) / msPorDia))
    const porVencer = diasRestantes <= 5
    return {
      estadoEfectivo: residency.planStatus === 'TRIAL' ? 'TRIAL' : 'ACTIVE',
      bloqueada: false,
      enGracia: false,
      porVencer,
      diasRestantes,
      diasGraciaRestantes: null,
      mensajeAviso: porVencer
        ? `El plan mensual de esta residencia vence en ${diasRestantes} día${diasRestantes === 1 ? '' : 's'}.`
        : null,
    }
  }

  const diasVencida = Math.floor((ahora.getTime() - vence.getTime()) / msPorDia)
  if (diasVencida <= DIAS_GRACIA) {
    const diasGraciaRestantes = Math.max(0, DIAS_GRACIA - diasVencida)
    return {
      estadoEfectivo: 'PAST_DUE',
      bloqueada: false,
      enGracia: true,
      porVencer: true,
      diasRestantes: 0,
      diasGraciaRestantes,
      mensajeAviso: `Suscripción vencida. Tienes ${diasGraciaRestantes} día(s) de gracia antes del paso a solo lectura.`,
    }
  }

  return {
    estadoEfectivo: 'SUSPENDED',
    bloqueada: true,
    enGracia: false,
    porVencer: false,
    diasRestantes: 0,
    diasGraciaRestantes: 0,
    mensajeAviso:
      'El período de gracia mensual expiró. La residencia pasó a modo solo lectura hasta registrar el pago.',
  }
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
        monthlyPriceUsd: 49,
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
      suscripcion: residency ? evaluarSuscripcion(residency) : null,
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
    suscripcion: evaluarSuscripcion(residency),
    esSuperAdmin: false,
    interfaceMode: residency.interfaceMode,
  }
}

export async function verificarEscrituraResidencia(
  residencyId: string | null | undefined
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!residencyId) return { ok: true }
  const residency = await prisma.residency.findUnique({
    where: { id: residencyId },
  })
  if (!residency) return { ok: false, error: 'Residencia no encontrada.' }
  const estado = evaluarSuscripcion(residency)
  if (estado.bloqueada) {
    return {
      ok: false,
      error:
        'La suscripción mensual de esta residencia está vencida o suspendida. Renueva el plan en "Suscripción" para continuar registrando.',
    }
  }
  return { ok: true }
}
