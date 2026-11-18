'use server'

import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { ROLES_CLINICOS } from '@/lib/permisos'
import { obtenerContextoResidencia, verificarEscrituraResidencia } from '@/lib/tenant'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function crearPaciente(formData: FormData) {
  const ctx = await obtenerContextoResidencia()
  if (!ctx?.user || !ctx.residency) throw new Error('No autorizado')
  if (ctx.user.mustChangePassword) redirect('/dashboard/perfil?force=true')
  if (!ROLES_CLINICOS.includes(String(ctx.user.role))) {
    throw new Error('No tienes permisos clínicos para registrar pacientes.')
  }

  const checkSuscripcion = await verificarEscrituraResidencia(ctx.residency.id)
  if (!checkSuscripcion.ok) {
    throw new Error(checkSuscripcion.error)
  }

  const serviceTypeRaw = String(formData.get('serviceType') ?? 'propio').trim()
  const serviceType = serviceTypeRaw === 'interconsulta' ? 'interconsulta' : 'propio'
  const deptoRaw = String(formData.get('consultingDepartment') ?? '').trim()
  const customDepto = String(formData.get('customConsultingDepartment') ?? '').trim()
  const consultingDepartment = deptoRaw === 'OTRO' ? customDepto : deptoRaw
  const consultingResident = String(formData.get('consultingResident') ?? '').trim()

  const fechaIngresoHospitalStr = String(formData.get('hospitalAdmissionDate') ?? '').trim()
  const hospitalAdmissionDate = fechaIngresoHospitalStr
    ? new Date(`${fechaIngresoHospitalStr}T12:00:00-04:00`)
    : null
  if (hospitalAdmissionDate && Number.isNaN(hospitalAdmissionDate.getTime())) {
    throw new Error('La fecha de ingreso hospitalario no es válida.')
  }

  const admissionDateStr = String(formData.get('admissionDate') ?? '').trim()
  const admissionDate = admissionDateStr
    ? new Date(`${admissionDateStr}:00-04:00`)
    : new Date()
  if (Number.isNaN(admissionDate.getTime())) {
    throw new Error('La fecha de ingreso no es válida.')
  }

  const initialWeightStr = String(formData.get('initialWeight') ?? '').trim()
  const initialWeight = initialWeightStr ? parseFloat(initialWeightStr) : null
  const initialWeightUnit = String(formData.get('initialWeightUnit') ?? 'kg').trim() === 'lb' ? 'lb' : 'kg'

  const expedienteNumber = String(formData.get('expedienteNumber') ?? '').trim()
  const cedula = String(formData.get('cedula') ?? '').trim() || null
  const firstName = String(formData.get('firstName') ?? '').trim()
  const lastName = String(formData.get('lastName') ?? '').trim()
  const age = parseInt(String(formData.get('age') ?? '0'), 10)
  const sex = String(formData.get('sex') ?? '').trim()
  const admissionType = String(formData.get('admissionType') ?? 'Consulta').trim()
  const chiefComplaint = String(formData.get('chiefComplaint') ?? '').trim()
  const room = String(formData.get('room') ?? '').trim()
  const bed = String(formData.get('bed') ?? '').trim()
  const admittingDoctor = String(formData.get('admittingDoctor') ?? '').trim()
  const attendingDoctor = String(formData.get('attendingDoctor') ?? '').trim()
  const primaryDiagnosis = String(formData.get('primaryDiagnosis') ?? '').trim()
  const secondaryDiagnoses = String(formData.get('secondaryDiagnoses') ?? '').trim()
  const alergiasRaw = String(formData.get('alergiasEstado') ?? 'no_evaluada').trim()
  const alergiasEstado = alergiasRaw === 'sin_alergias' ? 'sin_alergias' : 'no_evaluada'

  if (!expedienteNumber || firstName.length < 2 || lastName.length < 2) {
    throw new Error('Completa el número de expediente, nombre y apellido del paciente.')
  }

  const existe = await prisma.patient.findFirst({
    where: {
      expedienteNumber,
      residencyId: ctx.residency.id,
    },
  })

  if (existe) {
    throw new Error('El número de expediente ya está registrado en esta residencia.')
  }

  const nuevoPaciente = await prisma.patient.create({
    data: {
      residencyId: ctx.residency.id,
      expedienteNumber,
      cedula,
      firstName,
      lastName,
      age: isNaN(age) ? null : age,
      sex,
      episodes: {
        create: {
          residencyId: ctx.residency.id,
          serviceType,
          consultingDepartment: consultingDepartment || null,
          consultingResident: consultingResident || null,
          hospitalAdmissionDate,
          admissionDate,
          admissionType,
          chiefComplaint,
          room,
          bed,
          admittingDoctor: admittingDoctor || null,
          attendingDoctor: attendingDoctor || consultingResident || null,
          primaryDiagnosis: primaryDiagnosis || null,
          secondaryDiagnoses: secondaryDiagnoses || null,
          initialWeight,
          initialWeightUnit,
        },
      },
    },
    include: { episodes: true },
  })

  const episodeId = nuevoPaciente.episodes[0].id

  if (initialWeight !== null && !isNaN(initialWeight)) {
    await prisma.vitalSign.create({
      data: {
        episodeId,
        weight: initialWeight,
        weightUnit: initialWeightUnit,
        recordedBy: ctx.user.email,
        createdAt: admissionDate,
      },
    })
  }

  await prisma.allergy.create({
    data: {
      patientId: nuevoPaciente.id,
      episodeId,
      allergen: alergiasEstado === 'sin_alergias' ? 'Ninguna' : 'No evaluadas',
      type: 'otro',
      severity: 'no_especificada',
      reaction: alergiasEstado === 'sin_alergias' ? 'Niega alergias' : null,
      status: alergiasEstado,
      createdBy: ctx.user.email,
    },
  })

  await logAudit({
    actorId: ctx.user.id,
    actorRole: String(ctx.user.role),
    action: 'create',
    entity: 'patient',
    entityId: nuevoPaciente.id,
    patientId: nuevoPaciente.id,
    episodeId,
    newValue: {
      expedienteNumber,
      cedula,
      tipoGuardia: serviceType,
      departamento: consultingDepartment,
      fechaIngreso: admissionDate.toISOString(),
      pesoInicial: initialWeight ? `${initialWeight} ${initialWeightUnit}` : null,
      nombre: `${firstName} ${lastName}`,
    },
    reason: `Apertura de expediente (${serviceType === 'interconsulta' ? 'Interconsulta' : 'Paciente Propio'})`,
  })

  revalidatePath('/dashboard')
  redirect('/dashboard')
}