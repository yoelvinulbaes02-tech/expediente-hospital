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
    HEMATOLOGÍA: true,
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🧪</span>
          <h2 className="text-base font-bold text-slate-800">Reportes de Laboratorio</h2>
          <span className="text-xs bg-teal-50 text-teal-800 font-bold px-2 py-0.5 rounded-full border border-teal-200">
            {reportes.length} analítica{reportes.length === 1 ? '' : 's'}
          </span>
        </div>

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

            const estaAbierto = hayBusqueda || !!abiertos[g.id]

            return (
              <div key={g.id} className="border border-slate-200 rounded-lg overflow-hidden">
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
                    {items.map((rep) => (
                      <div
                        key={rep.id}
                        className="p-2.5 sm:px-4 sm:py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 hover:bg-slate-50/80 transition-colors text-xs"
                      >
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

                        <div className="sm:w-2/5 font-mono font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded px-2.5 py-1 text-xs whitespace-pre-line">
                          {rep.result}
                        </div>

                        <div className="sm:w-1/5 text-right text-[11px] text-slate-500 whitespace-nowrap shrink-0">
                          <span>{nombres[rep.createdBy] ?? rep.createdBy}</span>
                          {roles[rep.createdBy] && (
                            <span className="ml-1 text-[10px] bg-slate-100 text-slate-600 px-1 py-0.5 rounded border font-semibold">
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
                      {Object.entries(CATALOGO_LAB).map(([grupo, items]) => (
                        <optgroup key={grupo} label={grupo}>
                          {items.map((item) => (
                            <option key={item} value={item}>
                              {item}
                            </option>
                          ))}
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

                {analiticaElegida === 'OTRO' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Escriba el nombre de la analítica *
                    </label>
                    <input
                      name="customTest"
                      required
                      placeholder="Ej. Procalcitonina, Dimero D..."
                      className="w-full px-2.5 py-1.5 border rounded-lg text-xs text-slate-900"
                    />
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
                    placeholder="Escribe los valores obtenidos (ej. 60 mm/h, o WBC: 8.5, Hb: 12.3...)"
                    className="w-full px-2.5 py-1.5 border rounded-lg text-xs font-mono text-slate-900 focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    className="flex-1 bg-teal-700 text-white py-2 rounded-lg text-xs font-bold hover:bg-teal-800 transition-colors shadow-sm"
                  >
                    Guardar Resultado
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormAbierto(false)}
                    className="px-3 py-2 border rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  )
}