'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { cambiarEstadoConsulta, crearConsulta } from '@/app/dashboard/consultas/actions'

type ConsultaItem = {
  id: string
  consultationDate: string
  status: string
  visitType: string
  chiefComplaint: string
  diagnosis: string | null
  doctorName: string | null
  patient: {
    id: string
    firstName: string
    lastName: string
    age: number | null
    sex: string
    expedienteNumber: string
    phone: string | null
    cedula: string | null
  }
}

type PacienteResumen = {
  id: string
  firstName: string
  lastName: string
  expedienteNumber: string
  age: number | null
  sex: string
  phone: string | null
}

type DoctorResumen = {
  id: string
  fullName: string
}

const ESTADO_META: Record<string, { label: string; clase: string }> = {
  PROGRAMADA: {
    label: 'Programada',
    clase: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600',
  },
  EN_SALA: {
    label: 'En sala de espera',
    clase: 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700',
  },
  EN_CONSULTA: {
    label: 'En consulta',
    clase: 'bg-blue-50 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700',
  },
  COMPLETADA: {
    label: 'Completada',
    clase: 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700',
  },
  CANCELADA: {
    label: 'Cancelada',
    clase: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
  },
}

function normalizar(texto?: string | null) {
  return (texto ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

function esHoy(isoDate: string): boolean {
  const f = new Date(isoDate)
  const ahora = new Date()
  const fmt = (d: Date) =>
    d.toLocaleDateString('en-CA', { timeZone: 'America/Santo_Domingo' })
  return fmt(f) === fmt(ahora)
}

function fmtFechaHora(iso: string): string {
  return new Date(iso).toLocaleString('es-DO', {
    timeZone: 'America/Santo_Domingo',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function ConsultasDashboard({
  consultas,
  pacientes,
  doctores,
  residencyName,
  specialty,
  puedeRegistrar,
  suscripcionBloqueada,
}: {
  consultas: ConsultaItem[]
  pacientes: PacienteResumen[]
  doctores: DoctorResumen[]
  residencyName: string
  specialty: string
  puedeRegistrar: boolean
  suscripcionBloqueada: boolean
}) {
  const router = useRouter()
  const [filtroEstado, setFiltroEstado] = useState<'hoy' | 'espera' | 'completadas' | 'todas'>('hoy')
  const [busqueda, setBusqueda] = useState('')
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [patientMode, setPatientMode] = useState<'new' | 'existing'>('new')
  const [nombreNuevo, setNombreNuevo] = useState('')
  const [apellidoNuevo, setApellidoNuevo] = useState('')
  const [abrirAlCrear, setAbrirAlCrear] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [actualizandoId, setActualizandoId] = useState<string | null>(null)
  const [mensaje, setMensaje] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null)

  const consultasHoy = useMemo(
    () => consultas.filter((c) => esHoy(c.consultationDate) && c.status !== 'CANCELADA'),
    [consultas]
  )
  const enEsperaCount = useMemo(
    () => consultas.filter((c) => c.status === 'EN_SALA' || c.status === 'EN_CONSULTA' || c.status === 'PROGRAMADA').length,
    [consultas]
  )

  const catalogoPacientes = useMemo(() => {
    const mapa = new Map<string, PacienteResumen>()
    for (const p of pacientes) {
      mapa.set(p.id, p)
    }
    for (const c of consultas) {
      if (!mapa.has(c.patient.id)) {
        mapa.set(c.patient.id, {
          id: c.patient.id,
          firstName: c.patient.firstName,
          lastName: c.patient.lastName,
          expedienteNumber: c.patient.expedienteNumber,
          age: c.patient.age,
          sex: c.patient.sex,
          phone: c.patient.phone,
        })
      }
    }
    return Array.from(mapa.values())
  }, [pacientes, consultas])

  const coincidenciasNombre = useMemo(() => {
    const clave = normalizar(`${nombreNuevo} ${apellidoNuevo}`)
    if (!clave || clave.length < 3) {
      return { exacto: null, sugerencias: [] as { paciente: PacienteResumen; ultimaConsulta: ConsultaItem | null }[] }
    }

    const tokens = clave.split(' ').filter(Boolean)
    const exactoPac =
      nombreNuevo.trim().length > 0 && apellidoNuevo.trim().length > 0
        ? catalogoPacientes.find(
            (p) => normalizar(`${p.firstName} ${p.lastName}`) === clave
          ) ?? null
        : null

    if (exactoPac) {
      const ultimaConsulta = consultas.find((c) => c.patient.id === exactoPac.id) ?? null
      return {
        exacto: { paciente: exactoPac, ultimaConsulta },
        sugerencias: [],
      }
    }

    const sugerencias = catalogoPacientes
      .filter((p) => {
        const completo = normalizar(`${p.firstName} ${p.lastName}`)
        return tokens.every((t) => completo.includes(t))
      })
      .slice(0, 4)
      .map((pac) => ({
        paciente: pac,
        ultimaConsulta: consultas.find((c) => c.patient.id === pac.id) ?? null,
      }))

    return { exacto: null, sugerencias }
  }, [nombreNuevo, apellidoNuevo, catalogoPacientes, consultas])

  const filtradas = useMemo(() => {
    const terminos = normalizar(busqueda).split(/\s+/).filter(Boolean)

    return consultas.filter((c) => {
      if (filtroEstado === 'hoy' && !esHoy(c.consultationDate)) return false
      if (
        filtroEstado === 'espera' &&
        !['PROGRAMADA', 'EN_SALA', 'EN_CONSULTA'].includes(c.status)
      ) {
        return false
      }
      if (filtroEstado === 'completadas' && c.status !== 'COMPLETADA') return false

      if (terminos.length === 0) return true

      const textoBuscable = [
        c.patient.firstName,
        c.patient.lastName,
        c.patient.expedienteNumber,
        c.patient.cedula,
        c.patient.phone,
        c.chiefComplaint,
        c.diagnosis,
        c.doctorName,
      ]
        .map(normalizar)
        .join(' ')

      return terminos.every((t) => textoBuscable.includes(t))
    })
  }, [consultas, filtroEstado, busqueda])

  const defaultFechaHora = new Date().toISOString().slice(0, 16)

  const handleCambiarEstado = async (id: string, estado: string) => {
    setActualizandoId(id)
    try {
      const res = await cambiarEstadoConsulta(id, estado)
      if (!res.ok) {
        setMensaje({ tipo: 'error', texto: res.error ?? 'No se pudo cambiar el estado.' })
      } else {
        router.refresh()
      }
    } finally {
      setActualizandoId(null)
    }
  }

  const handleCrearConsulta = async (formData: FormData) => {
    setEnviando(true)
    setMensaje(null)
    try {
      const res = await crearConsulta(formData)
      if (!res.ok) {
        setMensaje({ tipo: 'error', texto: res.error ?? 'No se pudo registrar la consulta.' })
        return
      }
      setMostrarFormulario(false)
      setNombreNuevo('')
      setApellidoNuevo('')
      if (abrirAlCrear && res.consultationId) {
        router.push(`/dashboard/consultas/${res.consultationId}`)
      } else {
        setMensaje({ tipo: 'ok', texto: 'Consulta registrada correctamente.' })
        router.refresh()
      }
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* ENCABEZADO DE SERVICIO */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
        <div>
          <p className="text-xs font-semibold text-teal-700 dark:text-teal-400">
            Consulta Externa · {specialty}
          </p>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            {residencyName}
          </h2>
        </div>

        {puedeRegistrar && !suscripcionBloqueada && (
          <button
            type="button"
            onClick={() => setMostrarFormulario((v) => !v)}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-lg text-sm font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            {mostrarFormulario ? 'Cerrar formulario' : '+ Nueva Consulta / Cita'}
          </button>
        )}
      </div>

      {mensaje && (
        <div
          className={`px-4 py-3 rounded-lg border text-sm flex justify-between items-center gap-3 ${
            mensaje.tipo === 'ok'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-300'
              : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/30 dark:border-red-800 dark:text-red-300'
          }`}
        >
          <p className="font-medium">{mensaje.texto}</p>
          <button type="button" onClick={() => setMensaje(null)} className="text-xs opacity-70 cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* FORMULARIO NUEVA CONSULTA */}
      {mostrarFormulario && (
        <form
          action={handleCrearConsulta}
          className="bg-white dark:bg-slate-800 border border-teal-200 dark:border-teal-800 rounded-xl p-5 space-y-5"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Registrar Consulta Externa / Cita
            </h3>
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-700 rounded-lg">
              <button
                type="button"
                onClick={() => setPatientMode('new')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  patientMode === 'new'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                Paciente nuevo
              </button>
              <button
                type="button"
                onClick={() => setPatientMode('existing')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  patientMode === 'existing'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                Paciente existente ({pacientes.length})
              </button>
            </div>
          </div>

          <input type="hidden" name="patientMode" value={patientMode} />

          {patientMode === 'existing' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Seleccionar Paciente *
              </label>
              <select
                name="patientId"
                required
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              >
                <option value="">Elige un paciente de la clínica...</option>
                {pacientes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.firstName} {p.lastName} · Exp: {p.expedienteNumber}
                    {p.phone ? ` · Tel: ${p.phone}` : ''}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nombres *
                </label>
                <input
                  name="firstName"
                  required
                  value={nombreNuevo}
                  onChange={(e) => setNombreNuevo(e.target.value)}
                  placeholder="Ej. María"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Apellidos *
                </label>
                <input
                  name="lastName"
                  required
                  value={apellidoNuevo}
                  onChange={(e) => setApellidoNuevo(e.target.value)}
                  placeholder="Ej. González"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
              {coincidenciasNombre.exacto && (
                <div className="sm:col-span-2 md:col-span-3 px-3.5 py-2.5 rounded-lg border border-teal-300 dark:border-teal-700 bg-teal-50 dark:bg-teal-950/40 text-xs text-teal-950 dark:text-teal-100 flex flex-wrap items-center justify-between gap-2">
                  <span>
                    <strong>Coincidencia exacta encontrada:</strong>{' '}
                    {coincidenciasNombre.exacto.paciente.firstName} {coincidenciasNombre.exacto.paciente.lastName} (Exp: {coincidenciasNombre.exacto.paciente.expedienteNumber}). Al registrar, se vinculará su expediente y se conservarán sus antecedentes y alergias previas.
                  </span>
                  {coincidenciasNombre.exacto.ultimaConsulta && (
                    <Link
                      href={`/dashboard/consultas/${coincidenciasNombre.exacto.ultimaConsulta.id}`}
                      className="font-bold underline shrink-0"
                    >
                      Abrir expediente anterior →
                    </Link>
                  )}
                </div>
              )}

              {!coincidenciasNombre.exacto && coincidenciasNombre.sugerencias.length > 0 && (
                <div className="sm:col-span-2 md:col-span-3 px-3.5 py-2.5 rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 text-xs text-amber-950 dark:text-amber-100 space-y-2">
                  <p className="font-bold">
                    Posibles pacientes registrados con nombre similar (sin distinguir mayúsculas ni acentos):
                  </p>
                  <div className="space-y-1.5">
                    {coincidenciasNombre.sugerencias.map(({ paciente, ultimaConsulta }) => (
                      <div
                        key={paciente.id}
                        className="flex flex-wrap items-center justify-between gap-2 bg-white/80 dark:bg-slate-900/60 border border-amber-200 dark:border-amber-800 rounded-md px-2.5 py-1.5"
                      >
                        <span className="font-medium">
                          <strong>{paciente.firstName} {paciente.lastName}</strong> · Exp: {paciente.expedienteNumber}
                          {paciente.age !== null ? ` · ${paciente.age} años` : ''}
                        </span>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setNombreNuevo(paciente.firstName)
                              setApellidoNuevo(paciente.lastName)
                            }}
                            className="px-2.5 py-1 rounded bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] cursor-pointer"
                          >
                            Vincular este expediente
                          </button>
                          {ultimaConsulta && (
                            <Link
                              href={`/dashboard/consultas/${ultimaConsulta.id}`}
                              className="font-bold underline text-[11px]"
                            >
                              Abrir anterior →
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Edad
                </label>
                <input
                  name="age"
                  type="number"
                  min={0}
                  max={120}
                  placeholder="Ej. 38"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Sexo *
                </label>
                <select
                  name="sex"
                  required
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                >
                  <option value="Femenino">Femenino</option>
                  <option value="Masculino">Masculino</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Teléfono
                </label>
                <input
                  name="phone"
                  placeholder="Ej. 809-555-0102"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Cédula / ID (Opcional)
                </label>
                <input
                  name="cedula"
                  placeholder="001-0000000-0"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  No. Expediente (Opcional)
                </label>
                <input
                  name="expedienteNumber"
                  placeholder="Automático si se deja vacío"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Alergias iniciales
                </label>
                <select
                  name="alergiasEstado"
                  defaultValue="no_evaluada"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                >
                  <option value="no_evaluada">No evaluadas aún</option>
                  <option value="sin_alergias">Niega alergias conocidas</option>
                </select>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-slate-200 dark:border-slate-700">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Fecha y Hora *
              </label>
              <input
                name="consultationDate"
                type="datetime-local"
                defaultValue={defaultFechaHora}
                required
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tipo de Visita
              </label>
              <select
                name="visitType"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              >
                <option value="Primera vez">Primera vez</option>
                <option value="Seguimiento">Seguimiento</option>
                <option value="Control de resultados">Control de resultados</option>
                <option value="Urgencia ambulatoria">Urgencia ambulatoria</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Estado inicial
              </label>
              <select
                name="initialStatus"
                defaultValue="EN_SALA"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              >
                <option value="EN_SALA">En sala de espera</option>
                <option value="PROGRAMADA">Cita programada</option>
                <option value="EN_CONSULTA">En consulta ahora</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Médico que atiende
              </label>
              <select
                name="doctorId"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              >
                <option value="">Asignación automática / Por definir</option>
                {doctores.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.fullName}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2 md:col-span-4">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Motivo de Consulta *
              </label>
              <input
                name="chiefComplaint"
                required
                placeholder="Ej. Control de hipertensión arterial, chequeo general, cefalea..."
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <label className="inline-flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={abrirAlCrear}
                onChange={(e) => setAbrirAlCrear(e.target.checked)}
                className="w-4 h-4 rounded"
              />
              Abrir ficha de consulta inmediatamente al guardar
            </label>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMostrarFormulario(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={enviando}
                className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 rounded-lg cursor-pointer"
              >
                {enviando ? 'Guardando...' : 'Registrar Consulta'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* BARRA DE FILTROS Y BÚSQUEDA */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-200/70 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
          {[
            { id: 'hoy', label: `Hoy (${consultasHoy.length})` },
            { id: 'espera', label: `En espera (${enEsperaCount})` },
            { id: 'completadas', label: 'Completadas' },
            { id: 'todas', label: `Todas (${consultas.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFiltroEstado(tab.id as typeof filtroEstado)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                filtroEstado === tab.id
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="🔍 Buscar paciente, expediente, teléfono..."
            className="w-full px-3 py-2 pr-8 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500"
          />
          {busqueda && (
            <button
              type="button"
              onClick={() => setBusqueda('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs px-1.5 cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* LISTA DE CONSULTAS */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl divide-y divide-slate-200 dark:divide-slate-700">
        {filtradas.map((c) => {
          const meta = ESTADO_META[c.status] ?? ESTADO_META.PROGRAMADA
          const procesando = actualizandoId === c.id
          return (
            <div
              key={c.id}
              className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/70 dark:hover:bg-slate-700/30 transition-colors"
            >
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-mono font-semibold text-slate-700 dark:text-slate-200 tabular-nums">
                    {fmtFechaHora(c.consultationDate)}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-medium">{c.visitType}</span>
                  <span aria-hidden="true">·</span>
                  <span className={`px-2 py-0.5 rounded border text-[11px] font-bold ${meta.clase}`}>
                    {meta.label}
                  </span>
                </div>

                <div className="flex flex-wrap items-baseline gap-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {c.patient.firstName} {c.patient.lastName}
                  </h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                    Exp: {c.patient.expedienteNumber}
                    {c.patient.age !== null ? ` · ${c.patient.age} años` : ''}
                    {c.patient.phone ? ` · Tel: ${c.patient.phone}` : ''}
                  </span>
                </div>

                <p className="text-sm text-slate-700 dark:text-slate-200">
                  <span className="font-semibold">Motivo:</span> {c.chiefComplaint}
                </p>

                {c.diagnosis && (
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                    Diagnóstico: {c.diagnosis}
                  </p>
                )}

                {c.doctorName && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Médico: {c.doctorName}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {puedeRegistrar && !suscripcionBloqueada && c.status === 'PROGRAMADA' && (
                  <button
                    type="button"
                    disabled={procesando}
                    onClick={() => handleCambiarEstado(c.id, 'EN_SALA')}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 cursor-pointer whitespace-nowrap"
                  >
                    Pasar a sala
                  </button>
                )}

                <Link
                  href={`/dashboard/consultas/${c.id}`}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                    c.status === 'COMPLETADA'
                      ? 'bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-700 dark:hover:bg-slate-600'
                      : 'bg-teal-600 hover:bg-teal-700 text-white'
                  }`}
                >
                  {c.status === 'COMPLETADA' ? 'Abrir expediente →' : 'Atender consulta →'}
                </Link>

                {puedeRegistrar &&
                  !suscripcionBloqueada &&
                  ['PROGRAMADA', 'EN_SALA'].includes(c.status) && (
                    <button
                      type="button"
                      disabled={procesando}
                      onClick={() => handleCambiarEstado(c.id, 'CANCELADA')}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer"
                    >
                      Cancelar
                    </button>
                  )}
              </div>
            </div>
          )
        })}

        {filtradas.length === 0 && (
          <div className="py-12 px-4 text-center space-y-2">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No hay consultas en esta vista.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Cambia el filtro o registra una nueva cita con el botón superior.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
