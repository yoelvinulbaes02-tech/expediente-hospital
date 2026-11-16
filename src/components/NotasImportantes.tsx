'use client'

import { useState } from 'react'
import { crearNotaImportante, resolverNotaImportante } from '@/app/dashboard/paciente/[id]/actions-clinicas'

type Alerta = {
  id: string
  content: string
  createdBy: string
  createdAt: Date | string
  isActive: boolean
  resolvedBy?: string | null
  resolvedAt?: Date | string | null
}

const ETIQUETA_ROL: Record<string, string> = {
  ADMIN: 'Admin',
  DOCTOR: 'Médico',
  RESIDENT: 'Residente',
  NURSE: 'Enf.',
  LAB: 'Lab',
  READONLY: 'Lectura',
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

export function NotasImportantes({
  episodeId,
  alertas,
  nombres,
  roles = {},
  puedeRegistrar,
}: {
  episodeId: string
  alertas: Alerta[]
  nombres: Record<string, string>
  roles?: Record<string, string>
  puedeRegistrar: boolean
}) {
  const [mostrarHistorial, setMostrarHistorial] = useState(false)
  const [abrirModalNuevo, setAbrirModalNuevo] = useState(false)

  const activas = alertas.filter((a) => a.isActive)
  const resueltas = alertas.filter((a) => !a.isActive)

  return (
    <div className="bg-amber-50 dark:bg-amber-950/20 border-l-4 border-amber-500 p-4 rounded-xl shadow-xs mb-6">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200 dark:border-amber-900/50 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">⚠️</span>
          <h2 className="text-sm font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wide">
            Avisos / Notas Importantes ({activas.length} fijada{activas.length === 1 ? '' : 's'})
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {resueltas.length > 0 && (
            <button
              type="button"
              onClick={() => setMostrarHistorial(!mostrarHistorial)}
              className="text-xs font-semibold text-amber-800 dark:text-amber-300 hover:underline cursor-pointer"
            >
              {mostrarHistorial ? 'Ocultar historial' : `Ver resueltas (${resueltas.length})`}
            </button>
          )}

          {puedeRegistrar && (
            <button
              type="button"
              onClick={() => setAbrirModalNuevo(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition-colors shadow-2xs cursor-pointer"
            >
              + Fijar Nota Importante
            </button>
          )}
        </div>
      </div>

      {/* LISTA DE NOTAS IMPORTANTES FIJADAS (PERMITE FIJAR 2 O MÁS SIMULTÁNEAMENTE) */}
      <div className="space-y-2.5">
        {activas.map((alerta, index) => (
          <div
            key={alerta.id}
            className="bg-white dark:bg-slate-800 p-3.5 rounded-lg border border-amber-200 dark:border-amber-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
          >
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="bg-amber-500 text-white text-[10px] font-black px-1.5 py-0.2 rounded">
                  #{index + 1}
                </span>
                <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 wrap-break-word">
                  {alerta.content}
                </p>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                Fijado por: <strong className="text-slate-600 dark:text-slate-300">{nombres[alerta.createdBy] ?? alerta.createdBy}</strong>
                {roles[alerta.createdBy] && (
                  <span className="ml-1 bg-slate-100 dark:bg-slate-700 px-1 py-0.2 rounded text-[10px] font-semibold">
                    {ETIQUETA_ROL[roles[alerta.createdBy]] ?? roles[alerta.createdBy]}
                  </span>
                )}
                {' '}• {fmtFechaHora(alerta.createdAt)}
              </p>
            </div>

            {puedeRegistrar && (
              <form action={resolverNotaImportante} className="shrink-0">
                <input type="hidden" name="episodeId" value={episodeId} />
                <input type="hidden" name="alertId" value={alerta.id} />
                <button
                  type="submit"
                  className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  ✓ Retirar / Resolver
                </button>
              </form>
            )}
          </div>
        ))}

        {activas.length === 0 && (
          <p className="text-xs text-amber-800/80 dark:text-amber-300/80 italic py-1">
            Sin notas de precaución fijadas actualmente. Puede fijar alertas críticas que el equipo de guardia deba tener presente.
          </p>
        )}
      </div>

      {/* MODAL PARA CREAR NUEVA NOTA IMPORTANTE */}
      {abrirModalNuevo && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <span>⚠️</span> Fijar Nota de Precaución Importante
              </h3>
              <button
                type="button"
                onClick={() => setAbrirModalNuevo(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold leading-none cursor-pointer"
              >
                ✕
              </button>
            </div>
            <form
              action={async (formData) => {
                await crearNotaImportante(formData)
                setAbrirModalNuevo(false)
              }}
              className="space-y-3"
            >
              <input type="hidden" name="episodeId" value={episodeId} />
              <textarea
                name="content"
                required
                rows={3}
                placeholder="Ej. Paciente con difícil acceso venoso / Prohibido tomar TA en brazo izquierdo / Diálisis programada a las 2:00 PM..."
                className="w-full px-3 py-2 border rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-amber-500"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAbrirModalNuevo(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-1.5 rounded-lg shadow-sm cursor-pointer"
                >
                  Fijar en Expediente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* HISTORIAL: MUESTRA QUIÉN CANCELÓ / RESOLVIÓ LA NOTA CON FECHA Y HORA */}
      {mostrarHistorial && resueltas.length > 0 && (
        <div className="mt-4 pt-3 border-t border-amber-200 dark:border-amber-900/50 space-y-2">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Historial de Notas Retiradas / Resueltas
          </p>
          {resueltas.map((alerta) => (
            <div
              key={alerta.id}
              className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 space-y-1"
            >
              <p className="line-through text-slate-500">{alerta.content}</p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-400">
                <span>Fijado por: {nombres[alerta.createdBy] ?? alerta.createdBy}</span>
                {alerta.resolvedBy && (
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">
                    ✓ Resuelto / Retirado por: <strong>{nombres[alerta.resolvedBy] ?? alerta.resolvedBy}</strong>
                    {roles[alerta.resolvedBy] && (
                      <span className="ml-1 px-1 py-0.2 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 rounded font-semibold">
                        {ETIQUETA_ROL[roles[alerta.resolvedBy]] ?? roles[alerta.resolvedBy]}
                      </span>
                    )}
                    {alerta.resolvedAt && ` el ${fmtFechaHora(alerta.resolvedAt)}`}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}