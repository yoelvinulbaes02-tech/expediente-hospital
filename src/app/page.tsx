import Image from 'next/image'
import Link from 'next/link'
import { obtenerSesionSegura } from '@/auth'
import { LegalFooter } from '@/components/LegalFooter'
import { LandingPreviewBanners } from '@/components/LandingPreviewBanners'
import { LandingPlanesInteractivo } from '@/components/LandingPlanesInteractivo'
import { LandingContactoCorreoButton } from '@/components/LandingContactoCorreoButton'
import { ThemeToggle } from '@/components/ThemeToggle'
import {
  Activity,
  ArrowRight,
  Bone,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Droplets,
  FileText,
  HeartPulse,
  Home,
  Lock,
  Scissors,
  ShieldCheck,
  Smartphone,
  Stethoscope,
  Users,
} from 'lucide-react'

const APP_URL = (process.env.NEXT_PUBLIC_APP_URL || 'https://expediente-hospital.vercel.app').replace(/\/+$/, '')

const PROBLEMAS_RESUELTOS = [
  {
    icon: Clock,
    titulo: 'Adiós a los pases de guardia incompletos',
    descripcion:
      'Deja atrás libretas sueltas o mensajes perdidos en chats. Cada paciente mantiene sus pendientes, alergias, laboratorios y entrega formal de turno en un solo lugar.',
  },
  {
    icon: HeartPulse,
    titulo: 'Seguimiento clínico continuo entre turnos',
    descripcion:
      'Visualiza curvas de signos vitales, balance hídrico, antibioticoterapia por intervalos (24h, 48h, 72h) y evolución diaria sin perder el hilo entre guardias.',
  },
  {
    icon: ShieldCheck,
    titulo: 'Trazabilidad y respaldo médico-legal',
    descripcion:
      'Cada nota clínica, orden médica o cierre de expediente queda auditado con usuario, rol y marca temporal, protegiendo al médico y al servicio hospitalario.',
  },
  {
    icon: Smartphone,
    titulo: 'Acceso ágil desde piso o consultorio',
    descripcion:
      'Funciona en computadora, tablet y celular para pasar visita en sala, revisar interconsultas o atender consulta externa con la información siempre disponible.',
  },
]

const PASOS_FUNCIONAMIENTO = [
  {
    numero: '01',
    titulo: 'Activa tu cuenta o residencia',
    descripcion:
      'Comienza con 15 días de prueba gratis en modalidad individual ($4.99 USD/mes) o habilita un servicio completo para tu equipo médico y de enfermería.',
  },
  {
    numero: '02',
    titulo: 'Elige la interfaz de tu especialidad',
    descripcion:
      'Configura tu espacio en segundos: Hospitalización y Nefrología, Medicina Interna, Cirugía, Ortopedia o Consulta Externa ambulatoria.',
  },
  {
    numero: '03',
    titulo: 'Registra, entrega turno y haz seguimiento',
    descripcion:
      'Lleva el control diario de pacientes, pendientes, curas, dosis de antibióticos, signos vitales y consultas recurrentes con auditoría en tiempo real.',
  },
]

const ESPECIALIDADES = [
  {
    icon: Droplets,
    nombre: 'Hospitalización y Nefrología',
    descripcion:
      'Control de sala, interconsultas, agenda de hemodiálisis crónica y de emergencia, accesos vasculares y conteo automático de antibióticos por frecuencia.',
  },
  {
    icon: Stethoscope,
    nombre: 'Medicina Interna',
    descripcion:
      'Clasificación de estado clínico, código de reanimación, aislamiento, soporte respiratorio, notas de evolución e interconsultas del servicio.',
  },
  {
    icon: Scissors,
    nombre: 'Cirugía General',
    descripcion:
      'Control de drenajes quirúrgicos, curas programadas, estadísticas de ingresos electivos vs. emergencias y seguimiento postoperatorio en sala.',
  },
  {
    icon: Bone,
    nombre: 'Ortopedia y Traumatología',
    descripcion:
      'Seguimiento de extremidades intervenidas, estado neurovascular, alerta compartimental, plan de carga y control ordenado de curas.',
  },
  {
    icon: ClipboardCheck,
    nombre: 'Consulta Externa',
    descripcion:
      'Coincidencia automática de pacientes que regresan para heredar antecedentes y alergias, y bloqueo de edición exclusivo para el médico autor de cada nota.',
  },
  {
    icon: FileText,
    nombre: 'Auditoría, Turnos e Impresión',
    descripcion:
      'Bitácora auditable de acciones, alertas de entrega de turno, gráficas clínicas y generación lista para imprimir resúmenes y recetas médicas.',
  },
]

