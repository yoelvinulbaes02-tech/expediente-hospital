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
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <div className="flex justify-between items-center border-b pb-2 mb-4">
        <h2 className="text-lg font-bold text-slate-800">📑 Reportes de Estudios</h2>
        <span className="text-xs text-slate-500 font-semibold">{estudios.length} registrados</span>
      </div>

      {estudios.length === 0 ? (
        <p className="text-sm text-slate-400 py-3">No hay reportes de estudios registrados.</p>
      ) : (
        <div className="space-y-4 mb-4">
          {estudios.map((est) => (
            <div key={est.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
              <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                <div>
                  <span className="bg-indigo-100 text-indigo-800 text-xs font-bold px-2 py-0.5 rounded mr-2">
                    {est.studyType}
                  </span>
                  <strong className="text-sm text-slate-800">{est.title}</strong>
                </div>
                {est.studyDate && (
                  <span className="text-xs text-slate-500">
                    Fecha:{' '}
                    {est.studyDate.toLocaleDateString('es-DO', {
                      timeZone: 'America/Santo_Domingo',
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-700 whitespace-pre-line bg-white p-3 rounded border border-slate-100">
                {est.result}
              </p>
              <p className="text-[11px] text-slate-400 mt-2">
                Reportado por: {nombres[est.createdBy] ?? est.createdBy}
              </p>
            </div>
          ))}
        </div>
      )}

      {puedeRegistrar && (
        <details className="pt-3 border-t">
          <summary className="text-sm font-bold text-blue-600 hover:text-blue-800 cursor-pointer py-1">
            + Agregar reporte de estudio
          </summary>
          <form action={guardarReporteEstudio} className="space-y-3 mt-3">
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
                <input name="studyDate" type="date" className="w-full px-3 py-2 border rounded-lg text-sm text-slate-900" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Nombre / Título del estudio</label>
              <input
                name="title"
                required
                placeholder="Ej. Sonografía renal y vías urinarias..."
                className="w-full px-3 py-2 border rounded-lg text-sm text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Conclusión / Hallazgos</label>
              <TextareaConDeshacer
                name="result"
                rows={3}
                required
                placeholder="Escribe los hallazgos principales y la conclusión..."
                className="w-full px-3 py-2 border rounded-lg text-sm text-slate-900 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              Guardar Reporte de Estudio
            </button>
          </form>
        </details>
      )}
    </div>
  )
}