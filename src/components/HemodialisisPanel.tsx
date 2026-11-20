'use client'

import { useMemo, useState, useSyncExternalStore, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Activity,
  BellRing,
  CalendarClock,
  Check,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Clock,
  FlaskConical,
  History,
  Pencil,
  Pill,
  Plus,
  RotateCcw,
  Search,
  Syringe,
  X,
} from 'lucide-react'
import {
  crearItemHemodialisis,
  editarItemHemodialisis,
  reactivarItemHemodialisis,
  registrarDosisHemodialisis,
  resolverItemHemodialisis,
} from '@/app/dashboard/actions-servicio'

export type SeccionHd = 'novedad' | 'predialisis' | 'antibiotico' | 'cultivo' | 'nota'

export type HemodialisisItemData = {
  id: string
  section: SeccionHd
  patientName: string
  title: string
  details: string | null
  shiftLabel: string | null
  eventDate: string | null
  durationDays: number | null
  isPriority: boolean
  isActive: boolean
  resolutionNote: string | null
  lastCheckAt: string | null
  lastCheckBy: string | null
  lastCheckByName: string | null
  lastCheckByRole: string | null
  createdBy: string
  createdByName: string
  createdByRole: string
  createdAt: string
  updatedBy: string | null
  updatedByName: string | null
  updatedByRole: string | null
  updatedAt: string | null
  resolvedBy: string | null
  resolvedByName: string | null
  resolvedByRole: string | null
  resolvedAt: string | null
}

const ETIQUETAS_ROL: Record<string, string> = {
  SUPERADMIN: 'Plataforma',
  ADMIN: 'Admin',
  DOCTOR: 'Médico',
  RESIDENT: 'Residente',
  NURSE: 'Enfermería',
  LAB: 'Laboratorio',
  READONLY: 'Lectura',
}

const ETIQUETAS_SECCION: Record<SeccionHd, string> = {
  novedad: 'Guardia / Novedad',
  predialisis: 'Pre Diálisis',
  antibiotico: 'Antibiótico',
  cultivo: 'Cultivo',
  nota: 'Nota / Recordatorio',
}

const PRESETS_CULTIVO = [
  'Hemocultivo central y periférico',
  'Hemocultivo periférico',
  'Hemocultivo central',
  'Urocultivo',
  'Líquido peritoneal (DP)',
  'Punta de catéter',
  'Cultivo de secreción / herida',
] as const

const STORAGE_KEYS = {
  novedad: 'nexo_hd_novedades_open',
  predialisis: 'nexo_hd_predialisis_open',
  antibiotico: 'nexo_hd_antibioticos_open',
  cultivo: 'nexo_hd_cultivos_open',
  nota: 'nexo_hd_notas_open',
  historial: 'nexo_hd_historial_open',
} as const

const PANEL_EVENT = 'nexo:hd-panel-toggle'

function suscribirPanel(cb: () => void) {
  if (typeof window === 'undefined') return () => {}
  const handler = () => cb()
  window.addEventListener('storage', handler)
  window.addEventListener(PANEL_EVENT, handler)
  return () => {
    window.removeEventListener('storage', handler)
    window.removeEventListener(PANEL_EVENT, handler)
  }
}

function leerEstadoPanel(key: string, fallback: boolean): boolean {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(key)
    if (raw === null) return fallback
    return raw === 'true'
  } catch {
    return fallback
  }
}

function escribirEstadoPanel(key: string, open: boolean) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, open ? 'true' : 'false')
    window.dispatchEvent(new Event(PANEL_EVENT))
  } catch {
    // ignore storage errors
  }
}

function useEstadoPanel(key: string, defaultOpen: boolean) {
  const abierto = useSyncExternalStore(
    suscribirPanel,
    () => leerEstadoPanel(key, defaultOpen),
    () => defaultOpen
  )
  const setAbierto = (next: boolean) => escribirEstadoPanel(key, next)
  return [abierto, setAbierto] as const
}

