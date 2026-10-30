import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { guardarEntregaTurno } from '../actions-turno'
import { PrintButton } from '@/components/PrintButton'

export default async function EntregaTurnoPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) redirect('/login')

  const { id } = await params;

  const episode = await prisma.episode.findUnique({
    where: { id: id },
    include: {
      patient: true,
      allergies: true,
      notes: { orderBy: { createdAt: 'desc' }, take: 3 },
      vitals: { orderBy: { createdAt: 'desc' }, take: 1 },
      handoffs: { orderBy: { createdAt: 'desc' } }
    },
  })

  if (!episode) return <div className="p-8 text-center text-slate-800">Expediente no encontrado.</div>

  const ultimosVitales = episode.vitals[0]
  const ultimaNota = episode.notes[0]

  return (
    <div className="min-h-screen bg-white p-8 max-w-4xl mx-auto print:p-0">
      
      {/* Cabecera para imprimir */}
      <div className="hidden print:block border-b-2 border-black pb-4 mb-6">
        <h1 className="text-2xl font-bold text-center">HOSPITAL GENERAL</h1>
        <p className="text-center text-sm">Reporte de Entrega de Turno - SBAR</p>
        <p className="text-center text-xs mt-1">Impreso el: {new Date().toLocaleString('es-DO', { timeZone: 'America/Santo_Domingo' })}</p>
      </div>

      {/* Botones de navegación (Ocultos al imprimir) */}
      <div className="flex justify-between items-center mb-6 print:hidden">
        <Link href={`/dashboard/paciente/${episode.id}`} className="text-sm text-blue-600 hover:underline">
          ← Volver al Expediente
        </Link>
        <PrintButton />
      </div>

      <div className="border border-slate-300 rounded-xl p-6 print:border-none print:p-0">
        
        {/* Datos del Paciente */}
        <div className="flex justify-between border-b pb-4 mb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{episode.patient.firstName} {episode.patient.lastName}</h2>
            <p className="text-sm text-slate-600">Exp: {episode.patient.expedienteNumber} • {episode.patient.age} años • {episode.patient.sex}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-blue-800">Hab. {episode.room} - Cama {episode.bed}</p>
            <p className="text-sm text-slate-600">Ingreso: {episode.admissionDate.toLocaleDateString()}</p>
          </div>
        </div>

        {/* Alergias */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-red-600 uppercase mb-1">Alergias</h3>
          <div className="flex gap-2 flex-wrap">
            {episode.allergies.map(a => (
              <span key={a.id} className="border border-red-300 bg-red-50 text-red-700 px-2 py-1 rounded text-sm font-medium">
                {a.allergen} ({a.severity})
              </span>
            ))}
          </div>
        </div>

        {/* S - B - A - R */}
        <div className="space-y-4 text-slate-800 text-sm">
          <div>
            <h3 className="font-bold text-slate-900 border-b">S (Situación Actual)</h3>
            <p className="mt-1"><strong>Motivo de ingreso:</strong> {episode.chiefComplaint}</p>
            <p><strong>Médico Tratante:</strong> {episode.attendingDoctor}</p>
            {ultimosVitales && (
              <p className="mt-2 bg-slate-50 p-2 rounded border">
                <strong>Últimos Signos Vitales:</strong> TA: {ultimosVitales.systolic}/{ultimosVitales.diastolic} • FC: {ultimosVitales.heartRate} • Temp: {ultimosVitales.temperature}°C • SpO2: {ultimosVitales.oxygenSat}%
              </p>
            )}
          </div>

          <div>
            <h3 className="font-bold text-slate-900 border-b">B (Antecedentes / Evolución)</h3>
            {ultimaNota ? (
              <div className="mt-1">
                <p><strong>Última Nota (S):</strong> {ultimaNota.subjective}</p>
                <p><strong>Última Nota (A):</strong> {ultimaNota.assessment}</p>
              </div>
            ) : <p className="text-slate-500 italic mt-1">No hay notas previas.</p>}
          </div>

          <div>
            <h3 className="font-bold text-slate-900 border-b">A (Análisis / Diagnóstico)</h3>
            <p className="mt-1">{ultimaNota ? ultimaNota.assessment : 'Pendiente de evaluación.'}</p>
          </div>

          <div>
            <h3 className="font-bold text-slate-900 border-b">R (Recomendaciones / Plan)</h3>
            <p className="mt-1">{ultimaNota ? ultimaNota.plan : 'Pendiente de indicaciones.'}</p>
          </div>
        </div>

        {/* Formulario de Entrega (Oculto al imprimir) */}
        <div className="mt-8 pt-6 border-t-2 border-dashed print:hidden">
          <h3 className="text-lg font-bold text-slate-800 mb-3">Confirmar Entrega de Turno</h3>
          <form action={guardarEntregaTurno} className="space-y-4 bg-slate-50 p-4 rounded-lg border">
            <input type="hidden" name="episodeId" value={episode.id} />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Entregado por:</label>
              <input disabled value={session.user?.name || ''} className="w-full px-3 py-2 border rounded-lg bg-slate-200 text-slate-600" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Recibido por (Nombre del médico que recibe):</label>
              <input name="recibidoPor" required className="w-full px-3 py-2 border rounded-lg text-slate-900" placeholder="Ej. Dra. Ana Gómez" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Observaciones adicionales (Opcional):</label>
              <textarea name="observaciones" rows={2} className="w-full px-3 py-2 border rounded-lg text-slate-900" placeholder="Ej. Paciente estable, pendiente de laboratorio."></textarea>
            </div>
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium text-sm hover:bg-blue-700">
              Registrar y Firmar Entrega
            </button>
          </form>
        </div>

        {/* Historial de entregas */}
        {episode.handoffs.length > 0 && (
          <div className="mt-6 pt-6 print:hidden">
            <h4 className="font-bold text-slate-700 mb-2 text-sm">Historial de Turnos:</h4>
            <ul className="text-xs text-slate-600 space-y-1">
              {episode.handoffs.map(h => (
                <li key={h.id}>
                  <strong>{h.createdAt.toLocaleString('es-DO', { timeZone: 'America/Santo_Domingo' })}:</strong> Entregado por {h.entregadoPor} → Recibido por {h.recibidoPor}
                </li>
              ))}
            </ul>
          </div>
        )}

      </div>
    </div>
  )
}