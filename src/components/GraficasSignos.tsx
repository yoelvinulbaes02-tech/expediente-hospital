'use client'

import { useState } from 'react'

export type RegistroVital = {
  fecha: string
  systolic: number | null
  diastolic: number | null
  heartRate: number | null
  respiratoryRate: number | null
  temperature: number | null
  oxygenSat: number | null
  glucose: number | null
  painScale: number | null
}

type Campo = Exclude<keyof RegistroVital, 'fecha'>
type Serie = {
  nombre: string
  campo: Campo
  color: string
  rango: [number | null, number | null] // [mínimo normal, máximo normal]
}
type Grafica = {
  id: string
  titulo: string
  corto: string
  unidad: string
  series: Serie[]
  piso?: number
  techo?: number
}

// Rangos: los de la tabla (TA, FC, Temp, SpO2) + FR, glucosa y dolor (ajústalos aquí si hace falta)
const GRAFICAS: Grafica[] = [
  {
    id: 'presion',
    titulo: 'Presión arterial',
    corto: 'Presión',
    unidad: 'mmHg',
    series: [
      { nombre: 'Sistólica', campo: 'systolic', color: '#2563eb', rango: [90, 140] },
      { nombre: 'Diastólica', campo: 'diastolic', color: '#7c3aed', rango: [60, 90] },
    ],
  },
  {
    id: 'fc',
    titulo: 'Frecuencia cardíaca',
    corto: 'FC',
    unidad: 'lpm',
    series: [{ nombre: 'FC', campo: 'heartRate', color: '#2563eb', rango: [60, 100] }],
  },
  {
    id: 'fr',
    titulo: 'Frecuencia respiratoria',
    corto: 'FR',
    unidad: 'rpm',
    series: [{ nombre: 'FR', campo: 'respiratoryRate', color: '#2563eb', rango: [12, 20] }],
  },
  {
    id: 'temp',
    titulo: 'Temperatura',
    corto: 'Temp',
    unidad: '°C',
    series: [{ nombre: 'Temp', campo: 'temperature', color: '#2563eb', rango: [36, 37.5] }],
  },
  {
    id: 'spo2',
    titulo: 'Saturación de oxígeno',
    corto: 'SpO2',
    unidad: '%',
    techo: 100,
    series: [{ nombre: 'SpO2', campo: 'oxygenSat', color: '#2563eb', rango: [95, null] }],
  },
  {
    id: 'glucosa',
    titulo: 'Glucosa',
    corto: 'Glucosa',
    unidad: 'mg/dL',
    series: [{ nombre: 'Glucosa', campo: 'glucose', color: '#2563eb', rango: [70, 140] }],
  },
  {
    id: 'dolor',
    titulo: 'Dolor',
    corto: 'Dolor',
    unidad: '/10',
    piso: 0,
    techo: 10,
    series: [{ nombre: 'Dolor', campo: 'painScale', color: '#2563eb', rango: [0, 3] }],
  },
]

const ROJO = '#dc2626'

const fueraDeRango = (v: number, [lo, hi]: [number | null, number | null]) =>
  (lo !== null && v < lo) || (hi !== null && v > hi)

const fmtFecha = (iso: string) =>
  new Date(iso).toLocaleString('es-DO', {
    timeZone: 'America/Santo_Domingo',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })

const redondear = (n: number) => Math.round(n * 10) / 10

// `registros` debe venir en orden cronológico (el más antiguo primero)
function ultimoValor(registros: RegistroVital[], campo: Campo): number | null {
  for (let i = registros.length - 1; i >= 0; i--) {
    const v = registros[i][campo]
    if (v !== null) return v
  }
  return null
}

