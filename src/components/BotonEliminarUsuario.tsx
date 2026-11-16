'use client'

import { useState, useTransition } from 'react'
import { eliminarUsuario } from '@/app/dashboard/usuarios/actions'

export function BotonEliminarUsuario({
  userId,
  nombre,
  email,
}: {
  userId: string
  nombre: string
  email: string
}) {
  const [abierto, setAbierto] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function confirmarEliminacion() {
    setError(null)
    startTransition(async () => {
      const res = await eliminarUsuario(userId)
      if (res.ok) {
        setAbierto(false)
      } else {
        setError(res.error ?? 'No se pudo eliminar el usuario.')
      }
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError(null)
          setAbierto(true)
        }}
        title="Eliminar usuario"
        className="text-xs font-medium px-2 py-1 rounded border text-red-700 border-red-200 hover:bg-red-50 transition-colors cursor-pointer"
      >
        🗑️ Eliminar
      </button>

      {abierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 text-left">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-slate-800 p-6 shadow-xl border border-slate-200 dark:border-slate-700 space-y-4">
            <h3 className="text-base font-bold text-red-700 dark:text-red-400">
              Eliminar Usuario
            </h3>

            <p className="text-sm text-slate-600 dark:text-slate-300">
              ¿Estás seguro de eliminar a <strong>{nombre}</strong> ({email})? Esta acción no se puede deshacer.
            </p>

            {error && (
              <div className="bg-red-50 text-red-700 border border-red-200 p-3 rounded-lg text-xs">
                ⚠️ {error}
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={confirmarEliminacion}
                disabled={pending}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-60 cursor-pointer"
              >
                {pending ? 'Eliminando…' : 'Sí, eliminar'}
              </button>
              <button
                type="button"
                onClick={() => setAbierto(false)}
                disabled={pending}
                className="flex-1 border border-slate-300 dark:border-slate-600 py-2 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}