'use server'

import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { obtenerContextoResidencia } from '@/lib/tenant'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import type { BillingMode, InterfaceMode, PlanStatus } from '@/generated/prisma'

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
  if (raw === 'CIRUGIA') return 'CIRUGIA'
  if (raw === 'ORTOPEDIA') return 'ORTOPEDIA'
  return 'CONSULTAS'
}

function parseBillingMode(raw: string): BillingMode {
  return raw === 'INDIVIDUAL' ? 'INDIVIDUAL' : 'RESIDENCY'
}

function parsePlanStatus(raw: string): PlanStatus {
  if (['TRIAL', 'ACTIVE', 'PAST_DUE', 'SUSPENDED'].includes(raw)) {
    return raw as PlanStatus
  }
  return 'ACTIVE'
}

export async function crearResidenciaConAdmin(formData: FormData): Promise<void> {
  const superAdmin = await exigirSuperAdmin()

  const name = String(formData.get('name') ?? '').trim()
  const specialty = String(formData.get('specialty') ?? '').trim() || 'General'
  const interfaceMode = parseInterfaceMode(String(formData.get('interfaceMode') ?? 'CONSULTAS').trim())
  const billingMode = parseBillingMode(String(formData.get('billingMode') ?? 'RESIDENCY').trim())
  const planName = String(formData.get('planName') ?? 'Plan Residencia Mensual').trim()
  const monthlyPriceUsd = Math.max(0, parseInt(String(formData.get('monthlyPriceUsd') ?? '49'), 10) || 49)
  const individualPriceUsd = Math.max(
    0,
    parseInt(String(formData.get('individualPriceUsd') ?? '15'), 10) || 15
  )
  const maxActiveUsers = Math.max(1, parseInt(String(formData.get('maxActiveUsers') ?? '25'), 10) || 25)
  const planStatusRaw = String(formData.get('planStatus') ?? 'ACTIVE').trim()
  const planStatus: PlanStatus = planStatusRaw === 'TRIAL' ? 'TRIAL' : 'ACTIVE'
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
    redirect(
      '/dashboard/plataforma?error=' +
        encodeURIComponent('Ya existe un usuario registrado con ese correo electrónico.')
    )
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
        billingMode,
        planName,
        monthlyPriceUsd,
        individualPriceUsd,
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
        planStatus,
        subscriptionEndsAt: billingMode === 'INDIVIDUAL' ? subscriptionEndsAt : null,
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
      billingMode,
      specialty,
      monthlyPriceUsd,
      individualPriceUsd,
      maxActiveUsers,
      adminEmail,
    },
    reason: 'Alta de nueva residencia en plataforma multi-tenant',
  })

  revalidatePath('/dashboard/plataforma')
  redirect(
    '/dashboard/plataforma?ok=' +
      encodeURIComponent(`Residencia "${name}" creada con administrador ${adminEmail}.`)
  )
}

export async function actualizarResidencia(formData: FormData): Promise<void> {
  const superAdmin = await exigirSuperAdmin()

  const residencyId = String(formData.get('residencyId') ?? '')
  const interfaceMode = parseInterfaceMode(String(formData.get('interfaceMode') ?? 'HOSPITALIZACION'))
  const billingMode = parseBillingMode(String(formData.get('billingMode') ?? 'RESIDENCY'))
  const planStatus = parsePlanStatus(String(formData.get('planStatus') ?? 'ACTIVE'))

  const monthlyPriceParsed = parseInt(String(formData.get('monthlyPriceUsd') ?? '49'), 10)
  const monthlyPriceUsd = Number.isFinite(monthlyPriceParsed) ? Math.max(0, monthlyPriceParsed) : 49

  const individualPriceParsed = parseInt(String(formData.get('individualPriceUsd') ?? '15'), 10)
  const individualPriceUsd = Number.isFinite(individualPriceParsed)
    ? Math.max(0, individualPriceParsed)
    : 15

  const maxUsersParsed = parseInt(String(formData.get('maxActiveUsers') ?? '25'), 10)
  const maxActiveUsers = Number.isFinite(maxUsersParsed) ? Math.max(1, maxUsersParsed) : 25

  const redirectTo = String(formData.get('redirectTo') ?? '').trim()

  if (!residencyId) return

  const targetErrorUrl = redirectTo.startsWith('/dashboard/plataforma')
    ? redirectTo
    : '/dashboard/plataforma'

  try {
    await prisma.residency.update({
      where: { id: residencyId },
      data: {
        interfaceMode,
        billingMode,
        planStatus,
        monthlyPriceUsd,
        individualPriceUsd,
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
      newValue: {
        interfaceMode,
        billingMode,
        planStatus,
        monthlyPriceUsd,
        individualPriceUsd,
        maxActiveUsers,
      },
      reason: 'Configuración de residencia actualizada desde plataforma',
    })
  } catch (err) {
    console.error('Error al actualizar residencia:', err)
    redirect(
      `${targetErrorUrl}?error=${encodeURIComponent(
        'No se pudo guardar la configuración. Si elegiste Ortopedia, Cirugía o Medicina Interna, verifica haber ejecutado el SQL de migración en Neon (ALTER TYPE "InterfaceMode" ADD VALUE \'ORTOPEDIA\').'
      )}`
    )
  }

  revalidatePath('/dashboard/plataforma')
  revalidatePath(`/dashboard/plataforma/residencia/${residencyId}`)
  revalidatePath('/dashboard/suscripcion')
  revalidatePath('/dashboard/usuarios')
  revalidatePath('/dashboard')

  if (redirectTo.startsWith('/dashboard/plataforma')) {
    redirect(
      `${redirectTo}?ok=${encodeURIComponent('Configuración de cobro, interfaz y plan de la residencia actualizada.')}`
    )
  }
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
    reason: `Suscripción grupal extendida por ${dias} días`,
  })

  revalidatePath('/dashboard/plataforma')
  revalidatePath(`/dashboard/plataforma/residencia/${residencyId}`)
  revalidatePath('/dashboard/suscripcion')
}

