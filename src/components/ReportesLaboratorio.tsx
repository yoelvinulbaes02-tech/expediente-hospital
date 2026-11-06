'use client'

import { useState, useMemo } from 'react'
import { guardarReporteLaboratorio } from '@/app/dashboard/paciente/[id]/actions-clinicas'
import { TextareaConDeshacer } from '@/components/TextareaConDeshacer'

type ReporteLab = {
  id: string
  category: string
  testName: string
  sampleDate: Date | null
  result: string
  createdBy: string
  createdAt: Date
}

const ETIQUETA_ROL: Record<string, string> = {
  ADMIN: 'Admin',
  DOCTOR: 'Médico',
  RESIDENT: 'Residente',
  NURSE: 'Enf.',
  LAB: 'Laboratorio',
  READONLY: 'Lectura',
}

const GRUPOS_LAB = [
  { id: 'HEMATOLOGÍA', icono: '🩸', titulo: 'Hematología' },
  { id: 'QUÍMICA SANGUÍNEA', icono: '🧪', titulo: 'Química Sanguínea' },
  { id: 'UROANÁLISIS', icono: '🟡', titulo: 'Uroanálisis' },
  { id: 'CULTIVOS Y BACTERIOLOGÍA', icono: '🧫', titulo: 'Cultivos y Bacteriología' },
  { id: 'PARASITOLOGÍA Y LÍQUIDOS', icono: '🔬', titulo: 'Parasitología y Líquidos' },
  { id: 'SEROLOGÍA E INMUNOLOGÍA', icono: '🛡️', titulo: 'Serología e Inmunología' },
  { id: 'OTRAS ANALÍTICAS', icono: '📋', titulo: 'Otras Analíticas' },
]

