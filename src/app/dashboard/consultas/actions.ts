'use server'

import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { ROLES_CLINICOS, ROLES_MEDICOS } from '@/lib/permisos'
import {
  AGUJA_BIOPSIA,
  ARS_BIOPSIA,
  KIT_BIOPSIA,
  TIPOS_CONSULTA_EXTERNA,
  normalizarNombreCompleto,
  puedeEditarNotasConsulta,
  type SeccionConsultaKey,
} from '@/lib/consultas-auth'
import { persistirConsultaClinica } from '@/lib/consultas-persist'
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
        consultationType: true,
        chiefComplaint: true,
        bloodPressure: true,
        heartRate: true,
        temperature: true,
        oxygenSat: true,
        weight: true,
        weightUnit: true,
        heightCm: true,
        historyIllness: true,
        physicalExam: true,
        diagnosis: true,
        treatmentPlan: true,
        labOrders: true,
        notes: true,
        doctorId: true,
        doctorName: true,
        consultationDate: true,
        createdBy: true,
        updatedBy: true,
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
    const consultationTypeRaw = String(formData.get('consultationType') ?? 'Consulta general').trim()
    const consultationType = TIPOS_CONSULTA_EXTERNA.includes(
      consultationTypeRaw as (typeof TIPOS_CONSULTA_EXTERNA)[number]
    )
      ? consultationTypeRaw
      : 'Consulta general'
    const chiefComplaintInput = String(formData.get('chiefComplaint') ?? '').trim()
    const consultationDateStr = String(formData.get('consultationDate') ?? '').trim()
    const doctorIdInput = String(formData.get('doctorId') ?? '').trim()
    const sourceConsultationId = String(formData.get('sourceConsultationId') ?? '').trim()
    const initialStatusRaw = String(formData.get('initialStatus') ?? 'EN_SALA').trim()
    const initialStatus = ESTADOS_VALIDOS.includes(initialStatusRaw as (typeof ESTADOS_VALIDOS)[number])
      ? initialStatusRaw
      : 'EN_SALA'

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
    } else if (
      initialStatus === 'EN_CONSULTA' &&
      (ROLES_MEDICOS.includes(ctx.user.role) || ctx.user.role === 'ADMIN')
    ) {
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

    // Si se eligió usar una consulta previa como base, traer únicamente datos antropométricos
    // (los datos del paciente y antecedentes se heredan al vincular al mismo patientId)
    const plantilla = sourceConsultationId
      ? await prisma.consultation.findFirst({
          where: {
            id: sourceConsultationId,
            residencyId,
            patientId,
          },
          select: {
            id: true,
            weight: true,
            weightUnit: true,
            heightCm: true,
          },
        })
      : null

    const chiefComplaint = chiefComplaintInput || (plantilla ? 'Control de seguimiento' : '')
    if (chiefComplaint.length < 2) {
      return { ok: false, error: 'Escribe el motivo de la consulta.' }
    }

    // Copiar antropometría basal previa si no hay plantilla explícita
    const consultaPrevia =
      !plantilla && matchedExistingPatient
        ? await prisma.consultation.findFirst({
            where: { residencyId, patientId },
            orderBy: { consultationDate: 'desc' },
            select: { weight: true, weightUnit: true, heightCm: true },
          })
        : null

    const pesoBase = plantilla?.weight ?? consultaPrevia?.weight ?? null
    const unidadPesoBase = plantilla?.weightUnit ?? consultaPrevia?.weightUnit ?? 'kg'
    const tallaBase = plantilla?.heightCm ?? consultaPrevia?.heightCm ?? null

    const seccionesIniciales: SeccionConsultaKey[] = ['motivo']
    if (pesoBase !== null || tallaBase !== null) {
      seccionesIniciales.push('antropometria')
    }

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
        consultationType,
        chiefComplaint,
        bloodPressure: null,
        heartRate: null,
        temperature: null,
        oxygenSat: null,
        weight: pesoBase,
        weightUnit: unidadPesoBase,
        heightCm: tallaBase,
        historyIllness: null,
        physicalExam: null,
        diagnosis: null,
        treatmentPlan: null,
        labOrders: null,
        notes: null,
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
        consultationType,
        chiefComplaint,
        status: initialStatus,
        doctorName,
        matchedExistingPatient,
        copiedFromConsultationId: plantilla?.id ?? null,
        changedSections: seccionesIniciales,
        authorName: ctx.user.fullName,
        authorRole: String(ctx.user.role),
      },
      reason: plantilla
        ? `Nueva consulta creada copiando datos del paciente, antecedentes y antropometría (${plantilla.id})`
        : matchedExistingPatient
          ? 'Nueva consulta vinculada a expediente existente (datos, antecedentes y antropometría preservados)'
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

    if (consulta.status === 'COMPLETADA' || consulta.status === 'CANCELADA') {
      return {
        ok: false,
        error: 'Este expediente ya está cerrado y no puede cambiarse de estado.',
      }
    }

    if (!puedeEditarNotasConsulta(consulta, ctx.user)) {
      return {
        ok: false,
        error: `Solo el médico autor (${consulta.doctorName || consulta.updatedBy || 'autor'}) puede cambiar el estado de esta consulta.`,
      }
    }

    await prisma.consultation.update({
      where: { id: consultationId },
      data: {
        status: nuevoEstado,
        updatedBy: ctx.user.email,
        ...(nuevoEstado === 'EN_CONSULTA' &&
        !consulta.doctorId &&
        (ROLES_MEDICOS.includes(ctx.user.role) || ctx.user.role === 'ADMIN')
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
      newValue: {
        status: nuevoEstado,
        changedSections: [],
        authorName: ctx.user.fullName,
        authorRole: String(ctx.user.role),
      },
      reason: `Estado de consulta actualizado a ${nuevoEstado}`,
    })

    revalidatePath('/dashboard')
    revalidatePath(`/dashboard/consultas/${consultationId}`)
    return { ok: true }
  } catch (e: unknown) {
    return { ok: false, error: (e as Error)?.message || 'Error actualizando el estado.' }
  }
}

