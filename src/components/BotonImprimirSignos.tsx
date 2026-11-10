'use client'

export function BotonImprimirSignos() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      title="Imprimir hoja clínica de signos vitales"
      className="text-xs font-bold text-slate-700 bg-white border border-slate-300 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs flex items-center gap-1.5 print:hidden"
    >
      <span>🖨️</span> Imprimir Signos
    </button>
  )
}