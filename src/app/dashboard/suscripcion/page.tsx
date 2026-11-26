import { prisma } from '@/lib/prisma'
import {
  calcularTarifaGrupalResidencia,
  contarUsuariosActivosResidencia,
  obtenerContextoResidencia,
  obtenerTarifaIndividualUsuario,
} from '@/lib/tenant'
import {
  estaPayPalConfigurado,
  estaPayPalWebhookConfigurado,
  extraerSuscripcionActivaDeNota,
  obtenerPayPalClientId,
} from '@/lib/paypal'
import { PagoHibridoSuscripcion } from '@/components/PagoHibridoSuscripcion'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LegalFooter } from '@/components/LegalFooter'

const ETIQUETA_PLAN: Record<string, { texto: string; clase: string }> = {
  ACTIVE: { texto: 'Activa', clase: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  TRIAL: { texto: 'Período de prueba', clase: 'bg-blue-100 text-blue-800 border-blue-200' },
  PAST_DUE: { texto: 'En período de gracia', clase: 'bg-amber-100 text-amber-800 border-amber-200' },
  SUSPENDED: { texto: 'Suspendida (Solo lectura)', clase: 'bg-red-100 text-red-800 border-red-200' },
}

const fmtFecha = (d: Date | string | null | undefined) => {
  if (!d) return '—'
  const fecha = d instanceof Date ? d : new Date(d)
  if (Number.isNaN(fecha.getTime())) return '—'
  return fecha.toLocaleDateString('es-DO', {
    timeZone: 'America/Santo_Domingo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export default async function SuscripcionPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const ctx = await obtenerContextoResidencia()
  if (!ctx?.user) redirect('/login')
  if (ctx.user.mustChangePassword) redirect('/dashboard/perfil?force=true')
  if (!ctx.residency || !ctx.suscripcion) {
    redirect('/dashboard/plataforma')
  }

  const esIndividual = ctx.residency.billingMode === 'INDIVIDUAL'
  const esAdmin = ctx.user.role === 'ADMIN' || ctx.user.role === 'SUPERADMIN'
  const puedePagar = esIndividual || esAdmin

  const { error } = await searchParams

  const [usuariosActivos, pagos] = await Promise.all([
    contarUsuariosActivosResidencia(ctx.residency.id),
    puedePagar
      ? prisma.subscriptionPayment.findMany({
          where: esIndividual
            ? { residencyId: ctx.residency.id, userId: ctx.user.id }
            : { residencyId: ctx.residency.id, billingScope: 'RESIDENCY' },
          orderBy: { createdAt: 'desc' },
          take: 30,
        })
      : Promise.resolve([]),
  ])

  const metaPlan = ETIQUETA_PLAN[ctx.suscripcion.estadoEfectivo] ?? ETIQUETA_PLAN.ACTIVE
  const interfaceModeStr = String(ctx.residency.interfaceMode)
  const paypalClientId = obtenerPayPalClientId()
  const paypalConfigurado = estaPayPalConfigurado()
  const paypalWebhookConfigurado = estaPayPalWebhookConfigurado()
  const paypalEnv = (process.env.PAYPAL_ENV ?? 'sandbox').trim().toLowerCase() === 'live' ? 'live' : 'sandbox'

  const tarifaGrupal = !esIndividual
    ? calcularTarifaGrupalResidencia(ctx.residency, usuariosActivos)
    : null
  const precioAplicable = esIndividual
    ? obtenerTarifaIndividualUsuario(ctx.residency, ctx.user)
    : tarifaGrupal!.totalUsd
  const fechaVencimientoAplicable = esIndividual
    ? ctx.user.subscriptionEndsAt
    : ctx.residency.subscriptionEndsAt
  const suscripcionAutomaticaId = extraerSuscripcionActivaDeNota(
    esIndividual ? ctx.user.lastPaymentNote : ctx.residency.lastPaymentNote
  )

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link href="/dashboard" className="text-sm text-blue-600 hover:underline mb-2 inline-block">
              ← Volver al Dashboard
            </Link>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {esIndividual ? 'Mi Suscripción Individual' : 'Suscripción Mensual de la Residencia'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {esIndividual
                ? 'Plan individual por usuario · Tu suscripción es personal e independiente de los demás médicos de la residencia.'
                : 'Modelo B2B por residencia o servicio · Un solo pago mensual para todo tu equipo clínico.'}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-lg border text-xs font-bold ${metaPlan.clase}`}>
            {metaPlan.texto}
          </span>
        </div>

        {error && (
          <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm font-medium">
            ⚠️ {error}
          </div>
        )}

        {/* RESUMEN DEL PLAN ACTUAL */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Residencia / Servicio</p>
            <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
              {ctx.residency.name}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Interfaz:{' '}
              {interfaceModeStr === 'CONSULTAS'
                ? 'Consultas Externas'
                : interfaceModeStr === 'MEDICINA_INTERNA'
                  ? 'Medicina Interna'
                  : interfaceModeStr === 'CIRUGIA'
                    ? 'Cirugía'
                    : interfaceModeStr === 'ORTOPEDIA'
                      ? 'Ortopedia y Traumatología'
                      : interfaceModeStr === 'EMERGENCIA'
                        ? 'Emergencia'
                        : interfaceModeStr === 'HEMATOLOGIA'
                          ? 'Hematología'
                          : interfaceModeStr === 'HEMODIALISIS'
                            ? 'Unidad de Hemodiálisis'
                            : 'Hospitalización / Nefrología'}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {esIndividual ? 'Tu Tarifa Individual' : 'Tarifa Mensual B2B'}
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5 tabular-nums">
              {esIndividual && precioAplicable === 0 ? (
                'Exonerado'
              ) : (
                <>
                  ${precioAplicable.toFixed(2)}{' '}
                  <span className="text-xs font-normal text-slate-500">USD / mes</span>
                </>
              )}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {esIndividual
                ? ctx.user.individualPriceUsd !== null
                  ? 'Tarifa asignada a tu cuenta'
                  : 'Tarifa base de la residencia'
                : tarifaGrupal?.esDinamico
                  ? tarifaGrupal.detalle
                  : ctx.residency.planName}
            </p>
          </div>

          {esIndividual ? (
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Titular de la Cuenta</p>
              <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5 truncate">
                {ctx.user.fullName}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {ctx.user.email} · {ctx.user.role}
              </p>
            </div>
          ) : (
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Cupo de Equipo Activo</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5 tabular-nums">
                {usuariosActivos} / {ctx.residency.maxActiveUsers}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Médicos, residentes y personal</p>
            </div>
          )}

          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {esIndividual ? 'Tu Vigencia Individual' : 'Vigencia del Plan'}
            </p>
            <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5 tabular-nums">
              {fechaVencimientoAplicable ? fmtFecha(fechaVencimientoAplicable) : 'Sin vencimiento'}
            </p>
            {ctx.suscripcion.diasRestantes !== null && (
              <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                {ctx.suscripcion.diasRestantes > 0
                  ? `${ctx.suscripcion.diasRestantes} día(s) restantes`
                  : 'Período expirado'}
              </p>
            )}
          </div>
        </div>

        {/* PAGO EN LÍNEA O AVISO DE MODALIDAD */}
        {!puedePagar ? (
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 text-sm text-slate-700 dark:text-slate-300">
            <p className="font-bold text-slate-900 dark:text-white mb-1">
              🏢 Suscripción Grupal Administrada por tu Residencia
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Tu residencia utiliza actualmente el plan grupal. La renovación mensual es gestionada por el administrador de {ctx.residency.name}, por lo que no necesitas realizar pagos individuales.
            </p>
          </div>
        ) : precioAplicable <= 0 ? (
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-6 text-sm text-emerald-900 dark:text-emerald-200">
            <p className="font-bold mb-1">✅ Cuenta Exonerada ($0 USD / mes)</p>
            <p className="text-xs">
              Tu cuenta no tiene cargo mensual asignado. No necesitas realizar pagos en línea.
            </p>
          </div>
        ) : (
          <PagoHibridoSuscripcion
            monthlyPriceUsd={precioAplicable}
            residencyName={ctx.residency.name}
            billingMode={esIndividual ? 'INDIVIDUAL' : 'RESIDENCY'}
            titularPago={ctx.user.fullName}
            paypalClientId={paypalClientId}
            paypalConfigurado={paypalConfigurado}
            paypalEnv={paypalEnv}
            suscripcionAutomaticaId={suscripcionAutomaticaId}
            paypalWebhookConfigurado={paypalWebhookConfigurado}
            detalleTarifaGrupal={tarifaGrupal?.esDinamico ? tarifaGrupal.detalle : undefined}
          />
        )}

        {/* HISTORIAL DE PAGOS */}
        {puedePagar && (
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-x-auto">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {esIndividual
                  ? 'Mi Historial de Pagos Individuales'
                  : 'Historial de Pagos de la Residencia'}
              </h2>
            </div>
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs">
                <tr>
                  <th className="px-4 py-3">Fecha</th>
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
                      {fmtFecha(p.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-xs font-medium text-slate-800 dark:text-slate-200 tabular-nums">
                      {p.periodMonths} mes(es)
                    </td>
                    <td className="px-4 py-3 text-xs font-bold text-slate-900 dark:text-white tabular-nums">
                      ${Number(p.amountUsd ?? 0).toFixed(2)} USD
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300 capitalize">
                      {p.method}
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-slate-700 dark:text-slate-300">
                      {p.reference ?? '—'}
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
                    </td>
                  </tr>
                ))}
                {pagos.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-xs text-slate-500">
                      {esIndividual
                        ? 'Aún no tienes pagos individuales registrados.'
                        : 'Aún no hay pagos reportados para esta residencia.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <LegalFooter compact />
      </div>
    </div>
  )
}
