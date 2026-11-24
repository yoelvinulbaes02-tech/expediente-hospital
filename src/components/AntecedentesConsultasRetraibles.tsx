'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, ChevronDown, Pencil } from 'lucide-react'
import {
  type AntecedentesConsultaState,
  etiquetaRolClinico,
} from '@/lib/consultas-auth'
import { guardarAntecedentesConsulta } from '@/app/dashboard/consultas/actions'

function fmtFechaHora(iso: string) {
  return new Date(iso).toLocaleString('es-DO', {
    timeZone: 'America/Santo_Domingo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function AntecedentesConsultasRetraibles({
  consultationId,
  inicial,
  puedeEditar,
}: {
  consultationId: string
  inicial: AntecedentesConsultaState
  puedeEditar: boolean
}) {
  const router = useRouter()
  const [datos, setDatos] = useState(inicial)
  const [editando, setEditando] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [estadoMsg, setEstadoMsg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const dirtyRef = useRef(false)
  const datosRef = useRef(datos)

  const tieneDatos = Boolean(
    datos.pathological.trim() ||
      datos.medications.trim() ||
      datos.surgical.trim() ||
      datos.family.trim() ||
      datos.habits.trim()
  )

  const guardarAhora = async (cerrarLuego = false) => {
    if (!puedeEditar) return
    if (!dirtyRef.current) {
      if (cerrarLuego) setEditando(false)
      return
    }
    const actual = datosRef.current
    const fd = new FormData()
    fd.set('consultationId', consultationId)
    fd.set('pathological', actual.pathological)
    fd.set('medications', actual.medications)
    fd.set('surgical', actual.surgical)
    fd.set('family', actual.family)
    fd.set('habits', actual.habits)

    setGuardando(true)
    setError(null)
    try {
      const res = await guardarAntecedentesConsulta(fd)
      if (!res.ok) {
        setError(res.error ?? 'No se pudieron guardar los antecedentes.')
        return
      }
      dirtyRef.current = false
      setDatos((prev) => {
        const next = {
          ...prev,
          authorName: res.authorName ?? prev.authorName,
          authorRole: res.authorRole ?? prev.authorRole,
          updatedAtIso: res.updatedAtIso ?? new Date().toISOString(),
        }
        datosRef.current = next
        return next
      })
      setEstadoMsg('Guardado automático')
      if (cerrarLuego) setEditando(false)
      router.refresh()
    } finally {
      setGuardando(false)
    }
  }

  const actualizarCampo = (
    campo: 'pathological' | 'medications' | 'surgical' | 'family' | 'habits',
    valor: string
  ) => {
    dirtyRef.current = true
    setEstadoMsg(null)
    setDatos((prev) => {
      const next = { ...prev, [campo]: valor }
      datosRef.current = next
      return next
    })
  }

  return (
    <details
      open
      className="group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5"
    >
      <summary className="list-none cursor-pointer flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-700 [&::-webkit-details-marker]:hidden">
        <div className="flex items-center gap-2 min-w-0">
          <ChevronDown className="w-4 h-4 text-slate-500 transition-transform group-open:rotate-0 -rotate-90 shrink-0" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white truncate">
            Antecedentes Médicos
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {datos.authorName && (
            <span className="inline-flex flex-wrap items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400">
              <span>✍️</span>
              <strong className="text-slate-700 dark:text-slate-200">{datos.authorName}</strong>
              {datos.authorRole && (
                <span className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-1.5 py-0.5 rounded font-bold">
                  {etiquetaRolClinico(datos.authorRole)}
                </span>
              )}
              {datos.updatedAtIso && (
                <span className="tabular-nums">· {fmtFechaHora(datos.updatedAtIso)}</span>
              )}
            </span>
          )}

          {puedeEditar && (
            <button
              type="button"
              onClick={async (e) => {
                e.preventDefault()
                if (editando) {
                  await guardarAhora(true)
                } else {
                  setEditando(true)
                }
              }}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer shrink-0 ${
                editando
                  ? 'bg-teal-600 hover:bg-teal-700 text-white border-teal-600'
                  : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-blue-700 dark:text-blue-300 border-slate-300 dark:border-slate-600'
              }`}
            >
              {editando ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{guardando ? 'Guardando...' : 'Listo'}</span>
                </>
              ) : (
                <>
                  <Pencil className="w-3 h-3" />
                  <span>{tieneDatos ? 'Editar' : 'Registrar'}</span>
                </>
              )}
            </button>
          )}
        </div>
      </summary>

      <div className="pt-3 space-y-2.5">
        {error && (
          <div className="px-3 py-2 rounded-lg border border-red-200 bg-red-50 text-red-800 text-xs font-medium">
            {error}
          </div>
        )}

        {estadoMsg && !editando && (
          <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold">
            ✓ {estadoMsg}
          </p>
        )}

        {editando ? (
          <div className="space-y-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-0.5">
                Patológicos
              </label>
              <textarea
                rows={2}
                value={datos.pathological}
                onChange={(e) => actualizarCampo('pathological', e.target.value)}
                onBlur={() => void guardarAhora(false)}
                placeholder="Ej. HTA, DM2, asma..."
                className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-blue-800 dark:text-blue-300 mb-0.5">
                Medicación Habitual
              </label>
              <textarea
                rows={2}
                value={datos.medications}
                onChange={(e) => actualizarCampo('medications', e.target.value)}
                onBlur={() => void guardarAhora(false)}
                placeholder="Fármacos que toma actualmente..."
                className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-0.5">
                Quirúrgicos
              </label>
              <textarea
                rows={2}
                value={datos.surgical}
                onChange={(e) => actualizarCampo('surgical', e.target.value)}
                onBlur={() => void guardarAhora(false)}
                placeholder="Cirugías previas..."
                className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-0.5">
                Heredofamiliares
              </label>
              <textarea
                rows={2}
                value={datos.family}
                onChange={(e) => actualizarCampo('family', e.target.value)}
                onBlur={() => void guardarAhora(false)}
                placeholder="Antecedentes familiares..."
                className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-0.5">
                Hábitos Tóxicos
              </label>
              <textarea
                rows={2}
                value={datos.habits}
                onChange={(e) => actualizarCampo('habits', e.target.value)}
                onBlur={() => void guardarAhora(false)}
                placeholder="Tabaquismo, alcohol..."
                className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
          </div>
        ) : tieneDatos ? (
          <div className="space-y-2 text-xs text-slate-700 dark:text-slate-200">
            <div>
              <span className="font-bold text-slate-700 dark:text-slate-300">Patológicos: </span>
              <span className="whitespace-pre-wrap">{datos.pathological || 'No referidos'}</span>
            </div>
            <div>
              <span className="font-bold text-blue-800 dark:text-blue-300">Medicamentos: </span>
              <span className="whitespace-pre-wrap font-medium">{datos.medications || 'No referidos'}</span>
            </div>
            <div>
              <span className="font-bold text-slate-700 dark:text-slate-300">Quirúrgicos: </span>
              <span className="whitespace-pre-wrap">{datos.surgical || 'No referidos'}</span>
            </div>
            <div>
              <span className="font-bold text-slate-700 dark:text-slate-300">Familiares: </span>
              <span className="whitespace-pre-wrap">{datos.family || 'No referidos'}</span>
            </div>
            <div>
              <span className="font-bold text-slate-700 dark:text-slate-300">Hábitos: </span>
              <span className="whitespace-pre-wrap">{datos.habits || 'No referidos'}</span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic py-1">
            Sin antecedentes registrados en el expediente.
          </p>
        )}
      </div>
    </details>
  )
}
