'use server'

import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { obtenerContextoResidencia } from '@/lib/tenant'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { InterfaceMode, PlanStatus } from '@/generated/prisma'

async function exigirSuperAdmin() {
  const ctx = await obtenerContextoResidencia()
  if (!ctx?.user || ctx.user.role !== 'SUPERADMIN') {
    redirect('/dashboard')
  }
  if (ctx.user.mustChangePassword) {
    redirect('/dashboard/perfil?force=true')
  }
  return ctx.user
}

function crearSlug(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function parseInterfaceMode(raw: string): InterfaceMode {
  if (raw === 'HOSPITALIZACION') return 'HOSPITALIZACION'
  if (raw === 'MEDICINA_INTERNA') return 'MEDICINA_INTERNA'
  return 'CONSULTAS'
}

export async function crearResidenciaConAdmin(formData: FormData): Promise<void> {
  const superAdmin = await exigirSuperAdmin()

  const name = String(formData.get('name') ?? '').trim()
  const specialty = String(formData.get('specialty') ?? '').trim() || 'General'
  const interfaceModeRaw = String(formData.get('interfaceMode') ?? 'CONSULTAS').trim()
  const interfaceMode = parseInterfaceMode(interfaceModeRaw)
  const planName = String(formData.get('planName') ?? 'Plan Residencia Mensual').trim()
  const monthlyPriceUsd = Math.max(0, parseInt(String(formData.get('monthlyPriceUsd') ?? '49'), 10) || 49)
  const maxActiveUsers = Math.max(1, parseInt(String(formData.get('maxActiveUsers') ?? '25'), 10) || 25)
  const planStatusRaw = String(formData.get('planStatus') ?? 'ACTIVE').trim()
  const planStatus: PlanStatus =
    planStatusRaw === 'TRIAL' ? 'TRIAL' : 'ACTIVE'
  const diasVigencia = Math.max(1, parseInt(String(formData.get('diasVigencia') ?? '30'), 10) || 30)

  const adminName = String(formData.get('adminName') ?? '').trim()
  const adminEmail = String(formData.get('adminEmail') ?? '').trim().toLowerCase()
  const adminPassword = String(formData.get('adminPassword') ?? '')

  const passwordValida =
    adminPassword.length >= 8 && /[a-zA-Z]/.test(adminPassword) && /\d/.test(adminPassword)

  if (name.length < 3 || adminName.length < 3 || !adminEmail.includes('@') || !passwordValida) {
    redirect(
      '/dashboard/plataforma?error=' +
        encodeURIComponent(
          'Completa todos los campos (contraseña mínima de 8 caracteres con letras y números).'
        )
    )
  }

  const existeCorreo = await prisma.user.findFirst({
    where: { email: { equals: adminEmail, mode: 'insensitive' } },
    select: { id: true },
  })
  if (existeCorreo) {
    redirect('/dashboard/plataforma?error=' + encodeURIComponent('Ya existe un usuario registrado con ese correo electrónico.'))
  }

  const slugBase = crearSlug(name) || `residencia-${Date.now()}`
  const slugExiste = await prisma.residency.findUnique({ where: { slug: slugBase }, select: { id: true } })
  const slug = slugExiste ? `${slugBase}-${Math.floor(100 + Math.random() * 900)}` : slugBase

  const passwordHash = await bcrypt.hash(adminPassword, 12)
  const subscriptionEndsAt = new Date(Date.now() + diasVigencia * 24 * 60 * 60 * 1000)

  const creada = await prisma.$transaction(async (tx) => {
    const res = await tx.residency.create({
      data: {
        name,
        slug,
        specialty,
        interfaceMode,
        planName,
        monthlyPriceUsd,
        maxActiveUsers,
        planStatus,
        subscriptionEndsAt,
        billingContactEmail: adminEmail,
        isActive: true,
      },
    })

    const adminUser = await tx.user.create({
      data: {
        fullName: adminName,
        email: adminEmail,
        passwordHash,
        role: 'ADMIN',
        residencyId: res.id,
        mustChangePassword: true,
      },
    })

    return { res, adminUser }
  })

  await logAudit({
    actorId: superAdmin.id,
    actorRole: 'SUPERADMIN',
    action: 'create',
    entity: 'residency',
    entityId: creada.res.id,
    newValue: {
      name,
      interfaceMode,
      specialty,
      monthlyPriceUsd,
      maxActiveUsers,
      adminEmail,
    },
    reason: 'Alta de nueva residencia en plataforma multi-tenant',
  })

  revalidatePath('/dashboard/plataforma')
  redirect('/dashboard/plataforma?ok=' + encodeURIComponent(`Residencia "${name}" creada con administrador ${adminEmail}.`))
}

export async function actualizarResidencia(formData: FormData): Promise<void> {
  const superAdmin = await exigirSuperAdmin()

  const residencyId = String(formData.get('residencyId') ?? '')
  const interfaceModeRaw = String(formData.get('interfaceMode') ?? 'HOSPITALIZACION')
  const planStatusRaw = String(formData.get('planStatus') ?? 'ACTIVE')
  const monthlyPriceUsd = Math.max(0, parseInt(String(formData.get('monthlyPriceUsd') ?? '49'), 10) || 0)
  const maxActiveUsers = Math.max(1, parseInt(String(formData.get('maxActiveUsers') ?? '25'), 10) || 1)

  const interfaceMode = parseInterfaceMode(interfaceModeRaw)
  const planStatus: PlanStatus = (
    ['TRIAL', 'ACTIVE', 'PAST_DUE', 'SUSPENDED'].includes(planStatusRaw) ? planStatusRaw : 'ACTIVE'
  ) as PlanStatus

  if (!residencyId) return

  await prisma.residency.update({
    where: { id: residencyId },
    data: {
      interfaceMode,
      planStatus,
      monthlyPriceUsd,
      maxActiveUsers,
      isActive: planStatus !== 'SUSPENDED',
    },
  })

  await logAudit({
    actorId: superAdmin.id,
    actorRole: 'SUPERADMIN',
    action: 'update',
    entity: 'residency',
    entityId: residencyId,
    newValue: { interfaceMode, planStatus, monthlyPriceUsd, maxActiveUsers },
    reason: 'Configuración de residencia actualizada desde plataforma',
  })

  revalidatePath('/dashboard/plataforma')
  revalidatePath('/dashboard')
}

export async function extenderSuscripcion(formData: FormData): Promise<void> {
  const superAdmin = await exigirSuperAdmin()
  const residencyId = String(formData.get('residencyId') ?? '')
  const dias = Math.max(1, parseInt(String(formData.get('dias') ?? '30'), 10) || 30)

  const actual = await prisma.residency.findUnique({ where: { id: residencyId } })
  if (!actual) return

  const base =
    actual.subscriptionEndsAt && actual.subscriptionEndsAt.getTime() > Date.now()
      ? actual.subscriptionEndsAt.getTime()
      : Date.now()
  const nuevaFecha = new Date(base + dias * 24 * 60 * 60 * 1000)

  await prisma.residency.update({
    where: { id: residencyId },
    data: {
      planStatus: 'ACTIVE',
      isActive: true,
      subscriptionEndsAt: nuevaFecha,
    },
  })

  await logAudit({
    actorId: superAdmin.id,
    actorRole: 'SUPERADMIN',
    action: 'update',
    entity: 'residency',
    entityId: residencyId,
    newValue: { diasAgregados: dias, subscriptionEndsAt: nuevaFecha.toISOString() },
    reason: `Suscripción extendida por ${dias} días`,
  })

  revalidatePath('/dashboard/plataforma')
  revalidatePath('/dashboard/suscripcion')
}

export async function procesarPagoSuscripcion(formData: FormData): Promise<void> {
  const superAdmin = await exigirSuperAdmin()
  const paymentId = String(formData.get('paymentId') ?? '')
  const decision = String(formData.get('decision') ?? '') === 'APROBADO' ? 'APROBADO' : 'RECHAZADO'

  const pago = await prisma.subscriptionPayment.findUnique({
    where: { id: paymentId },
    include: { residency: true },
  })
  if (!pago || pago.status !== 'PENDIENTE') return

  if (decision === 'APROBADO') {
    const base =
      pago.residency.subscriptionEndsAt && pago.residency.subscriptionEndsAt.getTime() > Date.now()
        ? pago.residency.subscriptionEndsAt.getTime()
        : Date.now()
    const nuevaFecha = new Date(base + pago.periodMonths * 30 * 24 * 60 * 60 * 1000)

    await prisma.$transaction([
      prisma.subscriptionPayment.update({
        where: { id: paymentId },
        data: {
          status: 'APROBADO',
          reviewedBy: superAdmin.email,
          reviewedAt: new Date(),
        },
      }),
      prisma.residency.update({
        where: { id: pago.residencyId },
        data: {
          planStatus: 'ACTIVE',
          isActive: true,
          subscriptionEndsAt: nuevaFecha,
          lastPaymentNote: `Aprobado pago ${pago.reference ?? pago.id} (+${pago.periodMonths} mes/es)`,
        },
      }),
    ])
  } else {
    await prisma.subscriptionPayment.update({
      where: { id: paymentId },
      data: {
        status: 'RECHAZADO',
        reviewedBy: superAdmin.email,
        reviewedAt: new Date(),
      },
    })
  }

  await logAudit({
    actorId: superAdmin.id,
    actorRole: 'SUPERADMIN',
    action: 'update',
    entity: 'subscription_payment',
    entityId: paymentId,
    newValue: { decision, residencyId: pago.residencyId, amountUsd: pago.amountUsd },
    reason: `Pago mensual ${decision.toLowerCase()} por propietario`,
  })

  revalidatePath('/dashboard/plataforma')
  revalidatePath('/dashboard/suscripcion')
}
