'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { logAudit } from '@/lib/audit'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function crearPaciente(formData: FormData) {
  const session = await auth()
  if (!session) throw new Error('No autorizado')

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

  // 1. Verificar expediente único
  const existe = await prisma.patient.findUnique({
    where: { expedienteNumber },
  })

  if (existe) {
    throw new Error('El número de expediente ya está registrado.')
  }

  // 2. Crear paciente y episodio
  const nuevoPaciente = await prisma.patient.create({
    data: {
      expedienteNumber,
      firstName,
      lastName,
      age: isNaN(age) ? null : age,
      sex,
      episodes: {
        create: {
          admissionType,
          chiefComplaint,
          room,
          bed,
          admittingDoctor: admittingDoctor || null,
          attendingDoctor: attendingDoctor || admittingDoctor || null,
          primaryDiagnosis: primaryDiagnosis || null,
          secondaryDiagnoses: secondaryDiagnoses || null,
        },
      },
    },
    include: { episodes: true },
  })

  const episodeId = nuevoPaciente.episodes[0].id

  // 3. Registrar estado inicial de alergias
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

  // 4. Auditoría
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
      nombre: `${firstName} ${lastName}`,
      diagnosticoPrincipal: primaryDiagnosis,
      maIngreso: admittingDoctor,
      formaIngreso: admissionType,
      habitacion: room,
      cama: bed,
    },
    reason: 'Apertura de nuevo expediente clínico',
  })

  revalidatePath('/dashboard')
  redirect('/dashboard')
}