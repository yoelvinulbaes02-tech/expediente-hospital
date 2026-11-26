import { PrismaClient } from '../src/generated/prisma'
import { PrismaNeon } from '@prisma/adapter-neon'
import bcrypt from 'bcryptjs'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL,
})

const prisma = new PrismaClient({ adapter })

async function main() {
  const passwordHash = await bcrypt.hash('Demo1234!', 12)
  const en30Dias = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

  const residenciaHospital = await prisma.residency.upsert({
    where: { slug: 'residencia-principal' },
    update: {},
    create: {
      name: 'Residencia Principal (Hospital)',
      slug: 'residencia-principal',
      specialty: 'Nefrología / Medicina Hospitalaria',
      interfaceMode: 'HOSPITALIZACION',
      planName: 'Plan Residencia Mensual',
      monthlyPriceUsd: 49,
      maxActiveUsers: 50,
      planStatus: 'ACTIVE',
      subscriptionEndsAt: en30Dias,
      billingContactEmail: 'admin@hospital.test',
    },
  })

  const residenciaConsultas = await prisma.residency.upsert({
    where: { slug: 'consulta-externa' },
    update: {},
    create: {
      name: 'Consulta Externa / Consultorio',
      slug: 'consulta-externa',
      specialty: 'Consulta Médica Externa',
      interfaceMode: 'CONSULTAS',
      planName: 'Plan Consultorio Mensual',
      monthlyPriceUsd: 39,
      maxActiveUsers: 15,
      planStatus: 'ACTIVE',
      subscriptionEndsAt: en30Dias,
      billingContactEmail: 'admin.consulta@hospital.test',
    },
  })

  const residenciaMedicinaInterna = await prisma.residency.upsert({
    where: { slug: 'medicina-interna' },
    update: {},
    create: {
      name: 'Residencia de Medicina Interna',
      slug: 'medicina-interna',
      specialty: 'Medicina Interna',
      interfaceMode: 'MEDICINA_INTERNA',
      planName: 'Plan Residencia Mensual',
      monthlyPriceUsd: 49,
      maxActiveUsers: 40,
      planStatus: 'ACTIVE',
      subscriptionEndsAt: en30Dias,
      billingContactEmail: 'admin.mi@hospital.test',
    },
  })

  const residenciaHemodialisis = await prisma.residency.upsert({
    where: { slug: 'hemodialisis' },
    update: {},
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
      billingContactEmail: 'admin.hd@hospital.test',
    },
  })

  await prisma.user.createMany({
    data: [
      { email: 'superadmin@nexo.test', passwordHash, fullName: 'Propietario NEXO', role: 'SUPERADMIN' },
      { email: 'admin@hospital.test', passwordHash, fullName: 'Admin Demo', role: 'ADMIN', residencyId: residenciaHospital.id },
      { email: 'doctor@hospital.test', passwordHash, fullName: 'Dr. Juan Pérez', role: 'DOCTOR', residencyId: residenciaHospital.id },
      { email: 'residente@hospital.test', passwordHash, fullName: 'Dra. Ana Gómez', role: 'RESIDENT', residencyId: residenciaHospital.id },
      { email: 'enfermeria@hospital.test', passwordHash, fullName: 'Enf. Carlos Ruiz', role: 'NURSE', residencyId: residenciaHospital.id },
      { email: 'lab@hospital.test', passwordHash, fullName: 'Lab. María Díaz', role: 'LAB', residencyId: residenciaHospital.id },
      { email: 'lectura@hospital.test', passwordHash, fullName: 'Auditor Solo Lectura', role: 'READONLY', residencyId: residenciaHospital.id },
      { email: 'prueba@pacientes.com', passwordHash, fullName: 'Dr. Prueba Google', role: 'DOCTOR', residencyId: residenciaHospital.id },
      // Usuarios demo para la interfaz de Consultas
      { email: 'admin.consulta@hospital.test', passwordHash, fullName: 'Admin Consulta Externa', role: 'ADMIN', residencyId: residenciaConsultas.id },
      { email: 'consulta@hospital.test', passwordHash, fullName: 'Dra. Laura Méndez (Consulta)', role: 'DOCTOR', residencyId: residenciaConsultas.id },
      // Usuarios demo para la interfaz de Medicina Interna
      { email: 'admin.mi@hospital.test', passwordHash, fullName: 'Admin Medicina Interna', role: 'ADMIN', residencyId: residenciaMedicinaInterna.id },
      { email: 'mi@hospital.test', passwordHash, fullName: 'Dr. Roberto Castillo (Med. Interna)', role: 'DOCTOR', residencyId: residenciaMedicinaInterna.id },
      // Usuarios demo para la nueva residencia de Hemodiálisis Ambulatoria
      { email: 'admin.hd@hospital.test', passwordHash, fullName: 'Admin Hemodiálisis', role: 'ADMIN', residencyId: residenciaHemodialisis.id },
      { email: 'hd@hospital.test', passwordHash, fullName: 'Dra. Patricia Vargas (Hemodiálisis)', role: 'DOCTOR', residencyId: residenciaHemodialisis.id },
    ],
    skipDuplicates: true,
  })

  console.log('✅ Seed multi-tenant completado. Contraseña para todos: Demo1234!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())