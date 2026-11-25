'use client'

import { useState } from 'react'
import { crearPaciente } from '@/app/dashboard/nuevo-paciente/actions'
import Link from 'next/link'
import { ESPECIALIDADES_EMERGENCIA, NIVELES_TRIAJE_EMERGENCIA } from '@/lib/emergencia-constants'
import { FRECUENCIAS_SIGNOS_HEMA } from '@/lib/hematologia-constants'

const ESPECIALIDADES = [
  'Unidad de Cuidados Intensivos (UCI)',
  'Cirugía General',
  'Medicina Interna',
  'Emergencia / Triaje',
  'Ginecología y Obstetricia',
  'Ortopedia y Traumatología',
  'Cardiología',
  'Neurología / Neurocirugía',
  'Gastroenterología',
  'Neumología',
  'Infectología',
  'Oncología',
  'Urología',
  'Pediatría',
  'OTRO',
]

export function NuevoPacienteForm({
  interfaceMode,
  residencyName,
  tipoInicial = 'propio',
}: {
  interfaceMode: string
  residencyName: string
  tipoInicial?: 'propio' | 'interconsulta'
}) {
  const esEmergencia = interfaceMode === 'EMERGENCIA'
  const esHematologia = interfaceMode === 'HEMATOLOGIA'

  const [tipoGuardia, setTipoGuardia] = useState<'propio' | 'interconsulta'>(tipoInicial)
  const [deptoSeleccionado, setDeptoSeleccionado] = useState('')
  const [unidadPeso, setUnidadPeso] = useState<'kg' | 'lb'>('kg')

  const hoyLocal = new Date().toISOString().slice(0, 16)

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              {esEmergencia
                ? `Ingreso a Emergencia · ${residencyName}`
                : esHematologia
                  ? `Ingreso a Hematología · ${residencyName}`
                  : 'Ingreso a NEXO'}
            </h1>
            <p className="text-sm text-slate-500">
              {esEmergencia
                ? 'Registra un paciente atendido en Emergencia o una interconsulta solicitada.'
                : esHematologia
                  ? 'Registra un paciente en Sala de Hematología o una interconsulta hematológica.'
                  : 'Seleccione el tipo de paciente para abrir el registro en la guardia.'}
            </p>
          </div>
          <Link href="/dashboard" className="text-sm text-blue-600 hover:underline font-medium shrink-0">
            ← Volver a la lista
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
          <button
            type="button"
            onClick={() => setTipoGuardia('propio')}
            className={`py-3 px-4 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
              tipoGuardia === 'propio'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {esEmergencia
              ? 'Paciente Propio (Emergencia)'
              : esHematologia
                ? 'Paciente en Hematología'
                : 'Paciente Propio (Sala)'}
          </button>
          <button
            type="button"
            onClick={() => setTipoGuardia('interconsulta')}
            className={`py-3 px-4 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
              tipoGuardia === 'interconsulta'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Interconsulta
          </button>
        </div>

        <form action={crearPaciente} className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-200 space-y-6">
          <input type="hidden" name="serviceType" value={tipoGuardia} />

          {/* SECCIÓN 1: Identificación y Peso Inicial */}
          <div>
            <h2 className="text-lg font-semibold text-slate-700 mb-4 border-b pb-2">
              1. Identificación del Paciente
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Número de Expediente / Registro (Único) *
                </label>
                <input
                  name="expedienteNumber"
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 placeholder:text-slate-400"
                  placeholder="Ej. EXP-2026-0003"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Edad *</label>
                <input
                  name="age"
                  type="number"
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 placeholder:text-slate-400"
                  placeholder="Ej. 45"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombres *</label>
                <input
                  name="firstName"
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 placeholder:text-slate-400"
                  placeholder="Ej. Juan"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Apellidos *</label>
                <input
                  name="lastName"
                  required
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 placeholder:text-slate-400"
                  placeholder="Ej. Rodríguez"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Sexo *</label>
                <select name="sex" required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900">
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cédula / ID (Opcional)</label>
                <input
                  name="cedula"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 placeholder:text-slate-400"
                  placeholder="Ej. 001-1234567-8"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Peso Inicial de Ingreso (Opcional)
                </label>
                <div className="flex gap-2">
                  <input
                    name="initialWeight"
                    type="number"
                    step="0.1"
                    placeholder="Ej. 70 o 154"
                    className="flex-1 px-3 py-2 border rounded-lg text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <select
                    name="initialWeightUnit"
                    value={unidadPeso}
                    onChange={(e) => setUnidadPeso(e.target.value as 'kg' | 'lb')}
                    className="w-20 px-2 py-2 border rounded-lg bg-slate-100 font-bold text-slate-700 outline-none"
                  >
                    <option value="kg">kg</option>
                    <option value="lb">lb</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: Datos de Ingreso / Interconsulta */}
          <div>
            <h2 className="text-lg font-semibold text-slate-700 mb-4 border-b pb-2 mt-6">
              {tipoGuardia === 'propio'
                ? esEmergencia
                  ? '2. Datos del Ingreso a Emergencia'
                  : esHematologia
                    ? '2. Datos del Ingreso a Hematología'
                    : '2. Datos del Ingreso a Sala'
                : '2. Datos de la Interconsulta'}
            </h2>

            <div className="mb-4">
              <label className="block text-sm font-bold text-slate-800 mb-1">
                {tipoGuardia === 'interconsulta'
                  ? 'Fecha y Hora de la Interconsulta *'
                  : esEmergencia
                    ? 'Fecha y Hora de Ingreso / Triage *'
                    : 'Fecha y Hora Real de Ingreso *'}
              </label>
              <input
                name="admissionDate"
                type="datetime-local"
                required
                defaultValue={hoyLocal}
                className="w-full md:w-72 px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none font-semibold"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Puede seleccionar una fecha y hora previa si el paciente ingresó antes.
              </p>
            </div>

            {tipoGuardia === 'interconsulta' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-purple-50/50 p-4 rounded-xl border border-purple-200">
                <div>
                  <label className="block text-sm font-bold text-purple-900 mb-1">
                    Departamento / Servicio Interconsultante *
                  </label>
                  <select
                    name="consultingDepartment"
                    required
                    value={deptoSeleccionado}
                    onChange={(e) => setDeptoSeleccionado(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                  >
                    <option value="">Seleccione especialidad...</option>
                    {ESPECIALIDADES.map((esp) => (
                      <option key={esp} value={esp}>
                        {esp === 'OTRO' ? 'Otra especialidad (Escribir cuál)...' : esp}
                      </option>
                    ))}
                  </select>
                </div>

                {deptoSeleccionado === 'OTRO' && (
                  <div>
                    <label className="block text-sm font-bold text-purple-900 mb-1">
                      Escriba el nombre del departamento *
                    </label>
                    <input
                      name="customConsultingDepartment"
                      required
                      placeholder="Ej. Quemados, Trasplante..."
                      className="w-full px-3 py-2 border rounded-lg bg-white text-slate-900 text-sm"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-bold text-purple-900 mb-1">
                    Residente a Cargo de la Interconsulta *
                  </label>
                  <input
                    name="consultingResident"
                    required
                    placeholder="Ej. Dr. Martínez (R2)"
                    className="w-full px-3 py-2 border rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-purple-950 mb-1">
                    Fecha en que ingresó al Hospital (Opcional):
                  </label>
                  <input
                    name="hospitalAdmissionDate"
                    type="date"
                    className="w-full px-3 py-2 border rounded-lg bg-white text-slate-900 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {esHematologia ? 'Ubicación / Sala (ej. EMI-TRIAJE, 202) *' : 'Ubicación / Sala en el Servicio *'}
                  </label>
                  <input
                    name="room"
                    required
                    className="w-full px-3 py-2 border rounded-lg text-slate-900 text-sm"
                    placeholder={esHematologia ? 'Ej. EMI-TRIAJE o 202' : 'Ej. UCI Cama 4, o Sala 302'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cama *</label>
                  <input
                    name="bed"
                    required
                    className="w-full px-3 py-2 border rounded-lg text-slate-900 text-sm"
                    placeholder="Ej. C1 o 1"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-purple-900 mb-1">Motivo de Interconsulta *</label>
                  <input
                    name="chiefComplaint"
                    required
                    placeholder="Motivo clínico de la interconsulta..."
                    className="w-full px-3 py-2 border rounded-lg text-slate-900 text-sm"
                  />
                </div>

                <input type="hidden" name="admissionType" value="Interconsulta" />
                <input type="hidden" name="admittingDoctor" value="Interconsulta Solicitada" />
                <input type="hidden" name="attendingDoctor" value="Residente Interconsultas" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Forma de Ingreso *</label>
                  <select
                    name="admissionType"
                    required
                    defaultValue={esEmergencia ? 'Emergencia' : 'Consulta'}
                    className="w-full px-3 py-2 border rounded-lg bg-white text-slate-900"
                  >
                    <option value="Emergencia">Emergencia</option>
                    <option value="Consulta">Consulta</option>
                    <option value="Electiva">Electiva</option>
                    <option value="Referido">Referido</option>
                    <option value="Propios medios">Por sus propios medios</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">MA que lo ingresó *</label>
                  <input
                    name="admittingDoctor"
                    required
                    className="w-full px-3 py-2 border rounded-lg text-slate-900 placeholder:text-slate-400"
                    placeholder="Ej. Dr. Ramírez (MA)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {esEmergencia
                      ? 'Residente de Emergencia / Tratante *'
                      : 'Médico tratante (residente que ingresó) *'}
                  </label>
                  <input
                    name="attendingDoctor"
                    required
                    className="w-full px-3 py-2 border rounded-lg text-slate-900 placeholder:text-slate-400"
                    placeholder="Ej. Dra. Gómez (R3)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    {esEmergencia
                      ? 'Área / Cubículo (ej. TS, Obs, Triage) *'
                      : esHematologia
                        ? 'Sala / Ubicación (ej. EMI, 202) *'
                        : 'Habitación *'}
                  </label>
                  <input
                    name="room"
                    required
                    className="w-full px-3 py-2 border rounded-lg text-slate-900 placeholder:text-slate-400"
                    placeholder={esEmergencia ? 'Ej. TS' : esHematologia ? 'Ej. 207' : 'Ej. 103'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cama *</label>
                  <input
                    name="bed"
                    required
                    className="w-full px-3 py-2 border rounded-lg text-slate-900 placeholder:text-slate-400"
                    placeholder={esEmergencia ? 'Ej. 1' : esHematologia ? 'Ej. C2' : 'Ej. A'}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Motivo de Ingreso *</label>
                  <input
                    name="chiefComplaint"
                    required
                    className="w-full px-3 py-2 border rounded-lg text-slate-900 placeholder:text-slate-400"
                    placeholder="Motivo principal de ingreso..."
                  />
                </div>
              </div>
            )}
          </div>

          {/* CAMPOS ESPECÍFICOS INICIALES PARA EMERGENCIA */}
          {esEmergencia && (
            <div className="bg-rose-50/50 border border-rose-200 rounded-xl p-4 space-y-4">
              <h2 className="text-base font-bold text-rose-950 border-b border-rose-200 pb-2">
                Datos Iniciales de Emergencia (Opcional)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">AMC</label>
                  <input
                    name="emergencyAmc"
                    placeholder="Ej. AMC / Código..."
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-white text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Especialidad</label>
                  <select
                    name="emergencySpecialty"
                    defaultValue="Medicina Interna"
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-white text-slate-900"
                  >
                    {ESPECIALIDADES_EMERGENCIA.map((esp) => (
                      <option key={esp} value={esp}>
                        {esp}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nivel de Triaje</label>
                  <select
                    name="emergencyTriageLevel"
                    defaultValue="Emergencia"
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-white text-slate-900"
                  >
                    {NIVELES_TRIAJE_EMERGENCIA.map((nv) => (
                      <option key={nv} value={nv}>
                        {nv}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Analíticas y estudios relevantes
                  </label>
                  <textarea
                    name="emergencyRelevantLabs"
                    rows={2}
                    placeholder="Ej. Hemograma, Rx tórax, EKG..."
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-white text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Pendientes / Interés
                  </label>
                  <textarea
                    name="emergencyInterestsPending"
                    rows={2}
                    placeholder="Ej. Interconsulta cirugía, esperar cama en sala..."
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-white text-slate-900"
                  />
                </div>
              </div>
            </div>
          )}

          {/* CAMPOS ESPECÍFICOS INICIALES PARA HEMATOLOGÍA */}
          {esHematologia && (
            <div className="bg-indigo-50/50 border border-indigo-200 rounded-xl p-4 space-y-4">
              <h2 className="text-base font-bold text-indigo-950 border-b border-indigo-200 pb-2">
                Plan y Vigilancia Inicial de Hematología (Opcional)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Frecuencia de Signos Vitales
                  </label>
                  <select
                    name="hemaVitalFreq"
                    defaultValue="c/8 horas"
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-white text-slate-900"
                  >
                    {FRECUENCIAS_SIGNOS_HEMA.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Vigilancia de Sangrado / Hemodinamia
                  </label>
                  <input
                    name="hemaBleedingWatch"
                    placeholder="Ej. Vigilar datos de sangrado y estado hemodinámico"
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-white text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Hemocomponentes Pendientes
                  </label>
                  <input
                    name="hemaPendingBlood"
                    placeholder="Ej. Pendiente 2 paquetes globulares por familiares, plaquetas"
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-white text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Estudios e Imágenes Pendientes
                  </label>
                  <input
                    name="hemaPendingStudies"
                    placeholder="Ej. Rx de tórax PA, aspirado de médula ósea"
                    className="w-full px-3 py-2 border rounded-lg text-sm bg-white text-slate-900"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECCIÓN 3: Diagnósticos */}
          <div>
            <h2 className="text-lg font-semibold text-slate-700 mb-4 border-b pb-2 mt-6">3. Diagnósticos</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Diagnóstico Principal *</label>
                <input
                  name="primaryDiagnosis"
                  required
                  className="w-full px-3 py-2 border rounded-lg text-slate-900 font-medium placeholder:text-slate-400"
                  placeholder={
                    esHematologia
                      ? 'Ej. Anemia de células falciformes en crisis vasooclusiva'
                      : 'Diagnóstico principal de ingreso...'
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Diagnósticos Secundarios (Opcional)</label>
                <input
                  name="secondaryDiagnoses"
                  className="w-full px-3 py-2 border rounded-lg text-slate-900 placeholder:text-slate-400"
                  placeholder="Diagnósticos secundarios o comorbilidades..."
                />
              </div>
            </div>
          </div>

          {/* SECCIÓN 4: Alergias */}
          <div>
            <h2 className="text-lg font-semibold text-slate-700 mb-4 border-b pb-2 mt-6">4. Evaluación de Alergias</h2>
            <select name="alergiasEstado" required className="w-full px-3 py-2 border rounded-lg bg-white text-slate-900">
              <option value="sin_alergias">Niega alergias (Sin alergias conocidas)</option>
              <option value="no_evaluada">No evaluadas (Pendiente de evaluación)</option>
            </select>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Link href="/dashboard" className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors">
              Cancelar
            </Link>
            <button
              type="submit"
              className={`px-6 py-2.5 rounded-lg font-bold text-white transition-colors shadow-sm cursor-pointer ${
                tipoGuardia === 'interconsulta'
                  ? 'bg-purple-600 hover:bg-purple-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {tipoGuardia === 'interconsulta'
                ? 'Guardar Interconsulta'
                : esEmergencia
                  ? 'Guardar Paciente Propio'
                  : esHematologia
                    ? 'Guardar Paciente en Hematología'
                    : 'Guardar Paciente de Sala'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
