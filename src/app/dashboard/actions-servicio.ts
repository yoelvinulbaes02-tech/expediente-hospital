'use server'

import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { ROLES_CLINICOS } from '@/lib/permisos'
import { obtenerContextoResidencia, verificarEscrituraResidencia } from '@/lib/tenant'
import {
  CATEGORIAS_DISPOSITIVOS_CIRUGIA,
  resolverTeamAutomatico,
} from '@/lib/cirugia-constants'
import { revalidatePath } from 'next/cache'

async function exigirEscrituraDashboard() {
  const ctx = await obtenerContextoResidencia()
  if (!ctx?.user || !ctx.residency) {
    return { ok: false as const, error: 'Sesión inválida o sin residencia asignada.' }
  }
  const rol = String(ctx.user.role)
  if (!ROLES_CLINICOS.includes(rol) && rol !== 'ADMIN') {
    return { ok: false as const, error: 'Tu usuario es de solo lectura.' }
  }
  const check = await verificarEscrituraResidencia(ctx.residency.id, ctx.user.id)
  if (!check.ok) {
    return { ok: false as const, error: check.error }
  }
  return { ok: true as const, ctx }
}

// ─── 1. TEAM DE SERVICIO (MA, R4, R3, R2, R1): MANUAL Y AUTOMÁTICO ───
export async function guardarTeamServicio(formData: FormData): Promise<{
  ok: boolean
  error?: string
  data?: {
    ma: string
    r4: string
    r3: string
    r2: string
    r1: string
    autoMode: boolean
  }
}> {
  const authRes = await exigirEscrituraDashboard()
  if (!authRes.ok) return { ok: false, error: authRes.error }
  const { ctx } = authRes
  const residency = ctx.residency!

  const modo = String(formData.get('modo') ?? 'manual').trim()

  if (modo === 'auto') {
    const [usuarios, episodios] = await Promise.all([
      prisma.user.findMany({
        where: {
          residencyId: residency.id,
          isActive: true,
          role: { in: ['DOCTOR', 'RESIDENT'] },
        },
        select: { fullName: true, role: true },
        orderBy: { fullName: 'asc' },
      }),
      prisma.episode.findMany({
        where: { residencyId: residency.id, status: 'active' },
        select: { admittingDoctor: true, attendingDoctor: true },
        orderBy: { admissionDate: 'desc' },
        take: 40,
      }),
    ])

    const sugerido = resolverTeamAutomatico({ usuarios, episodios })

    await prisma.residency.update({
      where: { id: residency.id },
      data: {
        teamMa: sugerido.ma || null,
        teamR4: sugerido.r4 || null,
        teamR3: sugerido.r3 || null,
        teamR2: sugerido.r2 || null,
        teamR1: sugerido.r1 || null,
        teamAutoMode: true,
        teamUpdatedBy: ctx.user.email,
        teamUpdatedAt: new Date(),
      },
    })

    await logAudit({
      actorId: ctx.user.id,
      actorRole: String(ctx.user.role),
      action: 'update',
      entity: 'service_team',
      entityId: residency.id,
      newValue: { ...sugerido, autoMode: true },
      reason: 'Team de servicio actualizado en modo automático',
    })

    revalidatePath('/dashboard')
    return {
      ok: true,
      data: { ...sugerido, autoMode: true },
    }
  }

  const ma = String(formData.get('teamMa') ?? '').trim()
  const r4 = String(formData.get('teamR4') ?? '').trim()
  const r3 = String(formData.get('teamR3') ?? '').trim()
  const r2 = String(formData.get('teamR2') ?? '').trim()
  const r1 = String(formData.get('teamR1') ?? '').trim()

  await prisma.residency.update({
    where: { id: residency.id },
    data: {
      teamMa: ma || null,
      teamR4: r4 || null,
      teamR3: r3 || null,
      teamR2: r2 || null,
      teamR1: r1 || null,
      teamAutoMode: false,
      teamUpdatedBy: ctx.user.email,
      teamUpdatedAt: new Date(),
    },
  })

  await logAudit({
    actorId: ctx.user.id,
    actorRole: String(ctx.user.role),
    action: 'update',
    entity: 'service_team',
    entityId: residency.id,
    newValue: { ma, r4, r3, r2, r1, autoMode: false },
    reason: 'Team de servicio actualizado manualmente',
  })

  revalidatePath('/dashboard')
  return {
    ok: true,
    data: { ma, r4, r3, r2, r1, autoMode: false },
  }
}

