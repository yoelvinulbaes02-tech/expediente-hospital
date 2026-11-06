'use server'

import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { exigirPermiso, volverAlExpediente } from '@/lib/permisos'
import { revalidatePath } from 'next/cache'

// ─── 1. ANTECEDENTES ───
export async function guardarAntecedentes(formData: FormData): Promise<void> {
  const episodeId = String(formData.get('episodeId') ?? '')
  const { userId, role, email, episode } = await exigirPermiso(episodeId, 'registrar')

  const pathological = String(formData.get('pathological') ?? '').trim()
  const surgical = String(formData.get('surgical') ?? '').trim()
  const family = String(formData.get('family') ?? '').trim()
  const habits = String(formData.get('habits') ?? '').trim()
  const medications = String(formData.get('medications') ?? '').trim()

  await prisma.medicalHistory.upsert({
    where: { patientId: episode.patientId },
    update: {
      pathological: pathological || null,
      surgical: surgical || null,
      family: family || null,
      habits: habits || null,
      medications: medications || null,
      updatedBy: email,
    },
    create: {
      patientId: episode.patientId,
      pathological: pathological || null,
      surgical: surgical || null,
      family: family || null,
      habits: habits || null,
      medications: medications || null,
      updatedBy: email,
    },
  })

  await logAudit({
    actorId: userId,
    actorRole: role,
    action: 'update',
    entity: 'medical_history',
    patientId: episode.patientId,
    episodeId,
    newValue: { pathological, surgical, family, habits, medications },
    reason: 'Actualización de antecedentes médicos',
  })

  revalidatePath(`/dashboard/paciente/${episodeId}`)
}

// ─── 2. NOTAS IMPORTANTES (AVISOS) ───
export async function crearNotaImportante(formData: FormData): Promise<void> {
  const episodeId = String(formData.get('episodeId') ?? '')
  const { userId, role, email, episode } = await exigirPermiso(episodeId, 'registrar')

  const content = String(formData.get('content') ?? '').trim()
  if (!content) volverAlExpediente(episodeId, 'Escribe el aviso importante')

  const alerta = await prisma.importantAlert.create({
    data: {
      episodeId,
      content,
      createdBy: email,
    },
  })

  await logAudit({
    actorId: userId,
    actorRole: role,
    action: 'create',
    entity: 'important_alert',
    entityId: alerta.id,
    patientId: episode.patientId,
    episodeId,
    newValue: { aviso: content },
    reason: 'Aviso importante fijado en expediente',
  })

  revalidatePath(`/dashboard/paciente/${episodeId}`)
}

export async function resolverNotaImportante(formData: FormData): Promise<void> {
  const episodeId = String(formData.get('episodeId') ?? '')
  const alertId = String(formData.get('alertId') ?? '')
  const { userId, role, episode } = await exigirPermiso(episodeId, 'registrar')

  await prisma.importantAlert.update({
    where: { id: alertId },
    data: { isActive: false },
  })

  await logAudit({
    actorId: userId,
    actorRole: role,
    action: 'update',
    entity: 'important_alert',
    entityId: alertId,
    patientId: episode.patientId,
    episodeId,
    newValue: { isActive: false },
    reason: 'Aviso importante retirado/resuelto',
  })

  revalidatePath(`/dashboard/paciente/${episodeId}`)
}

// ─── 3. TASA DE FILTRACIÓN GLOMERULAR (TFG) ───
export async function registrarTFG(formData: FormData): Promise<void> {
  const episodeId = String(formData.get('episodeId') ?? '')
  const { userId, role, email, episode } = await exigirPermiso(episodeId, 'registrar')

  const valorStr = String(formData.get('gfr') ?? '').trim()
  const gfr = parseFloat(valorStr)

  if (isNaN(gfr) || gfr < 0 || gfr > 300) {
    volverAlExpediente(episodeId, 'Escribe un valor de TFG válido (0 a 300 mL/min/1.73m²)')
  }

  const reg = await prisma.gfrRecord.create({
    data: {
      episodeId,
      value: gfr,
      recordedBy: email,
    },
  })

  await logAudit({
    actorId: userId,
    actorRole: role,
    action: 'create',
    entity: 'gfr_record',
    entityId: reg.id,
    patientId: episode.patientId,
    episodeId,
    newValue: { tfg: gfr },
    reason: 'Registro de valor de TFG',
  })

  revalidatePath(`/dashboard/paciente/${episodeId}`)
}

// ─── 4. REPORTES DE ESTUDIOS ───
export async function guardarReporteEstudio(formData: FormData): Promise<void> {
  const episodeId = String(formData.get('episodeId') ?? '')
  const { userId, role, email, episode } = await exigirPermiso(episodeId, 'registrar')

  const studyType = String(formData.get('studyType') ?? 'Otro').trim()
  const title = String(formData.get('title') ?? '').trim()
  const fechaStr = String(formData.get('studyDate') ?? '').trim()
  const result = String(formData.get('result') ?? '').trim()

  if (!title) volverAlExpediente(episodeId, 'Escribe el nombre del estudio')
  if (!result) volverAlExpediente(episodeId, 'Escribe el resultado o conclusión del estudio')

  const studyDate = fechaStr ? new Date(`${fechaStr}T12:00:00-04:00`) : new Date()

  const estudio = await prisma.studyReport.create({
    data: {
      episodeId,
      studyType,
      title,
      studyDate,
      result,
      createdBy: email,
    },
  })

  await logAudit({
    actorId: userId,
    actorRole: role,
    action: 'create',
    entity: 'study_report',
    entityId: estudio.id,
    patientId: episode.patientId,
    episodeId,
    newValue: { tipo: studyType, titulo: title, resultado: result },
    reason: 'Reporte de estudio agregado',
  })

  revalidatePath(`/dashboard/paciente/${episodeId}`)
}

