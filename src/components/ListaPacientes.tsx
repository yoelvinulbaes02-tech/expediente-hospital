'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { BannerAlergias } from '@/components/BannerAlergias'
import { entregarLote } from '@/app/dashboard/actions-lote'

type Episodio = {
  id: string | number
  serviceType?: string | null
  consultingDepartment?: string | null
  consultingResident?: string | null
  admissionDate: Date | string
  room: string | null
  bed: string | null
  chiefComplaint: string | null
  attendingDoctor: string | null
  admittingDoctor?: string | null
  primaryDiagnosis?: string | null
  secondaryDiagnoses?: string | null
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

function normalizar(texto?: string | null) {
  return (texto ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function compararUbicacion(a: Episodio, b: Episodio): number {
  const roomA = a.room?.trim() || ''
  const roomB = b.room?.trim() || ''
  if (!roomA && roomB) return 1
  if (roomA && !roomB) return -1
  const compRoom = roomA.localeCompare(roomB, undefined, { numeric: true, sensitivity: 'base' })
  if (compRoom !== 0) return compRoom

  const bedA = a.bed?.trim() || ''
  const bedB = b.bed?.trim() || ''
  return bedA.localeCompare(bedB, undefined, { numeric: true, sensitivity: 'base' })
}

const fmtFechaIngreso = (d: Date | string) => {
  const f = new Date(d)
  return f.toLocaleString('es-DO', {
    timeZone: 'America/Santo_Domingo',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
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
  const [areaGuardia, setAreaGuardia] = useState<'propio' | 'interconsulta'>('propio')
  const [busqueda, setBusqueda] = useState('')
  const [seleccionados, setSeleccionados] = useState<string[]>([])
  const [medicoRecibe, setMedicoRecibe] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [mensaje, setMensaje] = useState<Mensaje | null>(null)

  const episodiosDelArea = useMemo(() => {
    return episodes.filter((e) => (e.serviceType ?? 'propio') === areaGuardia)
  }, [episodes, areaGuardia])

  const totalPropios = useMemo(() => episodes.filter((e) => (e.serviceType ?? 'propio') === 'propio').length, [episodes])
  const totalInterconsultas = useMemo(() => episodes.filter((e) => e.serviceType === 'interconsulta').length, [episodes])

  const ordenados = useMemo(() => {
    return [...episodiosDelArea].sort(compararUbicacion)
  }, [episodiosDelArea])

  const filtrados = useMemo(() => {
    const terminos = normalizar(busqueda).split(/\s+/).filter(Boolean)
    if (terminos.length === 0) return ordenados

    return ordenados.filter((e) => {
      const palabras = [
        ...normalizar(e.patient.firstName).split(/\s+/),
        ...normalizar(e.patient.lastName).split(/\s+/),
        normalizar(e.patient.expedienteNumber),
        normalizar(e.room),
        normalizar(e.bed),
        normalizar(e.primaryDiagnosis),
        normalizar(e.consultingDepartment),
        normalizar(e.consultingResident),
      ]
      return terminos.every((t) => palabras.some((p) => p.startsWith(t)))
    })
  }, [busqueda, ordenados])

  const seleccionable = (e: Episodio) => e.responsibleId === userId && e.handoffs.length === 0
  const seleccionables = filtrados.filter(seleccionable)
  const todosMarcados =
    seleccionables.length > 0 && seleccionables.every((e) => seleccionados.includes(String(e.id)))
  const hayEntregables = episodiosDelArea.some(seleccionable)

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
      {/* CAMBIO DE GUARDIA / ÁREAS DIVIDIDAS */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-white dark:bg-slate-800 p-2 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="grid grid-cols-2 gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => {
              setAreaGuardia('propio')
              setSeleccionados([])
            }}
            className={`py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 ${
              areaGuardia === 'propio'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <span>🏥</span> Pacientes Propios (Sala)
            <span className={`px-2 py-0.2 rounded-full text-xs font-bold ${areaGuardia === 'propio' ? 'bg-blue-800 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {totalPropios}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAreaGuardia('interconsulta')
              setSeleccionados([])
            }}
            className={`py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 ${
              areaGuardia === 'interconsulta'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <span>📋</span> Interconsultas
            <span className={`px-2 py-0.2 rounded-full text-xs font-bold ${areaGuardia === 'interconsulta' ? 'bg-purple-800 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {totalInterconsultas}
            </span>
          </button>
        </div>

        <Link
          href="/dashboard/nuevo-paciente"
          className={`w-full sm:w-auto px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-center text-white transition-colors shadow-sm ${
            areaGuardia === 'interconsulta' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          + {areaGuardia === 'interconsulta' ? 'Ingresar Interconsulta' : 'Ingresar Paciente de Sala'}
        </Link>
      </div>

      {/* BÚSQUEDA Y ARCHIVO */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-3">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          {areaGuardia === 'propio' ? '🏥 Sala de Hospitalización' : '📋 Pacientes de Interconsulta'}
        </h2>

        <div className="flex items-center gap-3">
          <div className="relative w-full md:w-72">
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="🔍 Buscar nombre, cama, depto..."
              className="w-full px-3 py-2 pr-10 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
            />
            {busqueda && (
              <button
                type="button"
                onClick={() => setBusqueda('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs px-2"
              >
                ✕
              </button>
            )}
          </div>
          <Link
            href="/dashboard/archivo"
            className="bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-lg font-medium text-xs sm:text-sm whitespace-nowrap"
          >
            📂 Archivo
          </Link>
        </div>
      </div>

      {mensaje && (
        <div className={`mb-4 px-4 py-3 rounded-lg border text-sm ${mensaje.tipo === 'ok' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          <div className="flex justify-between gap-3">
            <p className="font-medium">{mensaje.texto}</p>
            <button type="button" onClick={() => setMensaje(null)} className="text-xs opacity-60 hover:opacity-100">✕</button>
          </div>
        </div>
      )}

      {hayEntregables && (
        <div className="flex items-center gap-3 mb-6 bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <input
            id="seleccionar-todos"
            type="checkbox"
            checked={todosMarcados}
            onChange={toggleTodos}
            className="w-5 h-5 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="seleccionar-todos" className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer flex-1">
            Seleccionar mis pacientes ({seleccionados.length})
          </label>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtrados.map((episode) => {
          const entregable = seleccionable(episode)
          const entregaPendiente = episode.handoffs[0]
          const meLoEntregaron = !!entregaPendiente && entregaPendiente.recibidoPor.toLowerCase() === miEmail.toLowerCase()
          const esInterconsulta = episode.serviceType === 'interconsulta'

          // Cálculo de días de estancia para la tarjeta
          const diffTiempo = new Date().getTime() - new Date(episode.admissionDate).getTime()
          const dias = Math.max(1, Math.floor(diffTiempo / (1000 * 60 * 60 * 24)) + 1)

          return (
            <div
              key={episode.id}
              className={`bg-white dark:bg-slate-800 p-4 md:p-5 rounded-xl shadow-sm border hover:shadow-md transition-all relative ${
                esInterconsulta ? 'border-purple-200 dark:border-purple-800' : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              {entregable && (
                <div className="absolute top-4 left-4">
                  <input
                    type="checkbox"
                    checked={seleccionados.includes(String(episode.id))}
                    onChange={() => toggleSeleccion(String(episode.id))}
                    className="w-5 h-5 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
              )}

              <div className={entregable ? 'pl-8' : ''}>
                <div className="flex justify-between items-start gap-2 mb-2">
                  <div className="min-w-0">
                    <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100">
                      {episode.patient.firstName} {episode.patient.lastName}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                      {episode.patient.age} años • {episode.patient.sex} • Exp: {episode.patient.expedienteNumber}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    {esInterconsulta ? (
                      <span className="bg-purple-100 text-purple-900 border border-purple-200 px-2 py-0.5 rounded-lg text-xs font-bold block mb-1">
                        {episode.consultingDepartment ?? 'Interconsulta'}
                      </span>
                    ) : null}
                    <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md text-xs font-bold border border-blue-100">
                      Hab. {episode.room} - Cama {episode.bed}
                    </span>
                  </div>
                </div>

                {/* FECHA/HORA DE INGRESO Y DÍA DE INTERNAMIENTO EN LA TARJETA */}
                <div className="flex items-center gap-2 text-[11px] text-slate-500 bg-slate-50 dark:bg-slate-700/50 px-2.5 py-1 rounded-md mb-2 border border-slate-100 dark:border-slate-700">
                  <span>📅 Ingreso: <strong>{fmtFechaIngreso(episode.admissionDate)}</strong></span>
                  <span>•</span>
                  <span className="font-bold text-blue-700 dark:text-blue-300">Día {dias}</span>
                </div>

                <div className="mb-4 mt-2 space-y-1 text-xs sm:text-sm">
                  {esInterconsulta ? (
                    <>
                      <p className="font-semibold text-purple-900 dark:text-purple-300">
                        Motivo: <span className="font-normal text-slate-700 dark:text-slate-200">{episode.chiefComplaint}</span>
                      </p>
                      <p className="font-semibold text-slate-600 dark:text-slate-300">
                        Residente a cargo: <span className="font-bold text-slate-800 dark:text-slate-100">{episode.consultingResident ?? 'No especificado'}</span>
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="font-semibold text-slate-600 dark:text-slate-300">
                        Diagnóstico: <span className="font-bold text-blue-700 dark:text-blue-300">{episode.primaryDiagnosis || episode.chiefComplaint}</span>
                      </p>
                      <p className="font-semibold text-slate-600 dark:text-slate-300">
                        A cargo: <span className="font-normal">{episode.responsible?.fullName ?? 'Sin asignar'}</span>
                      </p>
                    </>
                  )}

                  {episode._count.tasks > 0 && (
                    <p className="mt-2 inline-block bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold px-2 py-0.5 rounded">
                      ☑ {episode._count.tasks} pendiente{episode._count.tasks === 1 ? '' : 's'}
                    </p>
                  )}

                  {entregaPendiente && (
                    meLoEntregaron ? (
                      <Link href={`/dashboard/paciente/${episode.id}/turno`} className="mt-2 block bg-indigo-600 text-white text-xs font-bold px-3 py-2 rounded-lg text-center">
                        📥 Te entregaron este paciente · Revisar y aceptar
                      </Link>
                    ) : (
                      <p className="mt-2 text-xs font-semibold text-indigo-700">⏳ Entrega pendiente de aceptación</p>
                    )
                  )}
                </div>

                <BannerAlergias alergias={episode.allergies} />

                <div className="text-right mt-2">
                  <Link
                    href={`/dashboard/paciente/${episode.id}`}
                    className={`inline-block py-1 text-xs sm:text-sm font-bold ${
                      esInterconsulta ? 'text-purple-600 hover:text-purple-800' : 'text-blue-600 hover:text-blue-800'
                    }`}
                  >
                    Ver Expediente {esInterconsulta ? 'de Interconsulta' : ''} →
                  </Link>
                </div>
              </div>
            </div>
          )
        })}

        {filtrados.length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-400 bg-white dark:bg-slate-800 rounded-xl border">
            No hay {areaGuardia === 'interconsulta' ? 'interconsultas registradas' : 'pacientes de sala'} en este momento.
          </div>
        )}
      </div>

      {seleccionados.length > 0 && <div className="h-40 md:h-28" aria-hidden />}

      {seleccionados.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-20 bg-white dark:bg-slate-800 border-t shadow-lg px-4 pt-3 pb-4">
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
                    texto: `${r.entregados} paciente(s) entregado(s).`,
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
            <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 md:mr-auto">
              {seleccionados.length} paciente(s) de guardia seleccionado(s)
            </p>
            <select
              name="recibidoPor"
              value={medicoRecibe}
              onChange={(e) => setMedicoRecibe(e.target.value)}
              required
              className="w-full md:w-64 px-3 py-2 border rounded-lg text-xs bg-white text-slate-900"
            >
              <option value="">Médico que recibe guardia…</option>
              {doctores.map((d) => (
                <option key={d.id} value={d.email}>{d.fullName}</option>
              ))}
            </select>
            <button
              type="submit"
              disabled={enviando}
              className="w-full md:w-auto bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-xs hover:bg-indigo-700 transition-colors"
            >
              {enviando ? 'Entregando…' : `Entregar (${seleccionados.length})`}
            </button>
          </form>
        </div>
      )}
    </>
  )
}