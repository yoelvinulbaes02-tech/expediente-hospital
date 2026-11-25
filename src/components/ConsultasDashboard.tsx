'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronDown, ClipboardCopy, FolderArchive, History, PlusCircle, Users } from 'lucide-react'
import {
  TIPOS_CONSULTA_EXTERNA,
  etiquetaRolClinico,
  normalizarTextoClinico,
  type BiopsyRecordItem,
  type OutpatientHemodialysisItem,
} from '@/lib/consultas-auth'
import { cambiarEstadoConsulta, crearConsulta } from '@/app/dashboard/consultas/actions'
import { BiopsiasConsultaPanel } from '@/components/BiopsiasConsultaPanel'
import { HemodialisisConsultaPanel } from '@/components/HemodialisisConsultaPanel'

type ConsultaItem = {
  id: string
  consultationDate: string
  updatedAt: string
  status: string
  consultationType: string
  visitType: string
  chiefComplaint: string
  diagnosis: string | null
  treatmentPlan: string | null
  nextAppointment: string | null
  notes: string | null
  weight: number | null
  weightUnit: string | null
  heightCm: number | null
  doctorId: string | null
  doctorName: string | null
  doctorRole: string | null
  updatedByName?: string | null
  updatedByRole?: string | null
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

type GrupoCerradoPaciente = {
  patient: ConsultaItem['patient']
  consultas: ConsultaItem[]
  textoBusqueda: string
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
    label: 'Firmada y cerrada',
    clase: 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700',
  },
  CANCELADA: {
    label: 'Cancelada',
    clase: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800',
  },
}

