'use client'

import { useState } from 'react'
import {
  Pill,
  FlaskConical,
  FolderKanban,
  Pencil,
  Plus,
  Archive,
  Check,
  X,
  History,
} from 'lucide-react'
import {
  agregarAntibiotico,
  agregarPlanDepartamentoBase,
  archivarPlanDepartamentoBase,
  editarPlanDepartamentoBase,
  guardarTratamiento,
  suspenderAntibiotico,
} from '@/app/dashboard/paciente/[id]/actions-clinicas'
import { calcularDiasAntibiotico } from '@/lib/cirugia-constants'
import type { AntibioticoResumen } from '@/components/TratamientoActual'
import type { PlanBaseEntryItem } from '@/components/PlanDepartamentoBase'
import { TextareaTratamiento } from '@/components/TextareaTratamiento'
import { renderTextoClinico } from '@/lib/texto-clinico'

const ETIQUETA_ROL: Record<string, string> = {
  SUPERADMIN: 'SuperAdmin',
  ADMIN: 'Admin',
  DOCTOR: 'Médico',
  RESIDENT: 'Residente',
  NURSE: 'Enf.',
  LAB: 'Laboratorio',
  READONLY: 'Lectura',
}

const fmtFechaHora = (d: Date | string | null | undefined) => {
  if (!d) return ''
  return new Date(d).toLocaleString('es-DO', {
    timeZone: 'America/Santo_Domingo',
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const fmtFechaCorta = (d: Date | string) =>
  new Date(d).toLocaleDateString('es-DO', {
    timeZone: 'America/Santo_Domingo',
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  })

export function CirugiaTratamientoPlanBloque({
  episodeId,
  tratamiento,
  actualizadoPor,
  actualizadoAt,
  antibioticos,
  departamentoLabel,
  entradasPlan,
  nombres,
  roles,
  puedeRegistrar,
  modoOrtopedia = false,
}: {
  episodeId: string
  tratamiento: string | null
  actualizadoPor: string | null
  actualizadoAt: Date | string | null
  antibioticos: AntibioticoResumen[]
  departamentoLabel: string
  entradasPlan: PlanBaseEntryItem[]
  nombres: Record<string, string>
  roles: Record<string, string>
  puedeRegistrar: boolean
  modoOrtopedia?: boolean
}) {
  const [editandoTratamiento, setEditandoTratamiento] = useState(false)
  const [agregandoAbx, setAgregandoAbx] = useState(false)
  const [agregandoPlan, setAgregandoPlan] = useState(false)
  const [editandoPlanId, setEditandoPlanId] = useState<string | null>(null)
  const [textoEdicionPlan, setTextoEdicionPlan] = useState('')
  const [confirmArchivarPlanId, setConfirmArchivarPlanId] = useState<string | null>(null)

  const abxActivos = antibioticos.filter((a) => a.isActive)
  const abxSuspendidos = antibioticos.filter((a) => !a.isActive)

  const planesActivos = entradasPlan.filter((e) => e.isActive)
  const planesArchivados = entradasPlan
    .filter((e) => !e.isActive)
    .sort(
      (a, b) =>
        new Date(b.updatedAt ?? b.createdAt).getTime() -
        new Date(a.updatedAt ?? a.createdAt).getTime()
    )

  const hoyIso = new Date().toLocaleDateString('en-CA', {
    timeZone: 'America/Santo_Domingo',
  })

  const renderAutorBadge = (email: string) => {
    const nombre = nombres[email] ?? email
    const rol = roles[email]
    return (
      <>
        <strong className="text-slate-700 dark:text-slate-200">{nombre}</strong>
        {rol && (
          <span className="ml-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[10px] font-bold px-1 rounded">
            {ETIQUETA_ROL[rol] ?? rol}
          </span>
        )}
      </>
    )
  }

  return (
    <div className="bg-white dark:bg-slate-800 p-4 sm:p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 mb-6 print:hidden">
      <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-2 mb-4">
        💊 Tratamiento, Antibióticos y Plan del Departamento Base
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* CUADRITO 1: TRATAMIENTO MÉDICO ACTUAL */}
        <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg p-3 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <Pill className="w-3.5 h-3.5 text-blue-600" />
              <span>Tratamiento Actual</span>
            </span>

            {tratamiento ? (
              <div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md p-2.5 max-h-40 overflow-y-auto">
                  <p className="font-mono text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                    {renderTextoClinico(tratamiento)}
                  </p>
                </div>
                {actualizadoPor && (
                  <div className="mt-2 pt-1.5 border-t border-slate-200 dark:border-slate-700 text-[11px] text-slate-500">
                    <span>Registró: </span>
                    {renderAutorBadge(actualizadoPor)}
                    {actualizadoAt && (
                      <span className="block text-[10px] text-slate-400 tabular-nums">
                        {fmtFechaHora(actualizadoAt)}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">Sin esquema de tratamiento registrado.</p>
            )}
          </div>

          {puedeRegistrar && (
            <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setEditandoTratamiento((v) => !v)}
                className="text-xs font-medium text-blue-600 hover:text-blue-800 cursor-pointer"
              >
                {editandoTratamiento
                  ? 'Cerrar'
                  : tratamiento
                    ? 'Actualizar esquema'
                    : '+ Registrar esquema'}
              </button>

              {editandoTratamiento && (
                <form
                  action={async (formData) => {
                    await guardarTratamiento(formData)
                    setEditandoTratamiento(false)
                  }}
                  className="space-y-2 mt-2"
                >
                  <input type="hidden" name="episodeId" value={episodeId} />
                  <TextareaTratamiento
                    name="currentTreatment"
                    rows={4}
                    defaultValue={tratamiento ?? ''}
                    placeholder={
                      modoOrtopedia
                        ? '1. Analgesia escalonada / Paracetamol 1g IV c/8h\n2. Enoxaparina 40mg SC c/24h (tromboprofilaxis)\n3. Elevación de extremidad + crioterapia local'
                        : '1. Omeprazol 40mg IV c/24h\n2. Analgesia / hidratación...'
                    }
                    className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono"
                  />
                  <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs py-1.5 rounded font-medium cursor-pointer"
                  >
                    Guardar Tratamiento
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* CUADRITO 2: ANTIBIÓTICOS CON CONTEO DE DÍAS */}
        <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg p-3 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <FlaskConical className="w-3.5 h-3.5 text-teal-600" />
              <span>Antibióticos ({abxActivos.length})</span>
            </span>

            {abxActivos.length > 0 ? (
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-0.5">
                {abxActivos.map((abx) => {
                  const dias = calcularDiasAntibiotico(abx.startedAt)
                  return (
                    <div
                      key={abx.id}
                      className="bg-white dark:bg-slate-900 border border-teal-200 dark:border-teal-800 rounded-md px-2.5 py-2 flex items-start justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] font-black bg-teal-700 text-white px-1.5 py-0.5 rounded tabular-nums">
                            Día {dias}
                          </span>
                          <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {abx.name}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5 tabular-nums">
                          {abx.dose ? `${abx.dose} · ` : ''}
                          {abx.route ?? 'IV'} · Inicio: {fmtFechaCorta(abx.startedAt)}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          Por: {renderAutorBadge(abx.createdBy)}
                        </p>
                      </div>

                      {puedeRegistrar && (
                        <form action={suspenderAntibiotico} className="shrink-0">
                          <input type="hidden" name="episodeId" value={episodeId} />
                          <input type="hidden" name="antibioticId" value={abx.id} />
                          <button
                            type="submit"
                            className="text-[10px] font-bold text-red-700 hover:bg-red-50 border border-red-200 px-2 py-0.5 rounded cursor-pointer"
                          >
                            Suspender
                          </button>
                        </form>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">Sin antibióticos activos.</p>
            )}

            {abxSuspendidos.length > 0 && (
              <details className="mt-2 pt-1.5 border-t border-slate-200 dark:border-slate-700">
                <summary className="text-[11px] font-semibold text-slate-500 hover:text-slate-700 cursor-pointer">
                  Suspendidos ({abxSuspendidos.length})
                </summary>
                <div className="mt-1.5 space-y-1 max-h-28 overflow-y-auto">
                  {abxSuspendidos.map((abx) => {
                    const totalDias = calcularDiasAntibiotico(abx.startedAt, abx.stoppedAt)
                    return (
                      <div
                        key={abx.id}
                        className="bg-white border border-slate-200 rounded px-2 py-1 text-[10px] text-slate-600 flex items-center justify-between gap-2"
                      >
                        <span className="truncate">
                          <strong>{abx.name}</strong> · {totalDias} día(s)
                        </span>
                        <span className="text-slate-400 shrink-0 tabular-nums">
                          {fmtFechaCorta(abx.startedAt)} →{' '}
                          {abx.stoppedAt ? fmtFechaCorta(abx.stoppedAt) : '—'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </details>
            )}
          </div>

          {puedeRegistrar && (
            <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setAgregandoAbx((v) => !v)}
                className="text-xs font-medium text-blue-600 hover:text-blue-800 cursor-pointer"
              >
                {agregandoAbx ? 'Cerrar' : '+ Agregar antibiótico'}
              </button>

              {agregandoAbx && (
                <form
                  action={async (formData) => {
                    await agregarAntibiotico(formData)
                    setAgregandoAbx(false)
                  }}
                  className="space-y-2 mt-2"
                >
                  <input type="hidden" name="episodeId" value={episodeId} />
                  <input
                    name="name"
                    required
                    placeholder="Antibiótico (ej. Ceftriaxona)"
                    className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-900"
                  />
                  <div className="grid grid-cols-2 gap-1.5">
                    <input
                      name="dose"
                      placeholder="Dosis (ej. 1g c/12h)"
                      className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-900"
                    />
                    <select
                      name="route"
                      defaultValue="IV"
                      className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-900"
                    >
                      <option value="IV">IV</option>
                      <option value="VO">VO</option>
                      <option value="IM">IM</option>
                    </select>
                  </div>
                  <input
                    name="startedAt"
                    type="date"
                    required
                    defaultValue={hoyIso}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs bg-white text-slate-900"
                  />
                  <button
                    type="submit"
                    className="w-full bg-teal-700 hover:bg-teal-800 text-white text-xs py-1.5 rounded font-medium cursor-pointer"
                  >
                    Iniciar Antibiótico
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* CUADRITO 3: PLAN DEL DEPARTAMENTO BASE */}
        <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg p-3 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <FolderKanban className="w-3.5 h-3.5 text-purple-600" />
              <span className="truncate">
                Plan Depto. Base ({departamentoLabel}) · {planesActivos.length}
              </span>
            </span>

            {planesActivos.length > 0 ? (
              <div className="space-y-2 max-h-52 overflow-y-auto pr-0.5">
                {planesActivos.map((item, idx) => {
                  const estaEditando = editandoPlanId === item.id
                  const estaConfirmando = confirmArchivarPlanId === item.id

                  return (
                    <div
                      key={item.id}
                      className="bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 rounded-md p-2 text-xs space-y-1.5"
                    >
                      {estaEditando ? (
                        <form
                          action={async (formData) => {
                            await editarPlanDepartamentoBase(formData)
                            setEditandoPlanId(null)
                            setTextoEdicionPlan('')
                          }}
                          className="space-y-1.5"
                        >
                          <input type="hidden" name="episodeId" value={episodeId} />
                          <input type="hidden" name="entryId" value={item.id} />
                          <textarea
                            name="content"
                            required
                            rows={2}
                            value={textoEdicionPlan}
                            onChange={(e) => setTextoEdicionPlan(e.target.value)}
                            className="w-full px-2 py-1 border border-purple-300 rounded text-xs text-slate-900"
                          />
                          <div className="flex justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setEditandoPlanId(null)
                                setTextoEdicionPlan('')
                              }}
                              className="px-2 py-0.5 text-[11px] text-slate-500 cursor-pointer"
                            >
                              Cancelar
                            </button>
                            <button
                              type="submit"
                              className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-purple-700 text-white rounded text-[11px] font-bold cursor-pointer"
                            >
                              <Check className="w-3 h-3" /> Guardar
                            </button>
                          </div>
                        </form>
                      ) : (
                        <>
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex items-start gap-1.5">
                              <span className="shrink-0 text-[10px] font-black rounded px-1 py-0.5 bg-purple-100 text-purple-800 tabular-nums">
                                #{idx + 1}
                              </span>
                              <p className="text-xs text-slate-800 dark:text-slate-200 whitespace-pre-line leading-snug wrap-break-word">
                                {item.content}
                              </p>
                            </div>

                            {puedeRegistrar && !estaConfirmando && (
                              <div className="shrink-0 flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditandoPlanId(item.id)
                                    setTextoEdicionPlan(item.content)
                                    setConfirmArchivarPlanId(null)
                                  }}
                                  title="Editar"
                                  className="text-purple-700 hover:bg-purple-50 p-1 rounded cursor-pointer"
                                >
                                  <Pencil className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setConfirmArchivarPlanId(item.id)}
                                  title="Archivar"
                                  className="text-slate-400 hover:text-red-600 p-1 rounded cursor-pointer"
                                >
                                  <Archive className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>

                          {estaConfirmando && (
                            <div className="flex items-center justify-end gap-1.5 bg-red-50 border border-red-200 px-2 py-1 rounded text-[10px]">
                              <span className="font-bold text-red-800">¿Archivar?</span>
                              <form
                                action={async (formData) => {
                                  await archivarPlanDepartamentoBase(formData)
                                  setConfirmArchivarPlanId(null)
                                }}
                              >
                                <input type="hidden" name="episodeId" value={episodeId} />
                                <input type="hidden" name="entryId" value={item.id} />
                                <button
                                  type="submit"
                                  className="bg-red-600 text-white font-bold px-2 py-0.5 rounded cursor-pointer"
                                >
                                  Sí
                                </button>
                              </form>
                              <button
                                type="button"
                                onClick={() => setConfirmArchivarPlanId(null)}
                                className="text-slate-600 px-1 cursor-pointer"
                              >
                                No
                              </button>
                            </div>
                          )}

                          <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                            <span>
                              {item.createdBy ? renderAutorBadge(item.createdBy) : 'Registro previo'}
                            </span>
                            {item.createdAt && (
                              <span className="tabular-nums"> · {fmtFechaHora(item.createdAt)}</span>
                            )}
                            {item.updatedAt && item.updatedBy && (
                              <span className="block text-amber-700">
                                Editado por {renderAutorBadge(item.updatedBy)} ({fmtFechaHora(item.updatedAt)})
                              </span>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">Sin indicaciones del servicio base.</p>
            )}

            {planesArchivados.length > 0 && (
              <details className="mt-2 pt-1.5 border-t border-slate-200 dark:border-slate-700">
                <summary className="text-[11px] font-semibold text-purple-700 hover:text-purple-900 cursor-pointer inline-flex items-center gap-1">
                  <History className="w-3 h-3" /> Archivados ({planesArchivados.length})
                </summary>
                <div className="mt-1.5 space-y-1 max-h-28 overflow-y-auto">
                  {planesArchivados.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white border border-slate-200 rounded px-2 py-1 text-[10px] text-slate-500"
                    >
                      <p className="line-through">{item.content}</p>
                      <p className="mt-0.5">
                        {item.createdBy ? renderAutorBadge(item.createdBy) : 'Registro previo'} ·{' '}
                        {fmtFechaHora(item.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>

          {puedeRegistrar && (
            <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setAgregandoPlan((v) => !v)}
                className="text-xs font-medium text-blue-600 hover:text-blue-800 cursor-pointer inline-flex items-center gap-1"
              >
                {agregandoPlan ? (
                  <>
                    <X className="w-3 h-3" /> Cerrar
                  </>
                ) : (
                  <>
                    <Plus className="w-3 h-3" /> Agregar plan / indicación
                  </>
                )}
              </button>

              {agregandoPlan && (
                <form
                  action={async (formData) => {
                    await agregarPlanDepartamentoBase(formData)
                    setAgregandoPlan(false)
                  }}
                  className="space-y-2 mt-2"
                >
                  <input type="hidden" name="episodeId" value={episodeId} />
                  <textarea
                    name="content"
                    required
                    rows={3}
                    placeholder={
                      modoOrtopedia
                        ? 'Ej. Control radiográfico postoperatorio, mantener férula en posición funcional, fisioterapia...'
                        : 'Ej. NPO, hidratación parenteral, control c/8h...'
                    }
                    className="w-full px-2.5 py-1.5 border border-purple-300 rounded text-xs bg-white text-slate-900"
                  />
                  <button
                    type="submit"
                    className="w-full bg-purple-700 hover:bg-purple-800 text-white text-xs py-1.5 rounded font-medium cursor-pointer"
                  >
                    Registrar Plan Base
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
