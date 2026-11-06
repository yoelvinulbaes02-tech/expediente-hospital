'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { logAudit } from '@/lib/audit'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function crearPaciente(formData: FormData) {
  const session = await auth()
  if (!session) throw new Error('No autorizado')

  const serviceType = String(formData.get('serviceType') ?? 'propio').trim()
  const consultingDepartment = String(formData.get('consultingDepartment') ?? '').trim()
  const consultingResident = String(formData.get('consultingResident') ?? '').trim()

  const expedienteNumber = String(formData.get('expedienteNumber') ?? '').trim()
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
  const alergiasEstado = String(formData.get('alergiasEstado') ?? 'no_evaluada').trim()

  const existe = await prisma.patient.findUnique({
    where: { expedienteNumber },
  })

  if (existe) {
    throw new Error('El número de expediente ya está registrado.')
  }

  const nuevoPaciente = await prisma.patient.create({
    data: {
      expedienteNumber,
      firstName,
      lastName,
      age: isNaN(age) ? null : age,
      sex,
      episodes: {
        create: {
          serviceType,
          consultingDepartment: consultingDepartment || null,
          consultingResident: consultingResident || null,
          admissionType,
          chiefComplaint,
          room,
          bed,
          admittingDoctor: admittingDoctor || null,
          attendingDoctor: attendingDoctor || consultingResident || null,
          primaryDiagnosis: primaryDiagnosis || null,
          secondaryDiagnoses: secondaryDiagnoses || null,
        },
      },
    },
    include: { episodes: true },
  })

  const episodeId = nuevoPaciente.episodes[0].id

  await prisma.allergy.create({
    data: {
      patientId: nuevoPaciente.id,
      episodeId,
      allergen: alergiasEstado === 'sin_alergias' ? 'Ninguna' : 'No evaluadas',
      type: 'otro',
      severity: 'no_especificada',
      reaction: alergiasEstado === 'sin_alergias' ? 'Niega alergias' : null,
      status: alergiasEstado,
      createdBy: session.user?.email || 'desconocido',
    },
  })

  await logAudit({
    actorId: session.user?.id as string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    actorRole: (session.user as any)?.role,
    action: 'create',
    entity: 'patient',
    entityId: nuevoPaciente.id,
    patientId: nuevoPaciente.id,
    episodeId,
    newValue: {
      expedienteNumber,
      tipoGuardia: serviceType,
      departamento: consultingDepartment,
      residente: consultingResident,
      nombre: `${firstName} ${lastName}`,
      diagnosticoPrincipal: primaryDiagnosis,
    },
    reason: `Apertura de expediente (${serviceType === 'interconsulta' ? 'Interconsulta' : 'Paciente Propio'})`,
  })

  revalidatePath('/dashboard')
  redirect('/dashboard')
}