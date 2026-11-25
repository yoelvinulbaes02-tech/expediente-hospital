'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronDown, ClipboardList, Pencil, X } from 'lucide-react'
import { actualizarResumenHematologiaDashboard } from '@/app/dashboard/paciente/[id]/actions-clinicas'
import { etiquetaRolClinico } from '@/lib/consultas-auth'
import { FRECUENCIAS_SIGNOS_HEMA } from '@/lib/hematologia-constants'

export type EpisodioHematologiaResumen = {
  id: string
  room: string | null
  bed: string | null
  primaryDiagnosis: string | null
  secondaryDiagnoses?: string | null
  chiefComplaint: string | null
  patient: {
    firstName: string
    lastName: string
    age: number | string | null
    expedienteNumber: string
  }
  hematologyProfile?: {
    vitalSignsFrequency: string
    bleedingWatch: string | null
    painWatch: string | null
    temperatureWatch: string | null
    hemodynamicWatch: string | null
    pendingBloodProducts: string | null
    pendingStudies: string | null
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

function lineasPlanHema(ep: EpisodioHematologiaResumen): string[] {
  const p = ep.hematologyProfile
  const lineas: string[] = []
  const freq = p?.vitalSignsFrequency?.trim() || 'c/8 horas'
  lineas.push(`Signos vitales ${freq}`)
  if (p?.bleedingWatch?.trim()) lineas.push(p.bleedingWatch.trim())
  if (p?.painWatch?.trim()) lineas.push(p.painWatch.trim())
  if (p?.temperatureWatch?.trim()) lineas.push(p.temperatureWatch.trim())
  if (p?.hemodynamicWatch?.trim()) lineas.push(p.hemodynamicWatch.trim())
  if (p?.pendingBloodProducts?.trim()) lineas.push(p.pendingBloodProducts.trim())
  if (p?.pendingStudies?.trim()) lineas.push(p.pendingStudies.trim())
  return lineas
}

export function HematologiaResumenPanel({
  episodes,
  puedeEditar,
}: {
  episodes: EpisodioHematologiaResumen[]
  puedeEditar: boolean
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [editId, setEditId] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const fechaHoy = new Date().toLocaleDateString('es-DO', {
    timeZone: 'America/Santo_Domingo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

  const ordenados = [...episodes].sort((a, b) => {
    const locA = `${a.room ?? ''} ${a.bed ?? ''}`.trim()
    const locB = `${b.room ?? ''} ${b.bed ?? ''}`.trim()
    return locA.localeCompare(locB, undefined, { numeric: true, sensitivity: 'base' })
  })

  const handleGuardarFila = (formData: FormData) => {
    setErrorMsg(null)
    startTransition(async () => {
      const res = await actualizarResumenHematologiaDashboard(formData)
      if (!res.ok) {
        setErrorMsg(res.error ?? 'No se pudo actualizar el paciente.')
        return
      }
      setEditId(null)
      router.refresh()
    })
  }

  return (
    <details className="group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden mb-6">
      <summary className="list-none cursor-pointer px-4 py-3 flex flex-wrap items-center justify-between gap-2 bg-slate-50 dark:bg-slate-900/50 group-open:border-b border-slate-200 dark:border-slate-700 [&::-webkit-details-marker]:hidden">
        <div className="flex items-center gap-2">
          <ChevronDown className="w-4 h-4 text-slate-500 transition-transform group-open:rotate-0 -rotate-90" />
          <ClipboardList className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
            Pase de Visita · Resumen de Hematología
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            · {fechaHoy} · {ordenados.length} paciente{ordenados.length === 1 ? '' : 's'}
          </span>
        </div>
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 group-open:hidden">
          Expandir
        </span>
      </summary>

      <div className="p-3 sm:p-4 space-y-3">
        {errorMsg && (
          <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex justify-between items-center">
            <span>{errorMsg}</span>
            <button type="button" onClick={() => setErrorMsg(null)} className="cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {ordenados.length === 0 ? (
          <p className="text-center py-6 text-xs text-slate-400">
            No hay pacientes ingresados en el Pase de Visita de Hematología.
          </p>
        ) : (
          <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-lg">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-3 py-2 font-bold whitespace-nowrap">Cama / Ubicación</th>
                  <th className="px-3 py-2 font-bold">Paciente</th>
                  <th className="px-3 py-2 font-bold whitespace-nowrap">Edad</th>
                  <th className="px-3 py-2 font-bold whitespace-nowrap">Registro</th>
                  <th className="px-3 py-2 font-bold min-w-56">Diagnósticos</th>
                  <th className="px-3 py-2 font-bold min-w-60">Vigilancia y Pendientes</th>
                  {puedeEditar && <th className="px-3 py-2 font-bold text-right">Editar</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {ordenados.map((ep) => {
                  const editando = editId === ep.id
                  const p = ep.hematologyProfile
                  const diagnosticoTexto = [ep.primaryDiagnosis || ep.chiefComplaint, ep.secondaryDiagnoses]
                    .filter(Boolean)
                    .join(' / ')
                  const lineasPlan = lineasPlanHema(ep)

                  if (editando) {
                    return (
                      <tr key={ep.id} className="bg-indigo-50/40 dark:bg-indigo-950/20">
                        <td colSpan={puedeEditar ? 7 : 6} className="p-3">
                          <form action={handleGuardarFila} className="space-y-3">
                            <input type="hidden" name="episodeId" value={ep.id} />
                            <div className="flex items-center justify-between border-b border-indigo-200 dark:border-indigo-800 pb-2">
                              <span className="font-bold text-slate-900 dark:text-white">
                                Editando: {ep.patient.firstName} {ep.patient.lastName} (Exp: {ep.patient.expedienteNumber})
                              </span>
                              <button type="button" onClick={() => setEditId(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Sala / Ubicación</label>
                                <input name="room" defaultValue={ep.room ?? ''} className="w-full px-2 py-1.5 border rounded text-xs bg-white dark:bg-slate-900" />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Cama</label>
                                <input name="bed" defaultValue={ep.bed ?? ''} className="w-full px-2 py-1.5 border rounded text-xs bg-white dark:bg-slate-900" />
                              </div>
                              <div className="sm:col-span-2">
                                <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Diagnóstico Principal</label>
                                <input name="primaryDiagnosis" defaultValue={ep.primaryDiagnosis ?? ''} className="w-full px-2 py-1.5 border rounded text-xs bg-white dark:bg-slate-900" />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Signos Vitales</label>
                                <select name="vitalSignsFrequency" defaultValue={p?.vitalSignsFrequency ?? 'c/8 horas'} className="w-full px-2 py-1.5 border rounded text-xs bg-white dark:bg-slate-900">
                                  {FRECUENCIAS_SIGNOS_HEMA.map((f) => <option key={f} value={f}>{f}</option>)}
                                </select>
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Vigilar Sangrado</label>
                                <input name="bleedingWatch" defaultValue={p?.bleedingWatch ?? ''} placeholder="Datos de sangrado..." className="w-full px-2 py-1.5 border rounded text-xs bg-white dark:bg-slate-900" />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Vigilar Dolor</label>
                                <input name="painWatch" defaultValue={p?.painWatch ?? ''} placeholder="Datos de dolor..." className="w-full px-2 py-1.5 border rounded text-xs bg-white dark:bg-slate-900" />
                              </div>
                              <div>
                                <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Temp / Hemodinamia</label>
                                <input name="temperatureWatch" defaultValue={p?.temperatureWatch ?? ''} placeholder="Temperatura corporal..." className="w-full px-2 py-1.5 border rounded text-xs bg-white dark:bg-slate-900" />
                              </div>
                              <div className="sm:col-span-2">
                                <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Hemocomponentes Pendientes</label>
                                <input name="pendingBloodProducts" defaultValue={p?.pendingBloodProducts ?? ''} placeholder="Ej. 2 paquetes globulares, plaquetas..." className="w-full px-2 py-1.5 border rounded text-xs bg-white dark:bg-slate-900" />
                              </div>
                              <div className="sm:col-span-2">
                                <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Estudios Pendientes</label>
                                <input name="pendingStudies" defaultValue={p?.pendingStudies ?? ''} placeholder="Ej. Rx tórax PA..." className="w-full px-2 py-1.5 border rounded text-xs bg-white dark:bg-slate-900" />
                              </div>
                            </div>
                            <input type="hidden" name="hemodynamicWatch" value={p?.hemodynamicWatch ?? ''} />
                            <div className="flex justify-end gap-2">
                              <button type="button" onClick={() => setEditId(null)} className="px-3 py-1 border rounded text-xs font-semibold cursor-pointer">Cancelar</button>
                              <button type="submit" disabled={isPending} className="px-3.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-bold cursor-pointer">
                                {isPending ? 'Guardando...' : 'Guardar Fila'}
                              </button>
                            </div>
                          </form>
                        </td>
                      </tr>
                    )
                  }

                  return (
                    <tr key={ep.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 align-top">
                      <td className="px-3 py-2.5 font-bold text-slate-900 dark:text-white whitespace-nowrap tabular-nums">
                        {ep.room} {ep.bed ? `- ${ep.bed}` : ''}
                      </td>
                      <td className="px-3 py-2.5">
                        <Link href={`/dashboard/paciente/${ep.id}`} className="font-bold text-blue-700 dark:text-blue-400 hover:underline">
                          {ep.patient.firstName} {ep.patient.lastName}
                        </Link>
                        {p?.updatedByName && (
                          <span className="block text-[10px] text-slate-400 dark:text-slate-500 tabular-nums mt-0.5">
                            Modif.: {p.updatedByName}
                            {p.updatedByRole ? ` (${etiquetaRolClinico(p.updatedByRole)})` : ''}
                            {p.updatedAt ? ` · ${fmtModificacion(p.updatedAt)}` : ''}
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-slate-700 dark:text-slate-300 whitespace-nowrap tabular-nums">
                        {ep.patient.age ? `${ep.patient.age} años` : '—'}
                      </td>
                      <td className="px-3 py-2.5 text-slate-600 dark:text-slate-300 whitespace-nowrap tabular-nums">
                        {ep.patient.expedienteNumber}
                      </td>
                      <td className="px-3 py-2.5 text-slate-800 dark:text-slate-100 leading-relaxed">
                        {diagnosticoTexto || '—'}
                      </td>
                      <td className="px-3 py-2.5 text-slate-800 dark:text-slate-100">
                        <ul className="list-disc pl-4 space-y-0.5">
                          {lineasPlan.map((ln, idx) => (
                            <li key={idx}>{ln}</li>
                          ))}
                        </ul>
                      </td>
                      {puedeEditar && (
                        <td className="px-3 py-2.5 text-right">
                          <button
                            type="button"
                            onClick={() => setEditId(ep.id)}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 cursor-pointer"
                          >
                            <Pencil className="w-3 h-3" />
                            <span>Editar</span>
                          </button>
                        </td>
                      )}
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
