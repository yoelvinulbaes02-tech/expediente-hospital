'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Pencil, X } from 'lucide-react'
import { etiquetaRolClinico } from '@/lib/consultas-auth'
import { guardarDatosPacienteConsulta } from '@/app/dashboard/consultas/actions'

type Props = {
  consultationId: string
  puedeEditar: boolean
  puedeEditarFechaRegistro: boolean
  paciente: {
    firstName: string
    lastName: string
    expedienteNumber: string
    age: number | null
    sex: string
    phone: string | null
    cedula: string | null
    bloodType: string | null
  }
  registro: {
    consultationDateLabel: string
    consultationDateLocal: string
    doctorName: string | null
    doctorRole: string | null
    estadoLabel: string
  }
}

export function DatosPacienteConsultaCard({
  consultationId,
  puedeEditar,
  puedeEditarFechaRegistro,
  paciente,
  registro,
}: Props) {
  const router = useRouter()
  const [editando, setEditando] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [feedback, setFeedback] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null)

  const [firstName, setFirstName] = useState(paciente.firstName)
  const [lastName, setLastName] = useState(paciente.lastName)
  const [expedienteNumber, setExpedienteNumber] = useState(paciente.expedienteNumber)
  const [age, setAge] = useState(paciente.age !== null ? String(paciente.age) : '')
  const [sex, setSex] = useState(paciente.sex || 'Femenino')
  const [phone, setPhone] = useState(paciente.phone ?? '')
  const [cedula, setCedula] = useState(paciente.cedula ?? '')
  const [bloodType, setBloodType] = useState(paciente.bloodType ?? '')
  const [consultationDate, setConsultationDate] = useState(registro.consultationDateLocal)

  const handleCancelar = () => {
    setFirstName(paciente.firstName)
    setLastName(paciente.lastName)
    setExpedienteNumber(paciente.expedienteNumber)
    setAge(paciente.age !== null ? String(paciente.age) : '')
    setSex(paciente.sex || 'Femenino')
    setPhone(paciente.phone ?? '')
    setCedula(paciente.cedula ?? '')
    setBloodType(paciente.bloodType ?? '')
    setConsultationDate(registro.consultationDateLocal)
    setFeedback(null)
    setEditando(false)
  }

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!puedeEditar) return
    setGuardando(true)
    setFeedback(null)

    try {
      const fd = new FormData()
      fd.set('consultationId', consultationId)
      fd.set('firstName', firstName)
      fd.set('lastName', lastName)
      fd.set('expedienteNumber', expedienteNumber)
      fd.set('age', age)
      fd.set('sex', sex)
      fd.set('phone', phone)
      fd.set('cedula', cedula)
      fd.set('bloodType', bloodType)
      if (puedeEditarFechaRegistro) {
        fd.set('consultationDate', consultationDate)
      }

      const res = await guardarDatosPacienteConsulta(fd)
      if (!res.ok) {
        setFeedback({ tipo: 'error', texto: res.error ?? 'No se pudieron guardar los cambios.' })
        return
      }

      setEditando(false)
      setFeedback({ tipo: 'ok', texto: 'Datos del paciente y registro actualizados.' })
      router.refresh()
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 space-y-3">
      <div className="flex items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-2">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">
          Datos del Paciente y Registro
        </h2>

        {puedeEditar && (
          <button
            type="button"
            onClick={() => {
              if (editando) {
                handleCancelar()
              } else {
                setFirstName(paciente.firstName)
                setLastName(paciente.lastName)
                setExpedienteNumber(paciente.expedienteNumber)
                setAge(paciente.age !== null ? String(paciente.age) : '')
                setSex(paciente.sex || 'Femenino')
                setPhone(paciente.phone ?? '')
                setCedula(paciente.cedula ?? '')
                setBloodType(paciente.bloodType ?? '')
                setConsultationDate(registro.consultationDateLocal)
                setFeedback(null)
                setEditando(true)
              }
            }}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer shrink-0 ${
              editando
                ? 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600'
                : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-blue-700 dark:text-blue-300 border-slate-300 dark:border-slate-600'
            }`}
          >
            {editando ? (
              <>
                <X className="w-3 h-3" />
                <span>Cancelar</span>
              </>
            ) : (
              <>
                <Pencil className="w-3 h-3" />
                <span>Editar</span>
              </>
            )}
          </button>
        )}
      </div>

      {feedback && (
        <div
          className={`px-3 py-2 rounded-lg border text-xs font-medium ${
            feedback.tipo === 'ok'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-800 dark:text-emerald-200'
              : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/30 dark:border-red-800 dark:text-red-200'
          }`}
        >
          {feedback.texto}
        </div>
      )}

      {editando && puedeEditar ? (
        <form onSubmit={handleGuardar} className="space-y-2.5">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-0.5">
                Nombres *
              </label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-0.5">
                Apellidos *
              </label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-0.5">
                No. Expediente *
              </label>
              <input
                value={expedienteNumber}
                onChange={(e) => setExpedienteNumber(e.target.value)}
                required
                className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white tabular-nums"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-0.5">
                Grupo Sanguíneo
              </label>
              <input
                value={bloodType}
                onChange={(e) => setBloodType(e.target.value)}
                placeholder="Ej. O+"
                className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-0.5">
                Edad
              </label>
              <input
                type="number"
                min={0}
                max={120}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Años"
                className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white tabular-nums"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-0.5">
                Sexo
              </label>
              <select
                value={sex}
                onChange={(e) => setSex(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              >
                <option value="Femenino">Femenino</option>
                <option value="Masculino">Masculino</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-0.5">
                Teléfono
              </label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="809-555-0000"
                className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white tabular-nums"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-0.5">
                Cédula / ID
              </label>
              <input
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
                placeholder="001-0000000-0"
                className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white tabular-nums"
              />
            </div>
          </div>

          {puedeEditarFechaRegistro && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-0.5">
                Fecha y hora de registro
              </label>
              <input
                type="datetime-local"
                value={consultationDate}
                onChange={(e) => setConsultationDate(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white tabular-nums"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={guardando}
            className="w-full inline-flex items-center justify-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold py-2 rounded-lg cursor-pointer disabled:opacity-50"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{guardando ? 'Guardando...' : 'Guardar Cambios'}</span>
          </button>
        </form>
      ) : (
        <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1.5">
          <p>
            <strong>Paciente:</strong> {paciente.firstName} {paciente.lastName}
          </p>
          <p className="tabular-nums">
            <strong>Expediente:</strong> {paciente.expedienteNumber}
          </p>
          <p>
            <strong>Edad / Sexo:</strong>{' '}
            {paciente.age !== null ? `${paciente.age} años` : 'Edad no registrada'} · {paciente.sex}
          </p>
          <p className="tabular-nums">
            <strong>Teléfono:</strong> {paciente.phone || 'No registrado'}
          </p>
          <p className="tabular-nums">
            <strong>Cédula:</strong> {paciente.cedula || 'No registrada'}
          </p>
          <p>
            <strong>Grupo Sanguíneo:</strong> {paciente.bloodType || 'Pendiente'}
          </p>
          <p className="tabular-nums">
            <strong>Fecha y hora:</strong> {registro.consultationDateLabel}
          </p>
          <p>
            <strong>Médico / Firma:</strong>{' '}
            {registro.doctorName || 'Por asignar'}
            {registro.doctorRole ? ` (${etiquetaRolClinico(registro.doctorRole)})` : ''}
          </p>
          <p>
            <strong>Estado:</strong> {registro.estadoLabel}
          </p>
        </div>
      )}
    </div>
  )
}
