'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  FileText,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  X,
} from 'lucide-react'
import {
  AGUJA_BIOPSIA,
  ANALITICAS_BIOPSIA,
  ARS_BIOPSIA,
  KIT_BIOPSIA,
  etiquetaRolClinico,
  normalizarTextoClinico,
  type BiopsyRecordItem,
} from '@/lib/consultas-auth'
import {
  actualizarBiopsiaConsulta,
  crearBiopsiaConsulta,
  marcarBiopsiaRealizada,
  reabrirBiopsiaAgendada,
} from '@/app/dashboard/consultas/actions'

type PacienteResumen = {
  id: string
  firstName: string
  lastName: string
  expedienteNumber: string
  age: number | null
  sex: string
  phone: string | null
}

function parseLabsStatus(raw?: string | null): {
  status: 'Completo' | 'Pendiente'
  detail: string
} {
  const val = (raw ?? '').trim()
  const lower = val.toLowerCase()
  if (lower === 'completo' || lower === 'listo') {
    return { status: 'Completo', detail: '' }
  }
  if (lower.startsWith('pendiente:')) {
    return { status: 'Pendiente', detail: val.slice('pendiente:'.length).trim() }
  }
  if (lower && lower !== 'pendiente') {
    return { status: 'Pendiente', detail: val }
  }
  return { status: 'Pendiente', detail: '' }
}