export async function cambiarTipoConsulta(
  consultationId: string,
  nuevoTipo: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const tipoLimpio = String(nuevoTipo ?? '').trim()
    if (
      !TIPOS_CONSULTA_EXTERNA.includes(
        tipoLimpio as (typeof TIPOS_CONSULTA_EXTERNA)[number]
      )
    ) {
      return { ok: false, error: 'Tipo de consulta no válido.' }
    }

    const { ctx, consulta } = await exigirAccesoConsulta(consultationId)
    if (!consulta) return { ok: false, error: 'Consulta no encontrada.' }
    if (!ctx.esSuperAdmin && ctx.interfaceMode !== 'CONSULTAS') {
      return { ok: false, error: 'Esta acción solo está disponible en Consulta Externa.' }
    }
    if (consulta.status === 'CANCELADA') {
      return { ok: false, error: 'No se puede cambiar el estatus de una consulta cancelada.' }
    }

    const tipoAnterior = consulta.consultationType || 'Consulta general'
    if (tipoAnterior === tipoLimpio) {
      return { ok: true }
    }

    await prisma.consultation.update({
      where: { id: consultationId },
      data: {
        consultationType: tipoLimpio,
        updatedBy: ctx.user.email,
      },
    })

    await logAudit({
      actorId: ctx.user.id,
      actorRole: String(ctx.user.role),
      action: 'update',
      entity: 'consultation',
      entityId: consultationId,
      patientId: consulta.patientId,
      oldValue: { consultationType: tipoAnterior },
      newValue: {
        consultationType: tipoLimpio,
        changedSections: ['motivo'],
        authorName: ctx.user.fullName,
        authorRole: String(ctx.user.role),
      },
      reason: `Tipo de consulta / estatus actualizado: ${tipoAnterior} → ${tipoLimpio}`,
    })

    revalidatePath('/dashboard')
    revalidatePath(`/dashboard/consultas/${consultationId}`)
    return { ok: true }
  } catch (e: unknown) {
    return { ok: false, error: (e as Error)?.message || 'No se pudo cambiar el tipo de consulta.' }
  }
}

export async function guardarConsultaClinica(formData: FormData): Promise<{
  ok: boolean
  error?: string
  finalizada?: boolean
  reabierta?: boolean
  savedAtIso?: string
  changedSections?: SeccionConsultaKey[]
  authorName?: string
  authorRole?: string
}> {
  try {
    const accionRaw = String(formData.get('accion') ?? 'guardar')
    const accion =
      accionRaw === 'finalizar' || accionRaw === 'reabrir' ? accionRaw : 'guardar'

    const labsJsonRaw = String(formData.get('labsJson') ?? '').trim()
    const imagingJsonRaw = String(formData.get('imagingJson') ?? '').trim()
    let labs: Record<string, string> | undefined
    let imaging: Record<string, string> | undefined
    if (labsJsonRaw) {
      try {
        const parsed = JSON.parse(labsJsonRaw)
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          labs = parsed as Record<string, string>
        }
      } catch {
        // Ignorar JSON inválido
      }
    }
    if (imagingJsonRaw) {
      try {
        const parsed = JSON.parse(imagingJsonRaw)
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          imaging = parsed as Record<string, string>
        }
      } catch {
        // Ignorar JSON inválido
      }
    }

    return await persistirConsultaClinica({
      consultationId: String(formData.get('consultationId') ?? ''),
      accion,
      visitType: String(formData.get('visitType') ?? 'Primera vez'),
      consultationType: String(formData.get('consultationType') ?? 'Consulta general'),
      chiefComplaint: String(formData.get('chiefComplaint') ?? ''),
      bloodPressure: String(formData.get('bloodPressure') ?? ''),
      heartRate: String(formData.get('heartRate') ?? ''),
      temperature: String(formData.get('temperature') ?? ''),
      oxygenSat: String(formData.get('oxygenSat') ?? ''),
      weight: String(formData.get('weight') ?? ''),
      weightUnit: String(formData.get('weightUnit') ?? 'kg'),
      heightCm: String(formData.get('heightCm') ?? ''),
      historyIllness: String(formData.get('historyIllness') ?? ''),
      physicalExam: String(formData.get('physicalExam') ?? ''),
      diagnosis: String(formData.get('diagnosis') ?? ''),
      treatmentPlan: String(formData.get('treatmentPlan') ?? ''),
      ...(labs ? { labs } : {}),
      ...(imaging ? { imaging } : {}),
      notes: String(formData.get('notes') ?? ''),
      nextAppointment: String(formData.get('nextAppointment') ?? ''),
    })
  } catch (e: unknown) {
    return { ok: false, error: (e as Error)?.message || 'No se pudo guardar la consulta.' }
  }
}

