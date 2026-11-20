'use client'

import { useState, useSyncExternalStore, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Activity,
  Pencil,
  RotateCcw,
  Plus,
  Minus,
  Syringe,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import {
  ajustarDispositivoCirugiaDashboard,
  guardarResumenCirugiaConfig,
} from '@/app/dashboard/actions-servicio'
import { CATEGORIAS_DISPOSITIVOS_CIRUGIA } from '@/lib/cirugia-constants'

const STORAGE_RESUMEN_KEY = 'nexo_cirugia_resumen_open'
const STORAGE_CATETERES_KEY = 'nexo_cirugia_cateteres_open'
const PANEL_TOGGLE_EVENT = 'nexo:cirugia-panel-toggle'

function suscribirPanelStorage(callback: () => void) {
  if (typeof window === 'undefined') return () => {}
  const handler = () => callback()
  window.addEventListener('storage', handler)
  window.addEventListener(PANEL_TOGGLE_EVENT, handler)
  return () => {
    window.removeEventListener('storage', handler)
    window.removeEventListener(PANEL_TOGGLE_EVENT, handler)
  }
}

function leerEstadoPanel(key: string): boolean {
  if (typeof window === 'undefined') return false
  try {
    return window.localStorage.getItem(key) === 'true'
  } catch {
    return false
  }
}

function escribirEstadoPanel(key: string, open: boolean) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, open ? 'true' : 'false')
    window.dispatchEvent(new Event(PANEL_TOGGLE_EVENT))
  } catch {
    // ignore storage quota errors
  }
}

export type ResumenCirugiaStats = {
  mode: 'auto' | 'manual'
  emergencias: number
  ingresosElectivos: number
  ingresosEmergencias: number
  totalIngresos: number
  cirugias: number
}

