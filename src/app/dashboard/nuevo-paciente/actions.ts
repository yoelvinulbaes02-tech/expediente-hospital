'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { logAudit } from '@/lib/audit'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function crearPaciente(formData: FormData) {
  const session = await auth()
  if (!session) throw new Error('No autorizado')

  const expedienteNumber = formData.get('expedienteNumber') as string
  const firstName = formData.get('firstName') as string
  const lastName = formData.get('lastName') as string
  const age = parseInt(formData.get('age') as string)
  const sex = formData.get('sex') as string
  const admissionType = formData.get('admissionType') as string
  const chiefComplaint = formData.get('chiefComplaint') as string
  const room = formData.get('room') as string
  const bed = formData.get('bed') as string
  const attendingDoctor = formData.get('attendingDoctor') as string
  const alergiasEstado = formData.get('alergiasEstado') as string

  // 1. Verificar que el expediente no exista ya
  const existe = await prisma.patient.findUnique({
    where: { expedienteNumber }
  })

  if (existe) {
    throw new Error('El número de expediente ya está registrado.')
  }

  // 2. Crear al paciente y su episodio en la base de datos
  const nuevoPaciente = await prisma.patient.create({
    data: {
      expedienteNumber,
      firstName,
      lastName,
      age,
      sex,
      episodes: {
        create: {
          admissionType,
          chiefComplaint,
          room,
          bed,
          attendingDoctor,
        }
      }
    },
    include: { episodes: true }
  })

  const episodeId = nuevoPaciente.episodes[0].id

  // 3. Registrar el estado de las alergias
  await prisma.allergy.create({
    data: {
      patientId: nuevoPaciente.id,
      episodeId,
      allergen: 'Ninguna',
      type: 'otro',
      severity: 'leve',
      status: alergiasEstado, // 'no_evaluada' o 'sin_alergias'
      createdBy: session.user?.email || 'desconocido'
    }
  })

  // 4. Guardar en la auditoría inmutable
  await logAudit({
    actorId: session.user?.id as string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    actorRole: (session.user as any)?.role,
    action: 'create',
    entity: 'patient',
    entityId: nuevoPaciente.id,
    patientId: nuevoPaciente.id,
    newValue: { expedienteNumber, firstName, lastName, age, sex },
  })

  // 5. Redirigir al dashboard
  revalidatePath('/dashboard')
  redirect('/dashboard')
}