export async function cambiarModalidadCobroResidencia(formData: FormData): Promise<void> {
  const superAdmin = await exigirSuperAdmin()
  const residencyId = String(formData.get('residencyId') ?? '').trim()
  const billingMode = parseBillingMode(String(formData.get('billingMode') ?? 'RESIDENCY'))
  if (!residencyId) return

  const actual = await prisma.residency.findUnique({
    where: { id: residencyId },
    select: { id: true, name: true, billingMode: true },
  })
  if (!actual) return

  await prisma.residency.update({
    where: { id: residencyId },
    data: { billingMode },
  })

  await logAudit({
    actorId: superAdmin.id,
    actorRole: 'SUPERADMIN',
    action: 'update',
    entity: 'residency',
    entityId: residencyId,
    oldValue: { billingMode: actual.billingMode },
    newValue: { billingMode },
    reason: `Modalidad de cobro cambiada a ${billingMode === 'INDIVIDUAL' ? 'Individual por usuario' : 'Grupal por residencia'}`,
  })

  revalidatePath('/dashboard/plataforma')
  revalidatePath(`/dashboard/plataforma/residencia/${residencyId}`)
  revalidatePath('/dashboard/suscripcion')
  revalidatePath('/dashboard/usuarios')
  revalidatePath('/dashboard/perfil')
  revalidatePath('/dashboard')

  redirect(
    `/dashboard/plataforma/residencia/${residencyId}?ok=${encodeURIComponent(
      billingMode === 'INDIVIDUAL'
        ? `Cobro Individual ACTIVADO para ${actual.name}. Cada usuario verá ahora el botón "💳 Mi Suscripción".`
        : `Cobro Grupal ACTIVADO para ${actual.name}.`
    )}`
  )
}

export async function actualizarPrecioUsuario(formData: FormData): Promise<void> {
  const superAdmin = await exigirSuperAdmin()
  const residencyId = String(formData.get('residencyId') ?? '').trim()
  const userId = String(formData.get('userId') ?? '').trim()
  const limpiar = String(formData.get('limpiar') ?? '') === 'true'
  const precioRaw = String(formData.get('individualPriceUsd') ?? '').trim()

  if (!residencyId || !userId) return

  const usuario = await prisma.user.findFirst({
    where: {
      id: userId,
      residencyId,
      role: { not: 'SUPERADMIN' },
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      individualPriceUsd: true,
    },
  })
  if (!usuario) return

  let nuevoPrecio: number | null = null
  if (!limpiar && precioRaw !== '') {
    const parsed = parseInt(precioRaw, 10)
    if (!Number.isFinite(parsed) || parsed < 0) {
      redirect(
        `/dashboard/plataforma/residencia/${residencyId}?error=${encodeURIComponent(
          'Ingresa un precio válido en USD (0 o mayor).'
        )}`
      )
    }
    nuevoPrecio = parsed
  }

  await prisma.user.update({
    where: { id: usuario.id },
    data: { individualPriceUsd: nuevoPrecio },
  })

  await logAudit({
    actorId: superAdmin.id,
    actorRole: 'SUPERADMIN',
    action: 'update',
    entity: 'user_subscription_price',
    entityId: usuario.id,
    oldValue: { residencyId, individualPriceUsd: usuario.individualPriceUsd },
    newValue: { residencyId, individualPriceUsd: nuevoPrecio },
    reason:
      nuevoPrecio === null
        ? `Tarifa individual de ${usuario.fullName} restaurada a la tarifa base de la residencia`
        : `Tarifa individual personalizada de ${usuario.fullName} fijada en $${nuevoPrecio} USD/mes`,
  })

  revalidatePath(`/dashboard/plataforma/residencia/${residencyId}`)
  revalidatePath('/dashboard/plataforma')
  revalidatePath('/dashboard/suscripcion')
  revalidatePath('/dashboard/usuarios')
  revalidatePath('/dashboard/perfil')

  redirect(
    `/dashboard/plataforma/residencia/${residencyId}?ok=${encodeURIComponent(
      nuevoPrecio === null
        ? `${usuario.fullName} ahora usa la tarifa base de la residencia.`
        : `Tarifa individual de ${usuario.fullName} actualizada a $${nuevoPrecio} USD/mes.`
    )}`
  )
}

