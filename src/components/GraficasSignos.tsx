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
  weight: number | null
  diuresis: number | null
}

type Campo = Exclude<keyof RegistroVital, 'fecha'>

type ParametroConfig = {
  id: Campo
  etiqueta: string
  unidad: string
  color: string
  minNormal: number | null
  maxNormal: number | null
  escalaMin?: number
  escalaMax?: number
}

const PARAMETROS: ParametroConfig[] = [
  { id: 'systolic', etiqueta: 'Presión Sistólica', unidad: 'mmHg', color: '#1d4ed8', minNormal: 90, maxNormal: 140, escalaMin: 60, escalaMax: 200 },
  { id: 'diastolic', etiqueta: 'Presión Diastólica', unidad: 'mmHg', color: '#7c3aed', minNormal: 60, maxNormal: 90, escalaMin: 40, escalaMax: 120 },
  { id: 'heartRate', etiqueta: 'Frecuencia Cardíaca', unidad: 'lpm', color: '#e11d48', minNormal: 60, maxNormal: 100, escalaMin: 40, escalaMax: 150 },
  { id: 'temperature', etiqueta: 'Temperatura', unidad: '°C', color: '#d97706', minNormal: 36.0, maxNormal: 37.5, escalaMin: 35.0, escalaMax: 40.5 },
  { id: 'oxygenSat', etiqueta: 'Saturación SpO2', unidad: '%', color: '#0284c7', minNormal: 95, maxNormal: 100, escalaMin: 70, escalaMax: 100 },
  { id: 'respiratoryRate', etiqueta: 'Frec. Respiratoria', unidad: 'rpm', color: '#475569', minNormal: 12, maxNormal: 20, escalaMin: 8, escalaMax: 32 },
  { id: 'glucose', etiqueta: 'Glucosa', unidad: 'mg/dL', color: '#ca8a04', minNormal: 70, maxNormal: 140, escalaMin: 50, escalaMax: 250 },
  { id: 'weight', etiqueta: 'Peso Corporal', unidad: 'kg', color: '#059669', minNormal: null, maxNormal: null },
  { id: 'diuresis', etiqueta: 'Diuresis', unidad: 'mL', color: '#0891b2', minNormal: 400, maxNormal: null },
]

function esAnormal(v: number | null, p: ParametroConfig) {
  if (v === null) return false
  if (p.minNormal !== null && v < p.minNormal) return true
  if (p.maxNormal !== null && v > p.maxNormal) return true
  return false
}

const fmtHora = (iso: string) =>
  new Date(iso).toLocaleString('es-DO', {
    timeZone: 'America/Santo_Domingo',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })

const fmtFechaCorta = (iso: string) =>
  new Date(iso).toLocaleDateString('es-DO', {
    timeZone: 'America/Santo_Domingo',
    day: '2-digit',
    month: '2-digit',
  })

