'use client'

import { useState } from 'react'
import { Scale, Ruler, Calculator } from 'lucide-react'
import { calcularImc } from '@/lib/cirugia-constants'
import { guardarAntropometria } from '@/app/dashboard/paciente/[id]/actions-clinicas'

const fmtFechaHora = (d: Date | string) =>
  new Date(d).toLocaleString('es-DO', {
    timeZone: 'America/Santo_Domingo',
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })

export function AntropometriaCard({
  episodeId,
  initialWeight,
  initialWeightUnit,
  initialHeightCm,
  updatedBy,
  updatedAt,
  nombres,
  puedeRegistrar,
  compact = false,
}: {
  episodeId: string
  initialWeight: number | null
  initialWeightUnit: string | null
  initialHeightCm: number | null
  updatedBy: string | null
  updatedAt: Date | string | null
  nombres: Record<string, string>
  puedeRegistrar: boolean
  compact?: boolean
}) {
  const [pesoInput, setPesoInput] = useState<string>(
    initialWeight !== null && initialWeight !== undefined ? String(initialWeight) : ''
  )
  const [unidadInput, setUnidadInput] = useState<'kg' | 'lb'>(
    initialWeightUnit === 'lb' ? 'lb' : 'kg'
  )
  const [tallaInput, setTallaInput] = useState<string>(
    initialHeightCm !== null && initialHeightCm !== undefined ? String(initialHeightCm) : ''
  )
  const [editando, setEditando] = useState(false)

  const guardado = calcularImc(initialWeight, initialWeightUnit, initialHeightCm)
  const pesoPreview = pesoInput ? parseFloat(pesoInput) : null
  const tallaPreview = tallaInput ? parseFloat(tallaInput) : null
  const preview = calcularImc(
    pesoPreview && Number.isFinite(pesoPreview) ? pesoPreview : null,
    unidadInput,
    tallaPreview && Number.isFinite(tallaPreview) ? tallaPreview : null
  )

  if (compact) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-col justify-between">
        <div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <Scale className="w-3.5 h-3.5 text-teal-600" />
            <span>Antropometría (Peso, Talla e IMC)</span>
          </span>

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-white border border-slate-200 rounded-md px-2 py-1.5">
              <p className="text-[10px] font-semibold text-slate-500">Peso</p>
              <p className="text-sm font-black text-slate-900 tabular-nums mt-0.5">
                {initialWeight ? `${initialWeight} ${initialWeightUnit ?? 'kg'}` : '—'}
              </p>
              {initialWeight && initialWeightUnit === 'lb' && guardado.pesoKg !== null && (
                <p className="text-[10px] text-slate-400 tabular-nums">
                  {guardado.pesoKg.toFixed(1)} kg
                </p>
              )}
            </div>

            <div className="bg-white border border-slate-200 rounded-md px-2 py-1.5">
              <p className="text-[10px] font-semibold text-slate-500">Talla</p>
              <p className="text-sm font-black text-slate-900 tabular-nums mt-0.5">
                {initialHeightCm ? `${initialHeightCm} cm` : '—'}
              </p>
              {initialHeightCm && (
                <p className="text-[10px] text-slate-400 tabular-nums">
                  {(initialHeightCm / 100).toFixed(2)} m
                </p>
              )}
            </div>

            <div className="bg-white border border-slate-200 rounded-md px-2 py-1.5">
              <p className="text-[10px] font-semibold text-slate-500">IMC</p>
              <p className="text-sm font-black text-teal-800 tabular-nums mt-0.5">
                {guardado.imc !== null ? guardado.imc.toFixed(1) : '—'}
              </p>
              {guardado.imc !== null && (
                <span
                  className={`inline-block text-[9px] font-bold px-1.5 py-0.2 rounded border mt-0.5 ${guardado.clase}`}
                >
                  {guardado.categoria}
                </span>
              )}
            </div>
          </div>

          {updatedBy && updatedAt && (
            <div className="mt-2 pt-1.5 border-t border-slate-200 text-[11px] text-slate-500">
              <span>Registró: </span>
              <strong className="text-slate-700">{nombres[updatedBy] ?? updatedBy}</strong>
              <span className="block text-[10px] text-slate-400">{fmtFechaHora(updatedAt)}</span>
            </div>
          )}
        </div>

        {puedeRegistrar && (
          <div className="mt-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setEditando((v) => !v)}
              className="text-xs font-medium text-blue-600 hover:text-blue-800 cursor-pointer"
            >
              {editando
                ? 'Cerrar'
                : initialWeight || initialHeightCm
                  ? 'Actualizar'
                  : '+ Registrar peso y talla'}
            </button>

            {editando && (
              <form
                action={async (formData) => {
                  await guardarAntropometria(formData)
                  setEditando(false)
                }}
                className="space-y-2 mt-2"
              >
                <input type="hidden" name="episodeId" value={episodeId} />
                <div className="flex gap-1.5">
                  <input
                    name="anthropometryWeight"
                    type="number"
                    step="0.1"
                    min="1"
                    max="500"
                    value={pesoInput}
                    onChange={(e) => setPesoInput(e.target.value)}
                    placeholder="Peso"
                    className="flex-1 min-w-0 px-2 py-1.5 border rounded text-xs bg-white text-slate-900 tabular-nums"
                  />
                  <select
                    name="anthropometryWeightUnit"
                    value={unidadInput}
                    onChange={(e) => setUnidadInput(e.target.value as 'kg' | 'lb')}
                    className="w-14 px-1 py-1.5 border rounded text-xs font-bold bg-white text-slate-900"
                  >
                    <option value="kg">kg</option>
                    <option value="lb">lb</option>
                  </select>
                </div>
                <input
                  name="anthropometryHeightCm"
                  type="number"
                  step="0.5"
                  min="30"
                  max="260"
                  value={tallaInput}
                  onChange={(e) => setTallaInput(e.target.value)}
                  placeholder="Talla en cm (ej. 170)"
                  className="w-full px-2 py-1.5 border rounded text-xs bg-white text-slate-900 tabular-nums"
                />
                {preview.imc !== null && (
                  <p className="text-[11px] font-bold text-teal-800 bg-teal-50 border border-teal-200 rounded px-2 py-1 tabular-nums">
                    IMC: {preview.imc.toFixed(1)} kg/m² · {preview.categoria}
                  </p>
                )}
                <button
                  type="submit"
                  className="w-full bg-teal-700 text-white text-xs py-1.5 rounded font-medium hover:bg-teal-800 cursor-pointer"
                >
                  Guardar Antropometría
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 mb-6 print:hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-3 mb-4">
        <div>
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Scale className="w-4 h-4 text-teal-600" />
            <span>Antropometría y Cálculo Automático de IMC</span>
          </h2>
          {updatedBy && updatedAt && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Actualizó: <strong className="text-slate-700 dark:text-slate-200">{nombres[updatedBy] ?? updatedBy}</strong> · {fmtFechaHora(updatedAt)}
            </p>
          )}
        </div>

        {puedeRegistrar && (
          <button
            type="button"
            onClick={() => setEditando((v) => !v)}
            className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-3.5 py-2 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
          >
            {editando ? 'Cerrar edición' : initialWeight || initialHeightCm ? 'Editar Peso / Talla' : '+ Registrar Peso y Talla'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg p-3.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <Scale className="w-3.5 h-3.5 text-emerald-600" />
            <span>Peso Corporal</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
            {initialWeight ? `${initialWeight} ${initialWeightUnit ?? 'kg'}` : 'Sin registrar'}
          </p>
          {initialWeight && initialWeightUnit === 'lb' && guardado.pesoKg !== null && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 tabular-nums">
              Equivalente: {guardado.pesoKg.toFixed(1)} kg
            </p>
          )}
        </div>

        <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg p-3.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <Ruler className="w-3.5 h-3.5 text-blue-600" />
            <span>Talla</span>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
            {initialHeightCm ? `${initialHeightCm} cm` : 'Sin registrar'}
          </p>
          {initialHeightCm && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 tabular-nums">
              {(initialHeightCm / 100).toFixed(2)} m
            </p>
          )}
        </div>

        <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg p-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <Calculator className="w-3.5 h-3.5 text-teal-600" />
              <span>Índice de Masa Corporal (IMC)</span>
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1 tabular-nums">
              {guardado.imc !== null ? (
                <>
                  {guardado.imc.toFixed(1)}{' '}
                  <span className="text-xs font-normal text-slate-500">kg/m²</span>
                </>
              ) : (
                'Pendiente'
              )}
            </p>
          </div>
          <div className="mt-2">
            <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded border ${guardado.clase}`}>
              {guardado.categoria}
            </span>
          </div>
        </div>
      </div>

      {puedeRegistrar && editando && (
        <form
          action={async (formData) => {
            await guardarAntropometria(formData)
            setEditando(false)
          }}
          className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end"
        >
          <input type="hidden" name="episodeId" value={episodeId} />

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Peso
            </label>
            <div className="flex gap-1.5">
              <input
                name="anthropometryWeight"
                type="number"
                step="0.1"
                min="1"
                max="500"
                value={pesoInput}
                onChange={(e) => setPesoInput(e.target.value)}
                placeholder="Ej. 72.5"
                className="flex-1 px-2.5 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white tabular-nums"
              />
              <select
                name="anthropometryWeightUnit"
                value={unidadInput}
                onChange={(e) => setUnidadInput(e.target.value as 'kg' | 'lb')}
                className="w-16 px-2 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white"
              >
                <option value="kg">kg</option>
                <option value="lb">lb</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Talla (cm)
            </label>
            <input
              name="anthropometryHeightCm"
              type="number"
              step="0.5"
              min="30"
              max="260"
              value={tallaInput}
              onChange={(e) => setTallaInput(e.target.value)}
              placeholder="Ej. 170"
              className="w-full px-2.5 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white tabular-nums"
            />
          </div>

          <div className="bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 rounded-lg px-3 py-2">
            <p className="text-[11px] font-semibold text-teal-900 dark:text-teal-200">
              Vista previa IMC automático
            </p>
            <p className="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
              {preview.imc !== null ? `${preview.imc.toFixed(1)} kg/m² · ${preview.categoria}` : 'Ingresa peso y talla'}
            </p>
          </div>

          <button
            type="submit"
            className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-colors cursor-pointer"
          >
            Guardar Antropometría
          </button>
        </form>
      )}
    </div>
  )
}
