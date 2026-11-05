import { guardarAntecedentes } from '@/app/dashboard/paciente/[id]/actions-clinicas'
import { TextareaConDeshacer } from '@/components/TextareaConDeshacer'

type Antecedentes = {
  pathological: string | null
  surgical: string | null
  family: string | null
  habits: string | null
  medications: string | null
  updatedBy: string | null
  updatedAt: Date
}

const ETIQUETA_ROL: Record<string, string> = {
  ADMIN: 'Administrador',
  DOCTOR: 'Médico',
  RESIDENT: 'Residente',
  NURSE: 'Enfermería',
  LAB: 'Laboratorio',
  READONLY: 'Solo lectura',
}

export function SeccionAntecedentes({
  episodeId,
  antecedentes,
  nombres,
  roles,
  puedeRegistrar,
}: {
  episodeId: string
  antecedentes: Antecedentes | null
  nombres: Record<string, string>
  roles: Record<string, string>
  puedeRegistrar: boolean
}) {
  const tieneDatos =
    antecedentes &&
    (antecedentes.pathological ||
      antecedentes.surgical ||
      antecedentes.family ||
      antecedentes.habits ||
      antecedentes.medications)

  const textareaClass = 'w-full px-2.5 py-1.5 border rounded-lg text-xs text-slate-900 focus:ring-1 focus:ring-blue-500'

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
      <h2 className="text-lg font-bold text-slate-800 border-b pb-2 mb-3">
        📋 Antecedentes del Paciente
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

          {/* FIRMA Y TRAZABILIDAD CLÍNICA */}
          {antecedentes.updatedBy && (
            <div className="mt-3 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500">
              <div>
                <span>Actualizado por: </span>
                <strong className="text-slate-700">{nombres[antecedentes.updatedBy] ?? antecedentes.updatedBy}</strong>
                {roles[antecedentes.updatedBy] && (
                  <span className="ml-1 bg-slate-100 text-slate-700 text-[10px] font-bold px-1.5 py-0.2 rounded border">
                    {ETIQUETA_ROL[roles[antecedentes.updatedBy]] ?? roles[antecedentes.updatedBy]}
                  </span>
                )}
              </div>
              <span className="text-slate-400 text-[10px]">
                {antecedentes.updatedAt.toLocaleString('es-DO', {
                  timeZone: 'America/Santo_Domingo',
                  day: '2-digit',
                  month: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
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
              <TextareaConDeshacer
                name="pathological"
                rows={2}
                defaultValue={antecedentes?.pathological ?? ''}
                placeholder="Ej. DM2 de 10 años de evolución, HTA..."
                className={textareaClass}
              />
            </div>
            
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Quirúrgicos</label>
              <TextareaConDeshacer
                name="surgical"
                rows={1}
                defaultValue={antecedentes?.surgical ?? ''}
                placeholder="Ej. Apendicectomía en 2012"
                className={textareaClass}
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Medicamentos habituales</label>
              <TextareaConDeshacer
                name="medications"
                rows={2}
                defaultValue={antecedentes?.medications ?? ''}
                placeholder="Ej. Losartán 50mg c/12h, Amlodipina 5mg..."
                className={textareaClass}
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Familiares</label>
              <TextareaConDeshacer
                name="family"
                rows={1}
                defaultValue={antecedentes?.family ?? ''}
                placeholder="Ej. Madre con ERC, Padre fallecido por IAM"
                className={textareaClass}
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Hábitos</label>
              <TextareaConDeshacer
                name="habits"
                rows={1}
                defaultValue={antecedentes?.habits ?? ''}
                placeholder="Ej. Tabaquismo negado, Alcohol ocasional"
                className={textareaClass}
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