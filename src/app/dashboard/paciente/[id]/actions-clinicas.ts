'use server'

import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { exigirPermiso, volverAlExpediente } from '@/lib/permisos'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

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

  const nombreFinal = testName === 'OTRO' || testName === 'OTRO_CULTIVO' ? customTest : testName

  if (!nombreFinal) volverAlExpediente(episodeId, 'Selecciona o escribe el nombre de la analítica')
  if (!result) volverAlExpediente(episodeId, 'Escribe el resultado de la analítica')

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
      result,
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
    newValue: { analitica: nombreFinal, categoria: category, resultado: result },
    reason: 'Reporte de laboratorio registrado',
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

  await prisma.labReport.update({
    where: { id: reportId },
    data: {
      category,
      testName: nombreFinal,
      sampleDate,
      result,
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
      resultado: result,
      fechaMuestra: sampleDate?.toISOString() ?? null,
      updatedBy: email,
    },
    reason: 'Reporte de laboratorio editado',
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

export async function guardarPlanDepartamentoBase(formData: FormData): Promise<void> {
  const episodeId = String(formData.get('episodeId') ?? '')
  const { userId, role, episode } = await exigirPermiso(episodeId, 'registrar')

  const baseDepartmentPlan = String(formData.get('baseDepartmentPlan') ?? '').trim()

  const previo = await prisma.episode.findUnique({
    where: { id: episodeId },
    select: { baseDepartmentPlan: true },
  })

  await prisma.episode.update({
    where: { id: episodeId },
    data: { baseDepartmentPlan: baseDepartmentPlan || null },
  })

  await logAudit({
    actorId: userId,
    actorRole: role,
    action: 'update',
    entity: 'episode',
    entityId: episodeId,
    patientId: episode.patientId,
    episodeId,
    oldValue: { planDepartamentoBase: previo?.baseDepartmentPlan ?? null },
    newValue: { planDepartamentoBase: baseDepartmentPlan || null },
    reason: 'Actualización de plan del departamento base en interconsulta',
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