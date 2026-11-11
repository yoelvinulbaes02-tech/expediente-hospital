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

  const episodes = await prisma.episode.findMany({
    where: {
      status: 'active',
      ...(filtroDoc ? { attendingDoctor: { contains: filtroDoc, mode: 'insensitive' } } : {}),
    },
    include: {
      patient: true,
      allergies: true,
      responsible: { select: { fullName: true } },
      handoffs: { where: { status: 'PENDIENTE' }, select: { recibidoPor: true }, take: 1 },
      _count: { select: { tasks: { where: { status: 'pendiente' } } } },
    },
  })

  const userId = session.user?.id ?? ''
  const doctores = await prisma.user.findMany({
    where: { isActive: true, role: { in: ['DOCTOR', 'RESIDENT'] }, id: { not: userId } },
    select: { id: true, fullName: true, email: true },
    orderBy: { fullName: 'asc' },
  })

  const turnosPendientes = await prisma.handoff.count({
    where: {
      status: 'PENDIENTE',
      recibidoPor: { contains: nombreMedico, mode: 'insensitive' },
    },
  })

  const textoBadge = turnosPendientes > 9 ? '+9' : String(turnosPendientes)

  async function cerrarSesion() {
    'use server'
    await signOut({ redirectTo: '/login' })
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <SessionTimeout />

      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 md:px-6 py-2.5 md:py-3 flex justify-between items-center gap-3 shadow-sm sticky top-0 z-10 transition-colors duration-300">
        <Link href="/dashboard" className="flex items-center gap-3 min-w-0 hover:opacity-95 transition-opacity">
          <img
            src="/logo.png"
            alt="NEXO Logo"
            className="h-10 md:h-12 w-auto object-contain rounded-md"
          />
          <div className="min-w-0">
            <div className="flex items-baseline gap-2">
              <h1 className="text-base md:text-lg font-black text-slate-800 dark:text-slate-100 tracking-tight leading-tight">
                NEXO
              </h1>
              <span className="text-[10px] md:text-xs font-semibold text-cyan-600 dark:text-cyan-400 tracking-wide hidden sm:inline">
                Medical Team Workflow
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
              {esAdmin ? 'Panel de Administración' : `Guardia: ${nombreMedico}`}
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          <Link
            href="/dashboard/turnos-pendientes"
            aria-label="Turnos pendientes"
            className="relative md:hidden w-10 h-10 flex items-center justify-center rounded-lg bg-amber-500 text-white text-xl shadow-sm hover:bg-amber-600 transition-colors"
          >
            🔔
            {turnosPendientes > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[10px] font-bold min-w-5 h-5 px-1 flex items-center justify-center rounded-full border-2 border-white dark:border-slate-800 shadow-md">
                {textoBadge}
              </span>
            )}
          </Link>

          <ThemeToggle />

          <div className="hidden md:flex items-center gap-4">
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
                  {textoBadge}
                </span>
              )}
            </Link>

            <div className="text-right">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{session.user?.name}</p>
              <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">{userRole}</p>
            </div>

            <Link
              href="/dashboard/perfil"
              className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              ⚙️ Mi Perfil
            </Link>

            <form action={cerrarSesion}>
              <button className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors cursor-pointer">
                Salir
              </button>
            </form>
          </div>

          <details className="relative md:hidden">
            <summary
              aria-label="Abrir menú"
              className="list-none cursor-pointer w-10 h-10 flex items-center justify-center rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xl select-none [&::-webkit-details-marker]:hidden"
            >
              ☰
            </summary>
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg p-2 z-20">
              <div className="px-3 py-2 mb-1 border-b border-slate-200 dark:border-slate-700">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{session.user?.name}</p>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">{userRole}</p>
              </div>

              {userRole === 'ADMIN' && (
                <>
                  <Link href="/dashboard/usuarios" className="block px-3 py-3 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700">
                    👥 Usuarios
                  </Link>
                  <Link href="/dashboard/auditoria" className="block px-3 py-3 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700">
                    📜 Auditoría
                  </Link>
                </>
              )}

              <Link href="/dashboard/perfil" className="block px-3 py-3 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700">
                ⚙️ Mi Perfil
              </Link>

              <form action={cerrarSesion}>
                <button className="w-full text-left px-3 py-3 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 cursor-pointer">
                  Salir
                </button>
              </form>
            </div>
          </details>
        </div>
      </header>

      <main className="p-4 md:p-8 max-w-5xl mx-auto">
        <ListaPacientes
          episodes={episodes}
          userId={userId}
          miEmail={session.user?.email ?? ''}
          doctores={doctores}
        />
      </main>
    </div>
  )
}