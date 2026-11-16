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

// ─── 2. NOTAS IMPORTANTES ───
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
      isActive: true,
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
  const { userId, role, email, episode } = await exigirPermiso(episodeId, 'registrar')

  const ahora = new Date()

  await prisma.importantAlert.update({
    where: { id: alertId },
    data: {
      isActive: false,
      resolvedBy: email,
      resolvedAt: ahora,
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
    newValue: { isActive: false, resueltoPor: email, fechaResolucion: ahora.toISOString() },
    reason: 'Aviso importante retirado/resuelto por personal clínico',
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

// ─── 4. REPORTES DE LABORATORIO Y CULTIVOS ───
export async function guardarReporteLaboratorio(formData: FormData): Promise<void> {
  const episodeId = String(formData.get('episodeId') ?? '')
  const { userId, role, email, episode } = await exigirPermiso(episodeId, 'registrar')

  const testName = String(formData.get('testName') ?? '').trim()
  const customTest = String(formData.get('customTest') ?? '').trim()
  const category = String(formData.get('category') ?? 'Laboratorio').trim()
  const fechaStr = String(formData.get('sampleDate') ?? '').trim()
  const result = String(formData.get('result') ?? '').trim()

  const nombreFinal = testName === 'OTRO' ? customTest : testName

  if (!nombreFinal) volverAlExpediente(episodeId, 'Selecciona o escribe el nombre de la analítica o cultivo')
  if (!result) volverAlExpediente(episodeId, 'Escribe el resultado de la analítica o cultivo')

  const sampleDate = fechaStr ? new Date(`${fechaStr}T12:00:00-04:00`) : new Date()

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
    reason: 'Reporte de laboratorio o cultivo registrado',
  })

  revalidatePath(`/dashboard/paciente/${episodeId}`)
}

// EDITAR ANALÍTICA O CULTIVO
export async function editarReporteLaboratorio(formData: FormData): Promise<void> {
  const episodeId = String(formData.get('episodeId') ?? '')
  const reportId = String(formData.get('reportId') ?? '')
  const { userId, role, email, episode } = await exigirPermiso(episodeId, 'registrar')

  const testName = String(formData.get('testName') ?? '').trim()
  const category = String(formData.get('category') ?? 'Laboratorio').trim()
  const fechaStr = String(formData.get('sampleDate') ?? '').trim()
  const result = String(formData.get('result') ?? '').trim()

  if (!testName || !result) volverAlExpediente(episodeId, 'Debe indicar nombre y resultado')

  const previo = await prisma.labReport.findUnique({ where: { id: reportId } })
  if (!previo) volverAlExpediente(episodeId, 'Analítica no encontrada')

  const sampleDate = fechaStr ? new Date(`${fechaStr}T12:00:00-04:00`) : previo.sampleDate

  await prisma.labReport.update({
    where: { id: reportId },
    data: {
      testName,
      category,
      result,
      sampleDate,
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
    oldValue: previo,
    newValue: { testName, category, result, sampleDate, editadoPor: email },
    reason: 'Edición / corrección de reporte de analítica o cultivo',
  })

  revalidatePath(`/dashboard/paciente/${episodeId}`)
}

// BORRAR ANALÍTICA (BORRADO SEGURO CON AUDITORÍA)
export async function eliminarReporteLaboratorio(formData: FormData): Promise<void> {
  const episodeId = String(formData.get('episodeId') ?? '')
  const reportId = String(formData.get('reportId') ?? '')
  const { userId, role, email, episode } = await exigirPermiso(episodeId, 'registrar')

  const previo = await prisma.labReport.findUnique({ where: { id: reportId } })
  if (!previo) volverAlExpediente(episodeId, 'Analítica no encontrada')

  const ahora = new Date()

  await prisma.labReport.update({
    where: { id: reportId },
    data: {
      isDeleted: true,
      deletedBy: email,
      deletedAt: ahora,
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
    oldValue: { testName: previo.testName, result: previo.result },
    reason: `Reporte de laboratorio o cultivo eliminado por ${email}`,
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

// ─── 10. MODIFICAR NOMBRE, CÉDULA Y DATOS DEL PACIENTE ───
export async function modificarDatosPaciente(formData: FormData): Promise<void> {
  const episodeId = String(formData.get('episodeId') ?? '')
  const { userId, role, episode } = await exigirPermiso(episodeId, 'registrar')

  const cedula = String(formData.get('cedula') ?? '').trim()
  const firstName = String(formData.get('firstName') ?? '').trim()
  const lastName = String(formData.get('lastName') ?? '').trim()
  const age = parseInt(String(formData.get('age') ?? '0'), 10)
  const sex = String(formData.get('sex') ?? '').trim()

  if (firstName.length < 2 || lastName.length < 2) {
    volverAlExpediente(episodeId, 'Escriba un nombre y apellido válidos')
  }

  const previo = await prisma.patient.findUnique({
    where: { id: episode.patientId },
    select: { cedula: true, firstName: true, lastName: true, age: true, sex: true },
  })

  await prisma.patient.update({
    where: { id: episode.patientId },
    data: {
      cedula: cedula || null,
      firstName,
      lastName,
      age: isNaN(age) ? null : age,
      sex,
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
    newValue: { cedula, firstName, lastName, age, sex },
    reason: 'Modificación de datos demográficos del paciente (con Cédula)',
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

// ─── 13. FINALIZAR / ALTA DE INTERCONSULTA ───
export async function finalizarInterconsulta(formData: FormData): Promise<void> {
  const episodeId = String(formData.get('episodeId') ?? '')
  const { userId, role, email } = await exigirPermiso(episodeId, 'alta')

  const dischargeType = String(formData.get('dischargeType') ?? 'egreso').trim()
  const conclusion = String(formData.get('conclusion') ?? '').trim()

  if (!conclusion) {
    volverAlExpediente(episodeId, 'Escriba la conclusión o recomendaciones de cierre de la interconsulta')
  }

  const NOMBRES_ALTA: Record<string, string> = {
    descargo: 'Descargo (Sin criterio de seguimiento activo por el servicio)',
    egreso: 'Egreso / Mejoría clínica',
    alta_peticion: 'Alta a petición',
    fallecido: 'Fallecido',
  }
  const tipoTexto = NOMBRES_ALTA[dischargeType] ?? dischargeType

  const episodePrevio = await prisma.episode.findUnique({
    where: { id: episodeId },
    select: { patientId: true },
  })
  if (!episodePrevio) redirect('/dashboard')

  await prisma.note.create({
    data: {
      episodeId,
      content: `*** CIERRE / ALTA DE INTERCONSULTA ***\nTipo de alta: ${tipoTexto}\nConclusión y recomendaciones:\n${conclusion}`,
      status: 'firmada',
      createdBy: email,
    },
  })

  await prisma.episode.update({
    where: { id: episodeId },
    data: {
      status: 'closed',
      dischargeType,
    },
  })

  await logAudit({
    actorId: userId,
    actorRole: role,
    action: 'discharge',
    entity: 'episode',
    entityId: episodeId,
    patientId: episodePrevio.patientId,
    episodeId,
    newValue: { status: 'closed', dischargeType, tipoTexto, conclusion },
    reason: `Cierre de interconsulta: ${tipoTexto}`,
  })

  revalidatePath('/dashboard')
  redirect('/dashboard')
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
  const { userId, role, email, episode } = await exigirPermiso(episodeId, 'registrar')

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

// ─── 16. PLAN DEL DEPARTAMENTO BASE ───
export async function guardarPlanDepartamentoBase(formData: FormData): Promise<void> {
  const episodeId = String(formData.get('episodeId') ?? '')
  const { userId, role, email, episode } = await exigirPermiso(episodeId, 'registrar')

  const plan = String(formData.get('baseDepartmentPlan') ?? '').trim()

  await prisma.episode.update({
    where: { id: episodeId },
    data: { baseDepartmentPlan: plan || null },
  })

  await logAudit({
    actorId: userId,
    actorRole: role,
    action: 'update',
    entity: 'episode',
    entityId: episodeId,
    patientId: episode.patientId,
    episodeId,
    newValue: { planDepartamentoBase: plan },
    reason: 'Actualización del plan del departamento base de interconsulta',
  })

  revalidatePath(`/dashboard/paciente/${episodeId}`)
}