// ─── 5. MARCADORES VIRALES ───
export async function guardarVirales(formData: FormData): Promise<void> {
  const episodeId = String(formData.get('episodeId') ?? '')
  const { userId, role, email, episode } = await exigirPermiso(episodeId, 'registrar')

  const status = String(formData.get('status') ?? 'negativo')
  const details = String(formData.get('details') ?? '').trim()

  const existente = await prisma.viralSerology.findFirst({
    where: { episodeId },
    orderBy: { updatedAt: 'desc' },
  })

  if (existente) {
    await prisma.viralSerology.update({
      where: { id: existente.id },
      data: {
        status,
        details: status === 'negativo' ? 'No reactivo / Negativo' : details,
        recordedBy: email,
      },
    })
  } else {
    await prisma.viralSerology.create({
      data: {
        patientId: episode.patientId,
        episodeId,
        status,
        details: status === 'negativo' ? 'No reactivo / Negativo' : details,
        recordedBy: email,
      },
    })
  }

  await logAudit({
    actorId: userId,
    actorRole: role,
    action: 'update',
    entity: 'viral_serology',
    patientId: episode.patientId,
    episodeId,
    newValue: { status, details },
    reason: 'Actualización de marcadores virales',
  })

  revalidatePath(`/dashboard/paciente/${episodeId}`)
}

// ─── 6. ACCESO VASCULAR ───
export async function guardarAccesoVascular(formData: FormData): Promise<void> {
  const episodeId = String(formData.get('episodeId') ?? '')
  const { userId, role, email, episode } = await exigirPermiso(episodeId, 'registrar')

  const type = String(formData.get('type') ?? 'Catéter').trim()
  const site = String(formData.get('site') ?? '').trim()
  const fechaStr = String(formData.get('placementDate') ?? '').trim()
  const notes = String(formData.get('notes') ?? '').trim()

  const placementDate = fechaStr ? new Date(`${fechaStr}T12:00:00-04:00`) : new Date()

  await prisma.vascularAccess.updateMany({
    where: { episodeId, isActive: true },
    data: { isActive: false },
  })

  const acceso = await prisma.vascularAccess.create({
    data: {
      episodeId,
      type,
      site: site || null,
      placementDate,
      notes: notes || null,
      isActive: true,
      createdBy: email,
    },
  })

  await logAudit({
    actorId: userId,
    actorRole: role,
    action: 'create',
    entity: 'vascular_access',
    entityId: acceso.id,
    patientId: episode.patientId,
    episodeId,
    newValue: { tipo: type, sitio: site, fecha: fechaStr },
    reason: 'Registro de acceso vascular activo',
  })

  revalidatePath(`/dashboard/paciente/${episodeId}`)
}

// ─── 7. TIPIFICACIÓN SANGUÍNEA (GRUPO Y RH) ───
export async function guardarTipificacion(formData: FormData): Promise<void> {
  const episodeId = String(formData.get('episodeId') ?? '')
  const { userId, role, email, episode } = await exigirPermiso(episodeId, 'registrar')

  const bloodType = String(formData.get('bloodType') ?? '').trim().toUpperCase()
  if (!bloodType) volverAlExpediente(episodeId, 'Selecciona o escribe el tipo de sangre')

  await prisma.patient.update({
    where: { id: episode.patientId },
    data: {
      bloodType,
      bloodTypeRecordedBy: email,
      bloodTypeUpdatedAt: new Date(),
    },
  })

  await logAudit({
    actorId: userId,
    actorRole: role,
    action: 'update',
    entity: 'patient',
    entityId: episode.patientId,
    patientId: episode.patientId,
    episodeId,
    newValue: { tipificacion: bloodType },
    reason: 'Registro de tipificación sanguínea',
  })

  revalidatePath(`/dashboard/paciente/${episodeId}`)
}

// ─── 8. CAMBIAR HABITACIÓN / CAMA (REUBICACIÓN DEL PX) ───
export async function cambiarUbicacion(formData: FormData): Promise<void> {
  const episodeId = String(formData.get('episodeId') ?? '')
  const { userId, role, episode } = await exigirPermiso(episodeId, 'registrar')

  const room = String(formData.get('room') ?? '').trim()
  const bed = String(formData.get('bed') ?? '').trim()

  if (!room || !bed) volverAlExpediente(episodeId, 'Debe indicar habitación y cama')

  // Consultamos los datos anteriores de forma segura y tipada
  const previo = await prisma.episode.findUnique({
    where: { id: episodeId },
    select: { room: true, bed: true },
  })

  await prisma.episode.update({
    where: { id: episodeId },
    data: { room, bed },
  })

  await logAudit({
    actorId: userId,
    actorRole: role,
    action: 'update',
    entity: 'episode',
    entityId: episodeId,
    patientId: episode.patientId,
    episodeId,
    oldValue: { habitacion: previo?.room, cama: previo?.bed },
    newValue: { habitacion: room, cama: bed },
    reason: 'Reubicación / traslado de cama de paciente',
  })

  revalidatePath(`/dashboard/paciente/${episodeId}`)
  revalidatePath('/dashboard')
}