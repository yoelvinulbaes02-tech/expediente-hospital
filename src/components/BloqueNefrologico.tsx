import {
  registrarTFG,
  guardarVirales,
  guardarAccesoVascular,
} from '@/app/dashboard/paciente/[id]/actions-clinicas'

type Acceso = {
  id: string
  type: string
  site: string | null
  placementDate: Date | null
  notes: string | null
}

type Serologia = {
  status: string
  details: string | null
}

type Gfr = {
  value: number
  createdAt: Date
}

export function BloqueNefrologico({
  episodeId,
  acceso,
  virales,
  tfgActual,
  puedeRegistrar,
}: {
  episodeId: string
  acceso: Acceso | null
  virales: Serologia | null
  tfgActual: Gfr | null
  puedeRegistrar: boolean
}) {
  // Cálculo de días de colocación del acceso
  let diasAcceso: number | null = null
  if (acceso?.placementDate) {
    const diff = new Date().getTime() - new Date(acceso.placementDate).getTime()
    diasAcceso = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)))
  }

  const esViralNegativo = !virales || virales.status === 'negativo'

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 mb-6">
      <h2 className="text-base font-bold text-slate-800 border-b pb-2 mb-4 flex items-center justify-between">
        <span>🩺 Acceso Vascular, Virales y TFG</span>
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 1. ACCESO VASCULAR */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Acceso Vascular
          </span>
          {acceso ? (
            <div>
              <p className="text-sm font-bold text-slate-800">{acceso.type}</p>
              <p className="text-xs text-slate-600">{acceso.site ?? 'Sitio no especificado'}</p>
              {acceso.placementDate && (
                <p className="text-xs font-semibold text-indigo-700 mt-1">
                  📅 Colocado hace {diasAcceso} día{diasAcceso === 1 ? '' : 's'}
                </p>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">Sin acceso vascular registrado.</p>
          )}

          {puedeRegistrar && (
            <details className="mt-2 pt-2 border-t border-slate-200">
              <summary className="text-xs font-medium text-blue-600 hover:text-blue-800 cursor-pointer">
                {acceso ? 'Cambiar / Actualizar acceso' : '+ Registrar acceso'}
              </summary>
              <form action={guardarAccesoVascular} className="space-y-2 mt-2">
                <input type="hidden" name="episodeId" value={episodeId} />
                <select name="type" required className="w-full px-2 py-1.5 border rounded text-xs bg-white text-slate-900">
                  <option value="Catéter Tunelizado">Catéter Tunelizado</option>
                  <option value="Catéter Temporal">Catéter Temporal</option>
                  <option value="Fístula Arteriovenosa (FAV)">Fístula Arteriovenosa (FAV)</option>
                  <option value="Injerto Vascular">Injerto Vascular</option>
                  <option value="Vía Periférica">Vía Periférica</option>
                  <option value="Otro">Otro</option>
                </select>
                <input
                  name="site"
                  placeholder="Sitio (ej. Yugular interna der)"
                  className="w-full px-2 py-1.5 border rounded text-xs text-slate-900"
                />
                <label className="block text-[11px] text-slate-500">Fecha de colocación:</label>
                <input
                  name="placementDate"
                  type="date"
                  className="w-full px-2 py-1.5 border rounded text-xs text-slate-900"
                />
                <button className="w-full bg-slate-800 text-white text-xs py-1.5 rounded font-medium hover:bg-slate-900">
                  Guardar Acceso
                </button>
              </form>
            </details>
          )}
        </div>

        {/* 2. MARCADORES VIRALES */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Marcadores Virales
          </span>
          {esViralNegativo ? (
            <div className="flex items-center gap-2">
              <span className="text-emerald-600 font-bold text-base">🛡️</span>
              <div>
                <p className="text-sm font-bold text-emerald-800">Negativo / No Reactivo</p>
                <p className="text-[11px] text-slate-500">VIH, Hepatitis B y C negativos</p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2">
              <span className="text-red-600 font-bold text-base">☣️</span>
              <div>
                <p className="text-sm font-bold text-red-800">Reactivo / Positivo</p>
                <p className="text-xs text-red-700 font-semibold">{virales.details}</p>
              </div>
            </div>
          )}

          {puedeRegistrar && (
            <details className="mt-2 pt-2 border-t border-slate-200">
              <summary className="text-xs font-medium text-blue-600 hover:text-blue-800 cursor-pointer">
                Actualizar virales
              </summary>
              <form action={guardarVirales} className="space-y-2 mt-2">
                <input type="hidden" name="episodeId" value={episodeId} />
                <select name="status" className="w-full px-2 py-1.5 border rounded text-xs bg-white text-slate-900">
                  <option value="negativo">Negativo (No reactivo)</option>
                  <option value="positivo">Positivo / Reactivo</option>
                  <option value="pendiente">Pendiente de resultados</option>
                </select>
                <input
                  name="details"
                  placeholder="Especifique si es positivo (ej. VHC +)"
                  className="w-full px-2 py-1.5 border rounded text-xs text-slate-900"
                />
                <button className="w-full bg-slate-800 text-white text-xs py-1.5 rounded font-medium hover:bg-slate-900">
                  Actualizar Virales
                </button>
              </form>
            </details>
          )}
        </div>

        {/* 3. TFG */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
            Tasa Filtración Glomerular (TFG)
          </span>
          {tfgActual ? (
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-sky-800">{tfgActual.value}</span>
                <span className="text-xs font-medium text-slate-500">mL/min/1.73m²</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Última medición:{' '}
                {tfgActual.createdAt.toLocaleDateString('es-DO', {
                  timeZone: 'America/Santo_Domingo',
                  day: '2-digit',
                  month: '2-digit',
                })}
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">Sin TFG registrada.</p>
          )}

          {puedeRegistrar && (
            <details className="mt-2 pt-2 border-t border-slate-200">
              <summary className="text-xs font-medium text-blue-600 hover:text-blue-800 cursor-pointer">
                + Nueva medición de TFG
              </summary>
              <form action={registrarTFG} className="flex gap-2 mt-2">
                <input type="hidden" name="episodeId" value={episodeId} />
                <input
                  name="gfr"
                  type="number"
                  step="0.1"
                  required
                  placeholder="Ej. 14.5"
                  className="flex-1 px-2 py-1.5 border rounded text-xs text-slate-900"
                />
                <button className="bg-sky-600 text-white text-xs px-3 py-1.5 rounded font-medium hover:bg-sky-700">
                  Guardar
                </button>
              </form>
            </details>
          )}
        </div>
      </div>
    </div>
  )
}