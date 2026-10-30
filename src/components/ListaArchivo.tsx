'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { normalizar } from '@/lib/normalizar'

type EpisodioArchivo = {
  id: string
  firstName: string
  lastName: string
  age: number | null
  expedienteNumber: string
  chiefComplaint: string | null
  attendingDoctor: string | null
  cerradoEl: string
}

export function ListaArchivo({ episodios }: { episodios: EpisodioArchivo[] }) {
  const [busqueda, setBusqueda] = useState('')

  const filtrados = useMemo(() => {
    const terminos = normalizar(busqueda).split(/\s+/).filter(Boolean)
    if (terminos.length === 0) return episodios

    return episodios.filter((e) => {
      const palabras = [
        ...normalizar(e.firstName).split(/\s+/),
        ...normalizar(e.lastName).split(/\s+/),
        normalizar(e.expedienteNumber),
      ]
      return terminos.every((t) => palabras.some((p) => p.startsWith(t)))
    })
  }, [busqueda, episodios])

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Pacientes Inactivos</h2>

        <div className="relative w-full md:w-auto">
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="🔍 Buscar por nombre o expediente..."
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
      </div>

      {busqueda && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
          Mostrando {filtrados.length} de {episodios.length} pacientes
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtrados.map((e) => (
          <div key={e.id} className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  {e.firstName} {e.lastName}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {e.age} años • Exp: {e.expedienteNumber}
                </p>
              </div>
              <div className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-lg text-xs font-bold border border-slate-200 dark:border-slate-600">
                🔒 CERRADO
              </div>
            </div>

            <div className="mb-4 mt-3 text-sm text-slate-600 dark:text-slate-300">
              <p><strong>Motivo:</strong> {e.chiefComplaint}</p>
              <p><strong>Médico:</strong> {e.attendingDoctor}</p>
              <p className="text-xs text-slate-400 mt-2">Cerrado el: {e.cerradoEl}</p>
            </div>

            <div className="text-right mt-2">
              <Link href={`/dashboard/paciente/${e.id}`} className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                Ver Expediente Histórico →
              </Link>
            </div>
          </div>
        ))}

        {filtrados.length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            No se encontraron pacientes en el archivo.
          </div>
        )}
      </div>
    </>
  )
}