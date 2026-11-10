'use client'

import { useState } from 'react'
import { crearTarea, marcarTarea } from '@/app/dashboard/paciente/[id]/actions-tareas'

type Tarea = {
  id: string
  title: string
  category: string
  dueAt: Date | string | null
  status: string
  createdBy: string
  createdAt: Date | string
  doneBy: string | null
  doneAt: Date | string | null
  cancelReason: string | null
}

const ETIQUETA_ROL: Record<string, string> = {
  ADMIN: 'Admin',
  DOCTOR: 'Médico',
  RESIDENT: 'Residente',
  NURSE: 'Enf.',
  LAB: 'Lab',
  READONLY: 'Lectura',
}

const ETIQUETA_CATEGORIA: Record<string, { label: string; color: string }> = {
  analisis: { label: '🧪 Analítica', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' },
  estudio: { label: '🩻 Estudio', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300' },
  indicacion: { label: '💊 Indicación', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' },
  otro: { label: '📌 General', color: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200' },
}

const fmtFechaHora = (d: Date | string | null) => {
  if (!d) return ''
  const f = new Date(d)
  return f.toLocaleString('es-DO', {
    timeZone: 'America/Santo_Domingo',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function ChecklistTareas({
  episodeId,
  tareas,
  nombres,
  roles = {},
  puedeMarcar,
  puedeEditar,
  puedeAgregar,
}: {
  episodeId: string
  tareas: Tarea[]
  nombres: Record<string, string>
  roles?: Record<string, string>
  puedeMarcar: boolean
  puedeEditar: boolean
  puedeAgregar: boolean
}) {
  const [mostrarHechas, setMostrarHechas] = useState(false)
  const [tareaACancelar, setTareaACancelar] = useState<string | null>(null)
  const [motivoCancelacion, setMotivoCancelacion] = useState('')

  const pendientes = tareas.filter((t) => t.status === 'pendiente')
  const finalizadas = tareas.filter((t) => t.status !== 'pendiente')

  return (
    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">☑️</span>
          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
              Checklist de Pendientes de Guardia
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {pendientes.length} pendiente{pendientes.length === 1 ? '' : 's'} activo{pendientes.length === 1 ? '' : 's'}
            </p>
          </div>
        </div>

        {finalizadas.length > 0 && (
          <button
            type="button"
            onClick={() => setMostrarHechas(!mostrarHechas)}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            {mostrarHechas ? 'Ocultar completadas' : `Ver completadas / canceladas (${finalizadas.length})`}
          </button>
        )}
      </div>

      {/* FORMULARIO: AGREGAR TAREA CON CALENDARIO VISIBLE */}
      {puedeAgregar && (
        <form action={crearTarea} className="bg-slate-50 dark:bg-slate-700/40 p-3.5 rounded-xl border border-slate-200 dark:border-slate-600 mb-5 space-y-3">
          <input type="hidden" name="episodeId" value={episodeId} />
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              name="titulo"
              required
              placeholder="Escribe el pendiente, estudio o indicación..."
              className="flex-1 px-3 py-2 border rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              name="categoria"
              className="px-3 py-2 border rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold outline-none"
            >
              <option value="analisis">🧪 Analítica</option>
              <option value="estudio">🩻 Estudio</option>
              <option value="indicacion">💊 Indicación</option>
              <option value="otro">📌 General</option>
            </select>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <label htmlFor="programada" className="text-xs font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                📅 Programada para (Opcional):
              </label>
              <input
                id="programada"
                name="programada"
                type="datetime-local"
                className="px-2.5 py-1.5 border rounded-lg text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap"
            >
              + Agregar al Checklist
            </button>
          </div>
        </form>
      )}

      {/* LISTA DE PENDIENTES ACTIVOS */}
      <div className="space-y-2.5">
        {pendientes.map((t) => {
          const catInfo = ETIQUETA_CATEGORIA[t.category] ?? ETIQUETA_CATEGORIA.otro
          return (
            <div
              key={t.id}
              className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 dark:hover:border-slate-600 transition-all shadow-xs"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${catInfo.color}`}>
                    {catInfo.label}
                  </span>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 break-words">
                    {t.title}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                  {t.dueAt && (
                    <span className="font-bold text-indigo-700 dark:text-indigo-400">
                      📅 Programado: {fmtFechaHora(t.dueAt)}
                    </span>
                  )}
                  <span>
                    Creado por: <strong className="text-slate-700 dark:text-slate-300">{nombres[t.createdBy] ?? t.createdBy}</strong>
                    {roles[t.createdBy] && (
                      <span className="ml-1 px-1 py-0.2 bg-slate-100 dark:bg-slate-700 text-[10px] rounded">
                        {ETIQUETA_ROL[roles[t.createdBy]] ?? roles[t.createdBy]}
                      </span>
                    )}
                    {' '}({fmtFechaHora(t.createdAt)})
                  </span>
                </div>
              </div>

              {puedeMarcar && (
                <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-700">
                  <form action={marcarTarea}>
                    <input type="hidden" name="taskId" value={t.id} />
                    <input type="hidden" name="accion" value="hecha" />
                    <button
                      type="submit"
                      className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-700 transition-colors shadow-xs"
                    >
                      ✓ Realizada
                    </button>
                  </form>

                  <button
                    type="button"
                    onClick={() => {
                      setTareaACancelar(t.id)
                      setMotivoCancelacion('')
                    }}
                    className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 font-medium px-2 py-1"
                  >
                    ✕ Cancelar
                  </button>
                </div>
              )}
            </div>
          )
        })}

        {pendientes.length === 0 && (
          <p className="text-xs text-slate-400 italic text-center py-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
            No hay pendientes activos para este paciente.
          </p>
        )}
      </div>

      {/* MODAL / FORMULARIO PARA MOTIVO DE CANCELACIÓN */}
      {tareaACancelar && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-700 space-y-3">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Cancelar Tarea / Pendiente
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Por auditoría clínica, debe indicar el motivo de la cancelación:
            </p>
            <form action={marcarTarea} className="space-y-3">
              <input type="hidden" name="taskId" value={tareaACancelar} />
              <input type="hidden" name="accion" value="cancelar" />
              <textarea
                name="motivo"
                required
                rows={3}
                value={motivoCancelacion}
                onChange={(e) => setMotivoCancelacion(e.target.value)}
                placeholder="Ej. Paciente no requirió el estudio / indicación suspendida por médico tratante"
                className="w-full px-3 py-2 border rounded-lg text-xs bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-red-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setTareaACancelar(null)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                >
                  Regresar
                </button>
                <button
                  type="submit"
                  disabled={motivoCancelacion.trim().length < 3}
                  className="bg-red-600 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold hover:bg-red-700 disabled:opacity-50"
                >
                  Confirmar Cancelación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SECCIÓN DE TAREAS COMPLETADAS Y CANCELADAS */}
      {mostrarHechas && finalizadas.length > 0 && (
        <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Historial de Pendientes Resueltos y Cancelados
          </h3>
          {finalizadas.map((t) => (
            <div
              key={t.id}
              className={`p-2.5 rounded-lg border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                t.status === 'hecha'
                  ? 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  : 'bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50 text-red-900 dark:text-red-300'
              }`}
            >
              <div>
                <p className={`font-semibold ${t.status === 'hecha' ? 'line-through text-slate-500' : ''}`}>
                  {t.title}
                </p>
                {t.status === 'hecha' && t.doneBy && (
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                    ✓ Realizada por <strong>{nombres[t.doneBy] ?? t.doneBy}</strong> el {fmtFechaHora(t.doneAt)}
                  </p>
                )}
                {t.status === 'cancelada' && (
                  <p className="text-[11px] text-red-700 dark:text-red-400">
                    ✕ Cancelada por <strong>{nombres[t.doneBy ?? ''] ?? t.doneBy}</strong> ({fmtFechaHora(t.doneAt)}): &quot;{t.cancelReason}&quot;
                  </p>
                )}
              </div>

              {puedeMarcar && t.status === 'hecha' && (
                <form action={marcarTarea}>
                  <input type="hidden" name="taskId" value={t.id} />
                  <input type="hidden" name="accion" value="reabrir" />
                  <button type="submit" className="text-[11px] text-blue-600 hover:underline font-semibold">
                    Reabrir
                  </button>
                </form>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}