export async function actualizarSuscripcionUsuario(formData: FormData): Promise<void> {
  const superAdmin = await exigirSuperAdmin()
  const residencyId = String(formData.get('residencyId') ?? '').trim()
  const userId = String(formData.get('userId') ?? '').trim()
  const accion = String(formData.get('accion') ?? 'estado').trim()

  if (!residencyId || !userId) return

  // Aislamiento estricto: solo modifica si el usuario pertenece exactamente a esa residencia
  const usuario = await prisma.user.findFirst({
    where: {
      id: userId,
      residencyId,
      role: { not: 'SUPERADMIN' },
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      planStatus: true,
      subscriptionEndsAt: true,
    },
  })
  if (!usuario) return

  let nuevoEstado: PlanStatus = usuario.planStatus
  let nuevaFecha: Date | null = usuario.subscriptionEndsAt
  let nota = ''

  if (accion === 'extender_30' || accion === 'extender_7') {
    const dias = accion === 'extender_30' ? 30 : 7
    const base =
      usuario.subscriptionEndsAt && usuario.subscriptionEndsAt.getTime() > Date.now()
        ? usuario.subscriptionEndsAt.getTime()
        : Date.now()
    nuevaFecha = new Date(base + dias * 24 * 60 * 60 * 1000)
    nuevoEstado = 'ACTIVE'
    nota = `Extensión manual SuperAdmin (+${dias} días)`
  } else if (accion === 'sin_vencimiento') {
    nuevoEstado = 'ACTIVE'
    nuevaFecha = null
    nota = 'Activado sin fecha límite por SuperAdmin'
  } else if (accion === 'iniciar_cobro') {
    nuevoEstado = 'PAST_DUE'
    nuevaFecha = new Date()
    nota = 'Inicio de período de gracia individual (5 días)'
  } else if (accion === 'suspender') {
    nuevoEstado = 'SUSPENDED'
    nota = 'Suscripción individual suspendida por SuperAdmin'
  } else {
    nuevoEstado = parsePlanStatus(String(formData.get('planStatus') ?? 'ACTIVE'))
    nota = `Estado cambiado manualmente a ${nuevoEstado}`
  }

  await prisma.user.update({
    where: { id: usuario.id },
    data: {
      planStatus: nuevoEstado,
      subscriptionEndsAt: nuevaFecha,
      lastPaymentNote: nota,
    },
  })

  await logAudit({
    actorId: superAdmin.id,
    actorRole: 'SUPERADMIN',
    action: 'update',
    entity: 'user_subscription',
    entityId: usuario.id,
    oldValue: {
      residencyId,
      email: usuario.email,
      planStatus: usuario.planStatus,
      subscriptionEndsAt: usuario.subscriptionEndsAt?.toISOString() ?? null,
    },
    newValue: {
      residencyId,
      email: usuario.email,
      planStatus: nuevoEstado,
      subscriptionEndsAt: nuevaFecha?.toISOString() ?? null,
      accion,
    },
    reason: `Control individual SuperAdmin (${usuario.fullName}): ${nota}`,
  })

  revalidatePath(`/dashboard/plataforma/residencia/${residencyId}`)
  revalidatePath('/dashboard/plataforma')
  revalidatePath('/dashboard/suscripcion')
  revalidatePath('/dashboard/usuarios')
  revalidatePath('/dashboard')

  redirect(
    `/dashboard/plataforma/residencia/${residencyId}?ok=${encodeURIComponent(
      `Suscripción de ${usuario.fullName} actualizada.`
    )}`
  )
}

