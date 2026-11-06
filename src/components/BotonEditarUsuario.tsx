'use client'

import { useState, useTransition } from 'react'
import { editarUsuario } from '@/app/dashboard/usuarios/actions'

export function BotonEditarUsuario({
  userId,
  nombreActual,
  rolActual,
  email,
}: {
  userId: string
  nombreActual: string
  rolActual: string
  email: string
}) {
  const [abierto, setAbierto] = useState(false)
  const [nombre, setNombre] = useState(nombreActual)
  const [rol, setRol] = useState(rolActual)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function guardar(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const res = await editarUsuario(userId, nombre, rol)
      if (res.ok) {
        setAbierto(false)
      } else {
        setError(res.error ?? 'Error al actualizar el usuario')
      }
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setNombre(nombreActual)
          setRol(rolActual)
          setError(null)
          setAbierto(true)
        }}
        className="text-xs font-medium px-2 py-1 rounded border text-blue-600 border-blue-200 hover:bg-blue-50 transition-colors"
      >
        ✏️ Editar
      </button>

      {abierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 text-left animate-fadeIn">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-slate-800 p-6 shadow-xl border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                Editar Datos de Usuario
              </h3>
              <button
                type="button"
                onClick={() => setAbierto(false)}
                className="text-slate-400 hover:text-slate-600 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={guardar} className="space-y-4">
              <div>
                <span className="block text-xs font-semibold text-slate-500 mb-1">Correo Electrónico (No editable):</span>
                <p className="text-xs font-mono bg-slate-100 dark:bg-slate-700 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300">
                  {email}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                  Nombre Completo / Título Profesional *
                </label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Dra. Kairelys Pozo, Dr. Pedro López"
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Este es el nombre con el que firmará todas las notas, evoluciones y signos en el hospital.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
                  Rol del Usuario *
                </label>
                <select
                  value={rol}
                  onChange={(e) => setRol(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="DOCTOR">Médico (DOCTOR)</option>
                  <option value="RESIDENT">Residente (RESIDENT)</option>
                  <option value="NURSE">Enfermería (NURSE)</option>
                  <option value="LAB">Laboratorio (LAB)</option>
                  <option value="ADMIN">Administrador (ADMIN)</option>
                  <option value="READONLY">Solo Lectura (READONLY)</option>
                </select>
              </div>

              {error && (
                <div className="bg-red-50 text-red-700 border border-red-200 p-2.5 rounded-lg text-xs">
                  ⚠️ {error}
                </div>
              )}

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  disabled={pending}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60"
                >
                  {pending ? 'Guardando…' : 'Guardar Cambios'}
                </button>
                <button
                  type="button"
                  onClick={() => setAbierto(false)}
                  disabled={pending}
                  className="flex-1 border border-slate-300 dark:border-slate-600 py-2 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}