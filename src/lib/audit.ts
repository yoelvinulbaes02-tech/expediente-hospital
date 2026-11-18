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

const AUDIT_ADVISORY_LOCK_ID = 741852963

export async function logAudit(params: AuditParams) {
  const maxIntentos = 5

  for (let intento = 1; intento <= maxIntentos; intento++) {
    try {
      return await prisma.$transaction(async (tx) => {
        if (typeof (tx as { $executeRawUnsafe?: unknown }).$executeRawUnsafe === 'function') {
          await tx.$executeRawUnsafe(`SELECT pg_advisory_xact_lock(${AUDIT_ADVISORY_LOCK_ID})`)
        }

        const last = await tx.auditLog.findFirst({
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

        return tx.auditLog.create({
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
            oldValue: (params.oldValue ?? Prisma.JsonNull) as Prisma.InputJsonValue,
            newValue: (params.newValue ?? Prisma.JsonNull) as Prisma.InputJsonValue,
            reason: params.reason,
            ipAddress: params.ipAddress,
            userAgent: params.userAgent,
          },
        })
      })
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code
      if (code === 'P2002' && intento < maxIntentos) {
        continue
      }
      throw err
    }
  }
}