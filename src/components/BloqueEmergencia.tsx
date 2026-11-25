import {
  Activity,
  ChevronDown,
  ClipboardList,
  FlaskConical,
  History,
  ShieldAlert,
  Stethoscope,
  Wind,
} from 'lucide-react'
import {
  actualizarCampoEmergencia,
  guardarTipificacion,
  guardarVirales,
} from '@/app/dashboard/paciente/[id]/actions-clinicas'
import { AntropometriaCard } from '@/components/AntropometriaCard'
import { etiquetaRolClinico } from '@/lib/consultas-auth'
import {
  ESPECIALIDADES_EMERGENCIA,
  ESTADOS_CLINICOS_EMERGENCIA,
  NIVELES_TRIAJE_EMERGENCIA,
} from '@/lib/emergencia-constants'

export type PerfilEmergencia = {
  id: string
  amc: string | null
  specialty: string | null
  relevantLabsStudies: string | null
  interestsPending: string | null
  triageLevel: string
  clinicalStatus: string
  oxygenSupport: string
  dispositionPlan: string | null
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

type AuditMeta = { byName: string; byRole: string; atIso: string }
type HistorialCambioItem = {
  id: string
  actorName: string
  actorRole: string
  atIso: string
  que: string
  detalle: string
}

const fmtFechaHora = (d: Date | string) =>
  new Date(d).toLocaleString('es-DO', {
    timeZone: 'America/Santo_Domingo',
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })

function FirmaSeccion({ meta }: { meta?: AuditMeta }) {
  if (!meta) return null
  return (
    <p className="mt-2 pt-1.5 border-t border-slate-200/80 text-[10px] text-slate-500 tabular-nums">
      Modif.: <strong className="text-slate-700">{meta.byName}</strong> ({etiquetaRolClinico(meta.byRole)}) ·{' '}
      {fmtFechaHora(meta.atIso)}
    </p>
  )
}

export function BloqueEmergencia({
  episodeId,
  perfil,
  virales,
  tipificacion,
  antropometria,
  nombres,
  roles,
  auditSecciones = {},
  historialCambios = [],
  puedeRegistrar,
}: {
  episodeId: string
  perfil: PerfilEmergencia | null
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
  auditSecciones?: Record<string, AuditMeta>
  historialCambios?: HistorialCambioItem[]
  puedeRegistrar: boolean
}) {
  const triaje = perfil?.triageLevel ?? 'Emergencia'
  const estadoClinico = perfil?.clinicalStatus ?? 'En observación'
  const oxigeno = perfil?.oxygenSupport ?? 'Aire ambiente'
  const esViralNegativo = !virales || virales.status === 'negativo'
  const esViralPendiente = virales?.status === 'pendiente'

  return (
    <details className="group bg-white p-5 rounded-xl border border-slate-200 mb-6 print:hidden">
      <summary className="list-none cursor-pointer flex flex-wrap items-center justify-between gap-2 group-open:pb-2 [&::-webkit-details-marker]:hidden">
        <div className="flex items-center gap-2">
          <ChevronDown className="w-4 h-4 text-slate-500 transition-transform group-open:rotate-0 -rotate-90 shrink-0" />
          <Activity className="w-4 h-4 text-rose-600 shrink-0" />
          <h2 className="text-base font-bold text-slate-800">
            Emergencia · Triaje, AMC, Especialidad, Analíticas y Pendientes
          </h2>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {perfil && (
            <p className="text-[11px] text-slate-500 tabular-nums">
              Última actualización:{' '}
              <strong className="text-slate-700">{nombres[perfil.updatedBy] ?? perfil.updatedBy}</strong>
              {roles[perfil.updatedBy] && (
                <span className="ml-1 text-slate-600 font-semibold">
                  ({etiquetaRolClinico(roles[perfil.updatedBy])})
                </span>
              )}{' '}
              · {fmtFechaHora(perfil.updatedAt)}
            </p>
          )}
          <span className="text-xs font-medium text-slate-500 group-open:hidden">Expandir</span>
        </div>
      </summary>

      <div className="border-t border-slate-200 pt-4 space-y-4">
        {/* FILA 1: Antropometría, Tipificación, Virales, Triaje & AMC */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <AntropometriaCard
            compact
            episodeId={episodeId}
            initialWeight={antropometria.weight}
            initialWeightUnit={antropometria.weightUnit}
            initialHeightCm={antropometria.heightCm}
            updatedBy={antropometria.updatedBy}
            updatedAt={antropometria.updatedAt}
            nombres={nombres}
            roles={roles}
            puedeRegistrar={puedeRegistrar}
          />

          {/* Tipificación */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-600 block mb-1">
                Tipificación (Grupo y Rh)
              </span>
              {tipificacion.bloodType ? (
                <>
                  <p className="text-lg font-extrabold text-rose-700">{tipificacion.bloodType}</p>
                  {tipificacion.recordedBy && (
                    <p className="text-[11px] text-slate-500 mt-1 tabular-nums">
                      Por <strong>{nombres[tipificacion.recordedBy] ?? tipificacion.recordedBy}</strong>
                      {roles[tipificacion.recordedBy] ? ` (${etiquetaRolClinico(roles[tipificacion.recordedBy])})` : ''}
                      {tipificacion.updatedAt ? ` · ${fmtFechaHora(tipificacion.updatedAt)}` : ''}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-xs text-slate-400 italic mt-1">No registrada</p>
              )}
            </div>

            {puedeRegistrar && (
              <details className="mt-2">
                <summary className="list-none cursor-pointer text-xs font-semibold text-blue-600 hover:underline">
                  {tipificacion.bloodType ? 'Modificar tipificación' : 'Registrar tipificación'}
                </summary>
                <form action={guardarTipificacion} className="mt-2 space-y-2 border-t pt-2">
                  <input type="hidden" name="episodeId" value={episodeId} />
                  <select
                    name="bloodType"
                    defaultValue={tipificacion.bloodType ?? ''}
                    required
                    className="w-full px-2 py-1 border rounded text-xs bg-white text-slate-900"
                  >
                    <option value="">Seleccionar...</option>
                    {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="w-full bg-rose-600 hover:bg-rose-700 text-white text-xs py-1 rounded font-bold cursor-pointer"
                  >
                    Guardar
                  </button>
                </form>
              </details>
            )}
          </div>

          {/* Virales */}
          <div
            className={`border rounded-lg p-3 flex flex-col justify-between ${
              esViralNegativo
                ? 'bg-emerald-50 border-emerald-200'
                : esViralPendiente
                  ? 'bg-amber-50 border-amber-200'
                  : 'bg-red-50 border-red-300'
            }`}
          >
            <div>
              <span className="text-xs font-bold text-slate-600 block mb-1">
                Pruebas Virales (VIH / Hep B / C)
              </span>
              {virales ? (
                <>
                  <p className="text-sm font-bold text-slate-800">
                    {virales.status === 'negativo'
                      ? 'Negativos'
                      : virales.status === 'pendiente'
                        ? 'Pendientes'
                        : 'Positivo / Alerta'}
                  </p>
                  {virales.details && <p className="text-xs text-slate-700 mt-0.5">{virales.details}</p>}
                  <p className="text-[11px] text-slate-500 mt-1 tabular-nums">
                    Por <strong>{nombres[virales.recordedBy] ?? virales.recordedBy}</strong>
                    {roles[virales.recordedBy] ? ` (${etiquetaRolClinico(roles[virales.recordedBy])})` : ''} ·{' '}
                    {fmtFechaHora(virales.updatedAt)}
                  </p>
                </>
              ) : (
                <p className="text-xs text-slate-400 italic mt-1">Sin registro</p>
              )}
            </div>

            {puedeRegistrar && (
              <details className="mt-2">
                <summary className="list-none cursor-pointer text-xs font-semibold text-blue-600 hover:underline">
                  Actualizar virales
                </summary>
                <form action={guardarVirales} className="mt-2 space-y-2 border-t pt-2">
                  <input type="hidden" name="episodeId" value={episodeId} />
                  <select
                    name="status"
                    defaultValue={virales?.status ?? 'pendiente'}
                    className="w-full px-2 py-1 border rounded text-xs bg-white text-slate-900"
                  >
                    <option value="negativo">Negativos</option>
                    <option value="pendiente">Pendientes</option>
                    <option value="positivo">Positivo</option>
                  </select>
                  <input
                    name="details"
                    defaultValue={virales?.details ?? ''}
                    placeholder="Detalle..."
                    className="w-full px-2 py-1 border rounded text-xs bg-white text-slate-900"
                  />
                  <button
                    type="submit"
                    className="w-full bg-slate-800 text-white text-xs py-1 rounded font-bold cursor-pointer"
                  >
                    Guardar
                  </button>
                </form>
              </details>
            )}
          </div>

          {/* AMC */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-600 block mb-1">
                AMC (Área / Autorización / Código)
              </span>
              <p className="text-sm font-bold text-slate-900 tabular-nums">
                {perfil?.amc?.trim() || 'Sin asignar'}
              </p>
              <FirmaSeccion meta={auditSecciones.amc} />
            </div>

            {puedeRegistrar && (
              <details className="mt-2">
                <summary className="list-none cursor-pointer text-xs font-semibold text-blue-600 hover:underline">
                  Modificar AMC
                </summary>
                <form action={actualizarCampoEmergencia} className="mt-2 space-y-2 border-t pt-2">
                  <input type="hidden" name="episodeId" value={episodeId} />
                  <input type="hidden" name="field" value="amc" />
                  <input
                    name="value"
                    defaultValue={perfil?.amc ?? ''}
                    placeholder="Ej. AMC-14 / Trauma..."
                    className="w-full px-2 py-1 border rounded text-xs bg-white text-slate-900"
                  />
                  <button
                    type="submit"
                    className="w-full bg-slate-800 text-white text-xs py-1 rounded font-bold cursor-pointer"
                  >
                    Guardar AMC
                  </button>
                </form>
              </details>
            )}
          </div>
        </div>

        {/* FILA 2: Especialidad, Triaje, Estado clínico, Oxigenoterapia */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Especialidad */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-col justify-between">
            <div>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 mb-1">
                <Stethoscope className="w-3.5 h-3.5 text-rose-600" />
                <span>Especialidad a Cargo</span>
              </span>
              <p className="text-sm font-bold text-slate-900">
                {perfil?.specialty?.trim() || 'Emergenciología'}
              </p>
              <FirmaSeccion meta={auditSecciones.specialty} />
            </div>
            {puedeRegistrar && (
              <details className="mt-2">
                <summary className="list-none cursor-pointer text-xs font-semibold text-blue-600 hover:underline">
                  Cambiar especialidad
                </summary>
                <form action={actualizarCampoEmergencia} className="mt-2 space-y-2 border-t pt-2">
                  <input type="hidden" name="episodeId" value={episodeId} />
                  <input type="hidden" name="field" value="specialty" />
                  <select
                    name="value"
                    defaultValue={perfil?.specialty ?? 'Emergenciología'}
                    className="w-full px-2 py-1 border rounded text-xs bg-white text-slate-900"
                  >
                    {ESPECIALIDADES_EMERGENCIA.map((esp) => (
                      <option key={esp} value={esp}>
                        {esp}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="w-full bg-rose-600 hover:bg-rose-700 text-white text-xs py-1 rounded font-bold cursor-pointer"
                  >
                    Guardar
                  </button>
                </form>
              </details>
            )}
          </div>

          {/* Nivel de Triaje */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-col justify-between">
            <div>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 mb-1">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                <span>Nivel de Triaje</span>
              </span>
              <p className="text-sm font-bold text-rose-700">{triaje}</p>
              <FirmaSeccion meta={auditSecciones.triageLevel} />
            </div>
            {puedeRegistrar && (
              <details className="mt-2">
                <summary className="list-none cursor-pointer text-xs font-semibold text-blue-600 hover:underline">
                  Cambiar triaje
                </summary>
                <form action={actualizarCampoEmergencia} className="mt-2 space-y-2 border-t pt-2">
                  <input type="hidden" name="episodeId" value={episodeId} />
                  <input type="hidden" name="field" value="triageLevel" />
                  <select
                    name="value"
                    defaultValue={triaje}
                    className="w-full px-2 py-1 border rounded text-xs bg-white text-slate-900"
                  >
                    {NIVELES_TRIAJE_EMERGENCIA.map((nv) => (
                      <option key={nv} value={nv}>
                        {nv}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="w-full bg-rose-600 hover:bg-rose-700 text-white text-xs py-1 rounded font-bold cursor-pointer"
                  >
                    Guardar
                  </button>
                </form>
              </details>
            )}
          </div>

          {/* Estado Clínico */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-600 block mb-1">Estado Clínico</span>
              <p className="text-sm font-bold text-slate-900">{estadoClinico}</p>
              <FirmaSeccion meta={auditSecciones.clinicalStatus} />
            </div>
            {puedeRegistrar && (
              <details className="mt-2">
                <summary className="list-none cursor-pointer text-xs font-semibold text-blue-600 hover:underline">
                  Cambiar estado
                </summary>
                <form action={actualizarCampoEmergencia} className="mt-2 space-y-2 border-t pt-2">
                  <input type="hidden" name="episodeId" value={episodeId} />
                  <input type="hidden" name="field" value="clinicalStatus" />
                  <select
                    name="value"
                    defaultValue={estadoClinico}
                    className="w-full px-2 py-1 border rounded text-xs bg-white text-slate-900"
                  >
                    {ESTADOS_CLINICOS_EMERGENCIA.map((est) => (
                      <option key={est} value={est}>
                        {est}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="w-full bg-slate-800 text-white text-xs py-1 rounded font-bold cursor-pointer"
                  >
                    Guardar
                  </button>
                </form>
              </details>
            )}
          </div>

          {/* Oxigenoterapia */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-col justify-between">
            <div>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 mb-1">
                <Wind className="w-3.5 h-3.5 text-sky-600" />
                <span>Soporte de Oxígeno</span>
              </span>
              <p className="text-sm font-bold text-slate-900">{oxigeno}</p>
              <FirmaSeccion meta={auditSecciones.oxygenSupport} />
            </div>
            {puedeRegistrar && (
              <details className="mt-2">
                <summary className="list-none cursor-pointer text-xs font-semibold text-blue-600 hover:underline">
                  Modificar oxígeno
                </summary>
                <form action={actualizarCampoEmergencia} className="mt-2 space-y-2 border-t pt-2">
                  <input type="hidden" name="episodeId" value={episodeId} />
                  <input type="hidden" name="field" value="oxygenSupport" />
                  <select
                    name="value"
                    defaultValue={oxigeno}
                    className="w-full px-2 py-1 border rounded text-xs bg-white text-slate-900"
                  >
                    {[
                      'Aire ambiente',
                      'Cánula nasal 2-4 L/min',
                      'Mascarilla simple',
                      'Mascarilla con reservorio',
                      'Alto flujo / CPAP / BiPAP',
                      'Ventilación mecánica invasiva',
                    ].map((op) => (
                      <option key={op} value={op}>
                        {op}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    className="w-full bg-slate-800 text-white text-xs py-1 rounded font-bold cursor-pointer"
                  >
                    Guardar
                  </button>
                </form>
              </details>
            )}
          </div>
        </div>

        {/* FILA 3: Analíticas relevantes, Pendientes/Interés y Destino */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-col justify-between">
            <div>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 mb-1">
                <FlaskConical className="w-3.5 h-3.5 text-blue-600" />
                <span>Analíticas y Estudios Relevantes</span>
              </span>
              <p className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed tabular-nums">
                {perfil?.relevantLabsStudies?.trim() || 'Sin analíticas o estudios relevantes anotados.'}
              </p>
              <FirmaSeccion meta={auditSecciones.relevantLabsStudies} />
            </div>
            {puedeRegistrar && (
              <details className="mt-2">
                <summary className="list-none cursor-pointer text-xs font-semibold text-blue-600 hover:underline">
                  Editar analíticas / estudios
                </summary>
                <form action={actualizarCampoEmergencia} className="mt-2 space-y-2 border-t pt-2">
                  <input type="hidden" name="episodeId" value={episodeId} />
                  <input type="hidden" name="field" value="relevantLabsStudies" />
                  <textarea
                    name="value"
                    rows={3}
                    defaultValue={perfil?.relevantLabsStudies ?? ''}
                    placeholder="Hb, Hto, plaquetas, creatinina, gases, TAC, RX..."
                    className="w-full px-2 py-1.5 border rounded text-xs bg-white text-slate-900"
                  />
                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 rounded font-bold cursor-pointer"
                  >
                    Guardar Analíticas
                  </button>
                </form>
              </details>
            )}
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-col justify-between">
            <div>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 mb-1">
                <ClipboardList className="w-3.5 h-3.5 text-amber-600" />
                <span>Pendientes / Interés</span>
              </span>
              <p className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                {perfil?.interestsPending?.trim() || 'Sin pendientes de interés registrados.'}
              </p>
              <FirmaSeccion meta={auditSecciones.interestsPending} />
            </div>
            {puedeRegistrar && (
              <details className="mt-2">
                <summary className="list-none cursor-pointer text-xs font-semibold text-blue-600 hover:underline">
                  Editar pendientes / interés
                </summary>
                <form action={actualizarCampoEmergencia} className="mt-2 space-y-2 border-t pt-2">
                  <input type="hidden" name="episodeId" value={episodeId} />
                  <input type="hidden" name="field" value="interestsPending" />
                  <textarea
                    name="value"
                    rows={3}
                    defaultValue={perfil?.interestsPending ?? ''}
                    placeholder="Ej. Pendiente valoración por Cirugía, repetir troponina..."
                    className="w-full px-2 py-1.5 border rounded text-xs bg-white text-slate-900"
                  />
                  <button
                    type="submit"
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white text-xs py-1 rounded font-bold cursor-pointer"
                  >
                    Guardar Pendientes
                  </button>
                </form>
              </details>
            )}
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-700 block mb-1">
                Destino / Disposición Planificada
              </span>
              <p className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                {perfil?.dispositionPlan?.trim() || 'Sin plan de disposición definido.'}
              </p>
              <FirmaSeccion meta={auditSecciones.dispositionPlan} />
            </div>
            {puedeRegistrar && (
              <details className="mt-2">
                <summary className="list-none cursor-pointer text-xs font-semibold text-blue-600 hover:underline">
                  Editar disposición
                </summary>
                <form action={actualizarCampoEmergencia} className="mt-2 space-y-2 border-t pt-2">
                  <input type="hidden" name="episodeId" value={episodeId} />
                  <input type="hidden" name="field" value="dispositionPlan" />
                  <textarea
                    name="value"
                    rows={3}
                    defaultValue={perfil?.dispositionPlan ?? ''}
                    placeholder="Ej. Ingreso a sala de Medicina Interna, traslado a UCI, alta..."
                    className="w-full px-2 py-1.5 border rounded text-xs bg-white text-slate-900"
                  />
                  <button
                    type="submit"
                    className="w-full bg-slate-800 text-white text-xs py-1 rounded font-bold cursor-pointer"
                  >
                    Guardar Disposición
                  </button>
                </form>
              </details>
            )}
          </div>
        </div>

        {historialCambios.length > 0 && (
          <details className="group/hist mt-4 pt-3 border-t border-slate-200">
            <summary className="list-none cursor-pointer flex items-center justify-between gap-2 text-xs font-bold text-slate-700 hover:text-slate-900 [&::-webkit-details-marker]:hidden">
              <span className="inline-flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-slate-500" />
                <span>Historial de modificaciones en Emergencia ({historialCambios.length})</span>
              </span>
              <span className="text-[11px] font-medium text-slate-500">Ver cambios</span>
            </summary>
            <div className="mt-2.5 max-h-60 overflow-y-auto divide-y divide-slate-200 border border-slate-200 rounded-lg bg-slate-50">
              {historialCambios.map((item) => (
                <div key={item.id} className="px-3 py-2 text-[11px] space-y-0.5">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-slate-600 tabular-nums">
                    <span>
                      <strong className="text-slate-800">{item.actorName}</strong> ({etiquetaRolClinico(item.actorRole)})
                    </span>
                    <span className="text-[10px] text-slate-500">{fmtFechaHora(item.atIso)}</span>
                  </div>
                  <p className="font-semibold text-slate-800">{item.que}</p>
                  {item.detalle && <p className="text-slate-600">{item.detalle}</p>}
                </div>
              ))}
            </div>
          </details>
        )}
      </div>
    </details>
  )
}
