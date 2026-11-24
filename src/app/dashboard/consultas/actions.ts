'use server'

import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { ROLES_CLINICOS, ROLES_MEDICOS } from '@/lib/permisos'
import {
  normalizarNombreCompleto,
  puedeEditarNotasConsulta,
  tieneNotasClinicasEscritas,
} from '@/lib/consultas-auth'
import { obtenerContextoResidencia, verificarEscrituraResidencia } from '@/lib/tenant'
import { revalidatePath } from 'next/cache'

const ESTADOS_VALIDOS = ['PROGRAMADA', 'EN_SALA', 'EN_CONSULTA', 'COMPLETADA', 'CANCELADA'] as const

async function exigirAccesoConsulta(consultationId?: string) {
  const ctx = await obtenerContextoResidencia()
  if (!ctx?.user) throw new Error('Sesión expirada')
  if (ctx.user.mustChangePassword) {
    throw new Error('Debes cambiar tu contraseña temporal antes de continuar.')
  }
  if (!ROLES_CLINICOS.includes(ctx.user.role)) {
    throw new Error('No tienes permisos clínicos para modificar consultas.')
  }

  if (consultationId) {
    const consulta = await prisma.consultation.findUnique({
      where: { id: consultationId },
      select: {
        id: true,
        residencyId: true,
        patientId: true,
        status: true,
        doctorId: true,
        doctorName: true,
        createdBy: true,
        updatedBy: true,
        historyIllness: true,
        physicalExam: true,
        diagnosis: true,
        treatmentPlan: true,
        labOrders: true,
        notes: true,
      },
    })
    if (!consulta) throw new Error('Consulta no encontrada')
    if (!ctx.esSuperAdmin && (!ctx.residency || consulta.residencyId !== ctx.residency.id)) {
      throw new Error('No tienes acceso a esta residencia')
    }
    const check = await verificarEscrituraResidencia(consulta.residencyId)
    if (!check.ok) throw new Error(check.error)
    return { ctx, consulta }
  }

  if (!ctx.residency) throw new Error('Residencia no asignada')
  const check = await verificarEscrituraResidencia(ctx.residency.id)
  if (!check.ok) throw new Error(check.error)
  return { ctx, consulta: null }
}

