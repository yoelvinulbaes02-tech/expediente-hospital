'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { guardarConsultaClinica } from '@/app/dashboard/consultas/actions'

type ConsultaEditable = {
  id: string
  status: string
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
  labOrders: string | null
  nextAppointment: string | null
  notes: string | null
}

export function FormularioConsultaClinica({
  consulta,
  puedeEditar,
  autorNotas,
  bloqueadoPorAutoria = false,
}: {
  consulta: ConsultaEditable
  puedeEditar: boolean
  autorNotas?: string | null
  bloqueadoPorAutoria?: boolean
}) {
  const router = useRouter()
  const [peso, setPeso] = useState(consulta.weight ? String(consulta.weight) : '')
  const [unidadPeso, setUnidadPeso] = useState(consulta.weightUnit ?? 'kg')
  const [tallaCm, setTallaCm] = useState(consulta.heightCm ? String(consulta.heightCm) : '')
  const [guardando, setGuardando] = useState<'guardar' | 'finalizar' | 'reabrir' | null>(null)
  const [feedback, setFeedback] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null)

  const calcularIMC = () => {
    const pNum = parseFloat(peso)
    const tNum = parseFloat(tallaCm)
    if (!pNum || !tNum || tNum <= 0) return null
    const pesoKg = unidadPeso === 'lb' ? pNum * 0.453592 : pNum
    const alturaM = tNum / 100
    const imc = pesoKg / (alturaM * alturaM)
    if (!isFinite(imc)) return null
    return imc.toFixed(1)
  }

  const imc = calcularIMC()

  const enviar = async (formData: FormData, accion: 'guardar' | 'finalizar' | 'reabrir') => {
    if (!puedeEditar) return
    formData.set('accion', accion)
    setGuardando(accion)
    setFeedback(null)
    try {
      const res = await guardarConsultaClinica(formData)
      if (!res.ok) {
        setFeedback({ tipo: 'error', texto: res.error ?? 'No se pudo guardar.' })
        return
      }
      if (res.finalizada) {
        router.push('/dashboard')
        router.refresh()
        return
      }
      setFeedback({
        tipo: 'ok',
        texto: res.reabierta
          ? 'Consulta reabierta en curso.'
          : 'Cambios de la consulta guardados correctamente.',
      })
      router.refresh()
    } finally {
      setGuardando(null)
    }
  }

  return (
    <form
      action={(fd) => enviar(fd, 'guardar')}
      className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 md:p-6 space-y-6"
    >
      <input type="hidden" name="consultationId" value={consulta.id} />

      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Ficha Clínica de Consulta
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Registra signos vitales, evaluación, diagnóstico y receta médica.
          </p>
        </div>
        {imc && (
          <div className="px-3 py-1.5 rounded-lg bg-teal-50 dark:bg-teal-900/30 border border-teal-200 dark:border-teal-800 text-xs font-bold text-teal-800 dark:text-teal-300 tabular-nums">
            IMC calculado: {imc} kg/m²
          </div>
        )}
      </div>

      {bloqueadoPorAutoria && (
        <div className="px-4 py-3 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 text-xs font-medium print:hidden">
          Solo el médico autor de estas notas ({autorNotas || 'médico tratante'}) puede modificarlas. El expediente completo sigue visible para consulta del equipo médico.
        </div>
      )}

      {consulta.status === 'COMPLETADA' && puedeEditar && (
        <div className="px-4 py-2.5 rounded-lg border border-teal-200 dark:border-teal-800 bg-teal-50 dark:bg-teal-950/30 text-teal-900 dark:text-teal-200 text-xs font-medium print:hidden">
          Consulta cerrada · Como médico autor ({autorNotas || 'tratante'}), puedes editar estas notas o reabrirla cuando el paciente regrese.
        </div>
      )}

      {feedback && (
        <div
          className={`px-4 py-3 rounded-lg border text-sm font-medium print:hidden ${
            feedback.tipo === 'ok'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {feedback.texto}
        </div>
      )}

      {/* SIGNOS VITALES AMBULATORIOS */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
          Signos Vitales y Antropometría
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Presión Arterial
            </label>
            <input
              name="bloodPressure"
              defaultValue={consulta.bloodPressure ?? ''}
              disabled={!puedeEditar}
              placeholder="120/80"
              className="w-full px-2.5 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white tabular-nums"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
              FC (lpm)
            </label>
            <input
              name="heartRate"
              type="number"
              defaultValue={consulta.heartRate ?? ''}
              disabled={!puedeEditar}
              placeholder="76"
              className="w-full px-2.5 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white tabular-nums"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Temp (°C)
            </label>
            <input
              name="temperature"
              type="number"
              step="0.1"
              defaultValue={consulta.temperature ?? ''}
              disabled={!puedeEditar}
              placeholder="36.5"
              className="w-full px-2.5 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white tabular-nums"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
              SpO2 (%)
            </label>
            <input
              name="oxygenSat"
              type="number"
              defaultValue={consulta.oxygenSat ?? ''}
              disabled={!puedeEditar}
              placeholder="98"
              className="w-full px-2.5 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white tabular-nums"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Peso
            </label>
            <div className="flex gap-1">
              <input
                name="weight"
                type="number"
                step="0.1"
                value={peso}
                onChange={(e) => setPeso(e.target.value)}
                disabled={!puedeEditar}
                placeholder="70"
                className="w-full px-2 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white tabular-nums"
              />
              <select
                name="weightUnit"
                value={unidadPeso}
                onChange={(e) => setUnidadPeso(e.target.value)}
                disabled={!puedeEditar}
                className="px-1.5 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white"
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
              name="heightCm"
              type="number"
              step="0.5"
              value={tallaCm}
              onChange={(e) => setTallaCm(e.target.value)}
              disabled={!puedeEditar}
              placeholder="170"
              className="w-full px-2.5 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white tabular-nums"
            />
          </div>
        </div>
      </div>

      {/* EVALUACIÓN CLÍNICA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
            Tipo de Consulta
          </label>
          <select
            name="visitType"
            defaultValue={consulta.visitType}
            disabled={!puedeEditar}
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
            name="nextAppointment"
            type="date"
            defaultValue={consulta.nextAppointment ?? ''}
            disabled={!puedeEditar}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
          Motivo de Consulta *
        </label>
        <input
          name="chiefComplaint"
          defaultValue={consulta.chiefComplaint}
          required
          disabled={!puedeEditar}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
            Enfermedad Actual / Anamnesis
          </label>
          <textarea
            name="historyIllness"
            rows={4}
            defaultValue={consulta.historyIllness ?? ''}
            disabled={!puedeEditar}
            placeholder="Inicio, duración, síntomas asociados..."
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
            Examen Físico
          </label>
          <textarea
            name="physicalExam"
            rows={4}
            defaultValue={consulta.physicalExam ?? ''}
            disabled={!puedeEditar}
            placeholder="Hallazgos cardiovasculares, respiratorios, abdomen, extremidades..."
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
          Diagnóstico / Impresión Clínica
        </label>
        <input
          name="diagnosis"
          defaultValue={consulta.diagnosis ?? ''}
          disabled={!puedeEditar}
          placeholder="Ej. Hipertensión arterial esencial compensada / Diabetes Mellitus tipo 2"
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-semibold bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
          Receta Médica / Plan Terapéutico e Indicaciones
        </label>
        <textarea
          name="treatmentPlan"
          rows={5}
          defaultValue={consulta.treatmentPlan ?? ''}
          disabled={!puedeEditar}
          placeholder={'1. Losartán 50 mg VO cada 24 horas\n2. Medidas higiénico-dietéticas y control de presión arterial'}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
            Órdenes de Laboratorio / Estudios
          </label>
          <textarea
            name="labOrders"
            rows={3}
            defaultValue={consulta.labOrders ?? ''}
            disabled={!puedeEditar}
            placeholder="Hemograma, química sanguínea, HbA1c, perfil lipídico, radiografía..."
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
            Notas Internas / Seguimiento
          </label>
          <textarea
            name="notes"
            rows={3}
            defaultValue={consulta.notes ?? ''}
            disabled={!puedeEditar}
            placeholder="Observaciones adicionales para la próxima visita..."
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {puedeEditar && (
        <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700 print:hidden">
          <button
            type="submit"
            disabled={guardando !== null}
            className="px-4 py-2.5 rounded-lg text-xs font-bold border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white hover:bg-slate-50 cursor-pointer"
          >
            {guardando === 'guardar'
              ? 'Guardando...'
              : consulta.status === 'COMPLETADA'
                ? 'Guardar modificaciones'
                : 'Guardar progreso'}
          </button>

          {consulta.status === 'COMPLETADA' ? (
            <button
              type="submit"
              formAction={(fd) => enviar(fd, 'reabrir')}
              disabled={guardando !== null}
              className="px-5 py-2.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white cursor-pointer"
            >
              {guardando === 'reabrir' ? 'Reabriendo...' : 'Reabrir consulta'}
            </button>
          ) : (
            <button
              type="submit"
              formAction={(fd) => enviar(fd, 'finalizar')}
              disabled={guardando !== null}
              className="px-5 py-2.5 rounded-lg text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white cursor-pointer"
            >
              {guardando === 'finalizar' ? 'Cerrando...' : '✓ Finalizar y Cerrar Consulta'}
            </button>
          )}
        </div>
      )}
    </form>
  )
}
