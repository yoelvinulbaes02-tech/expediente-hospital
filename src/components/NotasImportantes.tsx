import { crearNotaImportante, resolverNotaImportante } from '@/app/dashboard/paciente/[id]/actions-clinicas'

type Alerta = {
  id: string
  content: string
  createdBy: string
  createdAt: Date
}

export function NotasImportantes({
  episodeId,
  alertas,
  nombres,
  puedeRegistrar,
}: {
  episodeId: string
  alertas: Alerta[]
  nombres: Record<string, string>
  puedeRegistrar: boolean
}) {
  return (
    <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 shadow-sm mb-6">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">📌</span>
          <h2 className="text-sm font-bold uppercase tracking-wider text-amber-900">
            Notas Importantes y Avisos Clínicos
          </h2>
        </div>
        {alertas.length > 0 && (
          <span className="text-xs bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded-full">
            {alertas.length} aviso{alertas.length === 1 ? '' : 's'}
          </span>
        )}
      </div>

      {alertas.length === 0 ? (
        <p className="text-xs text-amber-700 italic">No hay avisos destacados en este momento.</p>
      ) : (
        <div className="space-y-2 mb-3">
          {alertas.map((a) => (
            <div
              key={a.id}
              className="bg-white border border-amber-200 rounded-lg p-3 flex items-start justify-between gap-3 shadow-xs"
            >
              <div className="text-sm text-slate-800">
                <p className="font-semibold">{a.content}</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Por {nombres[a.createdBy] ?? a.createdBy} ·{' '}
                  {a.createdAt.toLocaleString('es-DO', {
                    timeZone: 'America/Santo_Domingo',
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>

              {puedeRegistrar && (
                <form action={resolverNotaImportante}>
                  <input type="hidden" name="episodeId" value={episodeId} />
                  <input type="hidden" name="alertId" value={a.id} />
                  <button
                    type="submit"
                    title="Resolver / Quitar aviso"
                    className="text-xs text-slate-400 hover:text-red-600 px-2 py-1 rounded hover:bg-slate-50 transition-colors"
                  >
                    ✕ Retirar
                  </button>
                </form>
              )}
            </div>
          ))}
        </div>
      )}

      {puedeRegistrar && (
        <form action={crearNotaImportante} className="flex gap-2 mt-2 pt-2 border-t border-amber-200">
          <input type="hidden" name="episodeId" value={episodeId} />
          <input
            name="content"
            required
            placeholder="Escribir aviso destacado (ej. Difícil acceso venoso, En aislamiento...)"
            className="flex-1 px-3 py-2 border border-amber-300 rounded-lg text-base md:text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <button
            type="submit"
            className="bg-amber-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-amber-700 transition-colors shrink-0"
          >
            + Fijar Aviso
          </button>
        </form>
      )}
    </div>
  )
}