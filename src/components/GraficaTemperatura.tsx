'use client'

export function GraficaTemperatura({ datos }: { datos: { valor: number; fecha: string }[] }) {
  if (datos.length < 2) {
    return <p className="text-sm text-slate-400 text-center py-8">Se necesitan al menos 2 registros para graficar la tendencia.</p>
  }

  const dataOrdenada = [...datos].reverse()
  
  const valores = dataOrdenada.map(d => d.valor)
  const min = Math.min(...valores) - 0.5
  const max = Math.max(...valores) + 0.5
  
  const width = 500
  const height = 150
  const padding = 20

  const puntos = dataOrdenada.map((d, i) => {
    const x = padding + (i * (width - padding * 2)) / (dataOrdenada.length - 1)
    const y = height - padding - ((d.valor - min) / (max - min)) * (height - padding * 2)
    return `${x},${y}`
  }).join(' ')

  return (
    <div className="w-full overflow-hidden bg-white p-4 rounded-lg border">
      <div className="flex justify-between text-xs text-slate-500 mb-2">
        <span>Hace más tiempo</span>
        <span>Más reciente</span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#e2e8f0" strokeWidth="2" />
        <polyline points={puntos} fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {dataOrdenada.map((d, i) => {
          const x = padding + (i * (width - padding * 2)) / (dataOrdenada.length - 1)
          const y = height - padding - ((d.valor - min) / (max - min)) * (height - padding * 2)
          return (
            <g key={i}>
              <circle cx={x} cy={y} r="4" fill="#2563eb" />
              <text x={x} y={y - 10} fontSize="10" textAnchor="middle" fill="#1e293b" fontWeight="bold">{d.valor}</text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}