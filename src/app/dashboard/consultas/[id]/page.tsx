import { prisma } from '@/lib/prisma'
import { obtenerContextoResidencia } from '@/lib/tenant'
import { ROLES_CLINICOS } from '@/lib/permisos'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { BannerAlergias } from '@/components/BannerAlergias'
import { PrintButton } from '@/components/PrintButton'
import { FormularioConsultaClinica } from '@/components/FormularioConsultaClinica'
import {
  agregarAlergiaConsulta,
  guardarAntecedentesConsulta,
  guardarDatosPacienteConsulta,
  marcarSinAlergiasConsulta,
} from '../actions'

const fmtFecha = (d: Date) =>
  d.toLocaleString('es-DO', {
    timeZone: 'America/Santo_Domingo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

export default async function ConsultaDetallePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const ctx = await obtenerContextoResidencia()
  if (!ctx?.user) redirect('/login')

  const { id } = await params

  const consulta = await prisma.consultation.findUnique({
    where: { id },
    include: {
      residency: true,
      patient: {
        include: {
          medicalHistory: true,
          allergies: { orderBy: { createdAt: 'desc' } },
          consultations: {
            where: { id: { not: id } },
            orderBy: { consultationDate: 'desc' },
            take: 10,
          },
        },
      },
    },
  })

  if (!consulta) {
    return <div className="p-8 text-center text-slate-800">Consulta no encontrada.</div>
  }

  if (!ctx.esSuperAdmin && ctx.residency && consulta.residencyId !== ctx.residency.id) {
    redirect('/dashboard')
  }

  const puedeEditar =
    ROLES_CLINICOS.includes(ctx.user.role) && !(ctx.suscripcion?.bloqueada ?? false)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* BARRA SUPERIOR FIJA CON NOMBRE DEL PACIENTE */}
      <div className="sticky top-0 z-40 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 print:hidden">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/dashboard"
              className="text-xs font-bold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-2.5 py-1.5 rounded-lg transition-colors shrink-0 whitespace-nowrap"
            >
              ← Consultas
            </Link>
            <div className="min-w-0">
              <p className="text-sm md:text-base font-extrabold text-slate-900 dark:text-white truncate">
                {consulta.patient.firstName} {consulta.patient.lastName}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate tabular-nums">
                Exp: <strong>{consulta.patient.expedienteNumber}</strong>
                {consulta.patient.age !== null ? ` · ${consulta.patient.age} años` : ''}
                {` · ${consulta.patient.sex}`}
                {consulta.patient.phone ? ` · Tel: ${consulta.patient.phone}` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
              {consulta.status}
            </span>
            <PrintButton />
          </div>
        </div>
      </div>

      {/* CABECERA SOLO PARA IMPRESIÓN DE RECETA / RESUMEN */}
      <div className="hidden print:block max-w-4xl mx-auto p-6 border-b-2 border-slate-900 mb-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-black text-slate-900">{consulta.residency.name}</h1>
            <p className="text-xs text-slate-600">{consulta.residency.specialty}</p>
          </div>
          <div className="text-right text-xs text-slate-600 tabular-nums">
            <p>Fecha: {fmtFecha(consulta.consultationDate)}</p>
            <p>Exp: {consulta.patient.expedienteNumber}</p>
          </div>
        </div>
        <p className="mt-3 text-sm font-bold text-slate-900">
          Paciente: {consulta.patient.firstName} {consulta.patient.lastName} ({consulta.patient.age ?? '—'} años · {consulta.patient.sex})
        </p>
        {consulta.doctorName && (
          <p className="text-xs text-slate-700">Médico tratante: {consulta.doctorName}</p>
        )}
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
        <div className="print:hidden">
          <BannerAlergias alergias={consulta.patient.allergies} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* COLUMNA IZQUIERDA: DATOS, ALERGIAS, ANTECEDENTES E HISTORIAL */}
          <div className="lg:col-span-1 space-y-5 print:hidden">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                  Datos del Paciente
                </h2>
                {puedeEditar && (
                  <details className="relative">
                    <summary className="list-none cursor-pointer text-xs font-semibold text-teal-700 hover:underline">
                      ✏️ Editar
                    </summary>
                    <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-300 dark:border-slate-600 shadow-xl z-30">
                      <form action={guardarDatosPacienteConsulta} className="space-y-2">
                        <input type="hidden" name="consultationId" value={consulta.id} />
                        <input name="firstName" defaultValue={consulta.patient.firstName} required placeholder="Nombres" className="w-full px-2.5 py-1.5 border rounded text-xs" />
                        <input name="lastName" defaultValue={consulta.patient.lastName} required placeholder="Apellidos" className="w-full px-2.5 py-1.5 border rounded text-xs" />
                        <div className="grid grid-cols-2 gap-2">
                          <input name="age" type="number" defaultValue={consulta.patient.age ?? ''} placeholder="Edad" className="w-full px-2 py-1.5 border rounded text-xs" />
                          <select name="sex" defaultValue={consulta.patient.sex} className="w-full px-2 py-1.5 border rounded text-xs bg-white text-slate-900">
                            <option value="Femenino">Femenino</option>
                            <option value="Masculino">Masculino</option>
                          </select>
                        </div>
                        <input name="phone" defaultValue={consulta.patient.phone ?? ''} placeholder="Teléfono" className="w-full px-2.5 py-1.5 border rounded text-xs" />
                        <input name="cedula" defaultValue={consulta.patient.cedula ?? ''} placeholder="Cédula" className="w-full px-2.5 py-1.5 border rounded text-xs" />
                        <input name="bloodType" defaultValue={consulta.patient.bloodType ?? ''} placeholder="Tipo de sangre (Ej. O+)" className="w-full px-2.5 py-1.5 border rounded text-xs" />
                        <button type="submit" className="w-full bg-teal-600 text-white text-xs font-bold py-2 rounded-lg cursor-pointer">
                          Guardar Cambios
                        </button>
                      </form>
                    </div>
                  </details>
                )}
              </div>

              <div className="text-xs text-slate-700 dark:text-slate-300 space-y-1.5">
                <p><strong>Expediente:</strong> {consulta.patient.expedienteNumber}</p>
                <p><strong>Teléfono:</strong> {consulta.patient.phone || 'No registrado'}</p>
                <p><strong>Cédula:</strong> {consulta.patient.cedula || 'No registrada'}</p>
                <p><strong>Grupo Sanguíneo:</strong> {consulta.patient.bloodType || 'Pendiente'}</p>
                <p><strong>Fecha de cita:</strong> {fmtFecha(consulta.consultationDate)}</p>
              </div>
            </div>

            {puedeEditar && (
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 space-y-3">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">
                  Alergias
                </h2>
                <form action={marcarSinAlergiasConsulta}>
                  <input type="hidden" name="consultationId" value={consulta.id} />
                  <button type="submit" className="w-full bg-emerald-50 text-emerald-800 border border-emerald-300 px-3 py-2 rounded-lg text-xs font-bold hover:bg-emerald-100 cursor-pointer">
                    ✅ Marcar: Niega Alergias
                  </button>
                </form>
                <form action={agregarAlergiaConsulta} className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <input type="hidden" name="consultationId" value={consulta.id} />
                  <input name="allergen" required placeholder="Alérgeno (Ej. Penicilina)" className="w-full px-2.5 py-1.5 border rounded-lg text-xs" />
                  <input name="reaction" placeholder="Reacción (opcional)" className="w-full px-2.5 py-1.5 border rounded-lg text-xs" />
                  <button type="submit" className="w-full bg-red-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-red-700 cursor-pointer">
                    Agregar Alergia
                  </button>
                </form>
              </div>
            )}

            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 space-y-3">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">
                Antecedentes Médicos
              </h2>
              <form action={guardarAntecedentesConsulta} className="space-y-2">
                <input type="hidden" name="consultationId" value={consulta.id} />
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500">Patológicos</label>
                  <textarea name="pathological" rows={2} defaultValue={consulta.patient.medicalHistory?.pathological ?? ''} disabled={!puedeEditar} className="w-full px-2.5 py-1.5 border rounded text-xs" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500">Quirúrgicos</label>
                  <textarea name="surgical" rows={2} defaultValue={consulta.patient.medicalHistory?.surgical ?? ''} disabled={!puedeEditar} className="w-full px-2.5 py-1.5 border rounded text-xs" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500">Medicación Habitual</label>
                  <textarea name="medications" rows={2} defaultValue={consulta.patient.medicalHistory?.medications ?? ''} disabled={!puedeEditar} className="w-full px-2.5 py-1.5 border rounded text-xs" />
                </div>
                {puedeEditar && (
                  <button type="submit" className="w-full bg-slate-800 text-white py-2 rounded-lg text-xs font-bold hover:bg-slate-900 cursor-pointer">
                    Guardar Antecedentes
                  </button>
                )}
              </form>
            </div>

            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 space-y-3">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">
                Consultas Anteriores ({consulta.patient.consultations.length})
              </h2>
              <div className="space-y-2">
                {consulta.patient.consultations.map((prev) => (
                  <Link
                    key={prev.id}
                    href={`/dashboard/consultas/${prev.id}`}
                    className="block p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/40 text-xs space-y-0.5"
                  >
                    <p className="font-bold text-slate-800 dark:text-slate-100 tabular-nums">
                      {fmtFecha(prev.consultationDate)} · {prev.visitType}
                    </p>
                    <p className="text-slate-600 dark:text-slate-300 truncate">
                      {prev.diagnosis || prev.chiefComplaint}
                    </p>
                  </Link>
                ))}
                {consulta.patient.consultations.length === 0 && (
                  <p className="text-xs text-slate-400">Primera consulta registrada para este paciente.</p>
                )}
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: FORMULARIO CLÍNICO PRINCIPAL */}
          <div className="lg:col-span-2">
            <FormularioConsultaClinica
              puedeEditar={puedeEditar}
              consulta={{
                id: consulta.id,
                status: consulta.status,
                visitType: consulta.visitType,
                chiefComplaint: consulta.chiefComplaint,
                bloodPressure: consulta.bloodPressure,
                heartRate: consulta.heartRate,
                temperature: consulta.temperature,
                oxygenSat: consulta.oxygenSat,
                weight: consulta.weight,
                weightUnit: consulta.weightUnit,
                heightCm: consulta.heightCm,
                historyIllness: consulta.historyIllness,
                physicalExam: consulta.physicalExam,
                diagnosis: consulta.diagnosis,
                treatmentPlan: consulta.treatmentPlan,
                labOrders: consulta.labOrders,
                nextAppointment: consulta.nextAppointment
                  ? consulta.nextAppointment.toISOString().slice(0, 10)
                  : null,
                notes: consulta.notes,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}