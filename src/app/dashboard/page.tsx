import { ThemeToggle } from '@/components/ThemeToggle'
import { signOut } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ListaPacientes } from '@/components/ListaPacientes'
import { ConsultasDashboard } from '@/components/ConsultasDashboard'
import { ROLES_CLINICOS } from '@/lib/permisos'
import { obtenerContextoResidencia } from '@/lib/tenant'
import Image from 'next/image'
import Link from 'next/link'

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ doc?: string; vista?: string }>
}) {
  const ctx = await obtenerContextoResidencia()
  if (!ctx?.user) redirect('/login')

  if (ctx.user.mustChangePassword) {
    redirect('/dashboard/perfil?force=true')
  }

  if (ctx.esSuperAdmin) {
    redirect('/dashboard/plataforma')
  }

  if (!ctx.residency) {
    redirect('/login')
  }

  const residency = ctx.residency
  const suscripcion = ctx.suscripcion
  const suscripcionBloqueada = suscripcion?.bloqueada ?? false

  const { doc, vista } = await searchParams
  const filtroDoc = doc || ''
  const vistaInicial = vista === 'interconsulta' ? 'interconsulta' : 'propio'

  const userId = ctx.user.id
  const userRole = String(ctx.user.role)
  const nombreMedico = ctx.user.fullName || ''
  const emailMedico = ctx.user.email || ''
  const esAdmin = userRole === 'ADMIN'
  const puedeRegistrar = ROLES_CLINICOS.includes(userRole) && !suscripcionBloqueada
  const esModoConsultas = ctx.interfaceMode === 'CONSULTAS'

  const [episodesBase, doctores, turnosPendientes, consultas, pacientesClinica] = await Promise.all([
    esModoConsultas
      ? Promise.resolve([])
      : prisma.episode.findMany({
          where: {
            residencyId: residency.id,
            status: 'active',
            ...(filtroDoc ? { attendingDoctor: { contains: filtroDoc, mode: 'insensitive' } } : {}),
          },
          include: {
            patient: true,
            allergies: true,
            responsible: { select: { fullName: true } },
            handoffs: { where: { status: 'PENDIENTE' }, select: { recibidoPor: true }, take: 1 },
            tasks: {
              where: { status: 'pendiente' },
              orderBy: [{ dueAt: 'asc' }, { createdAt: 'asc' }],
              select: { id: true, title: true, category: true, dueAt: true },
            },
            _count: { select: { tasks: { where: { status: 'pendiente' } } } },
          },
        }),

    prisma.user.findMany({
      where: {
        residencyId: residency.id,
        isActive: true,
        role: { in: ['DOCTOR', 'RESIDENT'] },
        ...(esModoConsultas ? {} : { id: { not: userId } }),
      },
      select: { id: true, fullName: true, email: true },
      orderBy: { fullName: 'asc' },
    }),

    esModoConsultas
      ? Promise.resolve(0)
      : prisma.handoff.count({
          where: {
            status: 'PENDIENTE',
            episode: { residencyId: residency.id },
            recibidoPor: { equals: emailMedico, mode: 'insensitive' },
          },
        }),

    esModoConsultas
      ? prisma.consultation.findMany({
          where: { residencyId: residency.id },
          include: {
            patient: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                age: true,
                sex: true,
                expedienteNumber: true,
                phone: true,
                cedula: true,
              },
            },
          },
          orderBy: { consultationDate: 'desc' },
          take: 250,
        })
      : Promise.resolve([]),

    esModoConsultas
      ? prisma.patient.findMany({
          where: { residencyId: residency.id },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            expedienteNumber: true,
            age: true,
            sex: true,
            phone: true,
          },
          orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
          take: 300,
        })
      : Promise.resolve([]),
  ])

  let perfilesMI = new Map<
    string,
    {
      clinicalStatus: string
      codeStatus: string
      isolationType: string
      oxygenSupport: string
    }
  >()
  if (ctx.interfaceMode === 'MEDICINA_INTERNA' && episodesBase.length > 0) {
    const listaPerfiles = await prisma.internalMedicineProfile
      .findMany({
        where: { episodeId: { in: episodesBase.map((e) => e.id) } },
        select: {
          episodeId: true,
          clinicalStatus: true,
          codeStatus: true,
          isolationType: true,
          oxygenSupport: true,
        },
      })
      .catch(() => [])
    perfilesMI = new Map(
      listaPerfiles.map((p) => [
        p.episodeId,
        {
          clinicalStatus: p.clinicalStatus,
          codeStatus: p.codeStatus,
          isolationType: p.isolationType,
          oxygenSupport: p.oxygenSupport,
        },
      ])
    )
  }

  const episodes = episodesBase.map((ep) => ({
    ...ep,
    internalMedicineProfile: perfilesMI.get(ep.id) ?? null,
  }))

  const textoBadge = turnosPendientes > 9 ? '+9' : String(turnosPendientes)

  const consultasSerializadas = consultas.map((c) => ({
    id: c.id,
    consultationDate: c.consultationDate.toISOString(),
    status: c.status,
    visitType: c.visitType,
    chiefComplaint: c.chiefComplaint,
    diagnosis: c.diagnosis,
    doctorName: c.doctorName,
    patient: c.patient,
  }))

  async function cerrarSesion() {
    'use server'
    await signOut({ redirectTo: '/login' })
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 md:px-6 py-2.5 flex justify-between items-center gap-4 shadow-sm sticky top-0 z-10 transition-colors duration-300">
        {/* IDENTIDAD DE MARCA: ICONO + ORDEN EXACTO */}
        <Link href="/dashboard" className="flex items-center gap-3.5 min-w-0 hover:opacity-95 transition-opacity">
          <Image
            src="/Logo.png"
            alt="NEXO Isotipo"
            width={120}
            height={52}
            priority
            referrerPolicy="no-referrer"
            className="h-11 md:h-13 w-auto object-contain shrink-0"
          />

          <div className="flex flex-col min-w-0 justify-center">
            <h1 className="text-xl md:text-2xl font-black tracking-tight leading-none text-[#0D2344] dark:text-white">
              NE<span className="text-[#00A8B5] dark:text-[#00C4D6]">X</span>O
            </h1>

            <p className="text-[10px] md:text-[11px] font-extrabold text-[#0D2344] dark:text-slate-300 tracking-wider uppercase leading-tight mt-1">
              MEDICAL TEAM WORKFLOW
            </p>

            <div className="w-full max-w-50 md:max-w-55 my-1">
              <svg viewBox="0 0 160 12" className="w-full h-2 text-[#00A8B5]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M0 6 H65 L69 1 L73 11 L77 2 L81 9 L84 6 H160" />
              </svg>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate leading-none mt-0.5 font-medium">
              {residency.name} · {esAdmin ? 'Administración' : nombreMedico}
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          {!esModoConsultas && (
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
          )}

          <ThemeToggle />

          <div className="hidden md:flex items-center gap-3">
            {esAdmin && (
              <>
                <Link href="/dashboard/suscripcion" className="bg-teal-600 text-white px-3.5 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors shadow-sm">
                  💳 Suscripción
                </Link>
                <Link href="/dashboard/usuarios" className="bg-slate-600 text-white px-3.5 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors shadow-sm">
                  👥 Usuarios
                </Link>
                <Link href="/dashboard/auditoria" className="bg-slate-800 text-white px-3.5 py-2 rounded-lg text-sm font-medium hover:bg-slate-900 transition-colors shadow-sm">
                  📜 Auditoría
                </Link>
              </>
            )}

            {!esModoConsultas && (
              <Link
                href="/dashboard/turnos-pendientes"
                className="relative bg-amber-500 text-white px-3.5 py-2 rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors shadow-sm"
              >
                🔔 Turnos Pendientes
                {turnosPendientes > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full border-2 border-white dark:border-slate-800 shadow-md">
                    {textoBadge}
                  </span>
                )}
              </Link>
            )}

            <div className="text-right">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{nombreMedico}</p>
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
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{nombreMedico}</p>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">{userRole}</p>
              </div>

              {esAdmin && (
                <>
                  <Link href="/dashboard/suscripcion" className="block px-3 py-3 rounded-lg text-sm font-medium text-teal-700 dark:text-teal-300 hover:bg-slate-100 dark:hover:bg-slate-700">
                    💳 Suscripción
                  </Link>
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
        {suscripcion?.mensajeAviso && (
          <div
            className={`mb-5 px-4 py-3 rounded-xl border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm ${
              suscripcionBloqueada
                ? 'bg-red-50 border-red-200 text-red-900 dark:bg-red-950/40 dark:border-red-800 dark:text-red-200'
                : 'bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-200'
            }`}
          >
            <p className="font-medium">{suscripcion.mensajeAviso}</p>
            {esAdmin && (
              <Link
                href="/dashboard/suscripcion"
                className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold text-white text-center ${
                  suscripcionBloqueada
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                Gestionar pago mensual →
              </Link>
            )}
          </div>
        )}

        {esModoConsultas ? (
          <ConsultasDashboard
            consultas={consultasSerializadas}
            pacientes={pacientesClinica}
            doctores={doctores}
            residencyName={residency.name}
            specialty={residency.specialty}
            puedeRegistrar={puedeRegistrar}
            suscripcionBloqueada={suscripcionBloqueada}
          />
        ) : (
          <ListaPacientes
            key={vistaInicial}
            episodes={episodes}
            userId={userId}
            miEmail={emailMedico}
            doctores={doctores}
            vistaInicial={vistaInicial}
            puedeMarcarTareas={puedeRegistrar}
            interfaceMode={
              ctx.interfaceMode === 'MEDICINA_INTERNA' ? 'MEDICINA_INTERNA' : 'HOSPITALIZACION'
            }
          />
        )}
      </main>
    </div>
  )
}