const fmtFechaHora = (iso: string) =>
  new Date(iso).toLocaleString('es-DO', {
    timeZone: 'America/Santo_Domingo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

const fmtFechaCorta = (iso: string) =>
  new Date(iso).toLocaleDateString('es-DO', {
    timeZone: 'America/Santo_Domingo',
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  })

const fmtFechaInput = (iso: string) => {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Santo_Domingo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(iso))
  const get = (t: string) => partes.find((p) => p.type === t)?.value ?? '00'
  return `${get('year')}-${get('month')}-${get('day')}`
}

const fmtDiaLargo = (iso: string) =>
  new Date(iso).toLocaleDateString('es-DO', {
    timeZone: 'America/Santo_Domingo',
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

function calcularDiasDesde(fechaIso: string | null, ahoraIso: string): number | null {
  if (!fechaIso) return null
  const inicio = new Date(fechaIso).getTime()
  const ahora = new Date(ahoraIso).getTime()
  if (Number.isNaN(inicio) || Number.isNaN(ahora)) return null
  return Math.max(1, Math.floor(Math.max(0, ahora - inicio) / (1000 * 60 * 60 * 24)) + 1)
}

function rolLegible(role: string) {
  return ETIQUETAS_ROL[role] ?? role
}

export function HemodialisisPanel({
  items,
  puedeRegistrar,
  ahoraIso,
}: {
  items: HemodialisisItemData[]
  puedeRegistrar: boolean
  ahoraIso: string
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [busqueda, setBusqueda] = useState('')
  const [formAbierto, setFormAbierto] = useState<SeccionHd | null>(null)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [resolviendoId, setResolviendoId] = useState<string | null>(null)
  const [notaResolucion, setNotaResolucion] = useState('')
  const [mensaje, setMensaje] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null)

  // Estados de formularios de creación (controlados para presets rápidos)
  const [cultivoTipoNuevo, setCultivoTipoNuevo] = useState('')
  const [notaEsServicio, setNotaEsServicio] = useState(false)

  // Estados retraíbles persistidos en localStorage
  const [openNovedades, setOpenNovedades] = useEstadoPanel(STORAGE_KEYS.novedad, true)
  const [openPreDialisis, setOpenPreDialisis] = useEstadoPanel(STORAGE_KEYS.predialisis, true)
  const [openAntibioticos, setOpenAntibioticos] = useEstadoPanel(STORAGE_KEYS.antibiotico, true)
  const [openCultivos, setOpenCultivos] = useEstadoPanel(STORAGE_KEYS.cultivo, true)
  const [openNotas, setOpenNotas] = useEstadoPanel(STORAGE_KEYS.nota, true)
  const [openHistorial, setOpenHistorial] = useEstadoPanel(STORAGE_KEYS.historial, false)

  const hoyInput = fmtFechaInput(ahoraIso)

  const todosPrincipalesAbiertos =
    openNovedades && openPreDialisis && openAntibioticos && openCultivos && openNotas

  const toggleTodos = () => {
    const nuevo = !todosPrincipalesAbiertos
    setOpenNovedades(nuevo)
    setOpenPreDialisis(nuevo)
    setOpenAntibioticos(nuevo)
    setOpenCultivos(nuevo)
    setOpenNotas(nuevo)
  }

  const activos = useMemo(() => items.filter((i) => i.isActive), [items])
  const resueltos = useMemo(() => items.filter((i) => !i.isActive), [items])

  const filtradosActivos = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    if (!q) return activos
    return activos.filter(
      (i) =>
        i.patientName.toLowerCase().includes(q) ||
        i.title.toLowerCase().includes(q) ||
        (i.details ?? '').toLowerCase().includes(q) ||
        (i.shiftLabel ?? '').toLowerCase().includes(q) ||
        i.createdByName.toLowerCase().includes(q)
    )
  }, [activos, busqueda])

  const filtradosResueltos = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    if (!q) return resueltos
    return resueltos.filter(
      (i) =>
        i.patientName.toLowerCase().includes(q) ||
        i.title.toLowerCase().includes(q) ||
        (i.details ?? '').toLowerCase().includes(q) ||
        (i.resolutionNote ?? '').toLowerCase().includes(q)
    )
  }, [resueltos, busqueda])

  const porSeccion = useMemo(() => {
    const novedades = filtradosActivos.filter((i) => i.section === 'novedad')
    const predialisis = filtradosActivos.filter((i) => i.section === 'predialisis')
    const antibioticos = filtradosActivos.filter((i) => i.section === 'antibiotico')
    const cultivos = filtradosActivos.filter((i) => i.section === 'cultivo')
    const notas = filtradosActivos.filter((i) => i.section === 'nota')
    return { novedades, predialisis, antibioticos, cultivos, notas }
  }, [filtradosActivos])

  const handleCrear = (e: React.FormEvent<HTMLFormElement>, section: SeccionHd) => {
    e.preventDefault()
    setMensaje(null)
    const formEl = e.currentTarget
    const fd = new FormData(formEl)
    fd.set('section', section)
    if (section === 'nota' && notaEsServicio) {
      fd.set('isPriority', 'true')
    }

    startTransition(async () => {
      const res = await crearItemHemodialisis(fd)
      if (!res.ok) {
        setMensaje({ tipo: 'error', texto: res.error ?? 'No se pudo guardar el registro.' })
        return
      }
      formEl.reset()
      if (section === 'cultivo') setCultivoTipoNuevo('')
      if (section === 'nota') setNotaEsServicio(false)
      setFormAbierto(null)
      setMensaje({ tipo: 'ok', texto: `${ETIQUETAS_SECCION[section]} agregado con registro de firma.` })
      router.refresh()
    })
  }

  const handleEditar = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMensaje(null)
    const fd = new FormData(e.currentTarget)

    startTransition(async () => {
      const res = await editarItemHemodialisis(fd)
      if (!res.ok) {
        setMensaje({ tipo: 'error', texto: res.error ?? 'No se pudo modificar el registro.' })
        return
      }
      setEditandoId(null)
      setMensaje({ tipo: 'ok', texto: 'Registro actualizado con nueva firma y fecha/hora.' })
      router.refresh()
    })
  }

  const handleRegistrarDosis = (itemId: string, patientName: string) => {
    setMensaje(null)
    const fd = new FormData()
    fd.set('itemId', itemId)
    startTransition(async () => {
      const res = await registrarDosisHemodialisis(fd)
      if (!res.ok) {
        setMensaje({ tipo: 'error', texto: res.error ?? 'No se pudo registrar la dosis.' })
        return
      }
      setMensaje({ tipo: 'ok', texto: `Dosis registrada para ${patientName}.` })
      router.refresh()
    })
  }

  const handleResolver = (itemId: string, patientName: string) => {
    setMensaje(null)
    const fd = new FormData()
    fd.set('itemId', itemId)
    fd.set('resolutionNote', notaResolucion.trim())
    startTransition(async () => {
      const res = await resolverItemHemodialisis(fd)
      if (!res.ok) {
        setMensaje({ tipo: 'error', texto: res.error ?? 'No se pudo cerrar el registro.' })
        return
      }
      setResolviendoId(null)
      setNotaResolucion('')
      setMensaje({ tipo: 'ok', texto: `Registro de ${patientName} movido al historial de resueltos.` })
      router.refresh()
    })
  }

  const handleReactivar = (itemId: string) => {
    setMensaje(null)
    const fd = new FormData()
    fd.set('itemId', itemId)
    startTransition(async () => {
      const res = await reactivarItemHemodialisis(fd)
      if (!res.ok) {
        setMensaje({ tipo: 'error', texto: res.error ?? 'No se pudo reactivar.' })
        return
      }
      setMensaje({ tipo: 'ok', texto: 'Registro reactivado en la guardia.' })
      router.refresh()
    })
  }

  const renderAuditMetadata = (item: HemodialisisItemData) => (
    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-x-2 gap-y-0.5 pt-1.5 border-t border-slate-100 dark:border-slate-700/70">
      <span className="inline-flex items-center gap-1">
        <Clock className="w-3 h-3 text-slate-400 shrink-0" />
        <span>
          Registrado: <strong className="text-slate-700 dark:text-slate-200">{item.createdByName}</strong> ·{' '}
          {rolLegible(item.createdByRole)} · <span className="tabular-nums">{fmtFechaHora(item.createdAt)}</span>
        </span>
      </span>
      {item.updatedByName && item.updatedAt && (
        <span className="text-amber-700 dark:text-amber-300">
          · Modificado: <strong>{item.updatedByName}</strong> ({rolLegible(item.updatedByRole ?? '')}) ·{' '}
          <span className="tabular-nums">{fmtFechaHora(item.updatedAt)}</span>
        </span>
      )}
    </div>
  )

  const renderEditForm = (item: HemodialisisItemData) => {
    const esAntibiotico = item.section === 'antibiotico'
    const esCultivo = item.section === 'cultivo'
    const esNota = item.section === 'nota'
    const esNovedad = item.section === 'novedad'
    const esPre = item.section === 'predialisis'

    return (
      <form
        onSubmit={handleEditar}
        className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-lg p-3 space-y-2.5 mt-2"
      >
        <input type="hidden" name="itemId" value={item.id} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {esNota ? 'Paciente / Referencia *' : 'Paciente *'}
            </label>
            <input
              name="patientName"
              required
              defaultValue={item.patientName}
              className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {esAntibiotico
                ? 'Antibiótico y esquema *'
                : esCultivo
                  ? 'Tipo de cultivo *'
                  : esPre
                    ? 'Indicación pre-diálisis *'
                    : esNota
                      ? 'Nota / Recordatorio *'
                      : 'Novedad o indicación *'}
            </label>
            <input
              name="title"
              required
              defaultValue={item.title}
              className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {esAntibiotico
                ? 'Momento de dosis'
                : esNovedad || esPre
                  ? 'Turno / Horario'
                  : esNota
                    ? 'Frecuencia / Área'
                    : 'Etiqueta / Turno'}
            </label>
            <input
              name="shiftLabel"
              defaultValue={item.shiftLabel ?? ''}
              placeholder={esAntibiotico ? 'Ej. Post-HD, C/48h' : 'Ej. 1er Turno, M-J-S'}
              className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {esAntibiotico
                ? 'Foco infeccioso / Germen / Observación'
                : esCultivo
                  ? 'Antecedente / Observación'
                  : 'Detalles adicionales'}
            </label>
            <input
              name="details"
              defaultValue={item.details ?? ''}
              className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {esAntibiotico ? 'Inicio' : esCultivo ? 'Fecha toma' : 'Fecha'}
              </label>
              <input
                type="date"
                name="eventDate"
                defaultValue={item.eventDate ? fmtFechaInput(item.eventDate) : hoyInput}
                className="w-full px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white tabular-nums"
              />
            </div>

            {esAntibiotico && (
              <div className="w-20">
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Días plan
                </label>
                <input
                  type="number"
                  min={1}
                  max={365}
                  name="durationDays"
                  defaultValue={item.durationDays ?? ''}
                  placeholder="7"
                  className="w-full px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white tabular-nums"
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <label className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              name="isPriority"
              value="true"
              defaultChecked={item.isPriority}
              className="rounded border-slate-300"
            />
            <span>{esNota ? 'Aviso / Protocolo general del servicio' : 'Marcar como prioritario'}</span>
          </label>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setEditandoId(null)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              {isPending ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      </form>
    )
  }

  const renderItemActions = (
    item: HemodialisisItemData,
    resolveLabel: string,
    resolvePlaceholder: string
  ) => {
    if (!puedeRegistrar) return null
    const editando = editandoId === item.id
    const resolviendo = resolviendoId === item.id

    return (
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          {item.section === 'antibiotico' && (
            <button
              type="button"
              disabled={isPending}
              onClick={() => handleRegistrarDosis(item.id, item.patientName)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-semibold cursor-pointer"
            >
              <Syringe className="w-3 h-3" />
              <span>Registrar dosis</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setResolviendoId(null)
              setEditandoId(editando ? null : item.id)
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold cursor-pointer"
          >
            <Pencil className="w-3 h-3" />
            <span>{editando ? 'Cerrar edición' : 'Modificar'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setEditandoId(null)
              if (resolviendo) {
                setResolviendoId(null)
                setNotaResolucion('')
              } else {
                setResolviendoId(item.id)
                setNotaResolucion('')
              }
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold cursor-pointer"
          >
            <CheckSquare className="w-3 h-3" />
            <span>{resolveLabel}</span>
          </button>
        </div>

        {resolviendo && (
          <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg p-2.5 space-y-2">
            <input
              value={notaResolucion}
              onChange={(e) => setNotaResolucion(e.target.value)}
              placeholder={resolvePlaceholder}
              className="w-full px-2.5 py-1.5 border border-emerald-200 dark:border-emerald-700 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setResolviendoId(null)
                  setNotaResolucion('')
                }}
                className="px-2.5 py-1 rounded border border-slate-300 dark:border-slate-600 text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => handleResolver(item.id, item.patientName)}
                className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
              >
                {isPending ? 'Guardando...' : `Confirmar · ${resolveLabel}`}
              </button>
            </div>
          </div>
        )}

        {editando && renderEditForm(item)}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* CABECERA DE UNIDAD DE HEMODIÁLISIS */}
      <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Unidad de Hemodiálisis · Entrega de Guardia
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 capitalize">
              {fmtDiaLargo(ahoraIso)} · Todo cambio queda registrado con rol, nombre, fecha y hora
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar paciente, antibiótico, cultivo..."
                className="w-full pl-8 pr-7 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
              {busqueda && (
                <button
                  type="button"
                  onClick={() => setBusqueda('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={toggleTodos}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
            >
              {todosPrincipalesAbiertos ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" />
                  <span>Retraer todos</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" />
                  <span>Expandir todos</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* RESUMEN NUMÉRICO LIMPIO */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-3 border-t border-slate-100 dark:border-slate-700">
          <div className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Novedades del día</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">
              {porSeccion.novedades.length}
            </p>
          </div>
          <div className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Pre Diálisis</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">
              {porSeccion.predialisis.length}
            </p>
          </div>
          <div className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">En Antibióticos</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">
              {porSeccion.antibioticos.length}
            </p>
          </div>
          <div className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Cultivos Pendientes</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">
              {porSeccion.cultivos.length}
            </p>
          </div>
          <div className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 col-span-2 sm:col-span-1">
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Notas y Avisos</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white tabular-nums">
              {porSeccion.notas.length}
            </p>
          </div>
        </div>
      </section>

      {mensaje && (
        <div
          className={`px-4 py-2.5 rounded-lg border text-xs font-medium flex items-center justify-between gap-2 ${
            mensaje.tipo === 'ok'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-200'
              : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/30 dark:border-red-800 dark:text-red-200'
          }`}
        >
          <span>{mensaje.texto}</span>
          <button type="button" onClick={() => setMensaje(null)} className="cursor-pointer opacity-70">
            ✕
          </button>
        </div>
      )}

      {/* 1. GUARDIA / NOVEDADES DEL DÍA (RETRAÍBLE) */}
      <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 space-y-4">
        <div
          className={`flex flex-wrap items-center justify-between gap-2 ${
            openNovedades ? 'border-b border-slate-200 dark:border-slate-700 pb-3' : ''
          }`}
        >
          <div className="flex flex-wrap items-center gap-2">
            <CalendarClock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              1. Guardia y Novedades del Día ({porSeccion.novedades.length})
            </h3>
            {!openNovedades && (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                · Turnos, pacientes nuevos, eventos en máquina e indicaciones post-HD
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {puedeRegistrar && openNovedades && (
              <button
                type="button"
                onClick={() => setFormAbierto(formAbierto === 'novedad' ? null : 'novedad')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{formAbierto === 'novedad' ? 'Cerrar' : 'Agregar novedad'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setOpenNovedades(!openNovedades)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 cursor-pointer"
            >
              {openNovedades ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" />
                  <span>Retraer</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" />
                  <span>Expandir</span>
                </>
              )}
            </button>
          </div>
        </div>

        {openNovedades && (
          <div className="space-y-3">
            {puedeRegistrar && formAbierto === 'novedad' && (
              <form
                onSubmit={(e) => handleCrear(e, 'novedad')}
                className="bg-slate-50 dark:bg-slate-900/50 border border-blue-200 dark:border-blue-800 rounded-xl p-4 space-y-3"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Paciente *
                    </label>
                    <input
                      name="patientName"
                      required
                      placeholder="Ej. Juan Alcántara"
                      className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Turno / Sesión
                    </label>
                    <input
                      name="shiftLabel"
                      placeholder="Ej. 3er Turno · HD 1/3"
                      className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Fecha de guardia
                    </label>
                    <input
                      type="date"
                      name="eventDate"
                      defaultValue={hoyInput}
                      className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white tabular-nums"
                    />
                  </div>
                  <div className="flex items-end pb-1">
                    <label className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input type="checkbox" name="isPriority" value="true" className="rounded border-slate-300" />
                      <span>Prioritario / Urgente</span>
                    </label>
                  </div>
                  <div className="sm:col-span-2 lg:col-span-4">
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Novedad clínica o indicación de turno *
                    </label>
                    <input
                      name="title"
                      required
                      placeholder="Ej. Fiebre y escalofríos en HD, ver hemograma y proca / Tomar hemocultivos al final HD"
                      className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="sm:col-span-2 lg:col-span-4">
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Detalles adicionales (opcional)
                    </label>
                    <input
                      name="details"
                      placeholder="Ej. Se decide dar 3 HD consecutivas, realizar Rx tórax post-HD"
                      className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setFormAbierto(null)}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
                  >
                    {isPending ? 'Guardando...' : 'Guardar novedad'}
                  </button>
                </div>
              </form>
            )}

            {porSeccion.novedades.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">
                No hay novedades activas registradas para la guardia actual.
              </p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                {porSeccion.novedades.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3.5 space-y-2 ${
                      item.isPriority
                        ? 'bg-amber-50/40 dark:bg-amber-950/15'
                        : 'bg-white dark:bg-slate-800'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
                          <span className="font-bold text-slate-900 dark:text-white text-sm">
                            {item.patientName}
                          </span>
                          {item.shiftLabel && (
                            <span className="text-slate-600 dark:text-slate-300 font-medium">
                              · {item.shiftLabel}
                            </span>
                          )}
                          {item.eventDate && (
                            <span className="text-slate-500 dark:text-slate-400 tabular-nums">
                              · {fmtFechaCorta(item.eventDate)}
                            </span>
                          )}
                          {item.isPriority && (
                            <span className="text-red-700 dark:text-red-300 font-bold">
                              · Prioritario
                            </span>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-100 font-medium leading-relaxed">
                          {item.title}
                        </p>
                        {item.details && (
                          <p className="text-xs text-slate-600 dark:text-slate-300">{item.details}</p>
                        )}
                      </div>

                      <div className="shrink-0">
                        {renderItemActions(
                          item,
                          'Resolver',
                          'Nota de resolución (opcional, ej. Rx vista, hemocultivo tomado)'
                        )}
                      </div>
                    </div>
                    {renderAuditMetadata(item)}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* 2. PRE DIÁLISIS (RETRAÍBLE) */}
      <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 space-y-4">
        <div
          className={`flex flex-wrap items-center justify-between gap-2 ${
            openPreDialisis ? 'border-b border-slate-200 dark:border-slate-700 pb-3' : ''
          }`}
        >
          <div className="flex flex-wrap items-center gap-2">
            <ClipboardList className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              2. Pre Diálisis ({porSeccion.predialisis.length})
            </h3>
            {!openPreDialisis && (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                · Evaluaciones, laboratorios y órdenes antes de conectar a máquina
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {puedeRegistrar && openPreDialisis && (
              <button
                type="button"
                onClick={() => setFormAbierto(formAbierto === 'predialisis' ? null : 'predialisis')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{formAbierto === 'predialisis' ? 'Cerrar' : 'Agregar Pre Diálisis'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setOpenPreDialisis(!openPreDialisis)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 cursor-pointer"
            >
              {openPreDialisis ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" />
                  <span>Retraer</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" />
                  <span>Expandir</span>
                </>
              )}
            </button>
          </div>
        </div>

        {openPreDialisis && (
          <div className="space-y-3">
            {puedeRegistrar && formAbierto === 'predialisis' && (
              <form
                onSubmit={(e) => handleCrear(e, 'predialisis')}
                className="bg-slate-50 dark:bg-slate-900/50 border border-teal-200 dark:border-teal-800 rounded-xl p-4 space-y-3"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Paciente *
                    </label>
                    <input
                      name="patientName"
                      required
                      placeholder="Nombre completo"
                      className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Turno / Momento
                    </label>
                    <input
                      name="shiftLabel"
                      placeholder="Ej. 1er Turno, Antes de HD"
                      className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Fecha
                    </label>
                    <input
                      type="date"
                      name="eventDate"
                      defaultValue={hoyInput}
                      className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white tabular-nums"
                    />
                  </div>
                  <div className="flex items-end pb-1">
                    <label className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input type="checkbox" name="isPriority" value="true" className="rounded border-slate-300" />
                      <span>Prioritario antes de conectar</span>
                    </label>
                  </div>
                  <div className="sm:col-span-2 lg:col-span-4">
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Indicación / Pendiente Pre Diálisis *
                    </label>
                    <input
                      name="title"
                      required
                      placeholder="Ej. Verificar Hb y K+ pre-HD, evaluar acceso vascular, transfundir en máquina"
                      className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="sm:col-span-2 lg:col-span-4">
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Observación (opcional)
                    </label>
                    <input
                      name="details"
                      placeholder="Notas para enfermería o residente de turno"
                      className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setFormAbierto(null)}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold cursor-pointer"
                  >
                    {isPending ? 'Guardando...' : 'Guardar Pre Diálisis'}
                  </button>
                </div>
              </form>
            )}

            {porSeccion.predialisis.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">
                No hay pendientes Pre Diálisis registrados en este momento.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {porSeccion.predialisis.map((item) => (
                  <div
                    key={item.id}
                    className={`rounded-xl border p-3.5 space-y-2 ${
                      item.isPriority
                        ? 'border-amber-300 bg-amber-50/40 dark:border-amber-700 dark:bg-amber-950/15'
                        : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                          {item.patientName}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {item.shiftLabel || 'Pre-HD'}
                          {item.eventDate ? ` · ${fmtFechaCorta(item.eventDate)}` : ''}
                          {item.isPriority ? ' · Prioritario' : ''}
                        </p>
                      </div>
                    </div>
                    <p className="text-xs font-medium text-slate-800 dark:text-slate-100">{item.title}</p>
                    {item.details && (
                      <p className="text-xs text-slate-600 dark:text-slate-300">{item.details}</p>
                    )}
                    {renderItemActions(
                      item,
                      'Listo Pre-HD',
                      'Nota de cierre (opcional, ej. Autorizado para conexión)'
                    )}
                    {renderAuditMetadata(item)}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* 3. EN ANTIBIÓTICOS (RETRAÍBLE) */}
      <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 space-y-4">
        <div
          className={`flex flex-wrap items-center justify-between gap-2 ${
            openAntibioticos ? 'border-b border-slate-200 dark:border-slate-700 pb-3' : ''
          }`}
        >
          <div className="flex flex-wrap items-center gap-2">
            <Pill className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              3. En Antibióticos ({porSeccion.antibioticos.length})
            </h3>
            {!openAntibioticos && (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                · Esquemas activos, conteo de días, dosis post-HD y registro de aplicación
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {puedeRegistrar && openAntibioticos && (
              <button
                type="button"
                onClick={() => setFormAbierto(formAbierto === 'antibiotico' ? null : 'antibiotico')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{formAbierto === 'antibiotico' ? 'Cerrar' : 'Agregar antibiótico'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setOpenAntibioticos(!openAntibioticos)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 cursor-pointer"
            >
              {openAntibioticos ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" />
                  <span>Retraer</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" />
                  <span>Expandir</span>
                </>
              )}
            </button>
          </div>
        </div>

        {openAntibioticos && (
          <div className="space-y-3">
            {puedeRegistrar && formAbierto === 'antibiotico' && (
              <form
                onSubmit={(e) => handleCrear(e, 'antibiotico')}
                className="bg-slate-50 dark:bg-slate-900/50 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4 space-y-3"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Paciente *
                    </label>
                    <input
                      name="patientName"
                      required
                      placeholder="Ej. Dolores Constanza"
                      className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Antibiótico y esquema de dosis *
                    </label>
                    <input
                      name="title"
                      required
                      placeholder="Ej. Vancomicina 2.5 g inicio, luego 1.5 g post-HD"
                      className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Momento / Frecuencia
                    </label>
                    <input
                      name="shiftLabel"
                      defaultValue="Post-HD"
                      placeholder="Ej. Post-HD, C/48h, C/24h"
                      className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Foco infeccioso / Germen (opcional)
                    </label>
                    <input
                      name="details"
                      placeholder="Ej. Celulitis antebrazo izq / S. haemolyticus / Pseudomonas"
                      className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Fecha de inicio *
                    </label>
                    <input
                      type="date"
                      name="eventDate"
                      required
                      defaultValue={hoyInput}
                      className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white tabular-nums"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Días planificados (opc.)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={365}
                      name="durationDays"
                      placeholder="Ej. 7 o 14"
                      className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white tabular-nums"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setFormAbierto(null)}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer"
                  >
                    {isPending ? 'Guardando...' : 'Guardar antibiótico'}
                  </button>
                </div>
              </form>
            )}

            {porSeccion.antibioticos.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">
                No hay pacientes registrados en tratamiento antibiótico actualmente.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {porSeccion.antibioticos.map((item) => {
                  const dias = calcularDiasDesde(item.eventDate, ahoraIso)
                  return (
                    <div
                      key={item.id}
                      className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3.5 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            {item.patientName}
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                            {item.shiftLabel || 'Esquema HD'}
                            {item.eventDate ? ` · Inicio ${fmtFechaCorta(item.eventDate)}` : ''}
                          </p>
                        </div>

                        {dias !== null && (
                          <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 tabular-nums shrink-0">
                            Día {dias}
                            {item.durationDays ? ` / ${item.durationDays}` : ''}
                          </span>
                        )}
                      </div>

                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                        {item.title}
                      </p>
                      {item.details && (
                        <p className="text-xs text-slate-600 dark:text-slate-300">
                          Foco / Germen: {item.details}
                        </p>
                      )}

                      {item.lastCheckAt && item.lastCheckByName && (
                        <p className="text-[11px] text-blue-700 dark:text-blue-300 font-medium tabular-nums">
                          Última dosis aplicada: {item.lastCheckByName} ({rolLegible(item.lastCheckByRole ?? '')}) ·{' '}
                          {fmtFechaHora(item.lastCheckAt)}
                        </p>
                      )}

                      {renderItemActions(
                        item,
                        'Finalizar / Suspender',
                        'Motivo de finalización o suspensión (ej. Esquema completado, rotación antibiótica)'
                      )}
                      {renderAuditMetadata(item)}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </section>

      {/* 4. CULTIVOS PENDIENTES (RETRAÍBLE) */}
      <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 space-y-4">
        <div
          className={`flex flex-wrap items-center justify-between gap-2 ${
            openCultivos ? 'border-b border-slate-200 dark:border-slate-700 pb-3' : ''
          }`}
        >
          <div className="flex flex-wrap items-center gap-2">
            <FlaskConical className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              4. Cultivos Pendientes ({porSeccion.cultivos.length})
            </h3>
            {!openCultivos && (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                · Hemocultivos centrales/periféricos, urocultivos y reporte de resultados
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {puedeRegistrar && openCultivos && (
              <button
                type="button"
                onClick={() => setFormAbierto(formAbierto === 'cultivo' ? null : 'cultivo')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{formAbierto === 'cultivo' ? 'Cerrar' : 'Agregar cultivo'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setOpenCultivos(!openCultivos)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 cursor-pointer"
            >
              {openCultivos ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" />
                  <span>Retraer</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" />
                  <span>Expandir</span>
                </>
              )}
            </button>
          </div>
        </div>

        {openCultivos && (
          <div className="space-y-3">
            {puedeRegistrar && formAbierto === 'cultivo' && (
              <form
                onSubmit={(e) => handleCrear(e, 'cultivo')}
                className="bg-slate-50 dark:bg-slate-900/50 border border-purple-200 dark:border-purple-800 rounded-xl p-4 space-y-3"
              >
                <div className="flex flex-wrap gap-1.5">
                  {PRESETS_CULTIVO.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setCultivoTipoNuevo(preset)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border cursor-pointer transition-colors ${
                        cultivoTipoNuevo === preset
                          ? 'bg-purple-600 text-white border-purple-700'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:bg-purple-50'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Paciente *
                    </label>
                    <input
                      name="patientName"
                      required
                      placeholder="Ej. Tomasina Correa"
                      className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Tipo de cultivo *
                    </label>
                    <input
                      name="title"
                      required
                      value={cultivoTipoNuevo}
                      onChange={(e) => setCultivoTipoNuevo(e.target.value)}
                      placeholder="Ej. Hemocultivo central y periférico"
                      className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Fecha de toma *
                    </label>
                    <input
                      type="date"
                      name="eventDate"
                      required
                      defaultValue={hoyInput}
                      className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white tabular-nums"
                    />
                  </div>
                  <div className="sm:col-span-2 lg:col-span-4">
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Observación / Cultivo previo (opcional)
                    </label>
                    <input
                      name="details"
                      placeholder="Ej. Previo con E. coli multisensible / Repetir al finalizar ATB"
                      className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setFormAbierto(null)}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold cursor-pointer"
                  >
                    {isPending ? 'Guardando...' : 'Guardar cultivo pendiente'}
                  </button>
                </div>
              </form>
            )}

            {porSeccion.cultivos.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">
                No hay cultivos pendientes por reportar.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {porSeccion.cultivos.map((item) => {
                  const diasEspera = calcularDiasDesde(item.eventDate, ahoraIso)
                  return (
                    <div
                      key={item.id}
                      className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-3.5 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                            {item.patientName}
                          </h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                            {item.eventDate ? `Toma: ${fmtFechaCorta(item.eventDate)}` : 'Pendiente'}
                            {diasEspera !== null ? ` · ${diasEspera} día(s) en espera` : ''}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">
                        {item.title}
                      </p>
                      {item.details && (
                        <p className="text-xs text-slate-600 dark:text-slate-300">{item.details}</p>
                      )}
                      {renderItemActions(
                        item,
                        'Registrar resultado',
                        'Resultado del cultivo (ej. Negativo a las 72h, S. aureus sensible a Vanco)'
                      )}
                      {renderAuditMetadata(item)}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </section>

      {/* 5. NOTAS IMPORTANTES Y RECORDATORIOS DE SERVICIO (RETRAÍBLE) */}
      <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 space-y-4">
        <div
          className={`flex flex-wrap items-center justify-between gap-2 ${
            openNotas ? 'border-b border-slate-200 dark:border-slate-700 pb-3' : ''
          }`}
        >
          <div className="flex flex-wrap items-center gap-2">
            <BellRing className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              5. Notas Importantes y Recordatorios de Servicio ({porSeccion.notas.length})
            </h3>
            {!openNotas && (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                · Aislamientos, días de HD, virales trimestrales, vacunación y avisos del equipo
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {puedeRegistrar && openNotas && (
              <button
                type="button"
                onClick={() => setFormAbierto(formAbierto === 'nota' ? null : 'nota')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{formAbierto === 'nota' ? 'Cerrar' : 'Agregar nota / aviso'}</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setOpenNotas(!openNotas)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 cursor-pointer"
            >
              {openNotas ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" />
                  <span>Retraer</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" />
                  <span>Expandir</span>
                </>
              )}
            </button>
          </div>
        </div>

        {openNotas && (
          <div className="space-y-3">
            {puedeRegistrar && formAbierto === 'nota' && (
              <form
                onSubmit={(e) => handleCrear(e, 'nota')}
                className="bg-slate-50 dark:bg-slate-900/50 border border-amber-200 dark:border-amber-800 rounded-xl p-4 space-y-3"
              >
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setNotaEsServicio(false)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer border ${
                      !notaEsServicio
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    Nota de paciente
                  </button>
                  <button
                    type="button"
                    onClick={() => setNotaEsServicio(true)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer border ${
                      notaEsServicio
                        ? 'bg-red-600 text-white border-red-700'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    Recordatorio / Protocolo de servicio
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {notaEsServicio ? 'Área / Referencia' : 'Paciente *'}
                    </label>
                    <input
                      name="patientName"
                      required={!notaEsServicio}
                      placeholder={notaEsServicio ? 'Servicio de Hemodiálisis' : 'Ej. Lucía Taveras'}
                      className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {notaEsServicio ? 'Frecuencia / Protocolo' : 'Días HD / Condición'}
                    </label>
                    <input
                      name="shiftLabel"
                      placeholder={notaEsServicio ? 'Ej. Trimestral, Enfermería' : 'Ej. Martes-Sábado, Aislamiento'}
                      className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Fecha
                    </label>
                    <input
                      type="date"
                      name="eventDate"
                      defaultValue={hoyInput}
                      className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white tabular-nums"
                    />
                  </div>
                  <div className="sm:col-span-2 lg:col-span-3">
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      {notaEsServicio ? 'Recordatorio / Protocolo *' : 'Nota clínica importante *'}
                    </label>
                    <input
                      name="title"
                      required
                      placeholder={
                        notaEsServicio
                          ? 'Ej. Indicar virales Enero-Abril-Julio-Octubre / Solicitar tarjeta de vacuna'
                          : 'Ej. Herpes facial (inicio Aciclovir) / Continuar en aislamiento'
                      }
                      className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="sm:col-span-2 lg:col-span-3">
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Detalles (opcional)
                    </label>
                    <input
                      name="details"
                      placeholder="Observaciones adicionales"
                      className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setFormAbierto(null)}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="px-4 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold cursor-pointer"
                  >
                    {isPending ? 'Guardando...' : 'Guardar nota'}
                  </button>
                </div>
              </form>
            )}

            {porSeccion.notas.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">
                No hay notas importantes ni recordatorios de servicio registrados.
              </p>
            ) : (
              <div className="space-y-2.5">
                {porSeccion.notas.map((item) => (
                  <div
                    key={item.id}
                    className={`rounded-xl border p-3.5 space-y-2 ${
                      item.isPriority
                        ? 'border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20'
                        : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-x-2 text-xs">
                          <span
                            className={`font-bold text-sm ${
                              item.isPriority
                                ? 'text-red-800 dark:text-red-200'
                                : 'text-slate-900 dark:text-white'
                            }`}
                          >
                            {item.patientName}
                          </span>
                          {item.shiftLabel && (
                            <span className="text-slate-600 dark:text-slate-300 font-medium">
                              · {item.shiftLabel}
                            </span>
                          )}
                          {item.isPriority && (
                            <span className="text-red-700 dark:text-red-300 font-bold">
                              · Protocolo / Aviso de Servicio
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-xs sm:text-sm font-medium ${
                            item.isPriority
                              ? 'text-red-900 dark:text-red-100'
                              : 'text-slate-800 dark:text-slate-100'
                          }`}
                        >
                          {item.title}
                        </p>
                        {item.details && (
                          <p className="text-xs text-slate-600 dark:text-slate-300">{item.details}</p>
                        )}
                      </div>

                      <div className="shrink-0">
                        {renderItemActions(item, 'Archivar', 'Motivo de cierre (opcional)')}
                      </div>
                    </div>
                    {renderAuditMetadata(item)}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* 6. HISTORIAL DE RESUELTOS Y RESULTADOS (RETRAÍBLE, CERRADO POR DEFECTO) */}
      <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 space-y-4">
        <div
          className={`flex flex-wrap items-center justify-between gap-2 ${
            openHistorial ? 'border-b border-slate-200 dark:border-slate-700 pb-3' : ''
          }`}
        >
          <div className="flex flex-wrap items-center gap-2">
            <History className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Historial de Resueltos y Resultados ({filtradosResueltos.length})
            </h3>
            {!openHistorial && (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                · Cultivos reportados, esquemas completados y pendientes cerrados con firma
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => setOpenHistorial(!openHistorial)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 cursor-pointer"
          >
            {openHistorial ? (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                <span>Retraer</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                <span>Expandir</span>
              </>
            )}
          </button>
        </div>

        {openHistorial &&
          (filtradosResueltos.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-2">
              Aún no hay registros cerrados o resueltos en el historial de Hemodiálisis.
            </p>
          ) : (
            <div className="space-y-2.5">
              {filtradosResueltos.map((item) => (
                <div
                  key={item.id}
                  className="bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 space-y-1.5 text-xs"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-slate-900 dark:text-white font-bold">
                        {item.patientName}{' '}
                        <span className="font-normal text-slate-500 dark:text-slate-400">
                          · {ETIQUETAS_SECCION[item.section]}
                        </span>
                      </p>
                      <p className="text-slate-700 dark:text-slate-200 mt-0.5">{item.title}</p>
                      {item.resolutionNote && (
                        <p className="text-emerald-800 dark:text-emerald-300 font-semibold mt-0.5">
                          Resultado / Cierre: {item.resolutionNote}
                        </p>
                      )}
                    </div>

                    {puedeRegistrar && (
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleReactivar(item.id)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-100 cursor-pointer shrink-0"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reactivar</span>
                      </button>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap gap-x-3 pt-1 border-t border-slate-200/70 dark:border-slate-700/70">
                    <span>
                      Creado: {item.createdByName} ({rolLegible(item.createdByRole)}) ·{' '}
                      <span className="tabular-nums">{fmtFechaHora(item.createdAt)}</span>
                    </span>
                    {item.resolvedByName && item.resolvedAt && (
                      <span className="text-emerald-700 dark:text-emerald-300 font-medium">
                        Cerrado: {item.resolvedByName} ({rolLegible(item.resolvedByRole ?? '')}) ·{' '}
                        <span className="tabular-nums">{fmtFechaHora(item.resolvedAt)}</span>
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ))}
      </section>
    </div>
  )
}
