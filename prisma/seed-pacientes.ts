import { PrismaClient } from '../src/generated/prisma'
import { PrismaNeon } from '@prisma/adapter-neon'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL,
})

const prisma = new PrismaClient({ adapter })

async function main() {
  // Crear un paciente ficticio
  const patient = await prisma.patient.create({
    data: {
      expedienteNumber: 'EXP-2026-0001',
      firstName: 'Juan',
      lastName: 'Rodríguez',
      age: 45,
      sex: 'Masculino',
      episodes: {
        create: {
          admissionType: 'Emergencia',
          chiefComplaint: 'Dolor torácico agudo',
          room: '204',
          bed: 'A',
          attendingDoctor: 'Dr. Juan Pérez',
        }
      }
    },
    include: { episodes: true }
  })

  const episodeId = patient.episodes[0].id

  // Agregar una alergia grave (para ver el banner rojo)
  await prisma.allergy.create({
    data: {
      patientId: patient.id,
      episodeId: episodeId,
      allergen: 'Penicilina',
      type: 'medicamento',
      reaction: 'Shock anafiláctico',
      severity: 'grave',
      createdBy: 'doctor@hospital.test'
    }
  })

  // Crear un segundo paciente sin alergias evaluadas (para ver el banner ámbar)
  await prisma.patient.create({
    data: {
      expedienteNumber: 'EXP-2026-0002',
      firstName: 'María',
      lastName: 'Santos',
      age: 32,
      sex: 'Femenino',
      episodes: {
        create: {
          admissionType: 'Referido',
          chiefComplaint: 'Fiebre y deshidratación',
          room: '302',
          bed: 'B',
          attendingDoctor: 'Dra. Ana Gómez',
        }
      }
    }
  })

  console.log('✅ Pacientes de prueba creados.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