export default async function HomePage() {
  let estaLogueado = false
  try {
    const session = await obtenerSesionSegura()
    estaLogueado = Boolean(session?.user?.id)
  } catch {
    estaLogueado = false
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'NEXO - Medical Team Workflow',
    applicationCategory: 'MedicalApplication',
    operatingSystem: 'Web',
    url: APP_URL,
    description:
      'Sistema de gestión de guardia hospitalaria, seguimiento clínico por especialidades y consulta externa para médicos, residentes y equipos de salud.',
    offers: {
      '@type': 'Offer',
      price: '4.99',
      priceCurrency: 'USD',
      description: 'Plan Individual mensual con 15 días de prueba gratis. Ciclos de 1, 3, 6 y 12 meses.',
    },
    publisher: {
      '@type': 'Organization',
      name: 'NEXO Medical Team Workflow',
      email: 'nexo072208@gmail.com',
      url: APP_URL,
    },
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* BARRA DE NAVEGACIÓN PRINCIPAL (3 ZONAS LIMPIAS) */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <Image
              src="/Logo.png"
              alt="Logo NEXO Medical Team Workflow"
              width={40}
              height={40}
              priority
              referrerPolicy="no-referrer"
              className="w-9 h-9 object-contain"
            />
            <div>
              <span className="text-xl font-black tracking-tight text-[#0D2344] dark:text-white leading-none block">
                NE<span className="text-[#00A8B5] dark:text-[#00C4D6]">X</span>O
              </span>
              <span className="text-[9px] font-extrabold tracking-widest uppercase text-slate-500 dark:text-slate-400 block">
                MEDICAL TEAM WORKFLOW
              </span>
            </div>
          </Link>

          <nav
            aria-label="Navegación principal"
            className="hidden md:flex items-center gap-5 text-sm font-semibold text-slate-600 dark:text-slate-300"
          >
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-[#0D2344] dark:text-white hover:text-[#00A8B5] transition-colors whitespace-nowrap shrink-0"
            >
              <Home className="w-3.5 h-3.5 text-[#00A8B5]" />
              <span>Inicio</span>
            </Link>
            <a href="#problemas" className="hover:text-[#00A8B5] transition-colors whitespace-nowrap shrink-0">
              Qué resuelve
            </a>
            <a href="#vista-interna" className="hover:text-[#00A8B5] transition-colors whitespace-nowrap shrink-0">
              Vista previa
            </a>
            <a href="#como-funciona" className="hover:text-[#00A8B5] transition-colors whitespace-nowrap shrink-0">
              Cómo funciona
            </a>
            <a href="#especialidades" className="hover:text-[#00A8B5] transition-colors whitespace-nowrap shrink-0">
              Especialidades
            </a>
            <a href="#planes" className="hover:text-[#00A8B5] transition-colors whitespace-nowrap shrink-0">
              Planes
            </a>
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/"
              className="md:hidden inline-flex items-center gap-1 px-2.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-[#0D2344] dark:text-white hover:border-[#00A8B5] whitespace-nowrap shrink-0"
            >
              <Home className="w-3.5 h-3.5 text-[#00A8B5]" />
              <span>Inicio</span>
            </Link>
            <ThemeToggle />
            <Link
              href={estaLogueado ? '/dashboard' : '/login'}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0D2344] hover:bg-[#163463] text-white text-xs md:text-sm font-bold transition-colors whitespace-nowrap shrink-0"
            >
              <span>{estaLogueado ? 'Ir al Dashboard' : 'Iniciar Sesión'}</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#00C4D6]" />
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* HERO SECTION */}
        <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 border-b border-slate-100 dark:border-slate-800">
          <div className="max-w-6xl mx-auto px-4 md:px-8 pt-12 pb-16 md:pt-20 md:pb-24">
            <div className="max-w-3xl mx-auto text-center space-y-5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-[#00A8B5] dark:text-[#00C4D6] text-xs font-bold">
                <Activity className="w-3.5 h-3.5" />
                <span>15 días de prueba gratis · Plan Individual desde $4.99 USD/mes</span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-[#0D2344] dark:text-white leading-[1.08]">
                Orden clínico real para tu{' '}
                <span className="text-[#00A8B5] dark:text-[#00C4D6]">guardia</span> y{' '}
                <span className="text-blue-700 dark:text-blue-400">consulta médica</span>
              </h1>

              {/* Línea ECG característica de NEXO */}
              <div className="w-48 mx-auto">
                <svg
                  viewBox="0 0 160 12"
                  className="w-full h-3 text-[#00A8B5]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M0 6 H65 L69 1 L73 11 L77 2 L81 9 L84 6 H160" />
                </svg>
              </div>

              <p className="text-base md:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
                <strong>NEXO Medical Team Workflow</strong> conecta a médicos, residentes y equipos hospitalarios en una plataforma ágil para pases de guardia, seguimiento en sala, hemodiálisis, cirugía, ortopedia y consulta externa.
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <a
                  href="#planes"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#00A8B5] hover:bg-[#008f9a] text-white text-sm font-bold shadow-sm transition-colors"
                >
                  <span>Probar 15 días gratis</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
                <Link
                  href={estaLogueado ? '/dashboard' : '/login'}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-[#0D2344] dark:text-white border border-slate-300 dark:border-slate-700 text-sm font-bold transition-colors"
                >
                  <Lock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>{estaLogueado ? 'Abrir mi espacio clínico' : 'Acceso para personal registrado'}</span>
                </Link>
              </div>

              <div className="pt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#00A8B5]" />
                  Cero información de pacientes expuesta públicamente
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#00A8B5]" />
                  Auditoría médica y control de sesiones
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#00A8B5]" />
                  Soporte directo: nexo072208@gmail.com
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* VISTA PREVIA INTERNA (SOLO BANNER Y ESTRUCTURA SIN DATOS DE PACIENTES) */}
        <section id="vista-interna" className="py-16 md:py-20 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-6xl mx-auto px-4 md:px-8 space-y-8">
            <div className="max-w-2xl mx-auto text-center space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-[#00A8B5]">
                Interfaz por especialidad
              </p>
              <h2 className="text-2xl md:text-3xl font-black text-[#0D2344] dark:text-white">
                Conoce la barra superior y navegación interna de NEXO
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Cada servicio adapta sus pestañas y herramientas operativas manteniendo privacidad total: esta vista muestra únicamente la estructura superior sin información de pacientes.
              </p>
            </div>

            <LandingPreviewBanners />
          </div>
        </section>

        {/* QUÉ PROBLEMAS RESUELVE */}
        <section id="problemas" className="py-16 md:py-20 bg-white dark:bg-slate-900">
          <div className="max-w-6xl mx-auto px-4 md:px-8 space-y-10">
            <div className="max-w-2xl space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                Diseñado desde la práctica hospitalaria
              </p>
              <h2 className="text-2xl md:text-3xl font-black text-[#0D2344] dark:text-white">
                Qué problemas resuelve en tu día a día médico
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Menos fricción administrativa durante la guardia, mejor continuidad asistencial y expedientes claros cuando el paciente regresa.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {PROBLEMAS_RESUELTOS.map((item) => {
                const Icon = item.icon
                return (
                  <div
                    key={item.titulo}
                    className="p-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/70 space-y-3"
                  >
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[#00A8B5]">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-[#0D2344] dark:text-white">
                      {item.titulo}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {item.descripcion}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* CÓMO FUNCIONA */}
        <section id="como-funciona" className="py-16 md:py-20 bg-[#0D2344] text-white">
          <div className="max-w-6xl mx-auto px-4 md:px-8 space-y-10">
            <div className="max-w-2xl space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-[#00C4D6]">
                Flujo simple en 3 pasos
              </p>
              <h2 className="text-2xl md:text-3xl font-black">
                Cómo funciona NEXO en tu equipo o consultorio
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {PASOS_FUNCIONAMIENTO.map((paso) => (
                <div
                  key={paso.numero}
                  className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-3"
                >
                  <span className="inline-block text-2xl font-black text-[#00C4D6] tabular-nums">
                    {paso.numero}
                  </span>
                  <h3 className="text-lg font-bold text-white">{paso.titulo}</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {paso.descripcion}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* MÓDULOS Y ESPECIALIDADES */}
        <section id="especialidades" className="py-16 md:py-20 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
          <div className="max-w-6xl mx-auto px-4 md:px-8 space-y-10">
            <div className="max-w-2xl mx-auto text-center space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-[#00A8B5]">
                Especialidades y herramientas incluidas
              </p>
              <h2 className="text-2xl md:text-3xl font-black text-[#0D2344] dark:text-white">
                Un flujo clínico pensado para cada área médica
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {ESPECIALIDADES.map((esp) => {
                const Icon = esp.icon
                return (
                  <div
                    key={esp.nombre}
                    className="p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3"
                  >
                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-900/30 text-[#00A8B5]">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-[#0D2344] dark:text-white">
                      {esp.nombre}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {esp.descripcion}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* PLANES Y PRECIOS */}
        <section id="planes" className="py-16 md:py-20 bg-white dark:bg-slate-900">
          <div className="max-w-6xl mx-auto px-4 md:px-8 space-y-10">
            <div className="max-w-2xl mx-auto text-center space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-[#00A8B5]">
                Planes transparentes · 15 días de prueba gratis
              </p>
              <h2 className="text-2xl md:text-3xl font-black text-[#0D2344] dark:text-white">
                Comienza individual por $4.99/mes o equipa a toda tu residencia
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Elige pagos mensuales, cada 3 meses, cada 6 meses o anuales con tarjeta de crédito/débito o PayPal.
              </p>
            </div>

            <LandingPlanesInteractivo estaLogueado={estaLogueado} />
          </div>
        </section>

        {/* CONTACTO DIRECTO */}
        <section className="py-14 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-800">
          <div className="max-w-4xl mx-auto px-4 md:px-8">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-2 text-xs font-bold text-[#00A8B5]">
                  <Users className="w-4 h-4" />
                  <span>ATENCIÓN Y ACTIVACIÓN INMEDIATA</span>
                </div>
                <h2 className="text-xl md:text-2xl font-black text-[#0D2344] dark:text-white">
                  ¿Listo para activar tus 15 días gratis?
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Escríbenos para habilitar tu usuario individual o configurar tu servicio hospitalario y equipo médico.
                </p>
              </div>
              <LandingContactoCorreoButton
                label="nexo072208@gmail.com"
                subject="Activación NEXO - Prueba gratis 15 días"
                bodyDefault={'Hola equipo NEXO,\n\nEstoy listo para activar mis 15 días de prueba gratis.'}
                iconClassName="w-4 h-4 text-[#00C4D6]"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#0D2344] hover:bg-[#163463] text-white text-sm font-bold shrink-0 transition-colors cursor-pointer"
              />
            </div>
          </div>
        </section>
      </main>

      <LegalFooter />
    </div>
  )
}