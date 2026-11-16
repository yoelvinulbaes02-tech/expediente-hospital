import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { TablaAuditoria } from '@/components/TablaAuditoria'

export default async function AuditoriaPage({
  searchParams,
}: {
  searchParams: Promise<{ desde?: string; hasta?: string; q?: string }>
}) {
  const session = await auth()
  if (!session?.user) redirect('/login')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userRole = (session.user as any)?.role
  if (userRole !== 'ADMIN') redirect('/dashboard')

  const { desde, hasta, q } = await searchParams

  // CONSTRUCCIÓN DEL FILTRO DE BÚSQUEDA HISTÓRICA
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {}

  if (desde || hasta) {
    where.serverTs = {}
    if (desde) {
      where.serverTs.gte = new Date(`${desde}T00:00:00-04:00`)
    }
    if (hasta) {
      where.serverTs.lte = new Date(`${hasta}T23:59:59-04:00`)
    }
  }

  if (q) {
    where.OR = [
      { action: { contains: q, mode: 'insensitive' } },
      { entity: { contains: q, mode: 'insensitive' } },
      { reason: { contains: q, mode: 'insensitive' } },
      { actorRole: { contains: q, mode: 'insensitive' } },
      { actor: { fullName: { contains: q, mode: 'insensitive' } } },
      { actor: { email: { contains: q, mode: 'insensitive' } } },
    ]
  }

  // SI SE USA UN FILTRO DE FECHAS SE AMPLIAN LOS REGISTROS PARA TRAER TODO EL RANGO HISTÓRICO
  const limite = desde || hasta || q ? 1000 : 300

  const rawLogs = await prisma.auditLog.findMany({
    where,
    take: limite,
    orderBy: { seq: 'desc' },
    include: {
      actor: {
        select: { fullName: true, email: true },
      },
    },
  })

  // SERIALIZACIÓN SEGURA DE BIGINT A STRING PARA CLIENTE
  const logs = rawLogs.map((log) => ({
    id: String(log.id),
    seq: Number(log.seq),
    action: log.action,
    entity: log.entity,
    entityId: log.entityId,
    patientId: log.patientId,
    episodeId: log.episodeId,
    actorId: log.actorId,
    actorRole: log.actorRole,
    actorName: log.actor?.fullName || log.actor?.email || 'Sistema',
    reason: log.reason,
    entryHash: log.entryHash,
    serverTs: log.serverTs.toISOString(),
  }))

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 dark:border-slate-700 pb-4">
          <div>
            <Link href="/dashboard" className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline mb-1 inline-block">
              ← Volver al Dashboard
            </Link>
            <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Registro de Auditoría
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {desde || hasta
                ? `Mostrando registros por rango de fecha (${logs.length} movimientos encontrados)`
                : `Historial inmutable de acciones clínicas (últimos ${logs.length} movimientos)`}
            </p>
          </div>
        </div>

        <TablaAuditoria
          logs={logs}
          fechaDesde={desde || ''}
          fechaHasta={hasta || ''}
          queryInicial={q || ''}
        />
      </div>
    </div>
  )
}