'use client'

import { useActionState } from 'react'
import { cambiarPassword } from '@/app/dashboard/perfil/actions'

type Estado = {
  ok?: boolean
  error?: string
  campo?: 'currentPassword' | 'newPassword' | 'confirmPassword'
}

export function FormularioCambiarPassword() {
  const [state, formAction, pending] = useActionState(cambiarPassword, {} as Estado)

  const borde = (campo: string) =>
    state.error && state.campo === campo ? 'border-red-500' : ''

  const errorDe = (campo: string) =>
    state.error && state.campo === campo ? (
      <p className="mt-1 text-sm font-medium text-red-600">{state.error}</p>
    ) : null

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña Actual</label>
        <input
          name="currentPassword"
          type="password"
          required
          className={`w-full px-3 py-2 border rounded-lg text-slate-900 ${borde('currentPassword')}`}
        />
        {errorDe('currentPassword')}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Nueva Contraseña</label>
        <input
          name="newPassword"
          type="password"
          required
          minLength={6}
          className={`w-full px-3 py-2 border rounded-lg text-slate-900 ${borde('newPassword')}`}
        />
        {errorDe('newPassword')}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Confirmar Nueva Contraseña</label>
        <input
          name="confirmPassword"
          type="password"
          required
          minLength={6}
          className={`w-full px-3 py-2 border rounded-lg text-slate-900 ${borde('confirmPassword')}`}
        />
        {errorDe('confirmPassword')}
      </div>

      {/* Errores generales (sin campo específico) */}
      {state.error && !state.campo && (
        <p className="rounded-lg border border-red-300 bg-red-50 p-2 text-sm font-medium text-red-700">
          {state.error}
        </p>
      )}

      {state.ok && (
        <p className="rounded-lg border border-green-300 bg-green-50 p-2 text-sm font-medium text-green-700">
          Contraseña actualizada correctamente.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
      >
        {pending ? 'Guardando...' : 'Guardar Cambios'}
      </button>
    </form>
  )
}