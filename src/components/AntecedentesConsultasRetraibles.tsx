'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, CopyPlus, Lock } from 'lucide-react'
import type { BloqueAntecedenteConsulta } from '@/lib/consultas-auth'
import { agregarBloqueAntecedentesConsulta } from '@/app/dashboard/consultas/actions'

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
  registros,
  puedeAgregar,
}: {
  consultationId: string
  registros: BloqueAntecedenteConsulta[]
  puedeAgregar: boolean
}) {
  const router = useRouter()
  const [mostrarNuevo, setMostrarNuevo] = useState(registros.length === 0)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [okMsg, setOkMsg] = useState<string | null>(null)

  const handleGuardarNuevo = async (formData: FormData) => {
    setGuardando(true)
    setError(null)
    setOkMsg(null)
    try {
      const res = await agregarBloqueAntecedentesConsulta(formData)
      if (!res.ok) {
        setError(res.error ?? 'No se pudo agregar el nuevo bloque de antecedentes.')
        return
      }
      setOkMsg('Nuevo bloque de antecedentes guardado sin alterar los anteriores.')
      setMostrarNuevo(false)
      router.refresh()
    } finally {
      setGuardando(false)
    }
  }

  return (
    <details
      open
      className="group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5"
    >
      <summary className="list-none cursor-pointer flex items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-slate-700 [&::-webkit-details-marker]:hidden">
        <div className="flex items-center gap-2 min-w-0">
          <ChevronDown className="w-4 h-4 text-slate-500 transition-transform group-open:rotate-0 -rotate-90 shrink-0" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white truncate">
            Antecedentes Médicos ({registros.length})
          </h2>
        </div>

        {puedeAgregar && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              setMostrarNuevo((v) => !v)
              setError(null)
              setOkMsg(null)
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-900/30 hover:bg-teal-100 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-[11px] font-bold cursor-pointer shrink-0 whitespace-nowrap"
          >
            <CopyPlus className="w-3.5 h-3.5" />
            <span>{mostrarNuevo ? 'Ocultar nuevo' : 'Duplicar / Nuevo'}</span>
          </button>
        )}
      </summary>

      <div className="pt-3 space-y-3">
        {okMsg && (
          <div className="px-3 py-2 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-medium">
            {okMsg}
          </div>
        )}

        {error && (
          <div className="px-3 py-2 rounded-lg border border-red-200 bg-red-50 text-red-800 text-xs font-medium">
            {error}
          </div>
        )}

        {/* REGISTROS ANTERIORES RETRAÍBLES Y SOLO LECTURA */}
        {registros.length > 0 && (
          <div className="space-y-2">
            {registros.map((reg, index) => (
              <details
                key={reg.id}
                open={index === registros.length - 1 && !mostrarNuevo}
                className="group/item rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900/50"
              >
                <summary className="list-none cursor-pointer px-3 py-2 flex items-center justify-between gap-2 text-xs [&::-webkit-details-marker]:hidden">
                  <div className="min-w-0 flex items-center gap-1.5">
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 transition-transform group-open/item:rotate-0 -rotate-90 shrink-0" />
                    <span className="font-bold text-slate-800 dark:text-slate-100 truncate">
                      Registro #{index + 1} · {fmtFechaHora(reg.fechaIso)}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400 shrink-0">
                    <Lock className="w-3 h-3" />
                    <span className="truncate max-w-28">{reg.authorName}</span>
                  </span>
                </summary>

                <div className="px-3 pb-3 pt-1 border-t border-slate-200/80 dark:border-slate-700/80 space-y-2 text-xs text-slate-700 dark:text-slate-200">
                  {reg.pathological && (
                    <div>
                      <span className="block text-[10px] font-bold uppercase text-slate-500">Patológicos</span>
                      <p className="whitespace-pre-wrap">{reg.pathological}</p>
                    </div>
                  )}
                  {reg.surgical && (
                    <div>
                      <span className="block text-[10px] font-bold uppercase text-slate-500">Quirúrgicos</span>
                      <p className="whitespace-pre-wrap">{reg.surgical}</p>
                    </div>
                  )}
                  {reg.medications && (
                    <div>
                      <span className="block text-[10px] font-bold uppercase text-slate-500">Medicación Habitual</span>
                      <p className="whitespace-pre-wrap">{reg.medications}</p>
                    </div>
                  )}
                  {reg.family && (
                    <div>
                      <span className="block text-[10px] font-bold uppercase text-slate-500">Familiares</span>
                      <p className="whitespace-pre-wrap">{reg.family}</p>
                    </div>
                  )}
                  {reg.habits && (
                    <div>
                      <span className="block text-[10px] font-bold uppercase text-slate-500">Hábitos</span>
                      <p className="whitespace-pre-wrap">{reg.habits}</p>
                    </div>
                  )}
                </div>
              </details>
            ))}
          </div>
        )}

        {/* NUEVO BLOQUE EDITABLE (SIN TOCAR LOS ANTERIORES) */}
        {puedeAgregar && mostrarNuevo && (
          <form
            action={handleGuardarNuevo}
            className="space-y-2.5 p-3 rounded-lg border border-teal-200 dark:border-teal-800 bg-teal-50/40 dark:bg-teal-950/20"
          >
            <input type="hidden" name="consultationId" value={consultationId} />
            <p className="text-[11px] font-bold text-teal-800 dark:text-teal-300">
              Nuevo bloque de antecedentes (se agregará debajo de los anteriores)
            </p>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                Patológicos
              </label>
              <textarea
                name="pathological"
                rows={2}
                placeholder="Ej. Nuevo diagnóstico o antecedente patológico..."
                className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                Quirúrgicos
              </label>
              <textarea
                name="surgical"
                rows={2}
                placeholder="Cirugías recientes o previas..."
                className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                Medicación Habitual
              </label>
              <textarea
                name="medications"
                rows={2}
                placeholder="Fármacos que toma actualmente..."
                className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-1">
              {registros.length > 0 && (
                <button
                  type="button"
                  onClick={() => setMostrarNuevo(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                >
                  Cancelar
                </button>
              )}
              <button
                type="submit"
                disabled={guardando}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold disabled:opacity-50 cursor-pointer"
              >
                {guardando ? 'Guardando...' : 'Guardar nuevo bloque'}
              </button>
            </div>
          </form>
        )}
      </div>
    </details>
  )
}
