import { Allergy } from '@/generated/prisma'

export function BannerAlergias({ alergias }: { alergias: Allergy[] }) {
  // Si no hay registro o el estado es "no_evaluada"
  if (!alergias || alergias.length === 0 || alergias[0].status === 'no_evaluada') {
    return (
      <div className="bg-amber-100 border border-amber-300 text-amber-800 px-4 py-2 rounded-lg flex items-center gap-2 mb-4">
        <span className="text-xl">⚠️</span>
        <div>
          <p className="font-bold text-sm">ALERGIAS NO EVALUADAS</p>
          <p className="text-xs">Requiere evaluación médica inmediata.</p>
        </div>
      </div>
    )
  }

  // Si el estado es "sin_alergias" explícitamente
  if (alergias[0].status === 'sin_alergias') {
    return (
      <div className="bg-green-100 border border-green-300 text-green-800 px-4 py-2 rounded-lg flex items-center gap-2 mb-4">
        <span className="text-xl">✅</span>
        <div>
          <p className="font-bold text-sm">SIN ALERGIAS CONOCIDAS</p>
          <p className="text-xs">Paciente evaluado.</p>
        </div>
      </div>
    )
  }

  // Si tiene alergias reales
  const tieneGrave = alergias.some(a => a.severity === 'grave')
  
  return (
    <div className={`px-4 py-2 rounded-lg flex items-start gap-2 mb-4 ${tieneGrave ? 'bg-red-100 border border-red-300 text-red-800' : 'bg-orange-100 border border-orange-300 text-orange-800'}`}>
      <span className="text-xl">🚨</span>
      <div>
        <p className="font-bold text-sm">ALERGIAS CONOCIDAS</p>
        <div className="flex flex-wrap gap-2 mt-1">
          {alergias.map((alergia) => (
            <span key={alergia.id} className="bg-white px-2 py-0.5 rounded text-xs font-semibold shadow-sm">
              {alergia.allergen} ({alergia.severity})
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}