import { auth, signIn } from '@/auth'
import { redirect } from 'next/navigation'
import { AuthError } from 'next-auth'
import { ThemeToggle } from '@/components/ThemeToggle'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const session = await auth()
  if (session) redirect('/dashboard')

  const { error } = await searchParams

  async function loginAction(formData: FormData) {
    'use server'
    try {
      await signIn('credentials', {
        email: formData.get('email'),
        password: formData.get('password'),
        redirectTo: '/dashboard',
      })
    } catch (err) {
      if (err instanceof AuthError) {
        redirect('/login?error=Credenciales incorrectas')
      }
      throw err
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col justify-center items-center p-4 transition-colors duration-300 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 space-y-6">
        {/* LOGO EN TAMAÑO PROPORCIONAL Y DESTACADO */}
        <div className="text-center space-y-2">
          <img
            src="/Logo.png"
            alt="NEXO"
            className="h-16 md:h-22 w-auto object-contain mx-auto"
          />
          <div>
            <p className="text-xs md:text-sm font-bold text-cyan-600 dark:text-cyan-400 tracking-widest uppercase">
              Medical Team Workflow
            </p>
            <div className="w-36 mx-auto my-1.5">
              <svg viewBox="0 0 100 10" className="w-full h-2 text-cyan-500" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M0 5 H40 L44 1 L47 9 L50 2 L53 7 L56 5 H100" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Sistema de Guardia Hospitalaria y Seguimiento de Pacientes
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 px-4 py-2.5 rounded-lg text-xs font-semibold text-center">
            ⚠️ {error}
          </div>
        )}

        <form action={loginAction} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Correo Electrónico
            </label>
            <input
              name="email"
              type="email"
              required
              placeholder="tu-correo@hospital.com"
              className="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Contraseña
            </label>
            <input
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-sm transition-colors shadow-sm cursor-pointer"
          >
            Iniciar Sesión
          </button>
        </form>

        <p className="text-center text-[11px] text-slate-400 dark:text-slate-500">
          Acceso exclusivo para personal médico y de enfermería autorizado.
        </p>
      </div>
    </div>
  )
}