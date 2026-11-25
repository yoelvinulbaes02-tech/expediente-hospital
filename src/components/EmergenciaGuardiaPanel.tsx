'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Activity,
  ChevronDown,
  ClipboardCheck,
  Pencil,
  RotateCcw,
  ShieldAlert,
  Stethoscope,
  Users,
  X,
} from 'lucide-react'
import { guardarEmergenciaGuardia } from '@/app/dashboard/actions-servicio'
import { etiquetaRolClinico } from '@/lib/consultas-auth'
import type { EmergenciaGuardiaAutoStats, EmergenciaGuardiaData } from '@/lib/emergencia-constants'

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

export function EmergenciaGuardiaPanel({
  data,
  autoStats,
  puedeEditar,
  ingresosActivosCount = 0,
}: {
  data: EmergenciaGuardiaData
  autoStats?: EmergenciaGuardiaAutoStats
  puedeEditar: boolean
  ingresosActivosCount?: number
}) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const detailsRef = useRef<HTMLDetailsElement>(null)
  const [editando, setEditando] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null)

  const esModoAuto = data.mode !== 'manual' && Boolean(autoStats)

  const valores = {
    totalVistos: esModoAuto && autoStats ? autoStats.totalVistos : data.totalVistos,
    triage: esModoAuto && autoStats ? autoStats.triage : data.triage,
    emergencias: esModoAuto && autoStats ? autoStats.emergencias : data.emergencias,
    ingresosTotales: esModoAuto && autoStats ? autoStats.ingresosTotales : data.ingresosTotales,
    medicinaInterna: esModoAuto && autoStats ? autoStats.medicinaInterna : data.medicinaInterna,
    cirugiaCount: esModoAuto && autoStats ? autoStats.cirugiaCount : data.cirugiaCount,
    ortopediaCount: esModoAuto && autoStats ? autoStats.ortopediaCount : data.ortopediaCount,
    neurocirugia: esModoAuto && autoStats ? autoStats.neurocirugia : data.neurocirugia,
    enviadosSala: esModoAuto && autoStats ? autoStats.enviadosSala : data.enviadosSala,
    enviadoUci: esModoAuto && autoStats ? autoStats.enviadoUci : data.enviadoUci,
    traslado: esModoAuto && autoStats ? autoStats.traslado : data.traslado,
    referimientos: esModoAuto && autoStats ? autoStats.referimientos : data.referimientos,
    fallecido: esModoAuto && autoStats ? autoStats.fallecido : data.fallecido,
    pacientesIngresados:
      esModoAuto && autoStats ? autoStats.pacientesIngresados : data.pacientesIngresados,
    pacientesTraumaShock:
      esModoAuto && autoStats ? autoStats.pacientesTraumaShock : data.pacientesTraumaShock,
  }

  const enviarAccion = (accion: 'auto' | 'equipo' | 'manual') => {
    setFeedback(null)
    const fd =
      accion === 'auto'
        ? (() => {
            const d = new FormData()
            d.set('accion', 'auto')
            return d
          })()
        : formRef.current
          ? new FormData(formRef.current)
          : new FormData()
    fd.set('accion', accion)

    startTransition(async () => {
      const res = await guardarEmergenciaGuardia(fd)
      if (!res.ok) {
        setFeedback({ tipo: 'error', texto: res.error ?? 'No se pudo guardar el parte de guardia.' })
        return
      }
      setEditando(false)
      setFeedback({
        tipo: 'ok',
        texto:
          accion === 'auto'
            ? 'Conteo automático restablecido en vivo según los pacientes registrados.'
            : accion === 'equipo'
              ? 'Equipo y procedimientos guardados manteniendo conteo automático.'
              : 'Entrega de guardia actualizada en ajuste manual.',
      })
      router.refresh()
    })
  }

  const tieneEquipo =
    Boolean(data.teamServicio) ||
    Boolean(data.medicosAsistentes) ||
    Boolean(data.residentesEmergenciologia) ||
    Boolean(data.ma) ||
    Boolean(data.ri) ||
    Boolean(data.mg)

  return (
    <details
      ref={detailsRef}
      className="group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl mb-6 overflow-hidden"
    >
      <summary className="list-none cursor-pointer px-4 py-3.5 flex flex-wrap items-center justify-between gap-3 hover:bg-slate-50/70 dark:hover:bg-slate-700/30 [&::-webkit-details-marker]:hidden">
        <div className="flex items-center gap-2.5 min-w-0">
          <ChevronDown className="w-4 h-4 text-slate-500 transition-transform group-open:rotate-0 -rotate-90 shrink-0" />
          <ClipboardCheck className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
          <div className="min-w-0">
            <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white">
              Entrega de Guardia · Servicio de Emergencia
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
              {data.fecha ? `Fecha: ${data.fecha}` : 'Fecha sin definir'}
              {' · '}
              <span className={esModoAuto ? 'text-emerald-700 dark:text-emerald-400 font-semibold' : 'text-amber-700 dark:text-amber-300 font-semibold'}>
                {esModoAuto ? 'Cálculo automático en vivo' : 'Ajuste manual activo'}
              </span>
              {' · '}
              <span>Propios activos: {ingresosActivosCount}</span>
              {data.updatedBy && (
                <>
                  {' · '}
                  <span>
                    Modif.: {data.updatedBy}
                    {data.updatedByRole ? ` (${etiquetaRolClinico(data.updatedByRole)})` : ''}
                    {data.updatedAt ? ` · ${fmtFechaHora(data.updatedAt)}` : ''}
                  </span>
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {puedeEditar && !esModoAuto && autoStats && !editando && (
            <button
              type="button"
              disabled={isPending}
              onClick={(e) => {
                e.preventDefault()
                enviarAccion('auto')
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-100 cursor-pointer whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Usar automático</span>
            </button>
          )}
          {puedeEditar && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                setFeedback(null)
                const next = !editando
                setEditando(next)
                if (next && detailsRef.current) {
                  detailsRef.current.open = true
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer whitespace-nowrap shrink-0"
            >
              {editando ? (
                <>
                  <X className="w-3.5 h-3.5" />
                  <span>Cerrar edición</span>
                </>
              ) : (
                <>
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Editar parte de guardia</span>
                </>
              )}
            </button>
          )}
        </div>
      </summary>

      <div className="border-t border-slate-200 dark:border-slate-700 p-4 md:p-5 space-y-5">
        {feedback && (
          <div
            className={`px-3.5 py-2.5 rounded-lg border text-xs font-medium ${
              feedback.tipo === 'ok'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-200'
                : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/30 dark:border-red-800 dark:text-red-200'
            }`}
          >
            {feedback.texto}
          </div>
        )}

        {editando && puedeEditar ? (
          <form
            ref={formRef}
            key={`${data.updatedAt ?? 'init'}-${data.mode}`}
            onSubmit={(e) => {
              e.preventDefault()
              enviarAccion('manual')
            }}
            className="space-y-5"
          >
            {/* Fecha y Equipo */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-rose-600" />
                <span>Fecha y Equipo de Guardia</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Fecha de Guardia
                  </label>
                  <input
                    name="fecha"
                    defaultValue={data.fecha}
                    placeholder="Ej. 25/11/2026"
                    className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Team de Servicio
                  </label>
                  <input
                    name="teamServicio"
                    defaultValue={data.teamServicio}
                    placeholder="Dra. / Dr. encargado del team..."
                    className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Médicos Asistentes
                  </label>
                  <input
                    name="medicosAsistentes"
                    defaultValue={data.medicosAsistentes}
                    placeholder="Dras. / Dres. asistentes..."
                    className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Residentes de Emergenciología y Desastres
                  </label>
                  <input
                    name="residentesEmergenciologia"
                    defaultValue={data.residentesEmergenciologia}
                    placeholder="Dres. residentes..."
                    className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Residentes de Medicina Interna
                  </label>
                  <input
                    name="residentesMedicinaInterna"
                    defaultValue={data.residentesMedicinaInterna}
                    placeholder="Dra. / Dr. residente..."
                    className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Ortopedia
                  </label>
                  <input
                    name="ortopedia"
                    defaultValue={data.ortopedia}
                    placeholder="Dres. de guardia..."
                    className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Cirugía
                  </label>
                  <input
                    name="cirugia"
                    defaultValue={data.cirugia}
                    placeholder="Dr. / Dra. de guardia..."
                    className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Residentes Maxilofacial
                  </label>
                  <input
                    name="residentesMaxilofacial"
                    defaultValue={data.residentesMaxilofacial}
                    placeholder="Dres. maxilofacial..."
                    className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      MA
                    </label>
                    <input
                      name="ma"
                      defaultValue={data.ma}
                      placeholder="Dra. / Dr."
                      className="w-full px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      RI
                    </label>
                    <input
                      name="ri"
                      defaultValue={data.ri}
                      placeholder="Dras."
                      className="w-full px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      MG
                    </label>
                    <input
                      name="mg"
                      defaultValue={data.mg}
                      placeholder="Dras."
                      className="w-full px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Totales & Especialidades */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-3 border-t border-slate-200 dark:border-slate-700">
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-rose-600" />
                  <span>Totales de Atención</span>
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { name: 'totalVistos', label: 'Total vistos', val: valores.totalVistos },
                    { name: 'triage', label: 'Triage', val: valores.triage },
                    { name: 'emergencias', label: 'Emergencias', val: valores.emergencias },
                    { name: 'ingresosTotales', label: 'Ingresos totales', val: valores.ingresosTotales },
                  ].map((item) => (
                    <div key={item.name}>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        {item.label}
                      </label>
                      <input
                        type="number"
                        min={0}
                        name={item.name}
                        defaultValue={item.val}
                        className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white tabular-nums"
                      />
                    </div>
                  ))}
                </div>

                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 pt-1">
                  Atenciones / Ingresos por Especialidad
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { name: 'medicinaInterna', label: 'Medicina Interna', val: valores.medicinaInterna },
                    { name: 'cirugiaCount', label: 'Cirugía', val: valores.cirugiaCount },
                    { name: 'ortopediaCount', label: 'Ortopedia', val: valores.ortopediaCount },
                    { name: 'neurocirugia', label: 'Neurocirugía', val: valores.neurocirugia },
                  ].map((item) => (
                    <div key={item.name}>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        {item.label}
                      </label>
                      <input
                        type="number"
                        min={0}
                        name={item.name}
                        defaultValue={item.val}
                        className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white tabular-nums"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Destinos y Movimientos
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    { name: 'enviadosSala', label: 'Enviados a sala', val: valores.enviadosSala },
                    { name: 'enviadoUci', label: 'Enviado a UCI', val: valores.enviadoUci },
                    { name: 'traslado', label: 'Traslado', val: valores.traslado },
                    { name: 'referimientos', label: 'Referimientos', val: valores.referimientos },
                    { name: 'fallecido', label: 'Fallecido', val: valores.fallecido },
                    { name: 'traidoFallecido', label: 'Traído fallecido', val: data.traidoFallecido },
                  ].map((item) => (
                    <div key={item.name}>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                        {item.label}
                      </label>
                      <input
                        type="number"
                        min={0}
                        name={item.name}
                        defaultValue={item.val}
                        className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white tabular-nums"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Procedimientos Realizados */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5 text-rose-600" />
                <span>Procedimientos Realizados</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5">
                {[
                  { name: 'procEkg', label: 'EKG', val: data.procEkg },
                  { name: 'procSondaPleurostomia', label: 'Sonda pleurostomía', val: data.procSondaPleurostomia },
                  { name: 'procTrombolisis', label: 'Trombólisis', val: data.procTrombolisis },
                  { name: 'procToracocentesis', label: 'Toracocentesis', val: data.procToracocentesis },
                  { name: 'procParacentesis', label: 'Paracentesis', val: data.procParacentesis },
                  { name: 'procRcp', label: 'RCP', val: data.procRcp },
                  { name: 'procDesfibrilacion', label: 'Desfibrilación', val: data.procDesfibrilacion },
                  { name: 'procViaCentral', label: 'Vía central', val: data.procViaCentral },
                  { name: 'procSondaVesical', label: 'Sonda vesical', val: data.procSondaVesical },
                  { name: 'procIntubacion', label: 'Intubación', val: data.procIntubacion },
                  { name: 'procCardioversion', label: 'Cardioversión', val: data.procCardioversion },
                ].map((proc) => (
                  <div key={proc.name}>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1 truncate">
                      {proc.label}
                    </label>
                    <input
                      type="number"
                      min={0}
                      name={proc.name}
                      defaultValue={proc.val}
                      className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white tabular-nums"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Estado actual del Área de Emergencia */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                <span>Estado del Área de Emergencia</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Pacientes ingresados
                  </label>
                  <input
                    type="number"
                    min={0}
                    name="pacientesIngresados"
                    defaultValue={valores.pacientesIngresados}
                    className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    En Trauma Shock
                  </label>
                  <input
                    type="number"
                    min={0}
                    name="pacientesTraumaShock"
                    defaultValue={valores.pacientesTraumaShock}
                    className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Camas disponibles
                  </label>
                  <input
                    type="number"
                    min={0}
                    name="camasDisponibles"
                    defaultValue={data.camasDisponibles}
                    className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Camillas retenidas
                  </label>
                  <input
                    type="number"
                    min={0}
                    name="camillasRetenidas"
                    defaultValue={data.camillasRetenidas}
                    className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Situaciones administrativas
                  </label>
                  <input
                    name="situacionesAdministrativas"
                    defaultValue={data.situacionesAdministrativas}
                    placeholder="0 o detalle..."
                    className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditando(false)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={() => enviarAccion('equipo')}
                className="px-4 py-2 rounded-lg text-xs font-bold border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-200 cursor-pointer disabled:opacity-50"
              >
                {isPending ? 'Guardando...' : 'Guardar equipo / proced. (conteo automático)'}
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-5 py-2 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer disabled:opacity-50"
              >
                {isPending ? 'Guardando...' : 'Guardar todo (ajuste manual)'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 text-xs">
            {/* Resumen principal de números */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
              {[
                { label: 'Total vistos', value: valores.totalVistos },
                { label: 'Triage', value: valores.triage },
                { label: 'Emergencias', value: valores.emergencias },
                { label: 'Ingresos totales', value: valores.ingresosTotales },
                { label: 'Ingresados EM', value: valores.pacientesIngresados },
                { label: 'Trauma Shock', value: valores.pacientesTraumaShock },
                { label: 'Camas disp.', value: data.camasDisponibles },
                { label: 'Camillas ret.', value: data.camillasRetenidas },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2"
                >
                  <span className="block text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {stat.label}
                  </span>
                  <strong className="text-base font-bold text-slate-900 dark:text-white tabular-nums">
                    {stat.value}
                  </strong>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-2 border-t border-slate-200 dark:border-slate-700">
              {/* Columna 1: Equipo */}
              <div className="space-y-1.5">
                <h3 className="font-bold text-slate-800 dark:text-slate-100">Equipo de Guardia</h3>
                {tieneEquipo ? (
                  <dl className="space-y-1 text-slate-600 dark:text-slate-300">
                    {data.teamServicio && (
                      <div>
                        <dt className="inline font-semibold text-slate-800 dark:text-slate-200">Team de Servicio: </dt>
                        <dd className="inline">{data.teamServicio}</dd>
                      </div>
                    )}
                    {data.medicosAsistentes && (
                      <div>
                        <dt className="inline font-semibold text-slate-800 dark:text-slate-200">Médicos Asistentes: </dt>
                        <dd className="inline">{data.medicosAsistentes}</dd>
                      </div>
                    )}
                    {data.residentesEmergenciologia && (
                      <div>
                        <dt className="inline font-semibold text-slate-800 dark:text-slate-200">Res. Emergenciología: </dt>
                        <dd className="inline">{data.residentesEmergenciologia}</dd>
                      </div>
                    )}
                    {data.residentesMedicinaInterna && (
                      <div>
                        <dt className="inline font-semibold text-slate-800 dark:text-slate-200">Res. Medicina Interna: </dt>
                        <dd className="inline">{data.residentesMedicinaInterna}</dd>
                      </div>
                    )}
                    {data.ortopedia && (
                      <div>
                        <dt className="inline font-semibold text-slate-800 dark:text-slate-200">Ortopedia: </dt>
                        <dd className="inline">{data.ortopedia}</dd>
                      </div>
                    )}
                    {data.cirugia && (
                      <div>
                        <dt className="inline font-semibold text-slate-800 dark:text-slate-200">Cirugía: </dt>
                        <dd className="inline">{data.cirugia}</dd>
                      </div>
                    )}
                    {data.residentesMaxilofacial && (
                      <div>
                        <dt className="inline font-semibold text-slate-800 dark:text-slate-200">Res. Maxilofacial: </dt>
                        <dd className="inline">{data.residentesMaxilofacial}</dd>
                      </div>
                    )}
                    {(data.ma || data.ri || data.mg) && (
                      <div className="pt-0.5 text-slate-700 dark:text-slate-200">
                        {data.ma && <span><strong>MA:</strong> {data.ma}</span>}
                        {data.ma && (data.ri || data.mg) && <span aria-hidden="true"> · </span>}
                        {data.ri && <span><strong>RI:</strong> {data.ri}</span>}
                        {data.ri && data.mg && <span aria-hidden="true"> · </span>}
                        {data.mg && <span><strong>MG:</strong> {data.mg}</span>}
                      </div>
                    )}
                  </dl>
                ) : (
                  <p className="text-slate-400 italic">Sin personal asignado aún.</p>
                )}
              </div>

              {/* Columna 2: Especialidades y Destinos */}
              <div className="space-y-2">
                <h3 className="font-bold text-slate-800 dark:text-slate-100">Especialidades y Destinos</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-600 dark:text-slate-300 tabular-nums">
                  <span>Medicina Interna: <strong className="text-slate-900 dark:text-white">{valores.medicinaInterna}</strong></span>
                  <span>Cirugía: <strong className="text-slate-900 dark:text-white">{valores.cirugiaCount}</strong></span>
                  <span>Ortopedia: <strong className="text-slate-900 dark:text-white">{valores.ortopediaCount}</strong></span>
                  <span>Neurocirugía: <strong className="text-slate-900 dark:text-white">{valores.neurocirugia}</strong></span>
                  <span>Enviados a sala: <strong className="text-slate-900 dark:text-white">{valores.enviadosSala}</strong></span>
                  <span>Enviado a UCI: <strong className="text-slate-900 dark:text-white">{valores.enviadoUci}</strong></span>
                  <span>Traslados: <strong className="text-slate-900 dark:text-white">{valores.traslado}</strong></span>
                  <span>Referimientos: <strong className="text-slate-900 dark:text-white">{valores.referimientos}</strong></span>
                  <span>Fallecidos: <strong className="text-slate-900 dark:text-white">{valores.fallecido}</strong></span>
                  <span>Traído fallecido: <strong className="text-slate-900 dark:text-white">{data.traidoFallecido}</strong></span>
                </div>
                <p className="text-slate-600 dark:text-slate-300">
                  <strong>Situaciones administrativas:</strong>{' '}
                  <span className="text-slate-900 dark:text-white">{data.situacionesAdministrativas || '0'}</span>
                </p>
              </div>

              {/* Columna 3: Procedimientos */}
              <div className="space-y-1.5">
                <h3 className="font-bold text-slate-800 dark:text-slate-100">Procedimientos Realizados</h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-600 dark:text-slate-300 tabular-nums">
                  <span>EKG: <strong className="text-slate-900 dark:text-white">{data.procEkg}</strong></span>
                  <span>Vía central: <strong className="text-slate-900 dark:text-white">{data.procViaCentral}</strong></span>
                  <span>Sonda pleurostomía: <strong className="text-slate-900 dark:text-white">{data.procSondaPleurostomia}</strong></span>
                  <span>Sonda vesical: <strong className="text-slate-900 dark:text-white">{data.procSondaVesical}</strong></span>
                  <span>Trombólisis: <strong className="text-slate-900 dark:text-white">{data.procTrombolisis}</strong></span>
                  <span>Intubación: <strong className="text-slate-900 dark:text-white">{data.procIntubacion}</strong></span>
                  <span>Toracocentesis: <strong className="text-slate-900 dark:text-white">{data.procToracocentesis}</strong></span>
                  <span>Cardioversión: <strong className="text-slate-900 dark:text-white">{data.procCardioversion}</strong></span>
                  <span>Paracentesis: <strong className="text-slate-900 dark:text-white">{data.procParacentesis}</strong></span>
                  <span>RCP: <strong className="text-slate-900 dark:text-white">{data.procRcp}</strong></span>
                  <span>Desfibrilación: <strong className="text-slate-900 dark:text-white">{data.procDesfibrilacion}</strong></span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </details>
  )
}