export async function guardarDatosPacienteConsulta(formData: FormData): Promise<{
  ok: boolean
  error?: string
}> {
  try {
    const consultationId = String(formData.get('consultationId') ?? '')
    const { ctx, consulta } = await exigirAccesoConsulta(consultationId)
    if (!consulta) return { ok: false, error: 'Consulta no encontrada.' }

    const firstName = String(formData.get('firstName') ?? '').trim()
    const lastName = String(formData.get('lastName') ?? '').trim()
    const expedienteNumber = String(formData.get('expedienteNumber') ?? '').trim()
    const ageRaw = String(formData.get('age') ?? '').trim()
    const age = ageRaw ? parseInt(ageRaw, 10) : null
    const sex = String(formData.get('sex') ?? 'Femenino').trim() || 'Femenino'
    const phone = String(formData.get('phone') ?? '').trim() || null
    const cedula = String(formData.get('cedula') ?? '').trim() || null
    const bloodTypeRaw = String(formData.get('bloodType') ?? '').trim().toUpperCase()
    const bloodType = bloodTypeRaw || null
    const consultationDateStr = String(formData.get('consultationDate') ?? '').trim()

    if (firstName.length < 2 || lastName.length < 2) {
      return { ok: false, error: 'El nombre y apellido deben tener al menos 2 caracteres.' }
    }

    if (expedienteNumber.length < 1) {
      return { ok: false, error: 'El número de expediente es obligatorio.' }
    }

    const pacienteActual = await prisma.patient.findUnique({
      where: { id: consulta.patientId },
      select: {
        firstName: true,
        lastName: true,
        expedienteNumber: true,
        age: true,
        sex: true,
        phone: true,
        cedula: true,
        bloodType: true,
      },
    })

    if (pacienteActual && expedienteNumber !== pacienteActual.expedienteNumber) {
      const duplicado = await prisma.patient.findFirst({
        where: {
          residencyId: consulta.residencyId,
          expedienteNumber,
          id: { not: consulta.patientId },
        },
        select: { id: true },
      })
      if (duplicado) {
        return { ok: false, error: `Ya existe otro paciente con el expediente ${expedienteNumber}.` }
      }
    }

    let nuevaFechaConsulta: Date | null = null
    if (consultationDateStr) {
      const parsed = new Date(`${consultationDateStr}:00-04:00`)
      if (Number.isNaN(parsed.getTime())) {
        return { ok: false, error: 'La fecha y hora de registro no es válida.' }
      }
      nuevaFechaConsulta = parsed
    }

    await prisma.patient.update({
      where: { id: consulta.patientId },
      data: {
        firstName,
        lastName,
        expedienteNumber,
        age: age !== null && !isNaN(age) ? age : null,
        sex,
        phone,
        cedula,
        bloodType,
        ...(bloodType !== (pacienteActual?.bloodType ?? null)
          ? {
              bloodTypeRecordedBy: bloodType ? ctx.user.email : null,
              bloodTypeUpdatedAt: new Date(),
            }
          : {}),
      },
    })

    const puedeEditarFechaConsulta =
      nuevaFechaConsulta &&
      consulta.status !== 'COMPLETADA' &&
      consulta.status !== 'CANCELADA' &&
      puedeEditarNotasConsulta(consulta, ctx.user)

    if (puedeEditarFechaConsulta && nuevaFechaConsulta) {
      await prisma.consultation.update({
        where: { id: consultationId },
        data: {
          consultationDate: nuevaFechaConsulta,
          updatedBy: ctx.user.email,
        },
      })
    }

    await logAudit({
      actorId: ctx.user.id,
      actorRole: String(ctx.user.role),
      action: 'update',
      entity: 'patient',
      entityId: consulta.patientId,
      patientId: consulta.patientId,
      oldValue: pacienteActual
        ? {
            firstName: pacienteActual.firstName,
            lastName: pacienteActual.lastName,
            expedienteNumber: pacienteActual.expedienteNumber,
            age: pacienteActual.age,
            sex: pacienteActual.sex,
            phone: pacienteActual.phone,
            cedula: pacienteActual.cedula,
            bloodType: pacienteActual.bloodType,
            consultationDate: consulta.consultationDate.toISOString(),
          }
        : null,
      newValue: {
        firstName,
        lastName,
        expedienteNumber,
        age,
        sex,
        phone,
        cedula,
        bloodType,
        ...(puedeEditarFechaConsulta && nuevaFechaConsulta
          ? { consultationDate: nuevaFechaConsulta.toISOString() }
          : {}),
        authorName: ctx.user.fullName,
        authorRole: String(ctx.user.role),
      },
      reason: 'Datos del paciente y registro actualizados desde Consulta Externa',
    })

    revalidatePath(`/dashboard/consultas/${consultationId}`)
    revalidatePath('/dashboard')
    return { ok: true }
  } catch (e: unknown) {
    return {
      ok: false,
      error: (e as Error)?.message || 'No se pudieron guardar los datos del paciente.',
    }
  }
}