function fmtFechaHora(iso?: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleString('es-DO', {
    timeZone: 'America/Santo_Domingo',
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function EditBiopsiaAgendadaForm({
  item,
  isPending,
  onSubmit,
  onCancel,
}: {
  item: BiopsyRecordItem
  isPending: boolean
  onSubmit: (formData: FormData) => void
  onCancel: () => void
}) {
  const parsedLabs = parseLabsStatus(item.labsStatus)
  const [labsStatus, setLabsStatus] = useState<'Completo' | 'Pendiente'>(parsedLabs.status)
  const [labsDetail, setLabsDetail] = useState(parsedLabs.detail)
  const needleEsLegacy =
    Boolean(item.needleStatus) &&
    !AGUJA_BIOPSIA.includes(item.needleStatus as (typeof AGUJA_BIOPSIA)[number])
  const arsEsLegacy =
    Boolean(item.senasaAuth) &&
    !ARS_BIOPSIA.includes(item.senasaAuth as (typeof ARS_BIOPSIA)[number])

  return (
    <form
      action={onSubmit}
      className="space-y-3 bg-white dark:bg-slate-900 p-3 rounded-lg border border-blue-200 dark:border-blue-800"
    >
      <input type="hidden" name="id" value={item.id} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        <div>
          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Nombre *</label>
          <input
            name="patientName"
            required
            defaultValue={item.patientName}
            className="w-full px-2 py-1.5 border rounded text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Teléfono</label>
          <input
            name="phone"
            defaultValue={item.phone ?? ''}
            className="w-full px-2 py-1.5 border rounded text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white tabular-nums"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Analíticas</label>
          <select
            name="labsStatus"
            value={labsStatus}
            onChange={(e) => {
              const next = e.target.value === 'Completo' ? 'Completo' : 'Pendiente'
              setLabsStatus(next)
              if (next === 'Completo') setLabsDetail('')
            }}
            className="w-full px-2 py-1.5 border rounded text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            {ANALITICAS_BIOPSIA.map((op) => (
              <option key={op} value={op}>
                {op}
              </option>
            ))}
          </select>
        </div>
        {labsStatus === 'Pendiente' && (
          <div>
            <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
              ¿Qué está pendiente? *
            </label>
            <input
              name="labsPendingDetail"
              required
              value={labsDetail}
              onChange={(e) => setLabsDetail(e.target.value)}
              placeholder="Ej. Urocultivo, TP/TPT, Hb..."
              className="w-full px-2 py-1.5 border rounded text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
        )}
        <div>
          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Aguja</label>
          <select
            name="needleStatus"
            defaultValue={item.needleStatus ?? 'Utilizar la del centro'}
            className="w-full px-2 py-1.5 border rounded text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            {needleEsLegacy && item.needleStatus && (
              <option value={item.needleStatus}>{item.needleStatus}</option>
            )}
            {AGUJA_BIOPSIA.map((op) => (
              <option key={op} value={op}>
                {op}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Kit</label>
          <select
            name="kitStatus"
            defaultValue={item.kitStatus ?? 'Pendiente'}
            className="w-full px-2 py-1.5 border rounded text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            {KIT_BIOPSIA.map((op) => (
              <option key={op} value={op}>
                {op}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Cita</label>
          <input
            name="scheduledDate"
            defaultValue={item.scheduledDate ?? ''}
            className="w-full px-2 py-1.5 border rounded text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white tabular-nums"
          />
        </div>
        <div>
          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
            Autorización de ARS
          </label>
          <select
            name="senasaAuth"
            defaultValue={item.senasaAuth ?? 'Pendiente'}
            className="w-full px-2 py-1.5 border rounded text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            {arsEsLegacy && item.senasaAuth && (
              <option value={item.senasaAuth}>{item.senasaAuth}</option>
            )}
            {ARS_BIOPSIA.map((op) => (
              <option key={op} value={op}>
                {op}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Nota</label>
        <textarea
          name="note"
          rows={2}
          defaultValue={item.note ?? ''}
          className="w-full px-2 py-1.5 border rounded text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
        />
      </div>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1 border rounded text-xs font-semibold text-slate-600 cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold cursor-pointer"
        >
          Guardar cambios
        </button>
      </div>
    </form>
  )
}

export function BiopsiasConsultaPanel({
  records,
  pacientes,
  puedeRegistrar,
  suscripcionBloqueada,
}: {
  records: BiopsyRecordItem[]
  pacientes: PacienteResumen[]
  puedeRegistrar: boolean
  suscripcionBloqueada: boolean
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [busqueda, setBusqueda] = useState('')
  const [mostrarNuevo, setMostrarNuevo] = useState(false)
  const [selectedPatientId, setSelectedPatientId] = useState('')
  const [nuevoNombre, setNuevoNombre] = useState('')
  const [nuevoTelefono, setNuevoTelefono] = useState('')
  const [nuevoLabsStatus, setNuevoLabsStatus] = useState<'Completo' | 'Pendiente'>('Pendiente')
  const [nuevoLabsDetalle, setNuevoLabsDetalle] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [realizarId, setRealizarId] = useState<string | null>(null)
  const [mensaje, setMensaje] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null)

  const puedeEditar = puedeRegistrar && !suscripcionBloqueada

  const filtrados = useMemo(() => {
    const tokens = normalizarTextoClinico(busqueda).split(/\s+/).filter(Boolean)
    if (tokens.length === 0) return records
    return records.filter((r) => {
      const txt = normalizarTextoClinico(
        [
          r.patientName,
          r.phone,
          r.labsStatus,
          r.needleStatus,
          r.kitStatus,
          r.scheduledDate,
          r.senasaAuth,
          r.note,
          r.performedDate,
          r.complications,
          r.report,
        ]
          .filter(Boolean)
          .join(' ')
      )
      return tokens.every((t) => txt.includes(t))
    })
  }, [records, busqueda])

  const agendadas = useMemo(
    () => filtrados.filter((r) => r.status === 'agendada'),
    [filtrados]
  )
  const realizadas = useMemo(
    () => filtrados.filter((r) => r.status === 'realizada'),
    [filtrados]
  )

  const handleSelectPaciente = (pid: string) => {
    setSelectedPatientId(pid)
    const found = pacientes.find((p) => p.id === pid)
    if (found) {
      setNuevoNombre(`${found.firstName} ${found.lastName}`.trim())
      setNuevoTelefono(found.phone ?? '')
    }
  }

  const handleCrear = (formData: FormData) => {
    setMensaje(null)
    startTransition(async () => {
      const res = await crearBiopsiaConsulta(formData)
      if (!res.ok) {
        setMensaje({ tipo: 'error', texto: res.error ?? 'Error al agendar la biopsia.' })
        return
      }
      setMostrarNuevo(false)
      setSelectedPatientId('')
      setNuevoNombre('')
      setNuevoTelefono('')
      setNuevoLabsStatus('Pendiente')
      setNuevoLabsDetalle('')
      setMensaje({ tipo: 'ok', texto: 'Paciente agregado a la Agenda de Biopsia.' })
      router.refresh()
    })
  }

  const handleActualizar = (formData: FormData) => {
    setMensaje(null)
    startTransition(async () => {
      const res = await actualizarBiopsiaConsulta(formData)
      if (!res.ok) {
        setMensaje({ tipo: 'error', texto: res.error ?? 'Error al actualizar el registro.' })
        return
      }
      setEditId(null)
      setMensaje({ tipo: 'ok', texto: 'Registro de biopsia actualizado.' })
      router.refresh()
    })
  }

  const handleMarcarRealizada = (formData: FormData) => {
    setMensaje(null)
    startTransition(async () => {
      const res = await marcarBiopsiaRealizada(formData)
      if (!res.ok) {
        setMensaje({ tipo: 'error', texto: res.error ?? 'Error al registrar resultado.' })
        return
      }
      setRealizarId(null)
      setMensaje({ tipo: 'ok', texto: 'Biopsia registrada en el listado de Realizadas.' })
      router.refresh()
    })
  }

  const handleReabrir = (id: string) => {
    setMensaje(null)
    const fd = new FormData()
    fd.set('id', id)
    startTransition(async () => {
      const res = await reabrirBiopsiaAgendada(fd)
      if (!res.ok) {
        setMensaje({ tipo: 'error', texto: res.error ?? 'Error al reabrir registro.' })
        return
      }
      setMensaje({ tipo: 'ok', texto: 'Registro devuelto a la Agenda de Biopsia.' })
      router.refresh()
    })
  }

  return (
    <div className="space-y-5">
      {/* BARRA SUPERIOR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarClock className="w-4 h-4 text-teal-600" />
            <span>Agenda y Resultados de Biopsias</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Seguimiento de pacientes agendados (analíticas, aguja, kit, cita, autorización de ARS) y reporte posterior de biopsias realizadas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-52">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar paciente, teléfono, reporte..."
              className="w-full pl-8 pr-8 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500"
            />
            {busqueda && (
              <button
                type="button"
                onClick={() => setBusqueda('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {puedeEditar && (
            <button
              type="button"
              onClick={() => setMostrarNuevo((v) => !v)}
              className="inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white px-3.5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{mostrarNuevo ? 'Cerrar' : 'Agendar Biopsia'}</span>
            </button>
          )}
        </div>
      </div>

      {mensaje && (
        <div
          className={`px-4 py-2.5 rounded-lg border text-xs flex justify-between items-center gap-2 ${
            mensaje.tipo === 'ok'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-200'
              : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/30 dark:border-red-800 dark:text-red-200'
          }`}
        >
          <span className="font-semibold">{mensaje.texto}</span>
          <button type="button" onClick={() => setMensaje(null)} className="cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* FORMULARIO AGENDAR NUEVA BIOPSIA */}
      {mostrarNuevo && puedeEditar && (
        <form
          action={handleCrear}
          className="bg-white dark:bg-slate-800 border border-teal-200 dark:border-teal-800 rounded-xl p-4 sm:p-5 space-y-4"
        >
          <h4 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">
            Agendar Paciente en Biopsia
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Vincular paciente existente (Opcional)
              </label>
              <select
                name="patientId"
                value={selectedPatientId}
                onChange={(e) => handleSelectPaciente(e.target.value)}
                className="w-full px-2.5 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              >
                <option value="">-- Ingresar manualmente --</option>
                {pacientes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.firstName} {p.lastName} · Exp: {p.expedienteNumber}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nombre del Paciente *
              </label>
              <input
                name="patientName"
                required
                value={nuevoNombre}
                onChange={(e) => setNuevoNombre(e.target.value)}
                placeholder="Nombre completo"
                className="w-full px-2.5 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Teléfono
              </label>
              <input
                name="phone"
                value={nuevoTelefono}
                onChange={(e) => setNuevoTelefono(e.target.value)}
                placeholder="Ej. 809-000-0000 o PEND"
                className="w-full px-2.5 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white tabular-nums"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Analíticas
              </label>
              <select
                name="labsStatus"
                value={nuevoLabsStatus}
                onChange={(e) => {
                  const next = e.target.value === 'Completo' ? 'Completo' : 'Pendiente'
                  setNuevoLabsStatus(next)
                  if (next === 'Completo') setNuevoLabsDetalle('')
                }}
                className="w-full px-2.5 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              >
                {ANALITICAS_BIOPSIA.map((op) => (
                  <option key={op} value={op}>
                    {op}
                  </option>
                ))}
              </select>
            </div>

            {nuevoLabsStatus === 'Pendiente' && (
              <div className="md:col-span-2">
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Especificar qué analíticas están pendientes *
                </label>
                <input
                  name="labsPendingDetail"
                  required
                  value={nuevoLabsDetalle}
                  onChange={(e) => setNuevoLabsDetalle(e.target.value)}
                  placeholder="Ej. Urocultivo, TP/TPT, plaquetas, serología..."
                  className="w-full px-2.5 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Aguja
              </label>
              <select
                name="needleStatus"
                defaultValue="Utilizar la del centro"
                className="w-full px-2.5 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              >
                {AGUJA_BIOPSIA.map((op) => (
                  <option key={op} value={op}>
                    {op}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Kit
              </label>
              <select
                name="kitStatus"
                defaultValue="Pendiente"
                className="w-full px-2.5 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              >
                {KIT_BIOPSIA.map((op) => (
                  <option key={op} value={op}>
                    {op}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Cita (Fecha o estado)
              </label>
              <input
                name="scheduledDate"
                defaultValue="Pendiente"
                placeholder="Ej. 03/12/2026 o Pendiente"
                className="w-full px-2.5 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white tabular-nums"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                Autorización de ARS
              </label>
              <select
                name="senasaAuth"
                defaultValue="Pendiente"
                className="w-full px-2.5 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              >
                {ARS_BIOPSIA.map((op) => (
                  <option key={op} value={op}>
                    {op}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
              Nota clínica / administrativa
            </label>
            <textarea
              name="note"
              rows={2}
              placeholder="Ej. Pendiente TAC abdomino-pélvica, confirmar urocultivo negativo, avisar a administración..."
              className="w-full px-2.5 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setMostrarNuevo(false)}
              className="px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold cursor-pointer"
            >
              {isPending ? 'Guardando...' : 'Guardar en Agenda'}
            </button>
          </div>
        </form>
      )}

      {/* 1. AGENDA DE BIOPSIA (AGENDADOS) - RETRAÍBLE */}
      <details className="group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
        <summary className="list-none cursor-pointer px-4 py-3 flex items-center justify-between gap-2 bg-slate-50 dark:bg-slate-900/50 group-open:border-b border-slate-200 dark:border-slate-700 [&::-webkit-details-marker]:hidden">
          <div className="flex items-center gap-2">
            <ChevronDown className="w-4 h-4 text-slate-500 transition-transform group-open:rotate-0 -rotate-90" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Agenda de Biopsia (Pacientes Agendados)
            </h4>
            <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200 text-xs font-bold tabular-nums">
              {agendadas.length}
            </span>
          </div>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 group-open:hidden">
            Expandir
          </span>
        </summary>

        {agendadas.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400">
            No hay pacientes agendados para biopsia con el filtro actual.
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {agendadas.map((item) => {
              const editando = editId === item.id
              const marcandoRealizada = realizarId === item.id
              return (
                <div key={item.id} className="p-3.5 sm:p-4 space-y-3 bg-white dark:bg-slate-800">
                  {editando ? (
                    <EditBiopsiaAgendadaForm
                      item={item}
                      isPending={isPending}
                      onSubmit={handleActualizar}
                      onCancel={() => setEditId(null)}
                    />
                  ) : (
                    <>
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 flex-1 text-xs">
                          <div>
                            <span className="block text-[10px] font-bold uppercase text-slate-400">
                              Nombre
                            </span>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {item.patientName}
                            </span>
                          </div>
                          <div>
                            <span className="block text-[10px] font-bold uppercase text-slate-400">
                              Teléfono
                            </span>
                            <span className="text-slate-700 dark:text-slate-200 tabular-nums">
                              {item.phone || 'PEND'}
                            </span>
                          </div>
                          <div>
                            <span className="block text-[10px] font-bold uppercase text-slate-400">
                              Analíticas
                            </span>
                            <span className="font-semibold text-slate-800 dark:text-slate-100">
                              {item.labsStatus || 'Pendiente'}
                            </span>
                          </div>
                          <div>
                            <span className="block text-[10px] font-bold uppercase text-slate-400">
                              Aguja
                            </span>
                            <span className="text-slate-700 dark:text-slate-200">
                              {item.needleStatus || '—'}
                            </span>
                          </div>
                          <div>
                            <span className="block text-[10px] font-bold uppercase text-slate-400">
                              Kit
                            </span>
                            <span
                              className={`font-bold ${
                                item.kitStatus === 'Listo'
                                  ? 'text-emerald-700 dark:text-emerald-400'
                                  : 'text-amber-700 dark:text-amber-400'
                              }`}
                            >
                              {item.kitStatus || 'Pendiente'}
                            </span>
                          </div>
                          <div>
                            <span className="block text-[10px] font-bold uppercase text-slate-400">
                              Cita
                            </span>
                            <span className="font-semibold text-slate-800 dark:text-slate-100 tabular-nums">
                              {item.scheduledDate || 'Pendiente'}
                            </span>
                          </div>
                          <div>
                            <span className="block text-[10px] font-bold uppercase text-slate-400">
                              ARS
                            </span>
                            <span className="text-slate-800 dark:text-slate-100">
                              {item.senasaAuth || 'Pendiente'}
                            </span>
                          </div>
                        </div>

                        {puedeEditar && (
                          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setEditId(item.id)
                                setRealizarId(null)
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 cursor-pointer"
                            >
                              <Pencil className="w-3 h-3" />
                              <span>Editar</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setRealizarId(marcandoRealizada ? null : item.id)
                                setEditId(null)
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Realizada</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {item.note && (
                        <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-700 rounded-lg px-2.5 py-1.5">
                          <strong>Nota:</strong> {item.note}
                        </p>
                      )}

                      <p className="text-[10px] text-slate-400 tabular-nums">
                        Registrado por {item.createdByName} ({etiquetaRolClinico(item.createdByRole)}) ·{' '}
                        {fmtFechaHora(item.createdAt)}
                        {item.updatedByName && item.updatedAt
                          ? ` · Editado por ${item.updatedByName}${
                              item.updatedByRole
                                ? ` (${etiquetaRolClinico(item.updatedByRole)})`
                                : ''
                            } · ${fmtFechaHora(item.updatedAt)}`
                          : ''}
                      </p>

                      {marcandoRealizada && puedeEditar && (
                        <form
                          action={handleMarcarRealizada}
                          className="bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3 space-y-2.5"
                        >
                          <input type="hidden" name="id" value={item.id} />
                          <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                            Registrar Biopsia Realizada y Resultados
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            <div>
                              <label className="block text-[10px] font-bold text-emerald-900 dark:text-emerald-200 mb-0.5">
                                Fecha de realización *
                              </label>
                              <input
                                name="performedDate"
                                required
                                defaultValue={new Date().toLocaleDateString('es-DO', {
                                  timeZone: 'America/Santo_Domingo',
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: '2-digit',
                                })}
                                placeholder="Ej. 25/11/26"
                                className="w-full px-2.5 py-1.5 border rounded text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white tabular-nums"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-emerald-900 dark:text-emerald-200 mb-0.5">
                                Complicaciones
                              </label>
                              <input
                                name="complications"
                                defaultValue="Ninguna"
                                placeholder="Ej. Ninguna, Hematoma pericapsular..."
                                className="w-full px-2.5 py-1.5 border rounded text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-emerald-900 dark:text-emerald-200 mb-0.5">
                              Reporte (Preliminar / Histopatológico definitivo)
                            </label>
                            <textarea
                              name="report"
                              rows={2}
                              placeholder="Ej. Nefritis lúpica clase V / Lesión tubular aguda focal..."
                              className="w-full px-2.5 py-1.5 border rounded text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setRealizarId(null)}
                              className="px-3 py-1 border border-slate-300 rounded text-xs font-semibold text-slate-600 bg-white cursor-pointer"
                            >
                              Cancelar
                            </button>
                            <button
                              type="submit"
                              disabled={isPending}
                              className="px-3.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold cursor-pointer"
                            >
                              {isPending ? 'Guardando...' : 'Pasar a Realizadas'}
                            </button>
                          </div>
                        </form>
                      )}
                    </>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </details>

      {/* 2. LISTADO DE BIOPSIAS REALIZADAS - RETRAÍBLE */}
      <details className="group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
        <summary className="list-none cursor-pointer px-4 py-3 flex items-center justify-between gap-2 bg-teal-50/70 dark:bg-teal-950/30 group-open:border-b border-slate-200 dark:border-slate-700 [&::-webkit-details-marker]:hidden">
          <div className="flex items-center gap-2">
            <ChevronDown className="w-4 h-4 text-teal-700 transition-transform group-open:rotate-0 -rotate-90" />
            <FileText className="w-4 h-4 text-teal-700 dark:text-teal-400" />
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              Listado de Biopsias Realizadas (Resultados)
            </h4>
            <span className="px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-900/50 border border-teal-200 dark:border-teal-800 text-teal-900 dark:text-teal-200 text-xs font-bold tabular-nums">
              {realizadas.length}
            </span>
          </div>
          <span className="text-xs font-medium text-teal-700 dark:text-teal-400 group-open:hidden">
            Expandir
          </span>
        </summary>

        {realizadas.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400">
            Aún no hay biopsias realizadas registradas con resultados.
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {realizadas.map((item) => {
              const editando = editId === item.id
              return (
                <div key={item.id} className="p-3.5 sm:p-4 space-y-2.5 bg-white dark:bg-slate-800">
                  {editando ? (
                    <form
                      action={handleActualizar}
                      className="space-y-3 bg-slate-50 dark:bg-slate-900 p-3 rounded-lg border border-teal-200 dark:border-teal-800"
                    >
                      <input type="hidden" name="id" value={item.id} />
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                            Nombre *
                          </label>
                          <input
                            name="patientName"
                            required
                            defaultValue={item.patientName}
                            className="w-full px-2 py-1.5 border rounded text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                            Teléfono
                          </label>
                          <input
                            name="phone"
                            defaultValue={item.phone ?? ''}
                            className="w-full px-2 py-1.5 border rounded text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white tabular-nums"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                            Fecha de realización
                          </label>
                          <input
                            name="performedDate"
                            defaultValue={item.performedDate ?? ''}
                            className="w-full px-2 py-1.5 border rounded text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white tabular-nums"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                            Complicaciones
                          </label>
                          <input
                            name="complications"
                            defaultValue={item.complications ?? ''}
                            className="w-full px-2 py-1.5 border rounded text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                          Reporte Histopatológico / Preliminar
                        </label>
                        <textarea
                          name="report"
                          rows={3}
                          defaultValue={item.report ?? ''}
                          className="w-full px-2 py-1.5 border rounded text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditId(null)}
                          className="px-3 py-1 border rounded text-xs font-semibold text-slate-600 cursor-pointer"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={isPending}
                          className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded text-xs font-bold cursor-pointer"
                        >
                          Guardar cambios
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 flex-1 text-xs">
                          <div>
                            <span className="block text-[10px] font-bold uppercase text-slate-400">
                              Nombre
                            </span>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {item.patientName}
                            </span>
                          </div>
                          <div>
                            <span className="block text-[10px] font-bold uppercase text-slate-400">
                              Teléfono
                            </span>
                            <span className="text-slate-700 dark:text-slate-200 tabular-nums">
                              {item.phone || '—'}
                            </span>
                          </div>
                          <div>
                            <span className="block text-[10px] font-bold uppercase text-slate-400">
                              Fecha de realización
                            </span>
                            <span className="font-bold text-teal-800 dark:text-teal-300 tabular-nums">
                              {item.performedDate || '—'}
                            </span>
                          </div>
                          <div>
                            <span className="block text-[10px] font-bold uppercase text-slate-400">
                              Complicaciones
                            </span>
                            <span
                              className={`font-semibold ${
                                item.complications &&
                                !item.complications.toLowerCase().includes('ninguna')
                                  ? 'text-amber-800 dark:text-amber-300'
                                  : 'text-slate-800 dark:text-slate-100'
                              }`}
                            >
                              {item.complications || 'Ninguna'}
                            </span>
                          </div>
                        </div>

                        {puedeEditar && (
                          <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => setEditId(item.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 cursor-pointer"
                            >
                              <Pencil className="w-3 h-3" />
                              <span>Editar</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReabrir(item.id)}
                              disabled={isPending}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold cursor-pointer"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Volver a Agenda</span>
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs text-slate-800 dark:text-slate-100 whitespace-pre-wrap">
                        <strong className="text-teal-700 dark:text-teal-400">Reporte: </strong>
                        {item.report?.trim() || 'Pendiente de reporte histopatológico.'}
                      </div>

                      <p className="text-[10px] text-slate-400 tabular-nums">
                        Realizada registrada por {item.performedByName || item.createdByName} (
                        {etiquetaRolClinico(item.performedByRole || item.createdByRole)})
                        {item.performedAt ? ` · ${fmtFechaHora(item.performedAt)}` : ''}
                        {item.updatedByName && item.updatedAt
                          ? ` · Última modificación: ${item.updatedByName}${
                              item.updatedByRole
                                ? ` (${etiquetaRolClinico(item.updatedByRole)})`
                                : ''
                            } · ${fmtFechaHora(item.updatedAt)}`
                          : ''}
                      </p>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </details>
    </div>
  )
}
