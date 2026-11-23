'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Users, Sparkles, Pencil, Check, X } from 'lucide-react'
import { guardarTeamServicio } from '@/app/dashboard/actions-servicio'
import type { TeamServicioData } from '@/lib/cirugia-constants'

const ROLES_TEAM = [
  { key: 'ma', field: 'teamMa', label: 'MA', titulo: 'Médico Adjunto' },
  { key: 'r4', field: 'teamR4', label: 'R4', titulo: 'Residente 4' },
  { key: 'r3', field: 'teamR3', label: 'R3', titulo: 'Residente 3' },
  { key: 'r2', field: 'teamR2', label: 'R2', titulo: 'Residente 2' },
  { key: 'r1', field: 'teamR1', label: 'R1', titulo: 'Residente 1' },
] as const

export function TeamServicioCard({
  team,
  sugerenciaAuto,
  puedeEditar,
  servicioLabel,
}: {
  team: TeamServicioData
  sugerenciaAuto: { ma: string; r4: string; r3: string; r2: string; r1: string }
  puedeEditar: boolean
  servicioLabel?: string
}) {
  const router = useRouter()
  const [editando, setEditando] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [valores, setValores] = useState({
    ma: team.ma,
    r4: team.r4,
    r3: team.r3,
    r2: team.r2,
    r1: team.r1,
  })

  const activarAutomatico = () => {
    setErrorMsg(null)
    startTransition(async () => {
      const fd = new FormData()
      fd.set('modo', 'auto')
      const res = await guardarTeamServicio(fd)
      if (!res.ok) {
        setErrorMsg(res.error ?? 'No se pudo actualizar el team en automático.')
        return
      }
      if (res.data) {
        setValores({
          ma: res.data.ma,
          r4: res.data.r4,
          r3: res.data.r3,
          r2: res.data.r2,
          r1: res.data.r1,
        })
      }
      setEditando(false)
      router.refresh()
    })
  }

  const guardarManual = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMsg(null)
    const fd = new FormData()
    fd.set('modo', 'manual')
    fd.set('teamMa', valores.ma)
    fd.set('teamR4', valores.r4)
    fd.set('teamR3', valores.r3)
    fd.set('teamR2', valores.r2)
    fd.set('teamR1', valores.r1)

    startTransition(async () => {
      const res = await guardarTeamServicio(fd)
      if (!res.ok) {
        setErrorMsg(res.error ?? 'No se pudo guardar el team.')
        return
      }
      setEditando(false)
      router.refresh()
    })
  }

  const rellenarConSugerencia = () => {
    setValores({
      ma: sugerenciaAuto.ma || valores.ma,
      r4: sugerenciaAuto.r4 || valores.r4,
      r3: sugerenciaAuto.r3 || valores.r3,
      r2: sugerenciaAuto.r2 || valores.r2,
      r1: sugerenciaAuto.r1 || valores.r1,
    })
  }

  const mostrados = team.autoMode ? sugerenciaAuto : valores

  return (
    <section className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 sm:p-5 mb-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 pb-3 mb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              {servicioLabel ? `Team de Servicio · ${servicioLabel}` : 'Team de Servicio (Guardia)'}
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              · {team.autoMode ? 'Modo Automático (equipo activo)' : 'Modo Manual'}
            </span>
          </div>
          {team.updatedBy && team.updatedAt && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Última actualización: {team.updatedBy} ·{' '}
              {new Date(team.updatedAt).toLocaleString('es-DO', {
                timeZone: 'America/Santo_Domingo',
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          )}
        </div>

        {puedeEditar && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={isPending}
              onClick={activarAutomatico}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer whitespace-nowrap ${
                team.autoMode
                  ? 'bg-teal-600 text-white border-teal-700'
                  : 'bg-teal-50 dark:bg-teal-950/30 text-teal-800 dark:text-teal-200 border-teal-300 dark:border-teal-700 hover:bg-teal-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{team.autoMode ? 'Automático Activo' : 'Poner en Automático'}</span>
            </button>

            <button
              type="button"
              disabled={isPending}
              onClick={() => {
                if (!editando && team.autoMode) {
                  setValores({ ...sugerenciaAuto })
                }
                setEditando((v) => !v)
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>{editando ? 'Cerrar edición' : 'Editar Nombres'}</span>
            </button>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="mb-3 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
          {errorMsg}
        </div>
      )}

      {!editando ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {ROLES_TEAM.map((item) => {
            const nombre = mostrados[item.key]?.trim()
            return (
              <div
                key={item.key}
                className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2.5"
              >
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-black text-blue-700 dark:text-blue-400">
                    {item.label}
                  </span>
                  <span className="text-[11px] text-slate-400">{item.titulo}</span>
                </div>
                <p
                  className={`text-sm font-semibold mt-1 truncate ${
                    nombre ? 'text-slate-900 dark:text-white' : 'text-slate-400 italic font-normal'
                  }`}
                  title={nombre || 'Sin asignar'}
                >
                  {nombre || 'Sin asignar'}
                </p>
              </div>
            )
          })}
        </div>
      ) : (
        <form onSubmit={guardarManual} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {ROLES_TEAM.map((item) => (
              <div key={item.key}>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  {item.label}{' '}
                  <span className="font-normal text-slate-500">({item.titulo})</span>
                </label>
                <input
                  name={item.field}
                  value={valores[item.key]}
                  onChange={(e) =>
                    setValores((prev) => ({ ...prev, [item.key]: e.target.value }))
                  }
                  placeholder={`Nombre ${item.label}...`}
                  className="w-full px-2.5 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <button
              type="button"
              onClick={rellenarConSugerencia}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-teal-300 text-teal-800 dark:text-teal-300 bg-teal-50/70 dark:bg-teal-950/30 text-xs font-semibold hover:bg-teal-100 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Llenar sugerencia automática para editar</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setEditando(false)}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancelar</span>
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="inline-flex items-center gap-1 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{isPending ? 'Guardando...' : 'Guardar Manual'}</span>
              </button>
            </div>
          </div>
        </form>
      )}
    </section>
  )
}
