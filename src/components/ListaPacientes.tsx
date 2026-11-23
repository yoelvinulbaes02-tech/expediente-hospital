'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { BannerAlergias } from '@/components/BannerAlergias'
import { completarTareaDesdeDashboard, entregarLote } from '@/app/dashboard/actions-lote'
import { TeamServicioCard } from '@/components/TeamServicioCard'
import { CirugiaResumenPanel, type ResumenCirugiaStats } from '@/components/CirugiaResumenPanel'
import { CurasPanel, type CuraPacienteItem } from '@/components/CurasPanel'
import { HemodialisisPanel, type HemodialisisItemData } from '@/components/HemodialisisPanel'
import { ESTADOS_CIRUGIA, type TeamServicioData } from '@/lib/cirugia-constants'
import { ESTADOS_ORTOPEDIA } from '@/lib/ortopedia-constants'

type TareaPendienteResumen = {
  id: string
  title: string
  category: string
  dueAt: Date | string | null
}

type Episodio = {
  id: string | number
  serviceType?: string | null
  consultingDepartment?: string | null
  consultingResident?: string | null
  hospitalAdmissionDate?: Date | string | null
  admissionDate: Date | string
  room: string | null
  bed: string | null
  chiefComplaint: string | null
  attendingDoctor: string | null
  admittingDoctor?: string | null
  primaryDiagnosis?: string | null
  secondaryDiagnoses?: string | null
  initialWeight?: number | null
  initialWeightUnit?: string | null
  responsibleId: string | null
  responsible: { fullName: string } | null
  tasks?: TareaPendienteResumen[]
  internalMedicineProfile?: {
    clinicalStatus: string
    codeStatus: string
    isolationType: string
    oxygenSupport: string
  } | null
  surgicalProfile?: {
    procedureName: string | null
    surgeryDate: Date | string | null
    surgeryType: string
    surgicalSpecialty: string | null
    surgeryStatus: string
    affectedLimb?: string | null
    neurovascularStatus?: string | null
    compartmentAlert?: boolean
    weightBearingPlan?: string | null
  } | null
  _count: { tasks: number }
  handoffs: { recibidoPor: string }[]
  patient: {
    firstName: string
    lastName: string
    age: number | string | null
    sex: string | null
    expedienteNumber: string
    cedula?: string | null
  }
  allergies: React.ComponentProps<typeof BannerAlergias>['alergias']
}

type Doctor = { id: string; fullName: string; email: string }
type Mensaje = { tipo: 'ok' | 'error'; texto: string; detalles: string[] }