// ─── 2. RESUMEN INICIAL DE CIRUGÍA (MODO AUTOMÁTICO O AJUSTE DE GUARDIA) ───
export async function guardarResumenCirugiaConfig(formData: FormData): Promise<{
  ok: boolean
  error?: string
}> {
  const authRes = await exigirEscrituraDashboard()
  if (!authRes.ok) return { ok: false, error: authRes.error }
  const { ctx } = authRes
  const residency = ctx.residency!

  const accion = String(formData.get('accion') ?? 'manual').trim()
  if (accion === 'auto') {
    await prisma.residency.update({
      where: { id: residency.id },
      data: { surgicalStatsExtra: { mode: 'auto' } },
    })
    revalidatePath('/dashboard')
    return { ok: true }
  }

  const num = (k: string) => Math.max(0, parseInt(String(formData.get(k) ?? '0'), 10) || 0)
  const payload = {
    mode: 'manual',
    emergencias: num('emergencias'),
    ingresosElectivos: num('ingresosElectivos'),
    ingresosEmergencias: num('ingresosEmergencias'),
    totalIngresos: num('totalIngresos'),
    cirugias: num('cirugias'),
    updatedBy: ctx.user.email,
    updatedAt: new Date().toISOString(),
  }

  await prisma.residency.update({
    where: { id: residency.id },
    data: { surgicalStatsExtra: payload },
  })

  await logAudit({
    actorId: ctx.user.id,
    actorRole: String(ctx.user.role),
    action: 'update',
    entity: 'surgical_stats',
    entityId: residency.id,
    newValue: payload,
    reason: 'Actualización de resumen de guardia en Cirugía',
  })

  revalidatePath('/dashboard')
  return { ok: true }
}

// ─── 3. CONTADORES DE DISPOSITIVOS / CATÉTERES QUIRÚRGICOS DESDE DASHBOARD ───
export async function ajustarDispositivoCirugiaDashboard(formData: FormData): Promise<{
  ok: boolean
  error?: string
}> {
  const authRes = await exigirEscrituraDashboard()
  if (!authRes.ok) return { ok: false, error: authRes.error }
  const { ctx } = authRes
  const residency = ctx.residency!

  const category = String(formData.get('category') ?? '').trim()
  const delta = String(formData.get('delta') ?? '1') === '-1' ? -1 : 1

  const valido = CATEGORIAS_DISPOSITIVOS_CIRUGIA.some((c) => c.key === category)
  if (!valido) return { ok: false, error: 'Categoría de dispositivo no válida.' }

  if (delta === 1) {
    const dev = await prisma.surgicalDevice.create({
      data: {
        residencyId: residency.id,
        category,
        notes: 'Registro rápido en panel de servicio',
        isActive: true,
        createdBy: ctx.user.email,
      },
    })
    await logAudit({
      actorId: ctx.user.id,
      actorRole: String(ctx.user.role),
      action: 'create',
      entity: 'surgical_device',
      entityId: dev.id,
      newValue: { category, origen: 'dashboard' },
      reason: `Incremento de conteo quirúrgico (${category})`,
    })
  } else {
    // Priorizar dispositivos generales sin episodio específico antes de retirar uno ligado a expediente
    let objetivo = await prisma.surgicalDevice.findFirst({
      where: { residencyId: residency.id, category, isActive: true, episodeId: null },
      orderBy: { createdAt: 'desc' },
    })
    if (!objetivo) {
      objetivo = await prisma.surgicalDevice.findFirst({
        where: { residencyId: residency.id, category, isActive: true },
        orderBy: { createdAt: 'desc' },
      })
    }
    if (!objetivo) return { ok: true }

    await prisma.surgicalDevice.update({
      where: { id: objetivo.id },
      data: {
        isActive: false,
        removedBy: ctx.user.email,
        removedAt: new Date(),
      },
    })

    await logAudit({
      actorId: ctx.user.id,
      actorRole: String(ctx.user.role),
      action: 'update',
      entity: 'surgical_device',
      entityId: objetivo.id,
      newValue: { category, isActive: false },
      reason: `Retiro / decremento de conteo quirúrgico (${category})`,
    })
  }

  revalidatePath('/dashboard')
  return { ok: true }
}

// ─── 4. CURAS QUIRÚRGICAS + CHECKLIST DE EVIDENCIA ───
export async function crearCuraPaciente(formData: FormData): Promise<{
  ok: boolean
  error?: string
}> {
  const authRes = await exigirEscrituraDashboard()
  if (!authRes.ok) return { ok: false, error: authRes.error }
  const { ctx } = authRes
  const residency = ctx.residency!

  const roomBed = String(formData.get('roomBed') ?? '').trim()
  const patientName = String(formData.get('patientName') ?? '').trim()
  const ageStr = String(formData.get('age') ?? '').trim()
  const age = ageStr ? parseInt(ageStr, 10) : null
  const diagnosis = String(formData.get('diagnosis') ?? '').trim()
  const patientStatus = String(formData.get('patientStatus') ?? 'Estable').trim() || 'Estable'
  const careFrequency = String(formData.get('careFrequency') ?? 'c/24h').trim() || 'c/24h'
  const baseDepartment = String(formData.get('baseDepartment') ?? '').trim()

  if (!roomBed || !patientName || !diagnosis || !baseDepartment) {
    return {
      ok: false,
      error: 'Completa habitación/cama, nombre, diagnóstico y departamento de base.',
    }
  }

  const cura = await prisma.woundCare.create({
    data: {
      residencyId: residency.id,
      roomBed,
      patientName,
      age: age !== null && !Number.isNaN(age) ? age : null,
      diagnosis,
      patientStatus,
      careFrequency,
      baseDepartment,
      isActive: true,
      createdBy: ctx.user.email,
    },
  })

  await logAudit({
    actorId: ctx.user.id,
    actorRole: String(ctx.user.role),
    action: 'create',
    entity: 'wound_care',
    entityId: cura.id,
    newValue: { roomBed, patientName, age, diagnosis, patientStatus, careFrequency, baseDepartment },
    reason: `Paciente agregado a listado de Curas (${patientName})`,
  })

  revalidatePath('/dashboard')
  return { ok: true }
}

