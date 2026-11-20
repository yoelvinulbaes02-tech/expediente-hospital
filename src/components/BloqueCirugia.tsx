'use client'

import { useState } from 'react'
import {
  Scissors,
  Droplets,
  Calendar,
  Users,
  Stethoscope,
  Plus,
  X,
  AlertTriangle,
  ShieldAlert,
  Syringe,
} from 'lucide-react'
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
import { agregarAlergia, marcarSinAlergias } from '@/app/dashboard/paciente/[id]/actions'
import { AntropometriaCard } from '@/components/AntropometriaCard'

type PerfilQuirurgico = {
  id: string
  procedureName: string | null
  surgeryDate: Date | null
  surgeryType: string
  surgicalSpecialty: string | null
  surgeonAndAssistants: string | null
  surgeryStatus: string
  suspensionReason?: string | null
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

type AlergiaItem = {
  id: string
  allergen: string
  reaction: string | null
  status: string
  createdBy: string
  createdAt: Date
}

const ETIQUETA_ROL: Record<string, string> = {
  SUPERADMIN: 'SuperAdmin',
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
  alergias,
  antropometria,
  nombres,
  roles,
  puedeRegistrar,
}: {
  episodeId: string
  perfilQuirurgico: PerfilQuirurgico | null
  dispositivos: DispositivoQuirurgico[]
  tipificacion: Tipificacion
  alergias: AlergiaItem[]
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
  const [editandoQx, setEditandoQx] = useState(false)
  const [estadoQxForm, setEstadoQxForm] = useState<string>(
    perfilQuirurgico?.surgeryStatus ?? 'pendiente'
  )
  const [editandoAlergia, setEditandoAlergia] = useState(false)
  const [agregandoDispositivo, setAgregandoDispositivo] = useState(false)

  const estadoMeta =
    ESTADOS_CIRUGIA.find((e) => e.value === (perfilQuirurgico?.surgeryStatus ?? 'pendiente')) ??
    ESTADOS_CIRUGIA[0]

  const mapaEtiquetaCat = new Map<string, string>(
    CATEGORIAS_DISPOSITIVOS_CIRUGIA.map((c) => [c.key, c.label])
  )

  const sinEvaluarAlergias = !alergias || alergias.length === 0 || alergias[0].status === 'no_evaluada'
  const niegaAlergias = !sinEvaluarAlergias && alergias[0].status === 'sin_alergias'
  const tieneAlergias = !sinEvaluarAlergias && !niegaAlergias
  const ultimaAlergia = alergias?.[0] ?? null

  const renderAutor = (email: string, fecha?: Date | null) => (
    <div className="mt-2 pt-1.5 border-t border-slate-200/80 text-[11px] text-slate-500">
      <span>Registró: </span>
      <strong className="text-slate-700">{nombres[email] ?? email}</strong>
      {roles[email] && (
        <span className="ml-1 bg-slate-200 text-slate-700 text-[10px] font-bold px-1 rounded">
          {ETIQUETA_ROL[roles[email]] ?? roles[email]}
        </span>
      )}
      {fecha && <span className="block text-[10px] text-slate-400 tabular-nums">{fmtFechaHora(fecha)}</span>}
    </div>
  )

  return (
    <>
      {/* 4 CUADRITOS LINEALES IGUAL QUE NEFROLOGÍA: ANTROPOMETRÍA · TIPIFICACIÓN · ALERGIAS · CATÉTERES/ACCESOS */}
      <div className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 mb-6 print:hidden">
        <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-2 mb-4">
          🩺 Antropometría, Tipificación, Alergias y Catéteres / Accesos
        </h2>

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
            puedeRegistrar={puedeRegistrar}
          />

          {/* 2. TIPIFICACIÓN SANGUÍNEA */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <Droplets className="w-3.5 h-3.5 text-rose-600" />
                <span>Tipificación (Grupo y Rh)</span>
              </span>
              {tipificacion.bloodType ? (
                <div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xl">🩸</span>
                    <span className="text-2xl font-black text-rose-700">
                      {tipificacion.bloodType}
                    </span>
                  </div>
                  {tipificacion.recordedBy &&
                    renderAutor(tipificacion.recordedBy, tipificacion.updatedAt)}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic mt-1">Sin tipificación registrada.</p>
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
                    className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-900"
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

          {/* 3. ALERGIAS (AL LADO DE TIPIFICACIÓN) */}
          <div
            className={`rounded-lg p-3 flex flex-col justify-between border ${
              tieneAlergias
                ? 'bg-red-50/80 border-red-300'
                : niegaAlergias
                  ? 'bg-emerald-50/60 border-emerald-200'
                  : 'bg-amber-50/60 border-amber-200'
            }`}
          >
            <div>
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <ShieldAlert
                  className={`w-3.5 h-3.5 ${
                    tieneAlergias
                      ? 'text-red-600'
                      : niegaAlergias
                        ? 'text-emerald-600'
                        : 'text-amber-600'
                  }`}
                />
                <span>Alergias</span>
              </span>

              {sinEvaluarAlergias && (
                <div>
                  <p className="text-sm font-bold text-amber-900 mt-1">⚠️ No evaluadas</p>
                  <p className="text-[11px] text-amber-700">Requiere confirmación clínica.</p>
                </div>
              )}

              {niegaAlergias && (
                <div>
                  <p className="text-sm font-bold text-emerald-800 mt-1">✅ Niega alergias</p>
                  <p className="text-[11px] text-emerald-700">Sin antecedentes conocidos.</p>
                  {ultimaAlergia?.createdBy &&
                    renderAutor(ultimaAlergia.createdBy, ultimaAlergia.createdAt)}
                </div>
              )}

              {tieneAlergias && (
                <div>
                  <p className="text-xs font-extrabold text-red-800 mt-1">🚨 Alergias conocidas:</p>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {alergias.map((al) => (
                      <span
                        key={al.id}
                        title={al.reaction ? `Reacción: ${al.reaction}` : undefined}
                        className="bg-white text-red-800 border border-red-200 px-2 py-0.5 rounded text-xs font-bold"
                      >
                        {al.allergen}
                        {al.reaction ? ` (${al.reaction})` : ''}
                      </span>
                    ))}
                  </div>
                  {ultimaAlergia?.createdBy &&
                    renderAutor(ultimaAlergia.createdBy, ultimaAlergia.createdAt)}
                </div>
              )}
            </div>

            {puedeRegistrar && (
              <div className="mt-2 pt-2 border-t border-slate-200/80">
                <button
                  type="button"
                  onClick={() => setEditandoAlergia((v) => !v)}
                  className="text-xs font-medium text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                  {editandoAlergia
                    ? 'Cerrar'
                    : sinEvaluarAlergias
                      ? '+ Evaluar alergias'
                      : 'Actualizar / + Agregar'}
                </button>

                {editandoAlergia && (
                  <div className="space-y-2 mt-2">
                    <form
                      action={async (formData) => {
                        await marcarSinAlergias(formData)
                        setEditandoAlergia(false)
                      }}
                    >
                      <input type="hidden" name="episodeId" value={episodeId} />
                      <button
                        type="submit"
                        className="w-full bg-emerald-50 text-emerald-800 border border-emerald-300 px-2 py-1.5 rounded text-[11px] font-bold hover:bg-emerald-100 cursor-pointer"
                      >
                        ✅ Marcar: Niega Alergias
                      </button>
                    </form>

                    <form
                      action={async (formData) => {
                        await agregarAlergia(formData)
                        setEditandoAlergia(false)
                      }}
                      className="space-y-1.5 pt-1.5 border-t border-slate-200"
                    >
                      <input type="hidden" name="episodeId" value={episodeId} />
                      <input
                        name="allergen"
                        required
                        placeholder="Alérgeno (Ej. Penicilina)"
                        className="w-full px-2 py-1 border border-slate-300 rounded text-xs bg-white text-slate-900"
                      />
                      <input
                        name="reaction"
                        placeholder="Reacción (opcional)"
                        className="w-full px-2 py-1 border border-slate-300 rounded text-xs bg-white text-slate-900"
                      />
                      <button
                        type="submit"
                        className="w-full bg-red-600 hover:bg-red-700 text-white text-xs py-1.5 rounded font-medium cursor-pointer"
                      >
                        Guardar Alergia
                      </button>
                    </form>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 4. CATÉTERES, ACCESOS Y DRENAJES ACTIVOS */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <Syringe className="w-3.5 h-3.5 text-blue-600" />
                <span>Catéteres y Accesos ({dispositivos.length})</span>
              </span>

              {dispositivos.length > 0 ? (
                <div className="space-y-1.5 mt-1.5 max-h-40 overflow-y-auto pr-0.5">
                  {dispositivos.map((d) => (
                    <div
                      key={d.id}
                      className="bg-white border border-slate-200 rounded px-2 py-1.5 flex items-start justify-between gap-1.5 text-xs"
                    >
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 leading-snug">
                          {mapaEtiquetaCat.get(d.category) ?? d.category}
                        </p>
                        {d.notes && (
                          <p className="text-[11px] text-slate-600 truncate">{d.notes}</p>
                        )}
                        <p className="text-[10px] text-slate-400 tabular-nums mt-0.5">
                          {nombres[d.createdBy] ?? d.createdBy} · {fmtFechaHora(d.createdAt)}
                        </p>
                      </div>
                      {puedeRegistrar && (
                        <form action={retirarDispositivoQuirurgico} className="shrink-0">
                          <input type="hidden" name="episodeId" value={episodeId} />
                          <input type="hidden" name="deviceId" value={d.id} />
                          <button
                            type="submit"
                            title="Marcar como retirado"
                            className="text-red-500 hover:text-red-700 p-0.5 rounded cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </form>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic mt-1">
                  Sin catéteres o accesos activos.
                </p>
              )}
            </div>

            {puedeRegistrar && (
              <div className="mt-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setAgregandoDispositivo((v) => !v)}
                  className="text-xs font-medium text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                  {agregandoDispositivo ? 'Cerrar' : '+ Agregar catéter / acceso'}
                </button>

                {agregandoDispositivo && (
                  <form
                    action={async (formData) => {
                      await agregarDispositivoQuirurgico(formData)
                      setAgregandoDispositivo(false)
                    }}
                    className="space-y-1.5 mt-2"
                  >
                    <input type="hidden" name="episodeId" value={episodeId} />
                    <select
                      name="category"
                      required
                      className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-900"
                    >
                      <option value="">Seleccione catéter o acceso...</option>
                      {CATEGORIAS_DISPOSITIVOS_CIRUGIA.map((cat) => (
                        <option key={cat.key} value={cat.key}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                    <input
                      name="notes"
                      placeholder="Nota opcional (ej. lado der.)"
                      className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-900"
                    />
                    <button
                      type="submit"
                      className="w-full inline-flex items-center justify-center gap-1 bg-slate-800 hover:bg-slate-900 text-white text-xs py-1.5 rounded font-medium cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Agregar</span>
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* INFORMACIÓN QUIRÚRGICA */}
      <div className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-700 mb-6 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-3 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Scissors className="w-4 h-4 text-blue-600" />
              <span>Información Quirúrgica</span>
            </h2>
            {perfilQuirurgico && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Actualizó:{' '}
                <strong className="text-slate-700 dark:text-slate-200">
                  {nombres[perfilQuirurgico.updatedBy] ?? perfilQuirurgico.updatedBy}
                </strong>
                {roles[perfilQuirurgico.updatedBy] && (
                  <span className="ml-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[10px] font-bold px-1 rounded">
                    {ETIQUETA_ROL[roles[perfilQuirurgico.updatedBy]] ??
                      roles[perfilQuirurgico.updatedBy]}
                  </span>
                )}{' '}
                · {fmtFechaHora(perfilQuirurgico.updatedAt)}
              </p>
            )}
          </div>

          {puedeRegistrar && (
            <button
              type="button"
              onClick={() => {
                setEstadoQxForm(perfilQuirurgico?.surgeryStatus ?? 'pendiente')
                setEditandoQx((v) => !v)
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              {editandoQx
                ? 'Cerrar formulario'
                : perfilQuirurgico
                  ? 'Editar Información Quirúrgica'
                  : '+ Registrar Cirugía'}
            </button>
          )}
        </div>

        {puedeRegistrar && editandoQx && (
          <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-blue-200 dark:border-slate-700 mb-4">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-2 mb-3">
              Datos del Procedimiento Quirúrgico
            </p>
            <form
              action={async (formData) => {
                await guardarInfoQuirurgica(formData)
                setEditandoQx(false)
              }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3"
            >
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
                  value={estadoQxForm}
                  onChange={(e) => setEstadoQxForm(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold"
                >
                  {ESTADOS_CIRUGIA.map((st) => (
                    <option key={st.value} value={st.value}>
                      {st.label}
                    </option>
                  ))}
                </select>
              </div>

              {estadoQxForm === 'suspendida' && (
                <div className="sm:col-span-2 bg-red-50 border border-red-200 rounded-lg p-3">
                  <label className="block text-[11px] font-bold text-red-900 mb-1">
                    Motivo de suspensión (¿Por qué se suspendió?) *
                  </label>
                  <textarea
                    name="suspensionReason"
                    required
                    rows={2}
                    defaultValue={perfilQuirurgico?.suspensionReason ?? ''}
                    placeholder="Ej. Falta de hemoderivados, infección respiratoria aguda, paciente no en ayuno, falta de turno en quirófano..."
                    className="w-full px-2.5 py-1.5 border border-red-300 rounded-lg text-xs bg-white text-slate-900"
                  />
                </div>
              )}

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
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

            {perfilQuirurgico?.surgeryStatus === 'suspendida' && (
              <div className="mt-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Motivo de suspensión: </span>
                  <span>{perfilQuirurgico.suspensionReason || 'No especificado'}</span>
                </div>
              </div>
            )}
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
        </div>
      </div>
    </>
  )
}
