'use client'

import Link from 'next/link'
import { Lock, Printer } from 'lucide-react'

export function BotonImprimirSignos({ bloqueado = false }: { bloqueado?: boolean }) {
  if (bloqueado) {
    return (
      <Link
        href="/dashboard/suscripcion"
        title="Suscripción vencida: renueva tu plan para habilitar la impresión de signos vitales"
        className="text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-1.5 print:hidden"
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
      title="Imprimir hoja clínica de signos vitales"
      className="text-xs font-bold text-slate-700 bg-white border border-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs flex items-center gap-1.5 print:hidden cursor-pointer"
    >
      <Printer className="w-3.5 h-3.5" />
      Imprimir Signos
    </button>
  )
}