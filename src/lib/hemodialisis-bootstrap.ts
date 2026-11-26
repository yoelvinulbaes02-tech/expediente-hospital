import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export const HEMODIALISIS_DEMO_ADMIN_EMAIL = 'admin.hd@hospital.test'
export const HEMODIALISIS_DEMO_DOCTOR_EMAIL = 'hd@hospital.test'
export const HEMODIALISIS_DEMO_PASSWORD = 'Demo1234!'

let enumAsegurado = false

export async function asegurarEnumHemodialisis(): Promise<void> {
  if (!process.env.DATABASE_URL || enumAsegurado) return
  try {
    await prisma.$executeRawUnsafe(
      `ALTER TYPE "InterfaceMode" ADD VALUE IF NOT EXISTS 'HEMODIALISIS'`
    )
    enumAsegurado = true
  } catch (err) {
    // Si el valor ya existe o la base de datos no permite DDL en este rol, continuamos
    console.warn('[hemodialisis-bootstrap] No se pudo verificar enum HEMODIALISIS:', err)
  }
}

export async function asegurarResidenciaHemodialisisDemo(): Promise<boolean> {
  if (!process.env.DATABASE_URL) return false

  try {
    await asegurarEnumHemodialisis()

    const [hdExistente, usuariosHdExistentes] = await Promise.all([
      prisma.residency.findUnique({
        where: { slug: 'hemodialisis' },
        select: { id: true, _count: { select: { users: true } } },
      }),
      prisma.user.count({
        where: {
          email: {
            in: [HEMODIALISIS_DEMO_ADMIN_EMAIL, HEMODIALISIS_DEMO_DOCTOR_EMAIL],
          },
        },
      }),
    ])

    // Si ya existe la residencia de Hemodiálisis con usuarios o ya existen las cuentas demo,
    // no recreamos ni sobreescribimos usuarios que un administrador haya modificado o eliminado.
    if ((hdExistente && hdExistente._count.users > 0) || usuariosHdExistentes > 0) {
      return true
    }

    const passwordHash = await bcrypt.hash(HEMODIALISIS_DEMO_PASSWORD, 12)
    const en30Dias = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

    const residenciaHd =
      hdExistente ??
      (await prisma.residency.upsert({
        where: { slug: 'hemodialisis' },
        update: {
          interfaceMode: 'HEMODIALISIS',
        },
        create: {
          name: 'Unidad de Hemodiálisis Ambulatoria',
          slug: 'hemodialisis',
          specialty: 'Hemodiálisis / Nefrología',
          interfaceMode: 'HEMODIALISIS',
          planName: 'Plan Residencia Mensual',
          monthlyPriceUsd: 49,
          maxActiveUsers: 40,
          planStatus: 'ACTIVE',
          subscriptionEndsAt: en30Dias,
          billingContactEmail: HEMODIALISIS_DEMO_ADMIN_EMAIL,
        },
        select: { id: true, _count: { select: { users: true } } },
      }))

    await prisma.user.createMany({
      data: [
        {
          email: HEMODIALISIS_DEMO_ADMIN_EMAIL,
          passwordHash,
          fullName: 'Admin Hemodiálisis',
          role: 'ADMIN',
          residencyId: residenciaHd.id,
        },
        {
          email: HEMODIALISIS_DEMO_DOCTOR_EMAIL,
          passwordHash,
          fullName: 'Dra. Patricia Vargas (Hemodiálisis)',
          role: 'DOCTOR',
          residencyId: residenciaHd.id,
        },
      ],
      skipDuplicates: true,
    })

    return true
  } catch (err) {
    console.error('[hemodialisis-bootstrap] Error creando residencia/cuentas HD:', err)
    return false
  }
}
