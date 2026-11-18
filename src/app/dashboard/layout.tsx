import { redirect } from 'next/navigation'
import { obtenerContextoResidencia } from '@/lib/tenant'
import { SessionTimeout } from '@/components/SessionTimeout'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const ctx = await obtenerContextoResidencia()
  if (!ctx?.user) {
    redirect('/login')
  }

  return (
    <>
      <SessionTimeout />
      {children}
    </>
  )
}
