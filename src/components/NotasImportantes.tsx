'use client'

import { useState } from 'react'
import {
  crearNotaImportante,
  resolverNotaImportante,
  toggleFijarNotaImportante,
} from '@/app/dashboard/paciente/[id]/actions-clinicas'

type Alerta = {
  id: string
  content: string
  createdBy: string
  createdAt: Date | string
  isActive: boolean
  isPinned?: boolean
  pinnedAt?: Date | string | null
  resolvedBy?: string | null
  resolvedAt?: Date | string | null
}

const MAX_FIJAS = 3

const ETIQUETA_ROL: Record<string, string> = {
  ADMIN: 'Admin',
  DOCTOR: 'Médico',
  RESIDENT: 'Residente',
  NURSE: 'Enf.',
  LAB: 'Laboratorio',
  READONLY: 'Lectura',
}

const fmtFecha = (d: Date | string | null | undefined) => {
  if (!d) return ''
  return new Date(d).toLocaleString('es-DO', {
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
  const [confirmandoId, setConfirmandoId] = useState<string | null>(null)

  const activas = alertas.filter((a) => a.isActive)
  const archivadas = alertas
    .filter((a) => !a.isActive)
    .sort(
      (a, b) =>
        new Date(b.resolvedAt ?? b.createdAt).getTime() -
        new Date(a.resolvedAt ?? a.createdAt).getTime()
    )

  // Hasta 3 notas fijadas por importancia arriba (en orden en que fueron fijadas)
  const fijadas = activas
    .filter((a) => a.isPinned)
    .sort(
      (a, b) =>
        new Date(a.pinnedAt ?? a.createdAt).getTime() -
        new Date(b.pinnedAt ?? b.createdAt).getTime()
    )

  // Las demás debajo en el orden exacto en que se agregaron
  const demas = activas
    .filter((a) => !a.isPinned)
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )

  const limiteAlcanzado = fijadas.length >= MAX_FIJAS

  const renderTarjeta = (a: Alerta, esFija: boolean, indice: number) => (
    <div
      key={a.id}
      className={`rounded-lg p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs border ${
        esFija
          ? 'bg-white border-amber-400 ring-1 ring-amber-200'
          : 'bg-white/90 border-amber-200'
      }`}
    >
      <div className="text-sm text-slate-800 min-w-0">
        <div className="flex items-start gap-2">
          <span
            className={`inline-flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-black rounded px-1.5 py-0.5 border ${
              esFija
                ? 'bg-amber-500 text-white border-amber-600'
                : 'bg-slate-100 text-slate-700 border-slate-300'
            }`}
          >
            {esFija ? `📌 Fija #${indice + 1}` : `#${indice + 1}`}
          </span>
          <p className="font-semibold whitespace-pre-line wrap-break-word">{a.content}</p>
        </div>
        <p className="text-[11px] text-slate-500 mt-1.5">
          Agregado por <strong className="text-slate-700">{nombres[a.createdBy] ?? a.createdBy}</strong>
          {roles[a.createdBy] && (
            <span className="ml-1 bg-slate-100 text-slate-700 text-[10px] font-bold px-1 py-0.5 rounded border border-slate-200">
              {ETIQUETA_ROL[roles[a.createdBy]] ?? roles[a.createdBy]}
            </span>
          )}{' '}
          · {fmtFecha(a.createdAt)}
        </p>
      </div>

      {puedeRegistrar && (
        <div className="shrink-0 flex flex-wrap items-center gap-1.5">
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
                  className="bg-red-600 text-white font-bold px-2.5 py-1 rounded hover:bg-red-700 transition-colors cursor-pointer"
                >
                  Sí, retirar
                </button>
              </form>
              <button
                type="button"
                onClick={() => setConfirmandoId(null)}
                className="text-slate-500 hover:text-slate-700 px-1.5 py-1 font-medium cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <>
              <form action={toggleFijarNotaImportante}>
                <input type="hidden" name="episodeId" value={episodeId} />
                <input type="hidden" name="alertId" value={a.id} />
                <button
                  type="submit"
                  disabled={!esFija && limiteAlcanzado}
                  title={
                    esFija
                      ? 'Quitar de notas fijadas'
                      : limiteAlcanzado
                        ? 'Ya hay 3 notas fijadas. Desfija una primero.'
                        : 'Fijar arriba por importancia'
                  }
                  className={`text-xs px-2 py-1 rounded border font-semibold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                    esFija
                      ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                      : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-amber-50 hover:text-amber-800 hover:border-amber-300'
                  }`}
                >
                  {esFija ? 'Desfijar' : '📌 Fijar'}
                </button>
              </form>

              <button
                type="button"
                onClick={() => setConfirmandoId(a.id)}
                title="Retirar este aviso"
                className="text-xs text-slate-500 hover:text-red-600 px-2 py-1 rounded hover:bg-slate-50 transition-colors font-medium flex items-center gap-1 cursor-pointer"
              >
                ✕ Retirar
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )

  return (
    <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 shadow-sm mb-6">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">📌</span>
          <h2 className="text-sm font-bold uppercase tracking-wider text-amber-900">
            Notas Importantes y Avisos Clínicos
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-amber-200 text-amber-950 font-bold px-2.5 py-0.5 rounded-full">
            {fijadas.length}/{MAX_FIJAS} fijadas
          </span>
          {activas.length > 0 && (
            <span className="text-xs bg-white text-amber-900 border border-amber-300 font-bold px-2.5 py-0.5 rounded-full">
              {activas.length} total
            </span>
          )}
        </div>
      </div>

      {activas.length === 0 ? (
        <p className="text-xs text-amber-700 italic py-1">No hay avisos activos en este momento.</p>
      ) : (
        <div className="space-y-4 mb-3">
          {fijadas.length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-amber-900">
                ⭐ Fijadas por Importancia (máx. {MAX_FIJAS})
              </p>
              <div className="space-y-2">
                {fijadas.map((a, idx) => renderTarjeta(a, true, idx))}
              </div>
            </div>
          )}

          {demas.length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                📝 Notas Adicionales (en orden de ingreso)
              </p>
              <div className="space-y-2">
                {demas.map((a, idx) => renderTarjeta(a, false, idx))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* FORMULARIO PARA AGREGAR NUEVA NOTA (CON OPCIÓN DE FIJAR SI HAY CUPO) */}
      {puedeRegistrar && (
        <form action={crearNotaImportante} className="mt-2 pt-2.5 border-t border-amber-200 space-y-2">
          <input type="hidden" name="episodeId" value={episodeId} />
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              name="content"
              required
              placeholder="Escribir nota importante o aviso clínico..."
              className="flex-1 px-3 py-2 border border-amber-300 rounded-lg text-base md:text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <button
              type="submit"
              className="bg-amber-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-amber-700 transition-colors shrink-0 cursor-pointer"
            >
              + Agregar Nota
            </button>
          </div>
          <label className="inline-flex items-center gap-2 text-xs text-amber-950 font-medium cursor-pointer select-none">
            <input
              type="checkbox"
              name="isPinned"
              disabled={limiteAlcanzado}
              className="rounded border-amber-400 text-amber-600 focus:ring-amber-500 disabled:opacity-40"
            />
            <span className={limiteAlcanzado ? 'opacity-60' : ''}>
              {limiteAlcanzado
                ? `Ya hay ${MAX_FIJAS}/${MAX_FIJAS} notas fijadas (se agregará debajo en orden de llegada)`
                : '📌 Fijar arriba por importancia (hasta 3 notas fijadas)'}
            </span>
          </label>
        </form>
      )}

      {/* HISTORIAL DE AVISOS ARCHIVADOS / RETIRADOS */}
      {archivadas.length > 0 && (
        <details className="mt-3 pt-2 border-t border-amber-200/60">
          <summary className="text-[11px] font-bold text-amber-800 hover:text-amber-900 cursor-pointer select-none">
            📁 Ver avisos archivados / retirados ({archivadas.length})
          </summary>
          <div className="space-y-1.5 mt-2">
            {archivadas.map((r) => (
              <div key={r.id} className="bg-white/80 rounded-lg p-2.5 text-xs text-slate-600 border border-amber-200/60">
                <p className="line-through text-slate-500 font-medium">{r.content}</p>
                <div className="text-[10px] text-slate-500 mt-1 space-y-0.5">
                  <p>
                    Publicado por <strong>{nombres[r.createdBy] ?? r.createdBy}</strong>
                    {roles[r.createdBy] && (
                      <span className="ml-1 bg-slate-100 text-slate-600 px-1 rounded border border-slate-200 font-semibold">
                        {ETIQUETA_ROL[roles[r.createdBy]] ?? roles[r.createdBy]}
                      </span>
                    )}{' '}
                    · {fmtFecha(r.createdAt)}
                  </p>
                  {r.resolvedBy && (
                    <p className="text-red-700 font-medium">
                      Retirado por <strong>{nombres[r.resolvedBy] ?? r.resolvedBy}</strong>
                      {roles[r.resolvedBy] && (
                        <span className="ml-1 bg-red-50 text-red-700 px-1 rounded border border-red-200 font-semibold">
                          {ETIQUETA_ROL[roles[r.resolvedBy]] ?? roles[r.resolvedBy]}
                        </span>
                      )}
                      {r.resolvedAt ? ` · ${fmtFecha(r.resolvedAt)}` : ''}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}