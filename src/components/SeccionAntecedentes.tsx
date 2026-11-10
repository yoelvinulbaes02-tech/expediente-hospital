'use client'

import { useState } from 'react'
import { guardarAntecedentes } from '@/app/dashboard/paciente/[id]/actions-clinicas'

type Antecedentes = {
  pathological: string | null
  surgical: string | null
  family: string | null
  habits: string | null
  medications: string | null
  updatedBy: string | null
  updatedAt: Date | string | null
}

const ETIQUETA_ROL: Record<string, string> = {
  ADMIN: 'Admin',
  DOCTOR: 'Médico',
  RESIDENT: 'Residente',
  NURSE: 'Enf.',
  LAB: 'Laboratorio',
  READONLY: 'Lectura',
}

const fmtFecha = (d: Date | string | null) => {
  if (!d) return ''
  const f = new Date(d)
  return f.toLocaleString('es-DO', {
    timeZone: 'America/Santo_Domingo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function SeccionAntecedentes({
  episodeId,
  antecedentes,
  nombres,
  roles,
  puedeRegistrar,
}: {
  episodeId: string
  antecedentes: Antecedentes | null
  nombres: Record<string, string>
  roles: Record<string, string>
  puedeRegistrar: boolean
}) {
  const [modalAbierto, setModalAbierto] = useState(false)

  const tieneDatos =
    antecedentes &&
    (antecedentes.pathological ||
      antecedentes.medications ||
      antecedentes.surgical ||
      antecedentes.family ||
      antecedentes.habits)

  return (
    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-2 mb-3">
        <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <span>📋</span> Antecedentes del Paciente
        </h2>

        {puedeRegistrar && (
          <button
            type="button"
            onClick={() => setModalAbierto(true)}
            className="text-xs bg-slate-100 dark:bg-slate-700 text-blue-700 dark:text-blue-300 font-bold px-2.5 py-1 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-200 transition-colors print:hidden cursor-pointer"
          >
            {tieneDatos ? '✏️ Actualizar' : '+ Registrar'}
          </button>
        )}
      </div>

      {tieneDatos ? (
        <div className="space-y-2 text-xs">
          {/* 1. PATOLÓGICOS */}
          <div>
            <span className="font-bold text-slate-700 dark:text-slate-300">Patológicos: </span>
            <span className="text-slate-800 dark:text-slate-200">
              {antecedentes?.pathological || 'No referidos'}
            </span>
          </div>

          {/* 2. MEDICAMENTOS (JUSTO DEBAJO DE PATOLÓGICOS) */}
          <div>
            <span className="font-bold text-blue-800 dark:text-blue-300">Medicamentos: </span>
            <span className="text-slate-800 dark:text-slate-200 font-medium">
              {antecedentes?.medications || 'No referidos'}
            </span>
          </div>

          {/* 3. QUIRÚRGICOS */}
          <div>
            <span className="font-bold text-slate-700 dark:text-slate-300">Quirúrgicos: </span>
            <span className="text-slate-800 dark:text-slate-200">
              {antecedentes?.surgical || 'No referidos'}
            </span>
          </div>

          {/* 4. FAMILIARES */}
          <div>
            <span className="font-bold text-slate-700 dark:text-slate-300">Familiares: </span>
            <span className="text-slate-800 dark:text-slate-200">
              {antecedentes?.family || 'No referidos'}
            </span>
          </div>

          {/* 5. HÁBITOS */}
          <div>
            <span className="font-bold text-slate-700 dark:text-slate-300">Hábitos: </span>
            <span className="text-slate-800 dark:text-slate-200">
              {antecedentes?.habits || 'No referidos'}
            </span>
          </div>

          {/* AUDITORÍA */}
          {antecedentes?.updatedBy && (
            <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-700 text-[11px] text-slate-400">
              <span>Actualizado por: </span>
              <strong className="text-slate-600 dark:text-slate-300">
                {nombres[antecedentes.updatedBy] ?? antecedentes.updatedBy}
              </strong>
              {roles[antecedentes.updatedBy] && (
                <span className="ml-1 px-1.5 py-0.2 bg-slate-100 dark:bg-slate-700 rounded text-[10px] font-bold">
                  {ETIQUETA_ROL[roles[antecedentes.updatedBy]] ?? roles[antecedentes.updatedBy]}
                </span>
              )}
              {antecedentes.updatedAt && (
                <span> • {fmtFecha(antecedentes.updatedAt)}</span>
              )}
            </div>
          )}
        </div>
      ) : (
        <p className="text-xs text-slate-400 italic py-1">
          Sin antecedentes registrados en el expediente.
        </p>
      )}

      {/* VENTANA MODAL CENTRADA PARA EDITAR ANTECEDENTES (NO SE CORTA EN NINGÚN DISPOSITIVO) */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 p-5 md:p-6 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-2">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <span>📋</span> Antecedentes Clínicos del Paciente
              </h3>
              <button
                type="button"
                onClick={() => setModalAbierto(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl font-bold leading-none cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form
              action={async (formData) => {
                await guardarAntecedentes(formData)
                setModalAbierto(false)
              }}
              className="space-y-3"
            >
              <input type="hidden" name="episodeId" value={episodeId} />

              {/* 1. PATOLÓGICOS */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Patológicos:
                </label>
                <textarea
                  name="pathological"
                  rows={2}
                  defaultValue={antecedentes?.pathological ?? ''}
                  placeholder="Ej. HTA (10 años), DM2, ERC..."
                  className="w-full px-3 py-2 border rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 2. MEDICAMENTOS (JUSTO DEBAJO DE PATOLÓGICOS) */}
              <div>
                <label className="block text-xs font-bold text-blue-800 dark:text-blue-300 mb-1">
                  Medicamentos habituales:
                </label>
                <textarea
                  name="medications"
                  rows={2}
                  defaultValue={antecedentes?.medications ?? ''}
                  placeholder="Ej. Losartán 50mg VO c/12h, Insulina Glargina 20 UI/noche..."
                  className="w-full px-3 py-2 border rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 3. QUIRÚRGICOS */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Quirúrgicos:
                </label>
                <textarea
                  name="surgical"
                  rows={2}
                  defaultValue={antecedentes?.surgical ?? ''}
                  placeholder="Ej. Apendicectomía en 2015..."
                  className="w-full px-3 py-2 border rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 4. HEREDOFAMILIARES */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Heredofamiliares:
                </label>
                <textarea
                  name="family"
                  rows={2}
                  defaultValue={antecedentes?.family ?? ''}
                  placeholder="Ej. Madre con ERC en hemodiálisis, Padre con HTA..."
                  className="w-full px-3 py-2 border rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* 5. HÁBITOS TÓXICOS */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Hábitos tóxicos:
                </label>
                <textarea
                  name="habits"
                  rows={2}
                  defaultValue={antecedentes?.habits ?? ''}
                  placeholder="Ej. Tabaquismo negado, alcohol ocasional..."
                  className="w-full px-3 py-2 border rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setModalAbierto(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-5 py-2 rounded-lg text-xs font-bold hover:bg-blue-700 shadow-sm"
                >
                  Guardar Antecedentes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}