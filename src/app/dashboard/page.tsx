import { ThemeToggle } from '@/components/ThemeToggle'
import { auth, signOut } from '@/auth'
import { redirect } from 'next/navigation'
import { SessionTimeout } from '@/components/SessionTimeout'
import { prisma } from '@/lib/prisma'
import { ListaPacientes } from '@/components/ListaPacientes'
import Link from 'next/link'

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ doc?: string }> }) {
  const session = await auth()
  if (!session) redirect('/login')

  // Verificación de contraseña obligatoria
  const userDb = await prisma.user.findUnique({ where: { id: session.user?.id } })
  if (userDb?.mustChangePassword) {
    redirect('/dashboard/perfil?force=true')
  }

  const { doc } = await searchParams
  const filtroDoc = doc || ''

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userRole = (session.user as any)?.role
  const nombreMedico = session.user?.name || ''
  const esAdmin = userRole === 'ADMIN'

  // Mostramos TODOS los pacientes activos (sin filtrar por médico)
  const episodes = await prisma.episode.findMany({
    where: {
      status: 'active',
      ...(filtroDoc ? { attendingDoctor: { contains: filtroDoc, mode: 'insensitive' } } : {}),
    },
    include: {
      patient: true,
      allergies: true,
      responsible: true,
      _count: { select: { tasks: true } }
    },
    orderBy: { admissionDate: 'desc' },
  })

  // Contar turnos pendientes para este médico
  const turnosPendientes = await prisma.handoff.count({
    where: {
      status: 'PENDIENTE',
      recibidoPor: { contains: nombreMedico, mode: 'insensitive' }
    }
  })

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <SessionTimeout />

      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex justify-between items-center shadow-sm sticky top-0 z-10 transition-colors duration-300">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">H</div>
          <div>
            <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100">Hospital General</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {esAdmin ? 'Vista de Administrador (Todos)' : `Panel de ${nombreMedico}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          
          {userRole === 'ADMIN' && (
            <>
              <Link href="/dashboard/usuarios" className="bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors shadow-sm">
                👥 Usuarios
              </Link>
              <Link href="/dashboard/auditoria" className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-900 transition-colors shadow-sm">
                📜 Auditoría
              </Link>
            </>
          )}

          <Link 
            href="/dashboard/turnos-pendientes" 
            className="relative bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors shadow-sm"
          >
            🔔 Turnos Pendientes
            {turnosPendientes > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full border-2 border-white dark:border-slate-800 shadow-md">
                {turnosPendientes > 9 ? '+9' : turnosPendientes}
              </span>
            )}
          </Link>

          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{session.user?.name}</p>
            <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">{userRole}</p>
          </div>

          <Link 
            href="/dashboard/perfil" 
            className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            ⚙️ Mi Perfil
          </Link>

          <form action={async () => {
            'use server'
            await signOut({ redirectTo: '/login' })
          }}>
            <button className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors">Salir</button>
          </form>
        </div>
      </header>

      <main className="p-4 md:p-8 max-w-5xl mx-auto">
        <ListaPacientes episodes={episodes} />
      </main>
    </div>
  )
}