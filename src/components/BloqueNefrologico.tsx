import {
  registrarTFG,
  guardarVirales,
  guardarAccesoVascular,
  guardarTipificacion,
} from '@/app/dashboard/paciente/[id]/actions-clinicas'

type Acceso = {
  id: string
  type: string
  site: string | null
  placementDate: Date | null
  unknownPlacementDate: boolean
  notes: string | null
  createdBy: string
  createdAt: Date
}

type Serologia = {
  status: string
  details: string | null
  recordedBy: string
  updatedAt: Date
}

type Gfr = {
  value: number
  recordedBy: string
  createdAt: Date
}

type Tipificacion = {
  bloodType: string | null
  recordedBy: string | null
  updatedAt: Date | null
}

const ETIQUETA_ROL: Record<string, string> = {
  ADMIN: 'Admin',
  DOCTOR: 'Médico',
  RESIDENT: 'Residente',
  NURSE: 'Enf.',
  LAB: 'Laboratorio',
  READONLY: 'Lectura',
}

export function BloqueNefrologico({
  episodeId,
  acceso,
  virales,
  tfgActual,
  tipificacion,
  nombres,
  roles,
  puedeRegistrar,
}: {
  episodeId: string
  acceso: Acceso | null
  virales: Serologia | null
  tfgActual: Gfr | null
  tipificacion: Tipificacion
  nombres: Record<string, string>
  roles: Record<string, string>
  puedeRegistrar: boolean
}) {
  let diasAcceso: number | null = null
  if (acceso?.placementDate && !acceso.unknownPlacementDate) {
    const diff = new Date().getTime() - new Date(acceso.placementDate).getTime()
    diasAcceso = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)))
  }

  const esViralNegativo = !virales || virales.status === 'negativo'

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 mb-6 print:hidden">
      <h2 className="text-base font-bold text-slate-800 border-b pb-2 mb-4">
        🩺 Acceso Vascular, Virales, Tipificación y TFG
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. ACCESO VASCULAR */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Acceso Vascular
            </span>
            {acceso ? (
              <div>
                <p className="text-sm font-bold text-slate-800">{acceso.type}</p>
                <p className="text-xs text-slate-600">{acceso.site ?? 'Sitio no especificado'}</p>
                
                {acceso.unknownPlacementDate ? (
                  <p className="text-xs font-bold text-amber-700 mt-1">
                    ❓ Se desconoce fecha
                  </p>
                ) : acceso.placementDate ? (
                  <p className="text-xs font-semibold text-indigo-700 mt-1">
                    📅 Colocado hace {diasAcceso} día{diasAcceso === 1 ? '' : 's'}
                  </p>
                ) : null}

                <div className="mt-2 pt-1.5 border-t border-slate-200 text-[11px] text-slate-500">
                  <span>Registró: </span>
                  <strong className="text-slate-700">{nombres[acceso.createdBy] ?? acceso.createdBy}</strong>
                  {roles[acceso.createdBy] && (
                    <span className="ml-1 bg-slate-200 text-slate-700 text-[10px] font-bold px-1 rounded">
                      {ETIQUETA_ROL[roles[acceso.createdBy]] ?? roles[acceso.createdBy]}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">Sin acceso registrado.</p>
            )}
          </div>

          {puedeRegistrar && (
            <details className="mt-2 pt-2 border-t border-slate-200">
              <summary className="text-xs font-medium text-blue-600 hover:text-blue-800 cursor-pointer">
                {acceso ? 'Actualizar' : '+ Registrar'}
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
                  placeholder="Sitio (ej. Yugular der)"
                  className="w-full px-2 py-1.5 border rounded text-xs text-slate-900"
                />
                <input
                  name="placementDate"
                  type="date"
                  className="w-full px-2 py-1.5 border rounded text-xs text-slate-900"
                />
                <label className="flex items-center gap-1.5 text-[11px] text-slate-700 font-medium cursor-pointer">
                  <input name="unknownPlacementDate" type="checkbox" className="rounded text-blue-600" />
                  <span>Se desconoce fecha</span>
                </label>
                <button className="w-full bg-slate-800 text-white text-xs py-1.5 rounded font-medium hover:bg-slate-900">
                  Guardar
                </button>
              </form>
            </details>
          )}
        </div>

        {/* 2. MARCADORES VIRALES */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Marcadores Virales
            </span>
            {esViralNegativo ? (
              <div className="flex items-center gap-2">
                <span className="text-emerald-600 font-bold text-base">🛡️</span>
                <div>
                  <p className="text-sm font-bold text-emerald-800">Negativo / No Reactivo</p>
                  <p className="text-[11px] text-slate-500">VIH, Hepatitis B y C</p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <span className="text-red-600 font-bold text-base">☣️</span>
                <div>
                  <p className="text-sm font-bold text-red-800">Reactivo</p>
                  <p className="text-xs text-red-700 font-semibold">{virales.details}</p>
                </div>
              </div>
            )}

            {virales && (
              <div className="mt-2 pt-1.5 border-t border-slate-200 text-[11px] text-slate-500">
                <span>Registró: </span>
                <strong className="text-slate-700">{nombres[virales.recordedBy] ?? virales.recordedBy}</strong>
                {roles[virales.recordedBy] && (
                  <span className="ml-1 bg-slate-200 text-slate-700 text-[10px] font-bold px-1 rounded">
                    {ETIQUETA_ROL[roles[virales.recordedBy]] ?? roles[virales.recordedBy]}
                  </span>
                )}
              </div>
            )}
          </div>

          {puedeRegistrar && (
            <details className="mt-2 pt-2 border-t border-slate-200">
              <summary className="text-xs font-medium text-blue-600 hover:text-blue-800 cursor-pointer">
                Actualizar
              </summary>
              <form action={guardarVirales} className="space-y-2 mt-2">
                <input type="hidden" name="episodeId" value={episodeId} />
                <select name="status" className="w-full px-2 py-1.5 border rounded text-xs bg-white text-slate-900">
                  <option value="negativo">Negativo (No reactivo)</option>
                  <option value="positivo">Positivo / Reactivo</option>
                  <option value="pendiente">Pendiente</option>
                </select>
                <input
                  name="details"
                  placeholder="Detalle (ej. VHC +)"
                  className="w-full px-2 py-1.5 border rounded text-xs text-slate-900"
                />
                <button className="w-full bg-slate-800 text-white text-xs py-1.5 rounded font-medium hover:bg-slate-900">
                  Guardar
                </button>
              </form>
            </details>
          )}
        </div>

        {/* 3. TIPIFICACIÓN */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Tipificación (Grupo y Rh)
            </span>
            {tipificacion.bloodType ? (
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl">🩸</span>
                  <span className="text-2xl font-black text-rose-700">{tipificacion.bloodType}</span>
                </div>
                {tipificacion.recordedBy && (
                  <div className="mt-2 pt-1.5 border-t border-slate-200 text-[11px] text-slate-500">
                    <span>Registró: </span>
                    <strong className="text-slate-700">{nombres[tipificacion.recordedBy] ?? tipificacion.recordedBy}</strong>
                    {roles[tipificacion.recordedBy] && (
                      <span className="ml-1 bg-slate-200 text-slate-700 text-[10px] font-bold px-1 rounded">
                        {ETIQUETA_ROL[roles[tipificacion.recordedBy]] ?? roles[tipificacion.recordedBy]}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">Sin tipificación registrada.</p>
            )}
          </div>

          {puedeRegistrar && (
            <details className="mt-2 pt-2 border-t border-slate-200">
              <summary className="text-xs font-medium text-blue-600 hover:text-blue-800 cursor-pointer">
                {tipificacion.bloodType ? 'Actualizar' : '+ Registrar grupo'}
              </summary>
              <form action={guardarTipificacion} className="space-y-2 mt-2">
                <input type="hidden" name="episodeId" value={episodeId} />
                <select name="bloodType" required className="w-full px-2 py-1.5 border rounded text-xs bg-white text-slate-900">
                  <option value="">Seleccione grupo...</option>
                  <option value="O+">O Positivo (O+)</option>
                  <option value="O-">O Negativo (O-)</option>
                  <option value="A+">A Positivo (A+)</option>
                  <option value="A-">A Negativo (A-)</option>
                  <option value="B+">B Positivo (B+)</option>
                  <option value="B-">B Negativo (B-)</option>
                  <option value="AB+">AB Positivo (AB+)</option>
                  <option value="AB-">AB Negativo (AB-)</option>
                </select>
                <button className="w-full bg-rose-700 text-white text-xs py-1.5 rounded font-medium hover:bg-rose-800">
                  Guardar Tipificación
                </button>
              </form>
            </details>
          )}
        </div>

        {/* 4. TFG */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Tasa Filtración Glomerular
            </span>
            {tfgActual ? (
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-sky-800">{tfgActual.value}</span>
                  <span className="text-xs font-medium text-slate-500">mL/min/1.73m²</span>
                </div>
                <div className="mt-2 pt-1.5 border-t border-slate-200 text-[11px] text-slate-500">
                  <span>Registró: </span>
                  <strong className="text-slate-700">{nombres[tfgActual.recordedBy] ?? tfgActual.recordedBy}</strong>
                  {roles[tfgActual.recordedBy] && (
                    <span className="ml-1 bg-slate-200 text-slate-700 text-[10px] font-bold px-1 rounded">
                      {ETIQUETA_ROL[roles[tfgActual.recordedBy]] ?? roles[tfgActual.recordedBy]}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">Sin TFG registrada.</p>
            )}
          </div>

          {puedeRegistrar && (
            <details className="mt-2 pt-2 border-t border-slate-200">
              <summary className="text-xs font-medium text-blue-600 hover:text-blue-800 cursor-pointer">
                + Nueva TFG
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
                <button className="bg-sky-600 text-white text-xs px-2.5 py-1.5 rounded font-medium hover:bg-sky-700">
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