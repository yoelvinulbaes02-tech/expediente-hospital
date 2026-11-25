import { ChevronDown, Droplets, Eye, FileSearch, History, ShieldAlert, Thermometer, Wind } from 'lucide-react'
import {
  actualizarCampoHematologia,
  guardarTipificacion,
  guardarVirales,
} from '@/app/dashboard/paciente/[id]/actions-clinicas'
import { AntropometriaCard } from '@/components/AntropometriaCard'
import { etiquetaRolClinico } from '@/lib/consultas-auth'
import { AISLAMIENTOS_HEMA, FRECUENCIAS_SIGNOS_HEMA, OXIGENO_HEMA_OPCIONES } from '@/lib/hematologia-constants'

export type PerfilHematologia = {
  id: string
  vitalSignsFrequency: string
  bleedingWatch: string | null
  painWatch: string | null
  temperatureWatch: string | null
  hemodynamicWatch: string | null
  pendingBloodProducts: string | null
  pendingStudies: string | null
  isolationType: string
  oxygenSupport: string
  hematologicSummary: string | null
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

export function BloqueHematologia({
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
  perfil: PerfilHematologia | null
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
  const vitalFreq = perfil?.vitalSignsFrequency ?? 'c/8 horas'
  const aislamiento = perfil?.isolationType ?? 'Sin aislamiento'
  const oxigeno = perfil?.oxygenSupport ?? 'Aire ambiente'
  const esViralNegativo = !virales || virales.status === 'negativo'
  const esViralPendiente = virales?.status === 'pendiente'

  return (
    <details className="group bg-white p-5 rounded-xl shadow-sm border border-slate-200 mb-6 print:hidden">
      <summary className="list-none cursor-pointer flex flex-wrap items-center justify-between gap-2 group-open:border-b group-open:pb-2.5 group-open:mb-4 [&::-webkit-details-marker]:hidden">
        <div className="flex items-center gap-2">
          <ChevronDown className="w-4 h-4 text-slate-500 transition-transform group-open:rotate-0 -rotate-90" />
          <h2 className="text-base font-bold text-slate-800">
            Hematología · Vigilancia Clínica, Hemocomponentes, Tipificación y Estudios Pendientes
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. ANTROPOMETRÍA */}
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

        {/* 2. TIPIFICACIÓN SANGUÍNEA */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 mb-1">
              <Droplets className="w-3.5 h-3.5 text-rose-600" />
              <span>Tipificación (Grupo y Rh)</span>
            </span>
            {tipificacion.bloodType ? (
              <div>
                <span className="text-2xl font-black text-rose-700">{tipificacion.bloodType}</span>
                {tipificacion.recordedBy && (
                  <div className="mt-2 pt-1.5 border-t border-slate-200 text-[11px] text-slate-500 tabular-nums">
                    <span>Registró: </span>
                    <strong className="text-slate-700">
                      {nombres[tipificacion.recordedBy] ?? tipificacion.recordedBy}
                    </strong>
                    {roles[tipificacion.recordedBy] && (
                      <span className="text-slate-600 font-semibold">
                        {' '}({etiquetaRolClinico(roles[tipificacion.recordedBy])})
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

        {/* 3. MARCADORES VIRALES */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 mb-1">
              <ShieldAlert className="w-3.5 h-3.5 text-slate-600" />
              <span>Marcadores Virales</span>
            </span>
            {esViralPendiente ? (
              <div>
                <p className="text-sm font-bold text-amber-800">Pendiente</p>
                {virales?.details && <p className="text-xs text-amber-700">{virales.details}</p>}
              </div>
            ) : esViralNegativo ? (
              <div>
                <p className="text-sm font-bold text-emerald-800">Negativo / No Reactivo</p>
                <p className="text-[11px] text-slate-500">VIH, Hepatitis B y C</p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-bold text-red-800">Reactivo</p>
                <p className="text-xs text-red-700 font-semibold">{virales?.details}</p>
              </div>
            )}
            {virales?.recordedBy && (
              <div className="mt-2 pt-1.5 border-t border-slate-200 text-[11px] text-slate-500 tabular-nums">
                <span>Registró: </span>
                <strong className="text-slate-700">{nombres[virales.recordedBy] ?? virales.recordedBy}</strong>
                {roles[virales.recordedBy] && (
                  <span className="text-slate-600 font-semibold">
                    {' '}({etiquetaRolClinico(roles[virales.recordedBy])})
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
                <select name="status" defaultValue={virales?.status ?? 'negativo'} className="w-full px-2 py-1.5 border rounded text-xs bg-white text-slate-900">
                  <option value="negativo">Negativo (No reactivo)</option>
                  <option value="positivo">Positivo / Reactivo</option>
                  <option value="pendiente">Pendiente</option>
                </select>
                <input name="details" defaultValue={virales?.details ?? ''} placeholder="Detalle" className="w-full px-2 py-1.5 border rounded text-xs bg-white text-slate-900" />
                <button className="w-full bg-slate-800 text-white text-xs py-1.5 rounded font-medium hover:bg-slate-900 cursor-pointer">
                  Guardar
                </button>
              </form>
            </details>
          )}
        </div>

        {/* 4. FRECUENCIA SIGNOS VITALES */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 mb-1">
              <Thermometer className="w-3.5 h-3.5 text-indigo-600" />
              <span>Signos Vitales</span>
            </span>
            <p className="text-sm font-bold text-indigo-900 mt-1 tabular-nums">{vitalFreq}</p>
            <FirmaSeccion meta={auditSecciones.vitalSignsFrequency} />
          </div>
          {puedeRegistrar && (
            <details className="mt-2 pt-2 border-t border-slate-200">
              <summary className="text-xs font-medium text-blue-600 hover:text-blue-800 cursor-pointer">Actualizar</summary>
              <form action={actualizarCampoHematologia} className="space-y-2 mt-2">
                <input type="hidden" name="episodeId" value={episodeId} />
                <input type="hidden" name="field" value="vitalSignsFrequency" />
                <select name="value" defaultValue={vitalFreq} className="w-full px-2 py-1.5 border rounded text-xs bg-white text-slate-900">
                  {FRECUENCIAS_SIGNOS_HEMA.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
                <button className="w-full bg-slate-800 text-white text-xs py-1.5 rounded font-medium hover:bg-slate-900 cursor-pointer">
                  Guardar Frecuencia
                </button>
              </form>
            </details>
          )}
        </div>

        {/* 5. VIGILAR SANGRADO Y HEMODINAMIA */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 mb-1">
              <Eye className="w-3.5 h-3.5 text-rose-600" />
              <span>Vigilancia de Sangrado</span>
            </span>
            <p className="text-xs font-semibold text-slate-800 mt-1">
              {perfil?.bleedingWatch || <span className="italic text-slate-400 font-normal">Sin indicación específica</span>}
            </p>
            <FirmaSeccion meta={auditSecciones.bleedingWatch} />
          </div>
          {puedeRegistrar && (
            <details className="mt-2 pt-2 border-t border-slate-200">
              <summary className="text-xs font-medium text-blue-600 hover:text-blue-800 cursor-pointer">Editar</summary>
              <form action={actualizarCampoHematologia} className="space-y-2 mt-2">
                <input type="hidden" name="episodeId" value={episodeId} />
                <input type="hidden" name="field" value="bleedingWatch" />
                <input name="value" defaultValue={perfil?.bleedingWatch ?? ''} placeholder="Ej. Vigilar datos de sangrado y estado hemodinámico" className="w-full px-2 py-1.5 border rounded text-xs bg-white text-slate-900" />
                <button className="w-full bg-slate-800 text-white text-xs py-1.5 rounded font-medium hover:bg-slate-900 cursor-pointer">Guardar</button>
              </form>
            </details>
          )}
        </div>

        {/* 6. VIGILAR DOLOR / TEMPERATURA */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Vigilancia de Dolor
            </span>
            <p className="text-xs font-semibold text-slate-800 mt-1">
              {perfil?.painWatch || <span className="italic text-slate-400 font-normal">Sin indicación específica</span>}
            </p>
            <FirmaSeccion meta={auditSecciones.painWatch} />
          </div>
          {puedeRegistrar && (
            <details className="mt-2 pt-2 border-t border-slate-200">
              <summary className="text-xs font-medium text-blue-600 hover:text-blue-800 cursor-pointer">Editar</summary>
              <form action={actualizarCampoHematologia} className="space-y-2 mt-2">
                <input type="hidden" name="episodeId" value={episodeId} />
                <input type="hidden" name="field" value="painWatch" />
                <input name="value" defaultValue={perfil?.painWatch ?? ''} placeholder="Ej. Vigilar datos de dolor / crisis" className="w-full px-2 py-1.5 border rounded text-xs bg-white text-slate-900" />
                <button className="w-full bg-slate-800 text-white text-xs py-1.5 rounded font-medium hover:bg-slate-900 cursor-pointer">Guardar</button>
              </form>
            </details>
          )}
        </div>

        {/* 7. TEMPERATURA Y ESTADO HEMODINÁMICO */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-col justify-between">
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Temperatura y Hemodinamia
            </span>
            <p className="text-xs text-slate-800">
              <strong>Temp:</strong> {perfil?.temperatureWatch || 'No especificada'}
            </p>
            <p className="text-xs text-slate-800">
              <strong>Hemodinamia:</strong> {perfil?.hemodynamicWatch || 'No especificada'}
            </p>
            <FirmaSeccion meta={auditSecciones.temperatureWatch || auditSecciones.hemodynamicWatch} />
          </div>
          {puedeRegistrar && (
            <details className="mt-2 pt-2 border-t border-slate-200">
              <summary className="text-xs font-medium text-blue-600 hover:text-blue-800 cursor-pointer">Editar</summary>
              <div className="space-y-2 mt-2">
                <form action={actualizarCampoHematologia} className="flex gap-1">
                  <input type="hidden" name="episodeId" value={episodeId} />
                  <input type="hidden" name="field" value="temperatureWatch" />
                  <input name="value" defaultValue={perfil?.temperatureWatch ?? ''} placeholder="Temperatura corporal..." className="flex-1 px-2 py-1 border rounded text-xs bg-white text-slate-900" />
                  <button className="bg-slate-800 text-white text-xs px-2 py-1 rounded font-medium cursor-pointer">OK</button>
                </form>
                <form action={actualizarCampoHematologia} className="flex gap-1">
                  <input type="hidden" name="episodeId" value={episodeId} />
                  <input type="hidden" name="field" value="hemodynamicWatch" />
                  <input name="value" defaultValue={perfil?.hemodynamicWatch ?? ''} placeholder="Estado hemodinámico..." className="flex-1 px-2 py-1 border rounded text-xs bg-white text-slate-900" />
                  <button className="bg-slate-800 text-white text-xs px-2 py-1 rounded font-medium cursor-pointer">OK</button>
                </form>
              </div>
            </details>
          )}
        </div>

        {/* 8. AISLAMIENTO Y OXÍGENO */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Wind className="w-3.5 h-3.5 text-sky-600" />
              <span>Aislamiento / Oxígeno</span>
            </span>
            <p className="text-xs font-semibold text-slate-800">{aislamiento}</p>
            <p className="text-xs font-semibold text-sky-800">{oxigeno}</p>
            <FirmaSeccion meta={auditSecciones.isolationType || auditSecciones.oxygenSupport} />
          </div>
          {puedeRegistrar && (
            <details className="mt-2 pt-2 border-t border-slate-200">
              <summary className="text-xs font-medium text-blue-600 hover:text-blue-800 cursor-pointer">Editar</summary>
              <div className="space-y-2 mt-2">
                <form action={actualizarCampoHematologia} className="flex gap-1">
                  <input type="hidden" name="episodeId" value={episodeId} />
                  <input type="hidden" name="field" value="isolationType" />
                  <select name="value" defaultValue={aislamiento} className="flex-1 px-1.5 py-1 border rounded text-xs bg-white text-slate-900">
                    {AISLAMIENTOS_HEMA.map((a) => <option key={a} value={a}>{a}</option>)}
                  </select>
                  <button className="bg-slate-800 text-white text-xs px-2 py-1 rounded cursor-pointer">OK</button>
                </form>
                <form action={actualizarCampoHematologia} className="flex gap-1">
                  <input type="hidden" name="episodeId" value={episodeId} />
                  <input type="hidden" name="field" value="oxygenSupport" />
                  <select name="value" defaultValue={oxigeno} className="flex-1 px-1.5 py-1 border rounded text-xs bg-white text-slate-900">
                    {OXIGENO_HEMA_OPCIONES.map((o) => <option key={o} value={o}>{o}</option>)}
                  </select>
                  <button className="bg-slate-800 text-white text-xs px-2 py-1 rounded cursor-pointer">OK</button>
                </form>
              </div>
            </details>
          )}
        </div>

        {/* 9. HEMOCOMPONENTES PENDIENTES */}
        <div className="sm:col-span-2 bg-rose-50/40 border border-rose-200 rounded-lg p-3 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1 mb-1">
              <Droplets className="w-3.5 h-3.5" />
              <span>Hemocomponentes Pendientes</span>
            </span>
            <p className="text-sm font-semibold text-slate-900">
              {perfil?.pendingBloodProducts || (
                <span className="text-xs text-slate-400 italic font-normal">Sin hemocomponentes pendientes</span>
              )}
            </p>
            <FirmaSeccion meta={auditSecciones.pendingBloodProducts} />
          </div>
          {puedeRegistrar && (
            <details className="mt-2 pt-2 border-t border-rose-200/70">
              <summary className="text-xs font-medium text-blue-600 hover:text-blue-800 cursor-pointer">
                {perfil?.pendingBloodProducts ? 'Actualizar' : '+ Registrar hemocomponentes'}
              </summary>
              <form action={actualizarCampoHematologia} className="space-y-2 mt-2">
                <input type="hidden" name="episodeId" value={episodeId} />
                <input type="hidden" name="field" value="pendingBloodProducts" />
                <input
                  name="value"
                  defaultValue={perfil?.pendingBloodProducts ?? ''}
                  placeholder="Ej. Pendiente 2 paquetes globulares por familiares · Pendiente plaquetas"
                  className="w-full px-2 py-1.5 border rounded text-xs bg-white text-slate-900"
                />
                <button className="w-full bg-rose-700 text-white text-xs py-1.5 rounded font-medium hover:bg-rose-800 cursor-pointer">
                  Guardar Hemocomponentes
                </button>
              </form>
            </details>
          )}
        </div>

        {/* 10. ESTUDIOS E IMÁGENES PENDIENTES */}
        <div className="sm:col-span-2 bg-indigo-50/40 border border-indigo-200 rounded-lg p-3 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-indigo-800 uppercase tracking-wider flex items-center gap-1 mb-1">
              <FileSearch className="w-3.5 h-3.5" />
              <span>Estudios e Imágenes Pendientes</span>
            </span>
            <p className="text-sm font-semibold text-slate-900">
              {perfil?.pendingStudies || (
                <span className="text-xs text-slate-400 italic font-normal">Sin estudios pendientes</span>
              )}
            </p>
            <FirmaSeccion meta={auditSecciones.pendingStudies} />
          </div>
          {puedeRegistrar && (
            <details className="mt-2 pt-2 border-t border-indigo-200/70">
              <summary className="text-xs font-medium text-blue-600 hover:text-blue-800 cursor-pointer">
                {perfil?.pendingStudies ? 'Actualizar' : '+ Registrar estudios pendientes'}
              </summary>
              <form action={actualizarCampoHematologia} className="space-y-2 mt-2">
                <input type="hidden" name="episodeId" value={episodeId} />
                <input type="hidden" name="field" value="pendingStudies" />
                <input
                  name="value"
                  defaultValue={perfil?.pendingStudies ?? ''}
                  placeholder="Ej. Rx de tórax PA, frotis de sangre periférica, AMO..."
                  className="w-full px-2 py-1.5 border rounded text-xs bg-white text-slate-900"
                />
                <button className="w-full bg-indigo-700 text-white text-xs py-1.5 rounded font-medium hover:bg-indigo-800 cursor-pointer">
                  Guardar Estudios
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
              <span>Historial de modificaciones de Hematología ({historialCambios.length})</span>
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
    </details>
  )
}
