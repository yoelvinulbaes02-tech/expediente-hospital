'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export type AuditItem = {
  id: string
  seq: number
  action: string
  entity: string
  entityId: string | null
  patientId: string | null
  episodeId: string | null
  actorId: string
  actorRole: string
  actorName: string
  reason: string | null
  entryHash: string
  serverTs: string
}

const ETIQUETA_ACCION: Record<string, { label: string; color: string }> = {
  create: { label: 'Creación', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' },
  update: { label: 'Modificación', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' },
  delete: { label: 'Eliminación', color: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' },
  discharge: { label: 'Alta Médica', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300' },
}

const fmtFechaHora = (iso: string) => {
  const f = new Date(iso)
  return f.toLocaleString('es-DO', {
    timeZone: 'America/Santo_Domingo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export function TablaAuditoria({
  logs,
  fechaDesde,
  fechaHasta,
  queryInicial,
}: {
  logs: AuditItem[]
  fechaDesde: string
  fechaHasta: string
  queryInicial: string
}) {
  const router = useRouter()
  const [desde, setDesde] = useState(fechaDesde)
  const [hasta, setHasta] = useState(fechaHasta)
  const [busqueda, setBusqueda] = useState(queryInicial)

  // APLICAR FILTROS HISTÓRICOS AL SERVIDOR
  const aplicarFiltros = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (desde) params.set('desde', desde)
    if (hasta) params.set('hasta', hasta)
    if (busqueda.trim()) params.set('q', busqueda.trim())
    router.push(`/dashboard/auditoria?${params.toString()}`)
  }

  const limpiarFiltros = () => {
    setDesde('')
    setHasta('')
    setBusqueda('')
    router.push('/dashboard/auditoria')
  }

  // EXPORTAR REPORTE OFICIAL EN FORMATO EXCEL (CSV CON UTF-8 BOM)
  const exportarExcel = () => {
    if (logs.length === 0) return

    const encabezados = [
      'Secuencia',
      'Fecha y Hora',
      'Usuario / Profesional',
      'Rol',
      'Accion',
      'Entidad',
      'ID Paciente',
      'Motivo / Detalle',
      'Hash de Seguridad',
    ]

    const sanitizarCsv = (valor: string | number) => {
      const s = String(valor ?? '')
      const seguro = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s
      return `"${seguro.replace(/"/g, '""')}"`
    }

    const filas = logs.map((log) => [
      log.seq,
      sanitizarCsv(fmtFechaHora(log.serverTs)),
      sanitizarCsv(log.actorName),
      sanitizarCsv(log.actorRole),
      sanitizarCsv(log.action),
      sanitizarCsv(log.entity),
      sanitizarCsv(log.patientId ?? '—'),
      sanitizarCsv(log.reason ?? 'Sin detalle'),
      sanitizarCsv(log.entryHash),
    ])

    // \uFEFF PERMITE QUE EXCEL ABRA CORRECTAMENTE CARACTERES EN ESPAÑOL (TILDES, Ñ)
    const contenidoCSV = '\uFEFF' + [encabezados.join(','), ...filas.map((f) => f.join(','))].join('\n')

    const blob = new Blob([contenidoCSV], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const fechaDescarga = new Date().toISOString().slice(0, 10)
    link.href = url
    link.download = `Auditoria_NEXO_${fechaDescarga}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      {/* BARRA DE FILTROS POR FECHA Y EXPORTACIÓN */}
      <form
        onSubmit={aplicarFiltros}
        className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row items-stretch md:items-end justify-between gap-3"
      >
        <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 flex-1">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              📅 Fecha Desde:
            </label>
            <input
              type="date"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              📅 Fecha Hasta:
            </label>
            <input
              type="date"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
            />
          </div>

          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              🔍 Búsqueda:
            </label>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Doctor, paciente, motivo..."
              className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg text-xs transition-colors shadow-sm cursor-pointer whitespace-nowrap"
            >
              Filtrar
            </button>
            {(desde || hasta || busqueda) && (
              <button
                type="button"
                onClick={limpiarFiltros}
                className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-3 py-2 rounded-lg text-xs font-medium hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>

        {/* BOTÓN OFICIAL DE EXPORTAR A EXCEL */}
        <button
          type="button"
          onClick={exportarExcel}
          disabled={logs.length === 0}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50"
        >
          <span>📥</span> Exportar a Excel (CSV)
        </button>
      </form>

      {/* TABLA DE AUDITORÍA */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-x-auto">
        <table className="w-full text-xs text-left">
          <thead className="bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-3.5 py-3 whitespace-nowrap font-bold">N°</th>
              <th className="px-3.5 py-3 whitespace-nowrap font-bold">Fecha / Hora</th>
              <th className="px-3.5 py-3 whitespace-nowrap font-bold">Profesional</th>
              <th className="px-3.5 py-3 whitespace-nowrap font-bold">Acción</th>
              <th className="px-3.5 py-3 whitespace-nowrap font-bold">Entidad</th>
              <th className="px-3.5 py-3 font-bold">Motivo / Detalle Clínico</th>
              <th className="px-3.5 py-3 whitespace-nowrap font-bold text-right">Hash Criptográfico</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {logs.map((log) => {
              const accionInfo = ETIQUETA_ACCION[log.action] ?? {
                label: log.action,
                color: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
              }

              return (
                <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="px-3.5 py-2.5 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                    #{log.seq}
                  </td>
                  <td className="px-3.5 py-2.5 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                    {fmtFechaHora(log.serverTs)}
                  </td>
                  <td className="px-3.5 py-2.5 whitespace-nowrap">
                    <strong className="text-slate-800 dark:text-slate-200 block">
                      {log.actorName}
                    </strong>
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold uppercase">
                      {log.actorRole}
                    </span>
                  </td>
                  <td className="px-3.5 py-2.5 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${accionInfo.color}`}>
                      {accionInfo.label}
                    </span>
                  </td>
                  <td className="px-3.5 py-2.5 font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap">
                    {log.entity}
                  </td>
                  <td className="px-3.5 py-2.5 text-slate-700 dark:text-slate-200 max-w-md wrap-break-word">
                    {log.reason ?? 'Sin motivo registrado'}
                  </td>
                  <td className="px-3.5 py-2.5 text-right font-mono text-[10px] text-slate-400 whitespace-nowrap">
                    <span title={log.entryHash} className="cursor-help">
                      {log.entryHash.slice(0, 10)}…{log.entryHash.slice(-6)}
                    </span>
                  </td>
                </tr>
              )
            })}

            {logs.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-8 text-slate-400">
                  No se encontraron movimientos para el filtro seleccionado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}