export async function crearConsulta(formData: FormData): Promise<{
  ok: boolean
  error?: string
  consultationId?: string
  matchedExistingPatient?: boolean
}> {
  try {
    const { ctx } = await exigirAccesoConsulta()
    const residencyId = ctx.residency!.id

    const patientMode = String(formData.get('patientMode') ?? 'new')
    const visitType = String(formData.get('visitType') ?? 'Primera vez').trim() || 'Primera vez'
    const chiefComplaint = String(formData.get('chiefComplaint') ?? '').trim()
    const consultationDateStr = String(formData.get('consultationDate') ?? '').trim()
    const doctorIdInput = String(formData.get('doctorId') ?? '').trim()
    const initialStatusRaw = String(formData.get('initialStatus') ?? 'EN_SALA').trim()
    const initialStatus = ESTADOS_VALIDOS.includes(initialStatusRaw as (typeof ESTADOS_VALIDOS)[number])
      ? initialStatusRaw
      : 'EN_SALA'

    if (chiefComplaint.length < 3) {
      return { ok: false, error: 'Escribe el motivo de la consulta.' }
    }

    const consultationDate = consultationDateStr
      ? new Date(`${consultationDateStr}:00-04:00`)
      : new Date()
    if (Number.isNaN(consultationDate.getTime())) {
      return { ok: false, error: 'La fecha de la consulta no es válida.' }
    }

    let doctorId: string | null = null
    let doctorName: string | null = null
    if (doctorIdInput) {
      const doc = await prisma.user.findFirst({
        where: { id: doctorIdInput, residencyId, isActive: true },
        select: { id: true, fullName: true },
      })
      if (doc) {
        doctorId = doc.id
        doctorName = doc.fullName
      }
    } else if (initialStatus === 'EN_CONSULTA' && ROLES_MEDICOS.includes(ctx.user.role)) {
      doctorId = ctx.user.id
      doctorName = ctx.user.fullName
    }

    let patientId = ''
    let matchedExistingPatient = false

    if (patientMode === 'existing') {
      const existingId = String(formData.get('patientId') ?? '').trim()
      if (!existingId) {
        return { ok: false, error: 'Selecciona un paciente registrado.' }
      }
      const existing = await prisma.patient.findFirst({
        where: { id: existingId, residencyId },
        select: { id: true },
      })
      if (!existing) {
        return { ok: false, error: 'Paciente no encontrado en esta residencia.' }
      }
      patientId = existing.id
      matchedExistingPatient = true
    } else {
      const firstName = String(formData.get('firstName') ?? '').trim()
      const lastName = String(formData.get('lastName') ?? '').trim()
      const ageRaw = String(formData.get('age') ?? '').trim()
      const age = ageRaw ? parseInt(ageRaw, 10) : null
      const sex = String(formData.get('sex') ?? 'Femenino').trim()
      const phone = String(formData.get('phone') ?? '').trim() || null
      const cedula = String(formData.get('cedula') ?? '').trim() || null
      const expInput = String(formData.get('expedienteNumber') ?? '').trim()
      const alergiasEstado = String(formData.get('alergiasEstado') ?? 'no_evaluada').trim()

      if (firstName.length < 2 || lastName.length < 2) {
        return { ok: false, error: 'Escribe el nombre y apellido del paciente.' }
      }

      const nombreNormalizado = normalizarNombreCompleto(firstName, lastName)
      const candidatos = await prisma.patient.findMany({
        where: { residencyId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          age: true,
          phone: true,
          cedula: true,
          _count: { select: { allergies: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5000,
      })

      const coincidente = candidatos.find(
        (p) => normalizarNombreCompleto(p.firstName, p.lastName) === nombreNormalizado
      )

      if (coincidente) {
        patientId = coincidente.id
        matchedExistingPatient = true

        // Enriquecer solo campos faltantes sin sobreescribir historial ni alergias previas
        const updates: Record<string, unknown> = {}
        if (coincidente.age === null && age !== null && !isNaN(age)) updates.age = age
        if (!coincidente.phone && phone) updates.phone = phone
        if (!coincidente.cedula && cedula) updates.cedula = cedula
        if (Object.keys(updates).length > 0) {
          await prisma.patient.update({
            where: { id: coincidente.id },
            data: updates,
          })
        }

        if (coincidente._count.allergies === 0) {
          await prisma.allergy.create({
            data: {
              patientId: coincidente.id,
              episodeId: null,
              allergen: alergiasEstado === 'sin_alergias' ? 'Ninguna' : 'No evaluadas',
              type: 'otro',
              severity: 'no_especificada',
              reaction: alergiasEstado === 'sin_alergias' ? 'Niega alergias' : null,
              status: alergiasEstado,
              createdBy: ctx.user.email,
            },
          })
        }
      } else {
        const expedienteNumber =
          expInput ||
          `CON-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`

        const duplicado = await prisma.patient.findFirst({
          where: { residencyId, expedienteNumber },
          select: { id: true },
        })
        if (duplicado) {
          return { ok: false, error: `Ya existe un paciente con el expediente ${expedienteNumber}.` }
        }

        const nuevoPaciente = await prisma.patient.create({
          data: {
            residencyId,
            expedienteNumber,
            firstName,
            lastName,
            age: age !== null && !isNaN(age) ? age : null,
            sex,
            phone,
            cedula,
          },
        })

        await prisma.allergy.create({
          data: {
            patientId: nuevoPaciente.id,
            episodeId: null,
            allergen: alergiasEstado === 'sin_alergias' ? 'Ninguna' : 'No evaluadas',
            type: 'otro',
            severity: 'no_especificada',
            reaction: alergiasEstado === 'sin_alergias' ? 'Niega alergias' : null,
            status: alergiasEstado,
            createdBy: ctx.user.email,
          },
        })

        patientId = nuevoPaciente.id
      }
    }

    // Copiar antropometría basal previa del mismo expediente si el paciente ya tuvo consultas
    const consultaPrevia = matchedExistingPatient
      ? await prisma.consultation.findFirst({
          where: { residencyId, patientId },
          orderBy: { consultationDate: 'desc' },
          select: { weight: true, weightUnit: true, heightCm: true },
        })
      : null

    const consulta = await prisma.consultation.create({
      data: {
        residencyId,
        patientId,
        doctorId,
        doctorName,
        consultationDate,
        status: initialStatus,
        visitType:
          matchedExistingPatient && visitType === 'Primera vez' ? 'Seguimiento' : visitType,
        chiefComplaint,
        weight: consultaPrevia?.weight ?? null,
        weightUnit: consultaPrevia?.weightUnit ?? 'kg',
        heightCm: consultaPrevia?.heightCm ?? null,
        createdBy: ctx.user.email,
      },
    })

    await logAudit({
      actorId: ctx.user.id,
      actorRole: String(ctx.user.role),
      action: 'create',
      entity: 'consultation',
      entityId: consulta.id,
      patientId,
      newValue: {
        visitType: consulta.visitType,
        chiefComplaint,
        status: initialStatus,
        doctorName,
        matchedExistingPatient,
      },
      reason: matchedExistingPatient
        ? 'Nueva consulta vinculada a expediente existente (antecedentes preservados)'
        : 'Nueva consulta registrada',
    })

    revalidatePath('/dashboard')
    return { ok: true, consultationId: consulta.id, matchedExistingPatient }
  } catch (e: unknown) {
    return { ok: false, error: (e as Error)?.message || 'No se pudo crear la consulta.' }
  }
}

export async function cambiarEstadoConsulta(
  consultationId: string,
  nuevoEstado: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    if (!ESTADOS_VALIDOS.includes(nuevoEstado as (typeof ESTADOS_VALIDOS)[number])) {
      return { ok: false, error: 'Estado de consulta no válido.' }
    }
    const { ctx, consulta } = await exigirAccesoConsulta(consultationId)
    if (!consulta) return { ok: false, error: 'Consulta no encontrada.' }

    if (
      tieneNotasClinicasEscritas(consulta) &&
      !puedeEditarNotasConsulta(consulta, ctx.user)
    ) {
      return {
        ok: false,
        error: `Solo el médico que llenó estas notas (${consulta.doctorName || consulta.updatedBy || 'autor'}) puede cambiar su estado.`,
      }
    }

    await prisma.consultation.update({
      where: { id: consultationId },
      data: {
        status: nuevoEstado,
        updatedBy: ctx.user.email,
        ...(nuevoEstado === 'EN_CONSULTA' &&
        !consulta.doctorId &&
        ROLES_MEDICOS.includes(ctx.user.role)
          ? { doctorId: ctx.user.id, doctorName: ctx.user.fullName }
          : {}),
      },
    })

    await logAudit({
      actorId: ctx.user.id,
      actorRole: String(ctx.user.role),
      action: 'update',
      entity: 'consultation',
      entityId: consultationId,
      patientId: consulta.patientId,
      oldValue: { status: consulta.status },
      newValue: { status: nuevoEstado },
      reason: `Estado de consulta actualizado a ${nuevoEstado}`,
    })

    revalidatePath('/dashboard')
    revalidatePath(`/dashboard/consultas/${consultationId}`)
    return { ok: true }
  } catch (e: unknown) {
    return { ok: false, error: (e as Error)?.message || 'Error actualizando el estado.' }
  }
}

export async function guardarConsultaClinica(formData: FormData): Promise<{
  ok: boolean
  error?: string
  finalizada?: boolean
  reabierta?: boolean
}> {
  try {
    const consultationId = String(formData.get('consultationId') ?? '')
    const { ctx, consulta } = await exigirAccesoConsulta(consultationId)
    if (!consulta) return { ok: false, error: 'Consulta no encontrada.' }

    const yaTieneNotas = tieneNotasClinicasEscritas(consulta)
    if (!puedeEditarNotasConsulta(consulta, ctx.user)) {
      const autor = consulta.doctorName || consulta.updatedBy || 'el médico autor'
      return {
        ok: false,
        error: `Solo el médico que registró estas notas (${autor}) puede modificarlas.`,
      }
    }

    const accion = String(formData.get('accion') ?? 'guardar')
    const chiefComplaint = String(formData.get('chiefComplaint') ?? '').trim()
    if (chiefComplaint.length < 2) {
      return { ok: false, error: 'El motivo de consulta es obligatorio.' }
    }

    const visitType = String(formData.get('visitType') ?? 'Primera vez').trim() || 'Primera vez'
    const bloodPressure = String(formData.get('bloodPressure') ?? '').trim() || null
    const heartRateRaw = String(formData.get('heartRate') ?? '').trim()
    const tempRaw = String(formData.get('temperature') ?? '').trim()
    const spo2Raw = String(formData.get('oxygenSat') ?? '').trim()
    const weightRaw = String(formData.get('weight') ?? '').trim()
    const weightUnit = String(formData.get('weightUnit') ?? 'kg').trim() || 'kg'
    const heightRaw = String(formData.get('heightCm') ?? '').trim()

    const heartRate = heartRateRaw ? parseInt(heartRateRaw, 10) : null
    const temperature = tempRaw ? parseFloat(tempRaw) : null
    const oxygenSat = spo2Raw ? parseInt(spo2Raw, 10) : null
    const weight = weightRaw ? parseFloat(weightRaw) : null
    const heightCm = heightRaw ? parseFloat(heightRaw) : null

    const historyIllness = String(formData.get('historyIllness') ?? '').trim() || null
    const physicalExam = String(formData.get('physicalExam') ?? '').trim() || null
    const diagnosis = String(formData.get('diagnosis') ?? '').trim() || null
    const treatmentPlan = String(formData.get('treatmentPlan') ?? '').trim() || null
    const labOrders = String(formData.get('labOrders') ?? '').trim() || null
    const notes = String(formData.get('notes') ?? '').trim() || null
    const nextAppointmentStr = String(formData.get('nextAppointment') ?? '').trim()
    const nextAppointment = nextAppointmentStr
      ? new Date(`${nextAppointmentStr}T09:00:00-04:00`)
      : null
    if (nextAppointment && Number.isNaN(nextAppointment.getTime())) {
      return { ok: false, error: 'La fecha de próxima cita no es válida.' }
    }

    if (accion === 'finalizar' && !diagnosis) {
      return { ok: false, error: 'Indica el diagnóstico o impresión clínica antes de cerrar la consulta.' }
    }

    const nuevoEstado =
      accion === 'finalizar'
        ? 'COMPLETADA'
        : accion === 'reabrir'
          ? 'EN_CONSULTA'
          : consulta.status === 'PROGRAMADA' || consulta.status === 'EN_SALA'
            ? 'EN_CONSULTA'
            : consulta.status

    const escribeNotasClinicas = Boolean(
      historyIllness ||
        physicalExam ||
        diagnosis ||
        treatmentPlan ||
        labOrders ||
        notes ||
        accion === 'finalizar'
    )

    // Si aún no había notas escritas y el usuario registra evaluación clínica (o es médico sin autor previo),
    // queda registrado como autor exclusivo de esas notas.
    const asignarAutor =
      (!yaTieneNotas && escribeNotasClinicas) ||
      (!consulta.doctorId && ROLES_MEDICOS.includes(ctx.user.role))

    await prisma.consultation.update({
      where: { id: consultationId },
      data: {
        visitType,
        chiefComplaint,
        bloodPressure,
        heartRate: heartRate !== null && !isNaN(heartRate) ? heartRate : null,
        temperature: temperature !== null && !isNaN(temperature) ? temperature : null,
        oxygenSat: oxygenSat !== null && !isNaN(oxygenSat) ? oxygenSat : null,
        weight: weight !== null && !isNaN(weight) ? weight : null,
        weightUnit,
        heightCm: heightCm !== null && !isNaN(heightCm) ? heightCm : null,
        historyIllness,
        physicalExam,
        diagnosis,
        treatmentPlan,
        labOrders,
        nextAppointment,
        notes,
        status: nuevoEstado,
        updatedBy: ctx.user.email,
        ...(asignarAutor ? { doctorId: ctx.user.id, doctorName: ctx.user.fullName } : {}),
      },
    })

    await logAudit({
      actorId: ctx.user.id,
      actorRole: String(ctx.user.role),
      action: 'update',
      entity: 'consultation',
      entityId: consultationId,
      patientId: consulta.patientId,
      newValue: {
        status: nuevoEstado,
        diagnosis,
        treatmentPlan,
        bloodPressure,
        weight,
      },
      reason:
        accion === 'finalizar'
          ? 'Consulta médica finalizada y cerrada'
          : accion === 'reabrir'
            ? 'Consulta reabierta por su médico autor'
            : 'Nota clínica de consulta guardada',
    })

    revalidatePath('/dashboard')
    revalidatePath(`/dashboard/consultas/${consultationId}`)
    return {
      ok: true,
      finalizada: accion === 'finalizar',
      reabierta: accion === 'reabrir',
    }
  } catch (e: unknown) {
    return { ok: false, error: (e as Error)?.message || 'No se pudo guardar la consulta.' }
  }
}

export async function guardarDatosPacienteConsulta(formData: FormData): Promise<void> {
  const consultationId = String(formData.get('consultationId') ?? '')
  const { ctx, consulta } = await exigirAccesoConsulta(consultationId)
  if (!consulta) return

  const firstName = String(formData.get('firstName') ?? '').trim()
  const lastName = String(formData.get('lastName') ?? '').trim()
  const ageRaw = String(formData.get('age') ?? '').trim()
  const age = ageRaw ? parseInt(ageRaw, 10) : null
  const sex = String(formData.get('sex') ?? 'Femenino').trim()
  const phone = String(formData.get('phone') ?? '').trim() || null
  const cedula = String(formData.get('cedula') ?? '').trim() || null
  const bloodType = String(formData.get('bloodType') ?? '').trim().toUpperCase() || null

  if (firstName.length < 2 || lastName.length < 2) return

  await prisma.patient.update({
    where: { id: consulta.patientId },
    data: {
      firstName,
      lastName,
      age: age !== null && !isNaN(age) ? age : null,
      sex,
      phone,
      cedula,
      ...(bloodType
        ? {
            bloodType,
            bloodTypeRecordedBy: ctx.user.email,
            bloodTypeUpdatedAt: new Date(),
          }
        : {}),
    },
  })

  await logAudit({
    actorId: ctx.user.id,
    actorRole: String(ctx.user.role),
    action: 'update',
    entity: 'patient',
    entityId: consulta.patientId,
    patientId: consulta.patientId,
    newValue: { firstName, lastName, age, sex, phone, cedula, bloodType },
    reason: 'Datos del paciente actualizados desde Consulta Externa',
  })

  revalidatePath(`/dashboard/consultas/${consultationId}`)
  revalidatePath('/dashboard')
}

export async function guardarAntecedentesConsulta(formData: FormData): Promise<void> {
  const consultationId = String(formData.get('consultationId') ?? '')
  const { ctx, consulta } = await exigirAccesoConsulta(consultationId)
  if (!consulta) return

  const pathological = String(formData.get('pathological') ?? '').trim() || null
  const surgical = String(formData.get('surgical') ?? '').trim() || null
  const family = String(formData.get('family') ?? '').trim() || null
  const habits = String(formData.get('habits') ?? '').trim() || null
  const medications = String(formData.get('medications') ?? '').trim() || null

  await prisma.medicalHistory.upsert({
    where: { patientId: consulta.patientId },
    update: { pathological, surgical, family, habits, medications, updatedBy: ctx.user.email },
    create: {
      patientId: consulta.patientId,
      pathological,
      surgical,
      family,
      habits,
      medications,
      updatedBy: ctx.user.email,
    },
  })

  await logAudit({
    actorId: ctx.user.id,
    actorRole: String(ctx.user.role),
    action: 'update',
    entity: 'medical_history',
    patientId: consulta.patientId,
    newValue: { pathological, surgical, family, habits, medications },
    reason: 'Antecedentes actualizados desde Consulta Externa',
  })

  revalidatePath(`/dashboard/consultas/${consultationId}`)
}

export async function agregarAlergiaConsulta(formData: FormData): Promise<void> {
  const consultationId = String(formData.get('consultationId') ?? '')
  const { ctx, consulta } = await exigirAccesoConsulta(consultationId)
  if (!consulta) return

  const allergen = String(formData.get('allergen') ?? '').trim()
  const reaction = String(formData.get('reaction') ?? '').trim() || null
  if (!allergen) return

  await prisma.$transaction([
    prisma.allergy.deleteMany({
      where: { patientId: consulta.patientId, status: { in: ['sin_alergias', 'no_evaluada'] } },
    }),
    prisma.allergy.create({
      data: {
        patientId: consulta.patientId,
        episodeId: null,
        allergen,
        type: 'otro',
        severity: 'no_especificada',
        reaction,
        status: 'evaluada',
        createdBy: ctx.user.email,
      },
    }),
  ])

  await logAudit({
    actorId: ctx.user.id,
    actorRole: String(ctx.user.role),
    action: 'create',
    entity: 'allergy',
    patientId: consulta.patientId,
    newValue: { allergen, reaction },
    reason: 'Alergia registrada desde Consulta Externa',
  })

  revalidatePath(`/dashboard/consultas/${consultationId}`)
  revalidatePath('/dashboard')
}

export async function marcarSinAlergiasConsulta(formData: FormData): Promise<void> {
  const consultationId = String(formData.get('consultationId') ?? '')
  const { ctx, consulta } = await exigirAccesoConsulta(consultationId)
  if (!consulta) return

  await prisma.$transaction([
    prisma.allergy.deleteMany({
      where: { patientId: consulta.patientId },
    }),
    prisma.allergy.create({
      data: {
        patientId: consulta.patientId,
        episodeId: null,
        allergen: 'Ninguna',
        type: 'otro',
        severity: 'no_especificada',
        reaction: 'Niega alergias',
        status: 'sin_alergias',
        createdBy: ctx.user.email,
      },
    }),
  ])

  await logAudit({
    actorId: ctx.user.id,
    actorRole: String(ctx.user.role),
    action: 'create',
    entity: 'allergy',
    patientId: consulta.patientId,
    newValue: { status: 'sin_alergias' },
    reason: 'Paciente niega alergias (Consulta Externa)',
  })

  revalidatePath(`/dashboard/consultas/${consultationId}`)
  revalidatePath('/dashboard')
}

export async function iniciarNuevaAtencionConsulta(consultationId: string): Promise<{
  ok: boolean
  error?: string
  consultationId?: string
}> {
  try {
    const { ctx, consulta } = await exigirAccesoConsulta(consultationId)
    if (!consulta) return { ok: false, error: 'Consulta no encontrada.' }

    const ultimaPrevia = await prisma.consultation.findFirst({
      where: { residencyId: consulta.residencyId, patientId: consulta.patientId },
      orderBy: { consultationDate: 'desc' },
      select: { weight: true, weightUnit: true, heightCm: true },
    })

    const esMedico = ROLES_MEDICOS.includes(ctx.user.role)
    const nueva = await prisma.consultation.create({
      data: {
        residencyId: consulta.residencyId,
        patientId: consulta.patientId,
        doctorId: esMedico ? ctx.user.id : null,
        doctorName: esMedico ? ctx.user.fullName : null,
        consultationDate: new Date(),
        status: 'EN_CONSULTA',
        visitType: 'Seguimiento',
        chiefComplaint: 'Control de seguimiento',
        weight: ultimaPrevia?.weight ?? null,
        weightUnit: ultimaPrevia?.weightUnit ?? 'kg',
        heightCm: ultimaPrevia?.heightCm ?? null,
        createdBy: ctx.user.email,
      },
    })

    await logAudit({
      actorId: ctx.user.id,
      actorRole: String(ctx.user.role),
      action: 'create',
      entity: 'consultation',
      entityId: nueva.id,
      patientId: consulta.patientId,
      newValue: {
        originConsultationId: consultationId,
        visitType: 'Seguimiento',
        status: 'EN_CONSULTA',
      },
      reason: 'Nueva atención generada al reabrir expediente vinculado (acápites anteriores preservados)',
    })

    revalidatePath('/dashboard')
    revalidatePath(`/dashboard/consultas/${consultationId}`)
    return { ok: true, consultationId: nueva.id }
  } catch (e: unknown) {
    return { ok: false, error: (e as Error)?.message || 'No se pudo iniciar una nueva atención.' }
  }
}

export async function agregarBloqueAntecedentesConsulta(formData: FormData): Promise<{
  ok: boolean
  error?: string
}> {
  try {
    const consultationId = String(formData.get('consultationId') ?? '')
    const { ctx, consulta } = await exigirAccesoConsulta(consultationId)
    if (!consulta) return { ok: false, error: 'Consulta no encontrada.' }

    const pathological = String(formData.get('pathological') ?? '').trim() || null
    const surgical = String(formData.get('surgical') ?? '').trim() || null
    const family = String(formData.get('family') ?? '').trim() || null
    const habits = String(formData.get('habits') ?? '').trim() || null
    const medications = String(formData.get('medications') ?? '').trim() || null

    if (!pathological && !surgical && !family && !habits && !medications) {
      return { ok: false, error: 'Escribe al menos un antecedente antes de guardar el nuevo bloque.' }
    }

    const previo = await prisma.medicalHistory.findUnique({
      where: { patientId: consulta.patientId },
    })

    const fechaLabel = new Date().toLocaleDateString('es-DO', {
      timeZone: 'America/Santo_Domingo',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
    const prefijo = `[${fechaLabel} · ${ctx.user.fullName}]`

    const combinar = (anterior?: string | null, nuevo?: string | null): string | null => {
      if (!nuevo) return anterior ?? null
      const lineaNueva = `${prefijo} ${nuevo}`
      if (!anterior?.trim()) return lineaNueva
      return `${anterior.trim()}\n${lineaNueva}`
    }

    await prisma.medicalHistory.upsert({
      where: { patientId: consulta.patientId },
      update: {
        pathological: combinar(previo?.pathological, pathological),
        surgical: combinar(previo?.surgical, surgical),
        family: combinar(previo?.family, family),
        habits: combinar(previo?.habits, habits),
        medications: combinar(previo?.medications, medications),
        updatedBy: ctx.user.email,
      },
      create: {
        patientId: consulta.patientId,
        pathological: combinar(null, pathological),
        surgical: combinar(null, surgical),
        family: combinar(null, family),
        habits: combinar(null, habits),
        medications: combinar(null, medications),
        updatedBy: ctx.user.email,
      },
    })

    await logAudit({
      actorId: ctx.user.id,
      actorRole: String(ctx.user.role),
      action: 'create',
      entity: 'consulta_antecedente',
      entityId: consultationId,
      patientId: consulta.patientId,
      newValue: {
        authorId: ctx.user.id,
        authorName: ctx.user.fullName,
        authorEmail: ctx.user.email,
        pathological,
        surgical,
        family,
        habits,
        medications,
      },
      reason: 'Nuevo bloque de antecedentes agregado sin modificar registros previos',
    })

    revalidatePath(`/dashboard/consultas/${consultationId}`)
    return { ok: true }
  } catch (e: unknown) {
    return { ok: false, error: (e as Error)?.message || 'No se pudieron guardar los antecedentes.' }
  }
}

const SECCIONES_BLOQUE_VALIDAS = [
  'signos',
  'motivo',
  'enfermedad',
  'examen',
  'diagnostico',
  'receta',
  'laboratorio',
  'notas',
] as const

export async function agregarBloqueSeccionConsulta(formData: FormData): Promise<{
  ok: boolean
  error?: string
}> {
  try {
    const consultationId = String(formData.get('consultationId') ?? '')
    const { ctx, consulta } = await exigirAccesoConsulta(consultationId)
    if (!consulta) return { ok: false, error: 'Consulta no encontrada.' }

    const seccion = String(formData.get('seccion') ?? '').trim()
    if (!SECCIONES_BLOQUE_VALIDAS.includes(seccion as (typeof SECCIONES_BLOQUE_VALIDAS)[number])) {
      return { ok: false, error: 'Sección clínica no válida.' }
    }

    let payload: Record<string, unknown> = {
      seccion,
      consultationId,
      authorId: ctx.user.id,
      authorName: ctx.user.fullName,
      authorEmail: ctx.user.email,
    }

    if (seccion === 'signos') {
      const bloodPressure = String(formData.get('bloodPressure') ?? '').trim() || null
      const heartRateRaw = String(formData.get('heartRate') ?? '').trim()
      const tempRaw = String(formData.get('temperature') ?? '').trim()
      const spo2Raw = String(formData.get('oxygenSat') ?? '').trim()
      const weightRaw = String(formData.get('weight') ?? '').trim()
      const weightUnit = String(formData.get('weightUnit') ?? 'kg').trim() || 'kg'
      const heightRaw = String(formData.get('heightCm') ?? '').trim()

      const heartRate = heartRateRaw ? parseInt(heartRateRaw, 10) : null
      const temperature = tempRaw ? parseFloat(tempRaw) : null
      const oxygenSat = spo2Raw ? parseInt(spo2Raw, 10) : null
      const weight = weightRaw ? parseFloat(weightRaw) : null
      const heightCm = heightRaw ? parseFloat(heightRaw) : null

      if (
        !bloodPressure &&
        (heartRate === null || isNaN(heartRate)) &&
        (temperature === null || isNaN(temperature)) &&
        (oxygenSat === null || isNaN(oxygenSat)) &&
        (weight === null || isNaN(weight)) &&
        (heightCm === null || isNaN(heightCm))
      ) {
        return { ok: false, error: 'Ingresa al menos un signo vital o medida para guardar este bloque.' }
      }

      payload = {
        ...payload,
        bloodPressure,
        heartRate: heartRate !== null && !isNaN(heartRate) ? heartRate : null,
        temperature: temperature !== null && !isNaN(temperature) ? temperature : null,
        oxygenSat: oxygenSat !== null && !isNaN(oxygenSat) ? oxygenSat : null,
        weight: weight !== null && !isNaN(weight) ? weight : null,
        weightUnit,
        heightCm: heightCm !== null && !isNaN(heightCm) ? heightCm : null,
      }
    } else if (seccion === 'motivo') {
      const visitType = String(formData.get('visitType') ?? 'Seguimiento').trim() || 'Seguimiento'
      const chiefComplaint = String(formData.get('chiefComplaint') ?? '').trim()
      if (chiefComplaint.length < 2) {
        return { ok: false, error: 'Escribe el nuevo motivo de consulta.' }
      }
      payload = { ...payload, visitType, chiefComplaint }
    } else {
      const contenido = String(formData.get('contenido') ?? '').trim()
      if (contenido.length < 2) {
        return { ok: false, error: 'Escribe la información clínica del nuevo bloque antes de guardar.' }
      }
      payload = { ...payload, contenido }
    }

    await logAudit({
      actorId: ctx.user.id,
      actorRole: String(ctx.user.role),
      action: 'create',
      entity: 'consulta_bloque',
      entityId: consultationId,
      patientId: consulta.patientId,
      newValue: payload,
      reason: `Nuevo bloque agregado en acápite "${seccion}" sin sobrescribir registros anteriores`,
    })

    revalidatePath(`/dashboard/consultas/${consultationId}`)
    revalidatePath('/dashboard')
    return { ok: true }
  } catch (e: unknown) {
    return { ok: false, error: (e as Error)?.message || 'No se pudo guardar el nuevo bloque.' }
  }
}
