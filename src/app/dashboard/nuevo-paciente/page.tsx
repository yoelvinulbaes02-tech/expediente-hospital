import { obtenerContextoResidencia } from '@/lib/tenant'
import { redirect } from 'next/navigation'
import { NuevoPacienteForm } from '@/components/NuevoPacienteForm'

export default async function NuevoPacientePage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string }>
}) {
  const ctx = await obtenerContextoResidencia()
  if (!ctx?.user) redirect('/login')
  if (ctx.user.mustChangePassword) redirect('/dashboard/perfil?force=true')
  if (!ctx.residency) redirect('/dashboard')

  const { tipo } = await searchParams
  const tipoInicial = tipo === 'interconsulta' ? 'interconsulta' : 'propio'

  return (
    <NuevoPacienteForm
      interfaceMode={String(ctx.interfaceMode ?? 'HOSPITALIZACION')}
      residencyName={ctx.residency.name}
      tipoInicial={tipoInicial}
    />
  )
}