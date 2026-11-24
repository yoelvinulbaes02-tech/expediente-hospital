'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, CopyPlus, Lock, PlusCircle } from 'lucide-react'
import type {
  BloqueSeccionConsulta,
  HistorialVisitaResumen,
  SeccionConsultaKey,
} from '@/lib/consultas-auth'
import {
  agregarBloqueSeccionConsulta,
  guardarConsultaClinica,
  iniciarNuevaAtencionConsulta,
} from '@/app/dashboard/consultas/actions'

type ConsultaEditable = {
  id: string
  status: string
  visitType: string
  chiefComplaint: string
  bloodPressure: string | null
  heartRate: number | null
  temperature: number | null
  oxygenSat: number | null
  weight: number | null
  weightUnit: string | null
  heightCm: number | null
  historyIllness: string | null
  physicalExam: string | null
  diagnosis: string | null
  treatmentPlan: string | null
  labOrders: string | null
  nextAppointment: string | null
  notes: string | null
}

type RegistroHistorico = {
  id: string
  fechaIso: string
  autor: string
  etiqueta?: string
  contenido: string
}

function fmtFechaHora(iso: string) {
  return new Date(iso).toLocaleString('es-DO', {
    timeZone: 'America/Santo_Domingo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function AcapiteRetraible({
  titulo,
  seccion,
  historicos,
  puedeDuplicar,
  abiertoPorDefecto = true,
  duplicadorAbierto,
  onToggleDuplicador,
  consultationId,
  onBloqueGuardado,
  children,
}: {
  titulo: string
  seccion: SeccionConsultaKey
  historicos: RegistroHistorico[]
  puedeDuplicar: boolean
  abiertoPorDefecto?: boolean
  duplicadorAbierto: boolean
  onToggleDuplicador: () => void
  consultationId: string
  onBloqueGuardado: (msg: string) => void
  children: React.ReactNode
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [guardandoBloque, setGuardandoBloque] = useState(false)
  const [errorBloque, setErrorBloque] = useState<string | null>(null)

  const handleGuardarBloque = async () => {
    if (!containerRef.current) return
    const fd = new FormData()
    fd.set('consultationId', consultationId)
    fd.set('seccion', seccion)

    const campos = containerRef.current.querySelectorAll<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >('[data-field]')
    campos.forEach((el) => {
      const key = el.dataset.field
      if (key) {
        fd.set(key, el.value)
      }
    })

    setGuardandoBloque(true)
    setErrorBloque(null)
    try {
      const res = await agregarBloqueSeccionConsulta(fd)
      if (!res.ok) {
        setErrorBloque(res.error ?? 'No se pudo guardar el nuevo bloque.')
        return
      }
      campos.forEach((el) => {
        if (el.tagName === 'SELECT') {
          if (el.dataset.field === 'weightUnit') el.value = 'kg'
          if (el.dataset.field === 'visitType') el.value = 'Seguimiento'
        } else {
          el.value = ''
        }
      })
      onToggleDuplicador()
      onBloqueGuardado(`Nuevo registro agregado en "${titulo}" sin alterar los anteriores.`)
    } finally {
      setGuardandoBloque(false)
    }
  }

  return (
    <details
      open={abiertoPorDefecto}
      className="group rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/40 dark:bg-slate-900/30 p-4"
    >
      <summary className="list-none cursor-pointer flex flex-wrap items-center justify-between gap-2 [&::-webkit-details-marker]:hidden">
        <div className="flex items-center gap-2 min-w-0">
          <ChevronDown className="w-4 h-4 text-slate-500 transition-transform group-open:rotate-0 -rotate-90 shrink-0" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
            {titulo}
          </h3>
          {historicos.length > 0 && (
            <span className="px-2 py-0.5 rounded-md bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[10px] font-bold tabular-nums">
              {historicos.length} previo{historicos.length === 1 ? '' : 's'}
            </span>
          )}
        </div>

        {puedeDuplicar && (
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              setErrorBloque(null)
              onToggleDuplicador()
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-900/30 hover:bg-teal-100 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-[11px] font-bold cursor-pointer whitespace-nowrap print:hidden"
          >
            <CopyPlus className="w-3.5 h-3.5" />
            <span>{duplicadorAbierto ? 'Cerrar nuevo bloque' : 'Duplicar / Nuevo'}</span>
          </button>
        )}
      </summary>

      <div className="mt-3 space-y-3">
        {/* HISTORIAL PREVIO RETRAÍBLE Y SOLO LECTURA */}
        {historicos.length > 0 && (
          <details className="group/hist rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 px-3 py-2">
            <summary className="list-none cursor-pointer flex items-center justify-between gap-2 text-[11px] font-bold text-slate-600 dark:text-slate-300 [&::-webkit-details-marker]:hidden">
              <span className="inline-flex items-center gap-1.5">
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 transition-transform group-open/hist:rotate-0 -rotate-90" />
                <span>Ver registros anteriores ({historicos.length}) · Solo lectura</span>
              </span>
              <Lock className="w-3 h-3 text-slate-400" />
            </summary>

            <div className="mt-2.5 space-y-2 border-t border-slate-100 dark:border-slate-700 pt-2">
              {historicos.map((h) => (
                <details
                  key={h.id}
                  open
                  className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 px-3 py-2"
                >
                  <summary className="list-none cursor-pointer flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600 dark:text-slate-300 [&::-webkit-details-marker]:hidden">
                    <span className="font-bold text-slate-800 dark:text-slate-100 tabular-nums">
                      {fmtFechaHora(h.fechaIso)}
                      {h.etiqueta ? ` · ${h.etiqueta}` : ''}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500">
                      <Lock className="w-3 h-3" />
                      {h.autor}
                    </span>
                  </summary>
                  <p className="mt-1.5 pt-1.5 border-t border-slate-200/70 dark:border-slate-700/70 text-xs text-slate-700 dark:text-slate-200 whitespace-pre-wrap">
                    {h.contenido}
                  </p>
                </details>
              ))}
            </div>
          </details>
        )}

        {/* BLOQUE INDEPENDIENTE PARA DUPLICAR / AGREGAR SIN ALTERAR ANTERIORES */}
        {puedeDuplicar && duplicadorAbierto && (
          <div
            ref={containerRef}
            className="rounded-lg border border-teal-300 dark:border-teal-700 bg-teal-50/50 dark:bg-teal-950/20 p-3.5 space-y-3 print:hidden"
          >
            <p className="text-[11px] font-bold text-teal-900 dark:text-teal-200">
              Nuevo registro independiente en &ldquo;{titulo}&rdquo; (no modifica los anteriores)
            </p>
            {errorBloque && (
              <div className="px-3 py-2 rounded border border-red-200 bg-red-50 text-red-800 text-xs font-medium">
                {errorBloque}
              </div>
            )}

            <div className="space-y-3">
              {seccion === 'signos' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                  <input
                    data-field="bloodPressure"
                    placeholder="TA (120/80)"
                    className="w-full px-2.5 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                  <input
                    data-field="heartRate"
                    type="number"
                    placeholder="FC (lpm)"
                    className="w-full px-2.5 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                  <input
                    data-field="temperature"
                    type="number"
                    step="0.1"
                    placeholder="Temp (°C)"
                    className="w-full px-2.5 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                  <input
                    data-field="oxygenSat"
                    type="number"
                    placeholder="SpO2 (%)"
                    className="w-full px-2.5 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                  <div className="flex gap-1">
                    <input
                      data-field="weight"
                      type="number"
                      step="0.1"
                      placeholder="Peso"
                      className="w-full px-2 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                    <select
                      data-field="weightUnit"
                      defaultValue="kg"
                      className="px-1.5 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-700"
                    >
                      <option value="kg">kg</option>
                      <option value="lb">lb</option>
                    </select>
                  </div>
                  <input
                    data-field="heightCm"
                    type="number"
                    step="0.5"
                    placeholder="Talla (cm)"
                    className="w-full px-2.5 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              ) : seccion === 'motivo' ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <select
                    data-field="visitType"
                    defaultValue="Seguimiento"
                    className="w-full px-2.5 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    <option value="Seguimiento">Seguimiento</option>
                    <option value="Control de resultados">Control de resultados</option>
                    <option value="Urgencia ambulatoria">Urgencia ambulatoria</option>
                    <option value="Primera vez">Primera vez</option>
                  </select>
                  <input
                    data-field="chiefComplaint"
                    placeholder="Nuevo motivo de consulta..."
                    className="sm:col-span-2 w-full px-2.5 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              ) : (
                <textarea
                  data-field="contenido"
                  rows={3}
                  placeholder={`Escribe el nuevo registro para ${titulo.toLowerCase()}...`}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onToggleDuplicador}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={guardandoBloque}
                  onClick={handleGuardarBloque}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-50 cursor-pointer"
                >
                  {guardandoBloque ? 'Guardando...' : 'Guardar nuevo bloque'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CAMPOS ACTUALES DE ESTA VISITA */}
        {children}
      </div>
    </details>
  )
}

export function FormularioConsultaClinica({
  consulta,
  puedeEditar,
  puedeCrearNuevaAtencion = false,
  autorNotas,
  bloqueadoPorAutoria = false,
  historialVisitas = [],
  bloquesExtra = [],
}: {
  consulta: ConsultaEditable
  puedeEditar: boolean
  puedeCrearNuevaAtencion?: boolean
  autorNotas?: string | null
  bloqueadoPorAutoria?: boolean
  historialVisitas?: HistorialVisitaResumen[]
  bloquesExtra?: BloqueSeccionConsulta[]
}) {
  const router = useRouter()
  const [peso, setPeso] = useState(consulta.weight ? String(consulta.weight) : '')
  const [unidadPeso, setUnidadPeso] = useState(consulta.weightUnit ?? 'kg')
  const [tallaCm, setTallaCm] = useState(consulta.heightCm ? String(consulta.heightCm) : '')
  const [guardando, setGuardando] = useState<'guardar' | 'finalizar' | 'nueva' | null>(null)
  const [feedback, setFeedback] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null)
  const [duplicadoresAbiertos, setDuplicadoresAbiertos] = useState<Record<SeccionConsultaKey, boolean>>({
    signos: false,
    motivo: false,
    enfermedad: false,
    examen: false,
    diagnostico: false,
    receta: false,
    laboratorio: false,
    notas: false,
  })

  // Si la consulta ya está cerrada (COMPLETADA) o bloqueada por autoría, sus campos originales son de solo lectura.
  // Para escribir nuevos datos se duplican acápites o se inicia una nueva atención limpia.
  const esConsultaCerrada = consulta.status === 'COMPLETADA'
  const camposActualesEditables = puedeEditar && !esConsultaCerrada

  const toggleDuplicador = (sec: SeccionConsultaKey) => {
    setDuplicadoresAbiertos((prev) => ({ ...prev, [sec]: !prev[sec] }))
  }

  const calcularIMC = () => {
    const pNum = parseFloat(peso)
    const tNum = parseFloat(tallaCm)
    if (!pNum || !tNum || tNum <= 0) return null
    const pesoKg = unidadPeso === 'lb' ? pNum * 0.453592 : pNum
    const alturaM = tNum / 100
    const imc = pesoKg / (alturaM * alturaM)
    if (!isFinite(imc)) return null
    return imc.toFixed(1)
  }

  const imc = calcularIMC()

  const enviar = async (formData: FormData, accion: 'guardar' | 'finalizar') => {
    if (!camposActualesEditables) return
    formData.set('accion', accion)
    setGuardando(accion)
    setFeedback(null)
    try {
      const res = await guardarConsultaClinica(formData)
      if (!res.ok) {
        setFeedback({ tipo: 'error', texto: res.error ?? 'No se pudo guardar.' })
        return
      }
      if (res.finalizada) {
        router.push('/dashboard')
        router.refresh()
        return
      }
      setFeedback({
        tipo: 'ok',
        texto: 'Cambios de la consulta guardados correctamente.',
      })
      router.refresh()
    } finally {
      setGuardando(null)
    }
  }

  const handleIniciarNuevaAtencion = async () => {
    setGuardando('nueva')
    setFeedback(null)
    try {
      const res = await iniciarNuevaAtencionConsulta(consulta.id)
      if (!res.ok || !res.consultationId) {
        setFeedback({ tipo: 'error', texto: res.error ?? 'No se pudo crear la nueva atención.' })
        return
      }
      router.push(`/dashboard/consultas/${res.consultationId}`)
      router.refresh()
    } finally {
      setGuardando(null)
    }
  }

  const visitasPrevias = historialVisitas.filter((v) => v.id !== consulta.id)

  const obtenerHistoricosSeccion = (sec: SeccionConsultaKey): RegistroHistorico[] => {
    const items: RegistroHistorico[] = []

    for (const v of visitasPrevias) {
      const autor = v.doctorName || 'Médico tratante'
      if (sec === 'signos') {
        const partes = [
          v.bloodPressure ? `TA: ${v.bloodPressure}` : null,
          v.heartRate !== null ? `FC: ${v.heartRate} lpm` : null,
          v.temperature !== null ? `Temp: ${v.temperature} °C` : null,
          v.oxygenSat !== null ? `SpO2: ${v.oxygenSat}%` : null,
          v.weight !== null ? `Peso: ${v.weight} ${v.weightUnit ?? 'kg'}` : null,
          v.heightCm !== null ? `Talla: ${v.heightCm} cm` : null,
        ].filter(Boolean)
        if (partes.length > 0) {
          items.push({ id: `v-${v.id}-signos`, fechaIso: v.consultationDate, autor, contenido: partes.join(' · ') })
        }
      } else if (sec === 'motivo') {
        if (v.chiefComplaint?.trim()) {
          items.push({
            id: `v-${v.id}-motivo`,
            fechaIso: v.consultationDate,
            autor,
            etiqueta: v.visitType,
            contenido: v.chiefComplaint,
          })
        }
      } else if (sec === 'enfermedad' && v.historyIllness?.trim()) {
        items.push({ id: `v-${v.id}-enf`, fechaIso: v.consultationDate, autor, contenido: v.historyIllness })
      } else if (sec === 'examen' && v.physicalExam?.trim()) {
        items.push({ id: `v-${v.id}-ex`, fechaIso: v.consultationDate, autor, contenido: v.physicalExam })
      } else if (sec === 'diagnostico' && v.diagnosis?.trim()) {
        items.push({ id: `v-${v.id}-dx`, fechaIso: v.consultationDate, autor, contenido: v.diagnosis })
      } else if (sec === 'receta' && v.treatmentPlan?.trim()) {
        items.push({ id: `v-${v.id}-rx`, fechaIso: v.consultationDate, autor, contenido: v.treatmentPlan })
      } else if (sec === 'laboratorio' && v.labOrders?.trim()) {
        items.push({ id: `v-${v.id}-lab`, fechaIso: v.consultationDate, autor, contenido: v.labOrders })
      } else if (sec === 'notas' && v.notes?.trim()) {
        items.push({ id: `v-${v.id}-not`, fechaIso: v.consultationDate, autor, contenido: v.notes })
      }
    }

    for (const b of bloquesExtra) {
      if (b.seccion !== sec) continue
      if (sec === 'signos') {
        const partes = [
          b.bloodPressure ? `TA: ${b.bloodPressure}` : null,
          b.heartRate !== null && b.heartRate !== undefined ? `FC: ${b.heartRate} lpm` : null,
          b.temperature !== null && b.temperature !== undefined ? `Temp: ${b.temperature} °C` : null,
          b.oxygenSat !== null && b.oxygenSat !== undefined ? `SpO2: ${b.oxygenSat}%` : null,
          b.weight !== null && b.weight !== undefined ? `Peso: ${b.weight} ${b.weightUnit ?? 'kg'}` : null,
          b.heightCm !== null && b.heightCm !== undefined ? `Talla: ${b.heightCm} cm` : null,
        ].filter(Boolean)
        if (partes.length > 0) {
          items.push({
            id: b.id,
            fechaIso: b.fechaIso,
            autor: b.authorName,
            etiqueta: 'Registro adicional',
            contenido: partes.join(' · '),
          })
        }
      } else if (sec === 'motivo' && b.chiefComplaint) {
        items.push({
          id: b.id,
          fechaIso: b.fechaIso,
          autor: b.authorName,
          etiqueta: b.visitType ?? 'Seguimiento',
          contenido: b.chiefComplaint,
        })
      } else if (b.contenido) {
        items.push({
          id: b.id,
          fechaIso: b.fechaIso,
          autor: b.authorName,
          etiqueta: 'Registro adicional',
          contenido: b.contenido,
        })
      }
    }

    return items
  }

  return (
    <div className="space-y-4">
      {/* BANNER SUPERIOR PARA NUEVA ATENCIÓN AL REGRESAR EL PACIENTE */}
      {puedeCrearNuevaAtencion && (esConsultaCerrada || bloqueadoPorAutoria) && (
        <div className="bg-white dark:bg-slate-800 border border-teal-200 dark:border-teal-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-teal-800 dark:text-teal-300">
              Expediente previo · Los registros viejos quedan protegidos y en solo lectura
            </p>
            <p className="text-[11px] text-slate-600 dark:text-slate-300">
              Abre una nueva atención con acápites limpios para escribir esta visita, o usa &ldquo;Duplicar / Nuevo&rdquo; directamente en cada acápite abajo.
            </p>
          </div>
          <button
            type="button"
            disabled={guardando !== null}
            onClick={handleIniciarNuevaAtencion}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold cursor-pointer shrink-0 disabled:opacity-50"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{guardando === 'nueva' ? 'Creando...' : 'Nueva atención (Nuevos acápites)'}</span>
          </button>
        </div>
      )}

      <form
        action={(fd) => enviar(fd, 'guardar')}
        className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 md:p-6 space-y-5"
      >
        <input type="hidden" name="consultationId" value={consulta.id} />

        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Ficha Clínica de Consulta
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Cada acápite es retraíble y puede duplicarse en bloques nuevos cuantas veces regrese el paciente sin alterar registros previos.
            </p>
          </div>
          {imc && (
            <div className="px-3 py-1.5 rounded-lg bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-800 text-xs font-bold text-teal-800 dark:text-teal-300 tabular-nums">
              IMC calculado: {imc} kg/m²
            </div>
          )}
        </div>

        {bloqueadoPorAutoria && (
          <div className="px-4 py-3 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 text-xs font-medium print:hidden">
            Las notas de esta visita pertenecen a <strong>{autorNotas || 'su médico autor'}</strong> (solo lectura). Puedes consultar todo el expediente y agregar bloques nuevos con <strong>&ldquo;Duplicar / Nuevo&rdquo;</strong> o pulsar <strong>&ldquo;Nueva atención&rdquo;</strong>.
          </div>
        )}

        {esConsultaCerrada && !bloqueadoPorAutoria && (
          <div className="px-4 py-2.5 rounded-lg border border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-950/30 text-teal-900 dark:text-teal-200 text-xs font-medium print:hidden">
            Consulta cerrada ({autorNotas || 'médico tratante'}). Sus notas originales quedan intactas en solo lectura; usa <strong>&ldquo;Duplicar / Nuevo&rdquo;</strong> en cualquier acápite o pulsa <strong>&ldquo;Reabrir con nuevos acápites&rdquo;</strong>.
          </div>
        )}

        {feedback && (
          <div
            className={`px-4 py-3 rounded-lg border text-sm font-medium print:hidden ${
              feedback.tipo === 'ok'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            {feedback.texto}
          </div>
        )}

        {/* 1. SIGNOS VITALES Y ANTROPOMETRÍA */}
        <AcapiteRetraible
          titulo="Signos Vitales y Antropometría"
          seccion="signos"
          historicos={obtenerHistoricosSeccion('signos')}
          puedeDuplicar={puedeCrearNuevaAtencion}
          duplicadorAbierto={duplicadoresAbiertos.signos}
          onToggleDuplicador={() => toggleDuplicador('signos')}
          consultationId={consulta.id}
          onBloqueGuardado={(msg) => {
            setFeedback({ tipo: 'ok', texto: msg })
            router.refresh()
          }}
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Presión Arterial
              </label>
              <input
                name="bloodPressure"
                defaultValue={consulta.bloodPressure ?? ''}
                disabled={!camposActualesEditables}
                placeholder="120/80"
                className="w-full px-2.5 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white tabular-nums disabled:opacity-70"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                FC (lpm)
              </label>
              <input
                name="heartRate"
                type="number"
                defaultValue={consulta.heartRate ?? ''}
                disabled={!camposActualesEditables}
                placeholder="76"
                className="w-full px-2.5 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white tabular-nums disabled:opacity-70"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Temp (°C)
              </label>
              <input
                name="temperature"
                type="number"
                step="0.1"
                defaultValue={consulta.temperature ?? ''}
                disabled={!camposActualesEditables}
                placeholder="36.5"
                className="w-full px-2.5 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white tabular-nums disabled:opacity-70"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                SpO2 (%)
              </label>
              <input
                name="oxygenSat"
                type="number"
                defaultValue={consulta.oxygenSat ?? ''}
                disabled={!camposActualesEditables}
                placeholder="98"
                className="w-full px-2.5 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white tabular-nums disabled:opacity-70"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Peso
              </label>
              <div className="flex gap-1">
                <input
                  name="weight"
                  type="number"
                  step="0.1"
                  value={peso}
                  onChange={(e) => setPeso(e.target.value)}
                  disabled={!camposActualesEditables}
                  placeholder="70"
                  className="w-full px-2 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white tabular-nums disabled:opacity-70"
                />
                <select
                  name="weightUnit"
                  value={unidadPeso}
                  onChange={(e) => setUnidadPeso(e.target.value)}
                  disabled={!camposActualesEditables}
                  className="px-1.5 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white disabled:opacity-70"
                >
                  <option value="kg">kg</option>
                  <option value="lb">lb</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Talla (cm)
              </label>
              <input
                name="heightCm"
                type="number"
                step="0.5"
                value={tallaCm}
                onChange={(e) => setTallaCm(e.target.value)}
                disabled={!camposActualesEditables}
                placeholder="170"
                className="w-full px-2.5 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white tabular-nums disabled:opacity-70"
              />
            </div>
          </div>
        </AcapiteRetraible>

        {/* 2. MOTIVO DE CONSULTA Y TIPO DE VISITA */}
        <AcapiteRetraible
          titulo="Motivo de Consulta y Tipo de Visita"
          seccion="motivo"
          historicos={obtenerHistoricosSeccion('motivo')}
          puedeDuplicar={puedeCrearNuevaAtencion}
          duplicadorAbierto={duplicadoresAbiertos.motivo}
          onToggleDuplicador={() => toggleDuplicador('motivo')}
          consultationId={consulta.id}
          onBloqueGuardado={(msg) => {
            setFeedback({ tipo: 'ok', texto: msg })
            router.refresh()
          }}
        >
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Tipo de Consulta
                </label>
                <select
                  name="visitType"
                  defaultValue={consulta.visitType}
                  disabled={!camposActualesEditables}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white disabled:opacity-70"
                >
                  <option value="Primera vez">Primera vez</option>
                  <option value="Seguimiento">Seguimiento</option>
                  <option value="Control de resultados">Control de resultados</option>
                  <option value="Urgencia ambulatoria">Urgencia ambulatoria</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Próxima Cita (Opcional)
                </label>
                <input
                  name="nextAppointment"
                  type="date"
                  defaultValue={consulta.nextAppointment ?? ''}
                  disabled={!camposActualesEditables}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white disabled:opacity-70"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                Motivo de Consulta *
              </label>
              <input
                name="chiefComplaint"
                defaultValue={consulta.chiefComplaint}
                required
                disabled={!camposActualesEditables}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white disabled:opacity-70"
              />
            </div>
          </div>
        </AcapiteRetraible>

        {/* 3. ENFERMEDAD ACTUAL / ANAMNESIS */}
        <AcapiteRetraible
          titulo="Enfermedad Actual / Anamnesis"
          seccion="enfermedad"
          historicos={obtenerHistoricosSeccion('enfermedad')}
          puedeDuplicar={puedeCrearNuevaAtencion}
          duplicadorAbierto={duplicadoresAbiertos.enfermedad}
          onToggleDuplicador={() => toggleDuplicador('enfermedad')}
          consultationId={consulta.id}
          onBloqueGuardado={(msg) => {
            setFeedback({ tipo: 'ok', texto: msg })
            router.refresh()
          }}
        >
          <textarea
            name="historyIllness"
            rows={4}
            defaultValue={consulta.historyIllness ?? ''}
            disabled={!camposActualesEditables}
            placeholder="Inicio, duración, síntomas asociados..."
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white disabled:opacity-70"
          />
        </AcapiteRetraible>

        {/* 4. EXAMEN FÍSICO */}
        <AcapiteRetraible
          titulo="Examen Físico"
          seccion="examen"
          historicos={obtenerHistoricosSeccion('examen')}
          puedeDuplicar={puedeCrearNuevaAtencion}
          duplicadorAbierto={duplicadoresAbiertos.examen}
          onToggleDuplicador={() => toggleDuplicador('examen')}
          consultationId={consulta.id}
          onBloqueGuardado={(msg) => {
            setFeedback({ tipo: 'ok', texto: msg })
            router.refresh()
          }}
        >
          <textarea
            name="physicalExam"
            rows={4}
            defaultValue={consulta.physicalExam ?? ''}
            disabled={!camposActualesEditables}
            placeholder="Hallazgos cardiovasculares, respiratorios, abdomen, extremidades..."
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white disabled:opacity-70"
          />
        </AcapiteRetraible>

        {/* 5. DIAGNÓSTICO / IMPRESIÓN CLÍNICA */}
        <AcapiteRetraible
          titulo="Diagnóstico / Impresión Clínica"
          seccion="diagnostico"
          historicos={obtenerHistoricosSeccion('diagnostico')}
          puedeDuplicar={puedeCrearNuevaAtencion}
          duplicadorAbierto={duplicadoresAbiertos.diagnostico}
          onToggleDuplicador={() => toggleDuplicador('diagnostico')}
          consultationId={consulta.id}
          onBloqueGuardado={(msg) => {
            setFeedback({ tipo: 'ok', texto: msg })
            router.refresh()
          }}
        >
          <input
            name="diagnosis"
            defaultValue={consulta.diagnosis ?? ''}
            disabled={!camposActualesEditables}
            placeholder="Ej. Hipertensión arterial esencial compensada / Diabetes Mellitus tipo 2"
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-semibold bg-white dark:bg-slate-900 text-slate-900 dark:text-white disabled:opacity-70"
          />
        </AcapiteRetraible>

        {/* 6. RECETA MÉDICA / PLAN TERAPÉUTICO */}
        <AcapiteRetraible
          titulo="Receta Médica / Plan Terapéutico e Indicaciones"
          seccion="receta"
          historicos={obtenerHistoricosSeccion('receta')}
          puedeDuplicar={puedeCrearNuevaAtencion}
          duplicadorAbierto={duplicadoresAbiertos.receta}
          onToggleDuplicador={() => toggleDuplicador('receta')}
          consultationId={consulta.id}
          onBloqueGuardado={(msg) => {
            setFeedback({ tipo: 'ok', texto: msg })
            router.refresh()
          }}
        >
          <textarea
            name="treatmentPlan"
            rows={5}
            defaultValue={consulta.treatmentPlan ?? ''}
            disabled={!camposActualesEditables}
            placeholder={'1. Losartán 50 mg VO cada 24 horas\n2. Medidas higiénico-dietéticas y control de presión arterial'}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white disabled:opacity-70"
          />
        </AcapiteRetraible>

        {/* 7. ÓRDENES DE LABORATORIO / ESTUDIOS */}
        <AcapiteRetraible
          titulo="Órdenes de Laboratorio / Estudios"
          seccion="laboratorio"
          historicos={obtenerHistoricosSeccion('laboratorio')}
          puedeDuplicar={puedeCrearNuevaAtencion}
          duplicadorAbierto={duplicadoresAbiertos.laboratorio}
          onToggleDuplicador={() => toggleDuplicador('laboratorio')}
          consultationId={consulta.id}
          onBloqueGuardado={(msg) => {
            setFeedback({ tipo: 'ok', texto: msg })
            router.refresh()
          }}
        >
          <textarea
            name="labOrders"
            rows={3}
            defaultValue={consulta.labOrders ?? ''}
            disabled={!camposActualesEditables}
            placeholder="Hemograma, química sanguínea, HbA1c, perfil lipídico, radiografía..."
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white disabled:opacity-70"
          />
        </AcapiteRetraible>

        {/* 8. NOTAS INTERNAS / SEGUIMIENTO */}
        <AcapiteRetraible
          titulo="Notas Internas / Seguimiento"
          seccion="notas"
          historicos={obtenerHistoricosSeccion('notas')}
          puedeDuplicar={puedeCrearNuevaAtencion}
          duplicadorAbierto={duplicadoresAbiertos.notas}
          onToggleDuplicador={() => toggleDuplicador('notas')}
          consultationId={consulta.id}
          onBloqueGuardado={(msg) => {
            setFeedback({ tipo: 'ok', texto: msg })
            router.refresh()
          }}
        >
          <textarea
            name="notes"
            rows={3}
            defaultValue={consulta.notes ?? ''}
            disabled={!camposActualesEditables}
            placeholder="Observaciones adicionales para la próxima visita..."
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white disabled:opacity-70"
          />
        </AcapiteRetraible>

        {(camposActualesEditables || (puedeCrearNuevaAtencion && esConsultaCerrada)) && (
          <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700 print:hidden">
            {camposActualesEditables ? (
              <>
                <button
                  type="submit"
                  disabled={guardando !== null}
                  className="px-4 py-2.5 rounded-lg text-xs font-bold border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white hover:bg-slate-50 cursor-pointer"
                >
                  {guardando === 'guardar' ? 'Guardando...' : 'Guardar progreso'}
                </button>
                <button
                  type="submit"
                  formAction={(fd) => enviar(fd, 'finalizar')}
                  disabled={guardando !== null}
                  className="px-5 py-2.5 rounded-lg text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white cursor-pointer"
                >
                  {guardando === 'finalizar' ? 'Cerrando...' : '✓ Finalizar y Cerrar Consulta'}
                </button>
              </>
            ) : (
              <button
                type="button"
                disabled={guardando !== null}
                onClick={handleIniciarNuevaAtencion}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white cursor-pointer disabled:opacity-50"
              >
                <PlusCircle className="w-4 h-4" />
                <span>
                  {guardando === 'nueva'
                    ? 'Creando nuevos acápites...'
                    : 'Reabrir expediente (Nuevos acápites)'}
                </span>
              </button>
            )}
          </div>
        )}
      </form>
    </div>
  )
}
