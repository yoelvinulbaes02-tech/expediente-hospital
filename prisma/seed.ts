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

  await prisma.user.createMany({
    data: [
      // Usuarios de prueba originales
      { email: 'admin@hospital.test', passwordHash, fullName: 'Admin Demo', role: 'ADMIN' },
      { email: 'doctor@hospital.test', passwordHash, fullName: 'Dr. Juan Pérez', role: 'DOCTOR' },
      { email: 'residente@hospital.test', passwordHash, fullName: 'Dra. Ana Gómez', role: 'RESIDENT' },
      { email: 'enfermeria@hospital.test', passwordHash, fullName: 'Enf. Carlos Ruiz', role: 'NURSE' },
      { email: 'lab@hospital.test', passwordHash, fullName: 'Lab. María Díaz', role: 'LAB' },
      { email: 'lectura@hospital.test', passwordHash, fullName: 'Auditor Solo Lectura', role: 'READONLY' },
      
      // NUEVO: Usuario con el dominio @pacientes.com para probar Google
      { email: 'prueba@pacientes.com', passwordHash, fullName: 'Dr. Prueba Google', role: 'DOCTOR' },
    ],
    skipDuplicates: true,
  })

  console.log('✅ Seed completado. Contraseña para todos: Demo1234!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())