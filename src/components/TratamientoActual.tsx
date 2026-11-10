import { guardarTratamiento } from '@/app/dashboard/paciente/[id]/actions-clinicas'

const ETIQUETA_ROL: Record<string, string> = {
  ADMIN: 'Administrador',
  DOCTOR: 'Médico',
  RESIDENT: 'Residente',
  NURSE: 'Enfermería',
  LAB: 'Laboratorio',
  READONLY: 'Solo lectura',
}

const fechaHoraCompleta = (d: Date | string | null) => {
  if (!d) return ''
  const f = new Date(d)
  return f.toLocaleString('es-DO', {
    timeZone: 'America/Santo_Domingo',
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function TratamientoActual({
  episodeId,
  tratamiento,
  actualizadoPor,
  actualizadoAt,
  nombres,
  roles,
  puedeRegistrar,
}: {
  episodeId: string
  tratamiento: string | null
  actualizadoPor: string | null
  actualizadoAt: Date | string | null
  nombres: Record<string, string>
  roles: Record<string, string>
  puedeRegistrar: boolean
}) {
  return (
    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 mb-6">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">💊</span>
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
            Tratamiento Médico Actual
          </h2>
        </div>

        {puedeRegistrar && (
          <details className="inline-block relative print:hidden">
            <summary className="list-none cursor-pointer text-xs bg-slate-100 dark:bg-slate-700 text-blue-700 dark:text-blue-300 font-bold px-3 py-1 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-200 transition-colors">
              {tratamiento ? '✏️ Modificar Esquema' : '+ Registrar Esquema'}
            </summary>
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-300 dark:border-slate-700 shadow-2xl z-30 text-left">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-100 mb-1">
                Actualizar Esquema de Tratamiento:
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                Escriba los medicamentos, dosis, vías, soluciones e indicaciones activas.
              </p>
              <form action={guardarTratamiento} className="space-y-3">
                <input type="hidden" name="episodeId" value={episodeId} />
                <textarea
                  name="currentTreatment"
                  rows={6}
                  defaultValue={tratamiento ?? ''}
                  placeholder={'1. Omeprazol 40mg IV c/24h\n2. Enoxaparina 40mg SC c/24h\n3. Solución Salina 0.9% 1000cc a 80 mL/h...'}
                  className="w-full px-3 py-2 border rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono leading-relaxed outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-[10px] text-slate-400 italic">
                  Al guardar, se registrará automáticamente su firma, rol, fecha y hora de actualización.
                </p>
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white text-xs py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors"
                >
                  Guardar y Firmar Tratamiento
                </button>
              </form>
            </div>
          </details>
        )}
      </div>

      {tratamiento ? (
        <div className="space-y-3">
          <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <p className="font-mono text-xs sm:text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
              {tratamiento}
            </p>
          </div>

          {actualizadoPor && (
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-1">
              <span>✍️ Prescrito / Actualizado por:</span>
              <strong className="text-slate-800 dark:text-slate-200">
                {nombres[actualizadoPor] ?? actualizadoPor}
              </strong>
              {roles[actualizadoPor] && (
                <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded text-[10px] font-bold">
                  {ETIQUETA_ROL[roles[actualizadoPor]] ?? roles[actualizadoPor]}
                </span>
              )}
              {actualizadoAt && (
                <span className="text-[11px] text-slate-400">
                  • {fechaHoraCompleta(actualizadoAt)}
                </span>
              )}
            </div>
          )}
        </div>
      ) : (
        <p className="text-xs text-slate-400 italic py-2">
          Sin esquema de tratamiento registrado actualmente. Utilice el botón superior para registrar las indicaciones activas.
        </p>
      )}
    </div>
  )
}