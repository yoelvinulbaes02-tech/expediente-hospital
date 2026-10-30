import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { aceptarEntregaTurno } from './actions'

export default async function TurnosPendientesPage() {
  const session = await auth()
  if (!session) redirect('/login')

  // Obtenemos el nombre del médico logueado
  const nombreMedico = session.user?.name || ''

  // Buscamos todos los handoffs que estén en estado PENDIENTE y que sean para este médico
  const handoffs = await prisma.handoff.findMany({
    where: { 
      status: 'PENDIENTE',
      recibidoPor: { contains: nombreMedico, mode: 'insensitive' }
    },
    include: {
      episode: {
        include: { patient: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Link href="/dashboard" className="text-sm text-blue-600 hover:underline mb-2 inline-block">← Volver al Dashboard</Link>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Mis Turnos Pendientes</h1>
            <p className="text-sm text-slate-500">Pacientes entregados a: {nombreMedico}</p>
          </div>
        </div>

        <div className="space-y-4">
          {handoffs.map((handoff) => (
            <div key={handoff.id} className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-amber-200 dark:border-amber-900/50">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                    {handoff.episode.patient.firstName} {handoff.episode.patient.lastName}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Exp: {handoff.episode.patient.expedienteNumber} • Hab: {handoff.episode.room}
                  </p>
                  <p className="text-sm mt-2 text-slate-600 dark:text-slate-300">
                    Entregado por: <strong>{handoff.entregadoPor}</strong>
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Fecha: {handoff.createdAt.toLocaleString('es-DO', { timeZone: 'America/Santo_Domingo' })}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full border border-amber-200">
                    PENDIENTE
                  </span>
                  
                  {/* BOTÓN DE ACEPTAR */}
                  <form action={async () => {
                    'use server'
                    const formData = new FormData()
                    formData.append('handoffId', handoff.id)
                    formData.append('episodeId', handoff.episodeId)
                    await aceptarEntregaTurno(formData)
                  }}>
                    <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm mt-2">
                      ✅ Aceptar Turno
                    </button>
                  </form>
                  
                  <Link href={`/dashboard/paciente/${handoff.episodeId}/turno`} className="text-sm font-semibold text-blue-600 hover:text-blue-800 mt-1">
                    Ver Reporte SBAR →
                  </Link>
                </div>
              </div>
            </div>
          ))}

          {handoffs.length === 0 && (
            <div className="text-center py-12 text-slate-500 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              No tienes turnos pendientes por recibir.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}