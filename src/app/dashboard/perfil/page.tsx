import {
  obtenerContextoResidencia,
  obtenerTarifaIndividualUsuario,
} from '@/lib/tenant'
import { obtenerUltimaAceptacionLegal } from '@/lib/legal'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FormularioCambiarPassword } from '@/components/FormularioCambiarPassword'
import { LegalFooter } from '@/components/LegalFooter'

const fmtFecha = (d: Date) =>
  d.toLocaleDateString('es-DO', {
    timeZone: 'America/Santo_Domingo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })

const fmtFechaHora = (iso: string) =>
  new Date(iso).toLocaleString('es-DO', {
    timeZone: 'America/Santo_Domingo',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

export default async function PerfilPage({
  searchParams,
}: {
  searchParams: Promise<{ force?: string }>
}) {
  const ctx = await obtenerContextoResidencia()
  if (!ctx?.user) redirect('/login')

  const [{ force }, aceptacionLegal] = await Promise.all([
    searchParams,
    obtenerUltimaAceptacionLegal(ctx.user.id),
  ])
  const cambioObligatorio = ctx.user.mustChangePassword
  const recienActualizada = force === 'true' && !ctx.user.mustChangePassword

  const esIndividual = ctx.residency?.billingMode === 'INDIVIDUAL'
  const tarifaPersonal = ctx.residency
    ? obtenerTarifaIndividualUsuario(ctx.residency, ctx.user)
    : null

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-8">
      <div className="max-w-md mx-auto space-y-5">
        <div>
          {!cambioObligatorio && (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline mb-2"
            >
              ← Volver a la Página Principal
            </Link>
          )}
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Mi Perfil</h1>
          <p className="text-sm text-slate-500">Configuración de cuenta y suscripción</p>
        </div>

        {recienActualizada && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-300 dark:border-emerald-700 rounded-xl flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                Contraseña actualizada
              </p>
              <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-0.5">
                Ya puedes ingresar a la página principal de tu servicio.
              </p>
            </div>
            <Link
              href="/dashboard"
              className="shrink-0 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
            >
              Ir al Inicio →
            </Link>
          </div>
        )}

        {cambioObligatorio && (
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-xl">
            <p className="text-sm font-bold text-amber-900 dark:text-amber-200">
              Cambio de contraseña obligatorio
            </p>
            <p className="text-xs text-amber-800 dark:text-amber-300 mt-1">
              Tu cuenta utiliza una contraseña temporal o recién asignada. Debes establecer una nueva contraseña personal y confirmar las condiciones legales antes de acceder a los expedientes clínicos.
            </p>
          </div>
        )}

        {!cambioObligatorio && ctx.residency && ctx.suscripcion && !ctx.esSuperAdmin && (
          <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Estado de Suscripción
              </p>
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  ctx.suscripcion.bloqueada
                    ? 'bg-red-100 text-red-800'
                    : ctx.suscripcion.enGracia
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {ctx.suscripcion.bloqueada
                  ? 'Suspendida'
                  : ctx.suscripcion.enGracia
                    ? `Gracia (${ctx.suscripcion.diasGraciaRestantes}d)`
                    : 'Activa'}
              </span>
            </div>

            {esIndividual ? (
              <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                <p>
                  Modalidad: <strong>Suscripción Individual por Usuario</strong>
                </p>
                <p className="tabular-nums">
                  Tu tarifa:{' '}
                  <strong>
                    {tarifaPersonal === 0 ? 'Exonerado ($0)' : `$${tarifaPersonal} USD / mes`}
                  </strong>
                </p>
                <p className="tabular-nums">
                  Vigencia:{' '}
                  <strong>
                    {ctx.user.subscriptionEndsAt
                      ? fmtFecha(ctx.user.subscriptionEndsAt)
                      : 'Sin fecha límite'}
                  </strong>
                </p>
                <div className="pt-2">
                  <Link
                    href="/dashboard/suscripcion"
                    className="inline-block w-full text-center px-3.5 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-colors"
                  >
                    💳 Ir a Mi Suscripción y Pagos →
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                <p>
                  Modalidad: <strong>Cobro Grupal ({ctx.residency.name})</strong>
                </p>
                <p className="text-slate-500 dark:text-slate-400">
                  La suscripción es administrada grupalmente por la jefatura/administración de tu residencia.
                </p>
              </div>
            )}
          </div>
        )}

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
            <p className="text-sm font-medium text-slate-500">Usuario</p>
            <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{ctx.user.fullName}</p>
            <p className="text-sm text-slate-500">{ctx.user.email}</p>
            {aceptacionLegal.aceptada && aceptacionLegal.fechaIso && (
              <p className="text-[11px] text-emerald-700 dark:text-emerald-300 mt-1.5 tabular-nums">
                Términos y Privacidad (v{aceptacionLegal.version ?? '2026-11'}) aceptados el{' '}
                {fmtFechaHora(aceptacionLegal.fechaIso)}
              </p>
            )}
          </div>

          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Cambiar Contraseña</h2>

          <FormularioCambiarPassword requiereAceptacionLegal={!aceptacionLegal.aceptada} />

          {/* AVISO DE CONTRASEÑA OLVIDADA */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-xs text-blue-800 dark:text-blue-300 text-center">
              ¿Olvidaste tu contraseña? Contacta al administrador del sistema para que te asigne una temporal.
            </p>
          </div>
        </div>

        <LegalFooter compact />
      </div>
    </div>
  )
}