function fmtFechaHora(iso: string): string {
  return new Date(iso).toLocaleString('es-DO', {
    timeZone: 'America/Santo_Domingo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function fmtSoloFecha(iso: string): string {
  return new Date(iso).toLocaleDateString('es-DO', {
    timeZone: 'America/Santo_Domingo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function construirResumenSeguimiento(c: {
  treatmentPlan: string | null
  nextAppointment: string | null
  notes: string | null
}): string {
  const partes: string[] = []
  if (c.treatmentPlan?.trim()) {
    partes.push(c.treatmentPlan.trim())
  }
  if (c.nextAppointment) {
    partes.push(`Próxima cita: ${fmtSoloFecha(c.nextAppointment)}`)
  }
  if (c.notes?.trim()) {
    partes.push(`Seguimiento: ${c.notes.trim()}`)
  }
  return partes.join(' · ')
}

export function ConsultasDashboard({
  consultas,
  pacientes,
  doctores,
  residencyName,
  specialty,
  puedeRegistrar,
  suscripcionBloqueada,
  consultaRecienCerrada = false,
  biopsias = [],
  hemodialisis = [],
  historialActividad = [],
  vistaInicial = 'consultas',
}: {
  consultas: ConsultaItem[]
  pacientes: PacienteResumen[]
  doctores: DoctorResumen[]
  residencyName: string
  specialty: string
  puedeRegistrar: boolean
  suscripcionBloqueada: boolean
  consultaRecienCerrada?: boolean
  biopsias?: BiopsyRecordItem[]
  hemodialisis?: OutpatientHemodialysisItem[]
  historialActividad?: Array<{
    id: string
    actorName: string
    actorRole: string
    atIso: string
    que: string
    detalle: string
  }>
  vistaInicial?: 'consultas' | 'biopsias' | 'hemodialisis'
}) {
  const router = useRouter()
  const [areaTab, setAreaTab] = useState<'consultas' | 'biopsias' | 'hemodialisis'>(vistaInicial)
  const [busqueda, setBusqueda] = useState('')
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [patientMode, setPatientMode] = useState<'new' | 'existing'>('new')
  const [selectedExistingId, setSelectedExistingId] = useState('')
  const [nombreNuevo, setNombreNuevo] = useState('')
  const [apellidoNuevo, setApellidoNuevo] = useState('')
  const [consultationTypeInput, setConsultationTypeInput] = useState<string>('Consulta general')
  const [motivoInput, setMotivoInput] = useState('')
  const [visitTypeInput, setVisitTypeInput] = useState('Primera vez')
  const [initialStatusInput, setInitialStatusInput] = useState('EN_SALA')
  const [sourceConsultationId, setSourceConsultationId] = useState('')
  const [abrirAlCrear, setAbrirAlCrear] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [actualizandoId, setActualizandoId] = useState<string | null>(null)

  const cambiarAreaTab = (tab: 'consultas' | 'biopsias' | 'hemodialisis') => {
    setAreaTab(tab)
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      if (tab === 'consultas') {
        url.searchParams.delete('vista')
      } else {
        url.searchParams.set('vista', tab)
      }
      window.history.replaceState(null, '', url.pathname + url.search)
    }
  }

  const biopsiasAgendadasCount = useMemo(
    () => biopsias.filter((b) => b.status === 'agendada').length,
    [biopsias]
  )
  const hemodialisisActivosCount = useMemo(
    () => hemodialisis.filter((h) => h.isActive).length,
    [hemodialisis]
  )
  const [mensaje, setMensaje] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(
    consultaRecienCerrada
      ? {
          tipo: 'ok',
          texto: 'Consulta firmada y cerrada correctamente. Quedó archivada en la carpeta "Expedientes cerrados".',
        }
      : null
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
    const clave = normalizarTextoClinico(`${nombreNuevo} ${apellidoNuevo}`)
    if (!clave || clave.length < 3) {
      return { exacto: null as PacienteResumen | null, sugerencias: [] as PacienteResumen[] }
    }

    const tokens = clave.split(' ').filter(Boolean)
    const exacto =
      nombreNuevo.trim().length > 0 && apellidoNuevo.trim().length > 0
        ? catalogoPacientes.find(
            (p) => normalizarTextoClinico(`${p.firstName} ${p.lastName}`) === clave
          ) ?? null
        : null

    if (exacto) {
      return { exacto, sugerencias: [] }
    }

    const sugerencias = catalogoPacientes
      .filter((p) => {
        const completo = normalizarTextoClinico(`${p.firstName} ${p.lastName}`)
        return tokens.every((t) => completo.includes(t))
      })
      .slice(0, 4)

    return { exacto: null, sugerencias }
  }, [nombreNuevo, apellidoNuevo, catalogoPacientes])

  const pacienteIdParaHistorial =
    patientMode === 'existing'
      ? selectedExistingId
      : coincidenciasNombre.exacto?.id ?? ''

  const expedientesPreviosDelPaciente = useMemo(() => {
    if (!pacienteIdParaHistorial) return []
    return consultas
      .filter((c) => c.patient.id === pacienteIdParaHistorial)
      .sort((a, b) => new Date(b.consultationDate).getTime() - new Date(a.consultationDate).getTime())
  }, [consultas, pacienteIdParaHistorial])

  // 1. CONSULTAS ACTIVAS (Programada, En sala, En consulta) — separadas completamente de las cerradas
  const consultasActivas = useMemo(() => {
    const terminos = normalizarTextoClinico(busqueda).split(/\s+/).filter(Boolean)
    return consultas
      .filter((c) => c.status !== 'COMPLETADA' && c.status !== 'CANCELADA')
      .sort((a, b) => new Date(b.consultationDate).getTime() - new Date(a.consultationDate).getTime())
      .filter((c) => {
        if (terminos.length === 0) return true
        const texto = normalizarTextoClinico(
          [
            c.patient.firstName,
            c.patient.lastName,
            c.patient.expedienteNumber,
            c.patient.cedula,
            c.patient.phone,
            c.consultationType,
            c.chiefComplaint,
            c.diagnosis,
            c.doctorName,
          ].join(' ')
        )
        return terminos.every((t) => texto.includes(t))
      })
  }, [consultas, busqueda])

  // 2. CARPETA "EXPEDIENTES CERRADOS": agrupada por paciente (cada paciente tiene su retraíble con todas sus consultas ordenadas por fecha)
  const cerradosAgrupadosPorPaciente = useMemo(() => {
    const mapa = new Map<string, GrupoCerradoPaciente>()
    const cerradasOrdenadas = consultas
      .filter((c) => c.status === 'COMPLETADA' || c.status === 'CANCELADA')
      .sort((a, b) => new Date(b.consultationDate).getTime() - new Date(a.consultationDate).getTime())

    for (const c of cerradasOrdenadas) {
      const textoExtra = normalizarTextoClinico(
        [c.consultationType, c.chiefComplaint, c.diagnosis, c.treatmentPlan, c.notes, c.doctorName]
          .filter(Boolean)
          .join(' ')
      )
      const existente = mapa.get(c.patient.id)
      if (!existente) {
        const base = normalizarTextoClinico(
          [
            c.patient.firstName,
            c.patient.lastName,
            c.patient.expedienteNumber,
            c.patient.cedula,
            c.patient.phone,
            textoExtra,
          ]
            .filter(Boolean)
            .join(' ')
        )
        mapa.set(c.patient.id, {
          patient: c.patient,
          consultas: [c],
          textoBusqueda: base,
        })
      } else {
        existente.consultas.push(c)
        if (textoExtra) {
          existente.textoBusqueda = `${existente.textoBusqueda} ${textoExtra}`
        }
      }
    }

    const grupos = Array.from(mapa.values())
    const terminos = normalizarTextoClinico(busqueda).split(/\s+/).filter(Boolean)
    if (terminos.length === 0) return grupos
    return grupos.filter((g) => terminos.every((t) => g.textoBusqueda.includes(t)))
  }, [consultas, busqueda])

  const totalCerradosFiltrados = useMemo(
    () => cerradosAgrupadosPorPaciente.reduce((acc, g) => acc + g.consultas.length, 0),
    [cerradosAgrupadosPorPaciente]
  )

  const defaultFechaHora = new Date().toISOString().slice(0, 16)

  const abrirNuevaVisitaConCopia = (patientId: string, consultaOrigen: ConsultaItem) => {
    setAreaTab('consultas')
    setPatientMode('existing')
    setSelectedExistingId(patientId)
    setSourceConsultationId(consultaOrigen.id)
    setConsultationTypeInput(consultaOrigen.consultationType || 'Consulta general')
    setMotivoInput('Control de seguimiento')
    setVisitTypeInput('Seguimiento')
    setInitialStatusInput('EN_CONSULTA')
    setMostrarFormulario(true)
    setMensaje(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

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
      setSelectedExistingId('')
      setConsultationTypeInput('Consulta general')
      setMotivoInput('')
      setVisitTypeInput('Primera vez')
      setInitialStatusInput('EN_SALA')
      setSourceConsultationId('')
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

  const plantillaSeleccionada = expedientesPreviosDelPaciente.find(
    (c) => c.id === sourceConsultationId
  )

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

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl">
            <button
              type="button"
              onClick={() => cambiarAreaTab('consultas')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                areaTab === 'consultas'
                  ? 'bg-teal-600 text-white'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800'
              }`}
            >
              Consultas ({consultasActivas.length})
            </button>
            <button
              type="button"
              onClick={() => cambiarAreaTab('biopsias')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                areaTab === 'biopsias'
                  ? 'bg-teal-600 text-white'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800'
              }`}
            >
              Biopsias ({biopsiasAgendadasCount})
            </button>
            <button
              type="button"
              onClick={() => cambiarAreaTab('hemodialisis')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                areaTab === 'hemodialisis'
                  ? 'bg-teal-600 text-white'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800'
              }`}
            >
              Hemodiálisis ({hemodialisisActivosCount})
            </button>
          </div>

          {areaTab === 'consultas' && puedeRegistrar && !suscripcionBloqueada && (
            <button
              type="button"
              onClick={() => {
                setMostrarFormulario((v) => !v)
                if (mostrarFormulario) {
                  setSourceConsultationId('')
                }
              }}
              className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              {mostrarFormulario ? 'Cerrar formulario' : '+ Nueva Consulta / Cita'}
            </button>
          )}
        </div>
      </div>

      {areaTab === 'biopsias' ? (
        <BiopsiasConsultaPanel
          records={biopsias}
          pacientes={catalogoPacientes}
          puedeRegistrar={puedeRegistrar}
          suscripcionBloqueada={suscripcionBloqueada}
        />
      ) : areaTab === 'hemodialisis' ? (
        <HemodialisisConsultaPanel
          records={hemodialisis}
          pacientes={catalogoPacientes}
          puedeRegistrar={puedeRegistrar}
          suscripcionBloqueada={suscripcionBloqueada}
        />
      ) : (
        <>
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
                onClick={() => {
                  setPatientMode('new')
                  setSourceConsultationId('')
                }}
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
                onClick={() => {
                  setPatientMode('existing')
                  setSourceConsultationId('')
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  patientMode === 'existing'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                Paciente existente ({catalogoPacientes.length})
              </button>
            </div>
          </div>

          <input type="hidden" name="patientMode" value={patientMode} />
          <input type="hidden" name="sourceConsultationId" value={sourceConsultationId} />
          <input type="hidden" name="consultationType" value={consultationTypeInput} />

          {/* RENGLÓN INICIAL: TIPO DE CONSULTA */}
          <div className="rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-950/20 p-3.5 space-y-2">
            <label className="block text-xs font-bold text-teal-900 dark:text-teal-200">
              Tipo de consulta *
            </label>
            <div className="flex flex-wrap gap-2">
              {TIPOS_CONSULTA_EXTERNA.map((tipo) => (
                <button
                  key={tipo}
                  type="button"
                  onClick={() => setConsultationTypeInput(tipo)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer whitespace-nowrap ${
                    consultationTypeInput === tipo
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {tipo}
                </button>
              ))}
            </div>
          </div>

          {patientMode === 'existing' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Seleccionar Paciente *
              </label>
              <select
                name="patientId"
                required
                value={selectedExistingId}
                onChange={(e) => {
                  setSelectedExistingId(e.target.value)
                  setSourceConsultationId('')
                }}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              >
                <option value="">Elige un paciente de la clínica...</option>
                {catalogoPacientes.map((p) => (
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
                  onChange={(e) => {
                    setNombreNuevo(e.target.value)
                    setSourceConsultationId('')
                  }}
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
                  onChange={(e) => {
                    setApellidoNuevo(e.target.value)
                    setSourceConsultationId('')
                  }}
                  placeholder="Ej. González"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              {coincidenciasNombre.exacto && (
                <div className="sm:col-span-2 md:col-span-3 px-3.5 py-2.5 rounded-lg border border-teal-300 dark:border-teal-700 bg-teal-50 dark:bg-teal-950/40 text-xs text-teal-950 dark:text-teal-100">
                  <strong>Coincidencia encontrada:</strong>{' '}
                  {coincidenciasNombre.exacto.firstName} {coincidenciasNombre.exacto.lastName} (Exp:{' '}
                  {coincidenciasNombre.exacto.expedienteNumber}). Se conservarán sus antecedentes y alergias previas.
                </div>
              )}

              {!coincidenciasNombre.exacto && coincidenciasNombre.sugerencias.length > 0 && (
                <div className="sm:col-span-2 md:col-span-3 px-3.5 py-2.5 rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 text-xs text-amber-950 dark:text-amber-100 space-y-2">
                  <p className="font-bold">
                    Posibles pacientes registrados (sin distinguir mayúsculas ni acentos):
                  </p>
                  <div className="space-y-1.5">
                    {coincidenciasNombre.sugerencias.map((pac) => (
                      <div
                        key={pac.id}
                        className="flex flex-wrap items-center justify-between gap-2 bg-white/80 dark:bg-slate-900/60 border border-amber-200 dark:border-amber-800 rounded-md px-2.5 py-1.5"
                      >
                        <span className="font-medium">
                          <strong>
                            {pac.firstName} {pac.lastName}
                          </strong>{' '}
                          · Exp: {pac.expedienteNumber}
                          {pac.age !== null ? ` · ${pac.age} años` : ''}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setNombreNuevo(pac.firstName)
                            setApellidoNuevo(pac.lastName)
                          }}
                          className="px-2.5 py-1 rounded bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] cursor-pointer"
                        >
                          Usar este paciente
                        </button>
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

          {/* COPIA DE DATOS BASE DEL EXPEDIENTE ANTERIOR (SOLO PACIENTE/REGISTRO, ANTECEDENTES Y ANTROPOMETRÍA) */}
          {expedientesPreviosDelPaciente.length > 0 && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/50 p-3.5 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                    Visitas anteriores ({expedientesPreviosDelPaciente.length}) · Ordenadas por fecha
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Solo se copiarán: datos del paciente y registro, antecedentes y antropometría (peso/talla), todos modificables.
                  </p>
                </div>
                {plantillaSeleccionada && (
                  <button
                    type="button"
                    onClick={() => setSourceConsultationId('')}
                    className="text-[11px] font-bold text-red-600 hover:underline cursor-pointer"
                  >
                    ✕ Quitar selección
                  </button>
                )}
              </div>

              <div className="max-h-52 overflow-y-auto space-y-1.5 pr-1">
                {expedientesPreviosDelPaciente.map((prev, idx) => {
                  const seleccionado = sourceConsultationId === prev.id
                  const pesoStr =
                    prev.weight !== null ? `${prev.weight} ${prev.weightUnit ?? 'kg'}` : 'Sin peso'
                  const tallaStr = prev.heightCm !== null ? `${prev.heightCm} cm` : 'Sin talla'
                  return (
                    <div
                      key={prev.id}
                      className={`flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 text-xs ${
                        seleccionado
                          ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/40 dark:border-teal-600'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 dark:text-white tabular-nums">
                          #{idx + 1} · {fmtFechaHora(prev.consultationDate)} ·{' '}
                          <span className="font-normal text-slate-600 dark:text-slate-300">
                            {prev.doctorName || 'Sin médico'}
                            {prev.doctorRole ? ` (${etiquetaRolClinico(prev.doctorRole)})` : ''}
                          </span>
                        </p>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 truncate tabular-nums">
                          Antropometría: {pesoStr} · {tallaStr}
                          {prev.diagnosis ? ` · Dx: ${prev.diagnosis}` : ''}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSourceConsultationId(prev.id)
                          setVisitTypeInput('Seguimiento')
                          setInitialStatusInput('EN_CONSULTA')
                          if (!motivoInput.trim()) {
                            setMotivoInput('Control de seguimiento')
                          }
                        }}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer shrink-0 ${
                          seleccionado
                            ? 'bg-teal-700 text-white'
                            : 'bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-300'
                        }`}
                      >
                        <ClipboardCopy className="w-3 h-3" />
                        <span>{seleccionado ? '✓ Datos base copiados' : 'Copiar datos base'}</span>
                      </button>
                    </div>
                  )
                })}
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
                value={visitTypeInput}
                onChange={(e) => setVisitTypeInput(e.target.value)}
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
                value={initialStatusInput}
                onChange={(e) => setInitialStatusInput(e.target.value)}
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
                value={motivoInput}
                onChange={(e) => setMotivoInput(e.target.value)}
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
                {enviando
                  ? 'Creando...'
                  : plantillaSeleccionada
                    ? 'Crear consulta con datos copiados'
                    : 'Registrar Consulta'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* BARRA DE BÚSQUEDA */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 self-start">
          <Users className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <span className="text-xs font-bold text-slate-900 dark:text-white">
            Consultas activas ({consultasActivas.length})
          </span>
        </div>

        <div className="relative w-full md:w-80">
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="🔍 Buscar paciente, expediente, médico..."
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

      {/* 1. LISTA EXCLUSIVA DE CONSULTAS ACTIVAS */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl divide-y divide-slate-200 dark:divide-slate-700">
        {consultasActivas.map((c) => {
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
                  <span className="font-semibold text-teal-700 dark:text-teal-300">
                    {c.consultationType || 'Consulta general'}
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

                {c.doctorName && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Médico: <strong>{c.doctorName}</strong>
                    {c.doctorRole ? ` (${etiquetaRolClinico(c.doctorRole)})` : ''}
                  </p>
                )}
                {c.updatedByName && (
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 tabular-nums">
                    Última modif.: {c.updatedByName}
                    {c.updatedByRole ? ` (${etiquetaRolClinico(c.updatedByRole)})` : ''} · {fmtFechaHora(c.updatedAt)}
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
                  className="px-3.5 py-2 rounded-lg text-xs font-bold transition-colors whitespace-nowrap bg-teal-600 hover:bg-teal-700 text-white"
                >
                  Atender consulta →
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

        {consultasActivas.length === 0 && (
          <div className="py-10 px-4 text-center space-y-1.5">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No hay consultas activas en este momento.
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Las consultas firmadas y cerradas se archivan automáticamente debajo en &ldquo;Expedientes cerrados&rdquo;.
            </p>
          </div>
        )}
      </div>

      {/* 2. CARPETA SEPARADA: EXPEDIENTES CERRADOS AGRUPADOS EN UN RETRAÍBLE POR PACIENTE */}
      <details className="group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
        <summary className="list-none cursor-pointer px-4 py-3.5 flex flex-wrap items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
          <div className="flex items-center gap-2.5 min-w-0">
            <ChevronDown className="w-4 h-4 text-slate-500 transition-transform group-open:rotate-0 -rotate-90 shrink-0" />
            <FolderArchive className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Expedientes cerrados ({cerradosAgrupadosPorPaciente.length} paciente
                {cerradosAgrupadosPorPaciente.length === 1 ? '' : 's'} · {totalCerradosFiltrados}{' '}
                registro{totalCerradosFiltrados === 1 ? '' : 's'})
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Cada paciente agrupa todos sus expedientes cerrados ordenados por fecha.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 group-open:hidden">
            Abrir carpeta
          </span>
        </summary>

        <div className="border-t border-slate-200 dark:border-slate-700 p-3 md:p-4 space-y-3 bg-slate-50/50 dark:bg-slate-900/30">
          {cerradosAgrupadosPorPaciente.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-6">
              Aún no hay expedientes cerrados que coincidan con la búsqueda.
            </p>
          ) : (
            cerradosAgrupadosPorPaciente.map(({ patient, consultas: listaPaciente }) => {
              const masReciente = listaPaciente[0]
              const planUltimaVisita = masReciente
                ? construirResumenSeguimiento(masReciente)
                : ''
              return (
                <details
                  key={patient.id}
                  className="group/pac bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden"
                >
                  <summary className="list-none cursor-pointer px-4 py-3.5 flex flex-col sm:flex-row sm:items-start justify-between gap-3 hover:bg-slate-50 dark:hover:bg-slate-700/40 [&::-webkit-details-marker]:hidden">
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      <ChevronDown className="w-4 h-4 text-slate-500 transition-transform group-open/pac:rotate-0 -rotate-90 shrink-0 mt-1" />
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-bold text-slate-900 dark:text-white">
                            {patient.firstName} {patient.lastName}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold tabular-nums">
                            {listaPaciente.length} expediente{listaPaciente.length === 1 ? '' : 's'}
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                            Exp: {patient.expedienteNumber}
                            {patient.age !== null ? ` · ${patient.age} años` : ''}
                          </span>
                        </div>

                        {masReciente && (
                          <div className="rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-700/80 px-3 py-2 text-xs space-y-1">
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-600 dark:text-slate-300">
                              <span className="tabular-nums">
                                <strong>Última visita:</strong>{' '}
                                {fmtFechaHora(masReciente.consultationDate)}
                              </span>
                              <span>
                                <strong>Médico que lo vio:</strong>{' '}
                                {masReciente.doctorName || 'Sin asignar'}
                                {masReciente.doctorRole
                                  ? ` (${etiquetaRolClinico(masReciente.doctorRole)})`
                                  : ''}
                              </span>
                            </div>

                            <p className="text-xs text-slate-800 dark:text-slate-100">
                              <strong className="text-emerald-700 dark:text-emerald-400">DX:</strong>{' '}
                              {masReciente.diagnosis?.trim() || 'Sin diagnóstico registrado'}
                            </p>

                            <p className="text-xs text-slate-700 dark:text-slate-200 line-clamp-2 whitespace-pre-line">
                              <strong className="text-teal-700 dark:text-teal-400">
                                Plan de seguimiento:
                              </strong>{' '}
                              {planUltimaVisita || 'Sin plan de seguimiento registrado'}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {puedeRegistrar && !suscripcionBloqueada && masReciente && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          abrirNuevaVisitaConCopia(patient.id, masReciente)
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-300 text-[11px] font-bold cursor-pointer shrink-0 self-start"
                      >
                        <PlusCircle className="w-3.5 h-3.5" />
                        <span>+ Nueva visita</span>
                      </button>
                    )}
                  </summary>

                  <div className="border-t border-slate-200 dark:border-slate-700 divide-y divide-slate-200/80 dark:divide-slate-700/80 bg-slate-50/50 dark:bg-slate-900/40">
                    {listaPaciente.map((c, idx) => {
                      const meta = ESTADO_META[c.status] ?? ESTADO_META.COMPLETADA
                      const planItem = construirResumenSeguimiento(c)
                      return (
                        <div
                          key={c.id}
                          className="px-4 py-3 flex flex-col md:flex-row md:items-start justify-between gap-3"
                        >
                          <div className="min-w-0 space-y-1 flex-1">
                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                              <span className="font-bold text-slate-800 dark:text-slate-100 tabular-nums">
                                #{idx + 1} · {fmtFechaHora(c.consultationDate)}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span className="font-semibold text-teal-700 dark:text-teal-300">
                                {c.consultationType || 'Consulta general'}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span>{c.visitType}</span>
                              <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${meta.clase}`}>
                                {meta.label}
                              </span>
                            </div>

                            <p className="text-[11px] text-slate-600 dark:text-slate-300">
                              <strong>Médico que lo vio:</strong>{' '}
                              {c.doctorName || 'Sin asignar'}
                              {c.doctorRole ? ` (${etiquetaRolClinico(c.doctorRole)})` : ''}
                            </p>

                            <p className="text-xs text-slate-800 dark:text-slate-100">
                              <strong className="text-emerald-700 dark:text-emerald-400">DX:</strong>{' '}
                              {c.diagnosis?.trim() || 'Sin diagnóstico registrado'}
                            </p>

                            <p className="text-xs text-slate-700 dark:text-slate-200 whitespace-pre-wrap">
                              <strong className="text-teal-700 dark:text-teal-400">
                                Plan de seguimiento:
                              </strong>{' '}
                              {planItem || 'Sin plan de seguimiento registrado'}
                            </p>

                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              <strong>Motivo:</strong> {c.chiefComplaint}
                            </p>
                            {c.updatedByName && (
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 tabular-nums">
                                Última modif.: {c.updatedByName}
                                {c.updatedByRole ? ` (${etiquetaRolClinico(c.updatedByRole)})` : ''} · {fmtFechaHora(c.updatedAt)}
                              </p>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-2 shrink-0">
                            <Link
                              href={`/dashboard/consultas/${c.id}`}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-700 dark:hover:bg-slate-600 whitespace-nowrap"
                            >
                              Ver expediente →
                            </Link>
                            {puedeRegistrar && !suscripcionBloqueada && (
                              <button
                                type="button"
                                onClick={() => abrirNuevaVisitaConCopia(patient.id, c)}
                                title="Abre nueva visita copiando únicamente datos del paciente, antecedentes y antropometría"
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-300 cursor-pointer whitespace-nowrap"
                              >
                                <ClipboardCopy className="w-3 h-3" />
                                <span>+ Nueva visita</span>
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </details>
              )
            })
          )}
        </div>
      </details>
        </>
      )}

      {historialActividad.length > 0 && (
        <details className="group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
          <summary className="list-none cursor-pointer px-4 py-3 flex items-center justify-between gap-2 hover:bg-slate-50/70 dark:hover:bg-slate-700/30 [&::-webkit-details-marker]:hidden">
            <span className="inline-flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-100">
              <ChevronDown className="w-4 h-4 text-slate-500 transition-transform group-open:rotate-0 -rotate-90 shrink-0" />
              <History className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
              <span>
                Historial reciente de modificaciones · Consultas, Biopsias y Hemodiálisis ({historialActividad.length})
              </span>
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 group-open:hidden">
              Ver registro
            </span>
          </summary>
          <div className="border-t border-slate-200 dark:border-slate-700 max-h-72 overflow-y-auto divide-y divide-slate-200 dark:divide-slate-700 bg-slate-50/50 dark:bg-slate-900/30">
            {historialActividad.map((item) => (
              <div key={item.id} className="px-4 py-2.5 text-xs space-y-0.5">
                <div className="flex flex-wrap items-center justify-between gap-2 text-slate-600 dark:text-slate-300 tabular-nums">
                  <span>
                    <strong className="text-slate-900 dark:text-white">{item.actorName}</strong> (
                    {etiquetaRolClinico(item.actorRole)})
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {fmtFechaHora(item.atIso)}
                  </span>
                </div>
                <p className="font-semibold text-slate-800 dark:text-slate-100">{item.que}</p>
                {item.detalle && (
                  <p className="text-[11px] text-slate-600 dark:text-slate-300">{item.detalle}</p>
                )}
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}
