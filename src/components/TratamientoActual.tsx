import {
  agregarAntibiotico,
  guardarTratamiento,
  suspenderAntibiotico,
} from '@/app/dashboard/paciente/[id]/actions-clinicas'
import { calcularDiasAntibiotico } from '@/lib/cirugia-constants'
import { TextareaTratamiento } from '@/components/TextareaTratamiento'
import { renderTextoClinico } from '@/lib/texto-clinico'

export type AntibioticoResumen = {
  id: string
  name: string
  dose: string | null
  route: string | null
  startedAt: Date | string
  stoppedAt: Date | string | null
  isActive: boolean
  createdBy: string
  stoppedBy: string | null
}

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

const fechaCorta = (d: Date | string) =>
  new Date(d).toLocaleDateString('es-DO', {
    timeZone: 'America/Santo_Domingo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

export function TratamientoActual({
  episodeId,
  tratamiento,
  actualizadoPor,
  actualizadoAt,
  nombres,
  roles,
  puedeRegistrar,
  esCirugia = false,
  antibioticos = [],
}: {
  episodeId: string
  tratamiento: string | null
  actualizadoPor: string | null
  actualizadoAt: Date | string | null
  nombres: Record<string, string>
  roles: Record<string, string>
  puedeRegistrar: boolean
  esCirugia?: boolean
  antibioticos?: AntibioticoResumen[]
}) {
  const hoyIso = new Date().toISOString().slice(0, 10)
  const antibioticosActivos = antibioticos.filter((a) => a.isActive)
  const antibioticosSuspendidos = antibioticos.filter((a) => !a.isActive)

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
                <TextareaTratamiento
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
                  className="w-full bg-blue-600 text-white text-xs py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors cursor-pointer"
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
              {renderTextoClinico(tratamiento)}
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

      {/* ACÁPITE DE ANTIBIÓTICOS CON CONTEO AUTOMÁTICO DE DÍAS (CIRUGÍA) */}
      {esCirugia && (
        <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-700 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Antibióticos y Conteo Automático de Días ({antibioticosActivos.length} activo{antibioticosActivos.length === 1 ? '' : 's'})
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Contabiliza automáticamente los días transcurridos desde la fecha de inicio de cada antibiótico.
              </p>
            </div>

            {puedeRegistrar && (
              <details className="relative print:hidden">
                <summary className="list-none cursor-pointer text-xs bg-teal-600 hover:bg-teal-700 text-white font-bold px-3 py-1.5 rounded-lg transition-colors">
                  + Agregar Antibiótico
                </summary>
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-300 dark:border-slate-700 shadow-2xl z-30 text-left">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-2 mb-3">
                    Registrar Antibiótico con Conteo de Días
                  </p>
                  <form action={agregarAntibiotico} className="space-y-2.5">
                    <input type="hidden" name="episodeId" value={episodeId} />
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-0.5">
                        Antibiótico *
                      </label>
                      <input
                        name="name"
                        required
                        placeholder="Ej. Ceftriaxona, Piperacilina/Tazobactam..."
                        className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-0.5">
                          Dosis / Frecuencia
                        </label>
                        <input
                          name="dose"
                          placeholder="Ej. 1g c/12h"
                          className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-0.5">
                          Vía
                        </label>
                        <select
                          name="route"
                          defaultValue="IV"
                          className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                        >
                          <option value="IV">IV</option>
                          <option value="VO">VO</option>
                          <option value="IM">IM</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-0.5">
                        Fecha de inicio *
                      </label>
                      <input
                        name="startedAt"
                        type="date"
                        required
                        defaultValue={hoyIso}
                        className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold py-2 rounded-lg cursor-pointer"
                    >
                      Iniciar Antibiótico
                    </button>
                  </form>
                </div>
              </details>
            )}
          </div>

          {antibioticosActivos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {antibioticosActivos.map((abx) => {
                const dias = calcularDiasAntibiotico(abx.startedAt)
                return (
                  <div
                    key={abx.id}
                    className="flex items-center justify-between gap-3 bg-teal-50/60 dark:bg-teal-950/25 border border-teal-200 dark:border-teal-800 rounded-lg px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-extrabold bg-teal-700 text-white px-2 py-0.5 rounded tabular-nums">
                          Día {dias}
                        </span>
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {abx.name}
                        </p>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 tabular-nums">
                        {abx.dose ? `${abx.dose} · ` : ''}
                        {abx.route ?? 'IV'} · Inicio: {fechaCorta(abx.startedAt)} · Por:{' '}
                        {nombres[abx.createdBy] ?? abx.createdBy}
                      </p>
                    </div>

                    {puedeRegistrar && (
                      <form action={suspenderAntibiotico} className="shrink-0 print:hidden">
                        <input type="hidden" name="episodeId" value={episodeId} />
                        <input type="hidden" name="antibioticId" value={abx.id} />
                        <button
                          type="submit"
                          className="text-[11px] font-bold text-red-700 hover:bg-red-50 border border-red-200 px-2.5 py-1 rounded-lg cursor-pointer"
                        >
                          Suspender
                        </button>
                      </form>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">
              Sin antibióticos activos registrados actualmente.
            </p>
          )}

          {antibioticosSuspendidos.length > 0 && (
            <details className="pt-1 print:hidden">
              <summary className="text-[11px] font-semibold text-slate-500 hover:text-slate-700 cursor-pointer">
                Ver antibióticos completados / suspendidos ({antibioticosSuspendidos.length})
              </summary>
              <div className="mt-2 space-y-1.5">
                {antibioticosSuspendidos.map((abx) => {
                  const totalDias = calcularDiasAntibiotico(abx.startedAt, abx.stoppedAt)
                  return (
                    <div
                      key={abx.id}
                      className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300"
                    >
                      <span>
                        <strong>{abx.name}</strong> {abx.dose ? `(${abx.dose})` : ''} · Completó{' '}
                        <strong className="tabular-nums">{totalDias} día(s)</strong>
                      </span>
                      <span className="text-[11px] text-slate-400 tabular-nums">
                        {fechaCorta(abx.startedAt)} →{' '}
                        {abx.stoppedAt ? fechaCorta(abx.stoppedAt) : '—'}
                      </span>
                    </div>
                  )
                })}
              </div>
            </details>
          )}
        </div>
      )}
    </div>
  )
}