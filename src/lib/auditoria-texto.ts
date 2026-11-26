type Datos = Record<string, unknown>

const obj = (v: unknown): Datos =>
  v && typeof v === 'object' && !Array.isArray(v) ? (v as Datos) : {}
const lleno = (v: unknown) => v !== null && v !== undefined && v !== ''
const cortar = (s: string, max = 160) => (s.length > max ? `${s.slice(0, max)}…` : s)
const unir = (...p: (string | false | null | undefined)[]) => p.filter(Boolean).join(' · ')

// Nunca mostrar claves temporales en pantalla (protege también los registros antiguos)
export function ocultarSecretos(texto: string): string {
  return texto.replace(/(clave temporal[^:]*:\s*)\S+/gi, '$1••••••')
}

const ACCIONES: Record<string, string> = {
  create: 'Creó',
  update: 'Modificó',
  delete: 'Eliminó',
  close_episode: 'Cerró',
  take_charge: 'Tomó a cargo',
  reassign: 'Reasignó',
}
const ENTIDADES: Record<string, string> = {
  note: 'una nota',
  vital_sign: 'signos vitales',
  allergy: 'una alergia',
  handoff: 'una entrega de turno',
  episode: 'un expediente',
  patient: 'un paciente',
  task: 'una tarea',
  user: 'un usuario',
  base_department_plan: 'un plan del departamento base',
  episode_drain: 'un drenaje',
  episode_drain_entry: 'un registro de débito de drenaje',
  wound_care: 'una cura quirúrgica',
  hemodialysis_item: 'un registro de Hemodiálisis',
  consultation: 'una consulta externa',
  medical_history: 'antecedentes clínicos',
  biopsy_record: 'una biopsia en Nefrología',
  outpatient_hemodialysis: 'un expediente de Hemodiálisis',
  emergencia_guardia: 'el parte de guardia de Emergencia',
  emergency_profile: 'el perfil clínico de Emergencia',
  hematology_profile: 'el perfil clínico de Hematología',
  viral_serology: 'los marcadores virales',
}