export async function guardarAntecedentesConsulta(formData: FormData): Promise<{
  ok: boolean
  error?: string
  authorName?: string
  authorRole?: string
  updatedAtIso?: string
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

    const previo = await prisma.medicalHistory.findUnique({
      where: { patientId: consulta.patientId },
    })

    const saved = await prisma.medicalHistory.upsert({
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
      entityId: saved.id,
      patientId: consulta.patientId,
      oldValue: previo
        ? {
            pathological: previo.pathological,
            surgical: previo.surgical,
            family: previo.family,
            habits: previo.habits,
            medications: previo.medications,
          }
        : null,
      newValue: {
        pathological,
        surgical,
        family,
        habits,
        medications,
        authorName: ctx.user.fullName,
        authorRole: String(ctx.user.role),
      },
      reason: 'Antecedentes médicos actualizados desde Consulta Externa',
    })

    revalidatePath(`/dashboard/consultas/${consultationId}`)
    return {
      ok: true,
      authorName: ctx.user.fullName,
      authorRole: String(ctx.user.role),
      updatedAtIso: saved.updatedAt.toISOString(),
    }
  } catch (e: unknown) {
    return {
      ok: false,
      error: (e as Error)?.message || 'No se pudieron guardar los antecedentes.',
    }
  }
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

export async function iniciarNuevaAtencionConsulta(
  consultationId: string,
  copiarDatos = true
): Promise<{
  ok: boolean
  error?: string
  consultationId?: string
}> {
  try {
    const { ctx, consulta } = await exigirAccesoConsulta(consultationId)
    if (!consulta) return { ok: false, error: 'Consulta no encontrada.' }

    // Solo copiar datos antropométricos (peso, unidad y talla);
    // los datos del paciente, registro y antecedentes se heredan por patientId
    const ultimaPrevia = !copiarDatos
      ? await prisma.consultation.findFirst({
          where: { residencyId: consulta.residencyId, patientId: consulta.patientId },
          orderBy: { consultationDate: 'desc' },
          select: { weight: true, weightUnit: true, heightCm: true },
        })
      : null

    const pesoBase = copiarDatos ? consulta.weight : ultimaPrevia?.weight ?? null
    const unidadPesoBase = copiarDatos
      ? consulta.weightUnit ?? 'kg'
      : ultimaPrevia?.weightUnit ?? 'kg'
    const tallaBase = copiarDatos ? consulta.heightCm : ultimaPrevia?.heightCm ?? null

    const esMedicoOAdmin = ROLES_MEDICOS.includes(ctx.user.role) || ctx.user.role === 'ADMIN'

    const seccionesCopiadas: SeccionConsultaKey[] = ['motivo']
    if (pesoBase !== null || tallaBase !== null) {
      seccionesCopiadas.push('antropometria')
    }

    const nueva = await prisma.consultation.create({
      data: {
        residencyId: consulta.residencyId,
        patientId: consulta.patientId,
        doctorId: esMedicoOAdmin ? ctx.user.id : null,
        doctorName: esMedicoOAdmin ? ctx.user.fullName : null,
        consultationDate: new Date(),
        status: 'EN_CONSULTA',
        visitType: 'Seguimiento',
        consultationType: consulta.consultationType || 'Consulta general',
        chiefComplaint: 'Control de seguimiento',
        bloodPressure: null,
        heartRate: null,
        temperature: null,
        oxygenSat: null,
        weight: pesoBase,
        weightUnit: unidadPesoBase,
        heightCm: tallaBase,
        historyIllness: null,
        physicalExam: null,
        diagnosis: null,
        treatmentPlan: null,
        labOrders: null,
        notes: null,
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
        copiedData: copiarDatos,
        visitType: 'Seguimiento',
        consultationType: consulta.consultationType || 'Consulta general',
        status: 'EN_CONSULTA',
        changedSections: seccionesCopiadas,
        authorName: ctx.user.fullName,
        authorRole: String(ctx.user.role),
      },
      reason:
        'Nueva consulta creada copiando únicamente datos del paciente, antecedentes y antropometría (expediente previo intacto)',
    })

    revalidatePath('/dashboard')
    revalidatePath(`/dashboard/consultas/${consultationId}`)
    return { ok: true, consultationId: nueva.id }
  } catch (e: unknown) {
    return { ok: false, error: (e as Error)?.message || 'No se pudo iniciar una nueva atención.' }
  }
}

// ─── APARTADO DE BIOPSIAS (AGENDA Y RESULTADOS) EN NEFROLOGÍA ───
function componerAnaliticasBiopsia(formData: FormData): string {
  const estado = String(formData.get('labsStatus') ?? '').trim()
  const detalle = String(formData.get('labsPendingDetail') ?? '').trim()
  if (estado === 'Completo') return 'Completo'
  if (estado === 'Pendiente') {
    return detalle ? `Pendiente: ${detalle}` : 'Pendiente'
  }
  if (detalle) return `Pendiente: ${detalle}`
  return estado || 'Pendiente'
}

