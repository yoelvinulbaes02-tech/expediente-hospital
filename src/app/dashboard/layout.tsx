import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { obtenerContextoResidencia } from '@/lib/tenant'
import { SessionTimeout } from '@/components/SessionTimeout'

const PREFIJOS_COOKIE_SESION = [
  'authjs.session-token',
  '__Secure-authjs.session-token',
  '__Host-authjs.session-token',
  'next-auth.session-token',
  '__Secure-next-auth.session-token',
  '__Host-next-auth.session-token',
]

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const ctx = await obtenerContextoResidencia()
  if (!ctx?.user) {
    const cookieStore = await cookies()
    const tieneCookieSesion = cookieStore.getAll().some((c) =>
      PREFIJOS_COOKIE_SESION.some((p) => c.name === p || c.name.startsWith(`${p}.`))
    )
    if (tieneCookieSesion) {
      redirect('/api/auth/limpiar-sesion')
    }
    redirect('/login')
  }

  return (
    <>
      <SessionTimeout />
      {children}
    </>
  )
}
