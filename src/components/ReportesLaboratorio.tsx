'use client'

import { useState, useMemo } from 'react'
import { AlertTriangle, Highlighter } from 'lucide-react'
import {
  guardarReporteLaboratorio,
  editarReporteLaboratorio,
  eliminarReporteLaboratorio,
  toggleResalteReporteLaboratorio,
} from '@/app/dashboard/paciente/[id]/actions-clinicas'
import { TextareaConDeshacer } from '@/components/TextareaConDeshacer'
import {
  limpiarMarcadoresClinicos,
  parseResultadoLab,
  renderTextoClinico,
} from '@/lib/texto-clinico'

type ReporteLab = {
  id: string
  category: string
  testName: string
  sampleDate: Date | null
  result: string
  createdBy: string
  createdAt: Date
  updatedBy?: string | null
  updatedAt?: Date | null
}

const ETIQUETA_ROL: Record<string, string> = {
  ADMIN: 'Admin',
  DOCTOR: 'Médico',
  RESIDENT: 'Residente',
  NURSE: 'Enf.',
  LAB: 'Laboratorio',
  READONLY: 'Lectura',
}

const CATALOGO_LAB: Record<string, string[]> = {
  'I- HEMATOLOGÍA': [
    'Hemograma Completo',
    'Recuento de Plaquetas',
    'Tiempo de Protrombina (TP)',
    'Tiempo Parcial de Tromboplastina (TPT)',
    'Tiempo de Sangría',
    'Tiempo de Coagulación',
    'Tipificación y RH',
    'Test de Coombs Directo-Indirecto',
    'Conteo total de Eosinófilos',
    'Conteo de Reticulocitos',
    'Eritrosedimentación (VSG)',
    'Investigación de Hematozoarios (Gota Gruesa)',
    'Investigación de Filarias',
    'Fragilidad Globular',
    'Inv. Células Falciformes (Falcia)',
    'Inv. de Células L.E.',
    'Electroforesis de Hemoglobina',
  ],
  'II- UROANÁLISIS': [
    'Examen de Orina Completo',
    'Proteína en Orina de 24 Horas',
    'Depuración Endógena de Creatinina (DCE)',
    'Gravindex (HCG Orina)',
  ],
  'III- CULTIVOS Y BACTERIOLOGÍA': [
    'Urocultivo',
    'Hemocultivo',
    'Coprocultivo',
    'Cultivo de Secreción de Absceso',
    'Cultivo de Secreción de Úlcera',
    'Cultivo de Secreción de Fístula',
    'Cultivo de Secreción de Esputo',
    'Cultivo de Secreción Faríngea',
    'Cultivo de Secreción Ótica',
    'Cultivo de Secreción Ocular',
    'Cultivo de Secreción Ganglionar',
    'Cultivo de Secreción Endocervical',
    'Cultivo de Secreción Intraabdominal',
    'Cultivo de LCR',
    'Extendido de Secreción Vaginal',
    'Extendido de Secreción Uretral',
    'Conteo de Eosinófilos en Ext. Mucoso',
    'Baciloscopia (BAAR)',
    'BK - Orina 24 Horas',
  ],
  'IV- PARASITOLOGÍA Y LÍQUIDOS': [
    'Coprológico',
    'Investigación Sangre Oculta en Heces',
    'Investigación de Amebas',
    'Investigación de Leishmania',
    'Investigación Disacáridos en Heces',
    'Prueba de Digestión en Heces',
    'Citoquímico de Líquido Biológico',
  ],
  'VI- QUÍMICA SANGUÍNEA': [
    'Creatinina',
    'Nitrógeno Ureico (BUN)',
    'Glicemia en Ayunas',
    'Glicemia Post Prandial',
    'Hb Glicosilada (HbA1c)',
    'Curva Tolerancia a la Glucosa',
    'Electrolitos Séricos (Na, K, Cl)',
    'Calcio',
    'Fósforo',
    'Cloro',
    'Gasometría Arterial',
    'Ácido Úrico',
    'Colesterol Total',
    'Colesterol HDL y LDL',
    'Triglicéridos',
    'Transaminasas (AST / SGOT)',
    'Transaminasas (ALT / SGPT)',
    'Bilirrubina Total y Fraccionada (D-I-T)',
    'Fosfatasa Alcalina',
    'Fosfatasa Ácida',
    'Amilasa Sérica',
    'Lipasa Sérica',
    'Proteínas Totales y Fraccionadas',
    'L.D.H.',
    'C.P.K. Total',
    'CK-MB',
    'Troponinas Cualí-Cuantitativa',
    'PSA Libre - Total',
    'Electroforesis de Proteína',
  ],
  'VII- SEROLOGÍA E INMUNOLOGÍA': [
    'HIV I-II',
    'HBsAg (Hepatitis B)',
    'HCV (Hepatitis C)',
    'V.D.R.L.',
    'F.T.A. - A.B.S.',
    'F.T.A. en L.C.R.',
    'TSH',
    'T-3',
    'T-4',
    'T-4 Libre',
    'Proteína C Reactiva (PCR)',
    'Factor Reumatoide',
    'Antiestreptolisina O (ASO)',
    'Streptozime',
    'Detección Anticuerpos Antinucleares (ANA)',
    'Anti D.N.A.',
    'Inmunoglobulinas (IgG - IgA - IgM)',
    'Antígenos Febriles',
    'Dengue IgG / IgM',
    'Inv. de Toxoplasmosis (anti IgG / IgM)',
    'Helicobacter pylori',
    'Leptospira',
  ],
}