export async function crearBiopsiaConsulta(formData: FormData): Promise<{
  ok: boolean
  error?: string
}> {
  try {
    const { ctx } = await exigirAccesoConsulta()
    if (!ctx.esSuperAdmin && ctx.interfaceMode !== 'HOSPITALIZACION') {
      return { ok: false, error: 'El módulo de Biopsias corresponde únicamente a Nefrología.' }
    }
    const residencyId = ctx.residency!.id

    const patientIdRaw = String(formData.get('patientId') ?? '').trim()
    let patientId: string | null = null
    if (patientIdRaw) {
      const p = await prisma.patient.findFirst({
        where: { id: patientIdRaw, residencyId },
        select: { id: true },
      })
      if (p) patientId = p.id
    }

    const patientName = String(formData.get('patientName') ?? '').trim()
    if (patientName.length < 2) {
      return { ok: false, error: 'Escribe el nombre del paciente para agendar la biopsia.' }
    }

    const phone = String(formData.get('phone') ?? '').trim() || null
    const labsStatus = componerAnaliticasBiopsia(formData)
    const needleRaw = String(formData.get('needleStatus') ?? 'Utilizar la del centro').trim()
    const needleStatus = AGUJA_BIOPSIA.includes(needleRaw as (typeof AGUJA_BIOPSIA)[number])
      ? needleRaw
      : 'Utilizar la del centro'
    const kitRaw = String(formData.get('kitStatus') ?? 'Pendiente').trim()
    const kitStatus = KIT_BIOPSIA.includes(kitRaw as (typeof KIT_BIOPSIA)[number])
      ? kitRaw
      : 'Pendiente'
    const scheduledDate = String(formData.get('scheduledDate') ?? '').trim() || 'Pendiente'
    const arsRaw = String(formData.get('senasaAuth') ?? 'Pendiente').trim()
    const senasaAuth = ARS_BIOPSIA.includes(arsRaw as (typeof ARS_BIOPSIA)[number])
      ? arsRaw
      : 'Pendiente'
    const note = String(formData.get('note') ?? '').trim() || null

    const actorName = ctx.user.fullName || ctx.user.email
    const actorRole = String(ctx.user.role)

    const creado = await prisma.biopsyRecord.create({
      data: {
        residencyId,
        patientId,
        status: 'agendada',
        patientName,
        phone,
        labsStatus,
        needleStatus,
        kitStatus,
        scheduledDate,
        senasaAuth,
        note,
        highlightTag: 'normal',
        createdBy: ctx.user.email,
        createdByName: actorName,
        createdByRole: actorRole,
      },
    })

    await logAudit({
      actorId: ctx.user.id,
      actorRole,
      action: 'create',
      entity: 'biopsy_record',
      entityId: creado.id,
      patientId: patientId ?? undefined,
      newValue: {
        patientName,
        phone,
        labsStatus,
        needleStatus,
        kitStatus,
        scheduledDate,
        senasaAuth,
        note,
      },
      reason: `Paciente agendado en Biopsias (Nefrología): ${patientName}`,
    })

    revalidatePath('/dashboard')
    return { ok: true }
  } catch (e: unknown) {
    return { ok: false, error: (e as Error)?.message || 'No se pudo agendar la biopsia.' }
  }
}