export function CirugiaResumenPanel({
  resumenAuto,
  resumenGuardado,
  conteosDispositivos,
  puedeEditar,
}: {
  resumenAuto: Omit<ResumenCirugiaStats, 'mode'>
  resumenGuardado: ResumenCirugiaStats | null
  conteosDispositivos: Record<string, number>
  puedeEditar: boolean
}) {
  const router = useRouter()
  const resumenAbierto = useSyncExternalStore(
    suscribirPanelStorage,
    () => leerEstadoPanel(STORAGE_RESUMEN_KEY),
    () => false
  )
  const cateteresAbierto = useSyncExternalStore(
    suscribirPanelStorage,
    () => leerEstadoPanel(STORAGE_CATETERES_KEY),
    () => false
  )
  const setResumenAbierto = (next: boolean) => escribirEstadoPanel(STORAGE_RESUMEN_KEY, next)
  const setCateteresAbierto = (next: boolean) => escribirEstadoPanel(STORAGE_CATETERES_KEY, next)
  const [editandoResumen, setEditandoResumen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const activoManual = resumenGuardado?.mode === 'manual'
  const mostrado = activoManual ? resumenGuardado : { mode: 'auto' as const, ...resumenAuto }

  const [formVals, setFormVals] = useState({
    emergencias: mostrado.emergencias,
    ingresosElectivos: mostrado.ingresosElectivos,
    ingresosEmergencias: mostrado.ingresosEmergencias,
    totalIngresos: mostrado.totalIngresos,
    cirugias: mostrado.cirugias,
  })

  const guardarManual = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMsg(null)
    const fd = new FormData()
    fd.set('accion', 'manual')
    fd.set('emergencias', String(formVals.emergencias))
    fd.set('ingresosElectivos', String(formVals.ingresosElectivos))
    fd.set('ingresosEmergencias', String(formVals.ingresosEmergencias))
    fd.set('totalIngresos', String(formVals.totalIngresos))
    fd.set('cirugias', String(formVals.cirugias))

    startTransition(async () => {
      const res = await guardarResumenCirugiaConfig(fd)
      if (!res.ok) {
        setErrorMsg(res.error ?? 'Error al guardar resumen.')
        return
      }
      setEditandoResumen(false)
      router.refresh()
    })
  }

  const volverAAutomatico = () => {
    setErrorMsg(null)
    const fd = new FormData()
    fd.set('accion', 'auto')
    startTransition(async () => {
      const res = await guardarResumenCirugiaConfig(fd)
      if (!res.ok) {
        setErrorMsg(res.error ?? 'Error al cambiar a automático.')
        return
      }
      setEditandoResumen(false)
      router.refresh()
    })
  }

  const ajustarDispositivo = (category: string, delta: 1 | -1) => {
    setErrorMsg(null)
    const fd = new FormData()
    fd.set('category', category)
    fd.set('delta', String(delta))
    startTransition(async () => {
      const res = await ajustarDispositivoCirugiaDashboard(fd)
      if (!res.ok) {
        setErrorMsg(res.error ?? 'Error al actualizar conteo.')
        return
      }
      router.refresh()
    })
  }

  const itemsResumen = [
    { label: 'Emergencias', value: mostrado.emergencias, accent: 'text-red-700 dark:text-red-400' },
    { label: 'Ingresos electivos', value: mostrado.ingresosElectivos, accent: 'text-blue-700 dark:text-blue-400' },
    { label: 'Ingresos emergencias', value: mostrado.ingresosEmergencias, accent: 'text-amber-700 dark:text-amber-400' },
    { label: 'Total de ingresos', value: mostrado.totalIngresos, accent: 'text-slate-900 dark:text-white' },
    { label: 'Cirugías', value: mostrado.cirugias, accent: 'text-teal-700 dark:text-teal-400' },
  ]

  const totalDispositivos = CATEGORIAS_DISPOSITIVOS_CIRUGIA.reduce(
    (acc, cat) => acc + (conteosDispositivos[cat.key] ?? 0),
    0
  )

  return (
    <div className="space-y-4 mb-6">
      {errorMsg && (
        <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
          {errorMsg}
        </div>
      )}

      {/* APARTADO 1: RESUMEN INICIAL DEL SERVICIO DE CIRUGÍA (RETRAÍBLE) */}
      <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 sm:p-5">
        <div
          className={`flex flex-wrap items-center justify-between gap-2 ${
            resumenAbierto
              ? 'border-b border-slate-200 dark:border-slate-700 pb-3 mb-4'
              : ''
          }`}
        >
          <div className="flex flex-wrap items-center gap-2">
            <Activity className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Resumen Inicial del Servicio · Cirugía
            </h2>
            {!resumenAbierto ? (
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded tabular-nums">
                Emerg: {mostrado.emergencias} · Ingresos: {mostrado.totalIngresos} · Cx: {mostrado.cirugias}
              </span>
            ) : (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                · {activoManual ? 'Conteo de guardia manual' : 'Cálculo automático en vivo'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {resumenAbierto && puedeEditar && (
              <>
                {activoManual && (
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={volverAAutomatico}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-teal-300 bg-teal-50 text-teal-800 text-xs font-bold hover:bg-teal-100 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Usar Automático</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setFormVals({
                      emergencias: mostrado.emergencias,
                      ingresosElectivos: mostrado.ingresosElectivos,
                      ingresosEmergencias: mostrado.ingresosEmergencias,
                      totalIngresos: mostrado.totalIngresos,
                      cirugias: mostrado.cirugias,
                    })
                    setEditandoResumen((v) => !v)
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 text-xs font-bold hover:bg-slate-200 cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>{editandoResumen ? 'Cerrar' : 'Ajustar Conteo'}</span>
                </button>
              </>
            )}

            <button
              type="button"
              onClick={() => setResumenAbierto(!resumenAbierto)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 cursor-pointer"
            >
              {resumenAbierto ? (
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

        {resumenAbierto &&
          (!editandoResumen ? (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {itemsResumen.map((item) => (
                <div
                  key={item.label}
                  className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg px-3.5 py-3"
                >
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {item.label}
                  </p>
                  <p className={`text-2xl font-black mt-1 tabular-nums ${item.accent}`}>
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <form onSubmit={guardarManual} className="grid grid-cols-2 sm:grid-cols-6 gap-3 items-end">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Emergencias
                </label>
                <input
                  type="number"
                  min={0}
                  value={formVals.emergencias}
                  onChange={(e) =>
                    setFormVals((p) => ({ ...p, emergencias: parseInt(e.target.value || '0', 10) || 0 }))
                  }
                  className="w-full px-2.5 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ingresos electivos
                </label>
                <input
                  type="number"
                  min={0}
                  value={formVals.ingresosElectivos}
                  onChange={(e) =>
                    setFormVals((p) => ({
                      ...p,
                      ingresosElectivos: parseInt(e.target.value || '0', 10) || 0,
                    }))
                  }
                  className="w-full px-2.5 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ingresos emergencias
                </label>
                <input
                  type="number"
                  min={0}
                  value={formVals.ingresosEmergencias}
                  onChange={(e) =>
                    setFormVals((p) => ({
                      ...p,
                      ingresosEmergencias: parseInt(e.target.value || '0', 10) || 0,
                    }))
                  }
                  className="w-full px-2.5 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Total de ingresos
                </label>
                <input
                  type="number"
                  min={0}
                  value={formVals.totalIngresos}
                  onChange={(e) =>
                    setFormVals((p) => ({
                      ...p,
                      totalIngresos: parseInt(e.target.value || '0', 10) || 0,
                    }))
                  }
                  className="w-full px-2.5 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Cirugías
                </label>
                <input
                  type="number"
                  min={0}
                  value={formVals.cirugias}
                  onChange={(e) =>
                    setFormVals((p) => ({ ...p, cirugias: parseInt(e.target.value || '0', 10) || 0 }))
                  }
                  className="w-full px-2.5 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white tabular-nums"
                />
              </div>
              <button
                type="submit"
                disabled={isPending}
                className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
              >
                {isPending ? 'Guardando...' : 'Guardar'}
              </button>
            </form>
          ))}
      </section>

      {/* APARTADO 2: CATÉTERES, ACCESOS Y DRENAJES EN CIRUGÍA (RETRAÍBLE) */}
      <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 sm:p-5">
        <div
          className={`flex flex-wrap items-center justify-between gap-2 ${
            cateteresAbierto
              ? 'border-b border-slate-200 dark:border-slate-700 pb-3 mb-4'
              : ''
          }`}
        >
          <div className="flex flex-wrap items-center gap-2">
            <Syringe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Control de Catéteres, Accesos y Drenajes
            </h2>
            {!cateteresAbierto ? (
              <span className="text-xs font-semibold text-blue-800 dark:text-blue-200 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded tabular-nums">
                Total activos: {totalDispositivos}
              </span>
            ) : (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                · Sincronizado con expedientes y conteo rápido de sala
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => setCateteresAbierto(!cateteresAbierto)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 cursor-pointer"
          >
            {cateteresAbierto ? (
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

        {cateteresAbierto && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {CATEGORIAS_DISPOSITIVOS_CIRUGIA.map((cat) => {
              const count = conteosDispositivos[cat.key] ?? 0
              return (
                <div
                  key={cat.key}
                  className="flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg px-3.5 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 leading-snug">
                      {cat.label}
                    </p>
                    <p className="text-xl font-black text-slate-900 dark:text-white tabular-nums mt-0.5">
                      {count}
                    </p>
                  </div>

                  {puedeEditar && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        disabled={isPending || count === 0}
                        onClick={() => ajustarDispositivo(cat.key, -1)}
                        title={`Restar 1 ${cat.label}`}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 disabled:opacity-40 cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => ajustarDispositivo(cat.key, 1)}
                        title={`Sumar 1 ${cat.label}`}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
