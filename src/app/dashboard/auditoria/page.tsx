import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { TablaAuditoria, type FilaAuditoria } from '@/components/TablaAuditoria'
import { describirRegistro } from '@/lib/auditoria-texto'

export default async function AuditoriaPage() {
  const session = await auth()

  // Solo el ADMIN puede ver la auditoría
  if (!session || String(session.user?.role) !== 'ADMIN') {
    redirect('/dashboard')
  }

  const registros = await prisma.auditLog.findMany({
    orderBy: { serverTs: 'desc' },
    take: 300,
    include: { actor: { select: { fullName: true, email: true } } },
  })

  // Nombres de pacientes (por expediente o, si no hay, por paciente)
  const episodeIds = Array.from(new Set(registros.map((r) => r.episodeId).filter((x): x is string => !!x)))
  const patientIds = Array.from(
    new Set(registros.filter((r) => !r.episodeId && r.patientId).map((r) => r.patientId as string))
  )

  const [episodios, pacientes] = await Promise.all([
    prisma.episode.findMany({
      where: { id: { in: episodeIds } },
      select: { id: true, patient: { select: { firstName: true, lastName: true, expedienteNumber: true } } },
    }),
    prisma.patient.findMany({
      where: { id: { in: patientIds } },
      select: { id: true, firstName: true, lastName: true, expedienteNumber: true },
    }),
  ])

  const porEpisodio = new Map(
    episodios.map((e) => [e.id, `${e.patient.firstName} ${e.patient.lastName} (${e.patient.expedienteNumber})`])
  )
  const porPaciente = new Map(
    pacientes.map((p) => [p.id, `${p.firstName} ${p.lastName} (${p.expedienteNumber})`])
  )

  const filas: FilaAuditoria[] = registros.map((r) => {
    const { que, detalle } = describirRegistro(r)
    const paciente =
      (r.episodeId ? porEpisodio.get(r.episodeId) : undefined) ??
      (r.patientId ? porPaciente.get(r.patientId) : undefined) ??
      '—'
    return {
      id: r.id.toString(),
      fecha: r.serverTs.toLocaleString('es-DO', { timeZone: 'America/Santo_Domingo' }),
      usuario: r.actor.fullName,
      correo: r.actor.email,
      rol: r.actorRole,
      que,
      paciente,
      detalle,
    }
  })

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link href="/dashboard" className="text-sm text-blue-600 hover:underline mb-2 inline-block">← Volver al Dashboard</Link>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Registro de Auditoría</h1>
          <p className="text-sm text-slate-500">Historial inmutable de acciones (últimos 300 movimientos)</p>
        </div>

        <TablaAuditoria filas={filas} />
      </div>
    </div>
  )
}