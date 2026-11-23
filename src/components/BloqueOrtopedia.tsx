'use client'

import { useState } from 'react'
import {
  Bone,
  Droplets,
  Calendar,
  Users,
  Stethoscope,
  Plus,
  X,
  AlertTriangle,
  ShieldAlert,
  Activity,
  ChevronDown,
  ChevronUp,
  Footprints,
} from 'lucide-react'
import {
  CATEGORIAS_DISPOSITIVOS_ORTOPEDIA,
  ESTADOS_ORTOPEDIA,
  LATERALIDADES_ORTOPEDIA,
  OPCIONES_LLENADO_CAPILAR,
  OPCIONES_MOTILIDAD_DISTAL,
  OPCIONES_PULSOS_DISTALES,
  OPCIONES_SENSIBILIDAD_DISTAL,
  PAUTAS_CARGA_ORTOPEDIA,
  SUBESPECIALIDADES_ORTOPEDIA,
  calcularDiasPostQx,
} from '@/lib/ortopedia-constants'
import {
  agregarDispositivoQuirurgico,
  guardarEvaluacionNeurovascularOrtopedia,
  guardarInfoOrtopedica,
  guardarTipificacion,
  retirarDispositivoQuirurgico,
} from '@/app/dashboard/paciente/[id]/actions-clinicas'
import { agregarAlergia, marcarSinAlergias } from '@/app/dashboard/paciente/[id]/actions'
import { AntropometriaCard } from '@/components/AntropometriaCard'

type PerfilOrtopedico = {
  id: string
  procedureName: string | null
  surgeryDate: Date | null
  surgeryType: string
  surgicalSpecialty: string | null
  surgeonAndAssistants: string | null
  surgeryStatus: string
  suspensionReason?: string | null
  affectedLimb?: string | null
  managementType?: string | null
  neurovascularStatus?: string | null
  capillaryRefill?: string | null
  distalPulses?: string | null
  distalSensitivity?: string | null
  distalMotility?: string | null
  compartmentAlert?: boolean
  painScaleEva?: number | null
  weightBearingPlan?: string | null
  orthopedicNotes?: string | null
  neurovascularUpdatedBy?: string | null
  neurovascularUpdatedAt?: Date | null
  updatedBy: string
  updatedAt: Date
}