function Linea({
  g,
  registros,
  grande,
}: {
  g: Grafica
  registros: RegistroVital[]
  grande: boolean
}) {
  const filas = registros.filter((r) => g.series.some((s) => r[s.campo] !== null))

  if (filas.length < 2) {
    return (
      <p className="text-sm text-slate-400 text-center py-8">
        Se necesitan al menos 2 registros para graficar.
      </p>
    )
  }

  const W = grande ? 640 : 420
  const H = grande ? 280 : 190
  const izq = 40
  const der = 14
  const arr = 16
  const aba = 24

  const todos: number[] = []
  g.series.forEach((s) => {
    filas.forEach((r) => {
      const v = r[s.campo]
      if (v !== null) todos.push(v)
    })
    s.rango.forEach((x) => {
      if (x !== null) todos.push(x)
    })
  })

  let min = Math.min(...todos)
  let max = Math.max(...todos)
  const margen = (max - min) * 0.1 || 1
  min -= margen
  max += margen
  if (g.piso !== undefined) min = Math.max(min, g.piso)
  if (g.techo !== undefined) max = Math.min(max, g.techo)
  if (max <= min) max = min + 1

  const x = (i: number) => izq + (i * (W - izq - der)) / (filas.length - 1)
  const y = (v: number) => H - aba - ((v - min) / (max - min)) * (H - aba - arr)

  const ticks = [min, (min + max) / 2, max]
  const etiquetas = grande || g.series.length === 1

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label={`Tendencia de ${g.titulo}`}>
      {/* Franjas de rango normal */}
      {g.series.map((s) => {
        const lo = Math.max(s.rango[0] ?? min, min)
        const hi = Math.min(s.rango[1] ?? max, max)
        if (hi <= lo) return null
        return (
          <rect
            key={`banda-${s.campo}`}
            x={izq}
            y={y(hi)}
            width={W - izq - der}
            height={y(lo) - y(hi)}
            fill={s.color}
            opacity={0.1}
          />
        )
      })}

      {/* Líneas guía y escala vertical */}
      {ticks.map((t, i) => (
        <g key={`tick-${i}`}>
          <line x1={izq} y1={y(t)} x2={W - der} y2={y(t)} stroke="#e2e8f0" strokeWidth="1" />
          <text x={izq - 6} y={y(t) + 4} fontSize="12" textAnchor="end" fill="#64748b">
            {redondear(t)}
          </text>
        </g>
      ))}

      {/* Fechas de los extremos */}
      <text x={izq} y={H - 6} fontSize="12" textAnchor="start" fill="#64748b">
        {fmtFecha(filas[0].fecha)}
      </text>
      <text x={W - der} y={H - 6} fontSize="12" textAnchor="end" fill="#64748b">
        {fmtFecha(filas[filas.length - 1].fecha)}
      </text>

      {/* Series */}
      {g.series.map((s) => {
        const pts = filas
          .map((r, i) => ({ v: r[s.campo], px: x(i) }))
          .filter((p): p is { v: number; px: number } => p.v !== null)
        return (
          <g key={s.campo}>
            <polyline
              points={pts.map((p) => `${p.px},${y(p.v)}`).join(' ')}
              fill="none"
              stroke={s.color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {pts.map((p, i) => {
              const fuera = fueraDeRango(p.v, s.rango)
              return (
                <g key={i}>
                  <circle
                    cx={p.px}
                    cy={y(p.v)}
                    r={fuera ? 5 : 4}
                    fill={fuera ? ROJO : s.color}
                    stroke="#fff"
                    strokeWidth="1.5"
                  />
                  {etiquetas && (
                    <text
                      x={p.px}
                      y={y(p.v) - 9}
                      fontSize="12"
                      textAnchor="middle"
                      fontWeight="bold"
                      fill={fuera ? ROJO : '#1e293b'}
                    >
                      {redondear(p.v)}
                    </text>
                  )}
                </g>
              )
            })}
          </g>
        )
      })}
    </svg>
  )
}

function Tarjeta({
  g,
  registros,
  grande,
}: {
  g: Grafica
  registros: RegistroVital[]
  grande: boolean
}) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-3">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 mb-2">
        <h3 className="text-sm font-bold text-slate-800">
          {g.titulo} <span className="font-normal text-slate-400">({g.unidad})</span>
        </h3>
        <div className="flex gap-3 text-xs">
          {g.series.map((s) => {
            const ult = ultimoValor(registros, s.campo)
            if (ult === null) return null
            const fuera = fueraDeRango(ult, s.rango)
            return (
              <span key={s.campo} className="font-semibold" style={{ color: fuera ? ROJO : s.color }}>
                {g.series.length > 1 ? `${s.nombre}: ` : 'Último: '}
                {redondear(ult)}
              </span>
            )
          })}
        </div>
      </div>
      <Linea g={g} registros={registros} grande={grande} />
    </div>
  )
}

export function GraficasSignos({ registros }: { registros: RegistroVital[] }) {
  const [vista, setVista] = useState<string>('todas')

  // La página los entrega del más reciente al más antiguo; aquí se ordenan cronológicamente
  const orden = [...registros].reverse()

  // Solo se muestran los signos que tienen al menos un dato
  const visibles = GRAFICAS.filter((g) =>
    orden.some((r) => g.series.some((s) => r[s.campo] !== null))
  )

  if (visibles.length === 0) {
    return (
      <p className="text-sm text-slate-400 text-center py-8">
        Aún no hay signos vitales para graficar.
      </p>
    )
  }

  const seleccionada = visibles.find((g) => g.id === vista)

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          type="button"
          onClick={() => setVista('todas')}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${
            !seleccionada ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
          }`}
        >
          Todas
        </button>
        {visibles.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => setVista(g.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border ${
              seleccionada?.id === g.id
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
            }`}
          >
            {g.corto}
          </button>
        ))}
      </div>

      {seleccionada ? (
        <Tarjeta g={seleccionada} registros={orden} grande />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {visibles.map((g) => (
            <Tarjeta key={g.id} g={g} registros={orden} grande={false} />
          ))}
        </div>
      )}

      <p className="mt-3 text-xs text-slate-500">
        Franja sombreada: rango normal · <span className="font-semibold text-red-600">punto rojo</span>: fuera de rango
      </p>
    </div>
  )
}