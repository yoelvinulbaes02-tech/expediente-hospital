import { ThemeToggle } from '@/components/ThemeToggle'
import { obtenerSesionSegura, signOut } from '@/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { ListaPacientes } from '@/components/ListaPacientes'
import { ConsultasDashboard } from '@/components/ConsultasDashboard'
import { HemodialisisConsultaPanel } from '@/components/HemodialisisConsultaPanel'
import { ChevronDown, History } from 'lucide-react'
import { ROLES_CLINICOS } from '@/lib/permisos'
import { obtenerContextoResidencia } from '@/lib/tenant'
import { registrarCierreSesionNonce } from '@/lib/session-control'
import {
  CATEGORIAS_DISPOSITIVOS_CIRUGIA,
  resolverTeamAutomatico,
  type TeamServicioData,
} from '@/lib/cirugia-constants'
import { CATEGORIAS_DISPOSITIVOS_ORTOPEDIA } from '@/lib/ortopedia-constants'
import type { ResumenCirugiaStats } from '@/components/CirugiaResumenPanel'
import type { CuraPacienteItem } from '@/components/CurasPanel'
import type {
  HemodialisisDoseHistoryEntry,
  HemodialisisItemData,
  SeccionHd,
} from '@/components/HemodialisisPanel'
import {
  extraerEmergenciaGuardia,
  type EmergenciaGuardiaAutoStats,
  type EmergenciaGuardiaData,
} from '@/lib/emergencia-constants'
import { describirRegistro } from '@/lib/auditoria-texto'
import {
  etiquetaRolClinico,
  type BiopsyRecordItem,
  type OutpatientHemodialysisItem,
} from '@/lib/consultas-auth'
import { LegalFooter } from '@/components/LegalFooter'
import Image from 'next/image'
import Link from 'next/link'