type DispositivoOrtopedico = {
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

export function BloqueOrtopedia({
  episodeId,
  perfilOrtopedico,
  dispositivos,
  tipificacion,
  alergias,
  antropometria,
  nombres,
  roles,
  puedeRegistrar,
}: {
  episodeId: string
  perfilOrtopedico: PerfilOrtopedico | null
  dispositivos: DispositivoOrtopedico[]
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
  const [editandoProcedimiento, setEditandoProcedimiento] = useState(false)
  const [estadoProcForm, setEstadoProcForm] = useState<string>(
    perfilOrtopedico?.surgeryStatus ?? 'pendiente'
  )
  const [nvAbierto, setNvAbierto] = useState(true)
  const [editandoNv, setEditandoNv] = useState(false)
  const [editandoAlergia, setEditandoAlergia] = useState(false)
  const [agregandoDispositivo, setAgregandoDispositivo] = useState(false)

  const estadoMeta =
    ESTADOS_ORTOPEDIA.find((e) => e.value === (perfilOrtopedico?.surgeryStatus ?? 'pendiente')) ??
    ESTADOS_ORTOPEDIA[0]

  const diasPostQx = calcularDiasPostQx(
    perfilOrtopedico?.surgeryDate,
    perfilOrtopedico?.surgeryStatus
  )

  const mapaEtiquetaCat = new Map<string, string>(
    CATEGORIAS_DISPOSITIVOS_ORTOPEDIA.map((c) => [c.key, c.label])
  )

  const sinEvaluarAlergias = !alergias || alergias.length === 0 || alergias[0].status === 'no_evaluada'
  const niegaAlergias = !sinEvaluarAlergias && alergias[0].status === 'sin_alergias'
  const tieneAlergias = !sinEvaluarAlergias && !niegaAlergias
  const ultimaAlergia = alergias?.[0] ?? null

  const alertaNeurovascular =
    Boolean(perfilOrtopedico?.compartmentAlert) ||
    perfilOrtopedico?.neurovascularStatus === 'alerta_alterado'

  const renderAutor = (email: string, fecha?: Date | null) => (
    <div className="mt-2 pt-1.5 border-t border-slate-200/80 text-[11px] text-slate-500">
      <span>Registró: </span>
      <strong className="text-slate-700">{nombres[email] ?? email}</strong>
      {roles[email] && (
        <span className="ml-1 bg-slate-200 text-slate-700 text-[10px] font-bold px-1 rounded">
          {ETIQUETA_ROL[roles[email]] ?? roles[email]}
        </span>
      )}
      {fecha && (
        <span className="block text-[10px] text-slate-400 tabular-nums">
          {fmtFechaHora(fecha)}
        </span>
      )}
    </div>
  )

  return (
    <>
      {/* SECCIÓN 1: 4 CUADRITOS LINEALES (INMOVILIZACIONES · ANTROPOMETRÍA · TIPIFICACIÓN · ALERGIAS) */}
      <div className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 mb-6 print:hidden">
        <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-2 mb-4">
          🦴 Inmovilizaciones, Antropometría, Tipificación y Alergias
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. INMOVILIZACIONES, TRACCIONES Y FIJADORES */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-col justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <Bone className="w-3.5 h-3.5 text-blue-600" />
                <span>Inmovilizaciones y Fijadores ({dispositivos.length})</span>
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
                          {nombres[d.createdBy] ?? d.createdBy}
                          {roles[d.createdBy]
                            ? ` (${ETIQUETA_ROL[roles[d.createdBy]] ?? roles[d.createdBy]})`
                            : ''}{' '}
                          · {fmtFechaHora(d.createdAt)}
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
                  Sin férulas, yesos, tracciones ni fijadores activos.
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
                  {agregandoDispositivo ? 'Cerrar' : '+ Agregar dispositivo ortopédico'}
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
                      <option value="">Seleccione dispositivo...</option>
                      {CATEGORIAS_DISPOSITIVOS_ORTOPEDIA.map((cat) => (
                        <option key={cat.key} value={cat.key}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                    <input
                      name="notes"
                      placeholder="Nota (ej. pierna der., 3 kg tracción)"
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

          {/* 2. ANTROPOMETRÍA */}
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

          {/* 3. TIPIFICACIÓN SANGUÍNEA */}
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

          {/* 4. ALERGIAS */}
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
                        placeholder="Alérgeno (Ej. Penicilina, AINEs)"
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
        </div>
      </div>

      {/* SECCIÓN 2 (RETRAÍBLE Y EDITABLE): EVALUACIÓN NEUROVASCULAR DISTAL, DOLOR (EVA) Y PAUTA DE CARGA */}
      <div
        className={`bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-xl border mb-6 print:hidden ${
          alertaNeurovascular
            ? 'border-red-300 dark:border-red-800'
            : 'border-slate-200 dark:border-slate-700'
        }`}
      >
        <div
          className={`flex flex-wrap items-center justify-between gap-2 ${
            nvAbierto ? 'border-b border-slate-200 dark:border-slate-700 pb-3 mb-4' : ''
          }`}
        >
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Activity
                className={`w-4 h-4 ${
                  alertaNeurovascular ? 'text-red-600' : 'text-teal-600 dark:text-teal-400'
                }`}
              />
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Evaluación Neurovascular Distal, Dolor (EVA) y Carga
              </h2>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded border ${
                  alertaNeurovascular
                    ? 'bg-red-100 text-red-900 border-red-300'
                    : perfilOrtopedico?.neurovascularUpdatedAt
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                {alertaNeurovascular
                  ? '⚠ Alerta Neurovascular / Compartimental'
                  : perfilOrtopedico?.neurovascularUpdatedAt
                    ? 'Neurovascular distal conservado'
                    : 'Pendiente de evaluación'}
              </span>
              {perfilOrtopedico?.painScaleEva !== null &&
                perfilOrtopedico?.painScaleEva !== undefined && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded border bg-slate-100 text-slate-800 border-slate-200 tabular-nums">
                    EVA: {perfilOrtopedico.painScaleEva}/10
                  </span>
                )}
            </div>

            {perfilOrtopedico?.neurovascularUpdatedBy && perfilOrtopedico?.neurovascularUpdatedAt && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Actualizó:{' '}
                <strong className="text-slate-700 dark:text-slate-200">
                  {nombres[perfilOrtopedico.neurovascularUpdatedBy] ??
                    perfilOrtopedico.neurovascularUpdatedBy}
                </strong>
                {roles[perfilOrtopedico.neurovascularUpdatedBy] && (
                  <span className="ml-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[10px] font-bold px-1 rounded">
                    {ETIQUETA_ROL[roles[perfilOrtopedico.neurovascularUpdatedBy]] ??
                      roles[perfilOrtopedico.neurovascularUpdatedBy]}
                  </span>
                )}{' '}
                ·{' '}
                <span className="tabular-nums">
                  {fmtFechaHora(perfilOrtopedico.neurovascularUpdatedAt)}
                </span>
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {nvAbierto && puedeRegistrar && (
              <button
                type="button"
                onClick={() => setEditandoNv((v) => !v)}
                className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
              >
                {editandoNv ? 'Cerrar edición' : 'Actualizar Neurovascular / Carga'}
              </button>
            )}
            <button
              type="button"
              onClick={() => setNvAbierto((v) => !v)}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 cursor-pointer"
            >
              {nvAbierto ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" />
                  <span>Retraer</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" />
                  <span>Expandir</span>
                </>
              )}
            </button>
          </div>
        </div>

        {nvAbierto && (
          <>
            {puedeRegistrar && editandoNv && (
              <form
                action={async (formData) => {
                  await guardarEvaluacionNeurovascularOrtopedia(formData)
                  setEditandoNv(false)
                }}
                className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-teal-200 dark:border-slate-700 mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
              >
                <input type="hidden" name="episodeId" value={episodeId} />

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Estado neurovascular distal *
                  </label>
                  <select
                    name="neurovascularStatus"
                    defaultValue={perfilOrtopedico?.neurovascularStatus ?? 'conservado'}
                    className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold"
                  >
                    <option value="conservado">Conservado (Sin déficit distal)</option>
                    <option value="alerta_alterado">Alterado / Compromiso neurovascular</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Pulsos distales (pedio / radial)
                  </label>
                  <select
                    name="distalPulses"
                    defaultValue={perfilOrtopedico?.distalPulses ?? OPCIONES_PULSOS_DISTALES[0]}
                    className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    {OPCIONES_PULSOS_DISTALES.map((op) => (
                      <option key={op} value={op}>
                        {op}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Llenado capilar distal
                  </label>
                  <select
                    name="capillaryRefill"
                    defaultValue={perfilOrtopedico?.capillaryRefill ?? OPCIONES_LLENADO_CAPILAR[0]}
                    className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    {OPCIONES_LLENADO_CAPILAR.map((op) => (
                      <option key={op} value={op}>
                        {op}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Sensibilidad distal
                  </label>
                  <select
                    name="distalSensitivity"
                    defaultValue={
                      perfilOrtopedico?.distalSensitivity ?? OPCIONES_SENSIBILIDAD_DISTAL[0]
                    }
                    className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    {OPCIONES_SENSIBILIDAD_DISTAL.map((op) => (
                      <option key={op} value={op}>
                        {op}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Motilidad distal
                  </label>
                  <select
                    name="distalMotility"
                    defaultValue={perfilOrtopedico?.distalMotility ?? OPCIONES_MOTILIDAD_DISTAL[0]}
                    className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    {OPCIONES_MOTILIDAD_DISTAL.map((op) => (
                      <option key={op} value={op}>
                        {op}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Escala de dolor EVA (0 - 10)
                  </label>
                  <input
                    name="painScaleEva"
                    type="number"
                    min={0}
                    max={10}
                    defaultValue={perfilOrtopedico?.painScaleEva ?? ''}
                    placeholder="Ej. 4"
                    className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white tabular-nums"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Pauta de carga y movilidad *
                  </label>
                  <select
                    name="weightBearingPlan"
                    defaultValue={
                      perfilOrtopedico?.weightBearingPlan ?? PAUTAS_CARGA_ORTOPEDIA[0]
                    }
                    className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    {PAUTAS_CARGA_ORTOPEDIA.map((pauta) => (
                      <option key={pauta} value={pauta}>
                        {pauta}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end pb-1">
                  <label className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs font-bold text-red-900 cursor-pointer w-full">
                    <input
                      type="checkbox"
                      name="compartmentAlert"
                      defaultChecked={Boolean(perfilOrtopedico?.compartmentAlert)}
                      className="w-4 h-4 accent-red-600"
                    />
                    <span>Vigilar síndrome compartimental</span>
                  </label>
                </div>

                <div className="sm:col-span-2 lg:col-span-3">
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Observaciones clínicas / edema / flictenas / yeso
                  </label>
                  <input
                    name="orthopedicNotes"
                    defaultValue={perfilOrtopedico?.orthopedicNotes ?? ''}
                    placeholder="Ej. Edema moderado sin tensión compartimental, férula bien tolerada, dedos tibios..."
                    className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="sm:col-span-2 lg:col-span-3">
                  <button
                    type="submit"
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold py-2 rounded-lg cursor-pointer"
                  >
                    Guardar Evaluación Neurovascular y Carga
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Pulsos distales</p>
                <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                  {perfilOrtopedico?.distalPulses || 'Sin registrar'}
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Llenado capilar</p>
                <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5 tabular-nums">
                  {perfilOrtopedico?.capillaryRefill || 'Sin registrar'}
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Sensibilidad</p>
                <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                  {perfilOrtopedico?.distalSensitivity || 'Sin registrar'}
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Motilidad</p>
                <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                  {perfilOrtopedico?.distalMotility || 'Sin registrar'}
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Dolor (EVA)</p>
                <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5 tabular-nums">
                  {perfilOrtopedico?.painScaleEva !== null &&
                  perfilOrtopedico?.painScaleEva !== undefined
                    ? `${perfilOrtopedico.painScaleEva} / 10`
                    : '—'}
                </p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg p-2.5">
                <p className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                  <Footprints className="w-3 h-3 text-teal-600" /> Pauta de carga
                </p>
                <p className="text-xs font-bold text-teal-900 dark:text-teal-300 mt-0.5">
                  {perfilOrtopedico?.weightBearingPlan || 'Sin definir'}
                </p>
              </div>
            </div>

            {perfilOrtopedico?.orthopedicNotes && (
              <p className="mt-3 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2">
                <strong>Observación ortopédica:</strong> {perfilOrtopedico.orthopedicNotes}
              </p>
            )}
          </>
        )}
      </div>

      {/* SECCIÓN 3: PROCEDIMIENTO ORTOPÉDICO / TRAUMA Y MANEJO */}
      <div className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-xl border border-slate-200 dark:border-slate-700 mb-6 print:hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-3 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Bone className="w-4 h-4 text-blue-600" />
              <span>Procedimiento Ortopédico y Manejo</span>
            </h2>
            {perfilOrtopedico && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Actualizó:{' '}
                <strong className="text-slate-700 dark:text-slate-200">
                  {nombres[perfilOrtopedico.updatedBy] ?? perfilOrtopedico.updatedBy}
                </strong>
                {roles[perfilOrtopedico.updatedBy] && (
                  <span className="ml-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[10px] font-bold px-1 rounded">
                    {ETIQUETA_ROL[roles[perfilOrtopedico.updatedBy]] ??
                      roles[perfilOrtopedico.updatedBy]}
                  </span>
                )}{' '}
                · <span className="tabular-nums">{fmtFechaHora(perfilOrtopedico.updatedAt)}</span>
              </p>
            )}
          </div>

          {puedeRegistrar && (
            <button
              type="button"
              onClick={() => {
                setEstadoProcForm(perfilOrtopedico?.surgeryStatus ?? 'pendiente')
                setEditandoProcedimiento((v) => !v)
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              {editandoProcedimiento
                ? 'Cerrar formulario'
                : perfilOrtopedico?.procedureName
                  ? 'Editar Procedimiento Ortopédico'
                  : '+ Registrar Procedimiento / Manejo'}
            </button>
          )}
        </div>

        {puedeRegistrar && editandoProcedimiento && (
          <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-blue-200 dark:border-slate-700 mb-4">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-2 mb-3">
              Datos del Procedimiento Ortopédico / Osteosíntesis / Manejo
            </p>
            <form
              action={async (formData) => {
                await guardarInfoOrtopedica(formData)
                setEditandoProcedimiento(false)
              }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3"
            >
              <input type="hidden" name="episodeId" value={episodeId} />

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Procedimiento / Osteosíntesis / Manejo *
                </label>
                <input
                  name="procedureName"
                  required
                  defaultValue={perfilOrtopedico?.procedureName ?? ''}
                  placeholder="Ej. RAFI fémur proximal con clavo cefalomedular, Reducción cerrada + yeso..."
                  className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Extremidad / Lateralidad
                </label>
                <select
                  name="affectedLimb"
                  defaultValue={perfilOrtopedico?.affectedLimb ?? LATERALIDADES_ORTOPEDIA[0]}
                  className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                >
                  {LATERALIDADES_ORTOPEDIA.map((lat) => (
                    <option key={lat} value={lat}>
                      {lat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Implante / Detalle anatómico (opcional)
                </label>
                <input
                  name="managementType"
                  defaultValue={perfilOrtopedico?.managementType ?? ''}
                  placeholder="Ej. Placa LCP, Tutor externo AO, Clavo endomedular..."
                  className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Fecha y hora del procedimiento
                </label>
                <input
                  name="surgeryDate"
                  type="datetime-local"
                  defaultValue={fmtFechaInput(perfilOrtopedico?.surgeryDate)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Prioridad / Modalidad
                </label>
                <select
                  name="surgeryType"
                  defaultValue={perfilOrtopedico?.surgeryType ?? 'electiva'}
                  className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                >
                  <option value="electiva">Electiva</option>
                  <option value="emergencia">Trauma / Emergencia</option>
                  <option value="conservador">Manejo conservador</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Subespecialidad de Ortopedia
                </label>
                <select
                  name="surgicalSpecialty"
                  defaultValue={
                    perfilOrtopedico?.surgicalSpecialty ?? SUBESPECIALIDADES_ORTOPEDIA[0]
                  }
                  className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                >
                  {SUBESPECIALIDADES_ORTOPEDIA.map((esp) => (
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
                  value={estadoProcForm}
                  onChange={(e) => setEstadoProcForm(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold"
                >
                  {ESTADOS_ORTOPEDIA.map((st) => (
                    <option key={st.value} value={st.value}>
                      {st.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Pauta de carga / apoyo
                </label>
                <select
                  name="weightBearingPlan"
                  defaultValue={perfilOrtopedico?.weightBearingPlan ?? PAUTAS_CARGA_ORTOPEDIA[0]}
                  className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                >
                  {PAUTAS_CARGA_ORTOPEDIA.map((pauta) => (
                    <option key={pauta} value={pauta}>
                      {pauta}
                    </option>
                  ))}
                </select>
              </div>

              {estadoProcForm === 'suspendida' && (
                <div className="sm:col-span-2 bg-red-50 border border-red-200 rounded-lg p-3">
                  <label className="block text-[11px] font-bold text-red-900 mb-1">
                    Motivo de suspensión *
                  </label>
                  <textarea
                    name="suspensionReason"
                    required
                    rows={2}
                    defaultValue={perfilOrtopedico?.suspensionReason ?? ''}
                    placeholder="Ej. Edema severo / flictenas en sitio quirúrgico, falta de material de osteosíntesis, falta de hemoderivados..."
                    className="w-full px-2.5 py-1.5 border border-red-300 rounded-lg text-xs bg-white text-slate-900"
                  />
                </div>
              )}

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Cirujano Ortopeda y Ayudantes
                </label>
                <input
                  name="surgeonAndAssistants"
                  defaultValue={perfilOrtopedico?.surgeonAndAssistants ?? ''}
                  placeholder="Ej. Dr. Gómez (MA Ortopedia) / Dra. Ruiz (R3)"
                  className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>

              <div className="sm:col-span-2 pt-1">
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 rounded-lg cursor-pointer"
                >
                  Guardar Procedimiento Ortopédico
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg p-3.5 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Procedimiento ortopédico / manejo
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                {diasPostQx !== null && (
                  <span className="px-2 py-0.5 rounded border border-indigo-200 bg-indigo-50 text-indigo-800 text-[11px] font-black tabular-nums">
                    POD {diasPostQx}
                  </span>
                )}
                {perfilOrtopedico?.affectedLimb && (
                  <span className="px-2 py-0.5 rounded border border-teal-200 bg-teal-50 text-teal-900 text-[11px] font-bold">
                    {perfilOrtopedico.affectedLimb}
                  </span>
                )}
                <span className={`px-2 py-0.5 rounded border text-[11px] font-bold ${estadoMeta.badge}`}>
                  {estadoMeta.label}
                </span>
              </div>
            </div>

            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {perfilOrtopedico?.procedureName || 'Sin procedimiento registrado aún'}
            </p>

            {perfilOrtopedico?.managementType && (
              <p className="text-xs text-slate-600 dark:text-slate-300">
                <strong>Implante / Material:</strong> {perfilOrtopedico.managementType}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-300 pt-1 border-t border-slate-200 dark:border-slate-700">
              <span className="inline-flex items-center gap-1 tabular-nums">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {perfilOrtopedico?.surgeryDate
                  ? fmtFechaHora(perfilOrtopedico.surgeryDate)
                  : 'Fecha por definir'}
              </span>
              <span>·</span>
              <span className="font-semibold">
                Tipo:{' '}
                {perfilOrtopedico?.surgeryType === 'emergencia'
                  ? 'Trauma / Emergencia'
                  : perfilOrtopedico?.surgeryType === 'conservador'
                    ? 'Manejo conservador'
                    : 'Electiva'}
              </span>
            </div>

            {perfilOrtopedico?.surgeryStatus === 'suspendida' && (
              <div className="mt-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Motivo de suspensión: </span>
                  <span>{perfilOrtopedico.suspensionReason || 'No especificado'}</span>
                </div>
              </div>
            )}
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg p-3.5 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
              <span>Subespecialidad y Equipo</span>
            </div>
            <p className="text-xs font-bold text-slate-900 dark:text-white">
              {perfilOrtopedico?.surgicalSpecialty || SUBESPECIALIDADES_ORTOPEDIA[0]}
            </p>
            <div className="pt-1 border-t border-slate-200 dark:border-slate-700">
              <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Users className="w-3 h-3" /> Cirujano Ortopeda y ayudantes
              </p>
              <p className="text-xs font-medium text-slate-800 dark:text-slate-200 mt-0.5">
                {perfilOrtopedico?.surgeonAndAssistants || 'Sin asignar'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
