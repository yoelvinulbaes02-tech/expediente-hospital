import { Scissors, Droplets, Calendar, Users, Stethoscope, Plus, X } from 'lucide-react'
import {
  CATEGORIAS_DISPOSITIVOS_CIRUGIA,
  ESPECIALIDADES_QUIRURGICAS,
  ESTADOS_CIRUGIA,
} from '@/lib/cirugia-constants'
import {
  agregarDispositivoQuirurgico,
  guardarInfoQuirurgica,
  guardarTipificacion,
  retirarDispositivoQuirurgico,
} from '@/app/dashboard/paciente/[id]/actions-clinicas'
import { AntropometriaCard } from '@/components/AntropometriaCard'

type PerfilQuirurgico = {
  id: string
  procedureName: string | null
  surgeryDate: Date | null
  surgeryType: string
  surgicalSpecialty: string | null
  surgeonAndAssistants: string | null
  surgeryStatus: string
  updatedBy: string
  updatedAt: Date
}

type DispositivoQuirurgico = {
  id: string
  category: string
  notes: string | null
  createdBy: string
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

const fmtFechaHora = (d: Date) =>
  new Date(d).toLocaleString('es-DO', {
    timeZone: 'America/Santo_Domingo',
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })

const fmtFechaInput = (d: Date | null | undefined) => {
  if (!d) return ''
  const dt = new Date(d)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`
}

export function BloqueCirugia({
  episodeId,
  perfilQuirurgico,
  dispositivos,
  tipificacion,
  antropometria,
  nombres,
  roles,
  puedeRegistrar,
}: {
  episodeId: string
  perfilQuirurgico: PerfilQuirurgico | null
  dispositivos: DispositivoQuirurgico[]
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
  const estadoMeta =
    ESTADOS_CIRUGIA.find((e) => e.value === (perfilQuirurgico?.surgeryStatus ?? 'pendiente')) ??
    ESTADOS_CIRUGIA[0]

  const mapaEtiquetaCat = new Map<string, string>(
    CATEGORIAS_DISPOSITIVOS_CIRUGIA.map((c) => [c.key, c.label])
  )

  return (
    <>
      <AntropometriaCard
        episodeId={episodeId}
        initialWeight={antropometria.weight}
        initialWeightUnit={antropometria.weightUnit}
        initialHeightCm={antropometria.heightCm}
        updatedBy={antropometria.updatedBy}
        updatedAt={antropometria.updatedAt}
        nombres={nombres}
        puedeRegistrar={puedeRegistrar}
      />

      {/* INFORMACIÓN QUIRÚRGICA */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 mb-6 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-3 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Scissors className="w-4 h-4 text-blue-600" />
              <span>Información Quirúrgica</span>
            </h2>
            {perfilQuirurgico && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Actualizó: <strong className="text-slate-700 dark:text-slate-200">{nombres[perfilQuirurgico.updatedBy] ?? perfilQuirurgico.updatedBy}</strong>
                {roles[perfilQuirurgico.updatedBy] && (
                  <span className="ml-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[10px] font-bold px-1 rounded">
                    {ETIQUETA_ROL[roles[perfilQuirurgico.updatedBy]] ?? roles[perfilQuirurgico.updatedBy]}
                  </span>
                )}{' '}
                · {fmtFechaHora(perfilQuirurgico.updatedAt)}
              </p>
            )}
          </div>

          {puedeRegistrar && (
            <details className="relative">
              <summary className="list-none cursor-pointer bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap">
                {perfilQuirurgico ? 'Editar Información Quirúrgica' : '+ Registrar Cirugía'}
              </summary>
              <div className="mt-2 sm:absolute sm:right-0 w-full sm:w-120 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-300 dark:border-slate-700 shadow-2xl z-30 text-left">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-2 mb-3">
                  Datos del Procedimiento Quirúrgico
                </p>
                <form action={guardarInfoQuirurgica} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input type="hidden" name="episodeId" value={episodeId} />

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Procedimiento quirúrgico realizado o programado *
                    </label>
                    <input
                      name="procedureName"
                      required
                      defaultValue={perfilQuirurgico?.procedureName ?? ''}
                      placeholder="Ej. Apendicectomía laparoscópica, Colecistectomía..."
                      className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Fecha y hora de cirugía
                    </label>
                    <input
                      name="surgeryDate"
                      type="datetime-local"
                      defaultValue={fmtFechaInput(perfilQuirurgico?.surgeryDate)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Tipo de cirugía
                    </label>
                    <select
                      name="surgeryType"
                      defaultValue={perfilQuirurgico?.surgeryType ?? 'electiva'}
                      className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    >
                      <option value="electiva">Electiva</option>
                      <option value="emergencia">Emergencia</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Especialidad quirúrgica
                    </label>
                    <select
                      name="surgicalSpecialty"
                      defaultValue={perfilQuirurgico?.surgicalSpecialty ?? 'Cirugía General'}
                      className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    >
                      {ESPECIALIDADES_QUIRURGICAS.map((esp) => (
                        <option key={esp} value={esp}>
                          {esp}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Estado
                    </label>
                    <select
                      name="surgeryStatus"
                      defaultValue={perfilQuirurgico?.surgeryStatus ?? 'pendiente'}
                      className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold"
                    >
                      {ESTADOS_CIRUGIA.map((st) => (
                        <option key={st.value} value={st.value}>
                          {st.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Cirujano y ayudantes
                    </label>
                    <input
                      name="surgeonAndAssistants"
                      defaultValue={perfilQuirurgico?.surgeonAndAssistants ?? ''}
                      placeholder="Ej. Dr. Morales (MA) / Dra. López (R3), Dr. Pérez (R1)"
                      className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="sm:col-span-2 pt-1">
                    <button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 rounded-lg cursor-pointer"
                    >
                      Guardar Información Quirúrgica
                    </button>
                  </div>
                </form>
              </div>
            </details>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg p-3.5 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Procedimiento quirúrgico realizado o programado
              </span>
              <span className={`px-2 py-0.5 rounded border text-[11px] font-bold ${estadoMeta.badge}`}>
                {estadoMeta.label}
              </span>
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {perfilQuirurgico?.procedureName || 'Sin procedimiento registrado aún'}
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-300 pt-1 border-t border-slate-200 dark:border-slate-700">
              <span className="inline-flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {perfilQuirurgico?.surgeryDate
                  ? fmtFechaHora(perfilQuirurgico.surgeryDate)
                  : 'Fecha por definir'}
              </span>
              <span>·</span>
              <span className="font-semibold capitalize">
                Tipo: {perfilQuirurgico?.surgeryType === 'emergencia' ? 'Emergencia' : 'Electiva'}
              </span>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg p-3.5 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
              <span>Especialidad y Equipo</span>
            </div>
            <p className="text-xs font-bold text-slate-900 dark:text-white">
              {perfilQuirurgico?.surgicalSpecialty || 'Cirugía General'}
            </p>
            <div className="pt-1 border-t border-slate-200 dark:border-slate-700">
              <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Users className="w-3 h-3" /> Cirujano y ayudantes
              </p>
              <p className="text-xs font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                {perfilQuirurgico?.surgeonAndAssistants || 'Sin asignar'}
              </p>
            </div>
          </div>

          {/* TIPIFICACIÓN SANGUÍNEA */}
          <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg p-3.5 flex flex-col justify-between gap-2">
            <div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5 text-rose-600" />
                Tipificación Sanguínea
              </span>
              {tipificacion.bloodType ? (
                <p className="text-2xl font-black text-rose-700 dark:text-rose-400 mt-1">
                  {tipificacion.bloodType}
                </p>
              ) : (
                <p className="text-xs text-slate-400 italic mt-1">Sin tipificación</p>
              )}
            </div>

            {puedeRegistrar && (
              <details className="pt-2 border-t border-slate-200 dark:border-slate-700">
                <summary className="text-xs font-medium text-blue-600 hover:text-blue-800 cursor-pointer">
                  {tipificacion.bloodType ? 'Actualizar Grupo y Rh' : '+ Registrar Grupo y Rh'}
                </summary>
                <form action={guardarTipificacion} className="space-y-2 mt-2">
                  <input type="hidden" name="episodeId" value={episodeId} />
                  <select
                    name="bloodType"
                    required
                    className="w-full px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
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
        </div>

        {/* DISPOSITIVOS / CATÉTERES / PROCEDIMIENTOS DE ESTE PACIENTE */}
        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
            <div>
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Catéteres, Accesos y Drenajes Activos ({dispositivos.length})
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Los dispositivos activos aquí se suman automáticamente al panel general de Cirugía.
              </p>
            </div>

            {puedeRegistrar && (
              <form action={agregarDispositivoQuirurgico} className="flex flex-wrap items-center gap-2">
                <input type="hidden" name="episodeId" value={episodeId} />
                <select
                  name="category"
                  required
                  className="px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                >
                  <option value="">+ Agregar catéter o acceso...</option>
                  {CATEGORIAS_DISPOSITIVOS_CIRUGIA.map((cat) => (
                    <option key={cat.key} value={cat.key}>
                      {cat.label}
                    </option>
                  ))}
                </select>
                <input
                  name="notes"
                  placeholder="Nota opcional (ej. lado der.)"
                  className="px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white w-44"
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar</span>
                </button>
              </form>
            )}
          </div>

          {dispositivos.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {dispositivos.map((d) => (
                <div
                  key={d.id}
                  className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs"
                >
                  <span className="font-bold text-slate-800 dark:text-slate-100">
                    {mapaEtiquetaCat.get(d.category) ?? d.category}
                  </span>
                  {d.notes && (
                    <span className="text-slate-500 dark:text-slate-400">· {d.notes}</span>
                  )}
                  <span className="text-[10px] text-slate-400 tabular-nums">
                    ({fmtFechaHora(d.createdAt)})
                  </span>
                  {puedeRegistrar && (
                    <form action={retirarDispositivoQuirurgico} className="inline">
                      <input type="hidden" name="episodeId" value={episodeId} />
                      <input type="hidden" name="deviceId" value={d.id} />
                      <button
                        type="submit"
                        title="Marcar como retirado"
                        className="text-red-600 hover:text-red-800 p-0.5 rounded cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">
              Sin catéteres, accesos ni drenajes pleurales/SPBSA registrados en este paciente.
            </p>
          )}
        </div>
      </div>
    </>
  )
}