export function describirRegistro(log: {
  action: string
  entity: string
  reason: string | null
  oldValue: unknown
  newValue: unknown
}): { que: string; detalle: string } {
  const n = obj(log.newValue)
  const o = obj(log.oldValue)

  switch (`${log.entity}:${log.action}`) {
    case 'note:create':
      return {
        que: 'Firmó una nota de evolución',
        detalle: lleno(n.assessment) ? cortar(`Análisis: ${String(n.assessment)}`) : '',
      }

    case 'vital_sign:create':
      return {
        que: 'Registró signos vitales',
        detalle: unir(
          lleno(n.systolic) && lleno(n.diastolic) && `TA ${n.systolic}/${n.diastolic}`,
          lleno(n.heartRate) && `FC ${n.heartRate}`,
          lleno(n.respiratoryRate) && `FR ${n.respiratoryRate}`,
          lleno(n.temperature) && `Temp ${n.temperature}°C`,
          lleno(n.oxygenSat) && `SpO2 ${n.oxygenSat}%`,
          lleno(n.glucose) && `Glucosa ${n.glucose}`,
          lleno(n.painScale) && `Dolor ${n.painScale}/10`
        ),
      }

    case 'allergy:create':
      return {
        que: 'Registró una alergia',
        detalle: unir(String(n.allergen ?? ''), lleno(n.severity) && `gravedad ${n.severity}`),
      }

    case 'handoff:create':
      return {
        que: 'Entregó el turno',
        detalle: unir(
          lleno(n.recibidoPor) && `Entregado a ${n.recibidoPor}`,
          typeof n.tareasPendientes === 'number' && `${n.tareasPendientes} tarea(s) pendiente(s)`,
          lleno(n.observaciones) && `Obs: ${cortar(String(n.observaciones), 100)}`
        ),
      }

    case 'handoff:update':
      return {
        que: 'Aceptó la entrega de turno',
        detalle: unir(
          lleno(n.nuevoResponsable) && `Ahora a cargo: ${n.nuevoResponsable}`,
          lleno(n.entregadoPor) && `Entregó: ${n.entregadoPor}`
        ),
      }

    case 'episode:close_episode':
      return {
        que: 'Dio de alta al paciente',
        detalle: unir(
          lleno(n.dischargeType) && String(n.dischargeType),
          lleno(n.diagnosis) && `Dx: ${n.diagnosis}`,
          typeof n.tareasCanceladas === 'number' && n.tareasCanceladas > 0 && `${n.tareasCanceladas} tarea(s) cancelada(s)`
        ),
      }

    case 'episode:take_charge':
      return { que: 'Tomó a cargo al paciente', detalle: '' }

    case 'episode:reassign':
      return {
        que: 'Reasignó el médico a cargo',
        detalle: unir(
          `De ${String(o.responsable ?? 'sin responsable')} a ${String(n.responsable ?? '')}`,
          log.reason && `Motivo: ${log.reason}`
        ),
      }

    case 'task:create':
      return {
        que: 'Agregó una tarea al checklist',
        detalle: unir(String(n.tarea ?? ''), lleno(n.programadaPara) && `para ${n.programadaPara}`),
      }

    case 'task:update': {
      const que =
        n.estado === 'hecha'
          ? 'Marcó una tarea como realizada'
          : n.estado === 'cancelada'
            ? 'Canceló una tarea'
            : 'Reabrió una tarea'
      return { que, detalle: unir(String(n.tarea ?? ''), n.estado === 'cancelada' && log.reason) }
    }

    case 'user:create':
    case 'user:update': {
      // Usuarios: motivo + a quién afectó (sin datos sensibles)
      const quien = lleno(n.usuario) ? String(n.usuario) : lleno(n.fullName) ? String(n.fullName) : ''
      const correo = lleno(n.correo) ? String(n.correo) : lleno(n.email) ? String(n.email) : ''
      return {
        que: `${ACCIONES[log.action] ?? log.action} un usuario`,
        detalle: unir(
          log.reason ? ocultarSecretos(log.reason) : '',
          quien && `Usuario: ${quien}${correo ? ` (${correo})` : ''}`
        ),
      }
    }

    case 'base_department_plan:create':
      return {
        que: 'Agregó una indicación al Plan del Departamento Base',
        detalle: lleno(n.contenido) ? cortar(String(n.contenido)) : '',
      }

    case 'base_department_plan:update':
      return {
        que:
          n.isActive === false
            ? 'Archivó una indicación del Plan del Departamento Base'
            : 'Editó una indicación del Plan del Departamento Base',
        detalle: log.reason
          ? log.reason
          : lleno(n.contenido)
            ? cortar(String(n.contenido))
            : '',
      }

    case 'episode_drain:create':
      return {
        que: 'Agregó un drenaje quirúrgico al control independiente',
        detalle: unir(
          lleno(n.name) && String(n.name),
          lleno(n.location) && `Ubicación: ${String(n.location)}`,
          typeof n.initialVolumeMl === 'number' && `Inicial: ${n.initialVolumeMl} mL`
        ),
      }

    case 'episode_drain:update':
      return {
        que: 'Retiró un drenaje quirúrgico',
        detalle: log.reason ? log.reason : lleno(n.name) ? String(n.name) : '',
      }

    case 'episode_drain_entry:create':
      return {
        que: 'Registró débito de drenaje',
        detalle: unir(
          lleno(n.drainName) && String(n.drainName),
          typeof n.volumeMl === 'number' && `${n.volumeMl} mL`,
          lleno(n.characteristic) && String(n.characteristic)
        ),
      }

    case 'episode_drain_entry:update':
      return {
        que: 'Corrigió un registro de débito de drenaje',
        detalle: unir(
          lleno(n.drainName) && String(n.drainName),
          typeof o.volumeMl === 'number' && typeof n.volumeMl === 'number'
            ? `${o.volumeMl} mL → ${n.volumeMl} mL`
            : typeof n.volumeMl === 'number' && `${n.volumeMl} mL`
        ),
      }

    case 'subscription_payment_reset:update':
      return {
        que: 'Reinició los pagos recibidos de prueba en SuperAdmin',
        detalle: log.reason ?? '',
      }

    case 'hemodialysis_item:create':
      return {
        que: 'Registró un elemento en la Unidad de Hemodiálisis',
        detalle: unir(
          lleno(n.section) && `Área: ${String(n.section)}`,
          lleno(n.patientName) && String(n.patientName),
          lleno(n.title) && cortar(String(n.title))
        ),
      }

    case 'hemodialysis_item:update':
      return {
        que:
          n.isActive === false
            ? 'Finalizó / cerró un pendiente de Hemodiálisis'
            : n.accion === 'dosis'
              ? 'Registró dosis aplicada en Hemodiálisis'
              : n.isActive === true && o.isActive === false
                ? 'Reactivó un registro de Hemodiálisis'
                : 'Modificó un registro de Hemodiálisis',
        detalle: log.reason
          ? log.reason
          : unir(lleno(n.patientName) && String(n.patientName), lleno(n.title) && cortar(String(n.title))),
      }

    case 'consultation:create':
      return {
        que: n.copiedFromConsultationId
          ? 'Creó nueva consulta copiando datos de una visita anterior'
          : 'Registró una consulta externa',
        detalle: unir(
          lleno(n.visitType) && String(n.visitType),
          lleno(n.chiefComplaint) && `Motivo: ${cortar(String(n.chiefComplaint), 100)}`,
          lleno(n.diagnosis) && `Dx: ${cortar(String(n.diagnosis), 90)}`
        ),
      }

    case 'consultation:update': {
      const cambioTipo =
        lleno(o.consultationType) &&
        lleno(n.consultationType) &&
        o.consultationType !== n.consultationType
          ? `Tipo de consulta: ${String(o.consultationType)} → ${String(n.consultationType)}`
          : ''
      return {
        que:
          n.status === 'COMPLETADA' && o.status !== 'COMPLETADA'
            ? 'Finalizó y firmó la consulta externa'
            : cambioTipo
              ? 'Cambió el tipo / estatus de consulta externa'
              : log.reason
                ? log.reason
                : 'Actualizó la ficha clínica de consulta externa',
        detalle: unir(
          cambioTipo,
          lleno(n.diagnosis) && `Dx: ${cortar(String(n.diagnosis), 90)}`,
          lleno(n.chiefComplaint) && `Motivo: ${cortar(String(n.chiefComplaint), 90)}`
        ),
      }
    }

    case 'medical_history:update':
      return {
        que: 'Actualizó antecedentes del paciente',
        detalle: log.reason ? log.reason : 'Modificó antecedentes clínicos del expediente',
      }

    case 'biopsy_record:create':
      return {
        que: 'Agendó una biopsia en Nefrología',
        detalle: unir(
          lleno(n.patientName) && String(n.patientName),
          lleno(n.scheduledDate) && `Cita: ${String(n.scheduledDate)}`,
          lleno(n.senasaAuth) && `ARS: ${String(n.senasaAuth)}`
        ),
      }

    case 'biopsy_record:update':
      return {
        que:
          n.status === 'realizada' && o.status === 'agendada'
            ? 'Registró resultado de biopsia realizada'
            : n.status === 'agendada' && o.status === 'realizada'
              ? 'Reabrió biopsia a la agenda'
              : 'Actualizó registro de biopsia en Nefrología',
        detalle: log.reason
          ? log.reason
          : unir(
              lleno(n.patientName) && String(n.patientName),
              lleno(n.complications) && `Complicaciones: ${String(n.complications)}`
            ),
      }

    case 'outpatient_hemodialysis:create':
      return {
        que: 'Creó expediente en Unidad de Hemodiálisis',
        detalle: unir(
          lleno(n.patientName) && String(n.patientName),
          lleno(n.diagnosisAndTime) && cortar(String(n.diagnosisAndTime), 100)
        ),
      }

    case 'outpatient_hemodialysis:update':
      return {
        que:
          n.isActive === false && o.isActive === true
            ? 'Archivó expediente de Hemodiálisis'
            : n.isActive === true && o.isActive === false
              ? 'Reactivó expediente de Hemodiálisis'
              : 'Actualizó expediente de Hemodiálisis',
        detalle: log.reason
          ? log.reason
          : lleno(n.patientName)
            ? String(n.patientName)
            : '',
      }

    case 'emergencia_guardia:update':
      return {
        que: 'Actualizó la Entrega de Guardia de Emergencia',
        detalle: unir(
          log.reason ? log.reason : null,
          n.mode === 'auto' ? 'Cálculo automático' : n.mode === 'manual' ? 'Ajuste manual' : null,
          lleno(n.fecha) && `Guardia: ${String(n.fecha)}`,
          typeof n.totalVistos === 'number' && `Vistos: ${n.totalVistos}`
        ),
      }

    case 'emergency_profile:create':
    case 'emergency_profile:update': {
      const cambios: string[] = []
      const etiquetas: Record<string, string> = {
        room: 'Área',
        bed: 'Cama',
        primaryDiagnosis: 'Dx',
        amc: 'AMC',
        specialty: 'Especialidad',
        triageLevel: 'Triaje',
        clinicalStatus: 'Estado clínico',
        oxygenSupport: 'Oxígeno',
        relevantLabsStudies: 'Analíticas/Estudios',
        interestsPending: 'Pendientes/Interés',
        dispositionPlan: 'Disposición',
      }
      for (const [k, label] of Object.entries(etiquetas)) {
        if (k in n && n[k] !== o[k]) {
          const val = lleno(n[k]) ? cortar(String(n[k]), 50) : 'vacío'
          cambios.push(`${label}: ${val}`)
        }
      }
      return {
        que:
          log.action === 'create'
            ? 'Registró perfil clínico inicial de Emergencia'
            : 'Actualizó ficha clínica de Emergencia',
        detalle: unir(log.reason && log.reason, cambios.join(' · ')),
      }
    }

    case 'hematology_profile:create':
    case 'hematology_profile:update': {
      const cambios: string[] = []
      const etiquetas: Record<string, string> = {
        room: 'Sala',
        bed: 'Cama',
        primaryDiagnosis: 'Dx',
        vitalSignsFrequency: 'Signos vitales',
        bleedingWatch: 'Sangrado',
        painWatch: 'Dolor',
        temperatureWatch: 'Temperatura',
        hemodynamicWatch: 'Hemodinamia',
        isolationType: 'Aislamiento',
        oxygenSupport: 'Oxígeno',
        pendingBloodProducts: 'Hemocomponentes',
        pendingStudies: 'Estudios',
      }
      for (const [k, label] of Object.entries(etiquetas)) {
        if (k in n && n[k] !== o[k]) {
          const val = lleno(n[k]) ? cortar(String(n[k]), 50) : 'vacío'
          cambios.push(`${label}: ${val}`)
        }
      }
      return {
        que:
          log.action === 'create'
            ? 'Registró vigilancia inicial de Hematología'
            : 'Actualizó plan/vigilancia de Hematología',
        detalle: unir(log.reason && log.reason, cambios.join(' · ')),
      }
    }

    case 'viral_serology:update':
      return {
        que: 'Actualizó marcadores virales',
        detalle: unir(
          lleno(o.status) && `Antes: ${String(o.status)}`,
          lleno(n.status) && `Estado: ${String(n.status)}`,
          lleno(n.details) && cortar(String(n.details), 80)
        ),
      }

    case 'patient:update': {
      if ('tipificacion' in n) {
        return {
          que: 'Registró / actualizó tipificación sanguínea',
          detalle: unir(
            lleno(o.tipificacion) && `Anterior: ${String(o.tipificacion)}`,
            lleno(n.tipificacion) && `Nueva: ${String(n.tipificacion)}`
          ),
        }
      }
      return {
        que: 'Actualizó datos del paciente',
        detalle: unir(
          log.reason && log.reason,
          lleno(n.firstName) && `${String(n.firstName)} ${String(n.lastName ?? '')}`.trim(),
          lleno(n.bloodType) && `Grupo: ${String(n.bloodType)}`
        ),
      }
    }

    default: {
      const que = `${ACCIONES[log.action] ?? log.action} ${ENTIDADES[log.entity] ?? log.entity}`
      const detalle = log.reason
        ? ocultarSecretos(log.reason)
        : cortar(ocultarSecretos(JSON.stringify(log.newValue ?? '')))
      return { que, detalle }
    }
  }
}