import Link from 'next/link'

export function LegalFooter({ compact = false }: { compact?: boolean }) {
  return (
    <footer
      className={`w-full text-center text-[11px] text-slate-500 dark:text-slate-400 ${
        compact ? 'pt-3' : 'py-5 border-t border-slate-200 dark:border-slate-800 mt-8'
      }`}
    >
      <nav
        aria-label="Enlaces legales"
        className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4"
      >
        <Link href="/terminos" className="hover:text-slate-800 dark:hover:text-slate-200 hover:underline">
          Términos y Condiciones
        </Link>
        <span aria-hidden="true">·</span>
        <Link href="/privacidad" className="hover:text-slate-800 dark:hover:text-slate-200 hover:underline">
          Política de Privacidad
        </Link>
        <span aria-hidden="true">·</span>
        <Link href="/cookies" className="hover:text-slate-800 dark:hover:text-slate-200 hover:underline">
          Política de Cookies
        </Link>
        <span aria-hidden="true">·</span>
        <Link href="/reembolso" className="hover:text-slate-800 dark:hover:text-slate-200 hover:underline">
          Política de Reembolso
        </Link>
      </nav>
      {!compact && (
        <p className="mt-1.5 text-[11px] text-slate-400 dark:text-slate-500">
          NEXO · Medical Team Workflow — Uso exclusivo de personal clínico y administrativo autorizado
        </p>
      )}
    </footer>
  )
}
