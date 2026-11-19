import { prisma } from '@/lib/prisma'
import {
  evaluarPlanEstado,
  obtenerContextoResidencia,
  obtenerTarifaIndividualUsuario,
} from '@/lib/tenant'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { SearchInput } from '@/components/SearchInput'
import { ThemeToggle } from '@/components/ThemeToggle'
import {
  actualizarPrecioUsuario,
  actualizarResidencia,
  actualizarSuscripcionUsuario,
  aplicarVigenciaATodosUsuarios,
  cambiarModalidadCobroResidencia,
} from '../../actions'

const INTERFACES_DISPONIBLES = [
  {
    id: 'HOSPITALIZACION',
    nombre: 'Hospitalización / Nefrología',
    descripcion: 'Pacientes ingresados, TFG, accesos vasculares, serología e interconsultas.',
  },
  {
    id: 'MEDICINA_INTERNA',
    nombre: 'Medicina Interna',
    descripcion: 'Hospitalización con perfil clínico MI (código, aislamiento, dieta, balance).',
  },
  {
    id: 'CONSULTAS',
    nombre: 'Consultas Externas',
    descripcion: 'Agenda ambulatoria, citas médicas, signos en consulta y recetas.',
  },
] as const

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

export default async function ControlResidenciaSuperAdminPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ q?: string; ok?: string; error?: string }>
}) {
  const ctx = await obtenerContextoResidencia()
  if (!ctx?.user) redirect('/login')
  if (ctx.user.mustChangePassword) redirect('/dashboard/perfil?force=true')
  if (ctx.user.role !== 'SUPERADMIN') redirect('/dashboard')

  const { id } = await params
  const { q, ok, error } = await searchParams
  const busqueda = (q ?? '').trim()

  const residency = await prisma.residency.findUnique({
    where: { id },
  })
  if (!residency) {
    redirect('/dashboard/plataforma?error=' + encodeURIComponent('Residencia no encontrada.'))
  }

  const [usuarios, pagos] = await Promise.all([
    prisma.user.findMany({
      where: {
        residencyId: residency.id,
        role: { not: 'SUPERADMIN' },
        ...(busqueda
          ? {
              OR: [
                { fullName: { contains: busqueda, mode: 'insensitive' } },
                { email: { contains: busqueda, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: [{ isActive: 'desc' }, { fullName: 'asc' }],
    }),
    prisma.subscriptionPayment.findMany({
      where: { residencyId: residency.id },
      include: {
        user: { select: { fullName: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 40,
    }),
  ])

  const todosActivos = usuarios.filter((u) => u.isActive)
  let alDiaCount = 0
  let graciaCount = 0
  let suspendidosCount = 0

  todosActivos.forEach((u) => {
    const est = evaluarPlanEstado({
      isActive: u.isActive,
      planStatus: u.planStatus,
      subscriptionEndsAt: u.subscriptionEndsAt,
      modoCobro: 'INDIVIDUAL',
    })
    if (est.bloqueada) suspendidosCount++
    else if (est.enGracia) graciaCount++
    else alDiaCount++
  })

  const esIndividual = residency.billingMode === 'INDIVIDUAL'

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-3 flex items-center justify-between gap-4 sticky top-0 z-20">
        <div>
          <Link
            href="/dashboard/plataforma"
            className="text-xs font-semibold text-blue-600 hover:underline inline-block mb-0.5"
          >
            ← Volver a Plataforma Multi-Tenant
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
              {residency.name}
            </h1>
            <span
              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                esIndividual
                  ? 'bg-blue-50 text-blue-800 border-blue-200'
                  : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              {esIndividual ? '👤 Cobro Individual por Usuario' : '🏢 Cobro Grupal por Residencia'}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {residency.specialty} · <span className="font-mono">{residency.slug}</span> · Panel aislado exclusivamente para esta residencia
          </p>
        </div>

        <ThemeToggle />
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

        {/* SELECTOR RÁPIDO DE MODALIDAD DE COBRO */}
        <div
          className={`rounded-xl border p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
            esIndividual
              ? 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
          }`}
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Modalidad actual de {residency.name}
            </p>
            <h2 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
              {esIndividual
                ? '👤 Cobro Individual ACTIVADO (Cada usuario paga su propia suscripción)'
                : '🏢 Cobro Grupal ACTIVO (Solo paga el Administrador para toda la residencia)'}
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              {esIndividual
                ? 'Todos los usuarios activos de esta residencia ven el botón "💳 Mi Suscripción" y pagan su tarifa asignada en esta tabla.'
                : 'Los médicos/usuarios normales no ven botón de pago porque la residencia paga en grupo. Cámbialo a Individual si deseas que cada usuario pague por separado.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <form action={cambiarModalidadCobroResidencia}>
              <input type="hidden" name="residencyId" value={residency.id} />
              <input
                type="hidden"
                name="billingMode"
                value={esIndividual ? 'RESIDENCY' : 'INDIVIDUAL'}
              />
              <button
                type="submit"
                className={`px-4 py-2.5 rounded-lg text-xs font-bold text-white cursor-pointer shadow-sm ${
                  esIndividual
                    ? 'bg-slate-700 hover:bg-slate-800'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {esIndividual
                  ? '🏢 Cambiar a Cobro Grupal'
                  : '👤 Activar Cobro Individual por Usuario'}
              </button>
            </form>
          </div>
        </div>

        {/* CONFIGURACIÓN DE INTERFAZ Y TARIFAS BASE DE ESTA RESIDENCIA */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 space-y-4">
          <div className="border-b border-slate-200 dark:border-slate-700 pb-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Interfaz Clínica y Tarifas Base de {residency.name}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Interfaces clínicas disponibles actualmente en NEXO: 3 módulos completos. Selecciona cuál usa esta residencia.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3">
              {INTERFACES_DISPONIBLES.map((iface) => {
                const activa = residency.interfaceMode === iface.id
                return (
                  <div
                    key={iface.id}
                    className={`rounded-lg border px-3 py-2 text-xs ${
                      activa
                        ? 'bg-teal-50 dark:bg-teal-950/30 border-teal-300 dark:border-teal-700 text-teal-900 dark:text-teal-200'
                        : 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <p className="font-bold">
                      {activa ? '✓ ' : ''}
                      {iface.nombre}
                    </p>
                    <p className="text-[11px] opacity-85 mt-0.5">{iface.descripcion}</p>
                  </div>
                )
              })}
            </div>
          </div>

          <form
            action={actualizarResidencia}
            className="grid grid-cols-2 md:grid-cols-6 gap-3 items-end"
          >
            <input type="hidden" name="residencyId" value={residency.id} />
            <input
              type="hidden"
              name="redirectTo"
              value={`/dashboard/plataforma/residencia/${residency.id}`}
            />

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Modalidad de cobro
              </label>
              <select
                name="billingMode"
                defaultValue={residency.billingMode}
                className="w-full px-2.5 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold"
              >
                <option value="RESIDENCY">🏢 Grupal (Residencia)</option>
                <option value="INDIVIDUAL">👤 Individual (Por Usuario)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Interfaz asignada
              </label>
              <select
                name="interfaceMode"
                defaultValue={residency.interfaceMode}
                className="w-full px-2.5 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              >
                <option value="HOSPITALIZACION">Hospitalización / Nefrología</option>
                <option value="MEDICINA_INTERNA">Medicina Interna</option>
                <option value="CONSULTAS">Consultas Externas</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Estado residencia
              </label>
              <select
                name="planStatus"
                defaultValue={residency.planStatus}
                className="w-full px-2.5 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              >
                <option value="ACTIVE">Activa</option>
                <option value="TRIAL">Prueba</option>
                <option value="PAST_DUE">Gracia</option>
                <option value="SUSPENDED">Suspendida</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                USD Grupal / mes
              </label>
              <input
                name="monthlyPriceUsd"
                type="number"
                min={0}
                defaultValue={residency.monthlyPriceUsd}
                className="w-full px-2.5 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white tabular-nums"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Tarifa base Individual ($/u)
              </label>
              <input
                name="individualPriceUsd"
                type="number"
                min={0}
                defaultValue={residency.individualPriceUsd}
                className="w-full px-2.5 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white tabular-nums"
              />
            </div>

            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Máx. users
                </label>
                <input
                  name="maxActiveUsers"
                  type="number"
                  min={1}
                  defaultValue={residency.maxActiveUsers}
                  className="w-full px-2.5 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white tabular-nums"
                />
              </div>
              <button
                type="submit"
                className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
              >
                Guardar
              </button>
            </div>
          </form>
        </div>

        {/* MÉTRICAS DE USUARIOS DE ESTA RESIDENCIA */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">Usuarios en esta residencia</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
              {todosActivos.length} / {residency.maxActiveUsers}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">Suscripción individual al día</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
              {alDiaCount}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">En período de gracia</p>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1 tabular-nums">
              {graciaCount}
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
            <p className="text-xs text-slate-500 dark:text-slate-400">Suspendidos / vencidos</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1 tabular-nums">
              {suspendidosCount}
            </p>
          </div>
        </div>

        {/* GUÍA CLARA DEL COBRO AUTOMÁTICO VS BOTONES MANUALES */}
        <div className="bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs text-slate-700 dark:text-slate-300 space-y-1">
          <p className="font-bold text-slate-900 dark:text-white">
            ℹ️ ¿Cómo funciona el cobro automático vs los botones manuales?
          </p>
          <p>
            • <strong>Automático:</strong> Todo usuario con una fecha en <em>Vigencia</em> recibe automáticamente avisos 5 días antes de vencer, luego <strong>5 días automáticos de gracia</strong> al vencer y pasa automáticamente a <strong>Solo lectura</strong> en el día 6 hasta que pague por PayPal o Tarjeta.
          </p>
          <p>
            • <strong>Botón &quot;Iniciar cobro (5d)&quot;:</strong> Solo sirve para usuarios antiguos que dicen <em>&quot;Sin fecha límite&quot;</em> y a los que decides empezar a cobrar desde hoy (les fija la fecha de vencimiento hoy para activar su cuenta regresiva automática de 5 días de gracia).
          </p>
        </div>

        {/* ACCIONES CONTROLADAS PARA ESTA RESIDENCIA + BUSCADOR */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="w-full md:w-80">
            <SearchInput
              defaultValue={busqueda}
              placeholder="🔍 Buscar usuario en esta residencia..."
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <form action={aplicarVigenciaATodosUsuarios}>
              <input type="hidden" name="residencyId" value={residency.id} />
              <input type="hidden" name="accion" value="extender_30_todos" />
              <button
                type="submit"
                className="px-3 py-2 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold cursor-pointer"
              >
                +30 días a todos los activos
              </button>
            </form>
            <form action={aplicarVigenciaATodosUsuarios}>
              <input type="hidden" name="residencyId" value={residency.id} />
              <input type="hidden" name="accion" value="iniciar_cobro_sin_fecha" />
              <button
                type="submit"
                className="px-3 py-2 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold cursor-pointer"
              >
                Iniciar cobro hoy (5d gracia) a usuarios sin fecha
              </button>
            </form>
          </div>
        </div>

        {/* TABLA DE USUARIOS DE ESTA RESIDENCIA */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-x-auto">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Control y Tarifa Individual por Usuario ({usuarios.length})
            </h2>
          </div>

          <table className="w-full text-sm text-left">
            <thead className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs">
              <tr>
                <th className="px-4 py-3">Usuario</th>
                <th className="px-4 py-3">Rol / Cuenta</th>
                <th className="px-4 py-3">Precio Mensual (USD)</th>
                <th className="px-4 py-3">Suscripción Individual</th>
                <th className="px-4 py-3">Vigencia</th>
                <th className="px-4 py-3 text-right">Acciones SuperAdmin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {usuarios.map((u) => {
                const est = evaluarPlanEstado({
                  isActive: u.isActive,
                  planStatus: u.planStatus,
                  subscriptionEndsAt: u.subscriptionEndsAt,
                  modoCobro: 'INDIVIDUAL',
                })
                const tarifaUsuario = obtenerTarifaIndividualUsuario(residency, u)
                const tieneTarifaPersonalizada = u.individualPriceUsd !== null

                return (
                  <tr key={u.id}>
                    <td className="px-4 py-3">
                      <p className="font-bold text-slate-900 dark:text-white">{u.fullName}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{u.email}</p>
                      {u.lastPaymentNote && (
                        <p className="text-[11px] text-slate-400 mt-0.5">{u.lastPaymentNote}</p>
                      )}
                    </td>

                    <td className="px-4 py-3 text-xs">
                      <span className="font-semibold text-slate-700 dark:text-slate-200">
                        {u.role}
                      </span>
                      <span
                        className={`block mt-0.5 text-[11px] font-bold ${
                          u.isActive ? 'text-emerald-700' : 'text-red-600'
                        }`}
                      >
                        {u.isActive ? 'Cuenta activa' : 'Desactivada'}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-xs">
                      <form action={actualizarPrecioUsuario} className="flex items-center gap-1.5">
                        <input type="hidden" name="residencyId" value={residency.id} />
                        <input type="hidden" name="userId" value={u.id} />
                        <div className="flex items-center border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900 overflow-hidden">
                          <span className="px-1.5 text-[11px] text-slate-500 font-bold">$</span>
                          <input
                            name="individualPriceUsd"
                            type="number"
                            min={0}
                            defaultValue={tarifaUsuario}
                            className="w-14 py-1 pr-1.5 text-xs font-bold text-slate-900 dark:text-white bg-transparent outline-none tabular-nums"
                            title="Precio individual mensual en USD para este usuario (0 = exonerado)"
                          />
                        </div>
                        <button
                          type="submit"
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-900 text-white text-[11px] font-bold cursor-pointer"
                        >
                          Fijar $
                        </button>
                      </form>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`text-[10px] font-semibold ${
                            tieneTarifaPersonalizada
                              ? 'text-blue-700 dark:text-blue-300'
                              : 'text-slate-400'
                          }`}
                        >
                          {tarifaUsuario === 0
                            ? 'Exonerado ($0)'
                            : tieneTarifaPersonalizada
                              ? `Personalizado ($${tarifaUsuario}/mes)`
                              : `Base residencia ($${residency.individualPriceUsd}/mes)`}
                        </span>
                        {tieneTarifaPersonalizada && (
                          <form action={actualizarPrecioUsuario}>
                            <input type="hidden" name="residencyId" value={residency.id} />
                            <input type="hidden" name="userId" value={u.id} />
                            <input type="hidden" name="limpiar" value="true" />
                            <button
                              type="submit"
                              className="text-[10px] text-slate-500 hover:underline cursor-pointer"
                            >
                              Usar base
                            </button>
                          </form>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3 text-xs">
                      <span
                        className={`px-2 py-0.5 rounded font-bold ${
                          est.bloqueada
                            ? 'bg-red-100 text-red-800'
                            : est.enGracia
                              ? 'bg-amber-100 text-amber-800'
                              : est.estadoEfectivo === 'TRIAL'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {est.bloqueada
                          ? 'Suspendida'
                          : est.enGracia
                            ? `Gracia (${est.diasGraciaRestantes}d)`
                            : est.estadoEfectivo === 'TRIAL'
                              ? 'Prueba'
                              : 'Activa'}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300 tabular-nums">
                      {u.subscriptionEndsAt ? (
                        <>
                          <p className="font-semibold">{fmtFecha(u.subscriptionEndsAt)}</p>
                          {est.diasRestantes !== null && est.diasRestantes > 0 && (
                            <p className="text-[11px] text-slate-400">
                              {est.diasRestantes} día(s) restantes
                            </p>
                          )}
                        </>
                      ) : (
                        'Sin fecha límite'
                      )}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex flex-wrap items-center justify-end gap-1.5">
                        <form action={actualizarSuscripcionUsuario}>
                          <input type="hidden" name="residencyId" value={residency.id} />
                          <input type="hidden" name="userId" value={u.id} />
                          <input type="hidden" name="accion" value="extender_30" />
                          <button
                            type="submit"
                            className="px-2 py-1 rounded border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold cursor-pointer"
                          >
                            +30d
                          </button>
                        </form>

                        <form action={actualizarSuscripcionUsuario}>
                          <input type="hidden" name="residencyId" value={residency.id} />
                          <input type="hidden" name="userId" value={u.id} />
                          <input type="hidden" name="accion" value="extender_7" />
                          <button
                            type="submit"
                            className="px-2 py-1 rounded border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-semibold cursor-pointer"
                          >
                            +7d
                          </button>
                        </form>

                        <form action={actualizarSuscripcionUsuario}>
                          <input type="hidden" name="residencyId" value={residency.id} />
                          <input type="hidden" name="userId" value={u.id} />
                          <input type="hidden" name="accion" value="iniciar_cobro" />
                          <button
                            type="submit"
                            title="Solo para usuarios 'Sin fecha límite': inicia hoy el aviso automático de 5 días de gracia"
                            className="px-2 py-1 rounded border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold cursor-pointer"
                          >
                            Iniciar cobro (5d)
                          </button>
                        </form>

                        <form action={actualizarSuscripcionUsuario}>
                          <input type="hidden" name="residencyId" value={residency.id} />
                          <input type="hidden" name="userId" value={u.id} />
                          <input type="hidden" name="accion" value="suspender" />
                          <button
                            type="submit"
                            className="px-2 py-1 rounded border border-red-200 text-red-700 hover:bg-red-50 text-xs font-semibold cursor-pointer"
                          >
                            Suspender
                          </button>
                        </form>

                        <form action={actualizarSuscripcionUsuario}>
                          <input type="hidden" name="residencyId" value={residency.id} />
                          <input type="hidden" name="userId" value={u.id} />
                          <input type="hidden" name="accion" value="sin_vencimiento" />
                          <button
                            type="submit"
                            className="px-2 py-1 rounded border border-slate-300 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs cursor-pointer"
                          >
                            Sin límite
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {usuarios.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-xs text-slate-500">
                    No se encontraron usuarios en esta residencia.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* HISTORIAL DE PAGOS AISLADO DE ESTA RESIDENCIA */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-x-auto">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Historial de Pagos de {residency.name} ({pagos.length})
            </h2>
          </div>

          <table className="w-full text-sm text-left">
            <thead className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs">
              <tr>
                <th className="px-4 py-3">Fecha y Hora</th>
                <th className="px-4 py-3">Alcance / Pagador</th>
                <th className="px-4 py-3">Período</th>
                <th className="px-4 py-3">Monto</th>
                <th className="px-4 py-3">Método</th>
                <th className="px-4 py-3">Referencia</th>
                <th className="px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {pagos.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300 tabular-nums">
                    {fmtFechaHora(p.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {p.billingScope === 'INDIVIDUAL' ? (
                      <div>
                        <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-bold text-[10px]">
                          Individual
                        </span>
                        <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                          {p.user?.fullName ?? p.requestedBy}
                        </p>
                      </div>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px]">
                        Grupal (Residencia)
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs tabular-nums">{p.periodMonths} mes(es)</td>
                  <td className="px-4 py-3 text-xs font-bold tabular-nums">
                    ${p.amountUsd.toFixed(2)} USD
                  </td>
                  <td className="px-4 py-3 text-xs capitalize">{p.method}</td>
                  <td className="px-4 py-3 text-xs font-mono">{p.reference ?? '—'}</td>
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
                  </td>
                </tr>
              ))}
              {pagos.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-xs text-slate-500">
                    Aún no hay pagos registrados para esta residencia.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