export async function aplicarVigenciaATodosUsuarios(formData: FormData): Promise<void> {
  const superAdmin = await exigirSuperAdmin()
  const residencyId = String(formData.get('residencyId') ?? '').trim()
  const accion = String(formData.get('accion') ?? '').trim()

  if (!residencyId) return

  const usuarios = await prisma.user.findMany({
    where: {
      residencyId,
      isActive: true,
      role: { not: 'SUPERADMIN' },
    },
    select: { id: true, subscriptionEndsAt: true },
  })

  if (usuarios.length === 0) {
    redirect(`/dashboard/plataforma/residencia/${residencyId}`)
  }

  const ahora = Date.now()
  let mensaje = ''

  if (accion === 'extender_30_todos') {
    await prisma.$transaction(
      usuarios.map((u) => {
        const base =
          u.subscriptionEndsAt && u.subscriptionEndsAt.getTime() > ahora
            ? u.subscriptionEndsAt.getTime()
            : ahora
        return prisma.user.update({
          where: { id: u.id },
          data: {
            planStatus: 'ACTIVE',
            subscriptionEndsAt: new Date(base + 30 * 24 * 60 * 60 * 1000),
            lastPaymentNote: 'Activación grupal individual (+30 días) por SuperAdmin',
          },
        })
      })
    )
    mensaje = `Se agregaron +30 días individuales a ${usuarios.length} usuario(s) activo(s) de esta residencia.`
  } else if (accion === 'iniciar_cobro_sin_fecha') {
    const sinFecha = usuarios.filter((u) => !u.subscriptionEndsAt)
    if (sinFecha.length > 0) {
      await prisma.user.updateMany({
        where: { id: { in: sinFecha.map((u) => u.id) } },
        data: {
          planStatus: 'PAST_DUE',
          subscriptionEndsAt: new Date(ahora),
          lastPaymentNote: 'Cobro individual iniciado (5 días de gracia)',
        },
      })
    }
    mensaje =
      sinFecha.length > 0
        ? `Se inició el período de cobro individual (5 días de gracia) a ${sinFecha.length} usuario(s) sin fecha.`
        : 'Todos los usuarios activos ya tenían una fecha asignada.'
  }

  await logAudit({
    actorId: superAdmin.id,
    actorRole: 'SUPERADMIN',
    action: 'update',
    entity: 'residency_users_subscription',
    entityId: residencyId,
    newValue: { residencyId, accion, totalUsuarios: usuarios.length },
    reason: `Acción masiva controlada en residencia: ${mensaje}`,
  })

  revalidatePath(`/dashboard/plataforma/residencia/${residencyId}`)
  revalidatePath('/dashboard/plataforma')
  revalidatePath('/dashboard/suscripcion')
  revalidatePath('/dashboard/usuarios')
  revalidatePath('/dashboard')

  redirect(
    `/dashboard/plataforma/residencia/${residencyId}?ok=${encodeURIComponent(mensaje)}`
  )
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
    if (pago.billingScope === 'INDIVIDUAL' && pago.userId) {
      const usuario = await prisma.user.findUnique({ where: { id: pago.userId } })
      const base =
        usuario?.subscriptionEndsAt && usuario.subscriptionEndsAt.getTime() > Date.now()
          ? usuario.subscriptionEndsAt.getTime()
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
        prisma.user.update({
          where: { id: pago.userId },
          data: {
            planStatus: 'ACTIVE',
            subscriptionEndsAt: nuevaFecha,
            lastPaymentNote: `Aprobado pago individual ${pago.reference ?? pago.id} (+${pago.periodMonths} mes/es)`,
          },
        }),
      ])
    } else {
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
    }
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
  revalidatePath(`/dashboard/plataforma/residencia/${pago.residencyId}`)
  revalidatePath('/dashboard/suscripcion')
}

export async function reiniciarPagosPrueba(): Promise<void> {
  const superAdmin = await exigirSuperAdmin()

  const ahora = new Date()
  const resultado = await prisma.subscriptionPayment.updateMany({
    where: { isTestReset: false },
    data: {
      isTestReset: true,
      resetAt: ahora,
      resetBy: superAdmin.email,
    },
  })

  await logAudit({
    actorId: superAdmin.id,
    actorRole: 'SUPERADMIN',
    action: 'update',
    entity: 'subscription_payment_reset',
    entityId: 'global',
    newValue: {
      pagosReiniciados: resultado.count,
      resetBy: superAdmin.email,
      resetAt: ahora.toISOString(),
    },
    reason: `Reinicio manual de pagos de prueba en SuperAdmin (${resultado.count} registro(s) archivado(s))`,
  })

  revalidatePath('/dashboard/plataforma', 'layout')
  revalidatePath('/dashboard/suscripcion')

  redirect(
    '/dashboard/plataforma?ok=' +
      encodeURIComponent(
        resultado.count > 0
          ? `Pagos recibidos reiniciados a $0.00 USD (${resultado.count} transacción/es de prueba archivadas).`
          : 'No había transacciones activas para reiniciar.'
      )
  )
}