export async function actualizarBiopsiaConsulta(formData: FormData): Promise<{
  ok: boolean
  error?: string
}> {
  try {
    const { ctx } = await exigirAccesoConsulta()
    if (!ctx.esSuperAdmin && ctx.interfaceMode !== 'HOSPITALIZACION') {
      return { ok: false, error: 'El módulo de Biopsias corresponde únicamente a Nefrología.' }
    }
    const residencyId = ctx.residency!.id
    const id = String(formData.get('id') ?? '').trim()
    if (!id) return { ok: false, error: 'Registro no especificado.' }

    const previo = await prisma.biopsyRecord.findFirst({
      where: { id, residencyId },
    })
    if (!previo) return { ok: false, error: 'Registro de biopsia no encontrado.' }

    const patientName = String(formData.get('patientName') ?? previo.patientName).trim()
    if (patientName.length < 2) {
      return { ok: false, error: 'El nombre del paciente es obligatorio.' }
    }

    const phone = String(formData.get('phone') ?? '').trim() || null
    const labsStatus =
      previo.status === 'agendada' ? componerAnaliticasBiopsia(formData) : previo.labsStatus
    const needleRaw = String(formData.get('needleStatus') ?? '').trim()
    const needleStatus =
      previo.status === 'agendada'
        ? AGUJA_BIOPSIA.includes(needleRaw as (typeof AGUJA_BIOPSIA)[number]) ||
          needleRaw === (previo.needleStatus ?? '')
          ? needleRaw || previo.needleStatus
          : 'Utilizar la del centro'
        : previo.needleStatus
    const kitRaw = String(formData.get('kitStatus') ?? '').trim()
    const kitStatus =
      previo.status === 'agendada'
        ? KIT_BIOPSIA.includes(kitRaw as (typeof KIT_BIOPSIA)[number])
          ? kitRaw
          : previo.kitStatus
        : previo.kitStatus
    const scheduledDate =
      previo.status === 'agendada'
        ? String(formData.get('scheduledDate') ?? '').trim() || null
        : previo.scheduledDate
    const arsRaw = String(formData.get('senasaAuth') ?? '').trim()
    const senasaAuth =
      previo.status === 'agendada'
        ? ARS_BIOPSIA.includes(arsRaw as (typeof ARS_BIOPSIA)[number]) ||
          arsRaw === (previo.senasaAuth ?? '')
          ? arsRaw || previo.senasaAuth
          : 'Pendiente'
        : previo.senasaAuth
    const note =
      previo.status === 'agendada'
        ? String(formData.get('note') ?? '').trim() || null
        : previo.note
    const performedDate = String(formData.get('performedDate') ?? '').trim() || null
    const complications = String(formData.get('complications') ?? '').trim() || null
    const report = String(formData.get('report') ?? '').trim() || null

    const actorName = ctx.user.fullName || ctx.user.email
    const actorRole = String(ctx.user.role)

    await prisma.biopsyRecord.update({
      where: { id: previo.id },
      data: {
        patientName,
        phone,
        labsStatus,
        needleStatus,
        kitStatus,
        scheduledDate,
        senasaAuth,
        note,
        performedDate: previo.status === 'realizada' ? performedDate : previo.performedDate,
        complications: previo.status === 'realizada' ? complications : previo.complications,
        report: previo.status === 'realizada' ? report : previo.report,
        highlightTag: previo.status === 'realizada' ? 'completada' : 'normal',
        updatedBy: ctx.user.email,
        updatedByName: actorName,
        updatedByRole: actorRole,
        updatedAt: new Date(),
      },
    })

    await logAudit({
      actorId: ctx.user.id,
      actorRole,
      action: 'update',
      entity: 'biopsy_record',
      entityId: previo.id,
      patientId: previo.patientId ?? undefined,
      oldValue: {
        patientName: previo.patientName,
        phone: previo.phone,
        labsStatus: previo.labsStatus,
        needleStatus: previo.needleStatus,
        kitStatus: previo.kitStatus,
        scheduledDate: previo.scheduledDate,
        senasaAuth: previo.senasaAuth,
        note: previo.note,
        performedDate: previo.performedDate,
        complications: previo.complications,
        report: previo.report,
      },
      newValue: {
        patientName,
        phone,
        labsStatus,
        needleStatus,
        kitStatus,
        scheduledDate,
        senasaAuth,
        note,
        performedDate,
        complications,
        report,
      },
      reason: `Biopsia actualizada (${patientName})`,
    })

    revalidatePath('/dashboard')
    return { ok: true }
  } catch (e: unknown) {
    return { ok: false, error: (e as Error)?.message || 'No se pudo actualizar la biopsia.' }
  }
}

export async function marcarBiopsiaRealizada(formData: FormData): Promise<{
  ok: boolean
  error?: string
}> {
  try {
    const { ctx } = await exigirAccesoConsulta()
    if (!ctx.esSuperAdmin && ctx.interfaceMode !== 'HOSPITALIZACION') {
      return { ok: false, error: 'El módulo de Biopsias corresponde únicamente a Nefrología.' }
    }
    const residencyId = ctx.residency!.id
    const id = String(formData.get('id') ?? '').trim()
    if (!id) return { ok: false, error: 'Registro no especificado.' }

    const previo = await prisma.biopsyRecord.findFirst({
      where: { id, residencyId },
    })
    if (!previo) return { ok: false, error: 'Registro de biopsia no encontrado.' }

    const performedDate = String(formData.get('performedDate') ?? '').trim()
    const complications = String(formData.get('complications') ?? '').trim() || 'Ninguna'
    const report = String(formData.get('report') ?? '').trim() || null

    if (!performedDate) {
      return { ok: false, error: 'Indica la fecha de realización de la biopsia.' }
    }

    const actorName = ctx.user.fullName || ctx.user.email
    const actorRole = String(ctx.user.role)

    await prisma.biopsyRecord.update({
      where: { id: previo.id },
      data: {
        status: 'realizada',
        performedDate,
        complications,
        report,
        highlightTag: 'completada',
        performedBy: ctx.user.email,
        performedByName: actorName,
        performedByRole: actorRole,
        performedAt: new Date(),
        updatedBy: ctx.user.email,
        updatedByName: actorName,
        updatedByRole: actorRole,
        updatedAt: new Date(),
      },
    })

    await logAudit({
      actorId: ctx.user.id,
      actorRole,
      action: 'update',
      entity: 'biopsy_record',
      entityId: previo.id,
      patientId: previo.patientId ?? undefined,
      oldValue: { status: previo.status },
      newValue: {
        status: 'realizada',
        patientName: previo.patientName,
        performedDate,
        complications,
        report,
      },
      reason: `Biopsia marcada como realizada (${previo.patientName} · ${performedDate})`,
    })

    revalidatePath('/dashboard')
    return { ok: true }
  } catch (e: unknown) {
    return { ok: false, error: (e as Error)?.message || 'No se pudo registrar el resultado de biopsia.' }
  }
}

