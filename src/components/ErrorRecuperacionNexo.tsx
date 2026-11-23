'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RefreshCw, LogOut, Home } from 'lucide-react'

const STORAGE_RELOAD_KEY = 'nexo_auto_reload_ts'
const COOLDOWN_MS = 30_000

function esErrorDeDespliegueDesactualizado(error: unknown): boolean {
  const msg =
    error instanceof Error
      ? `${error.name} ${error.message}`
      : typeof error === 'string'
        ? error
        : ''
  const lower = msg.toLowerCase()
  return (
    lower.includes('chunkloaderror') ||
    lower.includes('loading chunk') ||
    lower.includes('failed to fetch dynamically imported module') ||
    lower.includes('failed to find server action') ||
    lower.includes("reading 'call'")
  )
}

export function ErrorRecuperacionNexo({
  error,
  retry,
  reset,
  enDashboard = false,
}: {
  error: unknown
  retry?: () => void
  reset?: () => void
  enDashboard?: boolean
}) {
  useEffect(() => {
    console.error('[NEXO ErrorBoundary]', error)
    if (!esErrorDeDespliegueDesactualizado(error)) return

    try {
      const ultimo = Number(window.sessionStorage.getItem(STORAGE_RELOAD_KEY) ?? '0')
      const ahora = Date.now()
      if (!ultimo || ahora - ultimo > COOLDOWN_MS) {
        window.sessionStorage.setItem(STORAGE_RELOAD_KEY, String(ahora))
        window.location.reload()
      }
    } catch {
      // Ignorar si sessionStorage no está disponible
    }
  }, [error])

  const handleReintentar = () => {
    if (typeof retry === 'function') {
      retry()
      return
    }
    if (typeof reset === 'function') {
      reset()
      return
    }
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl p-6 md:p-8 text-center space-y-5">
        <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Ocurrió un problema al cargar esta vista
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Esto suele ocurrir si tu sesión quedó desactualizada tras un cambio del sistema o una
            interrupción temporal de conexión.
          </p>
        </div>

        <div className="flex flex-col gap-2.5 pt-1">
          <button
            type="button"
            onClick={handleReintentar}
            className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm py-2.5 px-4 rounded-xl transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Reintentar ahora
          </button>

          <form action="/api/auth/limpiar-sesion" method="POST">
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 font-semibold text-sm py-2.5 px-4 rounded-xl transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Reiniciar sesión limpia
            </button>
          </form>

          {enDashboard && (
            <Link
              href="/dashboard"
              className="w-full inline-flex items-center justify-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 py-1.5"
            >
              <Home className="w-3.5 h-3.5" />
              Volver al inicio del Dashboard
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
