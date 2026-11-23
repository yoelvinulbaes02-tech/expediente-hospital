'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { signOut } from 'next-auth/react'

const WARNING_TIME_MS = 14 * 60 * 1000 // 14 minutos de inactividad
const COUNTDOWN_SECONDS = 60 // 1 minuto de aviso antes de cerrar (15 min total)

function limpiarBorradoresClinicos() {
  if (typeof window === 'undefined') return
  try {
    for (const store of [window.sessionStorage, window.localStorage]) {
      const keysToRemove: string[] = []
      for (let i = 0; i < store.length; i++) {
        const k = store.key(i)
        if (k && k.startsWith('draft_')) {
          keysToRemove.push(k)
        }
      }
      for (const k of keysToRemove) {
        store.removeItem(k)
      }
    }
  } catch {
    // Ignorar restricciones de almacenamiento
  }
}

export function SessionTimeout() {
  const [showWarning, setShowWarning] = useState(false)
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS)

  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const warningVisibleRef = useRef(false)
  const lastActivityRef = useRef(0)

  const clearAllTimers = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current)
      inactivityTimerRef.current = null
    }
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current)
      countdownTimerRef.current = null
    }
  }, [])

  const logout = useCallback(async () => {
    clearAllTimers()
    limpiarBorradoresClinicos()
    try {
      await signOut({ redirect: false })
    } catch {
      // Continuar con limpieza directa de cookies en el servidor
    }
    if (typeof window !== 'undefined') {
      window.location.href = `${window.location.origin}/api/auth/limpiar-sesion`
    }
  }, [clearAllTimers])

  const startInactivityTimer = useCallback(() => {
    clearAllTimers()
    inactivityTimerRef.current = setTimeout(() => {
      warningVisibleRef.current = true
      setShowWarning(true)
      setCountdown(COUNTDOWN_SECONDS)

      let secondsLeft = COUNTDOWN_SECONDS
      countdownTimerRef.current = setInterval(() => {
        secondsLeft -= 1
        setCountdown(secondsLeft)
        if (secondsLeft <= 0) {
          logout()
        }
      }, 1000)
    }, WARNING_TIME_MS)
  }, [clearAllTimers, logout])

  const handleStayActive = useCallback(() => {
    warningVisibleRef.current = false
    setShowWarning(false)
    setCountdown(COUNTDOWN_SECONDS)
    lastActivityRef.current = Date.now()
    startInactivityTimer()
  }, [startInactivityTimer])

  useEffect(() => {
    const onUserActivity = () => {
      // Si el aviso ya está visible, exige confirmación explícita en el modal
      if (warningVisibleRef.current) return
      const now = Date.now()
      if (now - lastActivityRef.current < 1000) return
      lastActivityRef.current = now
      startInactivityTimer()
    }

    const events: Array<keyof WindowEventMap> = [
      'mousemove',
      'keydown',
      'click',
      'scroll',
      'touchstart',
    ]
    for (const ev of events) {
      window.addEventListener(ev, onUserActivity, { passive: true })
    }

    startInactivityTimer()

    return () => {
      clearAllTimers()
      for (const ev of events) {
        window.removeEventListener(ev, onUserActivity)
      }
    }
  }, [startInactivityTimer, clearAllTimers])

  if (!showWarning) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-2xl max-w-md w-full text-center border border-red-200 dark:border-red-800">
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
          Sesión por expirar
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Por seguridad hospitalaria, cerraremos tu sesión automáticamente en{' '}
          <strong className="text-red-600 text-lg tabular-nums">{countdown}</strong> segundos por
          inactividad.
        </p>
        <div className="flex gap-2 justify-center">
          <button
            type="button"
            onClick={handleStayActive}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors cursor-pointer"
          >
            Mantener sesión activa
          </button>
          <button
            type="button"
            onClick={logout}
            className="bg-slate-200 text-slate-700 px-6 py-2 rounded-lg font-medium hover:bg-slate-300 transition-colors cursor-pointer"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  )
}