import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { cambiarPassword } from './actions'

export default async function PerfilPage() {
  const session = await auth()
  if (!session) redirect('/login')

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-8">
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <Link href="/dashboard" className="text-sm text-blue-600 hover:underline mb-2 inline-block">← Volver al Dashboard</Link>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Mi Perfil</h1>
          <p className="text-sm text-slate-500">Configuración de seguridad de tu cuenta</p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
            <p className="text-sm font-medium text-slate-500">Usuario</p>
            <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{session.user?.name}</p>
            <p className="text-sm text-slate-500">{session.user?.email}</p>
          </div>

          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Cambiar Contraseña</h2>
          
          <form action={cambiarPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña Actual</label>
              <input name="currentPassword" type="password" required className="w-full px-3 py-2 border rounded-lg text-slate-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nueva Contraseña</label>
              <input name="newPassword" type="password" required minLength={6} className="w-full px-3 py-2 border rounded-lg text-slate-900" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Confirmar Nueva Contraseña</label>
              <input name="confirmPassword" type="password" required minLength={6} className="w-full px-3 py-2 border rounded-lg text-slate-900" />
            </div>
            <button type="submit" className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Guardar Cambios
            </button>
          </form>

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