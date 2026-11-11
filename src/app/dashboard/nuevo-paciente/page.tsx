'use client'

import { useState } from 'react'
import { crearPaciente } from './actions'
import Link from 'next/link'

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

export default function NuevoPacientePage() {
  const [tipoGuardia, setTipoGuardia] = useState<'propio' | 'interconsulta'>('propio')
  const [deptoSeleccionado, setDeptoSeleccionado] = useState('')
  const [unidadPeso, setUnidadPeso] = useState<'kg' | 'lb'>('kg')

  const hoyLocal = new Date().toISOString().slice(0, 16)

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Ingreso a NEXO</h1>
            <p className="text-sm text-slate-500">
              Seleccione el tipo de paciente para abrir el registro en la guardia.
            </p>
          </div>
          <Link href="/dashboard" className="text-sm text-blue-600 hover:underline font-medium">
            ← Volver a la lista
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6 bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
          <button
            type="button"
            onClick={() => setTipoGuardia('propio')}
            className={`py-3 px-4 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${
              tipoGuardia === 'propio'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span className="text-lg">🏥</span> Paciente Propio (Sala)
          </button>
          <button
            type="button"
            onClick={() => setTipoGuardia('interconsulta')}
            className={`py-3 px-4 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${
              tipoGuardia === 'interconsulta'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span className="text-lg">📋</span> Interconsulta
          </button>
        </div>

        <form action={crearPaciente} className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-200 space-y-6">
          <input type="hidden" name="serviceType" value={tipoGuardia} />

          {/* SECCIÓN 1: Identificación y Peso Inicial */}
          <div>
            <h2 className="text-lg font-semibold text-slate-700 mb-4 border-b pb-2">1. Identificación del Paciente</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Número de Expediente (Único) *</label>
                <input name="expedienteNumber" required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 placeholder:text-slate-400" placeholder="Ej. EXP-2026-0003" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Edad *</label>
                <input name="age" type="number" required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 placeholder:text-slate-400" placeholder="Ej. 45" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nombres *</label>
                <input name="firstName" required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 placeholder:text-slate-400" placeholder="Ej. Juan" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Apellidos *</label>
                <input name="lastName" required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 placeholder:text-slate-400" placeholder="Ej. Rodríguez" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Sexo *</label>
                <select name="sex" required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900">
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                </select>
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
              {tipoGuardia === 'propio' ? '2. Datos del Ingreso a Sala' : '2. Datos de la Interconsulta'}
            </h2>

            <div className="mb-4">
              <label className="block text-sm font-bold text-slate-800 mb-1">
                📅 {tipoGuardia === 'interconsulta' ? 'Fecha y Hora de la Interconsulta *' : 'Fecha y Hora Real de Ingreso *'}
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
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ubicación / Sala en el Servicio *</label>
                  <input name="room" required className="w-full px-3 py-2 border rounded-lg text-slate-900 text-sm" placeholder="Ej. UCI Cama 4, o Sala 302" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cama *</label>
                  <input name="bed" required className="w-full px-3 py-2 border rounded-lg text-slate-900 text-sm" placeholder="Ej. A o 1" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-purple-900 mb-1">Motivo de Interconsulta *</label>
                  <input
                    name="chiefComplaint"
                    required
                    placeholder="Ej. Evaluación por Lesión Renal Aguda / Criterio de hemodiálisis de urgencia"
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
                  <select name="admissionType" required className="w-full px-3 py-2 border rounded-lg bg-white text-slate-900">
                    <option value="Consulta">Consulta</option>
                    <option value="Emergencia">Emergencia</option>
                    <option value="Referido">Referido</option>
                    <option value="Propios medios">Por sus propios medios</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">MA que lo ingresó *</label>
                  <input name="admittingDoctor" required className="w-full px-3 py-2 border rounded-lg text-slate-900 placeholder:text-slate-400" placeholder="Ej. Dr. Ramírez (MA)" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Médico tratante (residente que ingresó) *</label>
                  <input name="attendingDoctor" required className="w-full px-3 py-2 border rounded-lg text-slate-900 placeholder:text-slate-400" placeholder="Ej. Dra. Gómez (R3)" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Habitación *</label>
                  <input name="room" required className="w-full px-3 py-2 border rounded-lg text-slate-900 placeholder:text-slate-400" placeholder="Ej. 103" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cama *</label>
                  <input name="bed" required className="w-full px-3 py-2 border rounded-lg text-slate-900 placeholder:text-slate-400" placeholder="Ej. A" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Motivo de Ingreso *</label>
                  <input name="chiefComplaint" required className="w-full px-3 py-2 border rounded-lg text-slate-900 placeholder:text-slate-400" placeholder="Ej. Dificultad respiratoria, anasarca..." />
                </div>
              </div>
            )}
          </div>

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
                  placeholder="Ej. Lesión Renal Aguda KDIGO 3 / ERC estadio 5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Diagnósticos Secundarios (Opcional)</label>
                <input
                  name="secondaryDiagnoses"
                  className="w-full px-3 py-2 border rounded-lg text-slate-900 placeholder:text-slate-400"
                  placeholder="Ej. Choque séptico, Neumonía"
                />
              </div>
            </div>
          </div>

          {/* SECCIÓN 4: Alergias */}
          <div>
            <h2 className="text-lg font-semibold text-slate-700 mb-4 border-b pb-2 mt-6">4. Evaluación de Alergias</h2>
            <select name="alergiasEstado" required className="w-full px-3 py-2 border rounded-lg bg-white text-slate-900">
              <option value="sin_alergias">✅ Niega alergias (Sin alergias conocidas)</option>
              <option value="no_evaluada">⚠️ No evaluadas (Pendiente de evaluación)</option>
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
              {tipoGuardia === 'interconsulta' ? 'Guardar Interconsulta' : 'Guardar Paciente de Sala'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}