'use client'

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import type { DrainageItem } from '@/lib/cirugia-constants'

type RowState = {
  key: string
  name: string
  volumeMl: string
  notes: string
}

function buildInitialRows(initial?: DrainageItem[]): RowState[] {
  if (initial && initial.length > 0) {
    return initial.map((d, i) => ({
      key: `init-${i}`,
      name: d.name || 'Drenaje',
      volumeMl: d.volumeMl !== null && d.volumeMl !== undefined ? String(d.volumeMl) : '',
      notes: d.notes ?? '',
    }))
  }
  return [{ key: 'row-0', name: '', volumeMl: '', notes: '' }]
}

export function DrenajesMultiplesInput({
  initialDrainages,
  compact = false,
}: {
  initialDrainages?: DrainageItem[]
  compact?: boolean
}) {
  const [rows, setRows] = useState<RowState[]>(() => buildInitialRows(initialDrainages))

  const serialized = JSON.stringify(
    rows
      .map((r) => ({
        name: r.name.trim() || (r.volumeMl.trim() || r.notes.trim() ? 'Drenaje' : ''),
        volumeMl:
          r.volumeMl.trim() !== '' && Number.isFinite(Number(r.volumeMl))
            ? Math.round(Number(r.volumeMl))
            : null,
        notes: r.notes.trim() || null,
      }))
      .filter((r) => r.name !== '' || r.volumeMl !== null || r.notes !== null)
  )

  const totalMl = rows.reduce((sum, r) => {
    const n = Number(r.volumeMl)
    return r.volumeMl.trim() !== '' && Number.isFinite(n) && n >= 0 ? sum + Math.round(n) : sum
  }, 0)

  const agregarFila = () => {
    setRows((prev) => [
      ...prev,
      { key: `row-${Date.now()}-${prev.length}`, name: '', volumeMl: '', notes: '' },
    ])
  }

  const eliminarFila = (key: string) => {
    setRows((prev) => {
      if (prev.length <= 1) return [{ key: 'row-0', name: '', volumeMl: '', notes: '' }]
      return prev.filter((r) => r.key !== key)
    })
  }

  const actualizar = (key: string, campo: 'name' | 'volumeMl' | 'notes', valor: string) => {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, [campo]: valor } : r)))
  }

  return (
    <div className={compact ? 'col-span-2 space-y-1.5' : 'col-span-2 space-y-2'}>
      <input type="hidden" name="drainagesJson" value={serialized} />

      <div className="flex items-center justify-between gap-2">
        <label className="block text-xs font-bold text-orange-800">
          Drenajes ({rows.length}){totalMl > 0 ? ` · Total: ${totalMl} mL` : ''}
        </label>
        <button
          type="button"
          onClick={agregarFila}
          className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 cursor-pointer"
        >
          <Plus className="w-3 h-3" />
          <span>Agregar otro</span>
        </button>
      </div>

      <div className="space-y-2">
        {rows.map((r, idx) => (
          <div
            key={r.key}
            className="bg-orange-50/40 border border-orange-200/70 rounded-lg p-2 space-y-1.5"
          >
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-orange-700 shrink-0">#{idx + 1}</span>
              <input
                type="text"
                value={r.name}
                onChange={(e) => actualizar(r.key, 'name', e.target.value)}
                placeholder="Tipo / sitio (ej. Penrose FID, Sonda pleural)"
                className="flex-1 min-w-0 px-2 py-1 border border-slate-300 rounded text-xs bg-white text-slate-900"
              />
              <input
                type="number"
                inputMode="numeric"
                min={0}
                max={15000}
                value={r.volumeMl}
                onChange={(e) => actualizar(r.key, 'volumeMl', e.target.value)}
                placeholder="mL"
                className="w-16 px-2 py-1 border border-slate-300 rounded text-xs bg-white text-slate-900 tabular-nums"
              />
              {rows.length > 1 && (
                <button
                  type="button"
                  onClick={() => eliminarFila(r.key)}
                  title="Quitar drenaje"
                  className="text-red-600 hover:text-red-800 p-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <input
              type="text"
              value={r.notes}
              onChange={(e) => actualizar(r.key, 'notes', e.target.value)}
              placeholder="Característica (ej. serohemático, bilioso, purulento)"
              className="w-full px-2 py-1 border border-slate-200 rounded text-[11px] bg-white text-slate-900"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
