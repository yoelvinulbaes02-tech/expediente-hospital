import {
  actualizarCampoMedicinaInterna,
  guardarTipificacion,
  guardarVirales,
} from '@/app/dashboard/paciente/[id]/actions-clinicas'
import { AntropometriaCard } from '@/components/AntropometriaCard'

type PerfilMedicinaInterna = {
  id: string
  oxygenSupport: string
  dietType: string
  fluidBalance24h: string | null
  dischargeGoal: string | null
  updatedBy: string
  updatedAt: Date
}

type Serologia = {
  status: string
  details: string | null
  recordedBy: string
  updatedAt: Date
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

const fmtFechaHora = (d: Date) =>
  new Date(d).toLocaleString('es-DO', {
    timeZone: 'America/Santo_Domingo',
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })

export function BloqueMedicinaInterna({
  episodeId,
  perfil,
  virales,
  tipificacion,
  antropometria,
  nombres,
  roles,
  puedeRegistrar,
}: {
  episodeId: string
  perfil: PerfilMedicinaInterna | null
  virales: Serologia | null
  tipificacion: Tipificacion
  antropometria: {
    weight: number | null
    weightUnit: string | null
    heightCm: number | null
    updatedBy: string | null
    updatedAt: Date | null
  }
  nombres: Record<string, string>
  roles: Record<string, string>
  puedeRegistrar: boolean
}) {
  const oxigeno = perfil?.oxygenSupport ?? 'Aire ambiente'
  const dieta = perfil?.dietType ?? 'Dieta corriente'
  const esViralNegativo = !virales || virales.status === 'negativo'
  const esViralPendiente = virales?.status === 'pendiente'

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 mb-6 print:hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2 mb-4">
        <h2 className="text-base font-bold text-slate-800">
          🩺 Medicina Interna · Antropometría, Tipificación, Virales y Soporte Clínico
        </h2>
        {perfil && (
          <p className="text-[11px] text-slate-500">
            Última actualización de soporte:{' '}
            <strong className="text-slate-700">{nombres[perfil.updatedBy] ?? perfil.updatedBy}</strong>
            {roles[perfil.updatedBy] && (
              <span className="ml-1 bg-slate-200 text-slate-700 text-[10px] font-bold px-1 rounded">
                {ETIQUETA_ROL[roles[perfil.updatedBy]] ?? roles[perfil.updatedBy]}
              </span>
            )}{' '}
            · {fmtFechaHora(perfil.updatedAt)}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. ANTROPOMETRÍA AGRUPADA EN UN SOLO CUADRITO (PESO, TALLA E IMC) */}
        <AntropometriaCard
          compact
          episodeId={episodeId}
          initialWeight={antropometria.weight}
          initialWeightUnit={antropometria.weightUnit}
          initialHeightCm={antropometria.heightCm}
          updatedBy={antropometria.updatedBy}
          updatedAt={antropometria.updatedAt}
          nombres={nombres}
          puedeRegistrar={puedeRegistrar}
        />

        {/* 2. TIPIFICACIÓN SANGUÍNEA (INDIVIDUAL) */}
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
                    <strong className="text-slate-700">
                      {nombres[tipificacion.recordedBy] ?? tipificacion.recordedBy}
                    </strong>
                    {roles[tipificacion.recordedBy] && (
                      <span className="ml-1 bg-slate-200 text-slate-700 text-[10px] font-bold px-1 rounded">
                        {ETIQUETA_ROL[roles[tipificacion.recordedBy]] ?? roles[tipificacion.recordedBy]}
                      </span>
                    )}
                    {tipificacion.updatedAt && (
                      <span className="block text-[10px] text-slate-400">
                        {fmtFechaHora(tipificacion.updatedAt)}
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
                <select
                  name="bloodType"
                  required
                  defaultValue={tipificacion.bloodType ?? ''}
                  className="w-full px-2 py-1.5 border rounded text-xs bg-white text-slate-900"
                >
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
                <button className="w-full bg-rose-700 text-white text-xs py-1.5 rounded font-medium hover:bg-rose-800 cursor-pointer">
                  Guardar Tipificación
                </button>
              </form>
            </details>
          )}
        </div>

        {/* 3. MARCADORES VIRALES (INDIVIDUAL) */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Marcadores Virales
            </span>
            {esViralPendiente ? (
              <div className="flex items-start gap-2">
                <span className="text-amber-600 font-bold text-base">⏳</span>
                <div>
                  <p className="text-sm font-bold text-amber-800">Pendiente</p>
                  {virales?.details && <p className="text-xs text-amber-700">{virales.details}</p>}
                </div>
              </div>
            ) : esViralNegativo ? (
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
                  <p className="text-xs text-red-700 font-semibold">{virales?.details}</p>
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
                <span className="block text-[10px] text-slate-400">{fmtFechaHora(virales.updatedAt)}</span>
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
                <select
                  name="status"
                  defaultValue={virales?.status ?? 'negativo'}
                  className="w-full px-2 py-1.5 border rounded text-xs bg-white text-slate-900"
                >
                  <option value="negativo">Negativo (No reactivo)</option>
                  <option value="positivo">Positivo / Reactivo</option>
                  <option value="pendiente">Pendiente</option>
                </select>
                <input
                  name="details"
                  defaultValue={virales?.details ?? ''}
                  placeholder="Detalle (ej. VHC +)"
                  className="w-full px-2 py-1.5 border rounded text-xs bg-white text-slate-900"
                />
                <button className="w-full bg-slate-800 text-white text-xs py-1.5 rounded font-medium hover:bg-slate-900 cursor-pointer">
                  Guardar
                </button>
              </form>
            </details>
          )}
        </div>

        {/* 4. OXIGENOTERAPIA (INDIVIDUAL) */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Oxigenoterapia
            </span>
            <p className={`text-sm font-bold mt-1 ${oxigeno === 'Aire ambiente' ? 'text-slate-800' : 'text-sky-800'}`}>
              🫁 {oxigeno}
            </p>
          </div>

          {puedeRegistrar && (
            <details className="mt-2 pt-2 border-t border-slate-200">
              <summary className="text-xs font-medium text-blue-600 hover:text-blue-800 cursor-pointer">
                Actualizar
              </summary>
              <form action={actualizarCampoMedicinaInterna} className="space-y-2 mt-2">
                <input type="hidden" name="episodeId" value={episodeId} />
                <input type="hidden" name="field" value="oxygenSupport" />
                <select
                  name="value"
                  defaultValue={oxigeno}
                  className="w-full px-2 py-1.5 border rounded text-xs bg-white text-slate-900"
                >
                  <option value="Aire ambiente">Aire ambiente (AA)</option>
                  <option value="Cánula nasal">Cánula nasal</option>
                  <option value="Mascarilla simple">Mascarilla simple</option>
                  <option value="Mascarilla con reservorio">Mascarilla con reservorio</option>
                  <option value="Alto flujo (CNAF)">Alto flujo (CNAF)</option>
                  <option value="VMNI / CPAP">VMNI / CPAP</option>
                  <option value="Ventilación mecánica">Ventilación mecánica</option>
                </select>
                <button className="w-full bg-slate-800 text-white text-xs py-1.5 rounded font-medium hover:bg-slate-900 cursor-pointer">
                  Guardar Oxígeno
                </button>
              </form>
            </details>
          )}
        </div>

        {/* 5. DIETA / NUTRICIÓN (INDIVIDUAL) */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Dieta / Nutrición
            </span>
            <p className="text-sm font-bold text-slate-800 mt-1">🍽️ {dieta}</p>
          </div>

          {puedeRegistrar && (
            <details className="mt-2 pt-2 border-t border-slate-200">
              <summary className="text-xs font-medium text-blue-600 hover:text-blue-800 cursor-pointer">
                Actualizar
              </summary>
              <form action={actualizarCampoMedicinaInterna} className="space-y-2 mt-2">
                <input type="hidden" name="episodeId" value={episodeId} />
                <input type="hidden" name="field" value="dietType" />
                <select
                  name="value"
                  defaultValue={dieta}
                  className="w-full px-2 py-1.5 border rounded text-xs bg-white text-slate-900"
                >
                  <option value="Dieta corriente">Dieta corriente</option>
                  <option value="Hiposódica / Cardioprotectora">Hiposódica / Cardioprotectora</option>
                  <option value="Diabética">Diabética</option>
                  <option value="Renal">Renal</option>
                  <option value="Blanda / Licuada">Blanda / Licuada</option>
                  <option value="NPO (Nada vía oral)">NPO (Nada vía oral)</option>
                  <option value="Nutrición enteral (SNG)">Nutrición enteral (SNG)</option>
                  <option value="Nutrición parenteral (NPT)">Nutrición parenteral (NPT)</option>
                </select>
                <button className="w-full bg-slate-800 text-white text-xs py-1.5 rounded font-medium hover:bg-slate-900 cursor-pointer">
                  Guardar Dieta
                </button>
              </form>
            </details>
          )}
        </div>

        {/* 6. BALANCE HÍDRICO 24H (INDIVIDUAL) */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Balance Hídrico 24h
            </span>
            {perfil?.fluidBalance24h ? (
              <p className="text-sm font-bold text-sky-900 mt-1">💧 {perfil.fluidBalance24h}</p>
            ) : (
              <p className="text-xs text-slate-400 italic mt-1">Sin balance registrado.</p>
            )}
          </div>

          {puedeRegistrar && (
            <details className="mt-2 pt-2 border-t border-slate-200">
              <summary className="text-xs font-medium text-blue-600 hover:text-blue-800 cursor-pointer">
                {perfil?.fluidBalance24h ? 'Actualizar' : '+ Registrar balance'}
              </summary>
              <form action={actualizarCampoMedicinaInterna} className="space-y-2 mt-2">
                <input type="hidden" name="episodeId" value={episodeId} />
                <input type="hidden" name="field" value="fluidBalance24h" />
                <input
                  name="value"
                  defaultValue={perfil?.fluidBalance24h ?? ''}
                  placeholder="Ej. +450 mL, Neutro, -300 mL"
                  className="w-full px-2 py-1.5 border rounded text-xs bg-white text-slate-900"
                />
                <button className="w-full bg-slate-800 text-white text-xs py-1.5 rounded font-medium hover:bg-slate-900 cursor-pointer">
                  Guardar Balance
                </button>
              </form>
            </details>
          )}
        </div>

        {/* 7. META CLÍNICA / CRITERIO DE EGRESO (INDIVIDUAL) */}
        <div className="sm:col-span-2 bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Meta Clínica / Criterio de Egreso
            </span>
            {perfil?.dischargeGoal ? (
              <p className="text-sm font-semibold text-emerald-900 bg-white border border-emerald-200/80 rounded p-2 mt-1">
                🎯 {perfil.dischargeGoal}
              </p>
            ) : (
              <p className="text-xs text-slate-400 italic mt-1">Sin meta clínica definida.</p>
            )}
          </div>

          {puedeRegistrar && (
            <details className="mt-2 pt-2 border-t border-slate-200">
              <summary className="text-xs font-medium text-blue-600 hover:text-blue-800 cursor-pointer">
                {perfil?.dischargeGoal ? 'Actualizar' : '+ Registrar meta'}
              </summary>
              <form action={actualizarCampoMedicinaInterna} className="space-y-2 mt-2">
                <input type="hidden" name="episodeId" value={episodeId} />
                <input type="hidden" name="field" value="dischargeGoal" />
                <input
                  name="value"
                  defaultValue={perfil?.dischargeGoal ?? ''}
                  placeholder="Ej. Completar 48h sin fiebre, destetar O2, pasar a VO..."
                  className="w-full px-2 py-1.5 border rounded text-xs bg-white text-slate-900"
                />
                <button className="w-full bg-slate-800 text-white text-xs py-1.5 rounded font-medium hover:bg-slate-900 cursor-pointer">
                  Guardar Meta
                </button>
              </form>
            </details>
          )}
        </div>
      </div>
    </div>
  )
}
