import { prisma } from '@/lib/prisma'
import { signOut } from '@/auth'
import { obtenerContextoResidencia } from '@/lib/tenant'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { InputPassword } from '@/components/InputPassword'
import { ThemeToggle } from '@/components/ThemeToggle'
import {
  actualizarResidencia,
  crearResidenciaConAdmin,
  extenderSuscripcion,
  procesarPagoSuscripcion,
} from './actions'

const fmtFecha = (d: Date) =>
  d.toLocaleDateString('es-DO', {
    timeZone: 'America/Santo_Domingo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

export default async function PlataformaPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>
}) {
  const ctx = await obtenerContextoResidencia()
  if (!ctx?.user) redirect('/login')
  if (ctx.user.mustChangePassword) redirect('/dashboard/perfil?force=true')
  if (ctx.user.role !== 'SUPERADMIN') redirect('/dashboard')

  const { ok, error } = await searchParams

  const [residencias, pagosPendientes] = await Promise.all([
    prisma.residency.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            users: { where: { isActive: true } },
            patients: true,
            episodes: true,
            consultations: true,
          },
        },
      },
    }),
    prisma.subscriptionPayment.findMany({
      where: { status: 'PENDIENTE' },
      include: { residency: { select: { name: true, slug: true } } },
      orderBy: { createdAt: 'asc' },
    }),
  ])

  const residenciasActivas = residencias.filter(
    (r) => r.isActive && r.planStatus !== 'SUSPENDED'
  )
  const mrrEstimado = residenciasActivas
    .filter((r) => r.planStatus === 'ACTIVE')
    .reduce((acc, r) => acc + r.monthlyPriceUsd, 0)
  const totalUsuarios = residencias.reduce((acc, r) => acc + r._count.users, 0)

  async function cerrarSesion() {
    'use server'
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
            Control central de residencias, interfaces y suscripciones mensuales B2B
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">Residencias activas</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
              {residenciasActivas.length} / {residencias.length}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">MRR mensual activo</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
              ${mrrEstimado} USD
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">Usuarios activos totales</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
              {totalUsuarios}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">Pagos por aprobar</p>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1 tabular-nums">
              {pagosPendientes.length}
            </p>
          </div>
        </div>

        {/* COLA DE PAGOS PENDIENTES */}
        {pagosPendientes.length > 0 && (
          <div className="bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 rounded-xl p-5 space-y-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Pagos B2B pendientes de aprobación ({pagosPendientes.length})
            </h2>
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {pagosPendientes.map((pago) => (
                <div
                  key={pago.id}
                  className="py-3 flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div className="text-xs space-y-0.5">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {pago.residency.name} ·{' '}
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

        {/* DAR DE ALTA NUEVA RESIDENCIA + ADMIN INICIAL */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Registrar Nueva Residencia / Servicio
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Crea un espacio aislado con su propia interfaz (Consultas o Hospitalización) y su cuenta administradora inicial.
            </p>
          </div>

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
                placeholder="Ej. Consulta Externa, Nefrología, Cirugía..."
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

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  USD / mes
                </label>
                <input
                  name="monthlyPriceUsd"
                  type="number"
                  defaultValue={49}
                  min={0}
                  className="w-full px-2.5 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Máx. users
                </label>
                <input
                  name="maxActiveUsers"
                  type="number"
                  defaultValue={25}
                  min={1}
                  className="w-full px-2.5 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Días
                </label>
                <input
                  name="diasVigencia"
                  type="number"
                  defaultValue={30}
                  min={1}
                  className="w-full px-2.5 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white tabular-nums"
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

            <div className="md:col-span-3 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold cursor-pointer"
              >
                + Crear Residencia y Usuario Admin
              </button>
            </div>
          </form>
        </div>

        {/* LISTADO DE RESIDENCIAS */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-x-auto">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Residencias y Servicios Registrados
            </h2>
          </div>

          <table className="w-full text-sm text-left">
            <thead className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs">
              <tr>
                <th className="px-4 py-3">Residencia / Especialidad</th>
                <th className="px-4 py-3">Actividad</th>
                <th className="px-4 py-3">Interfaz y Plan</th>
                <th className="px-4 py-3">Vigencia</th>
                <th className="px-4 py-3 text-right">Acciones rápidas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {residencias.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-3">
                    <p className="font-bold text-slate-900 dark:text-white">{r.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {r.specialty} · <span className="font-mono">{r.slug}</span>
                    </p>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300 tabular-nums">
                    <p>Usuarios: {r._count.users} / {r.maxActiveUsers}</p>
                    <p>Pacientes: {r._count.patients}</p>
                    <p>
                      {r.interfaceMode === 'CONSULTAS'
                        ? `Consultas: ${r._count.consultations}`
                        : `Episodios: ${r._count.episodes}`}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <form action={actualizarResidencia} className="flex flex-wrap items-center gap-1.5">
                      <input type="hidden" name="residencyId" value={r.id} />
                      <select
                        name="interfaceMode"
                        defaultValue={r.interfaceMode}
                        className="px-2 py-1 border rounded text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      >
                        <option value="HOSPITALIZACION">Hospitalización / Nefrología</option>
                        <option value="MEDICINA_INTERNA">Medicina Interna</option>
                        <option value="CONSULTAS">Consultas</option>
                      </select>
                      <select
                        name="planStatus"
                        defaultValue={r.planStatus}
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
                        defaultValue={r.monthlyPriceUsd}
                        className="w-16 px-2 py-1 border rounded text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white tabular-nums"
                        title="USD mensuales"
                      />
                      <input
                        name="maxActiveUsers"
                        type="number"
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
                    {r.subscriptionEndsAt ? fmtFecha(r.subscriptionEndsAt) : 'Sin fecha'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <form action={extenderSuscripcion} className="inline-flex gap-1.5">
                      <input type="hidden" name="residencyId" value={r.id} />
                      <input type="hidden" name="dias" value="30" />
                      <button
                        type="submit"
                        className="px-2.5 py-1 rounded border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold cursor-pointer whitespace-nowrap"
                      >
                        +30 días
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
