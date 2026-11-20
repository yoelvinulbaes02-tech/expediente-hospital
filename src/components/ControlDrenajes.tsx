'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  Droplets,
  Plus,
  Pencil,
  Archive,
  Clock,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
} from 'lucide-react'
import {
  agregarDrenaje,
  editarDebitoDrenaje,
  registrarDebitoDrenaje,
  retirarDrenaje,
} from '@/app/dashboard/paciente/[id]/actions-clinicas'

export type DrainEntryItem = {
  id: string
  volumeMl: number
  characteristic: string | null
  recordedBy: string
  recordedAt: string
  updatedBy: string | null
  updatedAt: string | null
}

export type EpisodeDrainItem = {
  id: string
  name: string
  location: string | null
  isActive: boolean
  createdBy: string
  createdAt: string
  removedBy: string | null
  removedAt: string | null
  entries: DrainEntryItem[]
}

const PRESETS_DRENAJES = [
  'Sonda pleural',
  'Drenaje abdominal',
  'Penrose',
  'Jackson-Pratt',
  'Hemovac',
  'Sonda Kehr',
  'Sonda T',
] as const

const ETIQUETAS_ROL: Record<string, string> = {
  SUPERADMIN: 'Plataforma',
  ADMIN: 'Admin',
  DOCTOR: 'Médico',
  RESIDENT: 'Residente',
  NURSE: 'Enfermería',
  LAB: 'Lab',
  READONLY: 'Lectura',
}

const fmtFechaHora = (iso: string) =>
  new Date(iso).toLocaleString('es-DO', {
    timeZone: 'America/Santo_Domingo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

const fmtDiaClave = (iso: string) => {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Santo_Domingo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(iso))
  const get = (t: string) => partes.find((p) => p.type === t)?.value ?? '00'
  return `${get('year')}-${get('month')}-${get('day')}`
}

const fmtDiaCorto = (claveDia: string) => {
  const [, mm, dd] = claveDia.split('-')
  return `${dd}/${mm}`
}

const fmtHoraCorta = (iso: string) =>
  new Date(iso).toLocaleString('es-DO', {
    timeZone: 'America/Santo_Domingo',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })

const COLORES_SERIE = [
  '#ea580c',
  '#2563eb',
  '#059669',
  '#7c3aed',
  '#dc2626',
  '#0891b2',
]

type TendenciaInfo = {
  estado: 'sube' | 'baja' | 'igual' | 'unico'
  delta: number
  porcentaje: number | null
  ultimo: number
  anterior: number | null
}

function calcularTendencia(valores: number[]): TendenciaInfo | null {
  if (valores.length === 0) return null
  const ultimo = valores[valores.length - 1]
  if (valores.length === 1) {
    return { estado: 'unico', delta: 0, porcentaje: null, ultimo, anterior: null }
  }
  const anterior = valores[valores.length - 2]
  const delta = ultimo - anterior
  const porcentaje = anterior > 0 ? Math.round((delta / anterior) * 100) : null
  const estado = delta > 0 ? 'sube' : delta < 0 ? 'baja' : 'igual'
  return { estado, delta, porcentaje, ultimo, anterior }
}

function BadgeTendencia({ tendencia }: { tendencia: TendenciaInfo | null }) {
  if (!tendencia) return null
  if (tendencia.estado === 'unico') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-slate-200 bg-slate-50 text-slate-600 text-[11px] font-semibold">
        <Minus className="w-3 h-3" />
        1 registro ({tendencia.ultimo} mL) · agrega otro para tendencia
      </span>
    )
  }
  if (tendencia.estado === 'sube') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-red-200 bg-red-50 text-red-700 text-[11px] font-bold tabular-nums">
        <TrendingUp className="w-3.5 h-3.5" />
        Aumentando (+{tendencia.delta} mL
        {tendencia.porcentaje !== null ? ` · +${tendencia.porcentaje}%` : ''} vs anterior)
      </span>
    )
  }
  if (tendencia.estado === 'baja') {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-emerald-200 bg-emerald-50 text-emerald-700 text-[11px] font-bold tabular-nums">
        <TrendingDown className="w-3.5 h-3.5" />
        Disminuyendo ({tendencia.delta} mL
        {tendencia.porcentaje !== null ? ` · ${tendencia.porcentaje}%` : ''} vs anterior)
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-slate-200 bg-slate-100 text-slate-700 text-[11px] font-bold tabular-nums">
      <Minus className="w-3.5 h-3.5" />
      Estable (0 mL vs anterior)
    </span>
  )
}

