'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'

export function SearchInput({ defaultValue }: { defaultValue: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [texto, setTexto] = useState(defaultValue)

  // Este efecto busca automáticamente 300ms después de que dejas de teclear
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      
      if (texto) {
        params.set('q', texto)
      } else {
        params.delete('q') // Si borras todo, vuelve a la pantalla inicial
      }
      
      router.push(`/dashboard?${params.toString()}`)
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [texto, router, searchParams])

  return (
    <input
      type="text"
      value={texto}
      onChange={(e) => setTexto(e.target.value)}
      placeholder="🔍 Buscar nombre, cama o exp..."
      className="w-full md:w-64 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  )
}