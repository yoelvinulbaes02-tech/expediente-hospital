'use client'

import { useState } from 'react'
import {
  guardarReporteLaboratorio,
  editarReporteLaboratorio,
  eliminarReporteLaboratorio,
} from '@/app/dashboard/paciente/[id]/actions-clinicas'

type Reporte = {
  id: string
  category: string
  testName: string
  sampleDate: Date | string | null
  result: string
  createdBy: string
  createdAt: Date | string
}

const CATEGORIAS_LAB = [
  'Hematología',
  'Química Sanguínea',
  'Uroanálisis',
  'Gases Arteriales',
  'Cultivos / Microbiología',
  'Inmunología / Serología',
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

export function ReportesLaboratorio({
  episodeId,
  reportes,
  nombres,
  roles,
  puedeRegistrar,
}: {
  episodeId: string
  reportes: Reporte[]
  nombres: Record<string, string>
  roles: Record<string, string>
  puedeRegistrar: boolean
}) {
  const [abiertoNuevo, setAbiertoNuevo] = useState(false)
  const [reporteAEditar, setReporteAEditar] = useState<Reporte | null>(null)
  const [reporteABorrar, setReporteABorrar] = useState<Reporte | null>(null)
  const [categoriaSel, setCategoriaSel] = useState('Hematología')
  const [testSel, setTestSel] = useState('')

  return (
    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-2 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🧪</span>
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
            Reportes de Laboratorio y Cultivos
          </h2>
          <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 text-xs font-bold px-2 py-0.5 rounded-full">
            {reportes.length}
          </span>
        </div>

        {puedeRegistrar && (
          <button
            type="button"
            onClick={() => setAbiertoNuevo(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition-colors shadow-2xs cursor-pointer"
          >
            + Registrar Analítica o Cultivo
          </button>
        )}
      </div>

      {/* LISTA DE ANALÍTICAS Y CULTIVOS */}
      <div className="space-y-3">
        {reportes.map((rep) => (
          <div
            key={rep.id}
            className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all bg-slate-50/50 dark:bg-slate-900/30 space-y-1.5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-black px-2 py-0.5 rounded ${
                  rep.category === 'Cultivos / Microbiología'
                    ? 'bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-300'
                    : 'bg-blue-100 text-blue-900 dark:bg-blue-900/50 dark:text-blue-300'
                }`}>
                  {rep.category}
                </span>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                  {rep.testName}
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500 font-semibold">
                  📅 {fmtFecha(rep.sampleDate)}
                </span>
                {puedeRegistrar && (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setReporteAEditar(rep)}
                      className="text-xs text-blue-600 hover:text-blue-800 font-bold p-1 cursor-pointer"
                      title="Editar analítica"
                    >
                      ✏️
                    </button>
                    <button
                      type="button"
                      onClick={() => setReporteABorrar(rep)}
                      className="text-xs text-red-600 hover:text-red-800 font-bold p-1 cursor-pointer"
                      title="Borrar analítica"
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </div>
            </div>

            <p className="text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-mono bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 leading-relaxed">
              {rep.result}
            </p>

            <p className="text-[10px] text-slate-400 dark:text-slate-500 pt-0.5">
              Registró: <strong>{nombres[rep.createdBy] ?? rep.createdBy}</strong>
              {roles[rep.createdBy] && ` (${roles[rep.createdBy]})`}
            </p>
          </div>
        ))}

        {reportes.length === 0 && (
          <p className="text-xs text-slate-400 italic text-center py-4 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
            No hay reportes de laboratorio o cultivos registrados en este expediente.
          </p>
        )}
      </div>

      {/* MODAL REGISTRAR NUEVO (CON CULTIVOS Y OPCIÓN OTRO) */}
      {abiertoNuevo && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <span>🧪</span> Nuevo Reporte de Laboratorio o Cultivo
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
                await guardarReporteLaboratorio(formData)
                setAbiertoNuevo(false)
              }}
              className="space-y-2.5"
            >
              <input type="hidden" name="episodeId" value={episodeId} />
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Categoría *
                </label>
                <select
                  name="category"
                  value={categoriaSel}
                  onChange={(e) => setCategoriaSel(e.target.value)}
                  className="w-full px-2.5 py-1.5 border rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                >
                  {CATEGORIAS_LAB.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Nombre del Estudio / Cultivo *
                </label>
                {categoriaSel === 'Cultivos / Microbiología' ? (
                  <div className="space-y-1.5">
                    <select
                      name="testName"
                      value={testSel}
                      onChange={(e) => setTestSel(e.target.value)}
                      className="w-full px-2.5 py-1.5 border rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                    >
                      <option value="Urocultivo">Urocultivo</option>
                      <option value="Hemocultivo">Hemocultivo</option>
                      <option value="Cultivo de Punta de Catéter">Cultivo de Punta de Catéter</option>
                      <option value="Cultivo de Secreción">Cultivo de Secreción</option>
                      <option value="OTRO">Otro tipo de cultivo (Escribir cuál)...</option>
                    </select>
                    {testSel === 'OTRO' && (
                      <input
                        name="customTest"
                        required
                        placeholder="Ej. Coprocultivo, Cultivo de LCR, Cultivo de Herida..."
                        className="w-full px-2.5 py-1.5 border rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                      />
                    )}
                  </div>
                ) : (
                  <input
                    name="testName"
                    required
                    placeholder="Ej. Hemograma, Creatinina, Electrolitos..."
                    className="w-full px-2.5 py-1.5 border rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                  />
                )}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Fecha de Toma de Muestra
                </label>
                <input
                  name="sampleDate"
                  type="date"
                  className="w-full px-2.5 py-1.5 border rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Resultados / Antibiograma *
                </label>
                <textarea
                  name="result"
                  required
                  rows={4}
                  placeholder={categoriaSel === 'Cultivos / Microbiología' ? 'Ej. Germen aislado: E. coli > 100,000 UFC/mL\nSensible a: Meropenem, Amikacina\nResistente a: Ciprofloxacina...' : 'Ej. Hb: 10.2, Hto: 31%, Leucos: 8,500...'}
                  className="w-full px-2.5 py-1.5 border rounded-lg text-xs font-mono bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
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
                  className="bg-blue-600 text-white font-bold text-xs px-4 py-1.5 rounded-lg shadow-sm cursor-pointer"
                >
                  Guardar Reporte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDITAR ANALÍTICA */}
      {reporteAEditar && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-700 space-y-3">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 border-b pb-2">
              ✏️ Modificar / Corregir Analítica
            </h3>
            <form
              action={async (formData) => {
                await editarReporteLaboratorio(formData)
                setReporteAEditar(null)
              }}
              className="space-y-2.5"
            >
              <input type="hidden" name="episodeId" value={episodeId} />
              <input type="hidden" name="reportId" value={reporteAEditar.id} />
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">Nombre</label>
                <input
                  name="testName"
                  defaultValue={reporteAEditar.testName}
                  required
                  className="w-full px-2.5 py-1.5 border rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">Categoría</label>
                <select
                  name="category"
                  defaultValue={reporteAEditar.category}
                  className="w-full px-2.5 py-1.5 border rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                >
                  {CATEGORIAS_LAB.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">Resultado</label>
                <textarea
                  name="result"
                  defaultValue={reporteAEditar.result}
                  required
                  rows={4}
                  className="w-full px-2.5 py-1.5 border rounded-lg text-xs font-mono bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReporteAEditar(null)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white font-bold text-xs px-4 py-1.5 rounded-lg shadow-sm cursor-pointer"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMAR BORRADO CON AUDITORÍA */}
      {reporteABorrar && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl max-w-sm w-full shadow-2xl border border-red-200 dark:border-red-800 space-y-3">
            <h3 className="text-sm font-bold text-red-700 dark:text-red-400">
              🗑️ ¿Eliminar Analítica o Cultivo?
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              ¿Seguro de eliminar <strong>&quot;{reporteABorrar.testName}&quot;</strong>? Esta acción quedará registrada en el historial de auditoría indicando su usuario y hora exacta.
            </p>
            <form
              action={async (formData) => {
                await eliminarReporteLaboratorio(formData)
                setReporteABorrar(null)
              }}
              className="flex justify-end gap-2 pt-2 border-t"
            >
              <input type="hidden" name="episodeId" value={episodeId} />
              <input type="hidden" name="reportId" value={reporteABorrar.id} />
              <button
                type="button"
                onClick={() => setReporteABorrar(null)}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-4 py-1.5 rounded-lg shadow-sm cursor-pointer"
              >
                Sí, Eliminar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}