const TODAS_LAS_ANALITICAS = Object.values(CATALOGO_LAB).flat()

const GRUPOS_LAB = [
  { id: 'HEMATOLOGÍA', icono: '🩸', titulo: 'Hematología' },
  { id: 'QUÍMICA SANGUÍNEA', icono: '🧪', titulo: 'Química Sanguínea' },
  { id: 'UROANÁLISIS', icono: '🟡', titulo: 'Uroanálisis' },
  { id: 'CULTIVOS Y BACTERIOLOGÍA', icono: '🧫', titulo: 'Cultivos y Bacteriología' },
  { id: 'PARASITOLOGÍA Y LÍQUIDOS', icono: '🔬', titulo: 'Parasitología y Líquidos' },
  { id: 'SEROLOGÍA E INMUNOLOGÍA', icono: '🛡️', titulo: 'Serología e Inmunología' },
  { id: 'OTRAS ANALÍTICAS', icono: '📋', titulo: 'Otras Analíticas' },
]

// Quita acentos, tildes y pasa todo a minúsculas limpias: "QUÍMICA" -> "quimica"
function normalizar(texto?: string | null): string {
  return (texto ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

function normalizarCat(cat: string): string {
  const c = normalizar(cat)
  if (c.includes('hemato')) return 'HEMATOLOGÍA'
  if (c.includes('quim')) return 'QUÍMICA SANGUÍNEA'
  if (c.includes('uro')) return 'UROANÁLISIS'
  if (c.includes('cultiv') || c.includes('bacter')) return 'CULTIVOS Y BACTERIOLOGÍA'
  if (c.includes('parasit') || c.includes('liquid')) return 'PARASITOLOGÍA Y LÍQUIDOS'
  if (c.includes('serol') || c.includes('inmuno')) return 'SEROLOGÍA E INMUNOLOGÍA'
  return 'OTRAS ANALÍTICAS'
}

function fechaInputValue(d: Date | null): string {
  if (!d) return ''
  try {
    return new Date(d).toISOString().slice(0, 10)
  } catch {
    return ''
  }
}

function fmtFechaHora(d: Date | string): string {
  return new Date(d).toLocaleString('es-DO', {
    timeZone: 'America/Santo_Domingo',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function ReportesLaboratorio({
  episodeId,
  reportes,
  nombres,
  roles,
  puedeRegistrar,
}: {
  episodeId: string
  reportes: ReporteLab[]
  nombres: Record<string, string>
  roles: Record<string, string>
  puedeRegistrar: boolean
}) {
  const [busqueda, setBusqueda] = useState('')
  const [soloImportantes, setSoloImportantes] = useState(false)
  const [abiertos, setAbiertos] = useState<Record<string, boolean>>({
    HEMATOLOGÍA: true,
    'QUÍMICA SANGUÍNEA': true,
  })

  const [formAbierto, setFormAbierto] = useState(false)
  const [analiticaElegida, setAnaliticaElegida] = useState('')
  const [categoriaElegida, setCategoriaElegida] = useState('HEMATOLOGÍA')

  // Estado para edición y eliminación
  const [reporteEditando, setReporteEditando] = useState<ReporteLab | null>(null)
  const [editAnalitica, setEditAnalitica] = useState('')
  const [editCustomTest, setEditCustomTest] = useState('')
  const [editCategoria, setEditCategoria] = useState('HEMATOLOGÍA')
  const [reporteAEliminar, setReporteAEliminar] = useState<ReporteLab | null>(null)

  function toggleGrupo(id: string) {
    setAbiertos((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  function toggleTodosGrupos(abrir: boolean) {
    const nuevo: Record<string, boolean> = {}
    GRUPOS_LAB.forEach((g) => {
      nuevo[g.id] = abrir
    })
    setAbiertos(nuevo)
  }

  function handleSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value
    setAnaliticaElegida(val)
    if (val === 'OTRO_CULTIVO') {
      setCategoriaElegida('CULTIVOS Y BACTERIOLOGÍA')
      return
    }
    if (val === 'OTRO') {
      setCategoriaElegida('OTRAS ANALÍTICAS')
      return
    }
    const opt = e.target.selectedOptions[0]
    const optgroup = opt?.parentElement as HTMLOptGroupElement | null
    if (optgroup?.label) {
      setCategoriaElegida(optgroup.label.replace(/^[IVXLC]+-\s*/, ''))
    }
  }

  function abrirEdicion(rep: ReporteLab) {
    const estaEnCatalogo = TODAS_LAS_ANALITICAS.includes(rep.testName)
    setReporteEditando(rep)
    setEditCategoria(normalizarCat(rep.category))
    if (estaEnCatalogo) {
      setEditAnalitica(rep.testName)
      setEditCustomTest('')
    } else {
      setEditAnalitica(normalizarCat(rep.category) === 'CULTIVOS Y BACTERIOLOGÍA' ? 'OTRO_CULTIVO' : 'OTRO')
      setEditCustomTest(rep.testName)
    }
  }

  function handleSelectEdit(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value
    setEditAnalitica(val)
    if (val === 'OTRO_CULTIVO') {
      setEditCategoria('CULTIVOS Y BACTERIOLOGÍA')
      return
    }
    if (val === 'OTRO') {
      setEditCategoria('OTRAS ANALÍTICAS')
      return
    }
    const opt = e.target.selectedOptions[0]
    const optgroup = opt?.parentElement as HTMLOptGroupElement | null
    if (optgroup?.label) {
      setEditCategoria(optgroup.label.replace(/^[IVXLC]+-\s*/, ''))
    }
  }

  const cantidadDestacados = useMemo(
    () =>
      reportes.filter(
        (r) => parseResultadoLab(r.result).esImportante || r.result.includes('==')
      ).length,
    [reportes]
  )

  // BÚSQUEDA INSENSIBLE A TILDES, MAYÚSCULAS Y ESPACIOS
  const filtrados = useMemo(() => {
    const q = normalizar(busqueda)
    const terminos = q ? q.split(/\s+/).filter(Boolean) : []

    return reportes.filter((r) => {
      if (soloImportantes) {
        const esDestacado =
          parseResultadoLab(r.result).esImportante || r.result.includes('==')
        if (!esDestacado) return false
      }
      if (terminos.length === 0) return true
      const textoCompleto = normalizar(
        `${r.testName} ${r.category} ${limpiarMarcadoresClinicos(r.result)} ${nombres[r.createdBy] ?? r.createdBy} ${r.updatedBy ? (nombres[r.updatedBy] ?? r.updatedBy) : ''}`
      )
      return terminos.every((term) => textoCompleto.includes(term))
    })
  }, [reportes, busqueda, nombres, soloImportantes])

  // Agrupación por renglón y orden estricto por fecha de realización (sampleDate ?? createdAt)
  const gruposConDatos = useMemo(() => {
    const mapa: Record<string, ReporteLab[]> = {}
    filtrados.forEach((r) => {
      const catKey = normalizarCat(r.category)
      if (!mapa[catKey]) mapa[catKey] = []
      mapa[catKey].push(r)
    })

    Object.keys(mapa).forEach((k) => {
      mapa[k].sort((a, b) => {
        const fechaA = new Date(a.sampleDate ?? a.createdAt).getTime()
        const fechaB = new Date(b.sampleDate ?? b.createdAt).getTime()
        if (fechaB !== fechaA) return fechaB - fechaA
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })
    })

    return mapa
  }, [filtrados])

  const hayBusqueda = busqueda.trim().length > 0
  const esOtroNuevo = analiticaElegida === 'OTRO' || analiticaElegida === 'OTRO_CULTIVO'
  const esOtroEdit = editAnalitica === 'OTRO' || editAnalitica === 'OTRO_CULTIVO'

  const gruposActivos = GRUPOS_LAB.filter((g) => (gruposConDatos[g.id]?.length ?? 0) > 0)
  const algunoAbierto = gruposActivos.some((g) => abiertos[g.id])

  return (
    <div className="bg-white p-4 md:p-5 rounded-xl shadow-sm border border-slate-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3 mb-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xl">🧪</span>
          <h2 className="text-base font-bold text-slate-800">Reportes de Laboratorio</h2>
          <span className="text-xs bg-teal-50 text-teal-800 font-bold px-2 py-0.5 rounded-full border border-teal-200">
            {reportes.length} analítica{reportes.length === 1 ? '' : 's'}
          </span>
          {cantidadDestacados > 0 && (
            <button
              type="button"
              onClick={() => setSoloImportantes((v) => !v)}
              className={`text-[11px] font-bold px-2 py-0.5 rounded border inline-flex items-center gap-1 cursor-pointer transition-colors ${
                soloImportantes
                  ? 'bg-red-600 text-white border-red-700'
                  : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
              }`}
              title="Filtrar solo resultados resaltados o alterados"
            >
              <AlertTriangle className="w-3 h-3" />
              <span>Alterados ({cantidadDestacados})</span>
            </button>
          )}
          {gruposActivos.length > 1 && !hayBusqueda && !soloImportantes && (
            <button
              type="button"
              onClick={() => toggleTodosGrupos(!algunoAbierto)}
              className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 underline ml-1 cursor-pointer"
            >
              {algunoAbierto ? 'Retraer todo' : 'Expandir todo'}
            </button>
          )}
        </div>

        {/* LUPA Y BUSCADOR INSENSIBLE A TILDES Y MAYÚSCULAS */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="🔍 Buscar analítica o valor..."
            className="w-full px-3 py-1.5 pr-8 border border-slate-300 rounded-lg text-xs bg-slate-50 text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none"
          />
          {busqueda && (
            <button
              type="button"
              onClick={() => setBusqueda('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {reportes.length === 0 ? (
        <p className="text-xs text-slate-400 py-3 italic text-center">
          No hay analíticas de laboratorio registradas en este paciente.
        </p>
      ) : Object.keys(gruposConDatos).length === 0 ? (
        <p className="text-xs text-slate-400 py-3 italic text-center">
          No se encontraron análisis que coincidan con &quot;{busqueda}&quot;.
        </p>
      ) : (
        <div className="space-y-2 mb-3">
          {GRUPOS_LAB.map((g) => {
            const items = gruposConDatos[g.id]
            if (!items || items.length === 0) return null

            // Si hay búsqueda o filtro de alterados activo, se abre automáticamente el grupo correspondiente
            const estaAbierto = hayBusqueda || soloImportantes || !!abiertos[g.id]

            return (
              <div key={g.id} className="border border-slate-200 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleGrupo(g.id)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-left transition-colors select-none cursor-pointer"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base">{g.icono}</span>
                    <strong className="text-xs font-bold text-slate-800 uppercase tracking-wider truncate">
                      {g.titulo}
                    </strong>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200">
                      {items.length}
                    </span>
                  </div>

                  <span className="text-xs font-bold text-slate-400 ml-2">
                    {estaAbierto ? '▲ Colapsar' : '▼ Ver análisis'}
                  </span>
                </button>

                {estaAbierto && (
                  <div className="border-t border-slate-200 divide-y divide-slate-100 bg-white">
                    {items.map((rep) => {
                      const { esImportante, texto } = parseResultadoLab(rep.result)
                      const tieneValorResaltado = texto.includes('==')

                      return (
                        <div
                          key={rep.id}
                          className={`p-2.5 sm:px-4 sm:py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-colors text-xs ${
                            esImportante
                              ? 'bg-red-50/75 hover:bg-red-50'
                              : tieneValorResaltado
                                ? 'bg-amber-50/35 hover:bg-amber-50/60'
                                : 'hover:bg-slate-50/80'
                          }`}
                        >
                          <div className="sm:w-1/3 min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5">
                              {esImportante && (
                                <AlertTriangle
                                  className="w-3.5 h-3.5 text-red-600 shrink-0"
                                  aria-label="Resultado alterado o importante"
                                />
                              )}
                              <strong
                                className={`font-semibold ${
                                  esImportante ? 'text-red-950' : 'text-slate-800'
                                }`}
                              >
                                {rep.testName}
                              </strong>
                            </div>
                            {esImportante && (
                              <span className="inline-block text-[10px] font-bold text-red-700 uppercase tracking-wide mt-0.5">
                                Alterado / Importante
                              </span>
                            )}
                            {rep.sampleDate && (
                              <span className="block sm:inline sm:ml-2 text-[11px] text-slate-400">
                                {new Date(rep.sampleDate).toLocaleDateString('es-DO', {
                                  timeZone: 'America/Santo_Domingo',
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric',
                                })}
                              </span>
                            )}
                          </div>

                          <div
                            className={`sm:w-1/3 font-mono font-bold rounded px-2.5 py-1 text-xs whitespace-pre-line border ${
                              esImportante
                                ? 'bg-white text-red-950 border-red-300'
                                : 'bg-slate-50 text-slate-900 border-slate-200'
                            }`}
                          >
                            {renderTextoClinico(texto)}
                          </div>

                          <div className="sm:w-1/3 flex items-center justify-between sm:justify-end gap-2 text-[11px] text-slate-500 shrink-0">
                            <div className="text-left sm:text-right">
                              <div>
                                <span>{nombres[rep.createdBy] ?? rep.createdBy}</span>
                                {roles[rep.createdBy] && (
                                  <span className="ml-1 text-[10px] bg-slate-100 text-slate-600 px-1 py-0.5 rounded border font-semibold">
                                    {ETIQUETA_ROL[roles[rep.createdBy]] ?? roles[rep.createdBy]}
                                  </span>
                                )}
                              </div>

                              {rep.updatedBy && (
                                <span className="block text-[10px] text-amber-700 font-semibold mt-0.5">
                                  ✏️ Modificado por {nombres[rep.updatedBy] ?? rep.updatedBy}
                                  {roles[rep.updatedBy]
                                    ? ` (${ETIQUETA_ROL[roles[rep.updatedBy]] ?? roles[rep.updatedBy]})`
                                    : ''}
                                  {rep.updatedAt ? ` · ${fmtFechaHora(rep.updatedAt)}` : ''}
                                </span>
                              )}
                            </div>

                            {puedeRegistrar && (
                              <div className="flex items-center gap-1 ml-1">
                                <form action={toggleResalteReporteLaboratorio}>
                                  <input type="hidden" name="episodeId" value={episodeId} />
                                  <input type="hidden" name="reportId" value={rep.id} />
                                  <button
                                    type="submit"
                                    title={
                                      esImportante
                                        ? 'Quitar resalte de resultado alterado/importante'
                                        : 'Resaltar como resultado alterado o importante'
                                    }
                                    className={`px-1.5 py-1 rounded border transition-colors cursor-pointer ${
                                      esImportante
                                        ? 'border-red-300 bg-red-100 text-red-700 hover:bg-red-200'
                                        : 'border-amber-200 text-amber-700 hover:bg-amber-50'
                                    }`}
                                  >
                                    <Highlighter className="w-3.5 h-3.5" />
                                  </button>
                                </form>
                                <button
                                  type="button"
                                  onClick={() => abrirEdicion(rep)}
                                  title="Editar reporte de laboratorio"
                                  className="px-1.5 py-1 rounded border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                                >
                                  ✏️
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setReporteAEliminar(rep)}
                                  title="Eliminar reporte de laboratorio"
                                  className="px-1.5 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                >
                                  🗑️
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {puedeRegistrar && (
        <div className="pt-2 border-t">
          {!formAbierto ? (
            <button
              type="button"
              onClick={() => setFormAbierto(true)}
              className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1.5 py-1 cursor-pointer"
            >
              <span className="text-sm font-bold bg-teal-100 text-teal-800 w-5 h-5 rounded-full flex items-center justify-center">
                +
              </span>
              Agregar nueva analítica de laboratorio
            </button>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 mt-2 animate-fadeIn">
              <div className="flex justify-between items-center mb-2 pb-1 border-b border-slate-200">
                <span className="text-xs font-bold text-slate-700 uppercase">
                  Registrar Resultado de Laboratorio
                </span>
                <button
                  type="button"
                  onClick={() => setFormAbierto(false)}
                  className="text-xs text-slate-400 hover:text-slate-600 font-semibold cursor-pointer"
                >
                  ✕ Cerrar
                </button>
              </div>

              <form
                action={async (formData) => {
                  await guardarReporteLaboratorio(formData)
                  setFormAbierto(false)
                  setAnaliticaElegida('')
                }}
                className="space-y-3"
              >
                <input type="hidden" name="episodeId" value={episodeId} />
                {!esOtroNuevo && <input type="hidden" name="category" value={categoriaElegida} />}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Seleccionar Analítica / Examen *
                    </label>
                    <select
                      name="testName"
                      required
                      value={analiticaElegida}
                      onChange={handleSelect}
                      className="w-full px-2.5 py-1.5 border rounded-lg text-xs bg-white text-slate-900 focus:ring-2 focus:ring-teal-500 outline-none"
                    >
                      <option value="">Seleccione un análisis...</option>
                      {Object.entries(CATALOGO_LAB).map(([grupo, items]) => (
                        <optgroup key={grupo} label={grupo}>
                          {items.map((item) => (
                            <option key={item} value={item}>
                              {item}
                            </option>
                          ))}
                          {grupo === 'III- CULTIVOS Y BACTERIOLOGÍA' && (
                            <option value="OTRO_CULTIVO">Otro cultivo no listado...</option>
                          )}
                        </optgroup>
                      ))}
                      <optgroup label="OTRA">
                        <option value="OTRO">Otra analítica no listada...</option>
                      </optgroup>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Fecha de la Muestra
                    </label>
                    <input
                      name="sampleDate"
                      type="date"
                      className="w-full px-2.5 py-1.5 border rounded-lg text-xs bg-white text-slate-900"
                    />
                  </div>
                </div>

                {esOtroNuevo && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        {analiticaElegida === 'OTRO_CULTIVO'
                          ? 'Escriba el nombre del cultivo *'
                          : 'Escriba el nombre de la analítica *'}
                      </label>
                      <input
                        name="customTest"
                        required
                        placeholder={
                          analiticaElegida === 'OTRO_CULTIVO'
                            ? 'Ej. Cultivo de punta de catéter, Líquido pleural...'
                            : 'Ej. Procalcitonina, Dímero D...'
                        }
                        className="w-full px-2.5 py-1.5 border rounded-lg text-xs bg-white text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Grupo / Categoría
                      </label>
                      <select
                        name="category"
                        value={categoriaElegida}
                        onChange={(e) => setCategoriaElegida(e.target.value)}
                        className="w-full px-2.5 py-1.5 border rounded-lg text-xs bg-white text-slate-900"
                      >
                        {GRUPOS_LAB.map((g) => (
                          <option key={g.id} value={g.id}>
                            {g.titulo}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Resultado / Valores *
                  </label>
                  <TextareaConDeshacer
                    name="result"
                    rows={2}
                    required
                    conFormatoClinico
                    placeholder="Escribe los valores obtenidos (ej. WBC: 8.5, Hb: ==6.8 g/dL==...)"
                    className="w-full px-2.5 py-1.5 border rounded-lg text-xs font-mono text-slate-900 focus:ring-2 focus:ring-teal-500"
                  />
                  <label className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-red-800 bg-red-50 border border-red-200 px-2.5 py-1.5 rounded-lg cursor-pointer select-none">
                    <input
                      type="checkbox"
                      name="isImportant"
                      className="rounded border-red-400 text-red-600 focus:ring-red-500"
                    />
                    <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                    <span>Marcar analítica completa como valor alterado / importante</span>
                  </label>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    className="flex-1 bg-teal-700 text-white py-2 rounded-lg text-xs font-bold hover:bg-teal-800 transition-colors shadow-sm cursor-pointer"
                  >
                    Guardar Resultado
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormAbierto(false)}
                    className="px-3 py-2 border rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* MODAL EDITAR REPORTE DE LABORATORIO */}
      {reporteEditando && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-3">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-sm font-bold text-slate-800">✏️ Editar Reporte de Laboratorio</h3>
              <button
                type="button"
                onClick={() => setReporteEditando(null)}
                className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form
              key={reporteEditando.id}
              action={async (formData) => {
                await editarReporteLaboratorio(formData)
                setReporteEditando(null)
              }}
              className="space-y-3"
            >
              <input type="hidden" name="episodeId" value={episodeId} />
              <input type="hidden" name="reportId" value={reporteEditando.id} />
              {!esOtroEdit && <input type="hidden" name="category" value={editCategoria} />}

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Analítica / Examen *
                </label>
                <select
                  name="testName"
                  required
                  value={editAnalitica}
                  onChange={handleSelectEdit}
                  className="w-full px-2.5 py-1.5 border rounded-lg text-xs bg-white text-slate-900"
                >
                  {Object.entries(CATALOGO_LAB).map(([grupo, items]) => (
                    <optgroup key={grupo} label={grupo}>
                      {items.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                      {grupo === 'III- CULTIVOS Y BACTERIOLOGÍA' && (
                        <option value="OTRO_CULTIVO">Otro cultivo no listado...</option>
                      )}
                    </optgroup>
                  ))}
                  <optgroup label="OTRA">
                    <option value="OTRO">Otra analítica no listada...</option>
                  </optgroup>
                </select>
              </div>

              {esOtroEdit && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Nombre personalizado *
                    </label>
                    <input
                      name="customTest"
                      required
                      value={editCustomTest}
                      onChange={(e) => setEditCustomTest(e.target.value)}
                      className="w-full px-2.5 py-1.5 border rounded-lg text-xs text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Categoría
                    </label>
                    <select
                      name="category"
                      value={editCategoria}
                      onChange={(e) => setEditCategoria(e.target.value)}
                      className="w-full px-2.5 py-1.5 border rounded-lg text-xs bg-white text-slate-900"
                    >
                      {GRUPOS_LAB.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.titulo}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Fecha de la Muestra
                </label>
                <input
                  name="sampleDate"
                  type="date"
                  defaultValue={fechaInputValue(reporteEditando.sampleDate)}
                  className="w-full px-2.5 py-1.5 border rounded-lg text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Resultado / Valores *
                </label>
                <TextareaConDeshacer
                  name="result"
                  rows={3}
                  required
                  conFormatoClinico
                  defaultValue={parseResultadoLab(reporteEditando.result).texto}
                  className="w-full px-2.5 py-1.5 border rounded-lg text-xs font-mono text-slate-900"
                />
                <label className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-red-800 bg-red-50 border border-red-200 px-2.5 py-1.5 rounded-lg cursor-pointer select-none w-full">
                  <input
                    type="checkbox"
                    name="isImportant"
                    defaultChecked={parseResultadoLab(reporteEditando.result).esImportante}
                    className="rounded border-red-400 text-red-600 focus:ring-red-500"
                  />
                  <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                  <span>Marcar analítica como valor alterado / importante</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setReporteEditando(null)}
                  className="px-3 py-1.5 border rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 cursor-pointer"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMAR ELIMINACIÓN */}
      {reporteAEliminar && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-red-200 space-y-3">
            <h3 className="text-sm font-bold text-red-800">🗑️ Eliminar Reporte de Laboratorio</h3>
            <p className="text-xs text-slate-600">
              ¿Seguro que deseas eliminar el reporte <strong>{reporteAEliminar.testName}</strong>? Quedará registrado en la auditoría clínica.
            </p>
            <form
              action={async (formData) => {
                await eliminarReporteLaboratorio(formData)
                setReporteAEliminar(null)
              }}
              className="flex justify-end gap-2 pt-2"
            >
              <input type="hidden" name="episodeId" value={episodeId} />
              <input type="hidden" name="reportId" value={reporteAEliminar.id} />
              <button
                type="button"
                onClick={() => setReporteAEliminar(null)}
                className="px-3 py-1.5 border rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-red-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-red-700 cursor-pointer"
              >
                Sí, eliminar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}