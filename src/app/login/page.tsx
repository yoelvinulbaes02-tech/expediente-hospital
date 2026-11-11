import { auth, signIn } from '@/auth'
import { redirect } from 'next/navigation'
import { AuthError } from 'next-auth'
import { ThemeToggle } from '@/components/ThemeToggle'

// COMPONENTE DE LA X PARA EL LOGIN
function NexoXLogin({ className = "h-7 md:h-8 w-auto inline-block -mt-1 mx-0.5 align-middle" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 38 34"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="nexoCyanGradLogin" x1="0" y1="34" x2="38" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#007991" />
          <stop offset="50%" stopColor="#00A2B3" />
          <stop offset="100%" stopColor="#00C7D9" />
        </linearGradient>
      </defs>
      <path d="M2 3 L12 3 L20 13 L14 19 L2 3 Z" fill="#0D2344" className="dark:fill-slate-200" />
      <path d="M23 18 L28 12 L37 25 C 37 29 33 32 27 32 L20 32 L23 18 Z" fill="#0D2344" className="dark:fill-slate-200" />
      <path d="M2 31 C 6 33 11 33 16 32 L36 6 C 36 3 32 2 28 2 L14 18 L2 31 Z" fill="url(#nexoCyanGradLogin)" />
      <path d="M16 20 L22 14 L26 19 L19 25 Z" fill="#006C7E" opacity="0.6" />
    </svg>
  )
}

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
        {/* IDENTIDAD EN EL ORDEN EXACTO */}
        <div className="text-center space-y-1">
          <img
            src="/Logo.png"
            alt="NEXO Isotipo"
            className="h-16 md:h-20 w-auto object-contain mx-auto mb-2"
          />
          <div>
            {/* 1. NEXO CON LA X EXACTA */}
            <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-none text-[#0D2344] dark:text-white flex items-center justify-center">
              NE<NexoXLogin />O
            </h1>

            {/* 2. MEDICAL TEAM WORKFLOW */}
            <p className="text-xs md:text-sm font-bold text-[#0D2344] dark:text-slate-300 tracking-wider uppercase mt-1">
              MEDICAL TEAM WORKFLOW
            </p>

            {/* 3. LÍNEA CON EL DISEÑO DE PULSO CARDÍACO (ECG) EN COLOR CIAN */}
            <div className="w-40 mx-auto my-1.5">
              <svg viewBox="0 0 100 10" className="w-full h-2.5 text-[#00A8B5]" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M0 5 H40 L44 1 L47 9 L50 2 L53 7 L56 5 H100" />
              </svg>
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 pt-1">
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