// ─── VISTA 1: HOJA DE CONSTANTES CLÍNICA (FLOWSHEET) ───
function HojaConstantes({ registros }: { registros: RegistroVital[] }) {
  // Las tomas se muestran cronológicamente de izquierda a derecha
  const tomas = [...registros].reverse()

  return (
    <div className="overflow-x-auto border border-slate-200 rounded-lg">
      <table className="w-full text-xs text-left border-collapse">
        <thead>
          <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
            <th className="p-2.5 font-bold sticky left-0 bg-slate-100 z-10 border-r min-w-36">
              Parámetro / Signo
            </th>
            {tomas.map((t, idx) => (
              <th key={idx} className="p-2 text-center min-w-20 font-semibold border-r last:border-0">
                <span className="block text-slate-800 font-bold">{fmtHora(t.fecha)}</span>
                <span className="text-[10px] text-slate-400 block">{fmtFechaCorta(t.fecha)}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Presión Arterial Combinada */}
          <tr className="border-b hover:bg-slate-50/60">
            <td className="p-2.5 font-semibold text-slate-800 sticky left-0 bg-white border-r">
              Presión Arterial <span className="text-[10px] text-slate-400 font-normal">(mmHg)</span>
            </td>
            {tomas.map((t, idx) => {
              const alerta =
                (t.systolic && (t.systolic > 140 || t.systolic < 90)) ||
                (t.diastolic && (t.diastolic > 90 || t.diastolic < 60))
              return (
                <td
                  key={idx}
                  className={`p-2 text-center font-bold border-r last:border-0 ${
                    alerta ? 'bg-red-50 text-red-700' : 'text-slate-800'
                  }`}
                >
                  {t.systolic && t.diastolic ? `${t.systolic}/${t.diastolic}` : '—'}
                </td>
              )
            })}
          </tr>

          {/* Frecuencia Cardíaca */}
          <tr className="border-b hover:bg-slate-50/60">
            <td className="p-2.5 font-semibold text-slate-800 sticky left-0 bg-white border-r">
              Frecuencia Cardíaca <span className="text-[10px] text-slate-400 font-normal">(lpm)</span>
            </td>
            {tomas.map((t, idx) => {
              const p = PARAMETROS.find((x) => x.id === 'heartRate')!
              const alerta = esAnormal(t.heartRate, p)
              return (
                <td
                  key={idx}
                  className={`p-2 text-center font-bold border-r last:border-0 ${
                    alerta ? 'bg-red-50 text-red-700' : 'text-slate-800'
                  }`}
                >
                  {t.heartRate ?? '—'}
                </td>
              )
            })}
          </tr>

          {/* Temperatura */}
          <tr className="border-b hover:bg-slate-50/60">
            <td className="p-2.5 font-semibold text-slate-800 sticky left-0 bg-white border-r">
              Temperatura <span className="text-[10px] text-slate-400 font-normal">(°C)</span>
            </td>
            {tomas.map((t, idx) => {
              const p = PARAMETROS.find((x) => x.id === 'temperature')!
              const alerta = esAnormal(t.temperature, p)
              return (
                <td
                  key={idx}
                  className={`p-2 text-center font-bold border-r last:border-0 ${
                    alerta ? 'bg-red-50 text-red-700' : 'text-slate-800'
                  }`}
                >
                  {t.temperature ? `${t.temperature.toFixed(1)}°` : '—'}
                </td>
              )
            })}
          </tr>

          {/* Saturación SpO2 */}
          <tr className="border-b hover:bg-slate-50/60">
            <td className="p-2.5 font-semibold text-slate-800 sticky left-0 bg-white border-r">
              SpO2 <span className="text-[10px] text-slate-400 font-normal">(%)</span>
            </td>
            {tomas.map((t, idx) => {
              const p = PARAMETROS.find((x) => x.id === 'oxygenSat')!
              const alerta = esAnormal(t.oxygenSat, p)
              return (
                <td
                  key={idx}
                  className={`p-2 text-center font-bold border-r last:border-0 ${
                    alerta ? 'bg-red-50 text-red-700' : 'text-slate-800'
                  }`}
                >
                  {t.oxygenSat ? `${t.oxygenSat}%` : '—'}
                </td>
              )
            })}
          </tr>

          {/* Frecuencia Respiratoria */}
          <tr className="border-b hover:bg-slate-50/60">
            <td className="p-2.5 font-semibold text-slate-800 sticky left-0 bg-white border-r">
              Frec. Respiratoria <span className="text-[10px] text-slate-400 font-normal">(rpm)</span>
            </td>
            {tomas.map((t, idx) => {
              const p = PARAMETROS.find((x) => x.id === 'respiratoryRate')!
              const alerta = esAnormal(t.respiratoryRate, p)
              return (
                <td
                  key={idx}
                  className={`p-2 text-center font-medium border-r last:border-0 ${
                    alerta ? 'bg-red-50 text-red-700 font-bold' : 'text-slate-700'
                  }`}
                >
                  {t.respiratoryRate ?? '—'}
                </td>
              )
            })}
          </tr>

          {/* Glucosa */}
          <tr className="border-b hover:bg-slate-50/60">
            <td className="p-2.5 font-semibold text-slate-800 sticky left-0 bg-white border-r">
              Glucosa <span className="text-[10px] text-slate-400 font-normal">(mg/dL)</span>
            </td>
            {tomas.map((t, idx) => {
              const p = PARAMETROS.find((x) => x.id === 'glucose')!
              const alerta = esAnormal(t.glucose, p)
              return (
                <td
                  key={idx}
                  className={`p-2 text-center font-medium border-r last:border-0 ${
                    alerta ? 'bg-amber-50 text-amber-900 font-bold' : 'text-slate-700'
                  }`}
                >
                  {t.glucose ?? '—'}
                </td>
              )
            })}
          </tr>

          {/* Peso */}
          <tr className="border-b hover:bg-slate-50/60">
            <td className="p-2.5 font-semibold text-slate-800 sticky left-0 bg-white border-r">
              Peso Corporal <span className="text-[10px] text-slate-400 font-normal">(kg)</span>
            </td>
            {tomas.map((t, idx) => (
              <td key={idx} className="p-2 text-center font-bold text-emerald-800 border-r last:border-0">
                {t.weight ? `${t.weight} kg` : '—'}
              </td>
            ))}
          </tr>

          {/* Diuresis */}
          <tr className="hover:bg-slate-50/60">
            <td className="p-2.5 font-semibold text-slate-800 sticky left-0 bg-white border-r">
              Diuresis <span className="text-[10px] text-slate-400 font-normal">(mL)</span>
            </td>
            {tomas.map((t, idx) => (
              <td key={idx} className="p-2 text-center font-bold text-sky-800 border-r last:border-0">
                {t.diuresis ? `${t.diuresis} mL` : '—'}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  )
}

// ─── VISTA 2: GRÁFICA CLÍNICA LIMPIA (CON ESCALAS FISIOLÓGICAS SIN AMONTONAMIENTO) ───
function GraficaClinica({
  titulo,
  unidad,
  filas,
  series,
  escalaMin,
  escalaMax,
  lineaAlerta,
}: {
  titulo: string
  unidad: string
  filas: RegistroVital[]
  series: { campo: Campo; etiqueta: string; color: string; alerta?: (v: number) => boolean }[]
  escalaMin?: number
  escalaMax?: number
  lineaAlerta?: { valor: number; etiqueta: string }
}) {
  const W = 580
  const H = 190
  const padIzq = 48
  const padDer = 18
  const padArr = 20
  const padAba = 28

  const todosValores: number[] = []
  series.forEach((s) => {
    filas.forEach((r) => {
      const val = r[s.campo]
      if (val !== null) todosValores.push(val)
    })
  })

  if (todosValores.length < 2) {
    return (
      <div className="bg-slate-50 rounded-lg p-6 text-center text-xs text-slate-400 border">
        Se requieren al menos 2 registros de {titulo.toLowerCase()} para graficar.
      </div>
    )
  }

  let min = escalaMin !== undefined ? escalaMin : Math.min(...todosValores)
  let max = escalaMax !== undefined ? escalaMax : Math.max(...todosValores)

  // Aseguramos margen visual
  if (escalaMin === undefined) min = min - (max - min) * 0.1 || min - 2
  if (escalaMax === undefined) max = max + (max - min) * 0.1 || max + 2
  if (max <= min) max = min + 10

  const getX = (idx: number) => padIzq + (idx * (W - padIzq - padDer)) / (filas.length - 1)
  const getY = (val: number) => padArr + ((max - val) / (max - min)) * (H - padArr - padAba)

  // 4 líneas de cuadrícula fijas y claras
  const ticksY = [min, min + (max - min) * 0.33, min + (max - min) * 0.66, max]

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-2xs">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          {titulo} <span className="font-normal text-slate-400 lowercase">({unidad})</span>
        </h4>
        <div className="flex gap-3 text-xs font-medium">
          {series.map((s) => {
            const ult = filas[filas.length - 1][s.campo]
            return (
              <span key={s.campo} style={{ color: s.color }}>
                {s.etiqueta}: <strong>{ult !== null ? ult : '—'}</strong>
              </span>
            )
          })}
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none" role="img">
        {/* Cuadrícula clínica hospitalaria */}
        {ticksY.map((t, idx) => (
          <g key={idx}>
            <line
              x1={padIzq}
              y1={getY(t)}
              x2={W - padDer}
              y2={getY(t)}
              stroke="#f1f5f9"
              strokeWidth="1.5"
            />
            {/* Solo mostramos la escala limpia a la izquierda SIN números encima */}
            <text
              x={padIzq - 8}
              y={getY(t) + 3.5}
              textAnchor="end"
              fontSize="10"
              fill="#94a3b8"
              fontFamily="monospace"
            >
              {Math.round(t)}
            </text>
          </g>
        ))}

        {/* Línea de alerta clínica fija (ej. Fiebre 38°C) */}
        {lineaAlerta && lineaAlerta.valor >= min && lineaAlerta.valor <= max && (
          <g>
            <line
              x1={padIzq}
              y1={getY(lineaAlerta.valor)}
              x2={W - padDer}
              y2={getY(lineaAlerta.valor)}
              stroke="#fca5a5"
              strokeWidth="1"
              strokeDasharray="4 3"
            />
            <text
              x={W - padDer}
              y={getY(lineaAlerta.valor) - 3}
              textAnchor="end"
              fontSize="9"
              fill="#dc2626"
              fontWeight="bold"
            >
              {lineaAlerta.etiqueta}
            </text>
          </g>
        )}

        {/* Fechas en el eje X */}
        <text x={padIzq} y={H - 8} fontSize="10" fill="#64748b" textAnchor="start">
          {fmtFechaCorta(filas[0].fecha)} {fmtHora(filas[0].fecha)}
        </text>
        <text x={W - padDer} y={H - 8} fontSize="10" fill="#64748b" textAnchor="end">
          {fmtFechaCorta(filas[filas.length - 1].fecha)} {fmtHora(filas[filas.length - 1].fecha)}
        </text>

        {/* Líneas y Puntos sin colisión */}
        {series.map((s) => {
          const puntos = filas
            .map((r, idx) => ({ v: r[s.campo], x: getX(idx) }))
            .filter((p): p is { v: number; x: number } => p.v !== null)

          if (puntos.length < 2) return null

          const polylineStr = puntos.map((p) => `${p.x},${getY(p.v)}`).join(' ')

          return (
            <g key={s.campo}>
              <polyline
                points={polylineStr}
                fill="none"
                stroke={s.color}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {puntos.map((p, idx) => {
                const esAlerta = s.alerta ? s.alerta(p.v) : false
                const py = getY(p.v)
                return (
                  <g key={idx}>
                    <circle
                      cx={p.x}
                      cy={py}
                      r={esAlerta ? 5 : 3.5}
                      fill={esAlerta ? '#dc2626' : s.color}
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                    {/* Badge limpio solo para valores con fondo para evitar solapamientos */}
                    <rect
                      x={p.x - 14}
                      y={py - 17}
                      width={28}
                      height={13}
                      rx={3}
                      fill={esAlerta ? '#dc2626' : '#ffffff'}
                      stroke={esAlerta ? '#b91c1c' : '#cbd5e1'}
                      strokeWidth="1"
                    />
                    <text
                      x={p.x}
                      y={py - 8}
                      textAnchor="middle"
                      fontSize="9"
                      fontWeight="bold"
                      fill={esAlerta ? '#ffffff' : '#1e293b'}
                    >
                      {Math.round(p.v)}
                    </text>
                  </g>
                )
              })}
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// ─── COMPONENTE PRINCIPAL CON TABS HOSPITALARIAS ───
export function GraficasSignos({ registros }: { registros: RegistroVital[] }) {
  const [modo, setModo] = useState<'sabana' | 'grafica'>('sabana')

  if (registros.length === 0) {
    return (
      <p className="text-sm text-slate-400 text-center py-8">
        Aún no hay signos vitales registrados en este expediente.
      </p>
    )
  }

  // Orden cronológico (antiguo a reciente) para las gráficas
  const ordenCronologico = [...registros].reverse()

  return (
    <div className="space-y-4">
      {/* Botones de Cambio de Vista al Estilo Hospitalario */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setModo('sabana')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              modo === 'sabana'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>📋</span> Hoja de Constantes (Sábana de Signos)
          </button>
          <button
            type="button"
            onClick={() => setModo('grafica')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              modo === 'grafica'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>📈</span> Curvas de Tendencia
          </button>
        </div>

        <span className="text-[11px] text-slate-400">
          {registros.length} toma{registros.length === 1 ? '' : 's'} registrada{registros.length === 1 ? '' : 's'}
        </span>
      </div>

      {/* VISTA 1: HOJA DE CONSTANTES (Por defecto, favorita de los médicos) */}
      {modo === 'sabana' && (
        <div>
          <p className="text-xs text-slate-500 mb-2">
            Vista horizontal de enfermería y pase de visita. Las casillas en <strong className="text-red-600">rojo</strong> indican valores fuera de rango fisiológico.
          </p>
          <HojaConstantes registros={registros} />
        </div>
      )}

      {/* VISTA 2: GRÁFICAS CLÍNICAS LIMPIAS (Sin números montados) */}
      {modo === 'grafica' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 1. Presión Arterial */}
          <GraficaClinica
            titulo="Presión Arterial"
            unidad="mmHg"
            filas={ordenCronologico}
            escalaMin={40}
            escalaMax={200}
            series={[
              { campo: 'systolic', etiqueta: 'Sistólica', color: '#1d4ed8', alerta: (v) => v > 140 || v < 90 },
              { campo: 'diastolic', etiqueta: 'Diastólica', color: '#7c3aed', alerta: (v) => v > 90 || v < 60 },
            ]}
          />

          {/* 2. Frecuencia Cardíaca */}
          <GraficaClinica
            titulo="Frecuencia Cardíaca"
            unidad="lpm"
            filas={ordenCronologico}
            escalaMin={40}
            escalaMax={150}
            lineaAlerta={{ valor: 100, etiqueta: 'Taquicardia (>100)' }}
            series={[
              { campo: 'heartRate', etiqueta: 'FC', color: '#e11d48', alerta: (v) => v > 100 || v < 60 },
            ]}
          />

          {/* 3. Temperatura */}
          <GraficaClinica
            titulo="Temperatura Corporal"
            unidad="°C"
            filas={ordenCronologico}
            escalaMin={35.0}
            escalaMax={40.5}
            lineaAlerta={{ valor: 38.0, etiqueta: 'Fiebre (≥38.0°)' }}
            series={[
              { campo: 'temperature', etiqueta: 'Temp', color: '#d97706', alerta: (v) => v >= 38.0 || v < 36.0 },
            ]}
          />

          {/* 4. Saturación SpO2 */}
          <GraficaClinica
            titulo="Saturación de Oxígeno"
            unidad="%"
            filas={ordenCronologico}
            escalaMin={70}
            escalaMax={100}
            lineaAlerta={{ valor: 95, etiqueta: 'Límite normal (95%)' }}
            series={[
              { campo: 'oxygenSat', etiqueta: 'SpO2', color: '#0284c7', alerta: (v) => v < 95 },
            ]}
          />

          {/* 5. Peso Corporal */}
          <GraficaClinica
            titulo="Peso Corporal"
            unidad="kg"
            filas={ordenCronologico}
            series={[
              { campo: 'weight', etiqueta: 'Peso', color: '#059669' },
            ]}
          />

          {/* 6. Diuresis */}
          <GraficaClinica
            titulo="Diuresis"
            unidad="mL"
            filas={ordenCronologico}
            escalaMin={0}
            series={[
              { campo: 'diuresis', etiqueta: 'Diuresis', color: '#0891b2' },
            ]}
          />
        </div>
      )}
    </div>
  )
}