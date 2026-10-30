'use client'

import { useMemo, useState } from 'react'

export type FilaAuditoria = {
  id: string
  fecha: string
  usuario: string
  correo: string
  rol: string
  que: string
  paciente: string
  detalle: string
}

const ROLES: Record<string, string> = {
  ADMIN: 'Administrador',
  DOCTOR: 'Médico',
  RESIDENT: 'Residente',
  NURSE: 'Enfermería',
  LAB: 'Laboratorio',
  READONLY: 'Solo lectura',
}

function normalizar(texto?: string | null) {
  return (texto ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
}

export function TablaAuditoria({ filas }: { filas: FilaAuditoria[] }) {
  const [busqueda, setBusqueda] = useState('')

  const filtradas = useMemo(() => {
    const terminos = normalizar(busqueda).split(/\s+/).filter(Boolean)
    if (terminos.length === 0) return filas
    return filas.filter((f) => {
      const texto = normalizar([f.usuario, f.rol, ROLES[f.rol], f.que, f.paciente, f.detalle, f.fecha].join(' '))
      return terminos.every((t) => texto.includes(t))
    })
  }, [busqueda, filas])

  return (
    <>
      <div className="flex justify-end mb-4">
        <div className="relative w-full md:w-96">
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="🔍 Buscar por doctor, paciente, acción..."
            autoComplete="off"
            className="w-full px-3 py-2 pr-9 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {busqueda && (
            <button
              type="button"
              onClick={() => setBusqueda('')}
              aria-label="Limpiar búsqueda"
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-sm px-1"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
            <tr>
              <th className="px-4 py-3">Fecha / Hora</th>
              <th className="px-4 py-3">Quién</th>
              <th className="px-4 py-3">Qué hizo</th>
              <th className="px-4 py-3">Paciente</th>
              <th className="px-4 py-3">Detalle</th>
            </tr>
          </thead>
          <tbody>
            {filtradas.map((f) => (
              <tr key={f.id} className="border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 align-top">
                <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{f.fecha}</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-800 dark:text-slate-200">{f.usuario}</p>
                  <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-bold">
                    {ROLES[f.rol] ?? f.rol}
                  </span>
                </td>
                <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">{f.que}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{f.paciente}</td>
                <td className="px-4 py-3 text-xs text-slate-500 min-w-[16rem] whitespace-normal break-words">{f.detalle}</td>
              </tr>
            ))}
            {filtradas.length === 0 && (
              <tr><td colSpan={5} className="text-center py-8 text-slate-500">No hay registros que coincidan con la búsqueda.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}