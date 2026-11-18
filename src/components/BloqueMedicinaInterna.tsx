import {
  guardarPerfilMedicinaInterna,
  guardarTipificacion,
} from '@/app/dashboard/paciente/[id]/actions-clinicas'

type PerfilMedicinaInterna = {
  id: string
  clinicalStatus: string
  codeStatus: string
  isolationType: string
  oxygenSupport: string
  dietType: string
  thromboprophylaxis: string
  ulcerProphylaxis: string
  invasiveDevices: string | null
  fluidBalance24h: string | null
  dischargeGoal: string | null
  updatedBy: string
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

const ESTILO_ESTADO: Record<string, string> = {
  Estable: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  Delicado: 'bg-amber-100 text-amber-900 border-amber-200',
  'Cuidado Intermedio': 'bg-orange-100 text-orange-900 border-orange-200',
  Crítico: 'bg-red-100 text-red-900 border-red-200',
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
  tipificacion,
  nombres,
  roles,
  puedeRegistrar,
}: {
  episodeId: string
  perfil: PerfilMedicinaInterna | null
  tipificacion: Tipificacion
  nombres: Record<string, string>
  roles: Record<string, string>
  puedeRegistrar: boolean
}) {
  const estado = perfil?.clinicalStatus ?? 'Estable'
  const codigo = perfil?.codeStatus ?? 'Full Code'
  const aislamiento = perfil?.isolationType ?? 'Sin aislamiento'
  const oxigeno = perfil?.oxygenSupport ?? 'Aire ambiente'
  const dieta = perfil?.dietType ?? 'Dieta corriente'
  const trombo = perfil?.thromboprophylaxis ?? 'Pendiente evaluar'
  const gastro = perfil?.ulcerProphylaxis ?? 'No indicada'

  const tieneAislamiento = aislamiento !== 'Sin aislamiento'
  const claseEstado = ESTILO_ESTADO[estado] ?? ESTILO_ESTADO.Estable

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 mb-6 print:hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3 mb-4">
        <div>
          <h2 className="text-base font-bold text-slate-800">
            🩺 Seguimiento de Medicina Interna · Soporte, Profilaxis y Meta Clínica
          </h2>
          {perfil && (
            <p className="text-[11px] text-slate-500 mt-0.5">
              Actualizó: <strong className="text-slate-700">{nombres[perfil.updatedBy] ?? perfil.updatedBy}</strong>
              {roles[perfil.updatedBy] && (
                <span className="ml-1 bg-slate-200 text-slate-700 text-[10px] font-bold px-1 rounded">
                  {ETIQUETA_ROL[roles[perfil.updatedBy]] ?? roles[perfil.updatedBy]}
                </span>
              )}{' '}
              · {fmtFechaHora(perfil.updatedAt)}
            </p>
          )}
        </div>

        {puedeRegistrar && (
          <details className="relative">
            <summary className="list-none cursor-pointer bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-3.5 py-2 rounded-lg transition-colors">
              ✏️ Actualizar Pase Clínico
            </summary>
            <div className="mt-2 sm:absolute sm:right-0 w-full sm:w-115 bg-white p-4 rounded-xl border border-slate-300 shadow-2xl z-30 text-left">
              <p className="text-xs font-bold text-slate-800 border-b pb-2 mb-3">
                Actualizar Estado, Soporte y Profilaxis (Medicina Interna)
              </p>
              <form action={guardarPerfilMedicinaInterna} className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <input type="hidden" name="episodeId" value={episodeId} />

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                    Estado Clínico
                  </label>
                  <select
                    name="clinicalStatus"
                    defaultValue={estado}
                    className="w-full px-2 py-1.5 border rounded-lg text-xs bg-white text-slate-900"
                  >
                    <option value="Estable">Estable</option>
                    <option value="Delicado">Delicado</option>
                    <option value="Cuidado Intermedio">Cuidado Intermedio</option>
                    <option value="Crítico">Crítico</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                    Código / Reanimación
                  </label>
                  <select
                    name="codeStatus"
                    defaultValue={codigo}
                    className="w-full px-2 py-1.5 border rounded-lg text-xs bg-white text-slate-900"
                  >
                    <option value="Full Code">Full Code (RCP completa)</option>
                    <option value="No Reanimar (NR)">No Reanimar (NR)</option>
                    <option value="Limitación Esfuerzo (LET)">Limitación Esfuerzo (LET)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                    Aislamiento
                  </label>
                  <select
                    name="isolationType"
                    defaultValue={aislamiento}
                    className="w-full px-2 py-1.5 border rounded-lg text-xs bg-white text-slate-900"
                  >
                    <option value="Sin aislamiento">Sin aislamiento</option>
                    <option value="Contacto">Contacto</option>
                    <option value="Gotas">Gotas</option>
                    <option value="Aéreo / Respiratorio">Aéreo / Respiratorio</option>
                    <option value="Protector / Neutropénico">Protector / Neutropénico</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                    Oxigenoterapia
                  </label>
                  <select
                    name="oxygenSupport"
                    defaultValue={oxigeno}
                    className="w-full px-2 py-1.5 border rounded-lg text-xs bg-white text-slate-900"
                  >
                    <option value="Aire ambiente">Aire ambiente (AA)</option>
                    <option value="Cánula nasal">Cánula nasal</option>
                    <option value="Mascarilla simple">Mascarilla simple</option>
                    <option value="Mascarilla con reservorio">Mascarilla con reservorio</option>
                    <option value="Alto flujo (CNAF)">Alto flujo (CNAF)</option>
                    <option value="VMNI / CPAP">VMNI / CPAP</option>
                    <option value="Ventilación mecánica">Ventilación mecánica</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                    Dieta / Nutrición
                  </label>
                  <select
                    name="dietType"
                    defaultValue={dieta}
                    className="w-full px-2 py-1.5 border rounded-lg text-xs bg-white text-slate-900"
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
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                    Tromboprofilaxis (TVP/TEP)
                  </label>
                  <select
                    name="thromboprophylaxis"
                    defaultValue={trombo}
                    className="w-full px-2 py-1.5 border rounded-lg text-xs bg-white text-slate-900"
                  >
                    <option value="Pendiente evaluar">Pendiente evaluar</option>
                    <option value="Enoxaparina / Heparina">Enoxaparina / Heparina</option>
                    <option value="Anticoagulación plena">Anticoagulación plena</option>
                    <option value="Mecánica">Mecánica (Compresión/Medias)</option>
                    <option value="Contraindicada / No indicada">Contraindicada / No indicada</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                    Gastroprotección
                  </label>
                  <select
                    name="ulcerProphylaxis"
                    defaultValue={gastro}
                    className="w-full px-2 py-1.5 border rounded-lg text-xs bg-white text-slate-900"
                  >
                    <option value="No indicada">No indicada</option>
                    <option value="IBP (Omeprazol / Pantoprazol)">IBP (Omeprazol / Pantoprazol)</option>
                    <option value="Sucralfato / Otro">Sucralfato / Otro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                    Balance Hídrico 24h
                  </label>
                  <input
                    name="fluidBalance24h"
                    defaultValue={perfil?.fluidBalance24h ?? ''}
                    placeholder="Ej. +450 mL, Neutro, -300 mL"
                    className="w-full px-2 py-1.5 border rounded-lg text-xs text-slate-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                    Dispositivos Invasivos Activos
                  </label>
                  <input
                    name="invasiveDevices"
                    defaultValue={perfil?.invasiveDevices ?? ''}
                    placeholder="Ej. Vía periférica MSD, Sonda Foley, CVC subclavio der..."
                    className="w-full px-2 py-1.5 border rounded-lg text-xs text-slate-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">
                    Meta Clínica / Criterio de Egreso
                  </label>
                  <input
                    name="dischargeGoal"
                    defaultValue={perfil?.dischargeGoal ?? ''}
                    placeholder="Ej. Completar 48h sin fiebre, destetar O2, pasar a VO..."
                    className="w-full px-2 py-1.5 border rounded-lg text-xs text-slate-900"
                  />
                </div>

                <div className="sm:col-span-2 pt-1">
                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 rounded-lg cursor-pointer"
                  >
                    Guardar Seguimiento de Medicina Interna
                  </button>
                </div>
              </form>
            </div>
          </details>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. GRAVEDAD, CÓDIGO Y AISLAMIENTO */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Estado, Código y Aislamiento
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={`px-2 py-0.5 rounded-md border text-xs font-bold ${claseEstado}`}>
              {estado}
            </span>
            <span
              className={`px-2 py-0.5 rounded-md border text-[11px] font-bold ${
                codigo === 'Full Code'
                  ? 'bg-slate-100 text-slate-700 border-slate-200'
                  : 'bg-purple-100 text-purple-900 border-purple-200'
              }`}
            >
              {codigo}
            </span>
          </div>
          <p
            className={`text-xs font-semibold px-2 py-1 rounded border ${
              tieneAislamiento
                ? 'bg-red-50 text-red-800 border-red-200'
                : 'bg-white text-slate-600 border-slate-200'
            }`}
          >
            {tieneAislamiento ? `⚠️ Aislamiento: ${aislamiento}` : '🛡️ Sin aislamiento'}
          </p>
        </div>

        {/* 2. OXIGENOTERAPIA Y NUTRICIÓN */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Oxígeno y Nutrición
          </span>
          <div>
            <p className="text-[11px] text-slate-500">Soporte O₂</p>
            <p
              className={`text-sm font-bold ${
                oxigeno === 'Aire ambiente' ? 'text-slate-800' : 'text-sky-800'
              }`}
            >
              🫁 {oxigeno}
            </p>
          </div>
          <div className="pt-1.5 border-t border-slate-200">
            <p className="text-[11px] text-slate-500">Dieta / Vía</p>
            <p className="text-xs font-bold text-slate-800">🍽️ {dieta}</p>
          </div>
        </div>

        {/* 3. PROFILAXIS Y DISPOSITIVOS */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Profilaxis y Dispositivos
          </span>
          <div className="text-xs space-y-1">
            <p className="text-slate-700">
              <span className="text-slate-500">TVP:</span> <strong>{trombo}</strong>
            </p>
            <p className="text-slate-700">
              <span className="text-slate-500">Gastro:</span> <strong>{gastro}</strong>
            </p>
          </div>
          <div className="pt-1.5 border-t border-slate-200">
            <p className="text-[11px] text-slate-500">Dispositivos activos</p>
            <p className="text-xs font-medium text-slate-800">
              {perfil?.invasiveDevices || 'Sin dispositivos registrados'}
            </p>
          </div>
        </div>

        {/* 4. TIPIFICACIÓN + BALANCE / META DE EGRESO */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-col justify-between gap-2">
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Tipificación y Meta Clínica
            </span>
            <div className="flex items-center justify-between gap-2">
              {tipificacion.bloodType ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-lg">🩸</span>
                  <span className="text-xl font-black text-rose-700">{tipificacion.bloodType}</span>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">Sin tipificación</p>
              )}
              {perfil?.fluidBalance24h && (
                <span className="text-xs font-bold bg-sky-50 text-sky-800 border border-sky-200 px-2 py-0.5 rounded">
                  BH 24h: {perfil.fluidBalance24h}
                </span>
              )}
            </div>

            {perfil?.dischargeGoal && (
              <p className="text-xs text-slate-700 bg-white border border-slate-200 rounded p-2">
                <strong className="text-emerald-800">🎯 Meta:</strong> {perfil.dischargeGoal}
              </p>
            )}
          </div>

          {puedeRegistrar && (
            <details className="pt-2 border-t border-slate-200">
              <summary className="text-xs font-medium text-blue-600 hover:text-blue-800 cursor-pointer">
                {tipificacion.bloodType ? 'Actualizar Grupo y Rh' : '+ Registrar Grupo y Rh'}
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
                <button className="w-full bg-rose-700 text-white text-xs py-1.5 rounded font-medium hover:bg-rose-800 cursor-pointer">
                  Guardar Tipificación
                </button>
              </form>
            </details>
          )}
        </div>
      </div>
    </div>
  )
}
