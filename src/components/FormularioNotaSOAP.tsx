'use client'

import { useState } from 'react'
import { TextareaConDeshacer } from '@/components/TextareaConDeshacer'

export function FormularioNotaSOAP({
  episodeId,
  action,
}: {
  episodeId: string
  action: (formData: FormData) => Promise<void>
}) {
  const [formKey, setFormKey] = useState(0)
  const [enviando, setEnviando] = useState(false)

  const inputClass =
    'w-full px-3 py-2 border rounded-lg text-base md:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500'

  const limpiarBorradores = () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(`draft_${episodeId}_s`)
        localStorage.removeItem(`draft_${episodeId}_o`)
        localStorage.removeItem(`draft_${episodeId}_a`)
        localStorage.removeItem(`draft_${episodeId}_p`)
      } catch {}
    }
  }

  const handleSubmit = async (formData: FormData) => {
    setEnviando(true)
    try {
      limpiarBorradores()
      await action(formData)
      // Al cambiar la key, React desmonta y limpia los 4 textareas inmediatamente
      setFormKey((prev) => prev + 1)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <div className="flex items-center justify-between border-b pb-2 mb-4">
        <h2 className="text-lg font-bold text-slate-800">Nueva Nota de Evolución (SOAP)</h2>
        <span className="text-xs text-slate-400 font-medium">Con protección anti-borrado</span>
      </div>

      <form key={formKey} action={handleSubmit} className="space-y-4">
        <input type="hidden" name="episodeId" value={episodeId} />

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            S (Subjetivo) - Lo que refiere el paciente:
          </label>
          <TextareaConDeshacer
            name="subjective"
            rows={2}
            required
            storageKey={`draft_${episodeId}_s`}
            placeholder="Paciente refiere sentirse mejor, sin disnea el día de hoy..."
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            O (Objetivo) - Hallazgos físicos, signos vitales:
          </label>
          <TextareaConDeshacer
            name="objective"
            rows={2}
            required
            storageKey={`draft_${episodeId}_o`}
            placeholder="Afebril, hidratado, ruidos cardíacos rítmicos, abdomen blando..."
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            A (Análisis) - Impresión diagnóstica y evolución:
          </label>
          <TextareaConDeshacer
            name="assessment"
            rows={2}
            required
            storageKey={`draft_${episodeId}_a`}
            placeholder="Paciente masculino en su 3er día de internamiento con ERC..."
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            P (Plan) - Conducta terapéutica y órdenes médicas:
          </label>
          <TextareaConDeshacer
            name="plan"
            rows={2}
            required
            storageKey={`draft_${episodeId}_p`}
            placeholder="1. Continuar hemodiálisis trisemanal. 2. Ajustar dosis de..."
            className={inputClass}
          />
        </div>

        <button
          type="submit"
          disabled={enviando}
          className="w-full bg-blue-600 text-white px-4 py-3 md:py-2.5 rounded-lg font-bold text-sm hover:bg-blue-700 active:scale-98 transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {enviando ? 'Guardando y firmando nota…' : 'Firmar y Guardar Nota'}
        </button>
      </form>
    </div>
  )
}