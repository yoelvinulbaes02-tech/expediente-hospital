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
  patient: {
    firstName: string
    lastName: string
    age: number | string | null
    sex: string | null
    expedienteNumber: string
  }
  allergies: React.ComponentProps<typeof BannerAlergias>['alergias']
}

// Quita acentos y pasa a minúsculas: "María" -> "maria"
function normalizar(texto?: string | null) {
  return (texto ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

export function ListaPacientes({ episodes }: { episodes: Episodio[] }) {
  const [busqueda, setBusqueda] = useState('')
  const [seleccionados, setSeleccionados] = useState<string[]>([])
  const [medicoRecibe, setMedicoRecibe] = useState('')

  // Lógica de búsqueda que ya tenías
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

  // Lógica de selección para entrega en lote
  const toggleSeleccion = (id: string) => {
    if (seleccionados.includes(id)) {
      setSeleccionados(seleccionados.filter(item => item !== id))
    } else {
      setSeleccionados([...seleccionados, id])
    }
  }

  const toggleTodos = () => {
    if (seleccionados.length === filtrados.length) {
      setSeleccionados([])
    } else {
      setSeleccionados(filtrados.map(e => String(e.id)))
    }
  }

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Lista de Pacientes</h2>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="🔍 Buscar nombre, cama o exp..."
              autoComplete="off"
              className="w-full md:w-72 px-3 py-2 pr-9 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {busqueda && (
              <button
                type="button"
                onClick={() => setBusqueda('')}
                aria-label="Limpiar búsqueda"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm px-1"
              >
                ✕
              </button>
            )}
          </div>
          <Link href="/dashboard/nuevo-paciente" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors shadow-sm">
            + Ingresar
          </Link>
          <Link href="/dashboard/archivo" className="bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 px-4 py-2 rounded-lg font-medium text-sm hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors shadow-sm">
            📂 Archivo
          </Link>
        </div>
      </div>

      {busqueda && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          Mostrando {filtrados.length} de {episodes.length} pacientes
        </p>
      )}

      {/* BARRA DE ENTREGA EN LOTE */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center gap-2">
          <input 
            type="checkbox" 
            checked={seleccionados.length === filtrados.length && filtrados.length > 0} 
            onChange={toggleTodos}
            className="w-5 h-5 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <label className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer" onClick={toggleTodos}>
            Seleccionar Todos ({seleccionados.length})
          </label>
        </div>

        {seleccionados.length > 0 && (
          <form 
            action={async (formData) => {
              formData.append('episodeIds', JSON.stringify(seleccionados))
              await entregarLote(formData)
              setSeleccionados([])
              setMedicoRecibe('')
            }}
            className="flex items-center gap-2 w-full md:w-auto"
          >
            <input 
              name="recibidoPor" 
              value={medicoRecibe} 
              onChange={(e) => setMedicoRecibe(e.target.value)}
              placeholder="Médico que recibe" 
              required
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-indigo-700 transition-colors shadow-sm whitespace-nowrap">
              Entregar Seleccionados
            </button>
          </form>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtrados.map((episode) => (
          <div key={episode.id} className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all duration-300 relative">
            
            {/* CHECKBOX POR PACIENTE */}
            <div className="absolute top-5 left-5">
              <input 
                type="checkbox" 
                checked={seleccionados.includes(String(episode.id))}
                onChange={() => toggleSeleccion(String(episode.id))}
                className="w-5 h-5 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
            </div>

            <div className="pl-8">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                    {episode.patient.firstName} {episode.patient.lastName}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {episode.patient.age} años • {episode.patient.sex} • Exp: {episode.patient.expedienteNumber}
                  </p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-lg text-sm font-bold border border-blue-100 dark:border-blue-800">
                  Hab. {episode.room} - Cama {episode.bed}
                </div>
              </div>

              <div className="mb-4 mt-3">
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Motivo: <span className="font-normal">{episode.chiefComplaint}</span></p>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Médico: <span className="font-normal">{episode.attendingDoctor}</span></p>
              </div>

              <BannerAlergias alergias={episode.allergies} />

              <div className="text-right mt-2">
                <Link href={`/dashboard/paciente/${episode.id}`} className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                  Ver Expediente →
                </Link>
              </div>
            </div>

          </div>
        ))}

        {filtrados.length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            No se encontraron pacientes con esa búsqueda.
          </div>
        )}
      </div>
    </>
  )
}