'use client'

import { useState } from 'react'
import { FolderKanban, Plus, Pencil, Archive, Check, X, History } from 'lucide-react'
import {
  agregarPlanDepartamentoBase,
  archivarPlanDepartamentoBase,
  editarPlanDepartamentoBase,
} from '@/app/dashboard/paciente/[id]/actions-clinicas'

export type PlanBaseEntryItem = {
  id: string
  content: string
  isActive: boolean
  createdBy: string
  createdAt: Date | string
  updatedBy?: string | null
  updatedAt?: Date | string | null
  esLegado?: boolean
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

const fmtFechaHora = (d: Date | string | null | undefined) => {
  if (!d) return ''
  return new Date(d).toLocaleString('es-DO', {
    timeZone: 'America/Santo_Domingo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function PlanDepartamentoBase({
  episodeId,
  departamentoLabel,
  entradas,
  nombres,
  roles = {},
  puedeRegistrar,
}: {
  episodeId: string
  departamentoLabel: string
  entradas: PlanBaseEntryItem[]
  nombres: Record<string, string>
  roles?: Record<string, string>
  puedeRegistrar: boolean
}) {
  const [mostrandoAgregar, setMostrandoAgregar] = useState(false)
  const [nuevoTexto, setNuevoTexto] = useState('')
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [textoEdicion, setTextoEdicion] = useState('')
  const [confirmandoArchivarId, setConfirmandoArchivarId] = useState<string | null>(null)

  const activas = entradas.filter((e) => e.isActive)
  const archivadas = entradas
    .filter((e) => !e.isActive)
    .sort(
      (a, b) =>
        new Date(b.updatedAt ?? b.createdAt).getTime() -
        new Date(a.updatedAt ?? a.createdAt).getTime()
    )

  const renderAutor = (email: string) => {
    const nombre = nombres[email] ?? email
    const rol = roles[email]
    return (
      <>
        <strong className="text-slate-800">{nombre}</strong>
        {rol && (
          <span className="ml-1 bg-purple-100 text-purple-800 text-[10px] font-bold px-1.5 py-0.5 rounded border border-purple-200">
            {ETIQUETA_ROL[rol] ?? rol}
          </span>
        )}
      </>
    )
  }

  return (
    <div className="bg-purple-50/70 border border-purple-200 rounded-xl p-5 shadow-sm mb-6 print:hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-purple-200 pb-3 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <FolderKanban className="w-5 h-5 text-purple-700" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-purple-900">
            Plan del Departamento Base ({departamentoLabel})
          </h2>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200 tabular-nums">
            {activas.length} {activas.length === 1 ? 'registro activo' : 'registros activos'}
          </span>
        </div>

        {puedeRegistrar && (
          <button
            type="button"
            onClick={() => {
              setMostrandoAgregar((v) => !v)
              setEditandoId(null)
              setConfirmandoArchivarId(null)
            }}
            className="inline-flex items-center gap-1.5 text-xs bg-purple-700 hover:bg-purple-800 text-white px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer"
          >
            {mostrandoAgregar ? (
              <>
                <X className="w-3.5 h-3.5" /> Cerrar
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" /> Agregar Plan / Indicación
              </>
            )}
          </button>
        )}
      </div>

      {/* FORMULARIO PARA AGREGAR UN NUEVO PLAN SIN SOBRESCRIBIR LOS ANTERIORES */}
      {puedeRegistrar && mostrandoAgregar && (
        <form
          action={async (formData) => {
            await agregarPlanDepartamentoBase(formData)
            setNuevoTexto('')
            setMostrandoAgregar(false)
          }}
          className="bg-white border border-purple-300 rounded-xl p-4 mb-4 shadow-sm space-y-2.5"
        >
          <input type="hidden" name="episodeId" value={episodeId} />
          <label className="block text-xs font-bold text-purple-900">
            Nueva indicación o plan del departamento base (se añadirá al historial con tu nombre, fecha y hora):
          </label>
          <textarea
            name="content"
            required
            rows={3}
            value={nuevoTexto}
            onChange={(e) => setNuevoTexto(e.target.value)}
            placeholder="Ej. Programar apendicectomía laparoscópica, mantener NPO, hidratación parenteral, control de drenaje c/8h..."
            className="w-full px-3 py-2 border border-purple-200 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-purple-500 outline-none"
          />
          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setMostrandoAgregar(false)
                setNuevoTexto('')
              }}
              className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-lg cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" /> Registrar Plan Base
            </button>
          </div>
        </form>
      )}

      {/* LISTADO DE INDICACIONES ACTIVAS CON TRAZABILIDAD COMPLETA */}
      {activas.length > 0 ? (
        <div className="space-y-3">
          {activas.map((item, idx) => {
            const estaEditando = editandoId === item.id
            const estaConfirmandoArchivar = confirmandoArchivarId === item.id

            return (
              <div
                key={item.id}
                className="bg-white border border-purple-200/80 rounded-xl p-3.5 shadow-2xs"
              >
                {estaEditando ? (
                  <form
                    action={async (formData) => {
                      await editarPlanDepartamentoBase(formData)
                      setEditandoId(null)
                      setTextoEdicion('')
                    }}
                    className="space-y-2.5"
                  >
                    <input type="hidden" name="episodeId" value={episodeId} />
                    <input type="hidden" name="entryId" value={item.id} />
                    <label className="block text-xs font-bold text-purple-900">
                      Editar registro #{idx + 1} (quedará constancia de quién lo editó, fecha y hora):
                    </label>
                    <textarea
                      name="content"
                      required
                      rows={3}
                      value={textoEdicion}
                      onChange={(e) => setTextoEdicion(e.target.value)}
                      className="w-full px-3 py-2 border border-purple-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditandoId(null)
                          setTextoEdicion('')
                        }}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-lg cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" /> Guardar Cambios
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start gap-2">
                        <span className="inline-flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-black rounded px-1.5 py-0.5 bg-purple-100 text-purple-800 border border-purple-200 tabular-nums">
                          #{idx + 1}
                        </span>
                        <p className="text-sm text-slate-800 whitespace-pre-line leading-relaxed wrap-break-word">
                          {item.content}
                        </p>
                      </div>

                      <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span>
                          Registrado por:{' '}
                          {item.createdBy ? (
                            renderAutor(item.createdBy)
                          ) : (
                            <strong className="text-slate-700">Registro previo del expediente</strong>
                          )}
                        </span>
                        {item.createdAt && (
                          <span className="tabular-nums">· {fmtFechaHora(item.createdAt)}</span>
                        )}
                        {item.updatedAt && item.updatedBy && (
                          <span className="text-amber-700">
                            · Editado por {renderAutor(item.updatedBy)} ({fmtFechaHora(item.updatedAt)})
                          </span>
                        )}
                      </div>
                    </div>

                    {puedeRegistrar && (
                      <div className="shrink-0 flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditandoId(item.id)
                            setTextoEdicion(item.content)
                            setMostrandoAgregar(false)
                            setConfirmandoArchivarId(null)
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-purple-300 bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-bold cursor-pointer"
                        >
                          <Pencil className="w-3 h-3" /> Editar
                        </button>

                        {estaConfirmandoArchivar ? (
                          <div className="flex items-center gap-1.5 bg-red-50 border border-red-200 px-2 py-1 rounded-lg text-xs">
                            <span className="font-bold text-red-800">¿Archivar?</span>
                            <form
                              action={async (formData) => {
                                await archivarPlanDepartamentoBase(formData)
                                setConfirmandoArchivarId(null)
                              }}
                            >
                              <input type="hidden" name="episodeId" value={episodeId} />
                              <input type="hidden" name="entryId" value={item.id} />
                              <button
                                type="submit"
                                className="bg-red-600 hover:bg-red-700 text-white font-bold px-2 py-0.5 rounded cursor-pointer"
                              >
                                Sí
                              </button>
                            </form>
                            <button
                              type="button"
                              onClick={() => setConfirmandoArchivarId(null)}
                              className="text-slate-600 hover:text-slate-800 px-1 font-medium cursor-pointer"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setConfirmandoArchivarId(item.id)
                              setEditandoId(null)
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold cursor-pointer"
                          >
                            <Archive className="w-3 h-3" /> Archivar
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <p className="text-xs text-purple-700 italic">
          No hay indicaciones registradas aún en el plan del departamento base. Usa &quot;+ Agregar Plan / Indicación&quot; para añadir la primera.
        </p>
      )}

      {/* HISTORIAL ARCHIVADO (MANTIENE REGISTRO HISTÓRICO COMPLETO) */}
      {archivadas.length > 0 && (
        <details className="mt-4 pt-3 border-t border-purple-200/70">
          <summary className="cursor-pointer text-xs font-bold text-purple-800 hover:text-purple-950 inline-flex items-center gap-1.5">
            <History className="w-3.5 h-3.5" /> Historial de planes archivados ({archivadas.length})
          </summary>
          <div className="mt-2.5 space-y-2">
            {archivadas.map((item) => (
              <div
                key={item.id}
                className="bg-white/60 border border-purple-200/60 rounded-lg p-3 text-xs text-slate-600"
              >
                <p className="line-through text-slate-500 whitespace-pre-line">{item.content}</p>
                <p className="text-[11px] text-slate-500 mt-1.5">
                  Creado por {item.createdBy ? renderAutor(item.createdBy) : 'Registro previo'} ·{' '}
                  {fmtFechaHora(item.createdAt)}
                  {item.updatedBy && item.updatedAt && (
                    <>
                      {' '}
                      · Archivado por {renderAutor(item.updatedBy)} ({fmtFechaHora(item.updatedAt)})
                    </>
                  )}
                </p>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}