function normalizarCat(cat: string): string {
  const c = cat.toUpperCase()
  if (c.includes('HEMATO')) return 'HEMATOLOGÍA'
  if (c.includes('QUÍM') || c.includes('QUIM')) return 'QUÍMICA SANGUÍNEA'
  if (c.includes('URO')) return 'UROANÁLISIS'
  if (c.includes('CULTIV') || c.includes('BACTER')) return 'CULTIVOS Y BACTERIOLOGÍA'
  if (c.includes('PARASIT') || c.includes('LÍQUID') || c.includes('LIQUID')) return 'PARASITOLOGÍA Y LÍQUIDOS'
  if (c.includes('SEROL') || c.includes('INMUNO')) return 'SEROLOGÍA E INMUNOLOGÍA'
  return 'OTRAS ANALÍTICAS'
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
  const [abiertos, setAbiertos] = useState<Record<string, boolean>>({
    HEMATOLOGÍA: true, // Abierto por defecto para revisión rápida
    'QUÍMICA SANGUÍNEA': true,
  })

  const [formAbierto, setFormAbierto] = useState(false)
  const [analiticaElegida, setAnaliticaElegida] = useState('')
  const [categoriaElegida, setCategoriaElegida] = useState('HEMATOLOGÍA')

  function toggleGrupo(id: string) {
    setAbiertos((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  function handleSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value
    setAnaliticaElegida(val)
    const opt = e.target.selectedOptions[0]
    const optgroup = opt?.parentElement as HTMLOptGroupElement | null
    if (optgroup?.label) {
      setCategoriaElegida(optgroup.label.replace(/^[IVXLC]+-\s*/, ''))
    }
  }

  // Filtrado en tiempo real con la barra de búsqueda
  const filtrados = useMemo(() => {
    if (!busqueda.trim()) return reportes
    const q = busqueda.toLowerCase().trim()
    return reportes.filter(
      (r) =>
        r.testName.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.result.toLowerCase().includes(q)
    )
  }, [reportes, busqueda])

  // Agrupación de los análisis filtrados por categoría
  const gruposConDatos = useMemo(() => {
    const mapa: Record<string, ReporteLab[]> = {}
    filtrados.forEach((r) => {
      const catKey = normalizarCat(r.category)
      if (!mapa[catKey]) mapa[catKey] = []
      mapa[catKey].push(r)
    })
    return mapa
  }, [filtrados])

  const hayBusqueda = busqueda.trim().length > 0

  return (
    <div className="bg-white p-4 md:p-5 rounded-xl shadow-sm border border-slate-200">
      {/* CABECERA CON LUPA DE BÚSQUEDA SIEMPRE VISIBLE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🧪</span>
          <h2 className="text-base font-bold text-slate-800">Reportes de Laboratorio</h2>
          <span className="text-xs bg-teal-50 text-teal-800 font-bold px-2 py-0.5 rounded-full border border-teal-200">
            {reportes.length} analítica{reportes.length === 1 ? '' : 's'}
          </span>
        </div>

        {/* LUPA Y BUSCADOR COMPACTO */}
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

      {/* LISTA COMPACTA EN DESPLEGABLES AGRUPADOS (ACORDEÓN) */}
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

            // Si hay búsqueda activa, se mantiene abierto automáticamente
            const estaAbierto = hayBusqueda || !!abiertos[g.id]

            return (
              <div key={g.id} className="border border-slate-200 rounded-lg overflow-hidden">
                {/* RENGLÓN PRINCIPAL DEL GRUPO (BOTÓN DESPLEGABLE) */}
                <button
                  type="button"
                  onClick={() => toggleGrupo(g.id)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-left transition-colors select-none"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base">{g.icono}</span>
                    <strong className="text-xs font-bold text-slate-800 uppercase tracking-wider truncate">
                      {g.titulo}
                    </strong>
                    <span className="text-[11px] font-bold px-2 py-0.2 rounded-full bg-white text-slate-600 border border-slate-200 shadow-2xs">
                      {items.length}
                    </span>
                  </div>

                  <span className="text-xs font-bold text-slate-400 ml-2">
                    {estaAbierto ? '▲ Colapsar' : '▼ Ver análisis'}
                  </span>
                </button>

                {/* CONTENIDO DESPLEGADO COMPACTO */}
                {estaAbierto && (
                  <div className="border-t border-slate-200 divide-y divide-slate-100 bg-white">
                    {items.map((rep) => (
                      <div
                        key={rep.id}
                        className="p-2.5 sm:px-4 sm:py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 hover:bg-slate-50/80 transition-colors text-xs"
                      >
                        {/* Nombre del análisis */}
                        <div className="sm:w-2/5 min-w-0">
                          <strong className="text-slate-800 font-semibold">{rep.testName}</strong>
                          {rep.sampleDate && (
                            <span className="block sm:inline sm:ml-2 text-[11px] text-slate-400">
                              {rep.sampleDate.toLocaleDateString('es-DO', {
                                timeZone: 'America/Santo_Domingo',
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                              })}
                            </span>
                          )}
                        </div>

                        {/* Resultado en fuente monoespaciada */}
                        <div className="sm:w-2/5 font-mono font-bold text-slate-900 bg-slate-50 border border-slate-200/80 rounded px-2.5 py-1 text-xs whitespace-pre-line">
                          {rep.result}
                        </div>

                        {/* Quién registró */}
                        <div className="sm:w-1/5 text-right text-[11px] text-slate-500 whitespace-nowrap shrink-0">
                          <span>{nombres[rep.createdBy] ?? rep.createdBy}</span>
                          {roles[rep.createdBy] && (
                            <span className="ml-1 text-[10px] bg-slate-100 text-slate-600 px-1 py-0.2 rounded border font-semibold">
                              {ETIQUETA_ROL[roles[rep.createdBy]] ?? roles[rep.createdBy]}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* BOTÓN COLAPSADO PARA REGISTRAR NUEVA ANALÍTICA */}
      {puedeRegistrar && (
        <div className="pt-2 border-t">
          {!formAbierto ? (
            <button
              type="button"
              onClick={() => setFormAbierto(true)}
              className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1.5 py-1"
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
                  className="text-xs text-slate-400 hover:text-slate-600 font-semibold"
                >
                  ✕ Cerrar
                </button>
              </div>

              <form
                action={async (formData) => {
                  await guardarReporteLaboratorio(formData)
                  setFormAbierto(false)
                }}
                className="space-y-3"
              >
                <input type="hidden" name="episodeId" value={episodeId} />
                <input type="hidden" name="category" value={categoriaElegida} />

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

                      <optgroup label="I- HEMATOLOGÍA">
                        <option value="Hemograma Completo">Hemograma Completo</option>
                        <option value="Recuento de Plaquetas">Recuento de Plaquetas</option>
                        <option value="Tiempo de Protrombina (TP)">Tiempo de Protrombina (TP)</option>
                        <option value="Tiempo Parcial de Tromboplastina (TPT)">Tiempo Parcial de Tromboplastina (TPT)</option>
                        <option value="Tiempo de Sangría">Tiempo de Sangría</option>
                        <option value="Tiempo de Coagulación">Tiempo de Coagulación</option>
                        <option value="Tipificación y RH">Tipificación y RH</option>
                        <option value="Test de Coombs Directo-Indirecto">Test de Coombs Directo-Indirecto</option>
                        <option value="Conteo total de Eosinófilos">Conteo total de Eosinófilos</option>
                        <option value="Conteo de Reticulocitos">Conteo de Reticulocitos</option>
                        <option value="Eritrosedimentación (VSG)">Eritrosedimentación (VSG)</option>
                        <option value="Investigación de Hematozoarios (Gota Gruesa)">Investigación de Hematozoarios (Gota Gruesa)</option>
                        <option value="Investigación de Filarias">Investigación de Filarias</option>
                        <option value="Fragilidad Globular">Fragilidad Globular</option>
                        <option value="Inv. Células Falciformes (Falcia)">Inv. Células Falciformes (Falcia)</option>
                        <option value="Inv. de Células L.E.">Inv. de Células L.E.</option>
                        <option value="Electroforesis de Hemoglobina">Electroforesis de Hemoglobina</option>
                      </optgroup>

                      <optgroup label="II- UROANÁLISIS">
                        <option value="Examen de Orina Completo">Examen de Orina Completo</option>
                        <option value="Proteína en Orina de 24 Horas">Proteína en Orina de 24 Horas</option>
                        <option value="Depuración Endógena de Creatinina (DCE)">Depuración Endógena de Creatinina (DCE)</option>
                        <option value="Gravindex (HCG Orina)">Gravindex (HCG Orina)</option>
                      </optgroup>

                      <optgroup label="III- CULTIVOS Y BACTERIOLOGÍA">
                        <option value="Urocultivo">Urocultivo</option>
                        <option value="Hemocultivo">Hemocultivo</option>
                        <option value="Coprocultivo">Coprocultivo</option>
                        <option value="Cultivo de Secreción de Absceso">Cultivo de Secreción de Absceso</option>
                        <option value="Cultivo de Secreción de Úlcera">Cultivo de Secreción de Úlcera</option>
                        <option value="Cultivo de Secreción de Fístula">Cultivo de Secreción de Fístula</option>
                        <option value="Cultivo de Secreción de Esputo">Cultivo de Secreción de Esputo</option>
                        <option value="Cultivo de Secreción Faríngea">Cultivo de Secreción Faríngea</option>
                        <option value="Cultivo de Secreción Ótica">Cultivo de Secreción Ótica</option>
                        <option value="Cultivo de Secreción Ocular">Cultivo de Secreción Ocular</option>
                        <option value="Cultivo de Secreción Ganglionar">Cultivo de Secreción Ganglionar</option>
                        <option value="Cultivo de Secreción Endocervical">Cultivo de Secreción Endocervical</option>
                        <option value="Cultivo de Secreción Intraabdominal">Cultivo de Secreción Intraabdominal</option>
                        <option value="Cultivo de LCR">Cultivo de LCR</option>
                        <option value="Extendido de Secreción Vaginal">Extendido de Secreción Vaginal</option>
                        <option value="Extendido de Secreción Uretral">Extendido de Secreción Uretral</option>
                        <option value="Conteo de Eosinófilos en Ext. Mucoso">Conteo de Eosinófilos en Ext. Mucoso</option>
                        <option value="Baciloscopia (BAAR)">Baciloscopia (BAAR)</option>
                        <option value="BK - Orina 24 Horas">BK - Orina 24 Horas</option>
                      </optgroup>

                      <optgroup label="IV- PARASITOLOGÍA Y LÍQUIDOS">
                        <option value="Coprológico">Coprológico</option>
                        <option value="Investigación Sangre Oculta en Heces">Investigación Sangre Oculta en Heces</option>
                        <option value="Investigación de Amebas">Investigación de Amebas</option>
                        <option value="Investigación de Leishmania">Investigación de Leishmania</option>
                        <option value="Investigación Disacáridos en Heces">Investigación Disacáridos en Heces</option>
                        <option value="Prueba de Digestión en Heces">Prueba de Digestión en Heces</option>
                        <option value="Citoquímico de Líquido Biológico">Citoquímico de Líquido Biológico</option>
                      </optgroup>

                      <optgroup label="VI- QUÍMICA SANGUÍNEA">
                        <option value="Creatinina">Creatinina</option>
                        <option value="Nitrógeno Ureico (BUN)">Nitrógeno Ureico (BUN)</option>
                        <option value="Glicemia en Ayunas">Glicemia en Ayunas</option>
                        <option value="Glicemia Post Prandial">Glicemia Post Prandial</option>
                        <option value="Hb Glicosilada (HbA1c)">Hb Glicosilada (HbA1c)</option>
                        <option value="Curva Tolerancia a la Glucosa">Curva Tolerancia a la Glucosa</option>
                        <option value="Electrolitos Séricos (Na, K, Cl)">Electrolitos Séricos (Na, K, Cl)</option>
                        <option value="Calcio">Calcio</option>
                        <option value="Fósforo">Fósforo</option>
                        <option value="Cloro">Cloro</option>
                        <option value="Gasometría Arterial">Gasometría Arterial</option>
                        <option value="Ácido Úrico">Ácido Úrico</option>
                        <option value="Colesterol Total">Colesterol Total</option>
                        <option value="Colesterol HDL y LDL">Colesterol HDL y LDL</option>
                        <option value="Triglicéridos">Triglicéridos</option>
                        <option value="Transaminasas (AST / SGOT)">Transaminasas (AST / SGOT)</option>
                        <option value="Transaminasas (ALT / SGPT)">Transaminasas (ALT / SGPT)</option>
                        <option value="Bilirrubina Total y Fraccionada (D-I-T)">Bilirrubina Total y Fraccionada (D-I-T)</option>
                        <option value="Fosfatasa Alcalina">Fosfatasa Alcalina</option>
                        <option value="Fosfatasa Ácida">Fosfatasa Ácida</option>
                        <option value="Amilasa Sérica">Amilasa Sérica</option>
                        <option value="Lipasa Sérica">Lipasa Sérica</option>
                        <option value="Proteínas Totales y Fraccionadas">Proteínas Totales y Fraccionadas</option>
                        <option value="L.D.H.">L.D.H.</option>
                        <option value="C.P.K. Total">C.P.K. Total</option>
                        <option value="CK-MB">CK-MB</option>
                        <option value="Troponinas Cualí-Cuantitativa">Troponinas Cualí-Cuantitativa</option>
                        <option value="PSA Libre - Total">PSA Libre - Total</option>
                        <option value="Electroforesis de Proteína">Electroforesis de Proteína</option>
                      </optgroup>

                      <optgroup label="VII- SEROLOGÍA E INMUNOLOGÍA">
                        <option value="HIV I-II">HIV I-II</option>
                        <option value="HBsAg (Hepatitis B)">HBsAg (Hepatitis B)</option>
                        <option value="HCV (Hepatitis C)">HCV (Hepatitis C)</option>
                        <option value="V.D.R.L.">V.D.R.L.</option>
                        <option value="F.T.A. - A.B.S.">F.T.A. - A.B.S.</option>
                        <option value="F.T.A. en L.C.R.">F.T.A. en L.C.R.</option>
                        <option value="TSH">TSH</option>
                        <option value="T-3">T-3</option>
                        <option value="T-4">T-4</option>
                        <option value="T-4 Libre">T-4 Libre</option>
                        <option value="Proteína C Reactiva (PCR)">Proteína C Reactiva (PCR)</option>
                        <option value="Factor Reumatoide">Factor Reumatoide</option>
                        <option value="Antiestreptolisina O (ASO)">Antiestreptolisina O (ASO)</option>
                        <option value="Streptozime">Streptozime</option>
                        <option value="Detección Anticuerpos Antinucleares (ANA)">Detección Anticuerpos Antinucleares (ANA)</option>
                        <option value="Anti D.N.A.">Anti D.N.A.</option>
                        <option value="Inmunoglobulinas (IgG - IgA - IgM)">Inmunoglobulinas (IgG - IgA - IgM)</option>
                        <option value="Antígenos Febriles">Antígenos Febriles</option>
                        <option value="Dengue IgG / IgM">Dengue IgG / IgM</option>
                        <option value="Inv. de Toxoplasmosis (anti IgG / IgM)">Inv. de Toxoplasmosis (anti IgG / IgM)</option>
                        <option value="Helicobacter pylori">Helicobacter pylori</option>
                        <option value="Leptospira">Leptospira</option>
                      </optgroup>

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
                      className="w-full px-2.5 py-1.5