export async function registrarCuraRealizada(formData: FormData): Promise<{
  ok: boolean
  error?: string
}> {
  const authRes = await exigirEscrituraDashboard()
  if (!authRes.ok) return { ok: false, error: authRes.error }
  const { ctx } = authRes
  const residency = ctx.residency!

  const woundCareId = String(formData.get('woundCareId') ?? '').trim()
  const notes = String(formData.get('notes') ?? '').trim() || null
  if (!woundCareId) return { ok: false, error: 'Registro de cura inválido.' }

  const cura = await prisma.woundCare.findFirst({
    where: { id: woundCareId, residencyId: residency.id, isActive: true },
  })
  if (!cura) return { ok: false, error: 'Paciente de cura no encontrado.' }

  const log = await prisma.woundCareLog.create({
    data: {
      woundCareId: cura.id,
      performedBy: ctx.user.email,
      notes,
    },
  })

  await logAudit({
    actorId: ctx.user.id,
    actorRole: String(ctx.user.role),
    action: 'create',
    entity: 'wound_care_log',
    entityId: log.id,
    newValue: {
      woundCareId: cura.id,
      patientName: cura.patientName,
      roomBed: cura.roomBed,
      performedBy: ctx.user.fullName,
      notes,
    },
    reason: `Cura realizada y registrada a ${cura.patientName}`,
  })

  revalidatePath('/dashboard')
  return { ok: true }
}

export async function actualizarCuraPaciente(formData: FormData): Promise<{
  ok: boolean
  error?: string
}> {
  const authRes = await exigirEscrituraDashboard()
  if (!authRes.ok) return { ok: false, error: authRes.error }
  const { ctx } = authRes
  const residency = ctx.residency!

  const woundCareId = String(formData.get('woundCareId') ?? '').trim()
  const roomBed = String(formData.get('roomBed') ?? '').trim()
  const patientStatus = String(formData.get('patientStatus') ?? '').trim()
  const careFrequency = String(formData.get('careFrequency') ?? '').trim()

  const cura = await prisma.woundCare.findFirst({
    where: { id: woundCareId, residencyId: residency.id },
  })
  if (!cura) return { ok: false, error: 'Registro no encontrado.' }

  await prisma.woundCare.update({
    where: { id: cura.id },
    data: {
      ...(roomBed ? { roomBed } : {}),
      ...(patientStatus ? { patientStatus } : {}),
      ...(careFrequency ? { careFrequency } : {}),
    },
  })

  revalidatePath('/dashboard')
  return { ok: true }
}

export async function archivarCuraPaciente(formData: FormData): Promise<{
  ok: boolean
  error?: string
}> {
  const authRes = await exigirEscrituraDashboard()
  if (!authRes.ok) return { ok: false, error: authRes.error }
  const { ctx } = authRes
  const residency = ctx.residency!

  const woundCareId = String(formData.get('woundCareId') ?? '').trim()
  const reason = String(formData.get('reason') ?? '').trim() || null
  const cura = await prisma.woundCare.findFirst({
    where: { id: woundCareId, residencyId: residency.id },
  })
  if (!cura) return { ok: false, error: 'Registro no encontrado.' }

  await prisma.woundCare.update({
    where: { id: cura.id },
    data: {
      isActive: false,
      dischargeReason: reason,
      dischargedBy: ctx.user.email,
      dischargedAt: new Date(),
    },
  })

  await logAudit({
    actorId: ctx.user.id,
    actorRole: String(ctx.user.role),
    action: 'update',
    entity: 'wound_care',
    entityId: cura.id,
    newValue: { isActive: false, dischargeReason: reason, dischargedBy: ctx.user.email },
    reason: reason
      ? `Alta de seguimiento de curas (${cura.patientName}): ${reason}`
      : `Alta de seguimiento de curas (${cura.patientName})`,
  })

  revalidatePath('/dashboard')
  return { ok: true }
}