export async function reabrirBiopsiaAgendada(formData: FormData): Promise<{
  ok: boolean
  error?: string
}> {
  try {
    const { ctx } = await exigirAccesoConsulta()
    if (!ctx.esSuperAdmin && ctx.interfaceMode !== 'HOSPITALIZACION') {
      return { ok: false, error: 'El módulo de Biopsias corresponde únicamente a Nefrología.' }
    }
    const residencyId = ctx.residency!.id
    const id = String(formData.get('id') ?? '').trim()
    const previo = await prisma.biopsyRecord.findFirst({
      where: { id, residencyId },
    })
    if (!previo) return { ok: false, error: 'Registro no encontrado.' }

    const actorName = ctx.user.fullName || ctx.user.email
    const actorRole = String(ctx.user.role)

    await prisma.biopsyRecord.update({
      where: { id: previo.id },
      data: {
        status: 'agendada',
        highlightTag: 'normal',
        updatedBy: ctx.user.email,
        updatedByName: actorName,
        updatedByRole: actorRole,
        updatedAt: new Date(),
      },
    })

    await logAudit({
      actorId: ctx.user.id,
      actorRole,
      action: 'update',
      entity: 'biopsy_record',
      entityId: previo.id,
      patientId: previo.patientId ?? undefined,
      oldValue: { status: previo.status },
      newValue: { status: 'agendada', patientName: previo.patientName },
      reason: `Biopsia devuelta a Agenda (${previo.patientName})`,
    })

    revalidatePath('/dashboard')
    return { ok: true }
  } catch (e: unknown) {
    return { ok: false, error: (e as Error)?.message || 'No se pudo reabrir el registro.' }
  }
}

// ─── APARTADO DE UNIDAD DE HEMODIÁLISIS AMBULATORIA ───
function leerCamposHemodialisisConsulta(formData: FormData) {
  const s = (k: string) => String(formData.get(k) ?? '').trim() || null
  const ageStr = String(formData.get('age') ?? '').trim()
  const ageParsed = ageStr ? parseInt(ageStr, 10) : null
  const age = ageParsed !== null && !Number.isNaN(ageParsed) ? ageParsed : null

  return {
    firstName: String(formData.get('firstName') ?? '').trim(),
    lastName: String(formData.get('lastName') ?? '').trim(),
    expedienteNumber: s('expedienteNumber'),
    age,
    sex: s('sex'),
    phone: s('phone'),
    cedula: s('cedula'),
    bloodType: s('bloodType'),
    diagnosisAndTime: s('diagnosisAndTime'),
    medications: s('medications'),
    allergies: s('allergies'),
    allergyReaction: s('allergyReaction'),
    transfusions: s('transfusions'),
    referredFromCenter: s('referredFromCenter'),
    firstTimeInCenter: s('firstTimeInCenter'),
    otherDialysisModality: s('otherDialysisModality'),
    pathologicalHistory: s('pathologicalHistory'),
    surgicalHistory: s('surgicalHistory'),
    familyHistory: s('familyHistory'),
    habitCoffee: s('habitCoffee'),
    habitTobacco: s('habitTobacco'),
    habitAlcohol: s('habitAlcohol'),
    habitDrugs: s('habitDrugs'),
    habitOther: s('habitOther'),
    viralHiv: s('viralHiv'),
    viralHbsag: s('viralHbsag'),
    viralHvc: s('viralHvc'),
    labHgb: s('labHgb'),
    labHct: s('labHct'),
    labUrea: s('labUrea'),
    labCr: s('labCr'),
    labK: s('labK'),
    labBloodType: s('labBloodType'),
    labOther: s('labOther'),
    imagingSonography: s('imagingSonography'),
    imagingCt: s('imagingCt'),
    imagingOther: s('imagingOther'),
    accessAvFistula: s('accessAvFistula'),
    accessGraft: s('accessGraft'),
    accessTunneledCatheter: s('accessTunneledCatheter'),
    accessFavi: s('accessFavi'),
    clinicalNotes: s('clinicalNotes'),
  }
}

export async function crearHemodialisisConsulta(formData: FormData): Promise<{
  ok: boolean
  error?: string
}> {
  try {
    const { ctx } = await exigirAccesoConsulta()
    if (!ctx.esSuperAdmin && ctx.interfaceMode !== 'HEMODIALISIS') {
      return { ok: false, error: 'Este expediente pertenece únicamente a la Unidad de Hemodiálisis.' }
    }
    const residencyId = ctx.residency!.id

    const campos = leerCamposHemodialisisConsulta(formData)
    if (campos.firstName.length < 2 || campos.lastName.length < 2) {
      return { ok: false, error: 'Nombre y apellido del paciente son obligatorios.' }
    }

    const patientIdRaw = String(formData.get('patientId') ?? '').trim()
    let patientId: string | null = null
    if (patientIdRaw) {
      const p = await prisma.patient.findFirst({
        where: { id: patientIdRaw, residencyId },
        select: { id: true },
      })
      if (p) patientId = p.id
    }

    const actorName = ctx.user.fullName || ctx.user.email
    const actorRole = String(ctx.user.role)

    const creado = await prisma.outpatientHemodialysis.create({
      data: {
        residencyId,
        patientId,
        ...campos,
        isActive: true,
        createdBy: ctx.user.email,
        createdByName: actorName,
        createdByRole: actorRole,
      },
    })

    await logAudit({
      actorId: ctx.user.id,
      actorRole,
      action: 'create',
      entity: 'outpatient_hemodialysis',
      entityId: creado.id,
      patientId: patientId ?? undefined,
      newValue: {
        patientName: `${campos.firstName} ${campos.lastName}`,
        diagnosisAndTime: campos.diagnosisAndTime,
      },
      reason: `Expediente de Hemodiálisis creado: ${campos.firstName} ${campos.lastName}`,
    })

    revalidatePath('/dashboard')
    return { ok: true }
  } catch (e: unknown) {
    return {
      ok: false,
      error: (e as Error)?.message || 'No se pudo crear el expediente de Hemodiálisis.',
    }
  }
}

