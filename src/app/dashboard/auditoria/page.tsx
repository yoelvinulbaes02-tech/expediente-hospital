import { obtenerContextoResidencia } from '@/lib/tenant'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { TablaAuditoria } from '@/components/TablaAuditoria'

export default async function AuditoriaPage({
  searchParams,
}: {
  searchParams: Promise<{ desde?: string; hasta?: string; q?: string }>
}) {
  const ctx = await obtenerContextoResidencia()
  if (!ctx?.user) redirect('/login')
  if (ctx.user.mustChangePassword) redirect('/dashboard/perfil?force=true')

  const userRole = String(ctx.user.role)
  if (userRole !== 'ADMIN' && userRole !== 'SUPERADMIN') redirect('/dashboard')

  const { desde, hasta, q } = await searchParams

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {}

  if (userRole !== 'SUPERADMIN' && ctx.residency) {
    where.actor = { residencyId: ctx.residency.id }
  }

  if (desde || hasta) {
    const filtroFecha: { gte?: Date; lte?: Date } = {}
    if (desde) {
      const d = new Date(`${desde}T00:00:00-04:00`)
      if (!Number.isNaN(d.getTime())) filtroFecha.gte = d
    }
    if (hasta) {
      const h = new Date(`${hasta}T23:59:59-04:00`)
      if (!Number.isNaN(h.getTime())) filtroFecha.lte = h
    }
    if (filtroFecha.gte || filtroFecha.lte) {
      where.serverTs = filtroFecha
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
            <Link
              href={userRole === 'SUPERADMIN' ? '/dashboard/plataforma' : '/dashboard'}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline mb-1 inline-block"
            >
              ← Volver al Dashboard
            </Link>
            <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 tracking-tight">
              Registro de Auditoría
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {ctx.residency ? `${ctx.residency.name} · ` : ''}
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