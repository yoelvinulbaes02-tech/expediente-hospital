'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronDown, ClipboardList, Pencil, X } from 'lucide-react'
import { actualizarResumenEmergenciaDashboard } from '@/app/dashboard/paciente/[id]/actions-clinicas'
import { etiquetaRolClinico } from '@/lib/consultas-auth'
import {
  ESPECIALIDADES_EMERGENCIA,
  ESTADOS_CLINICOS_EMERGENCIA,
  NIVELES_TRIAJE_EMERGENCIA,
  type EmergenciaGuardiaData,
} from '@/lib/emergencia-constants'

export type EpisodioEmergenciaTabla = {
  id: string
  room: string | null
  bed: string | null
  admissionDate: Date | string
  primaryDiagnosis: string | null
  chiefComplaint: string | null
  patient: {
    firstName: string
    lastName: string
    age: number | string | null
    expedienteNumber: string
  }
  emergencyProfile?: {
    amc: string | null
    specialty: string | null
    relevantLabsStudies: string | null
    interestsPending: string | null
    triageLevel: string
    clinicalStatus: string
    updatedBy?: string | null
    updatedByName?: string | null
    updatedByRole?: string | null
    updatedAt?: string | null
  } | null
}

function fmtModificacion(fecha?: string | null): string {
  if (!fecha) return ''
  return new Date(fecha).toLocaleString('es-DO', {
    timeZone: 'America/Santo_Domingo',
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function fmtTiempoIngreso(fecha: Date | string): string {
  const f = new Date(fecha)
  const diffMs = Math.max(0, Date.now() - f.getTime())
  const totalMin = Math.floor(diffMs / 60000)
  const dias = Math.floor(totalMin / (60 * 24))
  const horas = Math.floor((totalMin % (60 * 24)) / 60)
  const fechaStr = f.toLocaleString('es-DO', {
    timeZone: 'America/Santo_Domingo',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
  if (dias >= 1) return `${dias}d ${horas}h · ${fechaStr}`
  if (horas >= 1) return `${horas}h · ${fechaStr}`
  return `${Math.max(1, totalMin)}m · ${fechaStr}`
}

export function EmergenciaTablaPanel({
  episodes,
  guardiaData,
  puedeEditar,
}: {
  episodes: EpisodioEmergenciaTabla[]
  guardiaData?: EmergenciaGuardiaData
  puedeEditar: boolean
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [editId, setEditId] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const ordenados = [...episodes].sort((a, b) => {
    const rA = (a.room ?? '').trim()
    const rB = (b.room ?? '').trim()
    const c1 = rA.localeCompare(rB, undefined, { numeric: true, sensitivity: 'base' })
    if (c1 !== 0) return c1
    return (a.bed ?? '').trim().localeCompare((b.bed ?? '').trim(), undefined, {
      numeric: true,
      sensitivity: 'base',
    })
  })

  const handleSave = (formData: FormData) => {
    setErrorMsg(null)
    startTransition(async () => {
      const res = await actualizarResumenEmergenciaDashboard(formData)
      if (!res.ok) {
        setErrorMsg(res.error ?? 'No se pudo actualizar el paciente en Emergencia.')
        return
      }
      setEditId(null)
      router.refresh()
    })
  }

  return (
    <details className="group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl mb-6 overflow-hidden">
      <summary className="list-none cursor-pointer px-4 py-3.5 flex flex-wrap items-center justify-between gap-2 hover:bg-slate-50/70 dark:hover:bg-slate-700/30 [&::-webkit-details-marker]:hidden">
        <div className="flex items-center gap-2.5 min-w-0">
          <ChevronDown className="w-4 h-4 text-slate-500 transition-transform group-open:rotate-0 -rotate-90 shrink-0" />
          <ClipboardList className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
          <div className="min-w-0">
            <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-white">
              Listado General de Pacientes en Emergencia ({ordenados.length})
            </h2>
            {(guardiaData?.ma || guardiaData?.ri || guardiaData?.mg) && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {guardiaData.ma ? `MA: ${guardiaData.ma}` : ''}
                {guardiaData.ma && (guardiaData.ri || guardiaData.mg) ? ' · ' : ''}
                {guardiaData.ri ? `RI: ${guardiaData.ri}` : ''}
                {guardiaData.ri && guardiaData.mg ? ' · ' : ''}
                {guardiaData.mg ? `MG: ${guardiaData.mg}` : ''}
              </p>
            )}
          </div>
        </div>
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 group-open:hidden">
          Expandir tabla
        </span>
      </summary>

      <div className="border-t border-slate-200 dark:border-slate-700">
        {errorMsg && (
          <div className="mx-4 mt-3 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
            {errorMsg}
          </div>
        )}

        {ordenados.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400">
            Aún no hay pacientes ingresados en Emergencia. Registra el primero con el botón &ldquo;+ Ingresar Paciente Propio&rdquo;.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold">
                  <th className="px-3 py-2.5 whitespace-nowrap">Cama</th>
                  <th className="px-3 py-2.5 whitespace-nowrap">Tiempo de ingreso</th>
                  <th className="px-3 py-2.5 whitespace-nowrap">AMC</th>
                  <th className="px-3 py-2.5">Nombre y Apellido</th>
                  <th className="px-3 py-2.5">Especialidad</th>
                  <th className="px-3 py-2.5">Diagnóstico</th>
                  <th className="px-3 py-2.5">Analíticas y estudios relevantes</th>
                  <th className="px-3 py-2.5">Pendientes / Interés</th>
                  <th className="px-3 py-2.5 text-right whitespace-nowrap">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {ordenados.map((ep) => {
                  const estaEditando = editId === ep.id
                  const prof = ep.emergencyProfile
                  const camaLabel = `${ep.room || '—'}${ep.bed ? ` · ${ep.bed}` : ''}`

                  if (estaEditando && puedeEditar) {
                    return (
                      <tr key={ep.id} className="bg-rose-50/40 dark:bg-rose-950/10">
                        <td colSpan={9} className="p-3.5">
                          <form action={handleSave} className="space-y-3">
                            <input type="hidden" name="episodeId" value={ep.id} />
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-xs font-bold text-slate-900 dark:text-white">
                                Editando: {ep.patient.firstName} {ep.patient.lastName}
                              </p>
                              <button
                                type="button"
                                onClick={() => setEditId(null)}
                                className="text-slate-500 hover:text-slate-700 cursor-pointer p-1"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                              <div className="grid grid-cols-2 gap-1.5">
                                <div>
                                  <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-300 mb-0.5">
                                    Área / Cubículo
                                  </label>
                                  <input
                                    name="room"
                                    defaultValue={ep.room ?? ''}
                                    placeholder="TS 1 / Obs"
                                    className="w-full px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-300 mb-0.5">
                                    Cama
                                  </label>
                                  <input
                                    name="bed"
                                    defaultValue={ep.bed ?? ''}
                                    placeholder="1"
                                    className="w-full px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                  />
                                </div>
                              </div>

                              <div>
                                <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-300 mb-0.5">
                                  AMC
                                </label>
                                <input
                                  name="amc"
                                  defaultValue={prof?.amc ?? ''}
                                  placeholder="Código / AMC..."
                                  className="w-full px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-300 mb-0.5">
                                  Especialidad
                                </label>
                                <select
                                  name="specialty"
                                  defaultValue={prof?.specialty ?? 'Emergenciología'}
                                  className="w-full px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                >
                                  {ESPECIALIDADES_EMERGENCIA.map((esp) => (
                                    <option key={esp} value={esp}>
                                      {esp}
                                    </option>
                                  ))}
                                </select>
                              </div>

                              <div className="grid grid-cols-2 gap-1.5">
                                <div>
                                  <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-300 mb-0.5">
                                    Triaje
                                  </label>
                                  <select
                                    name="triageLevel"
                                    defaultValue={prof?.triageLevel ?? 'Emergencia'}
                                    className="w-full px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                  >
                                    {NIVELES_TRIAJE_EMERGENCIA.map((nv) => (
                                      <option key={nv} value={nv}>
                                        {nv}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-300 mb-0.5">
                                    Estado
                                  </label>
                                  <select
                                    name="clinicalStatus"
                                    defaultValue={prof?.clinicalStatus ?? 'En observación'}
                                    className="w-full px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                  >
                                    {ESTADOS_CLINICOS_EMERGENCIA.map((st) => (
                                      <option key={st} value={st}>
                                        {st}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5">
                              <div>
                                <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-300 mb-0.5">
                                  Diagnóstico
                                </label>
                                <input
                                  name="primaryDiagnosis"
                                  defaultValue={ep.primaryDiagnosis ?? ep.chiefComplaint ?? ''}
                                  className="w-full px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-300 mb-0.5">
                                  Analíticas y estudios relevantes
                                </label>
                                <textarea
                                  name="relevantLabsStudies"
                                  rows={2}
                                  defaultValue={prof?.relevantLabsStudies ?? ''}
                                  className="w-full px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                />
                              </div>
                              <div>
                                <label className="block text-[10px] font-semibold text-slate-600 dark:text-slate-300 mb-0.5">
                                  Pendientes / Interés
                                </label>
                                <textarea
                                  name="interestsPending"
                                  rows={2}
                                  defaultValue={prof?.interestsPending ?? ''}
                                  className="w-full px-2 py-1.5 border border-slate-300 dark:border-slate-600 rounded text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                />
                              </div>
                            </div>

                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setEditId(null)}
                                className="px-3 py-1.5 rounded text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                              >
                                Cancelar
                              </button>
                              <button
                                type="submit"
                                disabled={isPending}
                                className="px-4 py-1.5 rounded text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white cursor-pointer disabled:opacity-50"
                              >
                                {isPending ? 'Guardando...' : 'Guardar Cambios'}
                              </button>
                            </div>
                          </form>
                        </td>
                      </tr>
                    )
                  }

                  return (
                    <tr
                      key={ep.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-700/30 align-top"
                    >
                      <td className="px-3 py-2.5 font-bold text-slate-900 dark:text-white whitespace-nowrap tabular-nums">
                        {camaLabel}
                      </td>
                      <td className="px-3 py-2.5 text-slate-600 dark:text-slate-300 whitespace-nowrap tabular-nums">
                        {fmtTiempoIngreso(ep.admissionDate)}
                      </td>
                      <td className="px-3 py-2.5 text-slate-800 dark:text-slate-100 whitespace-nowrap tabular-nums">
                        {prof?.amc?.trim() || '—'}
                      </td>
                      <td className="px-3 py-2.5">
                        <Link
                          href={`/dashboard/paciente/${ep.id}`}
                          className="font-bold text-slate-900 dark:text-white hover:text-rose-700 dark:hover:text-rose-300 hover:underline"
                        >
                          {ep.patient.firstName} {ep.patient.lastName}
                        </Link>
                        <span className="block text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                          {ep.patient.age ? `${ep.patient.age} años · ` : ''}Exp: {ep.patient.expedienteNumber}
                        </span>
                        {prof?.updatedByName && (
                          <span className="block text-[10px] text-slate-400 dark:text-slate-500 tabular-nums mt-0.5">
                            Modif.: {prof.updatedByName}
                            {prof.updatedByRole ? ` (${etiquetaRolClinico(prof.updatedByRole)})` : ''}
                            {prof.updatedAt ? ` · ${fmtModificacion(prof.updatedAt)}` : ''}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-slate-700 dark:text-slate-200">
                        <span className="font-semibold block">{prof?.specialty?.trim() || 'Emergenciología'}</span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          {prof?.triageLevel ?? 'Emergencia'}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-slate-800 dark:text-slate-100 max-w-xs">
                        {ep.primaryDiagnosis || ep.chiefComplaint || 'Sin diagnóstico'}
                      </td>
                      <td className="px-3 py-2.5 text-slate-700 dark:text-slate-200 whitespace-pre-wrap max-w-xs tabular-nums">
                        {prof?.relevantLabsStudies?.trim() || '—'}
                      </td>
                      <td className="px-3 py-2.5 text-slate-700 dark:text-slate-200 whitespace-pre-wrap max-w-xs">
                        {prof?.interestsPending?.trim() || '—'}
                      </td>
                      <td className="px-3 py-2.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          {puedeEditar && (
                            <button
                              type="button"
                              onClick={() => setEditId(ep.id)}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded border border-slate-300 dark:border-slate-600 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                            >
                              <Pencil className="w-3 h-3" />
                              <span>Editar</span>
                            </button>
                          )}
                          <Link
                            href={`/dashboard/paciente/${ep.id}`}
                            className="text-xs font-bold text-rose-700 dark:text-rose-300 hover:underline"
                          >
                            Ver →
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </details>
  )
}
