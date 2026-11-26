'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Check, ChevronDown, ClipboardCopy, Lock, Pencil, PlusCircle } from 'lucide-react'
import {
  TIPOS_CONSULTA_EXTERNA,
  type ConsultaImagingData,
  type ConsultaLabsData,
  type HistorialVisitaResumen,
  type MapaMetaSecciones,
  type SeccionAutorMeta,
  type SeccionConsultaKey,
  etiquetaRolClinico,
  imagenesVacias,
  labsVacios,
  tieneImagenesConsulta,
  tieneLaboratoriosConsulta,
} from '@/lib/consultas-auth'
import {
  cambiarTipoConsulta,
  guardarConsultaClinica,
  iniciarNuevaAtencionConsulta,
} from '@/app/dashboard/consultas/actions'

type ConsultaEditable = {
  id: string
  status: string
  consultationType: string
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
  labs: ConsultaLabsData
  imaging: ConsultaImagingData
  nextAppointment: string | null
  notes: string | null
}

type FormState = {
  consultationType: string
  visitType: string
  nextAppointment: string
  chiefComplaint: string
  bloodPressure: string
  heartRate: string
  temperature: string
  oxygenSat: string
  weight: string
  weightUnit: string
  heightCm: string
  historyIllness: string
  physicalExam: string
  diagnosis: string
  treatmentPlan: string
  labs: ConsultaLabsData
  imaging: ConsultaImagingData
  notes: string
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

function fmtHora(iso: string) {
  return new Date(iso).toLocaleTimeString('es-DO', {
    timeZone: 'America/Santo_Domingo',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

function AcapiteClinico({
  titulo,
  meta,
  abiertoPorDefecto = false,
  puedeEditar,
  editando,
  onToggleEditar,
  bloqueadoPorAutoria,
  autorNotas,
  badgeExtra,
  children,
}: {
  titulo: string
  meta?: SeccionAutorMeta | null
  abiertoPorDefecto?: boolean
  puedeEditar: boolean
  editando: boolean
  onToggleEditar: () => void
  bloqueadoPorAutoria: boolean
  autorNotas?: string | null
  badgeExtra?: React.ReactNode
  children: React.ReactNode
}) {
  const detailsRef = useRef<HTMLDetailsElement>(null)
  return (
    <details
      ref={detailsRef}
      {...(abiertoPorDefecto ? { open: true } : {})}
      className="group rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/40 dark:bg-slate-900/30 p-4"
    >
      <summary className="list-none cursor-pointer flex flex-wrap items-center justify-between gap-2 [&::-webkit-details-marker]:hidden">
        <div className="flex items-center gap-2 min-w-0">
          <ChevronDown className="w-4 h-4 text-slate-500 transition-transform group-open:rotate-0 -rotate-90 shrink-0" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
            {titulo}
          </h3>
          {badgeExtra}
        </div>

        <div className="flex flex-wrap items-center gap-2 ml-auto">
          {meta && (
            <span className="inline-flex flex-wrap items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
              <span>✍️ Modificado por:</span>
              <strong className="text-slate-700 dark:text-slate-200">{meta.byName}</strong>
              {meta.byRole && (
                <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 px-1.5 py-0.5 rounded text-[10px] font-bold">
                  {etiquetaRolClinico(meta.byRole)}
                </span>
              )}
              <span className="text-[10px] text-slate-400 tabular-nums">
                · {fmtFechaHora(meta.atIso)}
              </span>
            </span>
          )}

          {bloqueadoPorAutoria ? (
            <span
              title={`Solo lectura: pertenece a ${autorNotas || 'otro médico'}`}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[10px] font-bold text-amber-800 dark:text-amber-300 print:hidden"
            >
              <Lock className="w-3 h-3" />
              <span>Solo lectura</span>
            </span>
          ) : (
            puedeEditar && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  if (!editando && detailsRef.current) {
                    detailsRef.current.open = true
                  }
                  onToggleEditar()
                }}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer whitespace-nowrap print:hidden ${
                  editando
                    ? 'bg-teal-600 hover:bg-teal-700 text-white border-teal-600'
                    : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-blue-700 dark:text-blue-300 border-slate-300 dark:border-slate-600'
                }`}
              >
                {editando ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Listo</span>
                  </>
                ) : (
                  <>
                    <Pencil className="w-3 h-3" />
                    <span>Editar</span>
                  </>
                )}
              </button>
            )
          )}
        </div>
      </summary>

      <div className="mt-3 pt-2.5 border-t border-slate-200/70 dark:border-slate-700/70">
        {children}
      </div>
    </details>
  )
}

export function FormularioConsultaClinica({
  consulta,
  puedeEditar,
  puedeCambiarTipo = false,
  puedeCrearNuevaAtencion = false,
  autorNotas,
  bloqueadoPorAutoria = false,
  historialVisitas = [],
  metaSeccionesInicial = {},
  usuarioActual,
}: {
  consulta: ConsultaEditable
  puedeEditar: boolean
  puedeCambiarTipo?: boolean
  puedeCrearNuevaAtencion?: boolean
  autorNotas?: string | null
  bloqueadoPorAutoria?: boolean
  historialVisitas?: HistorialVisitaResumen[]
  metaSeccionesInicial?: MapaMetaSecciones
  usuarioActual: { fullName: string; role: string }
}) {
  const router = useRouter()

  const [form, setForm] = useState<FormState>({
    consultationType: consulta.consultationType || 'Consulta general',
    visitType: consulta.visitType,
    nextAppointment: consulta.nextAppointment ?? '',
    chiefComplaint: consulta.chiefComplaint,
    bloodPressure: consulta.bloodPressure ?? '',
    heartRate: consulta.heartRate !== null ? String(consulta.heartRate) : '',
    temperature: consulta.temperature !== null ? String(consulta.temperature) : '',
    oxygenSat: consulta.oxygenSat !== null ? String(consulta.oxygenSat) : '',
    weight: consulta.weight !== null ? String(consulta.weight) : '',
    weightUnit: consulta.weightUnit ?? 'kg',
    heightCm: consulta.heightCm !== null ? String(consulta.heightCm) : '',
    historyIllness: consulta.historyIllness ?? '',
    physicalExam: consulta.physicalExam ?? '',
    diagnosis: consulta.diagnosis ?? '',
    treatmentPlan: consulta.treatmentPlan ?? '',
    labs: consulta.labs ?? labsVacios(),
    imaging: consulta.imaging ?? imagenesVacias(),
    notes: consulta.notes ?? '',
  })

  const [metaSecciones, setMetaSecciones] = useState<MapaMetaSecciones>(metaSeccionesInicial)
  const [editandoSeccion, setEditandoSeccion] = useState<Record<SeccionConsultaKey, boolean>>({
    antropometria: false,
    signos: false,
    motivo: false,
    enfermedad: false,
    examen: false,
    diagnostico: false,
    receta: false,
    laboratorio: false,
    imagenes: false,
    notas: false,
  })

  const [estadoGuardado, setEstadoGuardado] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [ultimaHoraGuardado, setUltimaHoraGuardado] = useState<string | null>(null)
  const [finalizando, setFinalizando] = useState(false)
  const [creandoNueva, setCreandoNueva] = useState(false)
  const [cambiandoTipo, setCambiandoTipo] = useState(false)
  const [feedback, setFeedback] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null)

  const visitasPrevias = [...historialVisitas]
    .filter((v) => v.id !== consulta.id)
    .sort((a, b) => new Date(b.consultationDate).getTime() - new Date(a.consultationDate).getTime())

  const [visitaSeleccionadaId, setVisitaSeleccionadaId] = useState<string>(
    visitasPrevias[0]?.id ?? ''
  )

  const esConsultaCerrada = consulta.status === 'COMPLETADA' || consulta.status === 'CANCELADA'
  const camposActualesEditables = puedeEditar && !esConsultaCerrada && !bloqueadoPorAutoria

  const formRef = useRef(form)
  const dirtyRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mountedRef = useRef(true)

  const calcularIMC = () => {
    const pNum = parseFloat(form.weight)
    const tNum = parseFloat(form.heightCm)
    if (!pNum || !tNum || tNum <= 0) return null
    const pesoKg = form.weightUnit === 'lb' ? pNum * 0.453592 : pNum
    const alturaM = tNum / 100
    const imc = pesoKg / (alturaM * alturaM)
    if (!isFinite(imc)) return null
    return imc.toFixed(1)
  }

  const imc = calcularIMC()

  const ejecutarAutosave = useCallback(
    async (keepalive = false) => {
      if (!camposActualesEditables || !dirtyRef.current) return
      const payload = formRef.current
      if (payload.chiefComplaint.trim().length < 2) return

      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }

      dirtyRef.current = false
      if (mountedRef.current) setEstadoGuardado('saving')

      try {
        const res = await fetch('/api/consultas/autosave', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          keepalive,
          body: JSON.stringify({
            consultationId: consulta.id,
            ...payload,
          }),
        })
        const json = (await res.json()) as {
          ok?: boolean
          error?: string
          savedAtIso?: string
          changedSections?: SeccionConsultaKey[]
          authorName?: string
          authorRole?: string
        }

        if (!res.ok || !json.ok) {
          dirtyRef.current = true
          if (mountedRef.current) {
            setEstadoGuardado('idle')
            setFeedback({
              tipo: 'error',
              texto: json.error ?? 'No se pudo guardar automáticamente.',
            })
          }
          return
        }

        if (!mountedRef.current) return

        const ahoraIso = json.savedAtIso ?? new Date().toISOString()
        setEstadoGuardado('saved')
        setUltimaHoraGuardado(ahoraIso)
        if (json.changedSections && json.changedSections.length > 0) {
          const nuevaMeta: SeccionAutorMeta = {
            byName: json.authorName ?? usuarioActual.fullName,
            byRole: json.authorRole ?? usuarioActual.role,
            atIso: ahoraIso,
          }
          setMetaSecciones((prev) => {
            const next = { ...prev }
            for (const sec of json.changedSections!) {
              next[sec] = nuevaMeta
            }
            return next
          })
        }
      } catch {
        dirtyRef.current = true
        if (mountedRef.current) setEstadoGuardado('idle')
      }
    },
    [camposActualesEditables, consulta.id, usuarioActual.fullName, usuarioActual.role]
  )

  useEffect(() => {
    mountedRef.current = true
    const flush = () => {
      if (dirtyRef.current && camposActualesEditables) {
        void ejecutarAutosave(true)
      }
    }
    const onVisChange = () => {
      if (document.visibilityState === 'hidden') flush()
    }
    window.addEventListener('pagehide', flush)
    window.addEventListener('beforeunload', flush)
    document.addEventListener('visibilitychange', onVisChange)
    return () => {
      mountedRef.current = false
      window.removeEventListener('pagehide', flush)
      window.removeEventListener('beforeunload', flush)
      document.removeEventListener('visibilitychange', onVisChange)
      if (timerRef.current) clearTimeout(timerRef.current)
      flush()
    }
  }, [camposActualesEditables, ejecutarAutosave])

  const actualizarCampo = <K extends keyof FormState>(campo: K, valor: FormState[K]) => {
    if (!camposActualesEditables) return
    dirtyRef.current = true
    setFeedback(null)
    setForm((prev) => {
      const next = { ...prev, [campo]: valor }
      formRef.current = next
      return next
    })

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      void ejecutarAutosave(false)
    }, 700)
  }

  const actualizarLab = <K extends keyof ConsultaLabsData>(campo: K, valor: string) => {
    if (!camposActualesEditables) return
    dirtyRef.current = true
    setFeedback(null)
    setForm((prev) => {
      const next = { ...prev, labs: { ...prev.labs, [campo]: valor } }
      formRef.current = next
      return next
    })

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      void ejecutarAutosave(false)
    }, 700)
  }

  const actualizarImagen = <K extends keyof ConsultaImagingData>(campo: K, valor: string) => {
    if (!camposActualesEditables) return
    dirtyRef.current = true
    setFeedback(null)
    setForm((prev) => {
      const next = { ...prev, imaging: { ...prev.imaging, [campo]: valor } }
      formRef.current = next
      return next
    })

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      void ejecutarAutosave(false)
    }, 700)
  }

  const toggleSeccion = async (sec: SeccionConsultaKey) => {
    if (!camposActualesEditables) return
    const estabaEditando = editandoSeccion[sec]
    if (estabaEditando && dirtyRef.current) {
      await ejecutarAutosave(false)
    }
    setEditandoSeccion((prev) => ({ ...prev, [sec]: !estabaEditando }))
  }

  const handlePegarVisitaAnterior = () => {
    if (!camposActualesEditables || !visitaSeleccionadaId) return
    const origen = visitasPrevias.find((v) => v.id === visitaSeleccionadaId)
    if (!origen) return

    if (origen.weight === null && origen.heightCm === null) {
      setFeedback({
        tipo: 'error',
        texto: `La visita del ${fmtFechaHora(origen.consultationDate)} no tiene peso ni talla registrados.`,
      })
      return
    }

    dirtyRef.current = true
    setForm((prev) => {
      const next: FormState = {
        ...prev,
        weight: origen.weight !== null ? String(origen.weight) : prev.weight,
        weightUnit: origen.weightUnit ?? prev.weightUnit ?? 'kg',
        heightCm: origen.heightCm !== null ? String(origen.heightCm) : prev.heightCm,
      }
      formRef.current = next
      return next
    })
    setEditandoSeccion((prev) => ({ ...prev, antropometria: true }))
    setFeedback({
      tipo: 'ok',
      texto: `Datos antropométricos copiados de la visita del ${fmtFechaHora(origen.consultationDate)}. Puedes modificarlos si es necesario.`,
    })
    setTimeout(() => {
      void ejecutarAutosave(false)
    }, 80)
  }

  const handleFinalizarConsulta = async () => {
    if (!camposActualesEditables) return
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    setFinalizando(true)
    setFeedback(null)

    try {
      const actual = formRef.current
      const fd = new FormData()
      fd.set('consultationId', consulta.id)
      fd.set('accion', 'finalizar')
      fd.set('consultationType', actual.consultationType)
      fd.set('visitType', actual.visitType)
      fd.set('nextAppointment', actual.nextAppointment)
      fd.set('chiefComplaint', actual.chiefComplaint)
      fd.set('bloodPressure', actual.bloodPressure)
      fd.set('heartRate', actual.heartRate)
      fd.set('temperature', actual.temperature)
      fd.set('oxygenSat', actual.oxygenSat)
      fd.set('weight', actual.weight)
      fd.set('weightUnit', actual.weightUnit)
      fd.set('heightCm', actual.heightCm)
      fd.set('historyIllness', actual.historyIllness)
      fd.set('physicalExam', actual.physicalExam)
      fd.set('diagnosis', actual.diagnosis)
      fd.set('treatmentPlan', actual.treatmentPlan)
      fd.set('labsJson', JSON.stringify(actual.labs))
      fd.set('imagingJson', JSON.stringify(actual.imaging))
      fd.set('notes', actual.notes)

      const res = await guardarConsultaClinica(fd)
      if (!res.ok) {
        setFeedback({ tipo: 'error', texto: res.error ?? 'No se pudo finalizar la consulta.' })
        return
      }
      dirtyRef.current = false
      router.push('/dashboard?cerrada=1')
      router.refresh()
    } finally {
      setFinalizando(false)
    }
  }

  const handleIniciarNuevaAtencion = async () => {
    setCreandoNueva(true)
    setFeedback(null)
    try {
      const res = await iniciarNuevaAtencionConsulta(consulta.id, true)
      if (!res.ok || !res.consultationId) {
        setFeedback({ tipo: 'error', texto: res.error ?? 'No se pudo crear la nueva atención.' })
        return
      }
      router.push(`/dashboard/consultas/${res.consultationId}`)
      router.refresh()
    } finally {
      setCreandoNueva(false)
    }
  }

  const handleCambiarTipoRapido = async (nuevoTipo: string) => {
    if (camposActualesEditables) {
      actualizarCampo('consultationType', nuevoTipo)
      return
    }
    if (!puedeCambiarTipo) return
    setCambiandoTipo(true)
    setFeedback(null)
    try {
      const res = await cambiarTipoConsulta(consulta.id, nuevoTipo)
      if (!res.ok) {
        setFeedback({ tipo: 'error', texto: res.error ?? 'No se pudo cambiar el tipo de consulta.' })
        return
      }
      setForm((prev) => {
        const next = { ...prev, consultationType: nuevoTipo }
        formRef.current = next
        return next
      })
      setMetaSecciones((prev) => ({
        ...prev,
        motivo: {
          byName: usuarioActual.fullName,
          byRole: usuarioActual.role,
          atIso: new Date().toISOString(),
        },
      }))
      setFeedback({
        tipo: 'ok',
        texto: `Tipo de consulta / estatus actualizado a "${nuevoTipo}".`,
      })
      router.refresh()
    } finally {
      setCambiandoTipo(false)
    }
  }

  const renderTextoLectura = (texto: string, vacio: string, bold = false) =>
    texto.trim() ? (
      <p
        className={`text-sm text-slate-800 dark:text-slate-100 whitespace-pre-wrap leading-relaxed ${
          bold ? 'font-semibold' : ''
        }`}
      >
        {texto}
      </p>
    ) : (
      <p className="text-xs text-slate-400 italic">{vacio}</p>
    )

  return (
    <div className="space-y-4">
      {/* BANNER SUPERIOR PARA ABRIR UNA NUEVA VISITA HEREDANDO DATOS DEL PACIENTE, ANTECEDENTES Y ANTROPOMETRÍA */}
      {puedeCrearNuevaAtencion && (esConsultaCerrada || bloqueadoPorAutoria) && (
        <div className="bg-white dark:bg-slate-800 border border-teal-200 dark:border-teal-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-teal-800 dark:text-teal-300">
              {bloqueadoPorAutoria
                ? `Consulta de ${autorNotas || 'otro médico'} · Protegida (solo lectura)`
                : 'Expediente cerrado y archivado · Registro histórico intacto'}
            </p>
            <p className="text-[11px] text-slate-600 dark:text-slate-300">
              Si el paciente regresó, abre una nueva visita heredando solo sus datos, antecedentes y antropometría (todos modificables).
            </p>
          </div>
          <button
            type="button"
            disabled={creandoNueva}
            onClick={handleIniciarNuevaAtencion}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold cursor-pointer shrink-0 disabled:opacity-50"
          >
            <PlusCircle className="w-4 h-4" />
            <span>
              {creandoNueva ? 'Creando...' : '+ Nueva visita (datos base y antropometría)'}
            </span>
          </button>
        </div>
      )}

      {/* BARRA PARA TRAER ÚNICAMENTE ANTROPOMETRÍA (PESO / TALLA) DE UNA VISITA ANTERIOR */}
      {camposActualesEditables && visitasPrevias.length > 0 && (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 flex flex-wrap items-center gap-2.5 print:hidden">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-200 shrink-0">
            Copiar antropometría previa:
          </span>
          <select
            value={visitaSeleccionadaId}
            onChange={(e) => setVisitaSeleccionadaId(e.target.value)}
            className="flex-1 min-w-52 px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
          >
            {visitasPrevias.map((v, idx) => (
              <option key={v.id} value={v.id}>
                #{idx + 1} · {fmtFechaHora(v.consultationDate)} ·{' '}
                {v.weight !== null ? `${v.weight} ${v.weightUnit ?? 'kg'}` : 'Sin peso'} /{' '}
                {v.heightCm !== null ? `${v.heightCm} cm` : 'Sin talla'} ·{' '}
                {v.doctorName || 'Sin médico'}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handlePegarVisitaAnterior}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold cursor-pointer shrink-0"
          >
            <ClipboardCopy className="w-3.5 h-3.5" />
            <span>Copiar peso y talla</span>
          </button>
          {visitaSeleccionadaId && (
            <Link
              href={`/dashboard/consultas/${visitaSeleccionadaId}`}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline shrink-0"
            >
              Ver anterior
            </Link>
          )}
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 md:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Ficha Clínica de Consulta
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {camposActualesEditables
                ? 'Pulsa ✏️ Editar en cualquier acápite; todo se guarda automáticamente.'
                : 'Vista clínica en modo lectura.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 print:hidden">
            {camposActualesEditables && (
              <span
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border tabular-nums ${
                  estadoGuardado === 'saving'
                    ? 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-300'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-300'
                }`}
              >
                {estadoGuardado === 'saving'
                  ? 'Guardando...'
                  : ultimaHoraGuardado
                    ? `✓ Guardado automático · ${fmtHora(ultimaHoraGuardado)}`
                    : '✓ Guardado automático activo'}
              </span>
            )}
          </div>
        </div>

        {/* CAMBIO RÁPIDO DE TIPO DE CONSULTA / ESTATUS (EJ. PRE-DIÁLISIS -> HEMODIÁLISIS) */}
        <div className="rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-950/20 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 print:hidden">
          <div>
            <p className="text-xs font-bold text-teal-900 dark:text-teal-200">
              Tipo de consulta / Estatus del paciente
            </p>
            <p className="text-[11px] text-slate-600 dark:text-slate-300">
              Modificable en cualquier momento de la evolución (ej. de Pre-diálisis a Hemodiálisis).
            </p>
          </div>
          {camposActualesEditables || puedeCambiarTipo ? (
            <select
              aria-label="Tipo de consulta o estatus del paciente"
              disabled={cambiandoTipo}
              value={form.consultationType}
              onChange={(e) => void handleCambiarTipoRapido(e.target.value)}
              className="px-3 py-1.5 border border-teal-300 dark:border-teal-700 rounded-lg text-xs font-bold bg-white dark:bg-slate-900 text-teal-900 dark:text-teal-200 cursor-pointer disabled:opacity-50"
            >
              {!TIPOS_CONSULTA_EXTERNA.includes(
                form.consultationType as (typeof TIPOS_CONSULTA_EXTERNA)[number]
              ) && (
                <option value={form.consultationType}>{form.consultationType}</option>
              )}
              {TIPOS_CONSULTA_EXTERNA.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
          ) : (
            <span className="px-2.5 py-1 rounded-md bg-white dark:bg-slate-900 border border-teal-200 dark:border-teal-800 text-xs font-bold text-teal-800 dark:text-teal-300">
              {form.consultationType || 'Consulta general'}
            </span>
          )}
        </div>

        {bloqueadoPorAutoria && (
          <div className="px-4 py-3 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 text-xs font-medium print:hidden">
            Las notas de esta consulta pertenecen a <strong>{autorNotas || 'su médico autor'}</strong>. No es posible modificar lo que otro doctor registró en consulta.
          </div>
        )}

        {feedback && (
          <div
            className={`px-4 py-3 rounded-lg border text-xs font-medium print:hidden ${
              feedback.tipo === 'ok'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-200'
                : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/30 dark:border-red-800 dark:text-red-200'
            }`}
          >
            {feedback.texto}
          </div>
        )}

        {/* 1. DATOS ANTROPOMÉTRICOS (SE COPIAN DE VISITA ANTERIOR Y SON MODIFICABLES) */}
        <AcapiteClinico
          titulo="Datos Antropométricos"
          meta={metaSecciones.antropometria}
          puedeEditar={camposActualesEditables}
          editando={editandoSeccion.antropometria}
          onToggleEditar={() => void toggleSeccion('antropometria')}
          bloqueadoPorAutoria={bloqueadoPorAutoria}
          autorNotas={autorNotas}
          badgeExtra={
            imc ? (
              <span className="px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-800 text-[10px] font-bold text-teal-800 dark:text-teal-300 tabular-nums">
                IMC: {imc} kg/m²
              </span>
            ) : null
          }
        >
          {editandoSeccion.antropometria && camposActualesEditables ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Peso
                </label>
                <div className="flex gap-1">
                  <input
                    type="number"
                    step="0.1"
                    value={form.weight}
                    onChange={(e) => actualizarCampo('weight', e.target.value)}
                    onBlur={() => void ejecutarAutosave(false)}
                    placeholder="70"
                    className="w-full px-2.5 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white tabular-nums"
                  />
                  <select
                    value={form.weightUnit}
                    onChange={(e) => actualizarCampo('weightUnit', e.target.value)}
                    onBlur={() => void ejecutarAutosave(false)}
                    className="px-2 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white"
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
                  type="number"
                  step="0.5"
                  value={form.heightCm}
                  onChange={(e) => actualizarCampo('heightCm', e.target.value)}
                  onBlur={() => void ejecutarAutosave(false)}
                  placeholder="170"
                  className="w-full px-2.5 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white tabular-nums"
                />
              </div>
              <div className="flex flex-col justify-end">
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2">
                  <span className="block text-[10px] text-slate-500">IMC calculado</span>
                  <strong className="text-sm text-teal-700 dark:text-teal-300 tabular-nums">
                    {imc ? `${imc} kg/m²` : '—'}
                  </strong>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2.5 text-xs">
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-2">
                <span className="block text-[10px] text-slate-500">Peso</span>
                <strong className="text-sm text-slate-900 dark:text-white tabular-nums">
                  {form.weight ? `${form.weight} ${form.weightUnit}` : '—'}
                </strong>
              </div>
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-2">
                <span className="block text-[10px] text-slate-500">Talla</span>
                <strong className="text-sm text-slate-900 dark:text-white tabular-nums">
                  {form.heightCm ? `${form.heightCm} cm` : '—'}
                </strong>
              </div>
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-2">
                <span className="block text-[10px] text-slate-500">IMC</span>
                <strong className="text-sm text-teal-700 dark:text-teal-300 tabular-nums">
                  {imc ? `${imc} kg/m²` : '—'}
                </strong>
              </div>
            </div>
          )}
        </AcapiteClinico>

        {/* 2. SIGNOS VITALES DE ESTA CONSULTA */}
        <AcapiteClinico
          titulo="Signos Vitales"
          meta={metaSecciones.signos}
          puedeEditar={camposActualesEditables}
          editando={editandoSeccion.signos}
          onToggleEditar={() => void toggleSeccion('signos')}
          bloqueadoPorAutoria={bloqueadoPorAutoria}
          autorNotas={autorNotas}
        >
          {editandoSeccion.signos && camposActualesEditables ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Presión Arterial
                </label>
                <input
                  value={form.bloodPressure}
                  onChange={(e) => actualizarCampo('bloodPressure', e.target.value)}
                  onBlur={() => void ejecutarAutosave(false)}
                  placeholder="120/80"
                  className="w-full px-2.5 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white tabular-nums"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  FC (lpm)
                </label>
                <input
                  type="number"
                  value={form.heartRate}
                  onChange={(e) => actualizarCampo('heartRate', e.target.value)}
                  onBlur={() => void ejecutarAutosave(false)}
                  placeholder="76"
                  className="w-full px-2.5 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white tabular-nums"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Temp (°C)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={form.temperature}
                  onChange={(e) => actualizarCampo('temperature', e.target.value)}
                  onBlur={() => void ejecutarAutosave(false)}
                  placeholder="36.5"
                  className="w-full px-2.5 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white tabular-nums"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  SpO2 (%)
                </label>
                <input
                  type="number"
                  value={form.oxygenSat}
                  onChange={(e) => actualizarCampo('oxygenSat', e.target.value)}
                  onBlur={() => void ejecutarAutosave(false)}
                  placeholder="98"
                  className="w-full px-2.5 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white tabular-nums"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-2">
                <span className="block text-[10px] text-slate-500">TA</span>
                <strong className="text-sm text-slate-900 dark:text-white tabular-nums">
                  {form.bloodPressure || '—'}
                </strong>
              </div>
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-2">
                <span className="block text-[10px] text-slate-500">FC</span>
                <strong className="text-sm text-slate-900 dark:text-white tabular-nums">
                  {form.heartRate ? `${form.heartRate} lpm` : '—'}
                </strong>
              </div>
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-2">
                <span className="block text-[10px] text-slate-500">Temp</span>
                <strong className="text-sm text-slate-900 dark:text-white tabular-nums">
                  {form.temperature ? `${form.temperature} °C` : '—'}
                </strong>
              </div>
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-2">
                <span className="block text-[10px] text-slate-500">SpO2</span>
                <strong className="text-sm text-slate-900 dark:text-white tabular-nums">
                  {form.oxygenSat ? `${form.oxygenSat}%` : '—'}
                </strong>
              </div>
            </div>
          )}
        </AcapiteClinico>

        {/* 2. MOTIVO DE CONSULTA, TIPO DE CONSULTA Y TIPO DE VISITA */}
        <AcapiteClinico
          titulo="Tipo de Consulta, Visita y Motivo"
          meta={metaSecciones.motivo}
          puedeEditar={camposActualesEditables}
          editando={editandoSeccion.motivo}
          onToggleEditar={() => void toggleSeccion('motivo')}
          bloqueadoPorAutoria={bloqueadoPorAutoria}
          autorNotas={autorNotas}
        >
          {editandoSeccion.motivo && camposActualesEditables ? (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                    Tipo de Consulta
                  </label>
                  <select
                    value={form.consultationType}
                    onChange={(e) => actualizarCampo('consultationType', e.target.value)}
                    onBlur={() => void ejecutarAutosave(false)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    {TIPOS_CONSULTA_EXTERNA.map((tipo) => (
                      <option key={tipo} value={tipo}>
                        {tipo}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                    Tipo de Visita
                  </label>
                  <select
                    value={form.visitType}
                    onChange={(e) => actualizarCampo('visitType', e.target.value)}
                    onBlur={() => void ejecutarAutosave(false)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
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
                    type="date"
                    value={form.nextAppointment}
                    onChange={(e) => actualizarCampo('nextAppointment', e.target.value)}
                    onBlur={() => void ejecutarAutosave(false)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Motivo de Consulta *
                </label>
                <input
                  value={form.chiefComplaint}
                  onChange={(e) => actualizarCampo('chiefComplaint', e.target.value)}
                  onBlur={() => void ejecutarAutosave(false)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-1.5 text-sm text-slate-800 dark:text-slate-100">
              <div className="flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
                <span>
                  Tipo de consulta:{' '}
                  <strong className="text-teal-700 dark:text-teal-300">
                    {form.consultationType || 'Consulta general'}
                  </strong>
                </span>
                <span>
                  Visita: <strong className="text-slate-800 dark:text-slate-200">{form.visitType}</strong>
                </span>
                {form.nextAppointment && (
                  <span>
                    Próxima cita:{' '}
                    <strong className="text-slate-800 dark:text-slate-200 tabular-nums">
                      {form.nextAppointment}
                    </strong>
                  </span>
                )}
              </div>
              <p className="font-medium">{form.chiefComplaint || 'Sin motivo registrado'}</p>
            </div>
          )}
        </AcapiteClinico>

        {/* 3. ENFERMEDAD ACTUAL / ANAMNESIS */}
        <AcapiteClinico
          titulo="Enfermedad Actual / Anamnesis"
          meta={metaSecciones.enfermedad}
          puedeEditar={camposActualesEditables}
          editando={editandoSeccion.enfermedad}
          onToggleEditar={() => void toggleSeccion('enfermedad')}
          bloqueadoPorAutoria={bloqueadoPorAutoria}
          autorNotas={autorNotas}
        >
          {editandoSeccion.enfermedad && camposActualesEditables ? (
            <textarea
              rows={4}
              autoFocus
              value={form.historyIllness}
              onChange={(e) => actualizarCampo('historyIllness', e.target.value)}
              onBlur={() => void ejecutarAutosave(false)}
              placeholder="Inicio, duración, síntomas asociados..."
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          ) : (
            renderTextoLectura(form.historyIllness, 'Sin anamnesis registrada.')
          )}
        </AcapiteClinico>

        {/* 4. EXAMEN FÍSICO */}
        <AcapiteClinico
          titulo="Examen Físico"
          meta={metaSecciones.examen}
          puedeEditar={camposActualesEditables}
          editando={editandoSeccion.examen}
          onToggleEditar={() => void toggleSeccion('examen')}
          bloqueadoPorAutoria={bloqueadoPorAutoria}
          autorNotas={autorNotas}
        >
          {editandoSeccion.examen && camposActualesEditables ? (
            <textarea
              rows={4}
              autoFocus
              value={form.physicalExam}
              onChange={(e) => actualizarCampo('physicalExam', e.target.value)}
              onBlur={() => void ejecutarAutosave(false)}
              placeholder="Hallazgos cardiovasculares, respiratorios, abdomen, extremidades..."
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          ) : (
            renderTextoLectura(form.physicalExam, 'Sin examen físico registrado.')
          )}
        </AcapiteClinico>

        {/* 5. DIAGNÓSTICO / IMPRESIÓN CLÍNICA */}
        <AcapiteClinico
          titulo="Diagnóstico / Impresión Clínica"
          meta={metaSecciones.diagnostico}
          puedeEditar={camposActualesEditables}
          editando={editandoSeccion.diagnostico}
          onToggleEditar={() => void toggleSeccion('diagnostico')}
          bloqueadoPorAutoria={bloqueadoPorAutoria}
          autorNotas={autorNotas}
        >
          {editandoSeccion.diagnostico && camposActualesEditables ? (
            <input
              autoFocus
              value={form.diagnosis}
              onChange={(e) => actualizarCampo('diagnosis', e.target.value)}
              onBlur={() => void ejecutarAutosave(false)}
              placeholder="Ej. Hipertensión arterial esencial compensada / Diabetes Mellitus tipo 2"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-semibold bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          ) : (
            renderTextoLectura(form.diagnosis, 'Sin diagnóstico registrado.', true)
          )}
        </AcapiteClinico>

        {/* 6. PLAN TERAPÉUTICO / INDICACIONES */}
        <AcapiteClinico
          titulo="Plan Terapéutico / Indicaciones"
          meta={metaSecciones.receta}
          puedeEditar={camposActualesEditables}
          editando={editandoSeccion.receta}
          onToggleEditar={() => void toggleSeccion('receta')}
          bloqueadoPorAutoria={bloqueadoPorAutoria}
          autorNotas={autorNotas}
        >
          {editandoSeccion.receta && camposActualesEditables ? (
            <textarea
              rows={5}
              autoFocus
              value={form.treatmentPlan}
              onChange={(e) => actualizarCampo('treatmentPlan', e.target.value)}
              onBlur={() => void ejecutarAutosave(false)}
              placeholder={'1. Losartán 50 mg VO cada 24 horas\n2. Medidas higiénico-dietéticas y control de presión arterial'}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          ) : (
            renderTextoLectura(form.treatmentPlan, 'Sin plan terapéutico ni indicaciones registradas.')
          )}
        </AcapiteClinico>

        {/* 7. LABORATORIOS */}
        <AcapiteClinico
          titulo="Laboratorios"
          meta={metaSecciones.laboratorio}
          puedeEditar={camposActualesEditables}
          editando={editandoSeccion.laboratorio}
          onToggleEditar={() => void toggleSeccion('laboratorio')}
          bloqueadoPorAutoria={bloqueadoPorAutoria}
          autorNotas={autorNotas}
          badgeExtra={
            tieneLaboratoriosConsulta(form.labs) ? (
              <span className="px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-800 text-[10px] font-bold text-teal-800 dark:text-teal-300 tabular-nums">
                {form.labs.date || 'Registrado'}
              </span>
            ) : null
          }
        >
          {editandoSeccion.laboratorio && camposActualesEditables ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Fecha
                  </label>
                  <input
                    type="date"
                    value={form.labs.date}
                    onChange={(e) => actualizarLab('date', e.target.value)}
                    onBlur={() => void ejecutarAutosave(false)}
                    className="w-full px-2.5 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Hemoglobina (g/dL)
                  </label>
                  <input
                    value={form.labs.hgb}
                    onChange={(e) => actualizarLab('hgb', e.target.value)}
                    onBlur={() => void ejecutarAutosave(false)}
                    placeholder="Ej. 11.4"
                    className="w-full px-2.5 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Creatinina (mg/dL)
                  </label>
                  <input
                    value={form.labs.creatinine}
                    onChange={(e) => actualizarLab('creatinine', e.target.value)}
                    onBlur={() => void ejecutarAutosave(false)}
                    placeholder="Ej. 1.2"
                    className="w-full px-2.5 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Urea / BUN
                  </label>
                  <input
                    value={form.labs.urea}
                    onChange={(e) => actualizarLab('urea', e.target.value)}
                    onBlur={() => void ejecutarAutosave(false)}
                    placeholder="Ej. 42 mg/dL"
                    className="w-full px-2.5 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Glucosa / HbA1c
                  </label>
                  <input
                    value={form.labs.glucose}
                    onChange={(e) => actualizarLab('glucose', e.target.value)}
                    onBlur={() => void ejecutarAutosave(false)}
                    placeholder="Ej. 98 mg/dL · 6.4%"
                    className="w-full px-2.5 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Potasio (K+)
                  </label>
                  <input
                    value={form.labs.potassium}
                    onChange={(e) => actualizarLab('potassium', e.target.value)}
                    onBlur={() => void ejecutarAutosave(false)}
                    placeholder="Ej. 4.3 mEq/L"
                    className="w-full px-2.5 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white tabular-nums"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Examen de Orina / Proteinuria
                  </label>
                  <input
                    value={form.labs.ego}
                    onChange={(e) => actualizarLab('ego', e.target.value)}
                    onBlur={() => void ejecutarAutosave(false)}
                    placeholder="Ej. EGO sin piuria · RAC 45 mg/g"
                    className="w-full px-2.5 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Otros laboratorios / Resultados detallados
                </label>
                <textarea
                  rows={3}
                  value={form.labs.detail}
                  onChange={(e) => actualizarLab('detail', e.target.value)}
                  onBlur={() => void ejecutarAutosave(false)}
                  placeholder="Leucocitos, plaquetas, sodio, calcio, fósforo, PTH, perfil lipídico, urocultivo, serologías..."
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          ) : tieneLaboratoriosConsulta(form.labs) ? (
            <div className="space-y-2.5">
              {(form.labs.date ||
                form.labs.hgb ||
                form.labs.creatinine ||
                form.labs.urea ||
                form.labs.glucose ||
                form.labs.potassium ||
                form.labs.ego) && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  {form.labs.date && (
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5">
                      <span className="block text-[10px] text-slate-500">Fecha</span>
                      <strong className="text-slate-900 dark:text-white tabular-nums">{form.labs.date}</strong>
                    </div>
                  )}
                  {form.labs.hgb && (
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5">
                      <span className="block text-[10px] text-slate-500">Hgb</span>
                      <strong className="text-slate-900 dark:text-white tabular-nums">{form.labs.hgb}</strong>
                    </div>
                  )}
                  {form.labs.creatinine && (
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5">
                      <span className="block text-[10px] text-slate-500">Creatinina</span>
                      <strong className="text-slate-900 dark:text-white tabular-nums">{form.labs.creatinine}</strong>
                    </div>
                  )}
                  {form.labs.urea && (
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5">
                      <span className="block text-[10px] text-slate-500">Urea / BUN</span>
                      <strong className="text-slate-900 dark:text-white tabular-nums">{form.labs.urea}</strong>
                    </div>
                  )}
                  {form.labs.glucose && (
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5">
                      <span className="block text-[10px] text-slate-500">Glucosa / HbA1c</span>
                      <strong className="text-slate-900 dark:text-white tabular-nums">{form.labs.glucose}</strong>
                    </div>
                  )}
                  {form.labs.potassium && (
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5">
                      <span className="block text-[10px] text-slate-500">Potasio (K+)</span>
                      <strong className="text-slate-900 dark:text-white tabular-nums">{form.labs.potassium}</strong>
                    </div>
                  )}
                  {form.labs.ego && (
                    <div className="col-span-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5">
                      <span className="block text-[10px] text-slate-500">Orina / Proteinuria</span>
                      <strong className="text-slate-900 dark:text-white">{form.labs.ego}</strong>
                    </div>
                  )}
                </div>
              )}
              {form.labs.detail && (
                <p className="text-sm text-slate-800 dark:text-slate-100 whitespace-pre-wrap leading-relaxed">
                  {form.labs.detail}
                </p>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">Sin laboratorios registrados.</p>
          )}
        </AcapiteClinico>

        {/* 8. ESTUDIOS DE IMÁGENES */}
        <AcapiteClinico
          titulo="Estudios de Imágenes"
          meta={metaSecciones.imagenes}
          puedeEditar={camposActualesEditables}
          editando={editandoSeccion.imagenes}
          onToggleEditar={() => void toggleSeccion('imagenes')}
          bloqueadoPorAutoria={bloqueadoPorAutoria}
          autorNotas={autorNotas}
          badgeExtra={
            tieneImagenesConsulta(form.imaging) ? (
              <span className="px-2 py-0.5 rounded bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-800 text-[10px] font-bold text-teal-800 dark:text-teal-300 tabular-nums">
                {form.imaging.date || 'Registrado'}
              </span>
            ) : null
          }
        >
          {editandoSeccion.imagenes && camposActualesEditables ? (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Fecha del estudio
                  </label>
                  <input
                    type="date"
                    value={form.imaging.date}
                    onChange={(e) => actualizarImagen('date', e.target.value)}
                    onBlur={() => void ejecutarAutosave(false)}
                    className="w-full px-2.5 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Sonografía / Ecografía
                  </label>
                  <input
                    value={form.imaging.sonography}
                    onChange={(e) => actualizarImagen('sonography', e.target.value)}
                    onBlur={() => void ejecutarAutosave(false)}
                    placeholder="Ej. Sonografía renal: riñones simétricos, sin hidronefrosis"
                    className="w-full px-2.5 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    Radiografía (Rx)
                  </label>
                  <input
                    value={form.imaging.xray}
                    onChange={(e) => actualizarImagen('xray', e.target.value)}
                    onBlur={() => void ejecutarAutosave(false)}
                    placeholder="Ej. Rx tórax PA: silueta cardíaca y campos pulmonares normales"
                    className="w-full px-2.5 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    TAC / Resonancia Magnética
                  </label>
                  <input
                    value={form.imaging.ctMri}
                    onChange={(e) => actualizarImagen('ctMri', e.target.value)}
                    onBlur={() => void ejecutarAutosave(false)}
                    placeholder="Ej. UROTAC simple sin litiasis ni masas"
                    className="w-full px-2.5 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Otros estudios de imagen / Conclusiones
                </label>
                <textarea
                  rows={3}
                  value={form.imaging.other}
                  onChange={(e) => actualizarImagen('other', e.target.value)}
                  onBlur={() => void ejecutarAutosave(false)}
                  placeholder="Ecocardiograma, Doppler vascular, gammagrafía, hallazgos relevantes..."
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          ) : tieneImagenesConsulta(form.imaging) ? (
            <div className="space-y-2 text-sm text-slate-800 dark:text-slate-100">
              {form.imaging.date && (
                <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                  Fecha: <strong className="text-slate-800 dark:text-slate-200">{form.imaging.date}</strong>
                </p>
              )}
              {form.imaging.sonography && (
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Sonografía / Ecografía
                  </span>
                  <p className="text-sm whitespace-pre-wrap">{form.imaging.sonography}</p>
                </div>
              )}
              {form.imaging.xray && (
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Radiografía (Rx)
                  </span>
                  <p className="text-sm whitespace-pre-wrap">{form.imaging.xray}</p>
                </div>
              )}
              {form.imaging.ctMri && (
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    TAC / Resonancia Magnética
                  </span>
                  <p className="text-sm whitespace-pre-wrap">{form.imaging.ctMri}</p>
                </div>
              )}
              {form.imaging.other && (
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Otros estudios / Conclusiones
                  </span>
                  <p className="text-sm whitespace-pre-wrap">{form.imaging.other}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">Sin estudios de imágenes registrados.</p>
          )}
        </AcapiteClinico>

        {/* 8. NOTAS INTERNAS / SEGUIMIENTO */}
        <AcapiteClinico
          titulo="Notas Internas / Seguimiento"
          meta={metaSecciones.notas}
          puedeEditar={camposActualesEditables}
          editando={editandoSeccion.notas}
          onToggleEditar={() => void toggleSeccion('notas')}
          bloqueadoPorAutoria={bloqueadoPorAutoria}
          autorNotas={autorNotas}
        >
          {editandoSeccion.notas && camposActualesEditables ? (
            <textarea
              rows={3}
              autoFocus
              value={form.notes}
              onChange={(e) => actualizarCampo('notes', e.target.value)}
              onBlur={() => void ejecutarAutosave(false)}
              placeholder="Observaciones adicionales para la próxima visita..."
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
            />
          ) : (
            renderTextoLectura(form.notes, 'Sin notas internas adicionales.')
          )}
        </AcapiteClinico>

        {camposActualesEditables && (
          <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700 print:hidden">
            <button
              type="button"
              disabled={finalizando}
              onClick={() => void handleFinalizarConsulta()}
              className="px-5 py-2.5 rounded-lg text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white cursor-pointer disabled:opacity-50"
            >
              {finalizando ? 'Firmando y cerrando...' : '✓ Finalizar y Firmar Consulta'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
