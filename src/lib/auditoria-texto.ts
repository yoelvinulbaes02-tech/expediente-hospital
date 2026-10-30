type Datos = Record<string, unknown>

const obj = (v: unknown): Datos =>
  v && typeof v === 'object' && !Array.isArray(v) ? (v as Datos) : {}
const lleno = (v: unknown) => v !== null && v !== undefined && v !== ''
const cortar = (s: string, max = 160) => (s.length > max ? `${s.slice(0, max)}…` : s)
const unir = (...p: (string | false | null | undefined)[]) => p.filter(Boolean).join(' · ')

// Nunca mostrar claves temporales en pantalla
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
    case 'user:update':
      // Usuarios: solo el motivo, sin datos sensibles
      return {
        que: `${ACCIONES[log.action] ?? log.action} un usuario`,
        detalle: log.reason ? ocultarSecretos(log.reason) : '',
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