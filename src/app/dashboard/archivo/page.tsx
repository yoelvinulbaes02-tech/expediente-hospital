import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ListaArchivo } from '@/components/ListaArchivo'

export default async function ArchivoPage() {
  const session = await auth()
  if (!session) redirect('/login')

  // Solo los episodios cerrados (los 500 más recientes)
  const episodiosCerrados = await prisma.episode.findMany({
    where: { status: 'closed' },
    include: { patient: true },
    orderBy: { updatedAt: 'desc' },
    take: 500,
  })

  const episodios = episodiosCerrados.map((e) => ({
    id: e.id,
    firstName: e.patient.firstName,
    lastName: e.patient.lastName,
    age: e.patient.age,
    expedienteNumber: e.patient.expedienteNumber,
    chiefComplaint: e.chiefComplaint,
    attendingDoctor: e.attendingDoctor,
    cerradoEl: e.updatedAt.toLocaleDateString('es-DO', { timeZone: 'America/Santo_Domingo' }),
  }))

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex justify-between items-center shadow-sm sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">H</div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">Archivo de Pacientes</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Pacientes con Alta Médica</p>
          </div>
        </div>
        <Link href="/dashboard" className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium">
          ← Volver a Pacientes Activos
        </Link>
      </header>

      <main className="p-4 md:p-8 max-w-5xl mx-auto">
        <ListaArchivo episodios={episodios} />
      </main>
    </div>
  )
}