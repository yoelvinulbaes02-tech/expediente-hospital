'use client'

import { useState } from 'react'
import { guardarReporteEstudio } from '@/app/dashboard/paciente/[id]/actions-clinicas'

type Estudio = {
  id: string
  studyType: string
  title: string
  studyDate: Date | string | null
  result: string
  createdBy: string
  createdAt: Date | string
}

const TIPOS_ESTUDIO = [
  'Sonografía / Ecografía',
  'Radiografía (Rayos X)',
  'Tomografía (TAC)',
  'Resonancia Magnética (RMN)',
  'Ecocardiograma',
  'Endoscopía / Colonoscopía',
  'Otro',
]

const fmtFecha = (d: Date | string | null) => {
  if (!d) return ''
  const f = new Date(d)
  return f.toLocaleDateString('es-DO', {
    timeZone: 'America/Santo_Domingo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
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
  const [abiertoNuevo, setAbiertoNuevo] = useState(false)
  const [expandidos, setExpandidos] = useState<Record<string, boolean>>({})

  const toggleExpandido = (id: string) => {
    setExpandidos((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-2 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🩻</span>
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
            Estudios e Imágenes Médicas
          </h2>
          <span className="bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 text-xs font-bold px-2 py-0.5 rounded-full">
            {estudios.length}
          </span>
        </div>

        {puedeRegistrar && (
          <button
            type="button"
            onClick={() => setAbiertoNuevo(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition-colors shadow-2xs cursor-pointer"
          >
            + Registrar Estudio / Imagen
          </button>
        )}
      </div>

      {/* LISTA PLEGABLE EN ACORDEÓN (RETRACTIL) */}
      <div className="space-y-2.5">
        {estudios.map((est) => {
          const estaAbierto = expandidos[est.id] ?? true

          return (
            <div
              key={est.id}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 overflow-hidden"
            >
              {/* CABECERA CLICABLE PARA PLEGAR/DESPLEGAR */}
              <button
                type="button"
                onClick={() => toggleExpandido(est.id)}
                className="w-full p-3 flex items-center justify-between gap-2 text-left hover:bg-slate-100/70 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
              >
                <div className="flex flex-wrap items-center gap-2 min-w-0">
                  <span className="text-xs font-black px-2 py-0.5 rounded bg-purple-100 text-purple-900 dark:bg-purple-900/50 dark:text-purple-300">
                    {est.studyType}
                  </span>
                  <strong className="text-xs sm:text-sm text-slate-800 dark:text-slate-100 truncate">
                    {est.title}
                  </strong>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-slate-500 font-semibold">
                    📅 {fmtFecha(est.studyDate)}
                  </span>
                  <span className="text-slate-400 text-xs font-bold">
                    {estaAbierto ? '▲' : '▼'}
                  </span>
                </div>
              </button>

              {/* CONTENIDO DESPLEGABLE */}
              {estaAbierto && (
                <div className="p-3 pt-0 border-t border-slate-200/60 dark:border-slate-700/60 mt-1 space-y-1.5">
                  <p className="text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 leading-relaxed font-mono">
                    {est.result}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Registrado por: <strong>{nombres[est.createdBy] ?? est.createdBy}</strong>
                  </p>
                </div>
              )}
            </div>
          )
        })}

        {estudios.length === 0 && (
          <p className="text-xs text-slate-400 italic text-center py-4 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
            No hay estudios o imágenes médicas registradas en este expediente.
          </p>
        )}
      </div>

      {/* MODAL REGISTRAR NUEVO ESTUDIO */}
      {abiertoNuevo && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <span>🩻</span> Nuevo Reporte de Estudio o Imagen
              </h3>
              <button
                type="button"
                onClick={() => setAbiertoNuevo(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold leading-none cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form
              action={async (formData) => {
                await guardarReporteEstudio(formData)
                setAbiertoNuevo(false)
              }}
              className="space-y-2.5"
            >
              <input type="hidden" name="episodeId" value={episodeId} />
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Tipo de Estudio *
                </label>
                <select
                  name="studyType"
                  className="w-full px-2.5 py-1.5 border rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                >
                  {TIPOS_ESTUDIO.map((tipo) => (
                    <option key={tipo} value={tipo}>{tipo}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Nombre del Estudio *
                </label>
                <input
                  name="title"
                  required
                  placeholder="Ej. Sonografía Renal, Rx Tórax PA, TAC Abdomen..."
                  className="w-full px-2.5 py-1.5 border rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Fecha de Realización
                </label>
                <input
                  name="studyDate"
                  type="date"
                  className="w-full px-2.5 py-1.5 border rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Informe / Conclusión del Estudio *
                </label>
                <textarea
                  name="result"
                  required
                  rows={4}
                  placeholder="Ej. Riñones de tamaño disminuido con aumento difuso de ecogenicidad cortical. Sin ectasia ni litiasis..."
                  className="w-full px-2.5 py-1.5 border rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAbiertoNuevo(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-4 py-1.5 rounded-lg shadow-sm cursor-pointer"
                >
                  Guardar Estudio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}