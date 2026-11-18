'use client'

import { useState } from 'react'
import { TextareaConDeshacer } from '@/components/TextareaConDeshacer'

export function FormularioNotaEvolucion({
  episodeId,
  action,
}: {
  episodeId: string
  action: (formData: FormData) => Promise<void>
}) {
  const [formKey, setFormKey] = useState(0)
  const [enviando, setEnviando] = useState(false)

  const limpiarBorrador = () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(`draft_${episodeId}_evolucion`)
      } catch {}
    }
  }

  const handleSubmit = async (formData: FormData) => {
    setEnviando(true)
    try {
      limpiarBorrador()
      await action(formData)
      setFormKey((prev) => prev + 1)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <div className="flex items-center justify-between border-b pb-2 mb-4">
        <h2 className="text-lg font-bold text-slate-800">Nueva Nota de Evolución Clínica</h2>
        <span className="text-xs text-slate-400 font-medium">Con protección anti-borrado táctil</span>
      </div>

      <form key={formKey} action={handleSubmit} className="space-y-4">
        <input type="hidden" name="episodeId" value={episodeId} />

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Evolución del paciente, examen físico y plan médico:
          </label>
          <TextareaConDeshacer
            name="content"
            rows={6}
            required
            storageKey={`draft_${episodeId}_evolucion`}
            placeholder="Escriba aquí la evolución del paciente, estado clínico, respuesta a tratamiento, hallazgos e indicaciones..."
            className="w-full px-3 py-2.5 border rounded-lg text-base md:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
          />
        </div>

        <button
          type="submit"
          disabled={enviando}
          className="w-full bg-blue-600 text-white px-4 py-3 md:py-2.5 rounded-lg font-bold text-sm hover:bg-blue-700 active:scale-98 transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {enviando ? 'Guardando y firmando evolución…' : 'Firmar y Guardar Nota de Evolución'}
        </button>
      </form>
    </div>
  )
}