import { guardarAntecedentes } from '@/app/dashboard/paciente/[id]/actions-clinicas'

type Antecedentes = {
  pathological: string | null
  surgical: string | null
  family: string | null
  habits: string | null
  medications: string | null
}

export function SeccionAntecedentes({
  episodeId,
  antecedentes,
  puedeRegistrar,
}: {
  episodeId: string
  antecedentes: Antecedentes | null
  puedeRegistrar: boolean
}) {
  const tieneDatos =
    antecedentes &&
    (antecedentes.pathological ||
      antecedentes.surgical ||
      antecedentes.family ||
      antecedentes.habits ||
      antecedentes.medications)

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
      <h2 className="text-lg font-bold text-slate-800 border-b pb-2 mb-3 flex items-center justify-between">
        <span>📋 Antecedentes del Paciente</span>
      </h2>

      {!tieneDatos ? (
        <p className="text-xs text-slate-400 py-1">No hay antecedentes registrados para este paciente.</p>
      ) : (
        <div className="space-y-2 text-xs text-slate-700 mb-3">
          {antecedentes.pathological && (
            <p>
              <strong className="text-slate-900">Patológicos:</strong> {antecedentes.pathological}
            </p>
          )}
          {antecedentes.surgical && (
            <p>
              <strong className="text-slate-900">Quirúrgicos:</strong> {antecedentes.surgical}
            </p>
          )}
          {antecedentes.family && (
            <p>
              <strong className="text-slate-900">Familiares:</strong> {antecedentes.family}
            </p>
          )}
          {antecedentes.medications && (
            <p>
              <strong className="text-slate-900">Medicamentos habituales:</strong> {antecedentes.medications}
            </p>
          )}
          {antecedentes.habits && (
            <p>
              <strong className="text-slate-900">Hábitos:</strong> {antecedentes.habits}
            </p>
          )}
        </div>
      )}

      {puedeRegistrar && (
        <details className="mt-3 pt-3 border-t">
          <summary className="text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer py-1">
            {tieneDatos ? '✏️ Editar antecedentes' : '+ Registrar antecedentes'}
          </summary>
          <form action={guardarAntecedentes} className="space-y-3 mt-3">
            <input type="hidden" name="episodeId" value={episodeId} />
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Patológicos</label>
              <textarea
                name="pathological"
                rows={2}
                defaultValue={antecedentes?.pathological ?? ''}
                placeholder="Ej. DM2 de 10 años de evolución, HTA..."
                className="w-full px-2.5 py-1.5 border rounded-lg text-xs text-slate-900"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Quirúrgicos</label>
              <textarea
                name="surgical"
                rows={1}
                defaultValue={antecedentes?.surgical ?? ''}
                placeholder="Ej. Apendicectomía en 2012"
                className="w-full px-2.5 py-1.5 border rounded-lg text-xs text-slate-900"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Medicamentos habituales</label>
              <textarea
                name="medications"
                rows={2}
                defaultValue={antecedentes?.medications ?? ''}
                placeholder="Ej. Losartán 50mg c/12h, Amlodipina 5mg..."
                className="w-full px-2.5 py-1.5 border rounded-lg text-xs text-slate-900"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Familiares</label>
              <textarea
                name="family"
                rows={1}
                defaultValue={antecedentes?.family ?? ''}
                placeholder="Ej. Madre con ERC, Padre fallecido por IAM"
                className="w-full px-2.5 py-1.5 border rounded-lg text-xs text-slate-900"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Hábitos</label>
              <textarea
                name="habits"
                rows={1}
                defaultValue={antecedentes?.habits ?? ''}
                placeholder="Ej. Tabaquismo negado, Alcohol ocasional"
                className="w-full px-2.5 py-1.5 border rounded-lg text-xs text-slate-900"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-slate-800 text-white py-2 rounded-lg text-xs font-bold hover:bg-slate-900 transition-colors"
            >
              Guardar Antecedentes
            </button>
          </form>
        </details>
      )}
    </div>
  )
}