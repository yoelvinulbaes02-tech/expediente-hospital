'use client'

import { useState } from 'react'
import { crearPaciente } from './actions'
import Link from 'next/link'

export default function NuevoPacientePage() {
  const [tipoGuardia, setTipoGuardia] = useState<'propio' | 'interconsulta'>('propio')

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Ingreso de Paciente</h1>
            <p className="text-sm text-slate-500">
              Seleccione el área de guardia para abrir el expediente clínico correspondiente.
            </p>
          </div>
          <Link href="/dashboard" className="text-sm text-blue-600 hover:underline font-medium">
            ← Volver a la lista
          </Link>
        </div>

        {/* SELECTOR DE TIPO DE GUARDIA */}
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

          {/* SECCIÓN 1: Identificación */}
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
            </div>
          </div>

          {/* SECCIÓN 2: Datos de Ingreso / Interconsulta */}
          <div>
            <h2 className="text-lg font-semibold text-slate-700 mb-4 border-b pb-2 mt-6">
              {tipoGuardia === 'propio' ? '2. Datos del Ingreso a Sala' : '2. Datos de la Interconsulta'}
            </h2>

            {tipoGuardia === 'interconsulta' ? (
              /* CAMPOS ESPECÍFICOS DE INTERCONSULTA */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-purple-50/50 p-4 rounded-xl border border-purple-200">
                <div>
                  <label className="block text-sm font-bold text-purple-900 mb-1">
                    Departamento Interconsultante *
                  </label>
                  <select
                    name="consultingDepartment"
                    required
                    className="w-full px-3 py-2 border rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-purple-500 outline-none"
                  >
                    <option value="">Seleccione departamento...</option>
                    <option value="Unidad de Cuidados Intensivos (UCI)">Unidad de Cuidados Intensivos (UCI)</option>
                    <option value="Cirugía General">Cirugía General</option>
                    <option value="Medicina Interna">Medicina Interna</option>
                    <option value="Emergencia">Emergencia / Triaje</option>
                    <option value="Ginecología y Obstetricia">Ginecología y Obstetricia</option>
                    <option value="Ortopedia y Traumatología">Ortopedia y Traumatología</option>
                    <option value="Cardiología">Cardiología</option>
                    <option value="Pediatría">Pediatría</option>
                    <option value="Otro Departamento">Otro Departamento</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-purple-900 mb-1">
                    Residente a Cargo de la Interconsulta *
                  </label>
                  <input
                    name="consultingResident"
                    required
                    placeholder="Ej. Dr. Martínez (R2)"
                    className="w-full px-3 py-2 border rounded-lg bg-white text-slate-900 focus:ring-2 focus:ring-purple-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Ubicación / Habitación en el Servicio *</label>
                  <input name="room" required className="w-full px-3 py-2 border rounded-lg text-slate-900 placeholder:text-slate-400" placeholder="Ej. UCI Cama 4, o Sala 302" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cama *</label>
                  <input name="bed" required className="w-full px-3 py-2 border rounded-lg text-slate-900 placeholder:text-slate-400" placeholder="Ej. A o 1" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-purple-900 mb-1">Motivo de Interconsulta *</label>
                  <input
                    name="chiefComplaint"
                    required
                    placeholder="Ej. Evaluación por Lesión Renal Aguda / Criterio de hemodiálisis de urgencia"
                    className="w-full px-3 py-2 border rounded-lg text-slate-900 placeholder:text-slate-400"
                  />
                </div>

                {/* Campos ocultos compatibles para interconsultas */}
                <input type="hidden" name="admissionType" value="Interconsulta" />
                <input type="hidden" name="admittingDoctor" value="Interconsulta Solicitada" />
                <input type="hidden" name="attendingDoctor" value="Residente Interconsultas" />
              </div>
            ) : (
              /* CAMPOS HABITUALES DE PACIENTE PROPIO */
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
                  placeholder="Ej. Choque séptico, Neumonía adquirida en la comunidad"
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
              className={`px-6 py-2.5 rounded-lg font-bold text-white transition-colors shadow-sm ${
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