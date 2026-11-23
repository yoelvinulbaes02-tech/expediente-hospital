'use server'

import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { exigirPermiso, volverAlExpediente } from '@/lib/permisos'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { marcarResultadoLab, parseResultadoLab } from '@/lib/texto-clinico'

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

  const quiereFijar = formData.get('isPinned') === 'on' || formData.get('isPinned') === 'true'
  let fijar = false
  if (quiereFijar) {
    const fijadasActuales = await prisma.importantAlert.count({
      where: { episodeId, isActive: true, isPinned: true },
    })
    if (fijadasActuales < 3) {
      fijar = true
    }
  }

  const alerta = await prisma.importantAlert.create({
    data: {
      episodeId,
      content,
      createdBy: email,
      isPinned: fijar,
      pinnedAt: fijar ? new Date() : null,
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
    newValue: { aviso: content, fijada: fijar },
    reason: fijar ? 'Nota importante creada y fijada en expediente' : 'Nota importante agregada en expediente',
  })

  revalidatePath(`/dashboard/paciente/${episodeId}`)
}

export async function toggleFijarNotaImportante(formData: FormData): Promise<void> {
  const episodeId = String(formData.get('episodeId') ?? '')
  const alertId = String(formData.get('alertId') ?? '')
  const { userId, role, episode } = await exigirPermiso(episodeId, 'registrar')

  const actual = await prisma.importantAlert.findFirst({
    where: { id: alertId, episodeId, isActive: true },
  })
  if (!actual) return

  const nuevoEstado = !actual.isPinned

  if (nuevoEstado) {
    const fijadasActuales = await prisma.importantAlert.count({
      where: { episodeId, isActive: true, isPinned: true },
    })
    if (fijadasActuales >= 3) {
      volverAlExpediente(
        episodeId,
        'Solo se permiten hasta 3 notas importantes fijadas al mismo tiempo. Desfija una primero.'
      )
    }
  }

  await prisma.importantAlert.update({
    where: { id: alertId },
    data: {
      isPinned: nuevoEstado,
      pinnedAt: nuevoEstado ? new Date() : null,
    },
  })

  await logAudit({
    actorId: userId,
    actorRole: role,
    action: 'update',
    entity: 'important_alert',
    entityId: alertId,
    patientId: episode.patientId,
    episodeId,
    oldValue: { isPinned: actual.isPinned },
    newValue: { isPinned: nuevoEstado },
    reason: nuevoEstado ? 'Nota importante fijada por importancia' : 'Nota importante desfijada',
  })

  revalidatePath(`/dashboard/paciente/${episodeId}`)
}

