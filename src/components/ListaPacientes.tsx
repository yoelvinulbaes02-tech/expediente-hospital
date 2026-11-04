'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { BannerAlergias } from '@/components/BannerAlergias'
import { entregarLote } from '@/app/dashboard/actions-lote'

type Episodio = {
  id: string | number
  room: string | null
  bed: string | null
  chiefComplaint: string | null
  attendingDoctor: string | null
  responsibleId: string | null
  responsible: { fullName: string } | null
  _count: { tasks: number }
  handoffs: { recibidoPor: string }[]
  patient: {
    firstName: string
    lastName: string
    age: number | string | null
    sex: string | null
    expedienteNumber: string
  }
  allergies: React.ComponentProps<typeof BannerAlergias>['alergias']
}

type Doctor = { id: string; fullName: string; email: string }
type Mensaje = { tipo: 'ok' | 'error'; texto: string; detalles: string[] }

// Quita acentos y pasa a minúsculas: "María" -> "maria"
function normalizar(texto?: string | null) {
  return (texto ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

export function ListaPacientes({
  episodes,
  userId,
  miEmail,
  doctores,
}: {
  episodes: Episodio[]
  userId: string
  miEmail: string
  doctores: Doctor[]
}) {
  const [busqueda, setBusqueda] = useState('')
  const [seleccionados, setSeleccionados] = useState<string[]>([])
  const [medicoRecibe, setMedicoRecibe] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [mensaje, setMensaje] = useState<Mensaje | null>(null)

  const filtrados = useMemo(() => {
    const terminos = normalizar(busqueda).split(/\s+/).filter(Boolean)
    if (terminos.length === 0) return episodes

    return episodes.filter((e) => {
      const palabras = [
        ...normalizar(e.patient.firstName).split(/\s+/),
        ...normalizar(e.patient.lastName).split(/\s+/),
        normalizar(e.patient.expedienteNumber),
        normalizar(e.room),
        normalizar(e.bed),
      ]
      return terminos.every((t) => palabras.some((p) => p.startsWith(t)))
    })
  }, [busqueda, episodes])

  // Solo se pueden entregar pacientes que tengo a cargo y sin entrega pendiente
  const seleccionable = (e: Episodio) => e.responsibleId === userId && e.handoffs.length === 0
  const seleccionables = filtrados.filter(seleccionable)
  const todosMarcados =
    seleccionables.length > 0 && seleccionables.every((e) => seleccionados.includes(String(e.id)))
  const hayEntregables = episodes.some(seleccionable)

  const toggleSeleccion = (id: string) => {
    setSeleccionados((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const toggleTodos = () => {
    const ids = seleccionables.map((e) => String(e.id))
    setSeleccionados((prev) =>
      todosMarcados ? prev.filter((x) => !ids.includes(x)) : Array.from(new Set([...prev, ...ids]))
    )
  }

  return (
    <>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 md:mb-6 gap-3 md:gap-4">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Lista de Pacientes</h2>

        <div className="flex flex-col md:flex-row md:items-center gap-3 w-full md:w-auto">
          {/* Buscador: a todo el ancho en el teléfono */}
          <div className="relative w-full md:w-72">
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="🔍 Buscar nombre, cama o exp..."
              autoComplete="off"
              className="w-full px-3 py-3 md:py-2 pr-10 border border-slate-300 dark:border-slate-600 rounded-lg text-base md:text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {busqueda && (
              <button
                type="button"
                onClick={() => setBusqueda('')}
                aria-label="Limpiar búsqueda"
                className="absolute right-1 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm px-3 py-2"
              >
                ✕
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 md:flex md:gap-3">
            <Link
              href="/dashboard/nuevo-paciente"
              className="bg-blue-600 text-white px-4 py-3 md:py-2 rounded-lg font-medium text-sm text-center hover:bg-blue-700 transition-colors shadow-sm"
            >
              + Ingresar
            </Link>
            <Link
              href="/dashboard/archivo"
              className="bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 px-4 py-3 md:py-2 rounded-lg font-medium text-sm text-center hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors shadow-sm"
            >
              📂 Archivo
            </Link>
          </div>
        </div>
      </div>

      {busqueda && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          Mostrando {filtrados.length} de {episodes.length} pacientes
        </p>
      )}

      {/* Resultado de la última entrega en lote */}
      {mensaje && (
        <div
          className={`mb-4 px-4 py-3 rounded-lg border text-sm ${
            mensaje.tipo === 'ok'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex justify-between gap-3">
            <p className="font-medium">{mensaje.texto}</p>
            <button type="button" onClick={() => setMensaje(null)} aria-label="Cerrar" className="text-xs opacity-60 hover:opacity-100 px-2">✕</button>
          </div>
          {mensaje.detalles.length > 0 && (
            <ul className="mt-1 list-disc pl-5 text-xs space-y-0.5">
              {mensaje.detalles.map((d, i) => <li key={i}>{d}</li>)}
            </ul>
          )}
        </div>
      )}

      {/* Seleccionar todos (solo si tengo pacientes a cargo) */}
      {hayEntregables && (
        <div className="flex items-center gap-3 mb-6 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <input
            id="seleccionar-todos"
            type="checkbox"
            checked={todosMarcados}
            onChange={toggleTodos}
            className="w-6 h-6 md:w-5 md:h-5 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="seleccionar-todos" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer py-1 flex-1">
            Seleccionar mis pacientes ({seleccionados.length})
          </label>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtrados.map((episode) => {
          const entregable = seleccionable(episode)
          const entregaPendiente = episode.handoffs[0]
          const meLoEntregaron = !!entregaPendiente && entregaPendiente.recibidoPor.toLowerCase() === miEmail.toLowerCase()

          return (
            <div key={episode.id} className="bg-white dark:bg-slate-800 p-4 md:p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all duration-300 relative">
              {entregable && (
                <div className="absolute top-4 left-4 md:top-5 md:left-5">
                  <input
                    type="checkbox"
                    aria-label="Seleccionar paciente"
                    checked={seleccionados.includes(String(episode.id))}
                    onChange={() => toggleSeleccion(String(episode.id))}
                    className="w-6 h-6 md:w-5 md:h-5 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
              )}

              <div className={entregable ? 'pl-9 md:pl-8' : ''}>
                <div className="flex justify-between items-start gap-2 mb-2">
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                      {episode.patient.firstName} {episode.patient.lastName}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {episode.patient.age} años • {episode.patient.sex} • Exp: {episode.patient.expedienteNumber}
                    </p>
                  </div>
                  <div className="shrink-0 whitespace-nowrap bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 md:px-3 py-1 rounded-lg text-xs md:text-sm font-bold border border-blue-100 dark:border-blue-800">
                    Hab. {episode.room} - Cama {episode.bed}
                  </div>
                </div>

                <div className="mb-4 mt-3">
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Motivo: <span className="font-normal">{episode.chiefComplaint}</span></p>
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Médico: <span className="font-normal">{episode.attendingDoctor}</span></p>
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">A cargo: <span className="font-normal">{episode.responsible?.fullName ?? 'Sin asignar'}</span></p>

                  {episode._count.tasks > 0 && (
                    <p className="mt-2 inline-block bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-xs font-bold px-2 py-0.5 rounded">
                      ☑ {episode._count.tasks} pendiente{episode._count.tasks === 1 ? '' : 's'}
                    </p>
                  )}

                  {entregaPendiente &&
                    (meLoEntregaron ? (
                      <Link
                        href={`/dashboard/paciente/${episode.id}/turno`}
                        className="mt-2 block bg-indigo-600 text-white text-sm font-semibold px-3 py-3 md:py-2 rounded-lg hover:bg-indigo-700"
                      >
                        📥 Te entregaron este paciente · Revisar y aceptar
                      </Link>
                    ) : (
                      <p className="mt-2 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                        ⏳ Entrega pendiente de aceptación
                      </p>
                    ))}
                </div>

                <BannerAlergias alergias={episode.allergies} />

                <div className="text-right mt-2">
                  <Link href={`/dashboard/paciente/${episode.id}`} className="inline-block py-2 text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                    Ver Expediente →
                  </Link>
                </div>
              </div>
            </div>
          )
        })}

        {filtrados.length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            No se encontraron pacientes con esa búsqueda.
          </div>
        )}
      </div>

      {/* Espacio para que la barra fija no tape el último paciente */}
      {seleccionados.length > 0 && <div className="h-40 md:h-28" aria-hidden />}

      {/* BARRA FIJA DE ENTREGA EN LOTE: aparece al marcar pacientes */}
      {seleccionados.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-20 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 shadow-[0_-4px_12px_rgba(0,0,0,0.12)] px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <form
            action={async (formData) => {
              formData.set('episodeIds', JSON.stringify(seleccionados))
              setEnviando(true)
              try {
                const r = await entregarLote(formData)
                if (r.error) {
                  setMensaje({ tipo: 'error', texto: r.error, detalles: [] })
                } else {
                  setMensaje({
                    tipo: r.entregados > 0 ? 'ok' : 'error',
                    texto:
                      r.entregados > 0
                        ? `${r.entregados} paciente(s) entregado(s). Siguen a tu cargo hasta que el médico que recibe acepte.`
                        : 'No se entregó ningún paciente.',
                    detalles: r.omitidos,
                  })
                  setSeleccionados([])
                  setMedicoRecibe('')
                }
              } finally {
                setEnviando(false)
              }
            }}
            className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center gap-2 md:gap-3"
          >
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 md:mr-auto">
              {seleccionados.length} paciente{seleccionados.length === 1 ? '' : 's'} seleccionado{seleccionados.length === 1 ? '' : 's'}
            </p>
            <select
              name="recibidoPor"
              value={medicoRecibe}
              onChange={(e) => setMedicoRecibe(e.target.value)}
              required
              className="w-full md:w-64 px-3 py-3 md:py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-base md:text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Médico que recibe…</option>
              {doctores.map((d) => (
                <option key={d.id} value={d.email}>{d.fullName}</option>
              ))}
            </select>
            <button
              type="submit"
              disabled={enviando}
              className="w-full md:w-auto bg-indigo-600 text-white px-4 py-3 md:py-2 rounded-lg font-medium text-sm hover:bg-indigo-700 transition-colors shadow-sm whitespace-nowrap disabled:opacity-60"
            >
              {enviando ? 'Entregando…' : `Entregar seleccionados (${seleccionados.length})`}
            </button>
          </form>
        </div>
      )}
    </>
  )
}