type PuntoGrafica = {
  xTs: number
  label: string
  valor: number
}

function GraficaDrenajes({ drenajes }: { drenajes: EpisodeDrainItem[] }) {
  const conDatos = drenajes.filter((d) => d.entries.length > 0)
  const [modo, setModo] = useState<'registro' | 'diario'>('registro')
  const [seleccion, setSeleccion] = useState<string>('todos')

  if (conDatos.length === 0) {
    return (
      <div className="bg-orange-50/40 border border-dashed border-orange-200 rounded-xl p-4 flex items-center gap-2.5 text-xs text-slate-600">
        <BarChart3 className="w-4 h-4 text-orange-500 shrink-0" />
        <span>
          La gráfica de tendencia de drenajes aparecerá automáticamente cuando registres al menos un débito en mL para ver si aumenta o disminuye.
        </span>
      </div>
    )
  }

  const drenajesSeleccionados =
    seleccion === 'todos'
      ? conDatos
      : conDatos.filter((d) => d.id === seleccion)

  const drenajesGrafica = drenajesSeleccionados.length > 0 ? drenajesSeleccionados : conDatos
  const filtroActivo = drenajesSeleccionados.length > 0 ? seleccion : 'todos'

  const series = drenajesGrafica.map((drain, idx) => {
    const color = COLORES_SERIE[conDatos.findIndex((d) => d.id === drain.id) % COLORES_SERIE.length]
    const cronologicos = [...drain.entries].sort(
      (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
    )

    let puntos: PuntoGrafica[] = []
    if (modo === 'registro') {
      puntos = cronologicos.map((e) => ({
        xTs: new Date(e.recordedAt).getTime(),
        label: fmtHoraCorta(e.recordedAt),
        valor: e.volumeMl,
      }))
    } else {
      const porDia = new Map<string, number>()
      cronologicos.forEach((e) => {
        const dia = fmtDiaClave(e.recordedAt)
        porDia.set(dia, (porDia.get(dia) ?? 0) + e.volumeMl)
      })
      puntos = Array.from(porDia.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([dia, total]) => ({
          xTs: new Date(`${dia}T12:00:00-04:00`).getTime(),
          label: fmtDiaCorto(dia),
          valor: total,
        }))
    }

    const tendencia = calcularTendencia(puntos.map((p) => p.valor))
    return {
      id: drain.id,
      name: drain.name + (drain.isActive ? '' : ' (retirado)'),
      color: color ?? '#ea580c',
      puntos,
      tendencia,
      idxGlobal: idx,
    }
  })

  // Para la tendencia principal: si hay 1 drenaje seleccionado usamos su tendencia;
  // si están todos, sumamos por día o comparamos la serie total combinada por toma/día.
  let tendenciaPrincipal: TendenciaInfo | null = null
  if (series.length === 1) {
    tendenciaPrincipal = series[0].tendencia
  } else if (modo === 'diario') {
    const mapaTotal = new Map<number, number>()
    series.forEach((s) =>
      s.puntos.forEach((p) => mapaTotal.set(p.xTs, (mapaTotal.get(p.xTs) ?? 0) + p.valor))
    )
    const valoresTotales = Array.from(mapaTotal.entries())
      .sort(([a], [b]) => a - b)
      .map(([, v]) => v)
    tendenciaPrincipal = calcularTendencia(valoresTotales)
  } else {
    const todosCronologicos = drenajesGrafica
      .flatMap((d) => d.entries)
      .sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime())
      .map((e) => e.volumeMl)
    tendenciaPrincipal = calcularTendencia(todosCronologicos)
  }

  const todosPuntos = series.flatMap((s) => s.puntos)
  const minVal = 0
  const maxRaw = Math.max(...todosPuntos.map((p) => p.valor), 10)
  const maxVal = Math.ceil((maxRaw * 1.18) / 10) * 10 || 50

  const allTs = todosPuntos.map((p) => p.xTs)
  const minTs = Math.min(...allTs)
  const maxTs = Math.max(...allTs)

  const W = 680
  const H = 220
  const padIzq = 54
  const padDer = 28
  const padArr = 28
  const padAba = 32
  const innerW = W - padIzq - padDer
  const innerH = H - padArr - padAba

  const getX = (xTs: number, idxEnSerie: number, lenEnSerie: number) => {
    if (maxTs === minTs) {
      if (lenEnSerie <= 1) return padIzq + innerW / 2
      return padIzq + (idxEnSerie * innerW) / (lenEnSerie - 1)
    }
    return padIzq + ((xTs - minTs) / (maxTs - minTs)) * innerW
  }

  const getY = (val: number) =>
    padArr + ((maxVal - val) / (maxVal - minVal)) * innerH

  const ticksY = [0, Math.round(maxVal * 0.33), Math.round(maxVal * 0.66), maxVal]
  const todosValores = todosPuntos.map((p) => p.valor)
  const minDato = Math.min(...todosValores)
  const maxDato = Math.max(...todosValores)

  const primeraEtiqueta = [...todosPuntos].sort((a, b) => a.xTs - b.xTs)[0]?.label ?? ''
  const ultimaEtiqueta =
    [...todosPuntos].sort((a, b) => a.xTs - b.xTs)[todosPuntos.length - 1]?.label ?? ''

  return (
    <div className="bg-slate-50/70 border border-orange-200 rounded-xl p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <BarChart3 className="w-4 h-4 text-orange-600" />
          <h3 className="text-sm font-bold text-slate-900">
            Gráfica de Tendencia de Drenajes (mL)
          </h3>
          <BadgeTendencia tendencia={tendenciaPrincipal} />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5">
            <button
              type="button"
              onClick={() => setModo('registro')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer transition-colors ${
                modo === 'registro'
                  ? 'bg-orange-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Por registro
            </button>
            <button
              type="button"
              onClick={() => setModo('diario')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer transition-colors ${
                modo === 'diario'
                  ? 'bg-orange-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Total por día
            </button>
          </div>

          {conDatos.length > 1 && (
            <select
              value={filtroActivo}
              onChange={(e) => setSeleccion(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-[11px] font-bold bg-white text-slate-800"
            >
              <option value="todos">Todos los drenajes ({conDatos.length})</option>
              {conDatos.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                  {d.location ? ` (${d.location})` : ''}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 mb-2">
          <span>
            {modo === 'registro'
              ? 'Evolución cronológica de cada registro (mL)'
              : 'Débito acumulado por día calendario (mL/día)'}
          </span>
          <span className="tabular-nums">
            Mín: <strong className="text-slate-800">{minDato} mL</strong> · Máx:{' '}
            <strong className="text-slate-800">{maxDato} mL</strong>
          </span>
        </div>

        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none overflow-visible" role="img">
          {ticksY.map((t, idx) => (
            <g key={idx}>
              <line
                x1={padIzq}
                y1={getY(t)}
                x2={W - padDer}
                y2={getY(t)}
                stroke={t === 0 ? '#cbd5e1' : '#f1f5f9'}
                strokeWidth="1.5"
              />
              <text
                x={padIzq - 8}
                y={getY(t) + 3.5}
                textAnchor="end"
                fontSize="10"
                fill="#64748b"
                fontFamily="monospace"
              >
                {t}
              </text>
            </g>
          ))}

          {primeraEtiqueta && (
            <text x={padIzq} y={H - 8} fontSize="10" fill="#64748b" textAnchor="start">
              {primeraEtiqueta}
            </text>
          )}
          {ultimaEtiqueta && ultimaEtiqueta !== primeraEtiqueta && (
            <text x={W - padDer} y={H - 8} fontSize="10" fill="#64748b" textAnchor="end">
              {ultimaEtiqueta}
            </text>
          )}

          {series.map((s) => {
            const coords = s.puntos.map((p, idx) => ({
              x: getX(p.xTs, idx, s.puntos.length),
              y: getY(p.valor),
              valor: p.valor,
              label: p.label,
            }))
            const poly = coords.map((c) => `${c.x},${c.y}`).join(' ')
            const mostrarBadges = series.length === 1 || coords.length <= 8

            return (
              <g key={s.id}>
                {coords.length >= 2 && (
                  <polyline
                    points={poly}
                    fill="none"
                    stroke={s.color}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}
                {coords.map((c, i) => (
                  <g key={i}>
                    <circle
                      cx={c.x}
                      cy={c.y}
                      r={4.5}
                      fill={s.color}
                      stroke="#ffffff"
                      strokeWidth="2"
                    >
                      <title>{`${s.name}: ${c.valor} mL (${c.label})`}</title>
                    </circle>
                    {mostrarBadges && (
                      <>
                        <rect
                          x={c.x - 16}
                          y={c.y - 20}
                          width={32}
                          height={14}
                          rx={3}
                          fill="#ffffff"
                          stroke={s.color}
                          strokeWidth="1"
                        />
                        <text
                          x={c.x}
                          y={c.y - 10}
                          textAnchor="middle"
                          fontSize="9.5"
                          fontWeight="bold"
                          fill="#0f172a"
                        >
                          {c.valor}
                        </text>
                      </>
                    )}
                  </g>
                ))}
              </g>
            )
          })}
        </svg>

        {/* Leyenda con tendencia individual por drenaje */}
        <div className="flex flex-wrap gap-2 pt-2 mt-2 border-t border-slate-100">
          {series.map((s) => {
            const t = s.tendencia
            return (
              <div
                key={s.id}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-[11px]"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: s.color }}
                />
                <span className="font-bold text-slate-800">{s.name}:</span>
                <span className="font-semibold text-slate-700 tabular-nums">
                  {t ? `${t.ultimo} mL` : '—'}
                </span>
                {t?.estado === 'sube' && (
                  <span className="text-red-700 font-bold tabular-nums">
                    (↑ +{t.delta} mL)
                  </span>
                )}
                {t?.estado === 'baja' && (
                  <span className="text-emerald-700 font-bold tabular-nums">
                    (↓ {t.delta} mL)
                  </span>
                )}
                {t?.estado === 'igual' && (
                  <span className="text-slate-500 font-semibold">(→ 0 mL)</span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export function ControlDrenajes({
  episodeId,
  drenajes,
  nombres,
  roles,
  puedeRegistrar,
  ahoraIso,
}: {
  episodeId: string
  drenajes: EpisodeDrainItem[]
  nombres: Record<string, string>
  roles: Record<string, string>
  puedeRegistrar: boolean
  ahoraIso: string
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [mostrarNuevo, setMostrarNuevo] = useState(false)
  const [nombreNuevo, setNombreNuevo] = useState('')
  const [ubicacionNueva, setUbicacionNueva] = useState('')
  const [debitoInicial, setDebitoInicial] = useState('')
  const [caracteristicaInicial, setCaracteristicaInicial] = useState('')

  const [debitoPorDrenaje, setDebitoPorDrenaje] = useState<Record<string, string>>({})
  const [caractPorDrenaje, setCaractPorDrenaje] = useState<Record<string, string>>({})
  const [historialExpandido, setHistorialExpandido] = useState<Record<string, boolean>>({})
  const [editandoEntradaId, setEditandoEntradaId] = useState<string | null>(null)
  const [editMl, setEditMl] = useState('')
  const [editCaract, setEditCaract] = useState('')
  const [confirmRetiroId, setConfirmRetiroId] = useState<string | null>(null)
  const [verRetirados, setVerRetirados] = useState(false)
  const [mensaje, setMensaje] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null)

  const corte24hMs = new Date(ahoraIso).getTime() - 24 * 60 * 60 * 1000

  const activos = drenajes.filter((d) => d.isActive)
  const retirados = drenajes.filter((d) => !d.isActive)

  const sumarTotal = (entries: DrainEntryItem[]) =>
    entries.reduce((acc, e) => acc + e.volumeMl, 0)

  const sumar24h = (entries: DrainEntryItem[]) =>
    entries
      .filter((e) => new Date(e.recordedAt).getTime() >= corte24hMs)
      .reduce((acc, e) => acc + e.volumeMl, 0)

  const totalActivosMl = activos.reduce((acc, d) => acc + sumarTotal(d.entries), 0)
  const total24hActivosMl = activos.reduce((acc, d) => acc + sumar24h(d.entries), 0)
  const totalGeneralMl = drenajes.reduce((acc, d) => acc + sumarTotal(d.entries), 0)

  const autorLabel = (email: string) => {
    const nombre = nombres[email] ?? email
    const rol = roles[email] ? ETIQUETAS_ROL[roles[email]] ?? roles[email] : ''
    return rol ? `${nombre} (${rol})` : nombre
  }

  const handleAgregarDrenaje = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMensaje(null)
    const fd = new FormData()
    fd.set('episodeId', episodeId)
    fd.set('name', nombreNuevo.trim())
    fd.set('location', ubicacionNueva.trim())
    fd.set('initialVolumeMl', debitoInicial.trim())
    fd.set('characteristic', caracteristicaInicial.trim())

    startTransition(async () => {
      const res = await agregarDrenaje(fd)
      if (!res.ok) {
        setMensaje({ tipo: 'error', texto: res.error ?? 'No se pudo agregar el drenaje.' })
        return
      }
      setNombreNuevo('')
      setUbicacionNueva('')
      setDebitoInicial('')
      setCaracteristicaInicial('')
      setMostrarNuevo(false)
      setMensaje({ tipo: 'ok', texto: 'Drenaje agregado al control independiente.' })
      router.refresh()
    })
  }

  const handleRegistrarDebito = (drainId: string, drainName: string) => {
    setMensaje(null)
    const ml = (debitoPorDrenaje[drainId] ?? '').trim()
    if (!ml) {
      setMensaje({ tipo: 'error', texto: `Ingresa los mL para ${drainName}.` })
      return
    }
    const fd = new FormData()
    fd.set('episodeId', episodeId)
    fd.set('drainId', drainId)
    fd.set('volumeMl', ml)
    fd.set('characteristic', (caractPorDrenaje[drainId] ?? '').trim())

    startTransition(async () => {
      const res = await registrarDebitoDrenaje(fd)
      if (!res.ok) {
        setMensaje({ tipo: 'error', texto: res.error ?? 'No se pudo registrar el débito.' })
        return
      }
      setDebitoPorDrenaje((prev) => ({ ...prev, [drainId]: '' }))
      setCaractPorDrenaje((prev) => ({ ...prev, [drainId]: '' }))
      setMensaje({ tipo: 'ok', texto: `Débito registrado en ${drainName} (${ml} mL).` })
      router.refresh()
    })
  }

  const handleEditarEntrada = (entryId: string) => {
    setMensaje(null)
    const fd = new FormData()
    fd.set('episodeId', episodeId)
    fd.set('entryId', entryId)
    fd.set('volumeMl', editMl.trim())
    fd.set('characteristic', editCaract.trim())

    startTransition(async () => {
      const res = await editarDebitoDrenaje(fd)
      if (!res.ok) {
        setMensaje({ tipo: 'error', texto: res.error ?? 'No se pudo editar el registro.' })
        return
      }
      setEditandoEntradaId(null)
      setEditMl('')
      setEditCaract('')
      router.refresh()
    })
  }

  const handleRetirarDrenaje = (drainId: string, drainName: string) => {
    setMensaje(null)
    const fd = new FormData()
    fd.set('episodeId', episodeId)
    fd.set('drainId', drainId)

    startTransition(async () => {
      const res = await retirarDrenaje(fd)
      if (!res.ok) {
        setMensaje({ tipo: 'error', texto: res.error ?? 'No se pudo retirar el drenaje.' })
        return
      }
      setConfirmRetiroId(null)
      setMensaje({
        tipo: 'ok',
        texto: `${drainName} marcado como retirado (se conserva su acumulado histórico).`,
      })
      router.refresh()
    })
  }

  return (
    <section className="bg-white p-5 sm:p-6 rounded-xl shadow-sm border border-orange-200 space-y-4 print:hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-orange-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Droplets className="w-5 h-5 text-orange-600" />
            <h2 className="text-lg font-bold text-slate-800">
              Control Independiente de Drenajes ({activos.length})
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Contabilidad independiente en mL por cada sonda o drenaje quirúrgico, separado de los signos vitales.
          </p>
        </div>

        {puedeRegistrar && (
          <button
            type="button"
            onClick={() => setMostrarNuevo((v) => !v)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{mostrarNuevo ? 'Cerrar' : 'Agregar Drenaje'}</span>
          </button>
        )}
      </div>

      {/* RESUMEN GENERAL DE DRENAJES */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-orange-50/70 border border-orange-200 rounded-lg px-3.5 py-2.5">
          <p className="text-[11px] font-semibold text-orange-900">Drenajes activos</p>
          <p className="text-xl font-black text-orange-950 tabular-nums mt-0.5">{activos.length}</p>
        </div>
        <div className="bg-orange-50/70 border border-orange-200 rounded-lg px-3.5 py-2.5">
          <p className="text-[11px] font-semibold text-orange-900">Débito últimas 24h (activos)</p>
          <p className="text-xl font-black text-orange-950 tabular-nums mt-0.5">
            {total24hActivosMl} mL
          </p>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5">
          <p className="text-[11px] font-semibold text-slate-600">
            Acumulado {retirados.length > 0 ? 'activos / total episodio' : 'total del episodio'}
          </p>
          <p className="text-xl font-black text-slate-900 tabular-nums mt-0.5">
            {totalActivosMl} mL
            {retirados.length > 0 && (
              <span className="text-xs font-semibold text-slate-500 ml-1.5">
                ({totalGeneralMl} mL hist.)
              </span>
            )}
          </p>
        </div>
      </div>

      {/* GRÁFICA DE TENDENCIA DE DRENAJES (AUMENTA / DISMINUYE) */}
      <GraficaDrenajes drenajes={drenajes} />

      {mensaje && (
        <div
          className={`px-3.5 py-2 rounded-lg border text-xs font-medium flex items-center justify-between gap-2 ${
            mensaje.tipo === 'ok'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <span>{mensaje.texto}</span>
          <button type="button" onClick={() => setMensaje(null)} className="cursor-pointer opacity-70">
            ✕
          </button>
        </div>
      )}

      {/* FORMULARIO AGREGAR NUEVO DRENAJE */}
      {puedeRegistrar && mostrarNuevo && (
        <form
          onSubmit={handleAgregarDrenaje}
          className="bg-orange-50/50 border border-orange-200 rounded-xl p-4 space-y-3"
        >
          <p className="text-xs font-bold text-orange-950">Nuevo drenaje o sonda</p>

          <div className="flex flex-wrap gap-1.5">
            {PRESETS_DRENAJES.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setNombreNuevo(preset)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border cursor-pointer transition-colors ${
                  nombreNuevo === preset
                    ? 'bg-orange-600 text-white border-orange-700'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-orange-100'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Nombre del drenaje *
              </label>
              <input
                value={nombreNuevo}
                onChange={(e) => setNombreNuevo(e.target.value)}
                required
                placeholder="Ej. Sonda pleural, Drenaje abdominal"
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-900"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Ubicación / lado (opcional)
              </label>
              <input
                value={ubicacionNueva}
                onChange={(e) => setUbicacionNueva(e.target.value)}
                placeholder="Ej. Hemitórax derecho, FID"
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-900"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Débito inicial mL (opcional)
              </label>
              <input
                type="number"
                min={0}
                max={20000}
                value={debitoInicial}
                onChange={(e) => setDebitoInicial(e.target.value)}
                placeholder="Ej. 120"
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 tabular-nums"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Característica (opcional)
              </label>
              <input
                value={caracteristicaInicial}
                onChange={(e) => setCaracteristicaInicial(e.target.value)}
                placeholder="Ej. Serohemático, bilioso"
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-900"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setMostrarNuevo(false)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-600 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold cursor-pointer"
            >
              {isPending ? 'Guardando...' : 'Crear Drenaje'}
            </button>
          </div>
        </form>
      )}

      {/* TARJETAS INDEPENDIENTES POR CADA DRENAJE ACTIVO */}
      {activos.length === 0 ? (
        <div className="text-center py-6 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-xs text-slate-500">
          No hay drenajes activos registrados en este paciente. Usa &quot;Agregar Drenaje&quot; para llevar el conteo independiente en mL de cada sonda o drenaje.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activos.map((drain) => {
            const totalMl = sumarTotal(drain.entries)
            const total24hMl = sumar24h(drain.entries)
            const cronologicos = [...drain.entries].sort(
              (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
            )
            const tend = calcularTendencia(cronologicos.map((e) => e.volumeMl))
            const expandido = !!historialExpandido[drain.id]
            const visibles = expandido ? drain.entries : drain.entries.slice(0, 3)

            return (
              <div
                key={drain.id}
                className="bg-slate-50/70 border border-orange-200 rounded-xl p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <h3 className="text-sm font-extrabold text-slate-900">{drain.name}</h3>
                      {drain.location && (
                        <span className="text-[11px] font-semibold bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded">
                          {drain.location}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Colocado por {autorLabel(drain.createdBy)} · {fmtFechaHora(drain.createdAt)}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="bg-orange-600 text-white px-2.5 py-1 rounded-lg text-xs font-black tabular-nums">
                      Total: {totalMl} mL
                    </div>
                    <p className="text-[11px] font-bold text-orange-800 mt-1 tabular-nums">
                      24h: {total24hMl} mL · {drain.entries.length} reg.
                    </p>
                    {tend && tend.estado !== 'unico' && (
                      <p
                        className={`text-[10px] font-bold mt-0.5 tabular-nums ${
                          tend.estado === 'sube'
                            ? 'text-red-700'
                            : tend.estado === 'baja'
                              ? 'text-emerald-700'
                              : 'text-slate-500'
                        }`}
                      >
                        {tend.estado === 'sube'
                          ? `↑ Aumentó +${tend.delta} mL`
                          : tend.estado === 'baja'
                            ? `↓ Disminuyó ${tend.delta} mL`
                            : '→ Estable (0 mL)'}
                      </p>
                    )}
                  </div>
                </div>

                {/* AGREGAR DÉBITO INDEPENDIENTE A ESTE DRENAJE */}
                {puedeRegistrar && (
                  <div className="bg-white border border-orange-200/80 rounded-lg p-2.5 space-y-2">
                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-1.5">
                      <input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        max={20000}
                        value={debitoPorDrenaje[drain.id] ?? ''}
                        onChange={(e) =>
                          setDebitoPorDrenaje((prev) => ({ ...prev, [drain.id]: e.target.value }))
                        }
                        placeholder="mL"
                        className="w-20 px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 tabular-nums"
                      />
                      <input
                        type="text"
                        value={caractPorDrenaje[drain.id] ?? ''}
                        onChange={(e) =>
                          setCaractPorDrenaje((prev) => ({ ...prev, [drain.id]: e.target.value }))
                        }
                        placeholder="Característica (ej. serohemático)"
                        className="flex-1 min-w-0 px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900"
                      />
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleRegistrarDebito(drain.id, drain.name)}
                        className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold whitespace-nowrap cursor-pointer"
                      >
                        + Sumar mL
                      </button>
                    </div>
                  </div>
                )}

                {/* HISTORIAL DE DÉBITOS DE ESTE DRENAJE */}
                {drain.entries.length > 0 ? (
                  <div className="space-y-1.5">
                    {visibles.map((entry) => {
                      const editandoEsta = editandoEntradaId === entry.id
                      return (
                        <div
                          key={entry.id}
                          className="bg-white border border-slate-200 rounded-lg px-2.5 py-2 text-xs space-y-1.5"
                        >
                          {!editandoEsta ? (
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span className="font-extrabold text-orange-800 tabular-nums">
                                    +{entry.volumeMl} mL
                                  </span>
                                  {entry.characteristic && (
                                    <span className="text-slate-700 font-medium">
                                      · {entry.characteristic}
                                    </span>
                                  )}
                                </div>
                                <p className="text-[10px] text-slate-500 mt-0.5 flex flex-wrap items-center gap-x-2">
                                  <span>{autorLabel(entry.recordedBy)}</span>
                                  <span className="inline-flex items-center gap-0.5 tabular-nums">
                                    <Clock className="w-2.5 h-2.5" />
                                    {fmtFechaHora(entry.recordedAt)}
                                  </span>
                                  {entry.updatedBy && (
                                    <span className="text-amber-700 font-medium">
                                      (Editado por {nombres[entry.updatedBy] ?? entry.updatedBy})
                                    </span>
                                  )}
                                </p>
                              </div>

                              {puedeRegistrar && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditandoEntradaId(entry.id)
                                    setEditMl(String(entry.volumeMl))
                                    setEditCaract(entry.characteristic ?? '')
                                  }}
                                  title="Corregir registro"
                                  className="text-slate-400 hover:text-blue-600 p-1 cursor-pointer shrink-0"
                                >
                                  <Pencil className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          ) : (
                            <div className="flex flex-wrap items-center gap-1.5">
                              <input
                                type="number"
                                min={0}
                                max={20000}
                                value={editMl}
                                onChange={(e) => setEditMl(e.target.value)}
                                className="w-20 px-2 py-1 border rounded text-xs font-bold tabular-nums"
                              />
                              <input
                                type="text"
                                value={editCaract}
                                onChange={(e) => setEditCaract(e.target.value)}
                                placeholder="Característica"
                                className="flex-1 min-w-24 px-2 py-1 border rounded text-xs"
                              />
                              <button
                                type="button"
                                disabled={isPending}
                                onClick={() => handleEditarEntrada(entry.id)}
                                className="p-1.5 rounded bg-slate-800 text-white cursor-pointer"
                                title="Guardar"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditandoEntradaId(null)}
                                className="p-1.5 rounded border border-slate-300 text-slate-600 cursor-pointer"
                                title="Cancelar"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 italic">
                    Aún no hay débitos registrados para este drenaje.
                  </p>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200">
                  {drain.entries.length > 3 ? (
                    <button
                      type="button"
                      onClick={() =>
                        setHistorialExpandido((prev) => ({ ...prev, [drain.id]: !prev[drain.id] }))
                      }
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                    >
                      {expandido ? (
                        <>
                          <ChevronUp className="w-3 h-3" /> Ver menos
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3 h-3" /> Ver todos ({drain.entries.length})
                        </>
                      )}
                    </button>
                  ) : (
                    <span />
                  )}

                  {puedeRegistrar &&
                    (confirmRetiroId === drain.id ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-red-700 font-semibold">¿Retirar?</span>
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleRetirarDrenaje(drain.id, drain.name)}
                          className="px-2 py-0.5 rounded bg-red-600 text-white text-[11px] font-bold cursor-pointer"
                        >
                          Sí, retirar
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmRetiroId(null)}
                          className="px-2 py-0.5 rounded border border-slate-300 text-[11px] text-slate-600 cursor-pointer"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmRetiroId(drain.id)}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 hover:text-red-800 cursor-pointer"
                      >
                        <Archive className="w-3 h-3" />
                        <span>Retirar drenaje</span>
                      </button>
                    ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* DRENAJES RETIRADOS (HISTORIAL PRESERVADO) */}
      {retirados.length > 0 && (
        <div className="pt-2 border-t border-slate-200">
          <button
            type="button"
            onClick={() => setVerRetirados((v) => !v)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            {verRetirados ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            <span>Drenajes retirados ({retirados.length})</span>
          </button>

          {verRetirados && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              {retirados.map((drain) => {
                const totalMl = sumarTotal(drain.entries)
                return (
                  <div
                    key={drain.id}
                    className="bg-slate-100/70 border border-slate-200 rounded-lg px-3.5 py-2.5 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-800">
                        {drain.name}
                        {drain.location ? ` (${drain.location})` : ''}
                      </span>
                      <span className="font-extrabold text-slate-700 tabular-nums">
                        Acumulado: {totalMl} mL
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {drain.entries.length} registro(s) · Retirado{' '}
                      {drain.removedBy ? `por ${autorLabel(drain.removedBy)}` : ''}
                      {drain.removedAt ? ` · ${fmtFechaHora(drain.removedAt)}` : ''}
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </section>
  )
}
