'use client'

import { useState } from 'react'
import { guardarReporteEstudio } from '@/app/dashboard/paciente/[id]/actions-clinicas'
import { TextareaConDeshacer } from '@/components/TextareaConDeshacer'

type Estudio = {
  id: string
  studyType: string
  title: string
  studyDate: Date | null
  result: string
  createdBy: string
  createdAt: Date
}

export function ReportesEstudios({
  episodeId,
  estudios,
  nombres,
  puedeRegistrar,
}: {
  episodeId: string
  estudios: Estudio[]
  nombres: Record<string, string>
  puedeRegistrar: boolean
}) {
  const [abiertos, setAbiertos] = useState<Record<string, boolean>>({})
  const [formAbierto, setFormAbierto] = useState(false)

  const toggleEstudio = (id: string) => {
    setAbiertos((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <div className="flex justify-between items-center border-b pb-2 mb-4">
        <h2 className="text-lg font-bold text-slate-800">📑 Reportes de Estudios</h2>
        <span className="text-xs text-slate-500 font-semibold">{estudios.length} registrados</span>
      </div>

      {estudios.length === 0 ? (
        <p className="text-sm text-slate-400 py-3">No hay reportes de estudios registrados.</p>
      ) : (
        <div className="space-y-2.5 mb-4">
          {estudios.map((est) => {
            const estaAbierto = !!abiertos[est.id]
            return (
              <div key={est.id} className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50/40">
                <button
                  type="button"
                  onClick={() => toggleEstudio(est.id)}
                  className="w-full px-4 py-3 bg-slate-50 hover:bg-slate-100 flex flex-wrap items-center justify-between gap-2 text-left transition-colors cursor-pointer select-none"
                >
                  <div className="flex flex-wrap items-center gap-2 min-w-0">
                    <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2 py-0.5 rounded shrink-0">
                      {est.studyType}
                    </span>
                    <strong className="text-sm text-slate-800 truncate">{est.title}</strong>
                    {est.studyDate && (
                      <span className="text-xs text-slate-500">
                        ·{' '}
                        {new Date(est.studyDate).toLocaleDateString('es-DO', {
                          timeZone: 'America/Santo_Domingo',
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </span>
                    )}
                  </div>

                  <span className="text-xs font-bold text-slate-500 shrink-0">
                    {estaAbierto ? '▲ Colapsar' : '▼ Ver resultado'}
                  </span>
                </button>

                {estaAbierto && (
                  <div className="p-4 bg-white border-t border-slate-200 space-y-2">
                    <p className="text-sm text-slate-700 whitespace-pre-line bg-slate-50 p-3 rounded border border-slate-100">
                      {est.result}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Reportado por: <strong className="text-slate-600">{nombres[est.createdBy] ?? est.createdBy}</strong>
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {puedeRegistrar && (
        <div className="pt-3 border-t">
          {!formAbierto ? (
            <button
              type="button"
              onClick={() => setFormAbierto(true)}
              className="text-sm font-bold text-blue-600 hover:text-blue-800 cursor-pointer py-1"
            >
              + Agregar reporte de estudio
            </button>
          ) : (
            <form
              action={async (formData) => {
                await guardarReporteEstudio(formData)
                setFormAbierto(false)
              }}
              className="space-y-3 mt-2 bg-slate-50 p-4 rounded-xl border border-slate-200"
            >
              <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                <span className="text-xs font-bold text-slate-700 uppercase">Nuevo Reporte de Estudio</span>
                <button
                  type="button"
                  onClick={() => setFormAbierto(false)}
                  className="text-xs text-slate-400 hover:text-slate-600 font-semibold cursor-pointer"
                >
                  ✕ Cerrar
                </button>
              </div>
              <input type="hidden" name="episodeId" value={episodeId} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Tipo de Estudio</label>
                  <select name="studyType" required className="w-full px-3 py-2 border rounded-lg text-sm bg-white text-slate-900">
                    <option value="Sonografía">Sonografía / Ultrasonido</option>
                    <option value="Tomografía (TAC)">Tomografía (TAC)</option>
                    <option value="Radiografía (RX)">Radiografía (RX)</option>
                    <option value="Ecocardiograma">Ecocardiograma</option>
                    <option value="Doppler">Doppler vascular</option>
                    <option value="Biopsia">Biopsia</option>
                    <option value="Laboratorio">Laboratorio especial</option>
                    <option value="Otro">Otro estudio</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Fecha de realización</label>
                  <input name="studyDate" type="date" className="w-full px-3 py-2 border rounded-lg text-sm bg-white text-slate-900" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nombre / Título del estudio</label>
                <input
                  name="title"
                  required
                  placeholder="Ej. Sonografía renal y vías urinarias..."
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-white text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Conclusión / Hallazgos</label>
                <TextareaConDeshacer
                  name="result"
                  rows={3}
                  required
                  placeholder="Escribe los hallazgos principales y la conclusión..."
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-white text-slate-900 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  Guardar Reporte de Estudio
                </button>
                <button
                  type="button"
                  onClick={() => setFormAbierto(false)}
                  className="px-4 py-2.5 border rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  )
}