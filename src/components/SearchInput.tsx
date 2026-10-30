'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

export function SearchInput({ defaultValue, placeholder }: { defaultValue: string, placeholder?: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname() // <-- Detecta en qué página estamos
  const [texto, setTexto] = useState(defaultValue)

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      
      if (texto) {
        params.set('q', texto)
      } else {
        params.delete('q')
      }
      
      // Se mantiene en la misma página (Dashboard o Usuarios)
      router.push(`${pathname}?${params.toString()}`)
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [texto, router, searchParams, pathname])

  return (
    <input
      type="text"
      value={texto}
      onChange={(e) => setTexto(e.target.value)}
      placeholder={placeholder || "🔍 Buscar..."}
      className="w-full md:w-72 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  )
}