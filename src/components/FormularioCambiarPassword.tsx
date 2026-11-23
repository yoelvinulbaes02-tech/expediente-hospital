'use client'

import { useActionState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { cambiarPassword } from '@/app/dashboard/perfil/actions'
import { InputPassword } from '@/components/InputPassword'

type Estado = {
  ok?: boolean
  error?: string
  campo?:
    | 'currentPassword'
    | 'newPassword'
    | 'confirmPassword'
    | 'acceptTerms'
    | 'acceptPrivacy'
}

export function FormularioCambiarPassword({
  requiereAceptacionLegal = false,
}: {
  requiereAceptacionLegal?: boolean
}) {
  const router = useRouter()
  const [state, formAction, pending] = useActionState(cambiarPassword, {} as Estado)

  useEffect(() => {
    if (state.ok) {
      router.refresh()
    }
  }, [state.ok, router])

  const borde = (campo: string) =>
    state.error && state.campo === campo ? 'border-red-500' : ''

  const errorDe = (campo: string) =>
    state.error && state.campo === campo ? (
      <p className="mt-1 text-sm font-medium text-red-600">{state.error}</p>
    ) : null

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
          Contraseña Actual
        </label>
        <InputPassword
          name="currentPassword"
          required
          className={`w-full px-3 py-2 border rounded-lg text-slate-900 ${borde('currentPassword')}`}
        />
        {errorDe('currentPassword')}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
          Nueva Contraseña
        </label>
        <InputPassword
          name="newPassword"
          required
          minLength={8}
          className={`w-full px-3 py-2 border rounded-lg text-slate-900 ${borde('newPassword')}`}
        />
        <p className="mt-1 text-xs text-slate-500">Mínimo 8 caracteres, incluyendo letras y números.</p>
        {errorDe('newPassword')}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
          Confirmar Nueva Contraseña
        </label>
        <InputPassword
          name="confirmPassword"
          required
          minLength={8}
          className={`w-full px-3 py-2 border rounded-lg text-slate-900 ${borde('confirmPassword')}`}
        />
        {errorDe('confirmPassword')}
      </div>

      {requiereAceptacionLegal && (
        <div className="space-y-2.5 pt-1 border-t border-slate-200 dark:border-slate-700">
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 pt-2">
            Confirmación legal de acceso
          </p>

          <div>
            <label className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                name="acceptTerms"
                value="true"
                required
                className="mt-0.5 rounded border-slate-300 dark:border-slate-600"
              />
              <span>
                He leído y acepto los{' '}
                <Link
                  href="/terminos"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                >
                  Términos y Condiciones de Uso
                </Link>{' '}
                y la{' '}
                <Link
                  href="/reembolso"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                >
                  Política de Reembolso
                </Link>
                .
              </span>
            </label>
            {errorDe('acceptTerms')}
          </div>

          <div>
            <label className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                name="acceptPrivacy"
                value="true"
                required
                className="mt-0.5 rounded border-slate-300 dark:border-slate-600"
              />
              <span>
                He leído y acepto la{' '}
                <Link
                  href="/privacidad"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                >
                  Política de Privacidad (Ley 172-13)
                </Link>{' '}
                y el uso de{' '}
                <Link
                  href="/cookies"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                >
                  Cookies técnicas esenciales
                </Link>
                .
              </span>
            </label>
            {errorDe('acceptPrivacy')}
          </div>
        </div>
      )}

      {/* Errores generales (sin campo específico) */}
      {state.error && !state.campo && (
        <p className="rounded-lg border border-red-300 bg-red-50 p-2 text-sm font-medium text-red-700">
          {state.error}
        </p>
      )}

      {state.ok && (
        <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-3.5 space-y-3">
          <div className="flex items-start gap-2 text-emerald-800">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
            <p className="text-sm font-semibold">
              Contraseña actualizada correctamente.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg text-sm font-bold transition-colors shadow-sm"
          >
            <span>Ir a la Página Principal</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-60 cursor-pointer"
      >
        {pending ? 'Guardando...' : 'Guardar Cambios'}
      </button>
    </form>
  )
}