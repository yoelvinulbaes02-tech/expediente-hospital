import { Allergy } from '@/generated/prisma'

export function BannerAlergias({ alergias }: { alergias: Allergy[] }) {
  // 1. Si no hay registros o está pendiente de evaluación
  if (!alergias || alergias.length === 0 || alergias[0].status === 'no_evaluada') {
    return (
      <div className="bg-amber-100 border border-amber-300 text-amber-800 px-4 py-2 rounded-lg flex items-center gap-2 mb-4">
        <span className="text-xl">⚠️</span>
        <div>
          <p className="font-bold text-sm">ALERGIAS NO EVALUADAS</p>
          <p className="text-xs">Requiere confirmación médica o de enfermería.</p>
        </div>
      </div>
    )
  }

  // 2. Si el paciente niega alergias (Banner verde)
  if (alergias[0].status === 'sin_alergias') {
    return (
      <div className="bg-emerald-100 border border-emerald-300 text-emerald-800 px-4 py-2 rounded-lg flex items-center gap-2 mb-4">
        <span className="text-xl">✅</span>
        <div>
          <p className="font-bold text-sm">PACIENTE NIEGA ALERGIAS</p>
          <p className="text-xs">Sin antecedentes de alergias conocidas.</p>
        </div>
      </div>
    )
  }

  // 3. Si tiene alergias registradas (Banner rojo directo sin leve/moderado)
  return (
    <div className="bg-red-100 border border-red-300 text-red-900 px-4 py-2 rounded-lg flex items-start gap-2 mb-4">
      <span className="text-xl">🚨</span>
      <div>
        <p className="font-bold text-sm">ALERGIAS CONOCIDAS</p>
        <div className="flex flex-wrap gap-2 mt-1">
          {alergias.map((alergia) => (
            <span key={alergia.id} className="bg-white text-red-800 border border-red-200 px-2 py-0.5 rounded text-xs font-bold shadow-sm">
              {alergia.allergen}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}