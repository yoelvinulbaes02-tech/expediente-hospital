'use client'

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-900"
    >
      🖨️ Imprimir Reporte
    </button>
  )
}