export async function actualizarHemodialisisConsulta(formData: FormData): Promise<{
  ok: boolean
  error?: string
}> {
  try {
    const { ctx } = await exigirAccesoConsulta()
    if (!ctx.esSuperAdmin && ctx.interfaceMode !== 'HEMODIALISIS') {
      return { ok: false, error: 'Este expediente pertenece únicamente a la Unidad de Hemodiálisis.' }
    }
    const residencyId = ctx.residency!.id
    const id = String(formData.get('id') ?? '').trim()
    if (!id) return { ok: false, error: 'Expediente no especificado.' }

    const previo = await prisma.outpatientHemodialysis.findFirst({
      where: { id, residencyId },
    })
    if (!previo) return { ok: false, error: 'Expediente de Hemodiálisis no encontrado.' }

    const campos = leerCamposHemodialisisConsulta(formData)
    if (campos.firstName.length < 2 || campos.lastName.length < 2) {
      return { ok: false, error: 'Nombre y apellido no pueden quedar vacíos.' }
    }

    const actorName = ctx.user.fullName || ctx.user.email
    const actorRole = String(ctx.user.role)

    await prisma.outpatientHemodialysis.update({
      where: { id: previo.id },
      data: {
        ...campos,
        updatedBy: ctx.user.email,
        updatedByName: actorName,
        updatedByRole: actorRole,
        updatedAt: new Date(),
      },
    })

    const previoMap = previo as unknown as Record<string, unknown>
    const camposMap = campos as unknown as Record<string, unknown>
    const oldChanged: Record<string, unknown> = {}
    const newChanged: Record<string, unknown> = {
      patientName: `${campos.firstName} ${campos.lastName}`,
    }
    for (const [k, newVal] of Object.entries(camposMap)) {
      const oldVal = previoMap[k] ?? null
      if (oldVal !== newVal) {
        oldChanged[k] = oldVal
        newChanged[k] = newVal
      }
    }

    await logAudit({
      actorId: ctx.user.id,
      actorRole,
      action: 'update',
      entity: 'outpatient_hemodialysis',
      entityId: previo.id,
      patientId: previo.patientId ?? undefined,
      oldValue: oldChanged,
      newValue: newChanged,
      reason: `Expediente de Hemodiálisis modificado (${campos.firstName} ${campos.lastName})`,
    })

    revalidatePath('/dashboard')
    return { ok: true }
  } catch (e: unknown) {
    return {
      ok: false,
      error: (e as Error)?.message || 'No se pudo actualizar el expediente de Hemodiálisis.',
    }
  }
}

export async function archivarReactivarHemodialisisConsulta(formData: FormData): Promise<{
  ok: boolean
  error?: string
}> {
  try {
    const { ctx } = await exigirAccesoConsulta()
    if (!ctx.esSuperAdmin && ctx.interfaceMode !== 'HEMODIALISIS') {
      return { ok: false, error: 'Este expediente pertenece únicamente a la Unidad de Hemodiálisis.' }
    }
    const residencyId = ctx.residency!.id
    const id = String(formData.get('id') ?? '').trim()
    const isActive = String(formData.get('isActive') ?? 'false') === 'true'

    const previo = await prisma.outpatientHemodialysis.findFirst({
      where: { id, residencyId },
    })
    if (!previo) return { ok: false, error: 'Expediente no encontrado.' }

    const actorName = ctx.user.fullName || ctx.user.email
    const actorRole = String(ctx.user.role)

    await prisma.outpatientHemodialysis.update({
      where: { id: previo.id },
      data: {
        isActive,
        updatedBy: ctx.user.email,
        updatedByName: actorName,
        updatedByRole: actorRole,
        updatedAt: new Date(),
      },
    })

    await logAudit({
      actorId: ctx.user.id,
      actorRole,
      action: 'update',
      entity: 'outpatient_hemodialysis',
      entityId: previo.id,
      patientId: previo.patientId ?? undefined,
      oldValue: { isActive: previo.isActive },
      newValue: { isActive, patientName: `${previo.firstName} ${previo.lastName}` },
      reason: isActive
        ? `Expediente de Hemodiálisis reactivado (${previo.firstName} ${previo.lastName})`
        : `Expediente de Hemodiálisis archivado (${previo.firstName} ${previo.lastName})`,
    })

    revalidatePath('/dashboard')
    return { ok: true }
  } catch (e: unknown) {
    return { ok: false, error: (e as Error)?.message || 'No se pudo cambiar el estado del expediente.' }
  }
}
