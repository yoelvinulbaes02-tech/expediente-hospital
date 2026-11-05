import { crearTarea, marcarTarea } from '@/app/dashboard/paciente/[id]/actions-tareas'

type Tarea = {
  id: string
  title: string
  category: string
  dueAt: Date | null
  status: string
  createdBy: string
  doneBy: string | null
  doneAt: Date | null
  cancelReason: string | null
}

type Props = {
  episodeId: string
  tareas: Tarea[]
  nombres: Record<string, string>
  puedeMarcar: boolean
  puedeEditar: boolean // cancelar tareas (solo el médico a cargo)
  puedeAgregar: boolean // agregar tareas (personal clínico)
}

const CATEGORIAS: Record<string, string> = {
  analisis: 'Análisis',
  estudio: 'Estudio',
  indicacion: 'Indicación',
  otro: 'Otro',
}

const ORDEN: Record<string, number> = { pendiente: 0, hecha: 1, cancelada: 2 }

const fmt = (d: Date) =>
  d.toLocaleString('es-DO', {
    timeZone: 'America/Santo_Domingo',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })

export function ChecklistTareas({ episodeId, tareas, nombres, puedeMarcar, puedeEditar, puedeAgregar }: Props) {
  const ahora = new Date().getTime()
  const pendientes = tareas.filter((t) => t.status === 'pendiente').length
  const hechas = tareas.filter((t) => t.status === 'hecha').length

  const ordenadas = [...tareas].sort(
    (a, b) =>
      (ORDEN[a.status] ?? 3) - (ORDEN[b.status] ?? 3) ||
      (a.dueAt?.getTime() ?? Number.MAX_SAFE_INTEGER) - (b.dueAt?.getTime() ?? Number.MAX_SAFE_INTEGER)
  )

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <div className="flex justify-between items-center border-b pb-2 mb-2">
        <h2 className="text-lg font-bold text-slate-800">☑ Checklist de pendientes</h2>
        <p className="text-xs text-slate-500">
          <span className="font-bold text-amber-600">{pendientes} pendientes</span> · {hechas} hechas
        </p>
      </div>

      {ordenadas.length === 0 && <p className="text-sm text-slate-400 py-3">No hay tareas registradas.</p>}

      <ul>
        {ordenadas.map((t) => {
          const vencida = t.status === 'pendiente' && t.dueAt !== null && t.dueAt.getTime() < ahora
          return (
            <li key={t.id} className="flex items-start gap-3 py-3 border-b last:border-0">
              {/* Casilla */}
              <form action={marcarTarea}>
                <input type="hidden" name="taskId" value={t.id} />
                {t.status === 'pendiente' && (
                  <button
                    name="accion"
                    value="hecha"
                    disabled={!puedeMarcar}
                    title={puedeMarcar ? 'Marcar como realizada' : 'No tienes permiso para marcar tareas'}
                    className="w-7 h-7 md:w-6 md:h-6 rounded border-2 border-slate-400 hover:border-emerald-600 hover:bg-emerald-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  />
                )}
                {t.status === 'hecha' && (
                  <button
                    name="accion"
                    value="reabrir"
                    disabled={!puedeMarcar}
                    title={puedeMarcar ? 'Desmarcar (reabrir)' : 'No tienes permiso'}
                    className="w-7 h-7 md:w-6 md:h-6 rounded border-2 border-emerald-600 bg-emerald-600 text-white text-sm leading-none disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    ✓
                  </button>
                )}
                {t.status === 'cancelada' && (
                  <span className="w-7 h-7 md:w-6 md:h-6 rounded border-2 border-slate-300 bg-slate-100 text-slate-400 text-sm flex items-center justify-center">
                    ✕
                  </span>
                )}
              </form>

              {/* Detalle */}
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium ${
                    t.status === 'pendiente' ? 'text-slate-800' : 'text-slate-400 line-through'
                  }`}
                >
                  {t.title}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-xs">
                  <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                    {CATEGORIAS[t.category] ?? t.category}
                  </span>
                  {t.dueAt && (
                    <span className={vencida ? 'text-red-600 font-bold' : 'text-slate-500'}>
                      🕒 {fmt(t.dueAt)}
                    </span>
                  )}
                  {vencida && (
                    <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold">VENCIDA</span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Agregada por {nombres[t.createdBy] ?? t.createdBy}
                </p>
                {t.status === 'hecha' && t.doneAt && (
                  <p className="text-xs text-emerald-700 mt-1">
                    Hecho por {nombres[t.doneBy ?? ''] ?? t.doneBy} · {fmt(t.doneAt)}
                  </p>
                )}
                {t.status === 'cancelada' && (
                  <p className="text-xs text-slate-500 mt-1">Cancelada: {t.cancelReason}</p>
                )}

                {puedeEditar && t.status === 'pendiente' && (
                  <details className="mt-1">
                    <summary className="text-xs text-slate-400 hover:text-red-600 cursor-pointer py-1">
                      Cancelar tarea
                    </summary>
                    <form action={marcarTarea} className="flex gap-2 mt-1">
                      <input type="hidden" name="taskId" value={t.id} />
                      <input type="hidden" name="accion" value="cancelar" />
                      <input
                        name="motivo"
                        required
                        placeholder="Motivo de la cancelación"
                        className="flex-1 px-2 py-2 md:py-1 border rounded text-base md:text-xs text-slate-900"
                      />
                      <button className="bg-red-600 text-white px-3 py-1 rounded text-xs">Confirmar</button>
                    </form>
                  </details>
                )}
              </div>
            </li>
          )
        })}
      </ul>

      {puedeAgregar && (
        <form action={crearTarea} className="mt-4 pt-4 border-t space-y-2">
          <input type="hidden" name="episodeId" value={episodeId} />
          <p className="text-xs font-bold text-slate-600">Agregar tarea o análisis</p>
          <input
            name="titulo"
            required
            placeholder="Ej. Hemograma completo, Ecocardiograma..."
            className="w-full px-3 py-2 border rounded-lg text-base md:text-sm text-slate-900"
          />
          <div className="flex flex-wrap gap-2">
            <select name="categoria" className="px-3 py-2 border rounded-lg text-base md:text-sm bg-white text-slate-900">
              <option value="analisis">Análisis</option>
              <option value="estudio">Estudio (sonografía, eco, doppler…)</option>
              <option value="indicacion">Indicación</option>
              <option value="otro">Otro</option>
            </select>
            <input
              name="programada"
              type="datetime-local"
              className="px-3 py-2 border rounded-lg text-base md:text-sm text-slate-900"
            />
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
              Agregar
            </button>
          </div>
        </form>
      )}
    </div>
  )
}