const ETIQUETA_CATEGORIA: Record<string, { label: string; color: string }> = {
  analisis: { label: '🧪 Analítica', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' },
  estudio: { label: '🩻 Estudio', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300' },
  indicacion: { label: '💊 Indicación', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' },
  otro: { label: '📌 General', color: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200' },
}

function normalizar(texto?: string | null) {
  return (texto ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function compararUbicacion(a: Episodio, b: Episodio): number {
  const roomA = a.room?.trim() || ''
  const roomB = b.room?.trim() || ''
  if (!roomA && roomB) return 1
  if (roomA && !roomB) return -1
  const compRoom = roomA.localeCompare(roomB, undefined, { numeric: true, sensitivity: 'base' })
  if (compRoom !== 0) return compRoom

  const bedA = a.bed?.trim() || ''
  const bedB = b.bed?.trim() || ''
  return bedA.localeCompare(bedB, undefined, { numeric: true, sensitivity: 'base' })
}

const fmtFechaCorta = (d: Date | string) => {
  const f = new Date(d)
  return f.toLocaleDateString('es-DO', {
    timeZone: 'America/Santo_Domingo',
    day: '2-digit',
    month: '2-digit',
  })
}

const fmtFechaHora = (d: Date | string) => {
  const f = new Date(d)
  return f.toLocaleString('es-DO', {
    timeZone: 'America/Santo_Domingo',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function ListaPacientes({
  episodes,
  userId,
  miEmail,
  doctores,
  vistaInicial = 'propio',
  puedeMarcarTareas = false,
  puedeEditarServicio = false,
  interfaceMode = 'HOSPITALIZACION',
  teamData,
  sugerenciaAutoTeam,
  resumenCirugiaAuto,
  resumenCirugiaGuardado = null,
  conteosDispositivosCirugia,
  curas = [],
  hemodialisisItems = [],
  ahoraIso = '',
}: {
  episodes: Episodio[]
  userId: string
  miEmail: string
  doctores: Doctor[]
  vistaInicial?: 'propio' | 'interconsulta' | 'curas' | 'hemodialisis'
  puedeMarcarTareas?: boolean
  puedeEditarServicio?: boolean
  interfaceMode?: 'HOSPITALIZACION' | 'MEDICINA_INTERNA' | 'CIRUGIA' | 'ORTOPEDIA'
  teamData?: TeamServicioData
  sugerenciaAutoTeam?: { ma: string; r4: string; r3: string; r2: string; r1: string }
  resumenCirugiaAuto?: Omit<ResumenCirugiaStats, 'mode'>
  resumenCirugiaGuardado?: ResumenCirugiaStats | null
  conteosDispositivosCirugia?: Record<string, number>
  curas?: CuraPacienteItem[]
  hemodialisisItems?: HemodialisisItemData[]
  ahoraIso?: string
}) {
  const esMedicinaInterna = interfaceMode === 'MEDICINA_INTERNA'
  const esCirugia = interfaceMode === 'CIRUGIA'
  const esOrtopedia = interfaceMode === 'ORTOPEDIA'
  const esCirugiaBase = esCirugia || esOrtopedia
  const esNefrologia = interfaceMode === 'HOSPITALIZACION'
  const router = useRouter()
  const [areaGuardia, setAreaGuardia] = useState<'propio' | 'interconsulta' | 'curas' | 'hemodialisis'>(
    vistaInicial === 'curas' && !esCirugiaBase
      ? 'propio'
      : vistaInicial === 'hemodialisis' && !esNefrologia
        ? 'propio'
        : vistaInicial
  )
  const [busqueda, setBusqueda] = useState('')
  const [soloPendientes, setSoloPendientes] = useState(false)
  const [pendientesExpandidos, setPendientesExpandidos] = useState<Record<string, boolean>>({})
  const [marcandoTareaId, setMarcandoTareaId] = useState<string | null>(null)
  const [tareasCompletadasIds, setTareasCompletadasIds] = useState<string[]>([])
  const [seleccionados, setSeleccionados] = useState<string[]>([])
  const [medicoRecibe, setMedicoRecibe] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [mensaje, setMensaje] = useState<Mensaje | null>(null)

  const activosHemodialisis = useMemo(
    () => hemodialisisItems.filter((i) => i.isActive).length,
    [hemodialisisItems]
  )

  const cambiarArea = (nuevaArea: 'propio' | 'interconsulta' | 'curas' | 'hemodialisis') => {
    setAreaGuardia(nuevaArea)
    setSeleccionados([])
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      if (nuevaArea === 'interconsulta') {
        url.searchParams.set('vista', 'interconsulta')
      } else if (nuevaArea === 'curas') {
        url.searchParams.set('vista', 'curas')
      } else if (nuevaArea === 'hemodialisis') {
        url.searchParams.set('vista', 'hemodialisis')
      } else {
        url.searchParams.delete('vista')
      }
      window.history.replaceState(null, '', url.pathname + url.search)
    }
  }

  const tareasVisiblesDe = (e: Episodio): TareaPendienteResumen[] => {
    return (e.tasks ?? []).filter((t) => !tareasCompletadasIds.includes(t.id))
  }

  const episodiosDelArea = useMemo(() => {
    return episodes.filter((e) => (e.serviceType ?? 'propio') === areaGuardia)
  }, [episodes, areaGuardia])

  const totalPropios = useMemo(
    () => episodes.filter((e) => (e.serviceType ?? 'propio') === 'propio').length,
    [episodes]
  )
  const totalInterconsultas = useMemo(
    () => episodes.filter((e) => e.serviceType === 'interconsulta').length,
    [episodes]
  )

  const totalConPendientesArea = useMemo(() => {
    return episodiosDelArea.filter((e) => {
      const lista = (e.tasks ?? []).filter((t) => !tareasCompletadasIds.includes(t.id))
      return lista.length > 0
    }).length
  }, [episodiosDelArea, tareasCompletadasIds])

  const ordenados = useMemo(() => {
    return [...episodiosDelArea].sort(compararUbicacion)
  }, [episodiosDelArea])

  const filtrados = useMemo(() => {
    const terminos = normalizar(busqueda).split(/\s+/).filter(Boolean)

    return ordenados.filter((e) => {
      if (soloPendientes) {
        const pendientesActivos = (e.tasks ?? []).filter((t) => !tareasCompletadasIds.includes(t.id))
        if (pendientesActivos.length === 0) return false
      }

      if (terminos.length === 0) return true

      const palabras = [
        ...normalizar(e.patient.firstName).split(/\s+/),
        ...normalizar(e.patient.lastName).split(/\s+/),
        normalizar(e.patient.expedienteNumber),
        normalizar(e.patient.cedula),
        normalizar(e.room),
        normalizar(e.bed),
        normalizar(e.primaryDiagnosis),
        normalizar(e.consultingDepartment),
        normalizar(e.consultingResident),
      ]
      return terminos.every((t) => palabras.some((p) => p.startsWith(t)))
    })
  }, [busqueda, ordenados, soloPendientes, tareasCompletadasIds])

  const seleccionable = (e: Episodio) => e.responsibleId === userId && e.handoffs.length === 0
  const seleccionables = filtrados.filter(seleccionable)
  const todosMarcados =
    seleccionables.length > 0 && seleccionables.every((e) => seleccionados.includes(String(e.id)))
  const hayEntregables = episodiosDelArea.some(seleccionable)

  const toggleSeleccion = (id: string) => {
    setSeleccionados((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const toggleTodos = () => {
    const ids = seleccionables.map((e) => String(e.id))
    setSeleccionados((prev) =>
      todosMarcados ? prev.filter((x) => !ids.includes(x)) : Array.from(new Set([...prev, ...ids]))
    )
  }

  const toggleExpandirPendientes = (episodeId: string) => {
    setPendientesExpandidos((prev) => ({ ...prev, [episodeId]: !prev[episodeId] }))
  }

  const handleCompletarTarea = async (taskId: string, titulo: string) => {
    if (!puedeMarcarTareas || marcandoTareaId) return
    setMarcandoTareaId(taskId)
    try {
      const res = await completarTareaDesdeDashboard(taskId)
      if (!res.ok) {
        setMensaje({
          tipo: 'error',
          texto: res.error ?? 'No se pudo completar el pendiente.',
          detalles: [],
        })
      } else {
        setTareasCompletadasIds((prev) => [...prev, taskId])
        setMensaje({
          tipo: 'ok',
          texto: `Pendiente marcado como realizado: "${titulo}".`,
          detalles: [],
        })
        router.refresh()
      }
    } finally {
      setMarcandoTareaId(null)
    }
  }

  return (
    <>
      {/* TEAM DE SERVICIO ARRIBA ANTES QUE RESUMEN DEL SERVICIO (MEDICINA INTERNA, CIRUGÍA Y ORTOPEDIA) */}
      {(esMedicinaInterna || esCirugiaBase) && teamData && sugerenciaAutoTeam && (
        <TeamServicioCard
          team={teamData}
          sugerenciaAuto={sugerenciaAutoTeam}
          puedeEditar={puedeEditarServicio}
          servicioLabel={
            esOrtopedia
              ? 'Ortopedia y Traumatología'
              : esCirugia
                ? 'Cirugía'
                : 'Medicina Interna'
          }
        />
      )}

      {/* PANELES INICIALES DE CIRUGÍA / ORTOPEDIA: RESUMEN + DISPOSITIVOS (RETRAÍBLES) */}
      {esCirugiaBase && resumenCirugiaAuto && conteosDispositivosCirugia && (
        <CirugiaResumenPanel
          resumenAuto={resumenCirugiaAuto}
          resumenGuardado={resumenCirugiaGuardado}
          conteosDispositivos={conteosDispositivosCirugia}
          puedeEditar={puedeEditarServicio}
          interfaceMode={esOrtopedia ? 'ORTOPEDIA' : 'CIRUGIA'}
        />
      )}

      {/* SELECTOR DE GUARDIA */}
      <div
        id="lista-pacientes"
        className="scroll-mt-20 flex flex-wrap items-center justify-between gap-3 mb-6 bg-white dark:bg-slate-800 p-2 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm"
      >
        <div className={`grid gap-2 w-full sm:w-auto ${esCirugiaBase || esNefrologia ? 'grid-cols-3' : 'grid-cols-2'}`}>
          <button
            type="button"
            onClick={() => cambiarArea('propio')}
            className={`py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
              areaGuardia === 'propio'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <span>🏥</span> Propios
            <span className={`px-2 py-0.2 rounded-full text-xs font-bold ${areaGuardia === 'propio' ? 'bg-blue-800 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {totalPropios}
            </span>
          </button>

          <button
            type="button"
            onClick={() => cambiarArea('interconsulta')}
            className={`py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
              areaGuardia === 'interconsulta'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            <span>📋</span> Interconsultas
            <span className={`px-2 py-0.2 rounded-full text-xs font-bold ${areaGuardia === 'interconsulta' ? 'bg-purple-800 text-white' : 'bg-slate-200 text-slate-700'}`}>
              {totalInterconsultas}
            </span>
          </button>

          {esCirugiaBase && (
            <button
              type="button"
              onClick={() => cambiarArea('curas')}
              className={`py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                areaGuardia === 'curas'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <span>{esOrtopedia ? '🦴' : '🩹'}</span> {esOrtopedia ? 'Curas / Pines' : 'Curas'}
              <span className={`px-2 py-0.2 rounded-full text-xs font-bold ${areaGuardia === 'curas' ? 'bg-teal-800 text-white' : 'bg-slate-200 text-slate-700'}`}>
                {curas.length}
              </span>
            </button>
          )}

          {esNefrologia && (
            <button
              type="button"
              onClick={() => cambiarArea('hemodialisis')}
              className={`py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                areaGuardia === 'hemodialisis'
                  ? 'bg-cyan-700 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <span>🩸</span> Hemodiálisis
              <span className={`px-2 py-0.2 rounded-full text-xs font-bold ${areaGuardia === 'hemodialisis' ? 'bg-cyan-900 text-white' : 'bg-slate-200 text-slate-700'}`}>
                {activosHemodialisis}
              </span>
            </button>
          )}
        </div>

        <Link
          href="/dashboard/nuevo-paciente"
          className={`w-full sm:w-auto px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-center text-white transition-colors shadow-sm ${
            areaGuardia === 'interconsulta' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          + {areaGuardia === 'interconsulta' ? 'Ingresar Interconsulta' : 'Ingresar Paciente de Sala'}
        </Link>
      </div>

      {esCirugiaBase && areaGuardia === 'curas' ? (
        <CurasPanel
          curas={curas}
          puedeRegistrar={puedeMarcarTareas}
          interfaceMode={esOrtopedia ? 'ORTOPEDIA' : 'CIRUGIA'}
        />
      ) : esNefrologia && areaGuardia === 'hemodialisis' ? (
        <HemodialisisPanel
          items={hemodialisisItems}
          puedeRegistrar={puedeMarcarTareas}
          ahoraIso={ahoraIso}
        />
      ) : (
        <>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-3">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          {esOrtopedia
            ? areaGuardia === 'propio'
              ? '🦴 Sala de Ortopedia y Traumatología'
              : '📋 Interconsultas a Ortopedia'
            : esCirugia
              ? areaGuardia === 'propio'
                ? '🔪 Sala de Cirugía'
                : '📋 Interconsultas a Cirugía'
              : esMedicinaInterna
                ? areaGuardia === 'propio'
                  ? '🩺 Sala de Medicina Interna'
                  : '📋 Interconsultas a Medicina Interna'
                : areaGuardia === 'propio'
                  ? '🏥 Sala de Hospitalización'
                  : '📋 Pacientes de Interconsulta'}
        </h2>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setSoloPendientes((prev) => !prev)}
            className={`px-3 py-2 rounded-lg font-bold text-xs sm:text-sm border transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              soloPendientes
                ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                : 'bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700 hover:bg-amber-100'
            }`}
          >
            <span>☑</span>
            <span>{soloPendientes ? 'Viendo solo pendientes' : 'Solo pendientes'}</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                soloPendientes
                  ? 'bg-amber-700 text-white'
                  : 'bg-amber-200 text-amber-950'
              }`}
            >
              {totalConPendientesArea}
            </span>
          </button>

          <div className="relative flex-1 min-w-44 md:w-64">
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="🔍 Buscar nombre, cama, depto..."
              className="w-full px-3 py-2 pr-10 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
            />
            {busqueda && (
              <button
                type="button"
                onClick={() => setBusqueda('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs px-2 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
          <Link
            href="/dashboard/archivo"
            className="bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 px-3 py-2 rounded-lg font-medium text-xs sm:text-sm whitespace-nowrap"
          >
            📂 Archivo
          </Link>
        </div>
      </div>

      {mensaje && (
        <div className={`mb-4 px-4 py-3 rounded-lg border text-sm ${mensaje.tipo === 'ok' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
          <div className="flex justify-between gap-3">
            <p className="font-medium">{mensaje.texto}</p>
            <button type="button" onClick={() => setMensaje(null)} className="text-xs opacity-60 hover:opacity-100 cursor-pointer">✕</button>
          </div>
        </div>
      )}

      {hayEntregables && (
        <div className="flex items-center gap-3 mb-6 bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <input
            id="seleccionar-todos"
            type="checkbox"
            checked={todosMarcados}
            onChange={toggleTodos}
            className="w-5 h-5 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="seleccionar-todos" className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer flex-1">
            Seleccionar mis pacientes ({seleccionados.length})
          </label>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtrados.map((episode) => {
          const epId = String(episode.id)
          const entregable = seleccionable(episode)
          const entregaPendiente = episode.handoffs[0]
          const meLoEntregaron = !!entregaPendiente && entregaPendiente.recibidoPor.toLowerCase() === miEmail.toLowerCase()
          const esInterconsulta = episode.serviceType === 'interconsulta'
          const pendientes = tareasVisiblesDe(episode)
          const pendientesExpandido = soloPendientes || !!pendientesExpandidos[epId]

          const diffInterconsulta = new Date().getTime() - new Date(episode.admissionDate).getTime()
          const diaInterconsulta = Math.max(1, Math.floor(diffInterconsulta / (1000 * 60 * 60 * 24)) + 1)

          let diaHospital: number | null = null
          if (episode.hospitalAdmissionDate) {
            const diffHosp = new Date().getTime() - new Date(episode.hospitalAdmissionDate).getTime()
            diaHospital = Math.max(1, Math.floor(diffHosp / (1000 * 60 * 60 * 24)) + 1)
          }

          const hrefExpediente = esInterconsulta
            ? `/dashboard/paciente/${episode.id}?vista=interconsulta`
            : `/dashboard/paciente/${episode.id}`

          return (
            <div
              key={episode.id}
              className={`bg-white dark:bg-slate-800 p-4 md:p-5 rounded-xl shadow-sm border hover:shadow-md transition-all relative ${
                esInterconsulta ? 'border-purple-200 dark:border-purple-800' : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              {entregable && (
                <div className="absolute top-4 left-4">
                  <input
                    type="checkbox"
                    checked={seleccionados.includes(epId)}
                    onChange={() => toggleSeleccion(epId)}
                    className="w-5 h-5 cursor-pointer rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>
              )}

              <div className={entregable ? 'pl-8' : ''}>
                <div className="flex justify-between items-start gap-2 mb-2">
                  <div className="min-w-0">
                    <h3 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100">
                      {episode.patient.firstName} {episode.patient.lastName}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                      {episode.patient.age} años • {episode.patient.sex} • Exp: {episode.patient.expedienteNumber}
                    </p>
                  </div>

                  <div className="shrink-0 text-right">
                    {esInterconsulta ? (
                      <span className="bg-purple-100 text-purple-900 border border-purple-200 px-2 py-0.5 rounded-lg text-xs font-bold block mb-1">
                        {episode.consultingDepartment ?? 'Interconsulta'}
                      </span>
                    ) : null}
                    <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md text-xs font-bold border border-blue-100">
                      Hab. {episode.room} - Cama {episode.bed}
                    </span>
                  </div>
                </div>

                {/* DATOS DE INGRESO Y DÍAS DE INTERCONSULTA */}
                {!soloPendientes && (
                  <div className="bg-slate-50 dark:bg-slate-700/50 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 mb-2 space-y-1">
                    {esInterconsulta ? (
                      <>
                        <div className="flex flex-wrap items-center justify-between gap-1">
                          <span>
                            📅 <strong>Interconsulta:</strong> {fmtFechaCorta(episode.admissionDate)}
                          </span>
                          <span className="font-bold text-purple-700 bg-purple-50 border border-purple-200 px-1.5 py-0.2 rounded">
                            Día {diaInterconsulta} de interconsulta
                          </span>
                        </div>
                        {episode.hospitalAdmissionDate && (
                          <p className="text-[11px] text-slate-500">
                            🏥 <strong>Ingreso al Hospital:</strong> {fmtFechaCorta(episode.hospitalAdmissionDate)} (Día {diaHospital} de estancia hospitalaria)
                          </p>
                        )}
                      </>
                    ) : (
                      <div className="flex flex-wrap items-center justify-between gap-1">
                        <span>
                          📅 <strong>Ingreso a Sala:</strong> {fmtFechaCorta(episode.admissionDate)}
                        </span>
                        <span className="font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded">
                          Día {diaInterconsulta} de internamiento
                        </span>
                      </div>
                    )}

                    {episode.initialWeight && (
                      <p className="text-[11px] text-emerald-800 font-semibold">
                        ⚖️ Peso inicial: {episode.initialWeight} {episode.initialWeightUnit ?? 'kg'}
                      </p>
                    )}
                  </div>
                )}

                <div className="mb-3 space-y-1 text-xs sm:text-sm">
                  {!soloPendientes && (
                    esInterconsulta ? (
                      <>
                        <p className="font-semibold text-purple-900 dark:text-purple-300">
                          Motivo: <span className="font-normal text-slate-700 dark:text-slate-200">{episode.chiefComplaint}</span>
                        </p>
                        <p className="font-semibold text-slate-600 dark:text-slate-300">
                          Residente a cargo: <span className="font-bold text-slate-800 dark:text-slate-100">{episode.consultingResident ?? 'No especificado'}</span>
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="font-semibold text-slate-600 dark:text-slate-300">
                          Diagnóstico: <span className="font-bold text-blue-700 dark:text-blue-300">{episode.primaryDiagnosis || episode.chiefComplaint}</span>
                        </p>
                        <p className="font-semibold text-slate-600 dark:text-slate-300">
                          A cargo: <span className="font-normal">{episode.responsible?.fullName ?? 'Sin asignar'}</span>
                        </p>
                      </>
                    )
                  )}

                  {!soloPendientes &&
                    esMedicinaInterna &&
                    episode.internalMedicineProfile &&
                    episode.internalMedicineProfile.oxygenSupport !== 'Aire ambiente' && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-sky-50 text-sky-800 border-sky-200">
                          🫁 {episode.internalMedicineProfile.oxygenSupport}
                        </span>
                      </div>
                    )}

                  {!soloPendientes && esCirugiaBase && episode.surgicalProfile && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {(() => {
                        const listaEstados = esOrtopedia ? ESTADOS_ORTOPEDIA : ESTADOS_CIRUGIA
                        const st =
                          listaEstados.find((s) => s.value === episode.surgicalProfile?.surgeryStatus) ??
                          listaEstados[0]
                        return (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${st.badge}`}>
                            {st.label}
                          </span>
                        )
                      })()}
                      {esOrtopedia &&
                        (episode.surgicalProfile.compartmentAlert ||
                          episode.surgicalProfile.neurovascularStatus === 'alerta_alterado') && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-red-100 text-red-900 border-red-300">
                            ⚠ Alerta Neurovascular / Compartimental
                          </span>
                        )}
                      {esOrtopedia && episode.surgicalProfile.affectedLimb && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-teal-50 text-teal-900 border-teal-200">
                          {episode.surgicalProfile.affectedLimb}
                        </span>
                      )}
                      {episode.surgicalProfile.procedureName && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded border bg-blue-50 text-blue-900 border-blue-200">
                          {episode.surgicalProfile.procedureName}
                        </span>
                      )}
                      {esOrtopedia && episode.surgicalProfile.weightBearingPlan && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded border bg-amber-50 text-amber-900 border-amber-200">
                          {episode.surgicalProfile.weightBearingPlan}
                        </span>
                      )}
                      {episode.surgicalProfile.surgicalSpecialty && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded border bg-slate-100 text-slate-700 border-slate-200">
                          {episode.surgicalProfile.surgicalSpecialty}
                        </span>
                      )}
                    </div>
                  )}

                  {/* PENDIENTES CLICABLES SIN ABRIR EL EXPEDIENTE */}
                  {pendientes.length > 0 && (
                    <div className="mt-2">
                      {!soloPendientes && (
                        <button
                          type="button"
                          onClick={() => toggleExpandirPendientes(epId)}
                          className="inline-flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                        >
                          <span>☑ {pendientes.length} pendiente{pendientes.length === 1 ? '' : 's'}</span>
                          <span className="text-[10px] opacity-80">
                            {pendientesExpandido ? '▲ Ocultar' : '▼ Ver / marcar'}
                          </span>
                        </button>
                      )}

                      {pendientesExpandido && (
                        <div className="mt-2 space-y-1.5 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-2.5">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                            Pendientes por realizar ({pendientes.length})
                          </p>
                          <div className="space-y-1.5">
                            {pendientes.map((t) => {
                              const cat = ETIQUETA_CATEGORIA[t.category] ?? ETIQUETA_CATEGORIA.otro
                              const procesando = marcandoTareaId === t.id
                              return (
                                <div
                                  key={t.id}
                                  className="flex items-start justify-between gap-2 bg-white dark:bg-slate-800 border border-amber-200/80 dark:border-slate-700 rounded-lg px-2.5 py-2"
                                >
                                  <div className="min-w-0 flex-1 space-y-0.5">
                                    <div className="flex flex-wrap items-center gap-1.5">
                                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${cat.color}`}>
                                        {cat.label}
                                      </span>
                                      {t.dueAt && (
                                        <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400">
                                          📅 {fmtFechaHora(t.dueAt)}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 wrap-break-word">
                                      {t.title}
                                    </p>
                                  </div>

                                  {puedeMarcarTareas && (
                                    <button
                                      type="button"
                                      disabled={procesando}
                                      onClick={() => handleCompletarTarea(t.id, t.title)}
                                      title="Marcar pendiente como realizado"
                                      className="shrink-0 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                                    >
                                      {procesando ? '...' : '✓ Listo'}
                                    </button>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {entregaPendiente && (
                    meLoEntregaron ? (
                      <Link href={`/dashboard/paciente/${episode.id}/turno`} className="mt-2 block bg-indigo-600 text-white text-xs font-bold px-3 py-2 rounded-lg text-center">
                        📥 Te entregaron este paciente · Revisar y aceptar
                      </Link>
                    ) : (
                      <p className="mt-2 text-xs font-semibold text-indigo-700">⏳ Entrega pendiente de aceptación</p>
                    )
                  )}
                </div>

                {!soloPendientes && <BannerAlergias alergias={episode.allergies} />}

                <div className="text-right mt-2">
                  <Link
                    href={hrefExpediente}
                    className={`inline-block py-1 text-xs sm:text-sm font-bold ${
                      esInterconsulta ? 'text-purple-600 hover:text-purple-800' : 'text-blue-600 hover:text-blue-800'
                    }`}
                  >
                    Ver Expediente {esInterconsulta ? 'de Interconsulta' : ''} →
                  </Link>
                </div>
              </div>
            </div>
          )
        })}

        {filtrados.length === 0 && (
          <div className="col-span-full text-center py-12 text-slate-400 bg-white dark:bg-slate-800 rounded-xl border">
            {soloPendientes
              ? `No hay pacientes con pendientes activos en ${areaGuardia === 'interconsulta' ? 'Interconsultas' : 'Sala'}.`
              : `No hay ${areaGuardia === 'interconsulta' ? 'interconsultas registradas' : 'pacientes de sala'} en este momento.`}
          </div>
        )}
      </div>

      {seleccionados.length > 0 && <div className="h-40 md:h-28" aria-hidden />}

      {seleccionados.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-20 bg-white dark:bg-slate-800 border-t shadow-lg px-4 pt-3 pb-4">
          <form
            action={async (formData) => {
              formData.set('episodeIds', JSON.stringify(seleccionados))
              setEnviando(true)
              try {
                const r = await entregarLote(formData)
                if (r.error) {
                  setMensaje({ tipo: 'error', texto: r.error, detalles: [] })
                } else {
                  setMensaje({
                    tipo: r.entregados > 0 ? 'ok' : 'error',
                    texto: `${r.entregados} paciente(s) entregado(s).`,
                    detalles: r.omitidos,
                  })
                  setSeleccionados([])
                  setMedicoRecibe('')
                }
              } finally {
                setEnviando(false)
              }
            }}
            className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center gap-2 md:gap-3"
          >
            <p className="text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 md:mr-auto">
              {seleccionados.length} paciente(s) de guardia seleccionado(s)
            </p>
            <select
              name="recibidoPor"
              value={medicoRecibe}
              onChange={(e) => setMedicoRecibe(e.target.value)}
              required
              className="w-full md:w-64 px-3 py-2 border rounded-lg text-xs bg-white text-slate-900"
            >
              <option value="">Médico que recibe guardia…</option>
              {doctores.map((d) => (
                <option key={d.id} value={d.email}>{d.fullName}</option>
              ))}
            </select>
            <button
              type="submit"
              disabled={enviando}
              className="w-full md:w-auto bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold text-xs hover:bg-indigo-700 transition-colors"
            >
              {enviando ? 'Entregando…' : `Entregar (${seleccionados.length})`}
            </button>
          </form>
        </div>
      )}
        </>
      )}
    </>
  )
}