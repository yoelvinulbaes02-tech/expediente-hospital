import { prisma } from '@/lib/prisma'
import {
  evaluarPlanEstado,
  obtenerContextoResidencia,
  obtenerTarifaIndividualUsuario,
} from '@/lib/tenant'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { toggleUsuario } from './actions'
import { SearchInput } from '@/components/SearchInput'
import { BotonResetClave } from '@/components/BotonResetClave'
import { BotonEditarUsuario } from '@/components/BotonEditarUsuario'
import { BotonEliminarUsuario } from '@/components/BotonEliminarUsuario'
import { FormularioCrearUsuario } from '@/components/FormularioCrearUsuario'

const fmtFecha = (d: Date) =>
  d.toLocaleDateString('es-DO', {
    timeZone: 'America/Santo_Domingo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

export default async function UsuariosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const ctx = await obtenerContextoResidencia()
  if (!ctx?.user) redirect('/login')
  if (ctx.user.mustChangePassword) redirect('/dashboard/perfil?force=true')
  if (ctx.user.role !== 'ADMIN' && ctx.user.role !== 'SUPERADMIN') {
    redirect('/dashboard')
  }
  if (!ctx.residency) {
    redirect('/dashboard/plataforma')
  }

  const { q } = await searchParams
  const busqueda = q || ''
  const esPagoIndividual = ctx.residency.billingMode === 'INDIVIDUAL'

  const [usuarios, activosCount] = await Promise.all([
    prisma.user.findMany({
      where: {
        residencyId: ctx.residency.id,
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
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({
      where: { residencyId: ctx.residency.id, isActive: true },
    }),
  ])

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
          <div>
            <Link href="/dashboard" className="text-sm text-blue-600 hover:underline mb-2 inline-block">
              ← Volver al Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              Administración de Usuarios
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {ctx.residency.name} ·{' '}
              <span className="font-semibold tabular-nums">
                {activosCount} / {ctx.residency.maxActiveUsers} usuarios activos en tu plan
              </span>
              {esPagoIndividual && (
                <span className="ml-2 px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-semibold">
                  Cobro Individual (Base ${ctx.residency.individualPriceUsd} USD/usuario)
                </span>
              )}
            </p>
          </div>

          <Link
            href="/dashboard/suscripcion"
            className="px-3.5 py-2 rounded-lg text-xs font-semibold border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50"
          >
            {esPagoIndividual ? '💳 Mi Suscripción' : '💳 Plan y Suscripción'}
          </Link>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 mb-6">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Crear Nuevo Usuario</h2>
          <FormularioCrearUsuario />
        </div>

        <div className="mb-4">
          <SearchInput defaultValue={busqueda} placeholder="🔍 Buscar doctor por nombre o correo..." />
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Correo</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">Estado</th>
                {esPagoIndividual && <th className="px-4 py-3">Suscripción Individual</th>}
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => {
                const subInd = esPagoIndividual
                  ? evaluarPlanEstado({
                      isActive: u.isActive,
                      planStatus: u.planStatus,
                      subscriptionEndsAt: u.subscriptionEndsAt,
                      modoCobro: 'INDIVIDUAL',
                    })
                  : null
                const tarifaUsuario = ctx.residency
                  ? obtenerTarifaIndividualUsuario(ctx.residency, u)
                  : 0

                return (
                  <tr key={u.id} className="border-b dark:border-slate-700">
                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-100">{u.fullName}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{u.email}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{u.role}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${u.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {u.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    {esPagoIndividual && subInd && (
                      <td className="px-4 py-3 text-xs">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-2 py-0.5 rounded font-bold ${
                              subInd.bloqueada
                                ? 'bg-red-100 text-red-800'
                                : subInd.enGracia
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {subInd.bloqueada
                              ? 'Suspendida'
                              : subInd.enGracia
                                ? `Gracia (${subInd.diasGraciaRestantes}d)`
                                : subInd.estadoEfectivo === 'TRIAL'
                                  ? 'Prueba'
                                  : 'Activa'}
                          </span>
                          <span className="font-bold text-slate-700 dark:text-slate-200 tabular-nums">
                            {tarifaUsuario === 0 ? 'Exonerado' : `$${tarifaUsuario}/mes`}
                          </span>
                        </div>
                        <span className="block text-[11px] text-slate-500 mt-0.5 tabular-nums">
                          {u.subscriptionEndsAt
                            ? `Vence: ${fmtFecha(u.subscriptionEndsAt)}`
                            : 'Sin fecha límite'}
                        </span>
                      </td>
                    )}
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <BotonEditarUsuario
                          userId={u.id}
                          nombreActual={u.fullName}
                          rolActual={u.role}
                          email={u.email}
                        />

                        {u.id !== ctx.user.id && (
                          <>
                            <form action={toggleUsuario}>
                              <input type="hidden" name="userId" value={u.id} />
                              <input type="hidden" name="isActive" value={String(!u.isActive)} />
                              <button
                                type="submit"
                                className={`text-xs font-medium px-2 py-1 rounded border transition-colors ${u.isActive ? 'text-red-600 border-red-200 hover:bg-red-50' : 'text-green-600 border-green-200 hover:bg-green-50'}`}
                              >
                                {u.isActive ? 'Desactivar' : 'Activar'}
                              </button>
                            </form>

                            <BotonResetClave userId={u.id} nombre={u.fullName} />
                            <BotonEliminarUsuario userId={u.id} nombre={u.fullName} email={u.email} />
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
              {usuarios.length === 0 && (
                <tr>
                  <td colSpan={esPagoIndividual ? 6 : 5} className="text-center py-8 text-slate-500">
                    No se encontraron usuarios con esa búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}