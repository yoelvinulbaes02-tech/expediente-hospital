'use client'

import { useState } from 'react'
import { TextareaConDeshacer } from '@/components/TextareaConDeshacer'

export type EvolucionNotaItem = {
  id: string
  content: string | null
  subjective: string | null
  objective: string | null
  assessment: string | null
  plan: string | null
  createdBy: string
  createdAtFormatted: string
  updatedBy: string | null
  updatedAtFormatted: string | null
  puedeEditar: boolean
}

export function ListaEvoluciones({
  episodeId,
  notas,
  nombres,
  roles,
  etiquetasRol,
  action,
}: {
  episodeId: string
  notas: EvolucionNotaItem[]
  nombres: Record<string, string>
  roles: Record<string, string>
  etiquetasRol: Record<string, string>
  action: (formData: FormData) => Promise<void>
}) {
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [enviandoId, setEnviandoId] = useState<string | null>(null)

  const handleGuardar = async (notaId: string, formData: FormData) => {
    setEnviandoId(notaId)
    try {
      await action(formData)
      setEditandoId(null)
    } finally {
      setEnviandoId(null)
    }
  }

  return (
    <div className="space-y-4 print:hidden">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-slate-800">Historial de Evoluciones</h2>
        <span className="text-xs bg-slate-100 text-slate-600 font-semibold px-2.5 py-0.5 rounded-full border border-slate-200">
          {notas.length} nota{notas.length === 1 ? '' : 's'}
        </span>
      </div>

      {notas.length === 0 && (
        <p className="text-slate-500 text-sm">No hay evoluciones registradas.</p>
      )}

      {notas.map((nota) => {
        const estaEditando = nota.puedeEditar && editandoId === nota.id
        const estaEnviando = enviandoId === nota.id
        const esNotaLibre = nota.content !== null

        return (
          <div
            key={nota.id}
            className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 transition-colors"
          >
            <div className="flex flex-wrap justify-between items-start gap-2 border-b pb-2.5 mb-3">
              <div className="space-y-1">
                <p className="text-sm font-bold text-blue-700">
                  Firmado por: {nombres[nota.createdBy] ?? nota.createdBy}
                  {roles[nota.createdBy] && (
                    <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-bold">
                      {etiquetasRol[roles[nota.createdBy]] ?? roles[nota.createdBy]}
                    </span>
                  )}
                </p>

                {nota.updatedBy && (
                  <p className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-2 py-0.5 inline-flex flex-wrap items-center gap-1">
                    <span>✏️ Editado por:</span>
                    <span>{nombres[nota.updatedBy] ?? nota.updatedBy}</span>
                    {roles[nota.updatedBy] && (
                      <span className="bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded text-[11px] font-bold">
                        {etiquetasRol[roles[nota.updatedBy]] ?? roles[nota.updatedBy]}
                      </span>
                    )}
                    {nota.updatedAtFormatted && (
                      <span className="text-amber-700 font-normal">
                        · {nota.updatedAtFormatted}
                      </span>
                    )}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <p className="text-xs text-slate-500">{nota.createdAtFormatted}</p>
                {nota.puedeEditar && !estaEditando && (
                  <button
                    type="button"
                    onClick={() => setEditandoId(nota.id)}
                    title="Editar nota de evolución (solo disponible para el autor)"
                    className="px-2.5 py-1 rounded-lg border border-blue-200 text-blue-700 bg-blue-50/60 hover:bg-blue-100 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    ✏️ Editar
                  </button>
                )}
              </div>
            </div>

            {estaEditando ? (
              <form
                key={nota.id}
                action={(formData) => handleGuardar(nota.id, formData)}
                className="space-y-3"
              >
                <input type="hidden" name="episodeId" value={episodeId} />
                <input type="hidden" name="noteId" value={nota.id} />

                {esNotaLibre ? (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Editar evolución clínica:
                    </label>
                    <TextareaConDeshacer
                      name="content"
                      rows={5}
                      required
                      defaultValue={nota.content ?? ''}
                      className="w-full px-3 py-2.5 border border-blue-300 rounded-lg text-base md:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        S (Subjetivo) *
                      </label>
                      <textarea
                        name="subjective"
                        rows={3}
                        required
                        defaultValue={nota.subjective ?? ''}
                        className="w-full px-2.5 py-2 border border-blue-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        O (Objetivo) *
                      </label>
                      <textarea
                        name="objective"
                        rows={3}
                        required
                        defaultValue={nota.objective ?? ''}
                        className="w-full px-2.5 py-2 border border-blue-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        A (Evaluación / Diagnóstico) *
                      </label>
                      <textarea
                        name="assessment"
                        rows={3}
                        required
                        defaultValue={nota.assessment ?? ''}
                        className="w-full px-2.5 py-2 border border-blue-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        P (Plan) *
                      </label>
                      <textarea
                        name="plan"
                        rows={3}
                        required
                        defaultValue={nota.plan ?? ''}
                        className="w-full px-2.5 py-2 border border-blue-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <p className="text-[11px] text-slate-500">
                    Al guardar quedará registrado tu usuario y la hora exacta de edición en la nota y en auditoría.
                  </p>
                  <div className="flex items-center gap-2 ml-auto">
                    <button
                      type="button"
                      disabled={estaEnviando}
                      onClick={() => setEditandoId(null)}
                      className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-50 cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={estaEnviando}
                      className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {estaEnviando ? 'Guardando cambios…' : 'Guardar cambios'}
                    </button>
                  </div>
                </div>
              </form>
            ) : nota.content ? (
              <p className="text-sm text-slate-800 whitespace-pre-line leading-relaxed">
                {nota.content}
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-700">
                <div>
                  <span className="font-bold text-slate-900">S:</span> {nota.subjective}
                </div>
                <div>
                  <span className="font-bold text-slate-900">O:</span> {nota.objective}
                </div>
                <div>
                  <span className="font-bold text-slate-900">A:</span> {nota.assessment}
                </div>
                <div>
                  <span className="font-bold text-slate-900">P:</span> {nota.plan}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
