import { prisma } from '@/lib/prisma'
import { obtenerSesionSegura, signOut } from '@/auth'
import { calcularTarifaGrupalResidencia, obtenerContextoResidencia } from '@/lib/tenant'
import {
  obtenerAlertasCuentasCompartidas,
  registrarCierreSesionNonce,
} from '@/lib/session-control'
import { asegurarResidenciaHemodialisisDemo } from '@/lib/hemodialisis-bootstrap'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { InputPassword } from '@/components/InputPassword'
import { ThemeToggle } from '@/components/ThemeToggle'
import { CheckCircle2, ChevronDown, ShieldAlert } from 'lucide-react'
import {
  actualizarResidencia,
  crearResidenciaConAdmin,
  extenderSuscripcion,
  procesarPagoSuscripcion,
  reiniciarPagosPrueba,
} from './actions'

const NOMBRES_MESES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
]

function obtenerMesClaveDo(d: Date): string {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Santo_Domingo',
    year: 'numeric',
    month: '2-digit',
  }).formatToParts(d)
  const y = partes.find((p) => p.type === 'year')?.value ?? String(d.getFullYear())
  const m = partes.find((p) => p.type === 'month')?.value ?? String(d.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

function formatearMesLabel(ym: string): string {
  const match = /^(\d{4})-(\d{2})$/.exec(ym)
  if (!match) return ym
  const year = match[1]
  const monthIdx = parseInt(match[2], 10) - 1
  const nombre = NOMBRES_MESES[monthIdx] ?? match[2]
  return `${nombre} ${year}`
}

function rangoMesDo(ym: string): { start: Date; end: Date } | null {
  const match = /^(\d{4})-(\d{2})$/.exec(ym)
  if (!match) return null
  const y = parseInt(match[1], 10)
  const m = parseInt(match[2], 10)
  if (m < 1 || m > 12) return null
  const start = new Date(`${y}-${String(m).padStart(2, '0')}-01T00:00:00-04:00`)
  const ny = m === 12 ? y + 1 : y
  const nm = m === 12 ? 1 : m + 1
  const end = new Date(`${ny}-${String(nm).padStart(2, '0')}-01T00:00:00-04:00`)
  return { start, end }
}

const fmtFecha = (d: Date) =>
  d.toLocaleDateString('es-DO', {
    timeZone: 'America/Santo_Domingo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

const fmtFechaHora = (d: Date) =>
  d.toLocaleString('es-DO', {
    timeZone: 'America/Santo_Domingo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

export default async function PlataformaPage({
  searchParams,
}: {
  searchParams: Promise<{
    ok?: string
    error?: string
    resId?: string
    alcance?: string
    pq?: string
    mes?: string
    verPruebas?: string
  }>
}) {
  const ctx = await obtenerContextoResidencia()
  if (!ctx?.user) redirect('/login')
  if (ctx.user.mustChangePassword) redirect('/dashboard/perfil?force=true')
  if (ctx.user.role !== 'SUPERADMIN') redirect('/dashboard')

  const { ok, error, resId, alcance, pq, mes, verPruebas } = await searchParams
  const mesActual = obtenerMesClaveDo(new Date())
  const filtroMes =
    mes === 'todos' ? 'todos' : mes && /^\d{4}-\d{2}$/.test(mes) ? mes : mesActual
  const rangoMesSeleccionado = filtroMes === 'todos' ? null : rangoMesDo(filtroMes)
  const rangoMesActual = rangoMesDo(mesActual)!
  const viendoPruebas = verPruebas === '1'

  const filtroResidencia = (resId ?? '').trim()
  const filtroAlcance = alcance === 'INDIVIDUAL' || alcance === 'RESIDENCY' ? alcance : ''
  const filtroTextoPago = (pq ?? '').trim()

  const tieneResidenciaHd = await prisma.residency
    .findFirst({
      where: { OR: [{ slug: 'hemodialisis' }, { interfaceMode: 'HEMODIALISIS' }] },
      select: { id: true },
    })
    .catch(() => null)

  if (!tieneResidenciaHd) {
    const esBaseDemo = await prisma.user
      .findFirst({
        where: {
          email: {
            in: ['admin@hospital.test', 'admin.consulta@hospital.test', 'superadmin@nexo.test'],
          },
        },
        select: { id: true },
      })
      .catch(() => null)
    if (esBaseDemo) {
      await asegurarResidenciaHemodialisisDemo()
    }
  }

  const [
    residencias,
    pagosPendientes,
    historialPagos,
    resumenIngresos,
    ingresosMesActual,
    ingresosMesFiltro,
    pagosAprobadosFechas,
    archivadosPruebaCount,
    todosUsuariosEmail,
    resumenCuentasCompartidas,
  ] = await Promise.all([
    prisma.residency.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        users: {
          where: { isActive: true, role: { not: 'SUPERADMIN' } },
          select: { id: true, planStatus: true, individualPriceUsd: true },
        },
        payments: {
          where: { status: 'APROBADO', isTestReset: false },
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            user: { select: { fullName: true } },
          },
        },
        _count: {
          select: {
            users: { where: { isActive: true, role: { not: 'SUPERADMIN' } } },
            patients: true,
            episodes: true,
            consultations: true,
            payments: { where: { status: 'APROBADO', isTestReset: false } },
          },
        },
      },
    }),
    prisma.subscriptionPayment.findMany({
      where: { status: 'PENDIENTE', isTestReset: false },
      include: {
        residency: { select: { name: true, slug: true } },
        user: { select: { fullName: true, email: true } },
      },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.subscriptionPayment.findMany({
      where: {
        isTestReset: viendoPruebas,
        ...(rangoMesSeleccionado
          ? { createdAt: { gte: rangoMesSeleccionado.start, lt: rangoMesSeleccionado.end } }
          : {}),
        ...(filtroResidencia ? { residencyId: filtroResidencia } : {}),
        ...(filtroAlcance ? { billingScope: filtroAlcance } : {}),
        ...(filtroTextoPago
          ? {
              OR: [
                { requestedBy: { contains: filtroTextoPago, mode: 'insensitive' } },
                { reference: { contains: filtroTextoPago, mode: 'insensitive' } },
                { notes: { contains: filtroTextoPago, mode: 'insensitive' } },
                { user: { fullName: { contains: filtroTextoPago, mode: 'insensitive' } } },
                { residency: { name: { contains: filtroTextoPago, mode: 'insensitive' } } },
              ],
            }
          : {}),
      },
      include: {
        residency: { select: { id: true, name: true, slug: true } },
        user: { select: { id: true, fullName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
    prisma.subscriptionPayment.aggregate({
      where: { status: 'APROBADO', isTestReset: false },
      _sum: { amountUsd: true },
      _count: { _all: true },
    }),
    prisma.subscriptionPayment.aggregate({
      where: {
        status: 'APROBADO',
        isTestReset: false,
        createdAt: { gte: rangoMesActual.start, lt: rangoMesActual.end },
      },
      _sum: { amountUsd: true },
      _count: { _all: true },
    }),
    rangoMesSeleccionado
      ? prisma.subscriptionPayment.aggregate({
          where: {
            status: 'APROBADO',
            isTestReset: false,
            createdAt: { gte: rangoMesSeleccionado.start, lt: rangoMesSeleccionado.end },
          },
          _sum: { amountUsd: true },
          _count: { _all: true },
        })
      : prisma.subscriptionPayment.aggregate({
          where: { status: 'APROBADO', isTestReset: false },
          _sum: { amountUsd: true },
          _count: { _all: true },
        }),
    prisma.subscriptionPayment.findMany({
      where: { status: 'APROBADO', isTestReset: false },
      select: { createdAt: true, amountUsd: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.subscriptionPayment.count({
      where: { isTestReset: true },
    }),
    prisma.user.findMany({
      select: { email: true, fullName: true },
    }),
    obtenerAlertasCuentasCompartidas(),
  ])

  const mapaMeses = new Map<string, { total: number; count: number }>()
  mapaMeses.set(mesActual, { total: 0, count: 0 })
  for (const p of pagosAprobadosFechas) {
    const clave = obtenerMesClaveDo(p.createdAt)
    const prev = mapaMeses.get(clave) ?? { total: 0, count: 0 }
    mapaMeses.set(clave, { total: prev.total + p.amountUsd, count: prev.count + 1 })
  }
  if (filtroMes !== 'todos' && !mapaMeses.has(filtroMes)) {
    mapaMeses.set(filtroMes, { total: 0, count: 0 })
  }
  const mesesDisponibles = Array.from(mapaMeses.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([key, val]) => ({ key, label: formatearMesLabel(key), ...val }))

  const mapaNombrePorEmail = new Map(
    todosUsuariosEmail.map((u) => [u.email.toLowerCase(), u.fullName])
  )
  const totalIngresosUsd = resumenIngresos._sum.amountUsd ?? 0
  const totalPagosAprobados = resumenIngresos._count._all ?? 0
  const ingresosMesActualUsd = ingresosMesActual._sum.amountUsd ?? 0
  const pagosMesActualCount = ingresosMesActual._count._all ?? 0
  const ingresosFiltroUsd = ingresosMesFiltro._sum.amountUsd ?? 0
  const pagosFiltroCount = ingresosMesFiltro._count._all ?? 0

  const residenciasActivas = residencias.filter(
    (r) => r.isActive && r.planStatus !== 'SUSPENDED'
  )

  const mrrEstimado = residenciasActivas.reduce((acc, r) => {
    if (r.billingMode === 'INDIVIDUAL') {
      const sumaIndividual = r.users
        .filter((u) => u.planStatus === 'ACTIVE')
        .reduce((sum, u) => sum + (u.individualPriceUsd ?? r.individualPriceUsd), 0)
      return acc + sumaIndividual
    }
    if (r.planStatus === 'ACTIVE') {
      return acc + calcularTarifaGrupalResidencia(r, r._count.users).totalUsd
    }
    return acc
  }, 0)

  const totalUsuarios = residencias.reduce((acc, r) => acc + r._count.users, 0)

  async function cerrarSesion() {
    'use server'
    const sesionActual = await obtenerSesionSegura()
    if (sesionActual?.user?.id && sesionActual.sessionNonce) {
      await registrarCierreSesionNonce({
        actorId: sesionActual.user.id,
        actorRole: String(sesionActual.user.role ?? 'SUPERADMIN'),
        sessionNonce: sesionActual.sessionNonce,
      })
    }
    await signOut({ redirectTo: '/login' })
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-3 flex items-center justify-between gap-4 sticky top-0 z-20">
        <div>
          <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
            NEXO Plataforma Multi-Tenant
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Control central de residencias, cobro grupal o individual y suscripciones mensuales B2B
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/dashboard/auditoria"
            className="text-xs font-semibold text-slate-700 dark:text-slate-200 hover:underline px-2 py-1"
          >
            Auditoría Global
          </Link>
          <form action={cerrarSesion}>
            <button
              type="submit"
              className="text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5 rounded-lg cursor-pointer"
            >
              Salir
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
        {ok && (
          <div className="px-4 py-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium">
            {ok}
          </div>
        )}
        {error && (
          <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm font-medium">
            ⚠️ {error}
          </div>
        )}

        {/* METRICAS DE PLATAFORMA */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">Residencias activas</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
              {residenciasActivas.length} / {residencias.length}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">MRR mensual estimado</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
              ${mrrEstimado.toFixed(2)} USD
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {filtroMes === 'todos'
                ? 'Pagos recibidos (histórico)'
                : `Pagos recibidos (${formatearMesLabel(filtroMes)})`}
            </p>
            <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mt-1 tabular-nums">
              ${ingresosFiltroUsd.toFixed(2)} USD
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 tabular-nums">
              {pagosFiltroCount} pago(s) · Mes actual ({formatearMesLabel(mesActual)}): $
              {ingresosMesActualUsd.toFixed(2)} ({pagosMesActualCount}) · Total acumulado: $
              {totalIngresosUsd.toFixed(2)} ({totalPagosAprobados})
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">Usuarios activos totales</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
              {totalUsuarios}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">Residencias cobro individual</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1 tabular-nums">
              {residencias.filter((r) => r.billingMode === 'INDIVIDUAL').length}
            </p>
          </div>
        </div>

        {/* MONITOR ANTI-CUENTAS COMPARTIDAS */}
        <details className="group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
          <summary className="list-none cursor-pointer px-6 py-4 flex flex-wrap items-center justify-between gap-3 hover:bg-slate-50/70 dark:hover:bg-slate-700/30 transition-colors">
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  Monitor Anti-Cuentas Compartidas (Límite: 2 sesiones por usuario)
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Detecta cuentas con expulsiones automáticas de sesión (&gt;2 sesiones simultáneas) o múltiples IPs/dispositivos en las últimas 24 horas y 7 días.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs tabular-nums">
              <span
                className={`px-2.5 py-1 rounded-lg font-bold border ${
                  resumenCuentasCompartidas.totalExpulsiones24h > 0
                    ? 'bg-rose-50 text-rose-800 border-rose-200'
                    : 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700'
                }`}
              >
                Expulsiones 24h: {resumenCuentasCompartidas.totalExpulsiones24h}
              </span>
              <span
                className={`px-2.5 py-1 rounded-lg font-bold border ${
                  resumenCuentasCompartidas.alertas.length > 0
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                }`}
              >
                Alertas activas: {resumenCuentasCompartidas.alertas.length}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-semibold">
                <ChevronDown className="w-4 h-4 transition-transform -rotate-90 group-open:rotate-0" />
                <span className="group-open:hidden">Expandir</span>
                <span className="hidden group-open:inline">Contraer</span>
              </span>
            </div>
          </summary>

          <div className="border-t border-slate-200 dark:border-slate-700">
            {resumenCuentasCompartidas.alertas.length === 0 ? (
              <div className="px-6 py-5 flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300 bg-emerald-50/60 dark:bg-emerald-950/20">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>
                  Sin indicios recientes de uso compartido. Ninguna cuenta ha superado el límite de 2 sesiones simultáneas ni ha presentado actividad anómala de dispositivos.
                </span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    <tr>
                      <th className="px-4 py-3">Usuario / Rol</th>
                      <th className="px-4 py-3">Residencia / Cobro</th>
                      <th className="px-4 py-3">Expulsiones (&gt;2 sesiones)</th>
                      <th className="px-4 py-3">IPs y Dispositivos (24h)</th>
                      <th className="px-4 py-3">Último evento</th>
                      <th className="px-4 py-3 text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                    {resumenCuentasCompartidas.alertas.map((alerta) => (
                      <tr key={alerta.userId} className="hover:bg-amber-50/40 dark:hover:bg-slate-700/30">
                        <td className="px-4 py-3">
                          <p className="font-bold text-slate-900 dark:text-white">{alerta.fullName}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {alerta.email} · <span className="font-semibold">{alerta.role}</span>
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-slate-800 dark:text-slate-200">
                            {alerta.residencyName}
                          </p>
                          <span
                            className={`inline-block mt-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              alerta.billingMode === 'INDIVIDUAL'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {alerta.billingMode === 'INDIVIDUAL' ? 'Individual' : 'Grupal'}
                          </span>
                        </td>
                        <td className="px-4 py-3 tabular-nums">
                          <span
                            className={`px-2 py-0.5 rounded font-bold ${
                              alerta.evictions24h > 0
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            24h: {alerta.evictions24h} · 7d: {alerta.evictions7d}
                          </span>
                          <span className="block text-[11px] text-slate-500 mt-0.5">
                            Accesos 24h: {alerta.logins24h}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                            {alerta.uniqueIps24h} IP(s) · {alerta.uniqueDevices24h} equipo(s)
                          </p>
                          {alerta.dispositivos24h.length > 0 && (
                            <p className="text-[11px] text-slate-500 truncate max-w-xs" title={alerta.dispositivos24h.join(', ')}>
                              {alerta.dispositivos24h.join(', ')}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300 tabular-nums whitespace-nowrap">
                          <span>{fmtFechaHora(new Date(alerta.lastEventAt))}</span>
                          <span className="block font-mono text-[11px] text-slate-400">
                            {alerta.lastIp ?? 'IP no disponible'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {alerta.residencyId ? (
                            <Link
                              href={`/dashboard/plataforma/residencia/${alerta.residencyId}`}
                              className="inline-block px-2.5 py-1 rounded border border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold whitespace-nowrap"
                            >
                              Ver usuarios →
                            </Link>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </details>

        {/* COLA DE PAGOS PENDIENTES (SI EXISTIERA ALGUNO LEGACY) */}
        {pagosPendientes.length > 0 && (
          <div className="bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 rounded-xl p-5 space-y-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Pagos pendientes de aprobación ({pagosPendientes.length})
            </h2>
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {pagosPendientes.map((pago) => (
                <div
                  key={pago.id}
                  className="py-3 flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div className="text-xs space-y-0.5">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {pago.residency.name}
                      {pago.user ? ` · ${pago.user.fullName}` : ''} ·{' '}
                      <span className="text-emerald-700 tabular-nums">
                        ${pago.amountUsd.toFixed(2)} USD ({pago.periodMonths} mes/es)
                      </span>
                    </p>
                    <p className="text-slate-600 dark:text-slate-300">
                      Método: <strong>{pago.method}</strong> · Ref:{' '}
                      <span className="font-mono">{pago.reference ?? '—'}</span> · Reportó:{' '}
                      {pago.requestedBy}
                    </p>
                    {pago.notes && <p className="text-slate-500">{pago.notes}</p>}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <form action={procesarPagoSuscripcion}>
                      <input type="hidden" name="paymentId" value={pago.id} />
                      <input type="hidden" name="decision" value="APROBADO" />
                      <button
                        type="submit"
                        className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                      >
                        ✓ Aprobar y activar +{pago.periodMonths} mes(es)
                      </button>
                    </form>
                    <form action={procesarPagoSuscripcion}>
                      <input type="hidden" name="paymentId" value={pago.id} />
                      <input type="hidden" name="decision" value="RECHAZADO" />
                      <button
                        type="submit"
                        className="px-3 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold cursor-pointer"
                      >
                        Rechazar
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* HISTORIAL GLOBAL DE PAGOS RECIBIDOS (MENSUAL AUTOMÁTICO + FILTRO POR MES + REINICIO DE PRUEBAS) */}
        <details
          open={Boolean(
            filtroResidencia ||
              filtroAlcance ||
              filtroTextoPago ||
              filtroMes !== mesActual ||
              viendoPruebas
          )}
          className="group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden"
        >
          <summary className="list-none cursor-pointer px-6 py-4 flex flex-wrap items-center justify-between gap-3 hover:bg-slate-50/70 dark:hover:bg-slate-700/30 transition-colors">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                💳 Pagos Recibidos en la Plataforma ({historialPagos.length})
                {viendoPruebas && (
                  <span className="ml-2 text-[11px] px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                    Viendo pruebas archivadas
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Se reinicia automáticamente en $0.00 cada 1ro de mes conservando el historial de todos los meses anteriores para consulta por mes.
              </p>
            </div>

            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 shrink-0">
              <ChevronDown className="w-4 h-4 transition-transform -rotate-90 group-open:rotate-0" />
              <span className="group-open:hidden">Expandir</span>
              <span className="hidden group-open:inline">Contraer</span>
            </span>
          </summary>

          <div className="border-t border-slate-200 dark:border-slate-700">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex flex-wrap items-center justify-end gap-2">
                {archivadosPruebaCount > 0 && (
                  <Link
                    href={
                      viendoPruebas
                        ? `/dashboard/plataforma?mes=${filtroMes}`
                        : `/dashboard/plataforma?mes=todos&verPruebas=1`
                    }
                    className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    {viendoPruebas
                      ? '← Volver a pagos reales'
                      : `Ver pruebas archivadas (${archivadosPruebaCount})`}
                  </Link>
                )}

                <details className="relative inline-block">
                  <summary className="list-none cursor-pointer px-3 py-1.5 rounded-lg border border-red-300 bg-red-50 hover:bg-red-100 text-red-800 text-xs font-bold">
                    ↺ Reiniciar pagos de prueba
                  </summary>
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-red-200 dark:border-red-800 rounded-xl shadow-xl p-4 z-30 text-left space-y-2.5">
                    <p className="text-xs font-bold text-red-900 dark:text-red-200">
                      ¿Reiniciar Pagos Recibidos a $0.00 USD?
                    </p>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                      Archiva los pagos de prueba actuales para que el contador mensual, el histórico real, &quot;Últ. pago&quot; y la tabla de transacciones queden limpios en <strong>$0.00</strong> antes de comenzar a cobrar en producción. La auditoría interna se conserva intacta.
                    </p>
                    <form action={reiniciarPagosPrueba}>
                      <button
                        type="submit"
                        className="w-full py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold cursor-pointer"
                      >
                        Confirmar reinicio a $0.00
                      </button>
                    </form>
                  </div>
                </details>
              </div>

              {/* BARRA DE MESES CON INGRESOS + FILTROS */}
              {mesesDisponibles.length > 0 && !viendoPruebas && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mr-1">
                    Cierre por mes:
                  </span>
                  {mesesDisponibles.map((m) => {
                    const activo = filtroMes === m.key
                    return (
                      <Link
                        key={m.key}
                        href={`/dashboard/plataforma?mes=${m.key}${
                          filtroResidencia ? `&resId=${encodeURIComponent(filtroResidencia)}` : ''
                        }${filtroAlcance ? `&alcance=${filtroAlcance}` : ''}${
                          filtroTextoPago ? `&pq=${encodeURIComponent(filtroTextoPago)}` : ''
                        }`}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors tabular-nums ${
                          activo
                            ? 'bg-emerald-600 text-white border-emerald-700'
                            : 'bg-slate-50 dark:bg-slate-900/60 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {m.label}
                        {m.key === mesActual ? ' (Actual)' : ''}: ${m.total.toFixed(2)} ({m.count})
                      </Link>
                    )
                  })}
                  <Link
                    href={`/dashboard/plataforma?mes=todos${
                      filtroResidencia ? `&resId=${encodeURIComponent(filtroResidencia)}` : ''
                    }${filtroAlcance ? `&alcance=${filtroAlcance}` : ''}${
                      filtroTextoPago ? `&pq=${encodeURIComponent(filtroTextoPago)}` : ''
                    }`}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-colors ${
                      filtroMes === 'todos'
                        ? 'bg-slate-800 text-white border-slate-900'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Todos los meses (${totalIngresosUsd.toFixed(2)})
                  </Link>
                </div>
              )}

              <form method="get" action="/dashboard/plataforma" className="flex flex-wrap items-center gap-2">
                <select
                  name="mes"
                  defaultValue={filtroMes}
                  className="px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold"
                >
                  {mesesDisponibles.map((m) => (
                    <option key={m.key} value={m.key}>
                      {m.label}
                      {m.key === mesActual ? ' (Mes actual)' : ''} · ${m.total.toFixed(2)} ({m.count})
                    </option>
                  ))}
                  <option value="todos">Todos los meses (Histórico)</option>
                </select>

                <select
                  name="resId"
                  defaultValue={filtroResidencia}
                  className="px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                >
                  <option value="">Todas las residencias</option>
                  {residencias.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>

                <select
                  name="alcance"
                  defaultValue={filtroAlcance}
                  className="px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                >
                  <option value="">Todos los alcances</option>
                  <option value="INDIVIDUAL">Solo Individual</option>
                  <option value="RESIDENCY">Solo Grupal</option>
                </select>

                <input
                  name="pq"
                  defaultValue={filtroTextoPago}
                  placeholder="🔍 Buscar usuario, correo o ref..."
                  className="px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white w-52 outline-none focus:ring-2 focus:ring-blue-500"
                />

                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold cursor-pointer"
                >
                  Filtrar
                </button>
                {(filtroResidencia || filtroAlcance || filtroTextoPago || filtroMes !== mesActual || viendoPruebas) && (
                  <Link
                    href="/dashboard/plataforma"
                    className="px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    Mes actual
                  </Link>
                )}
              </form>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs">
                  <tr>
                    <th className="px-4 py-3">Fecha y Hora</th>
                    <th className="px-4 py-3">Residencia</th>
                    <th className="px-4 py-3">Quién Pagó / Alcance</th>
                    <th className="px-4 py-3">Período</th>
                    <th className="px-4 py-3">Monto</th>
                    <th className="px-4 py-3">Método y Referencia</th>
                    <th className="px-4 py-3">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {historialPagos.map((p) => {
                    const nombrePagador =
                      p.user?.fullName ??
                      mapaNombrePorEmail.get(p.requestedBy.toLowerCase()) ??
                      p.requestedBy

                    return (
                      <tr key={p.id}>
                        <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300 tabular-nums whitespace-nowrap">
                          {fmtFechaHora(p.createdAt)}
                        </td>
                        <td className="px-4 py-3 text-xs">
                          <Link
                            href={`/dashboard/plataforma/residencia/${p.residency.id}`}
                            className="font-bold text-blue-700 dark:text-blue-400 hover:underline"
                          >
                            {p.residency.name}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-xs">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span
                              className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${
                                p.billingScope === 'INDIVIDUAL'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {p.billingScope === 'INDIVIDUAL' ? 'Individual' : 'Grupal'}
                            </span>
                            <span className="font-bold text-slate-900 dark:text-white">
                              {nombrePagador}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {p.requestedBy}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-xs tabular-nums whitespace-nowrap">
                          {p.periodMonths} mes(es)
                        </td>
                        <td className="px-4 py-3 text-xs font-extrabold text-emerald-700 dark:text-emerald-400 tabular-nums whitespace-nowrap">
                          ${p.amountUsd.toFixed(2)} USD
                        </td>
                        <td className="px-4 py-3 text-xs">
                          <span className="capitalize font-semibold text-slate-800 dark:text-slate-200">
                            {p.method}
                          </span>
                          <span className="block font-mono text-[11px] text-slate-500 dark:text-slate-400">
                            {p.reference ?? '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs">
                          <span
                            className={`px-2 py-0.5 rounded font-bold ${
                              p.status === 'APROBADO'
                                ? 'bg-emerald-100 text-emerald-800'
                                : p.status === 'RECHAZADO'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {p.status}
                          </span>
                          {p.reviewedBy === 'paypal-automatico' && (
                            <span className="block text-[10px] text-slate-400 mt-0.5">
                              Automático
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                  {historialPagos.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-xs text-slate-500">
                        No hay pagos registrados con los filtros actuales.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </details>

        {/* DAR DE ALTA NUEVA RESIDENCIA + ADMIN INICIAL */}
        <details className="group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
          <summary className="list-none cursor-pointer px-6 py-4 flex flex-wrap items-center justify-between gap-3 hover:bg-slate-50/70 dark:hover:bg-slate-700/30 transition-colors">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Registrar Nueva Residencia / Servicio
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Crea un espacio aislado con su propia interfaz, su modalidad de cobro (Grupal o Individual por usuario) y su cuenta administradora inicial.
              </p>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 shrink-0">
              <ChevronDown className="w-4 h-4 transition-transform -rotate-90 group-open:rotate-0" />
              <span className="group-open:hidden">Expandir</span>
              <span className="hidden group-open:inline">Contraer</span>
            </span>
          </summary>

          <div className="border-t border-slate-200 dark:border-slate-700 p-6">
          <form action={crearResidenciaConAdmin} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nombre de la Residencia / Clínica *
              </label>
              <input
                name="name"
                required
                placeholder="Ej. Consulta Externa Medicina Interna"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Especialidad *
              </label>
              <input
                name="specialty"
                required
                placeholder="Ej. Consulta Externa, Nefrología, Ortopedia..."
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Interfaz Asignada *
              </label>
              <select
                name="interfaceMode"
                defaultValue="CONSULTAS"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold"
              >
                <option value="CONSULTAS">Interfaz de Consultas (Ambulatorio)</option>
                <option value="HOSPITALIZACION">Interfaz de Hospitalización / Nefrología</option>
                <option value="MEDICINA_INTERNA">Interfaz de Medicina Interna (Hospitalización)</option>
                <option value="CIRUGIA">Interfaz de Cirugía (Quirúrgico y Curas)</option>
                <option value="ORTOPEDIA">Interfaz de Ortopedia y Traumatología</option>
                <option value="EMERGENCIA">Interfaz de Emergencia (Trauma Shock / Observación)</option>
                <option value="HEMATOLOGIA">Interfaz de Hematología (Sala y Pase)</option>
                <option value="HEMODIALISIS">Interfaz de Hemodiálisis (Unidad Ambulatoria)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Modalidad de Cobro *
              </label>
              <select
                name="billingMode"
                defaultValue="RESIDENCY"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold"
              >
                <option value="RESIDENCY">🏢 Grupal (Paga la residencia)</option>
                <option value="INDIVIDUAL">👤 Individual (Paga cada usuario)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nombre del Plan
              </label>
              <input
                name="planName"
                defaultValue="Plan Residencia Mensual"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>

            <div className="grid grid-cols-4 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  USD Grupal
                </label>
                <input
                  name="monthlyPriceUsd"
                  type="number"
                  defaultValue={49}
                  min={0}
                  className="w-full px-2 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white tabular-nums"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  USD Ind.
                </label>
                <input
                  name="individualPriceUsd"
                  type="number"
                  defaultValue={15}
                  min={0}
                  className="w-full px-2 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white tabular-nums"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Máx. users
                </label>
                <input
                  name="maxActiveUsers"
                  type="number"
                  defaultValue={25}
                  min={1}
                  className="w-full px-2 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white tabular-nums"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Días
                </label>
                <input
                  name="diasVigencia"
                  type="number"
                  defaultValue={30}
                  min={1}
                  className="w-full px-2 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white tabular-nums"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Estado inicial
              </label>
              <select
                name="planStatus"
                defaultValue="ACTIVE"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              >
                <option value="ACTIVE">Activa (Pagada)</option>
                <option value="TRIAL">Período de prueba</option>
              </select>
            </div>

            <div className="md:col-span-3 rounded-xl border border-teal-200 dark:border-teal-800 bg-teal-50/50 dark:bg-teal-950/20 p-3.5 grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
              <label className="inline-flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-100 cursor-pointer md:col-span-2">
                <input
                  type="checkbox"
                  name="groupPricingEnabled"
                  value="true"
                  className="w-4 h-4 rounded"
                />
                <span>
                  Cobro grupal dinámico (sube automáticamente si se agregan más usuarios activos)
                </span>
              </label>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Usuarios incluidos en tarifa base
                </label>
                <input
                  name="groupIncludedUsers"
                  type="number"
                  min={0}
                  defaultValue={10}
                  className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white tabular-nums"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  USD extra por usuario adicional
                </label>
                <input
                  name="groupPricePerUserUsd"
                  type="number"
                  step="0.01"
                  min={0}
                  defaultValue={5}
                  className="w-full px-2.5 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white tabular-nums"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nombre del Admin Inicial *
              </label>
              <input
                name="adminName"
                required
                placeholder="Ej. Dra. Carla Jiménez"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Correo del Admin Inicial *
              </label>
              <input
                name="adminEmail"
                type="email"
                required
                placeholder="jefe.consulta@hospital.com"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Contraseña temporal *
              </label>
              <InputPassword
                name="adminPassword"
                required
                minLength={8}
                placeholder="Mín. 8 caracteres (letras y números)"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>

            <div className="md:col-span-2 flex items-end justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold cursor-pointer"
              >
                + Crear Residencia y Usuario Admin
              </button>
            </div>
          </form>
          </div>
        </details>

        {/* LISTADO DE RESIDENCIAS */}
        <details className="group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
          <summary className="list-none cursor-pointer px-6 py-4 flex flex-wrap items-center justify-between gap-2 hover:bg-slate-50/70 dark:hover:bg-slate-700/30 transition-colors">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Residencias y Servicios Registrados ({residencias.length})
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Cada residencia mantiene sus usuarios, pagos y modalidad completamente aislados. Pulsa &quot;Gestionar Usuarios&quot; para controlar suscripciones individuales dentro de esa residencia.
              </p>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 shrink-0">
              <ChevronDown className="w-4 h-4 transition-transform -rotate-90 group-open:rotate-0" />
              <span className="group-open:hidden">Expandir</span>
              <span className="hidden group-open:inline">Contraer</span>
            </span>
          </summary>

          <div className="border-t border-slate-200 dark:border-slate-700 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs">
              <tr>
                <th className="px-4 py-3">Residencia / Especialidad</th>
                <th className="px-4 py-3">Actividad</th>
                <th className="px-4 py-3">Interfaz, Cobro y Plan</th>
                <th className="px-4 py-3">Vigencia Grupal</th>
                <th className="px-4 py-3 text-right">Control por Residencia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {residencias.map((r) => {
                const esIndividual = r.billingMode === 'INDIVIDUAL'
                const usuariosVigentes = r.users.filter((u) => u.planStatus === 'ACTIVE').length
                const tarifaGrupal = calcularTarifaGrupalResidencia(r, r._count.users)
                return (
                  <tr key={r.id}>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className="font-bold text-slate-900 dark:text-white">{r.name}</p>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                            esIndividual
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : tarifaGrupal.esDinamico
                                ? 'bg-teal-50 text-teal-800 border-teal-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {esIndividual
                            ? `👤 Individual ($${r.individualPriceUsd}/u)`
                            : tarifaGrupal.esDinamico
                              ? `🏢 Grupal dinámico ($${tarifaGrupal.totalUsd.toFixed(2)} · ${r._count.users}u)`
                              : `🏢 Grupal ($${r.monthlyPriceUsd})`}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {r.specialty} · <span className="font-mono">{r.slug}</span>
                      </p>
                    </td>

                    <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300 tabular-nums">
                      <p>
                        Usuarios: {r._count.users} / {r.maxActiveUsers}
                      </p>
                      {esIndividual && (
                        <p className="text-blue-700 dark:text-blue-300 font-semibold">
                          Con plan activo: {usuariosVigentes}
                        </p>
                      )}
                      <p>Pacientes: {r._count.patients}</p>
                      <p>
                        {r.interfaceMode === 'CONSULTAS'
                          ? `Consultas: ${r._count.consultations}`
                          : r.interfaceMode === 'HEMODIALISIS'
                            ? `Unidad Hemodiálisis`
                            : `Episodios: ${r._count.episodes}`}
                      </p>
                    </td>

                    <td className="px-4 py-3">
                      <form
                        key={`${r.id}-${r.interfaceMode}-${r.billingMode}-${r.planStatus}-${r.monthlyPriceUsd}-${r.individualPriceUsd}-${r.maxActiveUsers}`}
                        action={actualizarResidencia}
                        className="flex flex-wrap items-center gap-1.5"
                      >
                        <input type="hidden" name="residencyId" value={r.id} />
                        <input type="hidden" name="redirectTo" value="/dashboard/plataforma" />
                        <select
                          name="interfaceMode"
                          defaultValue={r.interfaceMode}
                          title="Interfaz asignada"
                          className="px-2 py-1 border rounded text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                        >
                          <option value="HOSPITALIZACION">Hospitalización / Nefrología</option>
                          <option value="MEDICINA_INTERNA">Medicina Interna</option>
                          <option value="CIRUGIA">Cirugía</option>
                          <option value="ORTOPEDIA">Ortopedia y Traumatología</option>
                          <option value="EMERGENCIA">Emergencia</option>
                          <option value="HEMATOLOGIA">Hematología</option>
                          <option value="HEMODIALISIS">Hemodiálisis (Ambulatoria)</option>
                          <option value="CONSULTAS">Consultas Externas</option>
                        </select>
                        <select
                          name="billingMode"
                          defaultValue={r.billingMode}
                          title="Modalidad de cobro"
                          className="px-2 py-1 border rounded text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold"
                        >
                          <option value="RESIDENCY">Cobro Grupal</option>
                          <option value="INDIVIDUAL">Cobro Individual</option>
                        </select>
                        <select
                          name="planStatus"
                          defaultValue={r.planStatus}
                          title="Estado global de la residencia"
                          className="px-2 py-1 border rounded text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                        >
                          <option value="ACTIVE">Activa</option>
                          <option value="TRIAL">Prueba</option>
                          <option value="PAST_DUE">Gracia</option>
                          <option value="SUSPENDED">Suspendida</option>
                        </select>
                        <input
                          name="monthlyPriceUsd"
                          type="number"
                          min={0}
                          defaultValue={r.monthlyPriceUsd}
                          className="w-16 px-2 py-1 border rounded text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white tabular-nums"
                          title="USD mensuales (Grupal)"
                        />
                        <input
                          name="individualPriceUsd"
                          type="number"
                          min={0}
                          defaultValue={r.individualPriceUsd}
                          className="w-16 px-2 py-1 border rounded text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white tabular-nums"
                          title="USD mensuales (Individual por usuario)"
                        />
                        <input
                          name="maxActiveUsers"
                          type="number"
                          min={1}
                          defaultValue={r.maxActiveUsers}
                          className="w-14 px-2 py-1 border rounded text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white tabular-nums"
                          title="Máximo usuarios"
                        />
                        <button
                          type="submit"
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold cursor-pointer"
                        >
                          Guardar
                        </button>
                      </form>
                    </td>

                    <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300 tabular-nums">
                      {esIndividual ? (
                        <span className="text-blue-700 dark:text-blue-300 font-semibold block">
                          Por cada usuario
                        </span>
                      ) : r.subscriptionEndsAt ? (
                        <span className="font-semibold block">{fmtFecha(r.subscriptionEndsAt)}</span>
                      ) : (
                        <span className="block">Sin fecha</span>
                      )}
                      {r.payments[0] && (
                        <span className="block text-[10px] text-emerald-700 dark:text-emerald-400 mt-1">
                          Últ. pago: ${r.payments[0].amountUsd.toFixed(2)} (
                          {r.payments[0].user?.fullName ??
                            mapaNombrePorEmail.get(r.payments[0].requestedBy.toLowerCase()) ??
                            r.payments[0].requestedBy}
                          ) · {fmtFecha(r.payments[0].createdAt)}
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex flex-wrap items-center justify-end gap-1.5">
                        <Link
                          href={`/dashboard/plataforma/residencia/${r.id}`}
                          className="px-2.5 py-1 rounded border border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold whitespace-nowrap"
                        >
                          👤 Gestionar Usuarios ({r._count.users})
                        </Link>
                        {!esIndividual && (
                          <form action={extenderSuscripcion} className="inline-flex">
                            <input type="hidden" name="residencyId" value={r.id} />
                            <input type="hidden" name="dias" value="30" />
                            <button
                              type="submit"
                              className="px-2.5 py-1 rounded border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold cursor-pointer whitespace-nowrap"
                            >
                              +30 días
                            </button>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          </div>
        </details>
      </main>
    </div>
  )
}
