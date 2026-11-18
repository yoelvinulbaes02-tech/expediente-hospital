import { createHash } from 'crypto'
import { prisma } from './prisma'
import { Prisma } from '@/generated/prisma' // Importamos los tipos de Prisma

interface AuditParams {
  actorId: string
  actorRole: string
  action: string
  entity: string
  patientId?: string
  episodeId?: string
  entityId?: string
  oldValue?: unknown
  newValue?: unknown
  reason?: string
  ipAddress?: string
  userAgent?: string
}

function sha256(input: string): string {
  return createHash('sha256').update(input).digest('hex')
}

export async function logAudit(params: AuditParams) {
  const last = await prisma.auditLog.findFirst({
    orderBy: { seq: 'desc' },
    select: { seq: true, entryHash: true },
  })

  const nextSeq = last ? Number(last.seq) + 1 : 1
  const prevHash = last?.entryHash ?? '0'.repeat(64)

  const canonical = JSON.stringify({
    seq: nextSeq,
    prevHash,
    actorId: params.actorId,
    actorRole: params.actorRole,
    action: params.action,
    entity: params.entity,
    entityId: params.entityId ?? null,
    patientId: params.patientId ?? null,
    episodeId: params.episodeId ?? null,
    oldValue: params.oldValue ?? null,
    newValue: params.newValue ?? null,
    reason: params.reason ?? null,
  })

  const entryHash = sha256(canonical)

  return prisma.auditLog.create({
    data: {
      seq: BigInt(nextSeq),
      prevHash,
      entryHash,
      actorId: params.actorId,
      actorRole: params.actorRole,
      action: params.action,
      entity: params.entity,
      patientId: params.patientId,
      episodeId: params.episodeId,
      entityId: params.entityId,
      // Aquí solucionamos el error de TypeScript usando los tipos de Prisma
      oldValue: (params.oldValue ?? Prisma.JsonNull) as Prisma.InputJsonValue,
      newValue: (params.newValue ?? Prisma.JsonNull) as Prisma.InputJsonValue,
      reason: params.reason,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    },
  })
}