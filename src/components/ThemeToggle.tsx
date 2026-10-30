'use client'

import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)

  // Al cargar, revisamos si el HTML ya tiene la clase 'dark'
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsDark(document.documentElement.classList.contains('dark'))
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark')
      setIsDark(false)
    } else {
      document.documentElement.classList.add('dark')
      setIsDark(true)
    }
  }

  return (
    <button
      onClick={toggleTheme}
      className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 transition-colors"
      title="Cambiar tema"
    >
      {isDark ? <span className="text-xl">☀️</span> : <span className="text-xl">🌙</span>}
    </button>
  )
}