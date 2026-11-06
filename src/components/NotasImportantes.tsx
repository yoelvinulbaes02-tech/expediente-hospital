'use client'

import { useState } from 'react'
import { crearNotaImportante, resolverNotaImportante } from '@/app/dashboard/paciente/[id]/actions-clinicas'

type Alerta = {
  id: string
  content: string
  createdBy: string
  createdAt: Date
  isActive: boolean
}

export function NotasImportantes({
  episodeId,
  alertas,
  nombres,
  puedeRegistrar,
}: {
  episodeId: string
  alertas: Alerta[]
  nombres: Record<string, string>
  puedeRegistrar: boolean
}) {
  const [confirmandoId, setConfirmandoId] = useState<string | null>(null)

  const activas = alertas.filter((a) => a.isActive)
  const archivadas = alertas.filter((a) => !a.isActive)

  return (
    <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 shadow-sm mb-6">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">📌</span>
          <h2 className="text-sm font-bold uppercase tracking-wider text-amber-900">
            Notas Importantes y Avisos Clínicos
          </h2>
        </div>
        {activas.length > 0 && (
          <span className="text-xs bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded-full">
            {activas.length} aviso{activas.length === 1 ? '' : 's'} activo{activas.length === 1 ? '' : 's'}
          </span>
        )}
      </div>

      {activas.length === 0 ? (
        <p className="text-xs text-amber-700 italic py-1">No hay avisos activos en este momento.</p>
      ) : (
        <div className="space-y-2 mb-3">
          {activas.map((a) => (
            <div
              key={a.id}
              className="bg-white border border-amber-200 rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
            >
              <div className="text-sm text-slate-800">
                <p className="font-semibold">{a.content}</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Por {nombres[a.createdBy] ?? a.createdBy} ·{' '}
                  {a.createdAt.toLocaleString('es-DO', {
                    timeZone: 'America/Santo_Domingo',
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>

              {/* CONFIRMACIÓN EN 2 PASOS ANTE BORRADO ACCIDENTAL */}
              {puedeRegistrar && (
                <div className="shrink-0">
                  {confirmandoId === a.id ? (
                    <div className="flex items-center gap-2 bg-red-50 border border-red-200 px-2.5 py-1.5 rounded-lg text-xs">
                      <span className="font-bold text-red-800">¿Seguro de retirar?</span>
                      <form
                        action={async (formData) => {
                          await resolverNotaImportante(formData)
                          setConfirmandoId(null)
                        }}
                      >
                        <input type="hidden" name="episodeId" value={episodeId} />
                        <input type="hidden" name="alertId" value={a.id} />
                        <button
                          type="submit"
                          className="bg-red-600 text-white font-bold px-2.5 py-1 rounded hover:bg-red-700 transition-colors"
                        >
                          Sí, retirar
                        </button>
                      </form>
                      <button
                        type="button"
                        onClick={() => setConfirmandoId(null)}
                        className="text-slate-500 hover:text-slate-700 px-1.5 py-1 font-medium"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmandoId(a.id)}
                      title="Retirar este aviso"
                      className="text-xs text-slate-400 hover:text-red-600 px-2 py-1 rounded hover:bg-slate-50 transition-colors font-medium flex items-center gap-1"
                    >
                      ✕ Retirar
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* FORMULARIO PARA FIJAR NUEVO AVISO */}
      {puedeRegistrar && (
        <form action={crearNotaImportante} className="flex gap-2 mt-2 pt-2 border-t border-amber-200">
          <input type="hidden" name="episodeId" value={episodeId} />
          <input
            name="content"
            required
            placeholder="Escribir aviso destacado (ej. Difícil acceso venoso, En aislamiento...)"
            className="flex-1 px-3 py-2 border border-amber-300 rounded-lg text-base md:text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <button
            type="submit"
            className="bg-amber-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-amber-700 transition-colors shrink-0"
          >
            + Fijar Aviso
          </button>
        </form>
      )}

      {/* HISTORIAL DE AVISOS ARCHIVADOS (PARA NUNCA PERDER LO QUE DECÍA) */}
      {archivadas.length > 0 && (
        <details className="mt-3 pt-2 border-t border-amber-200/60">
          <summary className="text-[11px] font-bold text-amber-800 hover:text-amber-900 cursor-pointer select-none">
            📁 Ver avisos archivados / retirados ({archivadas.length})
          </summary>
          <div className="space-y-1.5 mt-2">
            {archivadas.map((r) => (
              <div key={r.id} className="bg-white/80 rounded-lg p-2.5 text-xs text-slate-600 border border-amber-200/60">
                <p className="line-through text-slate-500 font-medium">{r.content}</p>
                <p className="text-[10px] text-slate-400 mt-1">
                  Publicado por {nombres[r.createdBy] ?? r.createdBy} ·{' '}
                  {r.createdAt.toLocaleString('es-DO', {
                    timeZone: 'America/Santo_Domingo',
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}