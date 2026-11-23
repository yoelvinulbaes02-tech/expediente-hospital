'use client'

import Link from 'next/link'
import { Lock, Printer } from 'lucide-react'

export function PrintButton({ bloqueado = false }: { bloqueado?: boolean }) {
  if (bloqueado) {
    return (
      <Link
        href="/dashboard/suscripcion"
        title="Suscripción vencida: renueva tu plan para habilitar la impresión de reportes"
        className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 border border-red-200 px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors"
      >
        <Lock className="w-3.5 h-3.5" />
        Impresión bloqueada · Renovar
      </Link>
    )
  }

  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-1.5 bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-900 cursor-pointer"
    >
      <Printer className="w-4 h-4" />
      Imprimir Reporte
    </button>
  )
}