import Link from 'next/link'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import { LegalFooter } from '@/components/LegalFooter'
import { ThemeToggle } from '@/components/ThemeToggle'

export function LegalPageShell({
  titulo,
  subtitulo,
  fechaVigencia,
  rutaActual,
  children,
}: {
  titulo: string
  subtitulo: string
  fechaVigencia: string
  rutaActual: '/terminos' | '/privacidad' | '/cookies' | '/reembolso'
  children: React.ReactNode
}) {
  const enlaces = [
    { href: '/terminos', label: 'Términos y Condiciones' },
    { href: '/privacidad', label: 'Política de Privacidad' },
    { href: '/cookies', label: 'Política de Cookies' },
    { href: '/reembolso', label: 'Política de Reembolso' },
  ] as const

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 transition-colors">
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 md:px-8 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver al acceso</span>
          </Link>

          <span className="text-sm font-black tracking-tight text-[#0D2344] dark:text-white whitespace-nowrap">
            NE<span className="text-[#00A8B5] dark:text-[#00C4D6]">X</span>O · Marco Legal
          </span>

          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 md:px-8 py-8 space-y-6">
        <nav
          aria-label="Documentos legales"
          className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-slate-200 dark:border-slate-700 pb-3 text-xs font-medium"
        >
          {enlaces.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap transition-colors ${
                rutaActual === item.href
                  ? 'text-blue-700 dark:text-blue-300 font-bold underline underline-offset-4'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <article className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 md:p-10 space-y-6 shadow-sm">
          <div className="space-y-2 border-b border-slate-200 dark:border-slate-700 pb-5">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 dark:text-teal-300">
              <ShieldCheck className="w-4 h-4" />
              <span>Documento normativo · Versión {fechaVigencia}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {titulo}
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">{subtitulo}</p>
          </div>

          <div className="space-y-5 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            {children}
          </div>
        </article>

        <LegalFooter />
      </main>
    </div>
  )
}