function hace24Horas(): Date {
  return new Date(Date.now() - 24 * 60 * 60 * 1000)
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ doc?: string; vista?: string; cerrada?: string }>
}) {
  const ctx = await obtenerContextoResidencia()
  if (!ctx?.user) redirect('/login')

  if (ctx.user.mustChangePassword) {
    redirect('/dashboard/perfil?force=true')
  }

  if (ctx.esSuperAdmin) {
    redirect('/dashboard/plataforma')
  }

  if (!ctx.residency) {
    redirect('/login')
  }

  const residency = ctx.residency
  const suscripcion = ctx.suscripcion
  const suscripcionBloqueada = suscripcion?.bloqueada ?? false

  const { doc, vista, cerrada } = await searchParams
  const filtroDoc = doc || ''
  const esModoConsultas = ctx.interfaceMode === 'CONSULTAS'
  const esModoHemodialisis = ctx.interfaceMode === 'HEMODIALISIS'
  const esModoMedicinaInterna = ctx.interfaceMode === 'MEDICINA_INTERNA'
  const esModoCirugia = ctx.interfaceMode === 'CIRUGIA'
  const esModoOrtopedia = ctx.interfaceMode === 'ORTOPEDIA'
  const esModoEmergencia = ctx.interfaceMode === 'EMERGENCIA'
  const esModoHematologia = ctx.interfaceMode === 'HEMATOLOGIA'
  const esModoQuirurgicoBase = esModoCirugia || esModoOrtopedia
  const esModoNefrologia =
    !esModoConsultas &&
    !esModoHemodialisis &&
    !esModoMedicinaInterna &&
    !esModoQuirurgicoBase &&
    !esModoEmergencia &&
    !esModoHematologia
  const requiereTeamServicio = esModoMedicinaInterna || esModoQuirurgicoBase

  const vistaInicial: 'propio' | 'interconsulta' | 'curas' | 'hemodialisis' | 'biopsias' =
    vista === 'curas' && esModoQuirurgicoBase
      ? 'curas'
      : vista === 'hemodialisis' && esModoNefrologia
        ? 'hemodialisis'
        : vista === 'biopsias' && esModoNefrologia
          ? 'biopsias'
          : vista === 'interconsulta'
            ? 'interconsulta'
            : 'propio'

  const userId = ctx.user.id
  const userRole = String(ctx.user.role)
  const nombreMedico = ctx.user.fullName || ''
  const emailMedico = ctx.user.email || ''
  const esAdmin = userRole === 'ADMIN'
  const esPagoIndividual = residency.billingMode === 'INDIVIDUAL'
  const puedeVerSuscripcion = esAdmin || esPagoIndividual
  const puedeRegistrar = ROLES_CLINICOS.includes(userRole) && !suscripcionBloqueada
  const puedeEditarServicio = (ROLES_CLINICOS.includes(userRole) || esAdmin) && !suscripcionBloqueada

  const [episodesBase, doctores, turnosPendientes, consultas, pacientesClinica] = await Promise.all([
    esModoConsultas || esModoHemodialisis
      ? Promise.resolve([])
      : prisma.episode.findMany({
          where: {
            residencyId: residency.id,
            status: 'active',
            ...(filtroDoc ? { attendingDoctor: { contains: filtroDoc, mode: 'insensitive' } } : {}),
          },
          include: {
            patient: true,
            allergies: true,
            responsible: { select: { fullName: true } },
            handoffs: { where: { status: 'PENDIENTE' }, select: { recibidoPor: true }, take: 1 },
            tasks: {
              where: { status: 'pendiente' },
              orderBy: [{ dueAt: 'asc' }, { createdAt: 'asc' }],
              select: { id: true, title: true, category: true, dueAt: true },
            },
            _count: { select: { tasks: { where: { status: 'pendiente' } } } },
          },
        }),

    prisma.user.findMany({
      where: {
        residencyId: residency.id,
        isActive: true,
        role: { in: ['DOCTOR', 'RESIDENT'] },
        ...(esModoConsultas || esModoHemodialisis ? {} : { id: { not: userId } }),
      },
      select: { id: true, fullName: true, email: true },
      orderBy: { fullName: 'asc' },
    }),

    esModoConsultas || esModoHemodialisis
      ? Promise.resolve(0)
      : prisma.handoff.count({
          where: {
            status: 'PENDIENTE',
            episode: { residencyId: residency.id },
            recibidoPor: { equals: emailMedico, mode: 'insensitive' },
          },
        }),

    esModoConsultas
      ? prisma.consultation.findMany({
          where: { residencyId: residency.id },
          include: {
            doctor: {
              select: { id: true, fullName: true, role: true },
            },
            patient: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                age: true,
                sex: true,
                expedienteNumber: true,
                phone: true,
                cedula: true,
              },
            },
          },
          orderBy: { consultationDate: 'desc' },
          take: 1000,
        })
      : Promise.resolve([]),

    esModoConsultas || esModoNefrologia || esModoHemodialisis
      ? prisma.patient.findMany({
          where: { residencyId: residency.id },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            expedienteNumber: true,
            age: true,
            sex: true,
            phone: true,
          },
          orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
          take: 2500,
        })
      : Promise.resolve([]),
  ])

  let perfilesMI = new Map<
    string,
    {
      clinicalStatus: string
      codeStatus: string
      isolationType: string
      oxygenSupport: string
    }
  >()
  if (esModoMedicinaInterna && episodesBase.length > 0) {
    const listaPerfiles = await prisma.internalMedicineProfile
      .findMany({
        where: { episodeId: { in: episodesBase.map((e) => e.id) } },
        select: {
          episodeId: true,
          clinicalStatus: true,
          codeStatus: true,
          isolationType: true,
          oxygenSupport: true,
        },
      })
      .catch(() => [])
    perfilesMI = new Map(
      listaPerfiles.map((p) => [
        p.episodeId,
        {
          clinicalStatus: p.clinicalStatus,
          codeStatus: p.codeStatus,
          isolationType: p.isolationType,
          oxygenSupport: p.oxygenSupport,
        },
      ])
    )
  }

  let perfilesHema = new Map<
    string,
    {
      vitalSignsFrequency: string
      bleedingWatch: string | null
      painWatch: string | null
      temperatureWatch: string | null
      hemodynamicWatch: string | null
      pendingBloodProducts: string | null
      pendingStudies: string | null
      updatedBy: string
      updatedByName: string | null
      updatedByRole: string | null
      updatedAt: string
    }
  >()
  if (esModoHematologia && episodesBase.length > 0) {
    const listaHema = await prisma.hematologyProfile
      .findMany({
        where: { episodeId: { in: episodesBase.map((e) => e.id) } },
        select: {
          episodeId: true,
          vitalSignsFrequency: true,
          bleedingWatch: true,
          painWatch: true,
          temperatureWatch: true,
          hemodynamicWatch: true,
          pendingBloodProducts: true,
          pendingStudies: true,
          updatedBy: true,
          updatedAt: true,
        },
      })
      .catch(() => [])
    const hemaEmails = Array.from(new Set(listaHema.map((p) => p.updatedBy).filter(Boolean)))
    const hemaUsers =
      hemaEmails.length > 0
        ? await prisma.user.findMany({
            where: { residencyId: residency.id, email: { in: hemaEmails } },
            select: { email: true, fullName: true, role: true },
          })
        : []
    const mapaHemaUsers = new Map(hemaUsers.map((u) => [u.email, u]))
    perfilesHema = new Map(
      listaHema.map((p) => {
        const u = mapaHemaUsers.get(p.updatedBy)
        return [
          p.episodeId,
          {
            vitalSignsFrequency: p.vitalSignsFrequency,
            bleedingWatch: p.bleedingWatch,
            painWatch: p.painWatch,
            temperatureWatch: p.temperatureWatch,
            hemodynamicWatch: p.hemodynamicWatch,
            pendingBloodProducts: p.pendingBloodProducts,
            pendingStudies: p.pendingStudies,
            updatedBy: p.updatedBy,
            updatedByName: u?.fullName ?? p.updatedBy,
            updatedByRole: u ? String(u.role) : null,
            updatedAt: p.updatedAt.toISOString(),
          },
        ]
      })
    )
  }

  let perfilesEmergencia = new Map<
    string,
    {
      amc: string | null
      specialty: string | null
      relevantLabsStudies: string | null
      interestsPending: string | null
      triageLevel: string
      clinicalStatus: string
      updatedBy: string
      updatedByName: string | null
      updatedByRole: string | null
      updatedAt: string
    }
  >()
  if (esModoEmergencia && episodesBase.length > 0) {
    const listaEmergencia = await prisma.emergencyProfile
      .findMany({
        where: { episodeId: { in: episodesBase.map((e) => e.id) } },
        select: {
          episodeId: true,
          amc: true,
          specialty: true,
          relevantLabsStudies: true,
          interestsPending: true,
          triageLevel: true,
          clinicalStatus: true,
          updatedBy: true,
          updatedAt: true,
        },
      })
      .catch(() => [])
    const emEmails = Array.from(new Set(listaEmergencia.map((p) => p.updatedBy).filter(Boolean)))
    const emUsers =
      emEmails.length > 0
        ? await prisma.user.findMany({
            where: { residencyId: residency.id, email: { in: emEmails } },
            select: { email: true, fullName: true, role: true },
          })
        : []
    const mapaEmUsers = new Map(emUsers.map((u) => [u.email, u]))
    perfilesEmergencia = new Map(
      listaEmergencia.map((p) => {
        const u = mapaEmUsers.get(p.updatedBy)
        return [
          p.episodeId,
          {
            amc: p.amc,
            specialty: p.specialty,
            relevantLabsStudies: p.relevantLabsStudies,
            interestsPending: p.interestsPending,
            triageLevel: p.triageLevel,
            clinicalStatus: p.clinicalStatus,
            updatedBy: p.updatedBy,
            updatedByName: u?.fullName ?? p.updatedBy,
            updatedByRole: u ? String(u.role) : null,
            updatedAt: p.updatedAt.toISOString(),
          },
        ]
      })
    )
  }

  const emergenciaGuardia: EmergenciaGuardiaData | undefined = esModoEmergencia
    ? extraerEmergenciaGuardia(residency.surgicalStatsExtra)
    : undefined

  let emergenciaAutoStats: EmergenciaGuardiaAutoStats | undefined
  if (esModoEmergencia) {
    const hace24h = hace24Horas()
    const closedEmergencia24h = await prisma.episode
      .findMany({
        where: {
          residencyId: residency.id,
          status: 'closed',
          updatedAt: { gte: hace24h },
          ...(filtroDoc ? { attendingDoctor: { contains: filtroDoc, mode: 'insensitive' } } : {}),
        },
        select: {
          id: true,
          serviceType: true,
          admissionType: true,
          dischargeType: true,
          room: true,
          emergencyProfile: {
            select: {
              specialty: true,
              triageLevel: true,
              clinicalStatus: true,
              dispositionPlan: true,
            },
          },
        },
      })
      .catch(() => [])

    const norm = (s?: string | null) =>
      (s ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()

    let triage = 0
    let emergencias = 0
    let medicinaInterna = 0
    let cirugiaCount = 0
    let ortopediaCount = 0
    let neurocirugia = 0
    let pacientesTraumaShock = 0

    const clasificarAtencion = (triageLevel?: string | null, admissionType?: string | null, specialty?: string | null) => {
      const tNorm = norm(triageLevel)
      const admNorm = norm(admissionType)
      if (
        tNorm.includes('triage') ||
        tNorm.includes('menor') ||
        tNorm.includes('prioritario') ||
        tNorm.includes('urgencia') ||
        (!tNorm && admNorm.includes('triage'))
      ) {
        triage += 1
      } else {
        emergencias += 1
      }

      const esp = norm(specialty)
      if (esp.includes('medicina interna')) medicinaInterna += 1
      else if (esp.includes('neurocirug')) neurocirugia += 1
      else if (esp.includes('cirug')) cirugiaCount += 1
      else if (esp.includes('ortoped')) ortopediaCount += 1
    }

    for (const ep of episodesBase) {
      const prof = perfilesEmergencia.get(ep.id)
      clasificarAtencion(prof?.triageLevel, ep.admissionType, prof?.specialty)
      const roomStr = (ep.room ?? '').trim()
      if (
        norm(prof?.triageLevel).includes('trauma') ||
        norm(prof?.clinicalStatus).includes('trauma') ||
        norm(roomStr).includes('trauma') ||
        /^ts(\b|\d)/i.test(roomStr)
      ) {
        pacientesTraumaShock += 1
      }
    }

    let enviadosSala = 0
    let enviadoUci = 0
    let traslado = 0
    let referimientos = 0
    let fallecido = 0

    for (const ep of closedEmergencia24h) {
      clasificarAtencion(ep.emergencyProfile?.triageLevel, ep.admissionType, ep.emergencyProfile?.specialty)
      const dest = norm(`${ep.dischargeType ?? ''} ${ep.emergencyProfile?.dispositionPlan ?? ''}`)
      if (dest.includes('uci')) enviadoUci += 1
      else if (dest.includes('traslado')) traslado += 1
      else if (dest.includes('refer')) referimientos += 1
      else if (dest.includes('fallecido') && !dest.includes('traido')) fallecido += 1
      else if (dest.includes('sala') || dest.includes('egreso') || dest.includes('ingreso')) enviadosSala += 1
    }

    const propiosActivosCount = episodesBase.filter((e) => (e.serviceType ?? 'propio') === 'propio').length
    emergenciaAutoStats = {
      totalVistos: episodesBase.length + closedEmergencia24h.length,
      triage,
      emergencias,
      ingresosTotales: propiosActivosCount,
      medicinaInterna,
      cirugiaCount,
      ortopediaCount,
      neurocirugia,
      enviadosSala,
      enviadoUci,
      traslado,
      referimientos,
      fallecido,
      pacientesIngresados: propiosActivosCount,
      pacientesTraumaShock,
    }
  }

  let biopsiasSerializadas: BiopsyRecordItem[] = []
  if (esModoNefrologia) {
    const biopsiasDb = await prisma.biopsyRecord
      .findMany({
        where: { residencyId: residency.id },
        orderBy: [{ status: 'asc' }, { scheduledDate: 'asc' }, { createdAt: 'desc' }],
        take: 500,
      })
      .catch(() => [])

    biopsiasSerializadas = biopsiasDb.map((b) => ({
      id: b.id,
      patientId: b.patientId,
      status: b.status === 'realizada' ? 'realizada' : 'agendada',
      patientName: b.patientName,
      phone: b.phone,
      labsStatus: b.labsStatus,
      needleStatus: b.needleStatus,
      kitStatus: b.kitStatus,
      scheduledDate: b.scheduledDate,
      senasaAuth: b.senasaAuth,
      note: b.note,
      performedDate: b.performedDate,
      complications: b.complications,
      report: b.report,
      highlightTag: 'normal',
      createdByName: b.createdByName,
      createdByRole: b.createdByRole,
      createdAt: b.createdAt.toISOString(),
      updatedByName: b.updatedByName,
      updatedByRole: b.updatedByRole,
      updatedAt: b.updatedAt ? b.updatedAt.toISOString() : null,
      performedByName: b.performedByName,
      performedByRole: b.performedByRole,
      performedAt: b.performedAt ? b.performedAt.toISOString() : null,
    }))
  }

  type ActividadAuditItem = {
    id: string
    actorName: string
    actorRole: string
    atIso: string
    que: string
    detalle: string
  }

  let hdOutpatientSerializados: OutpatientHemodialysisItem[] = []
  let historialActividadHemodialisis: ActividadAuditItem[] = []
  if (esModoHemodialisis) {
    const [hdOutpatientDb, auditHdDb] = await Promise.all([
      prisma.outpatientHemodialysis
        .findMany({
          where: { residencyId: residency.id },
          orderBy: [{ isActive: 'desc' }, { updatedAt: 'desc' }, { createdAt: 'desc' }],
          take: 500,
        })
        .catch(() => []),
      prisma.auditLog
        .findMany({
          where: {
            entity: { in: ['outpatient_hemodialysis', 'patient'] },
            actor: { residencyId: residency.id },
          },
          orderBy: { seq: 'desc' },
          take: 40,
          include: {
            actor: { select: { fullName: true, email: true, role: true } },
          },
        })
        .catch(() => []),
    ])

    hdOutpatientSerializados = hdOutpatientDb.map((h) => ({
      id: h.id,
      patientId: h.patientId,
      firstName: h.firstName,
      lastName: h.lastName,
      expedienteNumber: h.expedienteNumber,
      age: h.age,
      sex: h.sex,
      phone: h.phone,
      cedula: h.cedula,
      bloodType: h.bloodType,
      diagnosisAndTime: h.diagnosisAndTime,
      medications: h.medications,
      allergies: h.allergies,
      allergyReaction: h.allergyReaction,
      transfusions: h.transfusions,
      referredFromCenter: h.referredFromCenter,
      firstTimeInCenter: h.firstTimeInCenter,
      otherDialysisModality: h.otherDialysisModality,
      pathologicalHistory: h.pathologicalHistory,
      surgicalHistory: h.surgicalHistory,
      familyHistory: h.familyHistory,
      habitCoffee: h.habitCoffee,
      habitTobacco: h.habitTobacco,
      habitAlcohol: h.habitAlcohol,
      habitDrugs: h.habitDrugs,
      habitOther: h.habitOther,
      viralHiv: h.viralHiv,
      viralHbsag: h.viralHbsag,
      viralHvc: h.viralHvc,
      labHgb: h.labHgb,
      labHct: h.labHct,
      labUrea: h.labUrea,
      labCr: h.labCr,
      labK: h.labK,
      labBloodType: h.labBloodType,
      labOther: h.labOther,
      imagingSonography: h.imagingSonography,
      imagingCt: h.imagingCt,
      imagingOther: h.imagingOther,
      accessAvFistula: h.accessAvFistula,
      accessGraft: h.accessGraft,
      accessTunneledCatheter: h.accessTunneledCatheter,
      accessFavi: h.accessFavi,
      clinicalNotes: h.clinicalNotes,
      isActive: h.isActive,
      createdByName: h.createdByName,
      createdByRole: h.createdByRole,
      createdAt: h.createdAt.toISOString(),
      updatedByName: h.updatedByName,
      updatedByRole: h.updatedByRole,
      updatedAt: h.updatedAt ? h.updatedAt.toISOString() : null,
    }))

    historialActividadHemodialisis = auditHdDb.map((log) => {
      const desc = describirRegistro(log)
      return {
        id: String(log.id),
        actorName: log.actor.fullName || log.actor.email,
        actorRole: String(log.actorRole || log.actor.role),
        atIso: log.serverTs.toISOString(),
        que: desc.que,
        detalle: desc.detalle,
      }
    })
  }

  let historialActividadConsultas: ActividadAuditItem[] = []
  let mapaEditoresConsultas = new Map<string, { fullName: string; role: string }>()
  if (esModoConsultas) {
    const emailsConsulta = Array.from(
      new Set(consultas.map((c) => c.updatedBy || c.createdBy).filter((e): e is string => Boolean(e)))
    )
    const [auditConsultasDb, editoresConsultasDb] = await Promise.all([
      prisma.auditLog
        .findMany({
          where: {
            entity: {
              in: ['consultation', 'medical_history', 'patient'],
            },
            actor: { residencyId: residency.id },
          },
          orderBy: { seq: 'desc' },
          take: 40,
          include: {
            actor: { select: { fullName: true, email: true, role: true } },
          },
        })
        .catch(() => []),
      emailsConsulta.length > 0
        ? prisma.user
            .findMany({
              where: { residencyId: residency.id, email: { in: emailsConsulta } },
              select: { email: true, fullName: true, role: true },
            })
            .catch(() => [])
        : Promise.resolve([]),
    ])

    mapaEditoresConsultas = new Map(
      editoresConsultasDb.map((u) => [u.email, { fullName: u.fullName, role: String(u.role) }])
    )
    historialActividadConsultas = auditConsultasDb.map((log) => {
      const desc = describirRegistro(log)
      return {
        id: String(log.id),
        actorName: log.actor.fullName || log.actor.email,
        actorRole: String(log.actorRole || log.actor.role),
        atIso: log.serverTs.toISOString(),
        que: desc.que,
        detalle: desc.detalle,
      }
    })
  }

  let perfilesCirugia = new Map<
    string,
    {
      procedureName: string | null
      surgeryDate: Date | null
      surgeryType: string
      surgicalSpecialty: string | null
      surgeryStatus: string
      affectedLimb?: string | null
      neurovascularStatus?: string | null
      compartmentAlert?: boolean
      weightBearingPlan?: string | null
    }
  >()

  let teamData: TeamServicioData | undefined
  let sugerenciaAutoTeam: { ma: string; r4: string; r3: string; r2: string; r1: string } | undefined
  let resumenCirugiaAuto: Omit<ResumenCirugiaStats, 'mode'> | undefined
  let resumenCirugiaGuardado: ResumenCirugiaStats | null = null
  let conteosDispositivosCirugia: Record<string, number> | undefined
  let curasSerializadas: CuraPacienteItem[] = []

  if (requiereTeamServicio) {
    const [usuariosTeam, dispositivosActivos, curasDb, perfilesQ] = await Promise.all([
      prisma.user.findMany({
        where: {
          residencyId: residency.id,
          isActive: true,
          role: { in: ['DOCTOR', 'RESIDENT'] },
        },
        select: { fullName: true, role: true },
        orderBy: { fullName: 'asc' },
      }),
      esModoQuirurgicoBase
        ? prisma.surgicalDevice
            .findMany({
              where: { residencyId: residency.id, isActive: true },
              select: { category: true },
            })
            .catch(() => [])
        : Promise.resolve([]),
      esModoQuirurgicoBase
        ? prisma.woundCare
            .findMany({
              where: { residencyId: residency.id, isActive: true },
              include: {
                logs: { orderBy: { performedAt: 'desc' }, take: 30 },
              },
              orderBy: { createdAt: 'desc' },
            })
            .catch(() => [])
        : Promise.resolve([]),
      esModoQuirurgicoBase && episodesBase.length > 0
        ? prisma.surgicalProfile
            .findMany({
              where: { episodeId: { in: episodesBase.map((e) => e.id) } },
              select: {
                episodeId: true,
                procedureName: true,
                surgeryDate: true,
                surgeryType: true,
                surgicalSpecialty: true,
                surgeryStatus: true,
                affectedLimb: true,
                neurovascularStatus: true,
                compartmentAlert: true,
                weightBearingPlan: true,
              },
            })
            .catch(() => [])
        : Promise.resolve([]),
    ])

    sugerenciaAutoTeam = resolverTeamAutomatico({
      usuarios: usuariosTeam,
      episodios: episodesBase.map((ep) => ({
        admittingDoctor: ep.admittingDoctor,
        attendingDoctor: ep.attendingDoctor,
      })),
    })

    const emailsResolver = new Set<string>()
    if (residency.teamUpdatedBy) emailsResolver.add(residency.teamUpdatedBy)
    curasDb.forEach((c) => {
      emailsResolver.add(c.createdBy)
      c.logs.forEach((l) => emailsResolver.add(l.performedBy))
    })

    const usuariosNombres =
      emailsResolver.size > 0
        ? await prisma.user.findMany({
            where: {
              residencyId: residency.id,
              email: { in: Array.from(emailsResolver) },
            },
            select: { email: true, fullName: true },
          })
        : []
    const mapaNombres = Object.fromEntries(usuariosNombres.map((u) => [u.email, u.fullName]))

    teamData = {
      ma: residency.teamMa ?? '',
      r4: residency.teamR4 ?? '',
      r3: residency.teamR3 ?? '',
      r2: residency.teamR2 ?? '',
      r1: residency.teamR1 ?? '',
      autoMode: residency.teamAutoMode ?? false,
      updatedBy: residency.teamUpdatedBy ? mapaNombres[residency.teamUpdatedBy] ?? residency.teamUpdatedBy : null,
      updatedAt: residency.teamUpdatedAt ? residency.teamUpdatedAt.toISOString() : null,
    }

    if (esModoQuirurgicoBase) {
      perfilesCirugia = new Map(
        perfilesQ.map((p) => [
          p.episodeId,
          {
            procedureName: p.procedureName,
            surgeryDate: p.surgeryDate,
            surgeryType: p.surgeryType,
            surgicalSpecialty: p.surgicalSpecialty,
            surgeryStatus: p.surgeryStatus,
            affectedLimb: p.affectedLimb,
            neurovascularStatus: p.neurovascularStatus,
            compartmentAlert: p.compartmentAlert,
            weightBearingPlan: p.weightBearingPlan,
          },
        ])
      )

      const propios = episodesBase.filter((e) => (e.serviceType ?? 'propio') === 'propio')
      const esEmergenciaEp = (ep: (typeof episodesBase)[number]) => {
        const tipoIng = (ep.admissionType ?? '').toLowerCase()
        const tipoQx = perfilesCirugia.get(ep.id)?.surgeryType
        const depto = (ep.consultingDepartment ?? '').toLowerCase()
        return (
          tipoIng.includes('emergencia') ||
          tipoIng.includes('trauma') ||
          tipoQx === 'emergencia' ||
          depto.includes('emergencia')
        )
      }

      const ingresosEmergencias = propios.filter((ep) => esEmergenciaEp(ep)).length
      const ingresosElectivos = propios.filter((ep) => !esEmergenciaEp(ep)).length
      const emergencias = episodesBase.filter((ep) => esEmergenciaEp(ep)).length
      const cirugias = Array.from(perfilesCirugia.values()).filter(
        (p) => p.procedureName || p.surgeryStatus !== 'suspendida'
      ).length

      resumenCirugiaAuto = {
        emergencias,
        ingresosElectivos,
        ingresosEmergencias,
        totalIngresos: propios.length,
        cirugias,
      }

      const extraRaw = residency.surgicalStatsExtra as Record<string, unknown> | null
      if (extraRaw && typeof extraRaw === 'object' && extraRaw.mode === 'manual') {
        resumenCirugiaGuardado = {
          mode: 'manual',
          emergencias: Number(extraRaw.emergencias ?? 0),
          ingresosElectivos: Number(extraRaw.ingresosElectivos ?? 0),
          ingresosEmergencias: Number(extraRaw.ingresosEmergencias ?? 0),
          totalIngresos: Number(extraRaw.totalIngresos ?? 0),
          cirugias: Number(extraRaw.cirugias ?? 0),
        }
      }

      const conteoInicial: Record<string, number> = {}
      const categoriasActivas = esModoOrtopedia
        ? CATEGORIAS_DISPOSITIVOS_ORTOPEDIA
        : CATEGORIAS_DISPOSITIVOS_CIRUGIA
      for (const cat of categoriasActivas) {
        conteoInicial[cat.key] = 0
      }
      for (const dev of dispositivosActivos) {
        conteoInicial[dev.category] = (conteoInicial[dev.category] ?? 0) + 1
      }
      conteosDispositivosCirugia = conteoInicial

      curasSerializadas = curasDb.map((c) => ({
        id: c.id,
        roomBed: c.roomBed,
        patientName: c.patientName,
        age: c.age,
        diagnosis: c.diagnosis,
        patientStatus: c.patientStatus,
        careFrequency: c.careFrequency,
        baseDepartment: c.baseDepartment,
        createdBy: mapaNombres[c.createdBy] ?? c.createdBy,
        createdAt: c.createdAt.toISOString(),
        logs: c.logs.map((l) => ({
          id: l.id,
          performedBy: l.performedBy,
          performedByName: mapaNombres[l.performedBy] ?? l.performedBy,
          performedAt: l.performedAt.toISOString(),
          notes: l.notes,
        })),
      }))
    }
  }

  let hemodialisisSerializados: HemodialisisItemData[] = []
  if (esModoNefrologia) {
    const [hdActivosDb, hdResueltosDb] = await Promise.all([
      prisma.hemodialysisItem
        .findMany({
          where: { residencyId: residency.id, isActive: true },
          orderBy: [{ isPriority: 'desc' }, { createdAt: 'desc' }],
        })
        .catch(() => []),
      prisma.hemodialysisItem
        .findMany({
          where: { residencyId: residency.id, isActive: false },
          orderBy: [{ resolvedAt: 'desc' }, { createdAt: 'desc' }],
          take: 40,
        })
        .catch(() => []),
    ])

    const hdAntibioticoIds = [...hdActivosDb, ...hdResueltosDb]
      .filter((item) => item.section === 'antibiotico')
      .map((item) => item.id)

    const logsDosisRaw =
      hdAntibioticoIds.length > 0
        ? await prisma.auditLog
            .findMany({
              where: {
                entity: 'hemodialysis_item',
                entityId: { in: hdAntibioticoIds },
                action: 'update',
              },
              orderBy: { serverTs: 'desc' },
              take: 500,
              select: {
                entityId: true,
                newValue: true,
                serverTs: true,
              },
            })
            .catch(() => [])
        : []

    const mapaDosis = new Map<
      string,
      {
        doseCount: number
        lastDoseApplied: string | null
        doseHistory: HemodialisisDoseHistoryEntry[]
      }
    >()

    for (const log of logsDosisRaw) {
      if (!log.entityId || !log.newValue || typeof log.newValue !== 'object' || Array.isArray(log.newValue)) {
        continue
      }
      const val = log.newValue as Record<string, unknown>
      if (val.accion !== 'dosis') continue

      const entry = mapaDosis.get(log.entityId) ?? {
        doseCount: 0,
        lastDoseApplied: null,
        doseHistory: [],
      }

      const doseText =
        typeof val.dosisAplicada === 'string' && val.dosisAplicada.trim()
          ? val.dosisAplicada.trim()
          : typeof val.title === 'string'
            ? val.title
            : 'Dosis aplicada'

      entry.doseCount += 1
      if (!entry.lastDoseApplied) {
        entry.lastDoseApplied = doseText
      }
      if (entry.doseHistory.length < 8) {
        entry.doseHistory.push({
          dose: doseText,
          byName: typeof val.lastCheckByName === 'string' ? val.lastCheckByName : 'Personal',
          byRole: typeof val.lastCheckByRole === 'string' ? val.lastCheckByRole : '',
          at:
            typeof val.lastCheckAt === 'string' && val.lastCheckAt
              ? val.lastCheckAt
              : log.serverTs.toISOString(),
          note: typeof val.doseNote === 'string' ? val.doseNote : null,
          esquemaActualizado: Boolean(val.esquemaActualizado),
        })
      }

      mapaDosis.set(log.entityId, entry)
    }

    hemodialisisSerializados = [...hdActivosDb, ...hdResueltosDb].map((item) => {
      const statsDosis = mapaDosis.get(item.id)
      const fallbackCount = item.section === 'antibiotico' && item.lastCheckAt ? 1 : 0
      return {
        id: item.id,
        section: item.section as SeccionHd,
        patientName: item.patientName,
        title: item.title,
        details: item.details,
        shiftLabel: item.shiftLabel,
        eventDate: item.eventDate ? item.eventDate.toISOString() : null,
        durationDays: item.durationDays,
        isPriority: item.isPriority,
        isActive: item.isActive,
        resolutionNote: item.resolutionNote,
        lastCheckAt: item.lastCheckAt ? item.lastCheckAt.toISOString() : null,
        lastCheckBy: item.lastCheckBy,
        lastCheckByName: item.lastCheckByName,
        lastCheckByRole: item.lastCheckByRole,
        createdBy: item.createdBy,
        createdByName: item.createdByName,
        createdByRole: item.createdByRole,
        createdAt: item.createdAt.toISOString(),
        updatedBy: item.updatedBy,
        updatedByName: item.updatedByName,
        updatedByRole: item.updatedByRole,
        updatedAt: item.updatedAt ? item.updatedAt.toISOString() : null,
        resolvedBy: item.resolvedBy,
        resolvedByName: item.resolvedByName,
        resolvedByRole: item.resolvedByRole,
        resolvedAt: item.resolvedAt ? item.resolvedAt.toISOString() : null,
        doseCount: statsDosis?.doseCount ?? fallbackCount,
        lastDoseApplied: statsDosis?.lastDoseApplied ?? null,
        doseHistory: statsDosis?.doseHistory ?? [],
      }
    })
  }

  const ahoraIso = new Date().toISOString()

  const episodes = episodesBase.map((ep) => ({
    ...ep,
    internalMedicineProfile: perfilesMI.get(ep.id) ?? null,
    surgicalProfile: perfilesCirugia.get(ep.id) ?? null,
    hematologyProfile: perfilesHema.get(ep.id) ?? null,
    emergencyProfile: perfilesEmergencia.get(ep.id) ?? null,
  }))

  const textoBadge = turnosPendientes > 9 ? '+9' : String(turnosPendientes)

  const consultasSerializadas = consultas.map((c) => {
    const editorEmail = c.updatedBy || c.createdBy
    const editor = editorEmail ? mapaEditoresConsultas.get(editorEmail) : undefined
    return {
      id: c.id,
      consultationDate: c.consultationDate.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
      status: c.status,
      consultationType: c.consultationType ?? 'Consulta general',
      visitType: c.visitType,
      chiefComplaint: c.chiefComplaint,
      diagnosis: c.diagnosis,
      treatmentPlan: c.treatmentPlan,
      nextAppointment: c.nextAppointment ? c.nextAppointment.toISOString() : null,
      notes: c.notes,
      weight: c.weight,
      weightUnit: c.weightUnit,
      heightCm: c.heightCm,
      doctorId: c.doctorId,
      doctorName: c.doctorName,
      doctorRole: c.doctor?.role ? String(c.doctor.role) : null,
      updatedByName: editor?.fullName ?? editorEmail ?? null,
      updatedByRole: editor?.role ?? null,
      patient: c.patient,
    }
  })

  async function cerrarSesion() {
    'use server'
    const sesionActual = await obtenerSesionSegura()
    if (sesionActual?.user?.id && sesionActual.sessionNonce) {
      await registrarCierreSesionNonce({
        actorId: sesionActual.user.id,
        actorRole: String(sesionActual.user.role ?? 'READONLY'),
        sessionNonce: sesionActual.sessionNonce,
      })
    }
    await signOut({ redirectTo: '/login' })
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 md:px-6 py-2.5 flex justify-between items-center gap-4 shadow-sm sticky top-0 z-10 transition-colors duration-300">
        {/* IDENTIDAD DE MARCA: ICONO + ORDEN EXACTO */}
        <Link href="/dashboard" className="flex items-center gap-3.5 min-w-0 hover:opacity-95 transition-opacity">
          <Image
            src="/Logo.png"
            alt="NEXO Isotipo"
            width={120}
            height={52}
            priority
            referrerPolicy="no-referrer"
            className="h-11 md:h-13 w-auto object-contain shrink-0"
          />

          <div className="flex flex-col min-w-0 justify-center">
            <h1 className="text-xl md:text-2xl font-black tracking-tight leading-none text-[#0D2344] dark:text-white">
              NE<span className="text-[#00A8B5] dark:text-[#00C4D6]">X</span>O
            </h1>

            <p className="text-[10px] md:text-[11px] font-extrabold text-[#0D2344] dark:text-slate-300 tracking-wider uppercase leading-tight mt-1">
              MEDICAL TEAM WORKFLOW
            </p>

            <div className="w-full max-w-50 md:max-w-55 my-1">
              <svg viewBox="0 0 160 12" className="w-full h-2 text-[#00A8B5]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M0 6 H65 L69 1 L73 11 L77 2 L81 9 L84 6 H160" />
              </svg>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate leading-none mt-0.5 font-medium">
              {residency.name} · {esAdmin ? 'Administración' : nombreMedico}
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-2 md:gap-3 shrink-0">
          {!esModoConsultas && !esModoHemodialisis && (
            <Link
              href="/dashboard/turnos-pendientes"
              aria-label="Turnos pendientes"
              className="relative md:hidden w-10 h-10 flex items-center justify-center rounded-lg bg-amber-500 text-white text-xl shadow-sm hover:bg-amber-600 transition-colors"
            >
              🔔
              {turnosPendientes > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[10px] font-bold min-w-5 h-5 px-1 flex items-center justify-center rounded-full border-2 border-white dark:border-slate-800 shadow-md">
                  {textoBadge}
                </span>
              )}
            </Link>
          )}

          <ThemeToggle />

          <div className="hidden md:flex items-center gap-3">
            {puedeVerSuscripcion && (
              <Link
                href="/dashboard/suscripcion"
                className="bg-teal-600 text-white px-3.5 py-2 rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors shadow-sm"
              >
                {esPagoIndividual ? '💳 Mi Suscripción' : '💳 Suscripción'}
              </Link>
            )}
            {esAdmin && (
              <>
                <Link href="/dashboard/usuarios" className="bg-slate-600 text-white px-3.5 py-2 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors shadow-sm">
                  👥 Usuarios
                </Link>
                <Link href="/dashboard/auditoria" className="bg-slate-800 text-white px-3.5 py-2 rounded-lg text-sm font-medium hover:bg-slate-900 transition-colors shadow-sm">
                  📜 Auditoría
                </Link>
              </>
            )}

            {!esModoConsultas && !esModoHemodialisis && (
              <Link
                href="/dashboard/turnos-pendientes"
                className="relative bg-amber-500 text-white px-3.5 py-2 rounded-lg text-sm font-medium hover:bg-amber-600 transition-colors shadow-sm"
              >
                🔔 Turnos Pendientes
                {turnosPendientes > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full border-2 border-white dark:border-slate-800 shadow-md">
                    {textoBadge}
                  </span>
                )}
              </Link>
            )}

            <div className="text-right">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{nombreMedico}</p>
              <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">{userRole}</p>
            </div>

            <Link
              href="/dashboard/perfil"
              className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              ⚙️ Mi Perfil
            </Link>

            <form action={cerrarSesion}>
              <button className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors cursor-pointer">
                Salir
              </button>
            </form>
          </div>

          <details className="relative md:hidden">
            <summary
              aria-label="Abrir menú"
              className="list-none cursor-pointer w-10 h-10 flex items-center justify-center rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xl select-none [&::-webkit-details-marker]:hidden"
            >
              ☰
            </summary>
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg p-2 z-20">
              <div className="px-3 py-2 mb-1 border-b border-slate-200 dark:border-slate-700">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{nombreMedico}</p>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">{userRole}</p>
              </div>

              {puedeVerSuscripcion && (
                <Link
                  href="/dashboard/suscripcion"
                  className="block px-3 py-3 rounded-lg text-sm font-medium text-teal-700 dark:text-teal-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  {esPagoIndividual ? '💳 Mi Suscripción' : '💳 Suscripción'}
                </Link>
              )}

              {esAdmin && (
                <>
                  <Link href="/dashboard/usuarios" className="block px-3 py-3 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700">
                    👥 Usuarios
                  </Link>
                  <Link href="/dashboard/auditoria" className="block px-3 py-3 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700">
                    📜 Auditoría
                  </Link>
                </>
              )}

              <Link href="/dashboard/perfil" className="block px-3 py-3 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700">
                ⚙️ Mi Perfil
              </Link>

              <form action={cerrarSesion}>
                <button className="w-full text-left px-3 py-3 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 cursor-pointer">
                  Salir
                </button>
              </form>
            </div>
          </details>
        </div>
      </header>

      <main className="p-4 md:p-8 max-w-5xl mx-auto">
        {suscripcion?.mensajeAviso && (
          <div
            className={`mb-5 px-4 py-3 rounded-xl border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm ${
              suscripcionBloqueada
                ? 'bg-red-50 border-red-200 text-red-900 dark:bg-red-950/40 dark:border-red-800 dark:text-red-200'
                : 'bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/30 dark:border-amber-800 dark:text-amber-200'
            }`}
          >
            <p className="font-medium">{suscripcion.mensajeAviso}</p>
            {puedeVerSuscripcion && (
              <Link
                href="/dashboard/suscripcion"
                className={`shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold text-white text-center ${
                  suscripcionBloqueada
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                {esPagoIndividual ? 'Renovar mi suscripción →' : 'Gestionar pago mensual →'}
              </Link>
            )}
          </div>
        )}

        {esModoConsultas ? (
          <ConsultasDashboard
            consultas={consultasSerializadas}
            pacientes={pacientesClinica}
            doctores={doctores}
            residencyName={residency.name}
            specialty={residency.specialty}
            puedeRegistrar={puedeRegistrar}
            suscripcionBloqueada={suscripcionBloqueada}
            consultaRecienCerrada={cerrada === '1'}
            historialActividad={historialActividadConsultas}
          />
        ) : esModoHemodialisis ? (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
              <p className="text-xs font-semibold text-cyan-700 dark:text-cyan-400">
                Unidad de Hemodiálisis · {residency.specialty}
              </p>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                {residency.name}
              </h2>
            </div>

            <HemodialisisConsultaPanel
              records={hdOutpatientSerializados}
              pacientes={pacientesClinica}
              puedeRegistrar={puedeRegistrar}
              suscripcionBloqueada={suscripcionBloqueada}
            />

            {historialActividadHemodialisis.length > 0 && (
              <details className="group bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                <summary className="list-none cursor-pointer px-4 py-3 flex items-center justify-between gap-2 hover:bg-slate-50/70 dark:hover:bg-slate-700/30 [&::-webkit-details-marker]:hidden">
                  <span className="inline-flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-100">
                    <ChevronDown className="w-4 h-4 text-slate-500 transition-transform group-open:rotate-0 -rotate-90 shrink-0" />
                    <History className="w-4 h-4 text-cyan-700 dark:text-cyan-400 shrink-0" />
                    <span>
                      Historial reciente de modificaciones · Unidad de Hemodiálisis (
                      {historialActividadHemodialisis.length})
                    </span>
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 group-open:hidden">
                    Ver registro
                  </span>
                </summary>
                <div className="border-t border-slate-200 dark:border-slate-700 max-h-72 overflow-y-auto divide-y divide-slate-200 dark:divide-slate-700 bg-slate-50/50 dark:bg-slate-900/30">
                  {historialActividadHemodialisis.map((item) => (
                    <div key={item.id} className="px-4 py-2.5 text-xs space-y-0.5">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-slate-600 dark:text-slate-300 tabular-nums">
                        <span>
                          <strong className="text-slate-900 dark:text-white">{item.actorName}</strong> (
                          {etiquetaRolClinico(item.actorRole)})
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          {new Date(item.atIso).toLocaleString('es-DO', {
                            timeZone: 'America/Santo_Domingo',
                            day: '2-digit',
                            month: '2-digit',
                            year: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="font-semibold text-slate-800 dark:text-slate-100">{item.que}</p>
                      {item.detalle && (
                        <p className="text-[11px] text-slate-600 dark:text-slate-300">{item.detalle}</p>
                      )}
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        ) : (
          <ListaPacientes
            key={vistaInicial}
            episodes={episodes}
            userId={userId}
            miEmail={emailMedico}
            doctores={doctores}
            vistaInicial={vistaInicial}
            puedeMarcarTareas={puedeRegistrar}
            puedeEditarServicio={puedeEditarServicio}
            suscripcionBloqueada={suscripcionBloqueada}
            interfaceMode={
              esModoEmergencia
                ? 'EMERGENCIA'
                : esModoHematologia
                  ? 'HEMATOLOGIA'
                  : esModoMedicinaInterna
                    ? 'MEDICINA_INTERNA'
                    : esModoOrtopedia
                      ? 'ORTOPEDIA'
                      : esModoCirugia
                        ? 'CIRUGIA'
                        : 'HOSPITALIZACION'
            }
            teamData={teamData}
            sugerenciaAutoTeam={sugerenciaAutoTeam}
            resumenCirugiaAuto={resumenCirugiaAuto}
            resumenCirugiaGuardado={resumenCirugiaGuardado}
            conteosDispositivosCirugia={conteosDispositivosCirugia}
            emergenciaGuardia={emergenciaGuardia}
            emergenciaAutoStats={emergenciaAutoStats}
            curas={curasSerializadas}
            hemodialisisItems={hemodialisisSerializados}
            biopsiasRecords={biopsiasSerializadas}
            pacientesCatalogo={pacientesClinica}
            ahoraIso={ahoraIso}
          />
        )}

        <div className="mt-10 pt-4 border-t border-slate-200/80 dark:border-slate-800">
          <LegalFooter compact />
        </div>
      </main>
    </div>
  )
}