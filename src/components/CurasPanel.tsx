'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CheckSquare, Plus, ClipboardCheck, Clock, UserCheck, Archive, Search } from 'lucide-react'
import {
  archivarCuraPaciente,
  crearCuraPaciente,
  registrarCuraRealizada,
  actualizarCuraPaciente,
} from '@/app/dashboard/actions-servicio'

export type CuraLogItem = {
  id: string
  performedBy: string
  performedByName: string
  performedAt: string
  notes: string | null
}

export type CuraPacienteItem = {
  id: string
  roomBed: string
  patientName: string
  age: number | null
  diagnosis: string
  patientStatus: string
  careFrequency: string
  baseDepartment: string
  createdBy: string
  createdAt: string
  logs: CuraLogItem[]
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

export function CurasPanel({
  curas,
  puedeRegistrar,
}: {
  curas: CuraPacienteItem[]
  puedeRegistrar: boolean
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [busqueda, setBusqueda] = useState('')
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [notasPorCura, setNotasPorCura] = useState<Record<string, string>>({})
  const [historialAbierto, setHistorialAbierto] = useState<Record<string, boolean>>({})
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [mensaje, setMensaje] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null)

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    if (!q) return curas
    return curas.filter(
      (c) =>
        c.patientName.toLowerCase().includes(q) ||
        c.roomBed.toLowerCase().includes(q) ||
        c.diagnosis.toLowerCase().includes(q) ||
        c.baseDepartment.toLowerCase().includes(q)
    )
  }, [curas, busqueda])

  const handleCrear = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMensaje(null)
    const formEl = e.currentTarget
    const fd = new FormData(formEl)
    startTransition(async () => {
      const res = await crearCuraPaciente(fd)
      if (!res.ok) {
        setMensaje({ tipo: 'error', texto: res.error ?? 'Error al agregar paciente a Curas.' })
        return
      }
      formEl.reset()
      setMostrarFormulario(false)
      setMensaje({ tipo: 'ok', texto: 'Paciente agregado al listado de Curas.' })
      router.refresh()
    })
  }

  const handleMarcarCura = (woundCareId: string, patientName: string) => {
    setMensaje(null)
    const fd = new FormData()
    fd.set('woundCareId', woundCareId)
    fd.set('notes', notasPorCura[woundCareId] ?? '')
    startTransition(async () => {
      const res = await registrarCuraRealizada(fd)
      if (!res.ok) {
        setMensaje({ tipo: 'error', texto: res.error ?? 'No se pudo registrar la cura.' })
        return
      }
      setNotasPorCura((prev) => ({ ...prev, [woundCareId]: '' }))
      setMensaje({
        tipo: 'ok',
        texto: `Evidencia de cura registrada para ${patientName}.`,
      })
      router.refresh()
    })
  }

  const handleActualizar = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const res = await actualizarCuraPaciente(fd)
      if (!res.ok) {
        setMensaje({ tipo: 'error', texto: res.error ?? 'No se pudo actualizar.' })
        return
      }
      setEditandoId(null)
      router.refresh()
    })
  }

  const handleArchivar = (woundCareId: string, patientName: string) => {
    setMensaje(null)
    const fd = new FormData()
    fd.set('woundCareId', woundCareId)
    startTransition(async () => {
      const res = await archivarCuraPaciente(fd)
      if (!res.ok) {
        setMensaje({ tipo: 'error', texto: res.error ?? 'No se pudo retirar.' })
        return
      }
      setMensaje({ tipo: 'ok', texto: `${patientName} retirado del listado activo de Curas.` })
      router.refresh()
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            Curas Quirúrgicas y Evidencia ({curas.length})
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Listado de pacientes en seguimiento de curas con checklist de evidencia (fecha, hora y responsable).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-52">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar habitación, paciente, depto..."
              className="w-full pl-8 pr-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>

          {puedeRegistrar && (
            <button
              type="button"
              onClick={() => setMostrarFormulario((v) => !v)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{mostrarFormulario ? 'Cerrar formulario' : 'Agregar Paciente a Curas'}</span>
            </button>
          )}
        </div>
      </div>

      {mensaje && (
        <div
          className={`px-4 py-2.5 rounded-lg border text-xs font-medium flex justify-between items-center ${
            mensaje.tipo === 'ok'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <span>{mensaje.texto}</span>
          <button type="button" onClick={() => setMensaje(null)} className="cursor-pointer opacity-70 hover:opacity-100">
            ✕
          </button>
        </div>
      )}

      {/* FORMULARIO NUEVA CURA */}
      {puedeRegistrar && mostrarFormulario && (
        <form
          onSubmit={handleCrear}
          className="bg-white dark:bg-slate-800 border border-teal-200 dark:border-teal-800 rounded-xl p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
        >
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Habitación / Cama *
            </label>
            <input
              name="roomBed"
              required
              placeholder="Ej. Hab. 304 - Cama B"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nombre del Paciente *
            </label>
            <input
              name="patientName"
              required
              placeholder="Ej. Carlos Mendoza"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Edad
            </label>
            <input
              name="age"
              type="number"
              min={0}
              max={130}
              placeholder="Ej. 52"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white tabular-nums"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Estado del paciente *
            </label>
            <select
              name="patientStatus"
              defaultValue="Estable"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            >
              <option value="Estable">Estable</option>
              <option value="Delicado">Delicado</option>
              <option value="Cuidado Intermedio">Cuidado Intermedio</option>
              <option value="Crítico">Crítico</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Diagnóstico *
            </label>
            <input
              name="diagnosis"
              required
              placeholder="Ej. Pie diabético infectado / Dehiscencia de herida abdominal"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Frecuencia de las curas *
            </label>
            <input
              name="careFrequency"
              required
              defaultValue="c/24h"
              placeholder="Ej. c/12h, c/24h, Diario, PRN"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Departamento de base *
            </label>
            <input
              name="baseDepartment"
              required
              placeholder="Ej. Cirugía General, Medicina Interna, Ortopedia..."
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-4 flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setMostrarFormulario(false)}
              className="px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold cursor-pointer"
            >
              {isPending ? 'Guardando...' : 'Guardar Paciente en Curas'}
            </button>
          </div>
        </form>
      )}

      {/* LISTADO DE CURAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtradas.map((cura) => {
          const ultimaCura = cura.logs[0] ?? null
          const expandido = !!historialAbierto[cura.id]
          const editando = editandoId === cura.id

          return (
            <div
              key={cura.id}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 sm:p-5 space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {cura.patientName}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {cura.age !== null ? `${cura.age} años · ` : ''}
                    Depto base: <strong className="text-slate-700 dark:text-slate-200">{cura.baseDepartment}</strong>
                  </p>
                </div>

                <div className="text-right shrink-0 space-y-1">
                  <span className="inline-block bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800 px-2 py-0.5 rounded text-xs font-bold">
                    {cura.roomBed}
                  </span>
                  <div className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                    Estado: {cura.patientStatus}
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-xs space-y-1">
                <p className="text-slate-700 dark:text-slate-200">
                  <strong>Diagnóstico:</strong> {cura.diagnosis}
                </p>
                <p className="text-teal-800 dark:text-teal-300 font-semibold">
                  Frecuencia de curas: {cura.careFrequency}
                </p>
              </div>

              {editando && puedeRegistrar && (
                <form
                  onSubmit={handleActualizar}
                  className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-lg p-3 grid grid-cols-1 sm:grid-cols-3 gap-2"
                >
                  <input type="hidden" name="woundCareId" value={cura.id} />
                  <input
                    name="roomBed"
                    defaultValue={cura.roomBed}
                    placeholder="Hab/Cama"
                    className="px-2 py-1.5 border rounded text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <select
                    name="patientStatus"
                    defaultValue={cura.patientStatus}
                    className="px-2 py-1.5 border rounded text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Estable">Estable</option>
                    <option value="Delicado">Delicado</option>
                    <option value="Cuidado Intermedio">Cuidado Intermedio</option>
                    <option value="Crítico">Crítico</option>
                  </select>
                  <input
                    name="careFrequency"
                    defaultValue={cura.careFrequency}
                    placeholder="Frecuencia"
                    className="px-2 py-1.5 border rounded text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  <div className="sm:col-span-3 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditandoId(null)}
                      className="text-xs text-slate-500 px-2 py-1 cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={isPending}
                      className="text-xs font-bold bg-slate-800 text-white px-3 py-1 rounded cursor-pointer"
                    >
                      Guardar cambios
                    </button>
                  </div>
                </form>
              )}

              {/* CHECKLIST / MARCAR CURA REALIZADA */}
              {puedeRegistrar && (
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    value={notasPorCura[cura.id] ?? ''}
                    onChange={(e) =>
                      setNotasPorCura((prev) => ({ ...prev, [cura.id]: e.target.value }))
                    }
                    placeholder="Observación de la cura (opcional, ej. herida limpia)"
                    className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleMarcarCura(cura.id, cura.patientName)}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>Registrar Cura Realizada</span>
                  </button>
                </div>
              )}

              {/* RESUMEN ÚLTIMA CURA Y CHECKLIST HISTÓRICO */}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                    <ClipboardCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="font-bold tabular-nums">{cura.logs.length}</span>
                    <span>cura{cura.logs.length === 1 ? '' : 's'} registrada{cura.logs.length === 1 ? '' : 's'}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    {cura.logs.length > 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          setHistorialAbierto((prev) => ({ ...prev, [cura.id]: !prev[cura.id] }))
                        }
                        className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                      >
                        {expandido ? 'Ocultar evidencia ▲' : `Ver evidencia (${cura.logs.length}) ▼`}
                      </button>
                    )}

                    {puedeRegistrar && (
                      <>
                        <button
                          type="button"
                          onClick={() => setEditandoId(editando ? null : cura.id)}
                          className="text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleArchivar(cura.id, cura.patientName)}
                          title="Finalizar seguimiento de curas"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-800 cursor-pointer"
                        >
                          <Archive className="w-3 h-3" />
                          <span>Alta</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {ultimaCura ? (
                  <div className="text-[11px] text-emerald-800 dark:text-emerald-300 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg px-2.5 py-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5">
                    <span className="inline-flex items-center gap-1 font-semibold">
                      <UserCheck className="w-3 h-3" /> Última cura: {ultimaCura.performedByName}
                    </span>
                    <span className="inline-flex items-center gap-1 tabular-nums">
                      <Clock className="w-3 h-3" /> {fmtFechaHora(ultimaCura.performedAt)}
                    </span>
                    {ultimaCura.notes && (
                      <span className="text-slate-700 dark:text-slate-200">· {ultimaCura.notes}</span>
                    )}
                  </div>
                ) : (
                  <p className="text-[11px] text-amber-700 dark:text-amber-400 italic">
                    Aún no se ha marcado ninguna cura realizada.
                  </p>
                )}

                {expandido && cura.logs.length > 0 && (
                  <div className="space-y-1.5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5 max-h-56 overflow-y-auto">
                    <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                      Checklist de Evidencia de Curas Realizadas:
                    </p>
                    {cura.logs.map((log) => (
                      <div
                        key={log.id}
                        className="flex items-start gap-2 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2.5 py-1.5"
                      >
                        <CheckSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center justify-between gap-1">
                            <span className="font-bold text-slate-900 dark:text-white">
                              {log.performedByName}
                            </span>
                            <span className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                              {fmtFechaHora(log.performedAt)}
                            </span>
                          </div>
                          {log.notes && (
                            <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                              {log.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {filtradas.length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-400 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            No hay pacientes registrados en Curas en este momento.
          </div>
        )}
      </div>
    </div>
  )
}