export async function resolverNotaImportante(formData: FormData): Promise<void> {
  const episodeId = String(formData.get('episodeId') ?? '')
  const alertId = String(formData.get('alertId') ?? '')
  const { userId, role, email, episode } = await exigirPermiso(episodeId, 'registrar')

  const actual = await prisma.importantAlert.findFirst({
    where: { id: alertId, episodeId },
    select: { id: true },
  })
  if (!actual) return

  await prisma.importantAlert.update({
    where: { id: alertId },
    data: {
      isActive: false,
      isPinned: false,
      resolvedBy: email,
      resolvedAt: new Date(),
    },
  })

  await logAudit({
    actorId: userId,
    actorRole: role,
    action: 'update',
    entity: 'important_alert',
    entityId: alertId,
    patientId: episode.patientId,
    episodeId,
    newValue: { isActive: false, resolvedBy: email },
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

// ─── 4. REPORTES DE LABORATORIO ───
export async function guardarReporteLaboratorio(formData: FormData): Promise<void> {
  const episodeId = String(formData.get('episodeId') ?? '')
  const { userId, role, email, episode } = await exigirPermiso(episodeId, 'registrar')

  const testName = String(formData.get('testName') ?? '').trim()
  const customTest = String(formData.get('customTest') ?? '').trim()
  const category = String(formData.get('category') ?? 'Laboratorio').trim()
  const fechaStr = String(formData.get('sampleDate') ?? '').trim()
  const result = String(formData.get('result') ?? '').trim()
  const isImportant = formData.get('isImportant') === 'on'

  const nombreFinal = testName === 'OTRO' || testName === 'OTRO_CULTIVO' ? customTest : testName

  if (!nombreFinal) volverAlExpediente(episodeId, 'Selecciona o escribe el nombre de la analítica')
  if (!result) volverAlExpediente(episodeId, 'Escribe el resultado de la analítica')

  const resultFinal = marcarResultadoLab(result, isImportant)

  const sampleDate = fechaStr ? new Date(`${fechaStr}T12:00:00-04:00`) : new Date()
  if (Number.isNaN(sampleDate.getTime())) {
    volverAlExpediente(episodeId, 'La fecha de la muestra no es válida')
  }

  const reporte = await prisma.labReport.create({
    data: {
      episodeId,
      category,
      testName: nombreFinal,
      sampleDate,
      result: resultFinal,
      createdBy: email,
    },
  })

  await logAudit({
    actorId: userId,
    actorRole: role,
    action: 'create',
    entity: 'lab_report',
    entityId: reporte.id,
    patientId: episode.patientId,
    episodeId,
    newValue: { analitica: nombreFinal, categoria: category, resultado: resultFinal, importante: isImportant },
    reason: isImportant
      ? 'Reporte de laboratorio registrado (marcado como alterado/importante)'
      : 'Reporte de laboratorio registrado',
  })

  revalidatePath(`/dashboard/paciente/${episodeId}`)
}

export async function editarReporteLaboratorio(formData: FormData): Promise<void> {
  const episodeId = String(formData.get('episodeId') ?? '')
  const reportId = String(formData.get('reportId') ?? '')
  const { userId, role, email, episode } = await exigirPermiso(episodeId, 'registrar')

  const testName = String(formData.get('testName') ?? '').trim()
  const customTest = String(formData.get('customTest') ?? '').trim()
  const category = String(formData.get('category') ?? 'OTRAS ANALÍTICAS').trim()
  const fechaStr = String(formData.get('sampleDate') ?? '').trim()
  const result = String(formData.get('result') ?? '').trim()
  const isImportant = formData.get('isImportant') === 'on'

  const nombreFinal = testName === 'OTRO' || testName === 'OTRO_CULTIVO' ? customTest : testName
  if (!reportId || !nombreFinal || !result) {
    volverAlExpediente(episodeId, 'Completa el nombre y resultado de la analítica')
  }

  const previo = await prisma.labReport.findFirst({
    where: { id: reportId, episodeId, isDeleted: false },
  })
  if (!previo) {
    volverAlExpediente(episodeId, 'El reporte de laboratorio no existe o fue eliminado')
  }

  const sampleDate = fechaStr ? new Date(`${fechaStr}T12:00:00-04:00`) : previo.sampleDate
  if (sampleDate && Number.isNaN(sampleDate.getTime())) {
    volverAlExpediente(episodeId, 'La fecha de la muestra no es válida')
  }

  const resultFinal = marcarResultadoLab(result, isImportant)

  await prisma.labReport.update({
    where: { id: reportId },
    data: {
      category,
      testName: nombreFinal,
      sampleDate,
      result: resultFinal,
      updatedBy: email,
      updatedAt: new Date(),
    },
  })

  await logAudit({
    actorId: userId,
    actorRole: role,
    action: 'update',
    entity: 'lab_report',
    entityId: reportId,
    patientId: episode.patientId,
    episodeId,
    oldValue: {
      analitica: previo.testName,
      categoria: previo.category,
      resultado: previo.result,
      fechaMuestra: previo.sampleDate?.toISOString() ?? null,
    },
    newValue: {
      analitica: nombreFinal,
      categoria: category,
      resultado: resultFinal,
      importante: isImportant,
      fechaMuestra: sampleDate?.toISOString() ?? null,
      updatedBy: email,
    },
    reason: 'Reporte de laboratorio editado',
  })

  revalidatePath(`/dashboard/paciente/${episodeId}`)
}

export async function toggleResalteReporteLaboratorio(formData: FormData): Promise<void> {
  const episodeId = String(formData.get('episodeId') ?? '')
  const reportId = String(formData.get('reportId') ?? '')
  const { userId, role, email, episode } = await exigirPermiso(episodeId, 'registrar')

  if (!reportId) return

  const previo = await prisma.labReport.findFirst({
    where: { id: reportId, episodeId, isDeleted: false },
  })
  if (!previo) return

  const { esImportante, texto } = parseResultadoLab(previo.result)
  const nuevoEstado = !esImportante
  const resultFinal = marcarResultadoLab(texto, nuevoEstado)

  await prisma.labReport.update({
    where: { id: reportId },
    data: {
      result: resultFinal,
      updatedBy: email,
      updatedAt: new Date(),
    },
  })

  await logAudit({
    actorId: userId,
    actorRole: role,
    action: 'update',
    entity: 'lab_report',
    entityId: reportId,
    patientId: episode.patientId,
    episodeId,
    oldValue: { importante: esImportante, resultado: previo.result },
    newValue: { importante: nuevoEstado, resultado: resultFinal, updatedBy: email },
    reason: nuevoEstado
      ? `Analítica resaltada como importante/alterada (${previo.testName})`
      : `Resalte retirado de analítica (${previo.testName})`,
  })

  revalidatePath(`/dashboard/paciente/${episodeId}`)
}

export async function eliminarReporteLaboratorio(formData: FormData): Promise<void> {
  const episodeId = String(formData.get('episodeId') ?? '')
  const reportId = String(formData.get('reportId') ?? '')
  const { userId, role, email, episode } = await exigirPermiso(episodeId, 'registrar')

  if (!reportId) return

  const previo = await prisma.labReport.findFirst({
    where: { id: reportId, episodeId, isDeleted: false },
  })
  if (!previo) return

  await prisma.labReport.update({
    where: { id: reportId },
    data: {
      isDeleted: true,
      deletedBy: email,
      deletedAt: new Date(),
    },
  })

  await logAudit({
    actorId: userId,
    actorRole: role,
    action: 'delete',
    entity: 'lab_report',
    entityId: reportId,
    patientId: episode.patientId,
    episodeId,
    oldValue: {
      analitica: previo.testName,
      categoria: previo.category,
      resultado: previo.result,
    },
    newValue: { isDeleted: true, deletedBy: email },
    reason: `Reporte de laboratorio eliminado (${previo.testName})`,
  })

  revalidatePath(`/dashboard/paciente/${episodeId}`)
}

// ─── 5. REPORTES DE ESTUDIOS ───
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
  if (Number.isNaN(studyDate.getTime())) {
    volverAlExpediente(episodeId, 'La fecha del estudio no es válida')
  }

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

// ─── 6. MARCADORES VIRALES ───
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

// ─── 7. ACCESO VASCULAR ───
export async function guardarAccesoVascular(formData: FormData): Promise<void> {
  const episodeId = String(formData.get('episodeId') ?? '')
  const { userId, role, email, episode } = await exigirPermiso(episodeId, 'registrar')

  const type = String(formData.get('type') ?? 'Catéter').trim()
  const site = String(formData.get('site') ?? '').trim()
  const fechaStr = String(formData.get('placementDate') ?? '').trim()
  const unknownDate = formData.get('unknownPlacementDate') === 'on'
  const notes = String(formData.get('notes') ?? '').trim()

  const placementDate = unknownDate ? null : fechaStr ? new Date(`${fechaStr}T12:00:00-04:00`) : new Date()
  if (placementDate && Number.isNaN(placementDate.getTime())) {
    volverAlExpediente(episodeId, 'La fecha de colocación no es válida')
  }

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
      unknownPlacementDate: unknownDate,
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
    newValue: { tipo: type, sitio: site, fechaDesconocida: unknownDate },
    reason: 'Registro de acceso vascular activo',
  })

  revalidatePath(`/dashboard/paciente/${episodeId}`)
}

// ─── 8. TIPIFICACIÓN SANGUÍNEA ───
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

// ─── 9. CAMBIAR HABITACIÓN / CAMA ───
export async function cambiarUbicacion(formData: FormData): Promise<void> {
  const episodeId = String(formData.get('episodeId') ?? '')
  const { userId, role, episode } = await exigirPermiso(episodeId, 'registrar')

  const room = String(formData.get('room') ?? '').trim()
  const bed = String(formData.get('bed') ?? '').trim()

  if (!room || !bed) volverAlExpediente(episodeId, 'Debe indicar habitación y cama')

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

// ─── 10. MODIFICAR NOMBRE Y DATOS DEL PACIENTE ───
export async function modificarDatosPaciente(formData: FormData): Promise<void> {
  const episodeId = String(formData.get('episodeId') ?? '')
  const { userId, role, episode } = await exigirPermiso(episodeId, 'registrar')

  const firstName = String(formData.get('firstName') ?? '').trim()
  const lastName = String(formData.get('lastName') ?? '').trim()
  const age = parseInt(String(formData.get('age') ?? '0'), 10)
  const sex = String(formData.get('sex') ?? '').trim()
  const cedula = String(formData.get('cedula') ?? '').trim() || null

  if (firstName.length < 2 || lastName.length < 2) {
    volverAlExpediente(episodeId, 'Escriba un nombre y apellido válidos')
  }

  const previo = await prisma.patient.findUnique({
    where: { id: episode.patientId },
    select: { firstName: true, lastName: true, age: true, sex: true, cedula: true },
  })

  await prisma.patient.update({
    where: { id: episode.patientId },
    data: {
      firstName,
      lastName,
      age: isNaN(age) ? null : age,
      sex,
      cedula,
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
    oldValue: previo,
    newValue: { firstName, lastName, age, sex, cedula },
    reason: 'Modificación de datos demográficos del paciente',
  })

  revalidatePath(`/dashboard/paciente/${episodeId}`)
  revalidatePath('/dashboard')
}

// ─── 11. MODIFICAR DIAGNÓSTICOS ───
export async function modificarDiagnosticos(formData: FormData): Promise<void> {
  const episodeId = String(formData.get('episodeId') ?? '')
  const { userId, role, episode } = await exigirPermiso(episodeId, 'registrar')

  const primaryDiagnosis = String(formData.get('primaryDiagnosis') ?? '').trim()
  const secondaryDiagnoses = String(formData.get('secondaryDiagnoses') ?? '').trim()

  if (!primaryDiagnosis) volverAlExpediente(episodeId, 'Escriba el diagnóstico principal')

  const previo = await prisma.episode.findUnique({
    where: { id: episodeId },
    select: { primaryDiagnosis: true, secondaryDiagnoses: true },
  })

  await prisma.episode.update({
    where: { id: episodeId },
    data: {
      primaryDiagnosis,
      secondaryDiagnoses: secondaryDiagnoses || null,
    },
  })

  await logAudit({
    actorId: userId,
    actorRole: role,
    action: 'update',
    entity: 'episode',
    entityId: episodeId,
    patientId: episode.patientId,
    episodeId,
    oldValue: previo,
    newValue: { primaryDiagnosis, secondaryDiagnoses },
    reason: 'Actualización de diagnósticos del paciente',
  })

  revalidatePath(`/dashboard/paciente/${episodeId}`)
  revalidatePath('/dashboard')
}

// ─── 12. PASAR DE INTERCONSULTA A PROPIO (SALA) ───
export async function transferirAPropio(formData: FormData): Promise<void> {
  const episodeId = String(formData.get('episodeId') ?? '')
  const { userId, role, email } = await exigirPermiso(episodeId, 'registrar')

  const room = String(formData.get('room') ?? '').trim()
  const bed = String(formData.get('bed') ?? '').trim()
  const attendingDoctor = String(formData.get('attendingDoctor') ?? '').trim()

  if (!room || !bed) volverAlExpediente(episodeId, 'Indique la habitación y cama de sala asignadas')

  const episodePrevio = await prisma.episode.findUnique({
    where: { id: episodeId },
    select: { patientId: true },
  })
  if (!episodePrevio) redirect('/dashboard')

  await prisma.episode.update({
    where: { id: episodeId },
    data: {
      serviceType: 'propio',
      room,
      bed,
      attendingDoctor: attendingDoctor || null,
      admissionType: 'Traslado desde Interconsulta',
    },
  })

  await prisma.note.create({
    data: {
      episodeId,
      content: `*** INGRESO A SALA DESDE INTERCONSULTA ***\nPaciente recibido formalmente bajo el servicio de sala en Hab. ${room} - Cama ${bed}.\nMédico tratante: ${attendingDoctor || 'Asignado a sala'}.`,
      status: 'firmada',
      createdBy: email,
    },
  })

  await logAudit({
    actorId: userId,
    actorRole: role,
    action: 'update',
    entity: 'episode',
    entityId: episodeId,
    patientId: episodePrevio.patientId,
    episodeId,
    newValue: { serviceType: 'propio', room, bed, attendingDoctor },
    reason: 'Paciente transferido de Interconsulta a Paciente Propio de Sala',
  })

  revalidatePath(`/dashboard/paciente/${episodeId}`)
  revalidatePath('/dashboard')
}

// ─── 13. FINALIZAR / DAR DE ALTA A INTERCONSULTA ───
const ETIQUETA_EGRESO_INTERCONSULTA: Record<string, string> = {
  descargo: 'Descargo por especialidad / cierre de interconsulta',
  egreso: 'Egreso hospitalario',
  alta_peticion: 'Alta a petición',
  fallecido: 'Fallecido',
}

export async function finalizarInterconsulta(formData: FormData): Promise<void> {
  const episodeId = String(formData.get('episodeId') ?? '')
  const { userId, role, email } = await exigirPermiso(episodeId, 'alta')

  const dischargeType = String(formData.get('dischargeType') ?? 'descargo').trim() || 'descargo'
  const conclusion = String(formData.get('conclusion') ?? '').trim()
  if (!conclusion) volverAlExpediente(episodeId, 'Escriba la conclusión o nota de alta de la interconsulta')

  const episodePrevio = await prisma.episode.findUnique({
    where: { id: episodeId },
    select: { patientId: true },
  })
  if (!episodePrevio) redirect('/dashboard')

  const tipoTexto = ETIQUETA_EGRESO_INTERCONSULTA[dischargeType] ?? dischargeType

  await prisma.note.create({
    data: {
      episodeId,
      content: `*** ALTA / CIERRE DE INTERCONSULTA (${tipoTexto}) ***\nConclusión médica y recomendaciones al servicio tratante:\n${conclusion}`,
      status: 'firmada',
      createdBy: email,
    },
  })

  await prisma.episode.update({
    where: { id: episodeId },
    data: { status: 'closed', dischargeType },
  })

  await logAudit({
    actorId: userId,
    actorRole: role,
    action: 'update',
    entity: 'episode',
    entityId: episodeId,
    patientId: episodePrevio.patientId,
    episodeId,
    newValue: { status: 'closed', dischargeType, altaInterconsulta: conclusion },
    reason: `Interconsulta finalizada (${tipoTexto})`,
  })

  revalidatePath('/dashboard')
  redirect('/dashboard')
}

async function sincronizarResumenPlanBase(episodeId: string) {
  const activas = await prisma.baseDepartmentPlanEntry.findMany({
    where: { episodeId, isActive: true },
    orderBy: { createdAt: 'asc' },
    select: { content: true },
  })
  const resumen =
    activas.length > 0 ? activas.map((a) => a.content).join('\n\n') : null
  await prisma.episode.update({
    where: { id: episodeId },
    data: { baseDepartmentPlan: resumen },
  })
}

export async function agregarPlanDepartamentoBase(formData: FormData): Promise<void> {
  const episodeId = String(formData.get('episodeId') ?? '').trim()
  const { userId, role, email, episode } = await exigirPermiso(episodeId, 'registrar')

  const content = String(formData.get('content') ?? '').trim()
  if (!content) return

  const previo = await prisma.episode.findUnique({
    where: { id: episodeId },
    select: { baseDepartmentPlan: true },
  })
  const existentesCount = await prisma.baseDepartmentPlanEntry
    .count({ where: { episodeId } })
    .catch(() => 0)

  // Si había un plan legado sin entradas en BaseDepartmentPlanEntry, lo migramos primero para no perderlo
  if (existentesCount === 0 && previo?.baseDepartmentPlan?.trim()) {
    const legadoAudit = await prisma.auditLog
      .findFirst({
        where: {
          episodeId,
          reason: { contains: 'plan del departamento base', mode: 'insensitive' },
        },
        orderBy: { serverTs: 'desc' },
        include: { actor: { select: { email: true } } },
      })
      .catch(() => null)

    await prisma.baseDepartmentPlanEntry.create({
      data: {
        episodeId,
        content: previo.baseDepartmentPlan.trim(),
        createdBy: legadoAudit?.actor?.email ?? email,
        createdAt: legadoAudit?.serverTs ?? new Date(),
      },
    })
  }

  const creada = await prisma.baseDepartmentPlanEntry.create({
    data: {
      episodeId,
      content,
      createdBy: email,
    },
  })

  await sincronizarResumenPlanBase(episodeId)

  await logAudit({
    actorId: userId,
    actorRole: role,
    action: 'create',
    entity: 'base_department_plan',
    entityId: creada.id,
    patientId: episode.patientId,
    episodeId,
    newValue: { contenido: content, registradoPor: email },
    reason: 'Nueva indicación agregada al plan del departamento base',
  })

  revalidatePath(`/dashboard/paciente/${episodeId}`)
}

export async function editarPlanDepartamentoBase(formData: FormData): Promise<void> {
  const episodeId = String(formData.get('episodeId') ?? '').trim()
  const entryId = String(formData.get('entryId') ?? '').trim()
  const content = String(formData.get('content') ?? '').trim()
  const { userId, role, email, episode } = await exigirPermiso(episodeId, 'registrar')

  if (!content || !entryId) return

  if (entryId === 'legacy') {
    const previo = await prisma.episode.findUnique({
      where: { id: episodeId },
      select: { baseDepartmentPlan: true },
    })
    const legadoAudit = await prisma.auditLog
      .findFirst({
        where: {
          episodeId,
          reason: { contains: 'plan del departamento base', mode: 'insensitive' },
        },
        orderBy: { serverTs: 'desc' },
        include: { actor: { select: { email: true } } },
      })
      .catch(() => null)

    const creada = await prisma.baseDepartmentPlanEntry.create({
      data: {
        episodeId,
        content,
        createdBy: legadoAudit?.actor?.email ?? email,
        createdAt: legadoAudit?.serverTs ?? new Date(),
        updatedBy: email,
        updatedAt: new Date(),
      },
    })

    await sincronizarResumenPlanBase(episodeId)

    await logAudit({
      actorId: userId,
      actorRole: role,
      action: 'update',
      entity: 'base_department_plan',
      entityId: creada.id,
      patientId: episode.patientId,
      episodeId,
      oldValue: { contenido: previo?.baseDepartmentPlan ?? null },
      newValue: { contenido: content, editadoPor: email },
      reason: 'Indicación del plan del departamento base actualizada',
    })

    revalidatePath(`/dashboard/paciente/${episodeId}`)
    return
  }

  const actual = await prisma.baseDepartmentPlanEntry.findFirst({
    where: { id: entryId, episodeId },
  })
  if (!actual) return

  await prisma.baseDepartmentPlanEntry.update({
    where: { id: actual.id },
    data: {
      content,
      updatedBy: email,
      updatedAt: new Date(),
    },
  })

  await sincronizarResumenPlanBase(episodeId)

  await logAudit({
    actorId: userId,
    actorRole: role,
    action: 'update',
    entity: 'base_department_plan',
    entityId: actual.id,
    patientId: episode.patientId,
    episodeId,
    oldValue: { contenido: actual.content },
    newValue: { contenido: content, editadoPor: email },
    reason: 'Indicación del plan del departamento base editada',
  })

  revalidatePath(`/dashboard/paciente/${episodeId}`)
}

export async function archivarPlanDepartamentoBase(formData: FormData): Promise<void> {
  const episodeId = String(formData.get('episodeId') ?? '').trim()
  const entryId = String(formData.get('entryId') ?? '').trim()
  const { userId, role, email, episode } = await exigirPermiso(episodeId, 'registrar')

  if (!entryId) return

  if (entryId === 'legacy') {
    const previo = await prisma.episode.findUnique({
      where: { id: episodeId },
      select: { baseDepartmentPlan: true },
    })
    if (previo?.baseDepartmentPlan?.trim()) {
      const legadoAudit = await prisma.auditLog
        .findFirst({
          where: {
            episodeId,
            reason: { contains: 'plan del departamento base', mode: 'insensitive' },
          },
          orderBy: { serverTs: 'desc' },
          include: { actor: { select: { email: true } } },
        })
        .catch(() => null)

      const archivada = await prisma.baseDepartmentPlanEntry.create({
        data: {
          episodeId,
          content: previo.baseDepartmentPlan.trim(),
          isActive: false,
          createdBy: legadoAudit?.actor?.email ?? email,
          createdAt: legadoAudit?.serverTs ?? new Date(),
          updatedBy: email,
          updatedAt: new Date(),
        },
      })

      await prisma.episode.update({
        where: { id: episodeId },
        data: { baseDepartmentPlan: null },
      })

      await logAudit({
        actorId: userId,
        actorRole: role,
        action: 'update',
        entity: 'base_department_plan',
        entityId: archivada.id,
        patientId: episode.patientId,
        episodeId,
        oldValue: { contenido: previo.baseDepartmentPlan, isActive: true },
        newValue: { contenido: previo.baseDepartmentPlan, isActive: false, archivadoPor: email },
        reason: 'Indicación del plan del departamento base archivada',
      })
    }

    revalidatePath(`/dashboard/paciente/${episodeId}`)
    return
  }

  const actual = await prisma.baseDepartmentPlanEntry.findFirst({
    where: { id: entryId, episodeId },
  })
  if (!actual) return

  await prisma.baseDepartmentPlanEntry.update({
    where: { id: actual.id },
    data: {
      isActive: false,
      updatedBy: email,
      updatedAt: new Date(),
    },
  })

  await sincronizarResumenPlanBase(episodeId)

  await logAudit({
    actorId: userId,
    actorRole: role,
    action: 'update',
    entity: 'base_department_plan',
    entityId: actual.id,
    patientId: episode.patientId,
    episodeId,
    oldValue: { contenido: actual.content, isActive: true },
    newValue: { contenido: actual.content, isActive: false, archivadoPor: email },
    reason: 'Indicación del plan del departamento base archivada',
  })

  revalidatePath(`/dashboard/paciente/${episodeId}`)
}

// ─── 14. TRATAMIENTO MÉDICO ACTUAL ───
export async function guardarTratamiento(formData: FormData): Promise<void> {
  const episodeId = String(formData.get('episodeId') ?? '')
  const { userId, role, email, episode } = await exigirPermiso(episodeId, 'registrar')

  const treatment = String(formData.get('currentTreatment') ?? '').trim()

  const previo = await prisma.episode.findUnique({
    where: { id: episodeId },
    select: { currentTreatment: true, patientId: true },
  })

  await prisma.episode.update({
    where: { id: episodeId },
    data: {
      currentTreatment: treatment || null,
      treatmentUpdatedBy: email,
      treatmentUpdatedAt: new Date(),
    },
  })

  await logAudit({
    actorId: userId,
    actorRole: role,
    action: 'update',
    entity: 'episode',
    entityId: episodeId,
    patientId: previo?.patientId ?? episode.patientId,
    episodeId,
    oldValue: { tratamiento: previo?.currentTreatment },
    newValue: { tratamiento: treatment, actualizadoPor: email },
    reason: 'Actualización de tratamiento médico actual del paciente',
  })

  revalidatePath(`/dashboard/paciente/${episodeId}`)
}

// ─── 15. PASAR DE PROPIO (SALA) A INTERCONSULTA ───
export async function transferirAInterconsulta(formData: FormData): Promise<void> {
  const episodeId = String(formData.get('episodeId') ?? '')
  const { userId, role, email } = await exigirPermiso(episodeId, 'registrar')

  const consultingDepartment = String(formData.get('consultingDepartment') ?? '').trim()
  const consultingResident = String(formData.get('consultingResident') ?? '').trim()
  const room = String(formData.get('room') ?? '').trim()
  const bed = String(formData.get('bed') ?? '').trim()
  const chiefComplaint = String(formData.get('chiefComplaint') ?? '').trim()

  if (!consultingDepartment) volverAlExpediente(episodeId, 'Indique el servicio o departamento interconsultante')
  if (!room || !bed) volverAlExpediente(episodeId, 'Indique la ubicación / habitación y cama')
  if (!chiefComplaint) volverAlExpediente(episodeId, 'Indique el motivo de la interconsulta')

  const episodePrevio = await prisma.episode.findUnique({
    where: { id: episodeId },
    select: { patientId: true },
  })
  if (!episodePrevio) redirect('/dashboard')

  await prisma.episode.update({
    where: { id: episodeId },
    data: {
      serviceType: 'interconsulta',
      consultingDepartment,
      consultingResident: consultingResident || null,
      room,
      bed,
      chiefComplaint,
      admissionType: 'Traslado a Interconsulta',
    },
  })

  await prisma.note.create({
    data: {
      episodeId,
      content: `*** TRASLADO A INTERCONSULTA ***\nPaciente transferido formalmente al servicio de ${consultingDepartment} en ${room} - Cama ${bed}.\nResidente interconsultado: ${consultingResident || 'Sin asignar'}.\nMotivo: ${chiefComplaint}.`,
      status: 'firmada',
      createdBy: email,
    },
  })

  await logAudit({
    actorId: userId,
    actorRole: role,
    action: 'update',
    entity: 'episode',
    entityId: episodeId,
    patientId: episodePrevio.patientId,
    episodeId,
    newValue: { serviceType: 'interconsulta', consultingDepartment, consultingResident, room, bed, chiefComplaint },
    reason: 'Paciente transferido de Paciente Propio de Sala a Interconsulta',
  })

  revalidatePath(`/dashboard/paciente/${episodeId}`)
  revalidatePath('/dashboard')
}

// ─── 16. PERFIL CLÍNICO DE MEDICINA INTERNA ───
export async function guardarPerfilMedicinaInterna(formData: FormData): Promise<void> {
  const episodeId = String(formData.get('episodeId') ?? '')
  const { userId, role, email, episode } = await exigirPermiso(episodeId, 'registrar')

  const clinicalStatus = String(formData.get('clinicalStatus') ?? 'Estable').trim() || 'Estable'
  const codeStatus = String(formData.get('codeStatus') ?? 'Full Code').trim() || 'Full Code'
  const isolationType = String(formData.get('isolationType') ?? 'Sin aislamiento').trim() || 'Sin aislamiento'
  const oxygenSupport = String(formData.get('oxygenSupport') ?? 'Aire ambiente').trim() || 'Aire ambiente'
  const dietType = String(formData.get('dietType') ?? 'Dieta corriente').trim() || 'Dieta corriente'
  const thromboprophylaxis =
    String(formData.get('thromboprophylaxis') ?? 'Pendiente evaluar').trim() || 'Pendiente evaluar'
  const ulcerProphylaxis =
    String(formData.get('ulcerProphylaxis') ?? 'No indicada').trim() || 'No indicada'
  const invasiveDevices = String(formData.get('invasiveDevices') ?? '').trim() || null
  const fluidBalance24h = String(formData.get('fluidBalance24h') ?? '').trim() || null
  const dischargeGoal = String(formData.get('dischargeGoal') ?? '').trim() || null

  await prisma.internalMedicineProfile.upsert({
    where: { episodeId },
    update: {
      clinicalStatus,
      codeStatus,
      isolationType,
      oxygenSupport,
      dietType,
      thromboprophylaxis,
      ulcerProphylaxis,
      invasiveDevices,
      fluidBalance24h,
      dischargeGoal,
      updatedBy: email,
    },
    create: {
      episodeId,
      clinicalStatus,
      codeStatus,
      isolationType,
      oxygenSupport,
      dietType,
      thromboprophylaxis,
      ulcerProphylaxis,
      invasiveDevices,
      fluidBalance24h,
      dischargeGoal,
      updatedBy: email,
    },
  })

  await logAudit({
    actorId: userId,
    actorRole: role,
    action: 'update',
    entity: 'internal_medicine_profile',
    patientId: episode.patientId,
    episodeId,
    newValue: {
      clinicalStatus,
      codeStatus,
      isolationType,
      oxygenSupport,
      dietType,
      thromboprophylaxis,
      ulcerProphylaxis,
      invasiveDevices,
      fluidBalance24h,
      dischargeGoal,
    },
    reason: 'Actualización de seguimiento clínico de Medicina Interna',
  })

  revalidatePath(`/dashboard/paciente/${episodeId}`)
  revalidatePath('/dashboard')
}

export async function actualizarCampoMedicinaInterna(formData: FormData): Promise<void> {
  const episodeId = String(formData.get('episodeId') ?? '').trim()
  const field = String(formData.get('field') ?? '').trim()
  const value = String(formData.get('value') ?? '').trim()
  const { userId, role, email, episode } = await exigirPermiso(episodeId, 'registrar')

  const camposPermitidos = ['oxygenSupport', 'dietType', 'fluidBalance24h', 'dischargeGoal'] as const
  if (!camposPermitidos.includes(field as (typeof camposPermitidos)[number])) return

  const previo = await prisma.internalMedicineProfile.findUnique({
    where: { episodeId },
  })

  const valorFinal =
    field === 'oxygenSupport'
      ? value || 'Aire ambiente'
      : field === 'dietType'
        ? value || 'Dieta corriente'
        : value || null

  await prisma.internalMedicineProfile.upsert({
    where: { episodeId },
    update: {
      [field]: valorFinal,
      updatedBy: email,
    },
    create: {
      episodeId,
      oxygenSupport: field === 'oxygenSupport' ? String(valorFinal) : 'Aire ambiente',
      dietType: field === 'dietType' ? String(valorFinal) : 'Dieta corriente',
      fluidBalance24h: field === 'fluidBalance24h' ? (valorFinal as string | null) : null,
      dischargeGoal: field === 'dischargeGoal' ? (valorFinal as string | null) : null,
      updatedBy: email,
    },
  })

  await logAudit({
    actorId: userId,
    actorRole: role,
    action: 'update',
    entity: 'internal_medicine_profile',
    entityId: episodeId,
    patientId: episode.patientId,
    episodeId,
    oldValue: { [field]: previo ? (previo as Record<string, unknown>)[field] ?? null : null },
    newValue: { [field]: valorFinal, actualizadoPor: email },
    reason: `Actualización individual de Medicina Interna (${field})`,
  })

  revalidatePath(`/dashboard/paciente/${episodeId}`)
  revalidatePath('/dashboard')
}

// ─── 17. ANTROPOMETRÍA (PESO, TALLA E IMC AUTOMÁTICO) ───
export async function guardarAntropometria(formData: FormData): Promise<void> {
  const episodeId = String(formData.get('episodeId') ?? '')
  const { userId, role, email, episode } = await exigirPermiso(episodeId, 'registrar')

  const weightStr = String(formData.get('anthropometryWeight') ?? '').trim()
  const weightUnit = String(formData.get('anthropometryWeightUnit') ?? 'kg').trim() === 'lb' ? 'lb' : 'kg'
  const heightStr = String(formData.get('anthropometryHeightCm') ?? '').trim()

  const anthropometryWeight = weightStr ? parseFloat(weightStr) : null
  const anthropometryHeightCm = heightStr ? parseFloat(heightStr) : null

  if (
    anthropometryWeight !== null &&
    (!Number.isFinite(anthropometryWeight) || anthropometryWeight <= 0 || anthropometryWeight > 500)
  ) {
    volverAlExpediente(episodeId, 'El peso debe ser un número válido mayor que 0')
  }

  if (
    anthropometryHeightCm !== null &&
    (!Number.isFinite(anthropometryHeightCm) || anthropometryHeightCm < 30 || anthropometryHeightCm > 260)
  ) {
    volverAlExpediente(episodeId, 'La talla debe estar entre 30 y 260 cm')
  }

  await prisma.episode.update({
    where: { id: episodeId },
    data: {
      anthropometryWeight,
      anthropometryWeightUnit: weightUnit,
      anthropometryHeightCm,
      anthropometryUpdatedBy: email,
      anthropometryUpdatedAt: new Date(),
    },
  })

  await logAudit({
    actorId: userId,
    actorRole: role,
    action: 'update',
    entity: 'episode_anthropometry',
    entityId: episodeId,
    patientId: episode.patientId,
    episodeId,
    newValue: {
      peso: anthropometryWeight ? `${anthropometryWeight} ${weightUnit}` : null,
      tallaCm: anthropometryHeightCm,
    },
    reason: 'Actualización de antropometría (Peso, Talla e IMC)',
  })

  revalidatePath(`/dashboard/paciente/${episodeId}`)
  revalidatePath('/dashboard')
}

// ─── 18. INFORMACIÓN QUIRÚRGICA (INTERFAZ DE CIRUGÍA) ───
export async function guardarInfoQuirurgica(formData: FormData): Promise<void> {
  const episodeId = String(formData.get('episodeId') ?? '')
  const { userId, role, email, episode } = await exigirPermiso(episodeId, 'registrar')

  const procedureName = String(formData.get('procedureName') ?? '').trim() || null
  const surgeryDateStr = String(formData.get('surgeryDate') ?? '').trim()
  const surgeryTypeRaw = String(formData.get('surgeryType') ?? 'electiva').trim()
  const surgeryType = surgeryTypeRaw === 'emergencia' ? 'emergencia' : 'electiva'
  const surgicalSpecialty = String(formData.get('surgicalSpecialty') ?? '').trim() || null
  const surgeonAndAssistants = String(formData.get('surgeonAndAssistants') ?? '').trim() || null
  const statusRaw = String(formData.get('surgeryStatus') ?? 'pendiente').trim()
  const surgeryStatus = ['pendiente', 'en_quirofano', 'realizada', 'suspendida'].includes(statusRaw)
    ? statusRaw
    : 'pendiente'
  const suspensionReasonRaw = String(formData.get('suspensionReason') ?? '').trim()
  const suspensionReason = surgeryStatus === 'suspendida' ? suspensionReasonRaw || null : null

  if (surgeryStatus === 'suspendida' && !suspensionReason) {
    volverAlExpediente(episodeId, 'Indica el motivo por el cual se suspendió la cirugía')
  }

  const surgeryDate = surgeryDateStr ? new Date(`${surgeryDateStr}:00-04:00`) : null
  if (surgeryDate && Number.isNaN(surgeryDate.getTime())) {
    volverAlExpediente(episodeId, 'La fecha de cirugía no es válida')
  }

  await prisma.surgicalProfile.upsert({
    where: { episodeId },
    update: {
      procedureName,
      surgeryDate,
      surgeryType,
      surgicalSpecialty,
      surgeonAndAssistants,
      surgeryStatus,
      suspensionReason,
      updatedBy: email,
    },
    create: {
      episodeId,
      procedureName,
      surgeryDate,
      surgeryType,
      surgicalSpecialty,
      surgeonAndAssistants,
      surgeryStatus,
      suspensionReason,
      updatedBy: email,
    },
  })

  await logAudit({
    actorId: userId,
    actorRole: role,
    action: 'update',
    entity: 'surgical_profile',
    entityId: episodeId,
    patientId: episode.patientId,
    episodeId,
    newValue: {
      procedureName,
      surgeryDate: surgeryDate?.toISOString() ?? null,
      surgeryType,
      surgicalSpecialty,
      surgeonAndAssistants,
      surgeryStatus,
      suspensionReason,
    },
    reason:
      surgeryStatus === 'suspendida' && suspensionReason
        ? `Cirugía suspendida: ${suspensionReason}`
        : 'Actualización de información quirúrgica del paciente',
  })

  revalidatePath(`/dashboard/paciente/${episodeId}`)
  revalidatePath('/dashboard')
}

// ─── 18B. INFORMACIÓN ORTOPÉDICA / TRAUMA Y EVALUACIÓN NEUROVASCULAR (ORTOPEDIA) ───
export async function guardarInfoOrtopedica(formData: FormData): Promise<void> {
  const episodeId = String(formData.get('episodeId') ?? '')
  const { userId, role, email, episode } = await exigirPermiso(episodeId, 'registrar')

  const procedureName = String(formData.get('procedureName') ?? '').trim() || null
  const affectedLimb = String(formData.get('affectedLimb') ?? '').trim() || null
  const managementType = String(formData.get('managementType') ?? '').trim() || null
  const surgeryDateStr = String(formData.get('surgeryDate') ?? '').trim()
  const surgeryTypeRaw = String(formData.get('surgeryType') ?? 'electiva').trim()
  const surgeryType = ['electiva', 'emergencia', 'conservador'].includes(surgeryTypeRaw)
    ? surgeryTypeRaw
    : 'electiva'
  const surgicalSpecialty = String(formData.get('surgicalSpecialty') ?? '').trim() || null
  const surgeonAndAssistants = String(formData.get('surgeonAndAssistants') ?? '').trim() || null
  const weightBearingPlan = String(formData.get('weightBearingPlan') ?? '').trim() || null
  const statusRaw = String(formData.get('surgeryStatus') ?? 'pendiente').trim()
  const surgeryStatus = [
    'pendiente',
    'en_quirofano',
    'realizada',
    'manejo_conservador',
    'suspendida',
  ].includes(statusRaw)
    ? statusRaw
    : 'pendiente'
  const suspensionReasonRaw = String(formData.get('suspensionReason') ?? '').trim()
  const suspensionReason = surgeryStatus === 'suspendida' ? suspensionReasonRaw || null : null

  if (surgeryStatus === 'suspendida' && !suspensionReason) {
    volverAlExpediente(episodeId, 'Indica el motivo por el cual se suspendió la intervención')
  }

  const surgeryDate = surgeryDateStr ? new Date(`${surgeryDateStr}:00-04:00`) : null
  if (surgeryDate && Number.isNaN(surgeryDate.getTime())) {
    volverAlExpediente(episodeId, 'La fecha del procedimiento no es válida')
  }

  await prisma.surgicalProfile.upsert({
    where: { episodeId },
    update: {
      procedureName,
      affectedLimb,
      managementType,
      surgeryDate,
      surgeryType,
      surgicalSpecialty,
      surgeonAndAssistants,
      weightBearingPlan,
      surgeryStatus,
      suspensionReason,
      updatedBy: email,
    },
    create: {
      episodeId,
      procedureName,
      affectedLimb,
      managementType,
      surgeryDate,
      surgeryType,
      surgicalSpecialty,
      surgeonAndAssistants,
      weightBearingPlan,
      surgeryStatus,
      suspensionReason,
      updatedBy: email,
    },
  })

  await logAudit({
    actorId: userId,
    actorRole: role,
    action: 'update',
    entity: 'surgical_profile',
    entityId: episodeId,
    patientId: episode.patientId,
    episodeId,
    newValue: {
      procedureName,
      affectedLimb,
      managementType,
      surgeryDate: surgeryDate?.toISOString() ?? null,
      surgeryType,
      surgicalSpecialty,
      surgeonAndAssistants,
      weightBearingPlan,
      surgeryStatus,
      suspensionReason,
    },
    reason:
      surgeryStatus === 'suspendida' && suspensionReason
        ? `Intervención ortopédica suspendida: ${suspensionReason}`
        : 'Actualización de plan y procedimiento de Ortopedia y Traumatología',
  })

  revalidatePath(`/dashboard/paciente/${episodeId}`)
  revalidatePath('/dashboard')
}

export async function guardarEvaluacionNeurovascularOrtopedia(formData: FormData): Promise<void> {
  const episodeId = String(formData.get('episodeId') ?? '')
  const { userId, role, email, episode } = await exigirPermiso(episodeId, 'registrar')

  const nvRaw = String(formData.get('neurovascularStatus') ?? 'conservado').trim()
  const neurovascularStatus = nvRaw === 'alerta_alterado' ? 'alerta_alterado' : 'conservado'
  const capillaryRefill = String(formData.get('capillaryRefill') ?? '').trim() || null
  const distalPulses = String(formData.get('distalPulses') ?? '').trim() || null
  const distalSensitivity = String(formData.get('distalSensitivity') ?? '').trim() || null
  const distalMotility = String(formData.get('distalMotility') ?? '').trim() || null
  const compRaw = formData.get('compartmentAlert')
  const compartmentAlert = compRaw === 'true' || compRaw === 'on'
  const evaStr = String(formData.get('painScaleEva') ?? '').trim()
  const weightBearingPlan = String(formData.get('weightBearingPlan') ?? '').trim() || null
  const orthopedicNotes = String(formData.get('orthopedicNotes') ?? '').trim() || null

  let painScaleEva: number | null = null
  if (evaStr !== '') {
    const parsed = Number(evaStr)
    if (!Number.isFinite(parsed) || !Number.isInteger(parsed) || parsed < 0 || parsed > 10) {
      volverAlExpediente(episodeId, 'La escala de dolor EVA debe ser un número entero entre 0 y 10')
    }
    painScaleEva = parsed
  }

  const now = new Date()

  await prisma.surgicalProfile.upsert({
    where: { episodeId },
    update: {
      neurovascularStatus,
      capillaryRefill,
      distalPulses,
      distalSensitivity,
      distalMotility,
      compartmentAlert,
      painScaleEva,
      weightBearingPlan,
      orthopedicNotes,
      neurovascularUpdatedBy: email,
      neurovascularUpdatedAt: now,
      updatedBy: email,
    },
    create: {
      episodeId,
      neurovascularStatus,
      capillaryRefill,
      distalPulses,
      distalSensitivity,
      distalMotility,
      compartmentAlert,
      painScaleEva,
      weightBearingPlan,
      orthopedicNotes,
      neurovascularUpdatedBy: email,
      neurovascularUpdatedAt: now,
      updatedBy: email,
    },
  })

  await logAudit({
    actorId: userId,
    actorRole: role,
    action: 'update',
    entity: 'surgical_profile',
    entityId: episodeId,
    patientId: episode.patientId,
    episodeId,
    newValue: {
      neurovascularStatus,
      capillaryRefill,
      distalPulses,
      distalSensitivity,
      distalMotility,
      compartmentAlert,
      painScaleEva,
      weightBearingPlan,
      orthopedicNotes,
    },
    reason:
      compartmentAlert || neurovascularStatus === 'alerta_alterado'
        ? 'Alerta neurovascular / compartimental registrada en Ortopedia'
        : 'Evaluación neurovascular distal, dolor (EVA) y pauta de carga actualizada',
  })

  revalidatePath(`/dashboard/paciente/${episodeId}`)
  revalidatePath('/dashboard')
}

// ─── 19. ANTIBIÓTICOS CON CONTEO AUTOMÁTICO DE DÍAS ───
export async function agregarAntibiotico(formData: FormData): Promise<void> {
  const episodeId = String(formData.get('episodeId') ?? '')
  const { userId, role, email, episode } = await exigirPermiso(episodeId, 'registrar')

  const name = String(formData.get('name') ?? '').trim()
  const dose = String(formData.get('dose') ?? '').trim() || null
  const route = String(formData.get('route') ?? 'IV').trim() || null
  const startedAtStr = String(formData.get('startedAt') ?? '').trim()

  if (!name) volverAlExpediente(episodeId, 'Escribe el nombre del antibiótico')

  const startedAt = startedAtStr ? new Date(`${startedAtStr}T08:00:00-04:00`) : new Date()
  if (Number.isNaN(startedAt.getTime())) {
    volverAlExpediente(episodeId, 'La fecha de inicio del antibiótico no es válida')
  }

  const abx = await prisma.episodeAntibiotic.create({
    data: {
      episodeId,
      name,
      dose,
      route,
      startedAt,
      isActive: true,
      createdBy: email,
    },
  })

  await logAudit({
    actorId: userId,
    actorRole: role,
    action: 'create',
    entity: 'episode_antibiotic',
    entityId: abx.id,
    patientId: episode.patientId,
    episodeId,
    newValue: { name, dose, route, startedAt: startedAt.toISOString() },
    reason: `Inicio de esquema antibiótico (${name})`,
  })

  revalidatePath(`/dashboard/paciente/${episodeId}`)
}

export async function suspenderAntibiotico(formData: FormData): Promise<void> {
  const episodeId = String(formData.get('episodeId') ?? '')
  const antibioticId = String(formData.get('antibioticId') ?? '')
  const { userId, role, email, episode } = await exigirPermiso(episodeId, 'registrar')

  if (!antibioticId) return

  const previo = await prisma.episodeAntibiotic.findFirst({
    where: { id: antibioticId, episodeId, isActive: true },
  })
  if (!previo) return

  await prisma.episodeAntibiotic.update({
    where: { id: antibioticId },
    data: {
      isActive: false,
      stoppedAt: new Date(),
      stoppedBy: email,
    },
  })

  await logAudit({
    actorId: userId,
    actorRole: role,
    action: 'update',
    entity: 'episode_antibiotic',
    entityId: antibioticId,
    patientId: episode.patientId,
    episodeId,
    newValue: { isActive: false, stoppedBy: email },
    reason: `Antibiótico suspendido/completado (${previo.name})`,
  })

  revalidatePath(`/dashboard/paciente/${episodeId}`)
}

// ─── 20. DISPOSITIVOS / CATÉTERES QUIRÚRGICOS EN EXPEDIENTE ───
export async function agregarDispositivoQuirurgico(formData: FormData): Promise<void> {
  const episodeId = String(formData.get('episodeId') ?? '')
  const { userId, role, email, episode } = await exigirPermiso(episodeId, 'registrar')

  const category = String(formData.get('category') ?? '').trim()
  const notes = String(formData.get('notes') ?? '').trim() || null
  if (!category || !episode.residencyId) return

  const dispositivo = await prisma.surgicalDevice.create({
    data: {
      residencyId: episode.residencyId,
      episodeId,
      category,
      notes,
      isActive: true,
      createdBy: email,
    },
  })

  await logAudit({
    actorId: userId,
    actorRole: role,
    action: 'create',
    entity: 'surgical_device',
    entityId: dispositivo.id,
    patientId: episode.patientId,
    episodeId,
    newValue: { category, notes },
    reason: `Dispositivo/acceso registrado en cirugía (${category})`,
  })

  revalidatePath(`/dashboard/paciente/${episodeId}`)
  revalidatePath('/dashboard')
}

export async function retirarDispositivoQuirurgico(formData: FormData): Promise<void> {
  const episodeId = String(formData.get('episodeId') ?? '')
  const deviceId = String(formData.get('deviceId') ?? '')
  const { userId, role, email, episode } = await exigirPermiso(episodeId, 'registrar')

  if (!deviceId) return

  const previo = await prisma.surgicalDevice.findFirst({
    where: { id: deviceId, episodeId, isActive: true },
  })
  if (!previo) return

  await prisma.surgicalDevice.update({
    where: { id: deviceId },
    data: {
      isActive: false,
      removedBy: email,
      removedAt: new Date(),
    },
  })

  await logAudit({
    actorId: userId,
    actorRole: role,
    action: 'update',
    entity: 'surgical_device',
    entityId: deviceId,
    patientId: episode.patientId,
    episodeId,
    newValue: { isActive: false, removedBy: email },
    reason: `Dispositivo/acceso retirado (${previo.category})`,
  })

  revalidatePath(`/dashboard/paciente/${episodeId}`)
  revalidatePath('/dashboard')
}

// ─── 21. CONTROL INDEPENDIENTE DE DRENAJES (SEPARADO DE SIGNOS VITALES) ───
export async function agregarDrenaje(formData: FormData): Promise<{
  ok: boolean
  error?: string
}> {
  const episodeId = String(formData.get('episodeId') ?? '').trim()
  const { userId, role, email, episode } = await exigirPermiso(episodeId, 'registrar')

  const name = String(formData.get('name') ?? '').trim()
  const location = String(formData.get('location') ?? '').trim() || null
  const initialVolStr = String(formData.get('initialVolumeMl') ?? '').trim()
  const characteristic = String(formData.get('characteristic') ?? '').trim() || null

  if (!name) {
    return { ok: false, error: 'Escribe el nombre o tipo de drenaje (ej. Sonda pleural).' }
  }

  let initialVolumeMl: number | null = null
  if (initialVolStr !== '') {
    const parsed = Number(initialVolStr)
    if (!Number.isFinite(parsed) || !Number.isInteger(parsed) || parsed < 0 || parsed > 20000) {
      return { ok: false, error: 'El débito inicial debe ser un entero entre 0 y 20,000 mL.' }
    }
    initialVolumeMl = parsed
  }

  const creado = await prisma.episodeDrain.create({
    data: {
      episodeId,
      name,
      location,
      isActive: true,
      createdBy: email,
    },
  })

  if (initialVolumeMl !== null) {
    await prisma.episodeDrainEntry.create({
      data: {
        drainId: creado.id,
        volumeMl: initialVolumeMl,
        characteristic,
        recordedBy: email,
      },
    })
  }

  await logAudit({
    actorId: userId,
    actorRole: role,
    action: 'create',
    entity: 'episode_drain',
    entityId: creado.id,
    patientId: episode.patientId,
    episodeId,
    newValue: {
      name,
      location,
      initialVolumeMl,
      characteristic,
      createdBy: email,
    },
    reason: `Drenaje agregado: ${name}${location ? ` (${location})` : ''}`,
  })

  revalidatePath(`/dashboard/paciente/${episodeId}`)
  return { ok: true }
}

export async function registrarDebitoDrenaje(formData: FormData): Promise<{
  ok: boolean
  error?: string
}> {
  const episodeId = String(formData.get('episodeId') ?? '').trim()
  const drainId = String(formData.get('drainId') ?? '').trim()
  const { userId, role, email, episode } = await exigirPermiso(episodeId, 'registrar')

  const volStr = String(formData.get('volumeMl') ?? '').trim()
  const characteristic = String(formData.get('characteristic') ?? '').trim() || null

  const volumeMl = Number(volStr)
  if (
    volStr === '' ||
    !Number.isFinite(volumeMl) ||
    !Number.isInteger(volumeMl) ||
    volumeMl < 0 ||
    volumeMl > 20000
  ) {
    return { ok: false, error: 'El volumen en mL debe ser un número entero entre 0 y 20,000.' }
  }

  const drain = await prisma.episodeDrain.findFirst({
    where: { id: drainId, episodeId, isActive: true },
  })
  if (!drain) {
    return { ok: false, error: 'Drenaje no encontrado o ya fue retirado.' }
  }

  const entry = await prisma.episodeDrainEntry.create({
    data: {
      drainId: drain.id,
      volumeMl,
      characteristic,
      recordedBy: email,
    },
  })

  await logAudit({
    actorId: userId,
    actorRole: role,
    action: 'create',
    entity: 'episode_drain_entry',
    entityId: entry.id,
    patientId: episode.patientId,
    episodeId,
    newValue: {
      drainId: drain.id,
      drainName: drain.name,
      volumeMl,
      characteristic,
      recordedBy: email,
    },
    reason: `Débito registrado en ${drain.name}: ${volumeMl} mL`,
  })

  revalidatePath(`/dashboard/paciente/${episodeId}`)
  return { ok: true }
}

export async function editarDebitoDrenaje(formData: FormData): Promise<{
  ok: boolean
  error?: string
}> {
  const episodeId = String(formData.get('episodeId') ?? '').trim()
  const entryId = String(formData.get('entryId') ?? '').trim()
  const { userId, role, email, episode } = await exigirPermiso(episodeId, 'registrar')

  const volStr = String(formData.get('volumeMl') ?? '').trim()
  const characteristic = String(formData.get('characteristic') ?? '').trim() || null

  const volumeMl = Number(volStr)
  if (
    volStr === '' ||
    !Number.isFinite(volumeMl) ||
    !Number.isInteger(volumeMl) ||
    volumeMl < 0 ||
    volumeMl > 20000
  ) {
    return { ok: false, error: 'El volumen en mL debe ser un número entero entre 0 y 20,000.' }
  }

  const previo = await prisma.episodeDrainEntry.findFirst({
    where: { id: entryId, drain: { episodeId } },
    include: { drain: { select: { name: true } } },
  })
  if (!previo) {
    return { ok: false, error: 'Registro de débito no encontrado.' }
  }

  await prisma.episodeDrainEntry.update({
    where: { id: previo.id },
    data: {
      volumeMl,
      characteristic,
      updatedBy: email,
      updatedAt: new Date(),
    },
  })

  await logAudit({
    actorId: userId,
    actorRole: role,
    action: 'update',
    entity: 'episode_drain_entry',
    entityId: previo.id,
    patientId: episode.patientId,
    episodeId,
    oldValue: {
      drainName: previo.drain.name,
      volumeMl: previo.volumeMl,
      characteristic: previo.characteristic,
    },
    newValue: {
      drainName: previo.drain.name,
      volumeMl,
      characteristic,
      updatedBy: email,
    },
    reason: `Corrección de débito en ${previo.drain.name}: ${volumeMl} mL`,
  })

  revalidatePath(`/dashboard/paciente/${episodeId}`)
  return { ok: true }
}

export async function retirarDrenaje(formData: FormData): Promise<{
  ok: boolean
  error?: string
}> {
  const episodeId = String(formData.get('episodeId') ?? '').trim()
  const drainId = String(formData.get('drainId') ?? '').trim()
  const { userId, role, email, episode } = await exigirPermiso(episodeId, 'registrar')

  const previo = await prisma.episodeDrain.findFirst({
    where: { id: drainId, episodeId, isActive: true },
  })
  if (!previo) {
    return { ok: false, error: 'Drenaje no encontrado.' }
  }

  await prisma.episodeDrain.update({
    where: { id: previo.id },
    data: {
      isActive: false,
      removedBy: email,
      removedAt: new Date(),
    },
  })

  await logAudit({
    actorId: userId,
    actorRole: role,
    action: 'update',
    entity: 'episode_drain',
    entityId: previo.id,
    patientId: episode.patientId,
    episodeId,
    oldValue: { name: previo.name, isActive: true },
    newValue: { name: previo.name, isActive: false, removedBy: email },
    reason: `Drenaje retirado: ${previo.name}`,
  })

  revalidatePath(`/dashboard/paciente/${episodeId}`)
  return { ok: true }
}