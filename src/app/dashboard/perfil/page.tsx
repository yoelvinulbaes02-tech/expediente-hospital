import { obtenerContextoResidencia } from '@/lib/tenant'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FormularioCambiarPassword } from '@/components/FormularioCambiarPassword'

export default async function PerfilPage({
  searchParams,
}: {
  searchParams: Promise<{ force?: string }>
}) {
  const ctx = await obtenerContextoResidencia()
  if (!ctx?.user) redirect('/login')

  const { force } = await searchParams
  const cambioObligatorio = force === 'true' || ctx.user.mustChangePassword

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-8">
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          {!cambioObligatorio && (
            <Link href="/dashboard" className="text-sm text-blue-600 hover:underline mb-2 inline-block">
              ← Volver al Dashboard
            </Link>
          )}
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Mi Perfil</h1>
          <p className="text-sm text-slate-500">Configuración de seguridad de tu cuenta</p>
        </div>

        {cambioObligatorio && (
          <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-700 rounded-xl">
            <p className="text-sm font-bold text-amber-900 dark:text-amber-200">
              Cambio de contraseña obligatorio
            </p>
            <p className="text-xs text-amber-800 dark:text-amber-300 mt-1">
              Tu cuenta utiliza una contraseña temporal o recién asignada. Debes establecer una nueva contraseña personal antes de acceder a los expedientes clínicos.
            </p>
          </div>
        )}

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
            <p className="text-sm font-medium text-slate-500">Usuario</p>
            <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{ctx.user.fullName}</p>
            <p className="text-sm text-slate-500">{ctx.user.email}</p>
          </div>

          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Cambiar Contraseña</h2>

          <FormularioCambiarPassword />

          {/* AVISO DE CONTRASEÑA OLVIDADA */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-xs text-blue-800 dark:text-blue-300 text-center">
              ¿Olvidaste tu contraseña? Contacta al administrador del sistema para que te asigne una temporal.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}