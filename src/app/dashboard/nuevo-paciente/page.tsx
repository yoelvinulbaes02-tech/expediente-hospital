import { crearPaciente } from './actions'
import Link from 'next/link'

export default function NuevoPacientePage() {
  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Ingreso de Paciente</h1>
            <p className="text-sm text-slate-500">Complete los datos para abrir un nuevo expediente.</p>
          </div>
          <Link href="/dashboard" className="text-sm text-blue-600 hover:underline">
            ← Volver a la lista
          </Link>
        </div>

        <form action={crearPaciente} className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-slate-200 space-y-6">
          
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

          {/* SECCIÓN 2: Ingreso */}
          <div>
            <h2 className="text-lg font-semibold text-slate-700 mb-4 border-b pb-2 mt-6">2. Datos del Ingreso</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Forma de Ingreso *</label>
                <select name="admissionType" required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900">
                  <option value="Emergencia">Emergencia</option>
                  <option value="Referido">Referido</option>
                  <option value="Ambulancia">Ambulancia</option>
                  <option value="Propios medios">Por sus propios medios</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Médico Tratante *</label>
                <input name="attendingDoctor" required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 placeholder:text-slate-400" placeholder="Ej. Dr. Juan Pérez" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Habitación *</label>
                <input name="room" required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 placeholder:text-slate-400" placeholder="Ej. 204" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cama *</label>
                <input name="bed" required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 placeholder:text-slate-400" placeholder="Ej. A" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Motivo de Ingreso *</label>
                <input name="chiefComplaint" required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 placeholder:text-slate-400" placeholder="Ej. Dolor torácico agudo" />
              </div>
            </div>
          </div>

          {/* SECCIÓN 3: Alergias */}
          <div>
            <h2 className="text-lg font-semibold text-slate-700 mb-4 border-b pb-2 mt-6">3. Evaluación de Alergias</h2>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Estado de Alergias *</label>
              <select name="alergiasEstado" required className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-900">
                <option value="no_evaluada">No evaluadas (Pendiente de evaluación)</option>
                <option value="sin_alergias">Sin alergias conocidas</option>
              </select>
              <p className="text-xs text-slate-500 mt-1">Nota: Si el paciente tiene alergias, ingréselas luego en la pantalla de expediente.</p>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Link href="/dashboard" className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors">
              Cancelar
            </Link>
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Guardar e Ingresar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}