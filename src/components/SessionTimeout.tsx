'use client'

import { useEffect, useState, useCallback } from 'react'
import { signOut } from 'next-auth/react'

export function SessionTimeout() {
  const [showWarning, setShowWarning] = useState(false)
  const [countdown, setCountdown] = useState(60) // Aviso 1 minuto antes
  
  const logout = useCallback(() => {
    signOut({ callbackUrl: '/login' })
  }, [])

  // Reinicia el temporizador cuando hay actividad del usuario
  const resetTimer = useCallback(() => {
    setShowWarning(false)
    setCountdown(60)
  }, [])

  useEffect(() => {
    // Tiempo de inactividad: 14 minutos (840,000 ms)
    // A los 14 min, mostramos el aviso. A los 15, cerramos sesión.
    const WARNING_TIME = 14 * 60 * 1000
    let inactivityTimer: NodeJS.Timeout
    let countdownTimer: NodeJS.Timeout

    const startTimer = () => {
      clearTimeout(inactivityTimer)
      inactivityTimer = setTimeout(() => {
        setShowWarning(true)
        
        // Iniciar cuenta regresiva de 1 minuto
        let secondsLeft = 60
        countdownTimer = setInterval(() => {
          secondsLeft -= 1
          setCountdown(secondsLeft)
          if (secondsLeft <= 0) {
            clearInterval(countdownTimer)
            logout()
          }
        }, 1000)
      }, WARNING_TIME)
    }

    // Escuchar eventos para reiniciar el temporizador
    window.addEventListener('mousemove', resetTimer)
    window.addEventListener('keydown', resetTimer)
    window.addEventListener('click', resetTimer)
    window.addEventListener('scroll', resetTimer)

    startTimer()

    return () => {
      clearTimeout(inactivityTimer)
      clearInterval(countdownTimer)
      window.removeEventListener('mousemove', resetTimer)
      window.removeEventListener('keydown', resetTimer)
      window.removeEventListener('click', resetTimer)
      window.removeEventListener('scroll', resetTimer)
    }
  }, [logout, resetTimer])

  if (!showWarning) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-2xl max-w-md w-full text-center border border-red-200">
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Sesión por expirar</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Por seguridad, cerraremos tu sesión automáticamente en <strong className="text-red-600 text-lg">{countdown}</strong> segundos por inactividad.
        </p>
        <div className="flex gap-2 justify-center">
          <button 
            onClick={resetTimer}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Mantener sesión activa
          </button>
          <button 
            onClick={logout}
            className="bg-slate-200 text-slate-700 px-6 py-2 rounded-lg font-medium hover:bg-slate-300 transition-colors"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  )
}