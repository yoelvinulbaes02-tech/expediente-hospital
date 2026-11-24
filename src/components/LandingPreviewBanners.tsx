'use client'

import { useState } from 'react'
import Image from 'next/image'
import {
  Activity,
  Bell,
  ClipboardCheck,
  CreditCard,
  Droplets,
  FileCheck2,
  Lock,
  Scissors,
  ShieldCheck,
  Stethoscope,
  UserCog,
  Users,
} from 'lucide-react'

type ModuloPreviewId = 'nefro' | 'medicina' | 'cirugia' | 'consultas'

const MODULOS_PREVIEW: Record<
  ModuloPreviewId,
  {
    servicio: string
    subtitulo: string
    tabs: string[]
    acciones: { titulo: string; detalle: string }[]
  }
> = {
  nefro: {
    servicio: 'Hospitalización y Nefrología',
    subtitulo: 'Residencia Principal · Administración y Guardia',
    tabs: ['Propios', 'Interconsultas', 'Hemodiálisis', 'Archivo'],
    acciones: [
      {
        titulo: 'Pases de Guardia y Entregas de Turno',
        detalle: 'Pendientes priorizados, verificación de alergias y entrega formal entre médicos.',
      },
      {
        titulo: 'Seguimiento de Hemodiálisis y Antibióticos',
        detalle: 'Conteo automático de dosis por intervalo (24h, 48h, 72h) y turnos pendientes.',
      },
      {
        titulo: 'Gráficas de Signos, Balance y Laboratorio',
        detalle: 'Tendencias clínicas y auditoría completa por usuario con sello temporal.',
      },
    ],
  },
  medicina: {
    servicio: 'Medicina Interna',
    subtitulo: 'Departamento Clínico · Piso y Cuidados',
    tabs: ['Propios', 'Interconsultas', 'Pendientes', 'Archivo'],
    acciones: [
      {
        titulo: 'Estratificación Clínica y Soporte O₂',
        detalle: 'Estado clínico, código de reanimación, aislamiento y soporte ventilatorio.',
      },
      {
        titulo: 'Evolución Médica Diaria (SOAP)',
        detalle: 'Notas inmutables de guardia y continuidad entre equipos tratantes.',
      },
      {
        titulo: 'Órdenes y Pendientes de Turno',
        detalle: 'Seguimiento de estudios diagnósticos y tareas pendientes sin extravíos.',
      },
    ],
  },
  cirugia: {
    servicio: 'Cirugía y Ortopedia',
    subtitulo: 'Área Quirúrgica · Piso y Curas',
    tabs: ['Propios', 'Interconsultas', 'Curas', 'Resumen Servicio'],
    acciones: [
      {
        titulo: 'Control de Curas y Frecuencias',
        detalle: 'Registro cronológico de curaciones diarias y seguimiento de evolución local.',
      },
      {
        titulo: 'Dispositivos y Drenajes Quirúrgicos',
        detalle: 'Conteo de sondas, vías centrales y control de débitos en cirugía general.',
      },
      {
        titulo: 'Resumen Estadístico del Servicio',
        detalle: 'Totales de ingresos electivos, emergencias y cirugías en tiempo real.',
      },
    ],
  },
  consultas: {
    servicio: 'Consulta Externa',
    subtitulo: 'Atención Ambulatoria · Expediente Único',
    tabs: ['Hoy', 'En espera', 'Completadas', 'Todas'],
    acciones: [
      {
        titulo: 'Coincidencia Automática de Expediente',
        detalle: 'Al ingresar el nombre completo, recupera antecedentes y alergias sin duplicar.',
      },
      {
        titulo: 'Autoría Exclusiva de Notas Clínicas',
        detalle: 'Todo el equipo consulta el expediente; solo el médico autor edita sus notas.',
      },
      {
        titulo: 'Signos Vitales, IMC y Receta Imprimible',
        detalle: 'Cierre de consulta con acceso posterior cuando el paciente regresa a control.',
      },
    ],
  },
}

export function LandingPreviewBanners() {
  const [activo, setActivo] = useState<ModuloPreviewId>('nefro')
  const vista = MODULOS_PREVIEW[activo]

  return (
    <div className="space-y-4">
      {/* Selector de vista superior */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {[
          { id: 'nefro' as const, label: 'Hospitalización / Nefrología', icon: Droplets },
          { id: 'medicina' as const, label: 'Medicina Interna', icon: Stethoscope },
          { id: 'cirugia' as const, label: 'Cirugía / Ortopedia', icon: Scissors },
          { id: 'consultas' as const, label: 'Consulta Externa', icon: ClipboardCheck },
        ].map((item) => {
          const Icon = item.icon
          const seleccionado = activo === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActivo(item.id)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold border transition-colors cursor-pointer whitespace-nowrap ${
                seleccionado
                  ? 'bg-[#0D2344] text-white border-[#0D2344]'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-[#00A8B5]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${seleccionado ? 'text-[#00C4D6]' : 'text-[#00A8B5]'}`} />
              <span>{item.label}</span>
            </button>
          )
        })}
      </div>

      {/* Marco fiel del banner superior interno de NEXO — Sin información de pacientes */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl overflow-hidden">
        {/* Barra tipo navegador */}
        <div className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600" />
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600" />
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600" />
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-1">
            <Lock className="w-3 h-3 text-[#00A8B5]" />
            <span>Vista estructural interna · Sin datos de pacientes</span>
          </div>
          <div className="text-[11px] font-semibold text-[#00A8B5] hidden sm:block">
            {vista.servicio}
          </div>
        </div>

        {/* Banner superior exacto del Dashboard NEXO */}
        <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 md:px-6 py-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Identidad izquierda */}
            <div className="flex items-center gap-3 min-w-0">
              <Image
                src="/Logo.png"
                alt="NEXO Isotipo"
                width={44}
                height={44}
                referrerPolicy="no-referrer"
                className="w-10 h-10 object-contain shrink-0"
              />
              <div className="min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-black tracking-tight text-[#0D2344] dark:text-white leading-none">
                    NE<span className="text-[#00A8B5] dark:text-[#00C4D6]">X</span>O
                  </span>
                  <span className="text-[10px] font-extrabold text-[#0D2344] dark:text-slate-300 tracking-wider uppercase">
                    MEDICAL TEAM WORKFLOW
                  </span>
                </div>
                <div className="w-28 my-1">
                  <svg
                    viewBox="0 0 160 12"
                    className="w-full h-2 text-[#00A8B5]"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M0 6 H65 L69 1 L73 11 L77 2 L81 9 L84 6 H160" />
                  </svg>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {vista.subtitulo}
                </p>
              </div>
            </div>

            {/* Botonera superior administrativa/clínica */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00A8B5] text-white text-xs font-bold">
                <CreditCard className="w-3.5 h-3.5" />
                Suscripción
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700 text-white text-xs font-bold">
                <Users className="w-3.5 h-3.5" />
                Usuarios
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0D2344] text-white text-xs font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-[#00C4D6]" />
                Auditoría
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 text-white text-xs font-bold">
                <Bell className="w-3.5 h-3.5" />
                Turnos Pendientes
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold">
                <UserCog className="w-3.5 h-3.5" />
                Mi Perfil
              </span>
            </div>
          </div>

          {/* Pestañas internas del módulo */}
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {vista.tabs.map((tab, idx) => (
                <span
                  key={tab}
                  className={`px-3.5 py-2 rounded-lg text-xs font-bold ${
                    idx === 0
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  {tab}
                </span>
              ))}
            </div>
            <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold">
              + Nuevo Registro Clínico
            </span>
          </div>
        </div>

        {/* Cuerpo estructural (sin ningún dato de paciente) */}
        <div className="p-5 md:p-6 bg-slate-50 dark:bg-slate-900/70 grid grid-cols-1 md:grid-cols-3 gap-4">
          {vista.acciones.map((bloque, idx) => (
            <div
              key={bloque.titulo}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-900/30 text-[#00A8B5]">
                  {idx === 0 ? (
                    <Activity className="w-4 h-4" />
                  ) : idx === 1 ? (
                    <FileCheck2 className="w-4 h-4" />
                  ) : (
                    <ShieldCheck className="w-4 h-4" />
                  )}
                </span>
                <span className="text-[11px] font-semibold text-slate-400">
                  Módulo activo
                </span>
              </div>
              <h3 className="text-sm font-bold text-[#0D2344] dark:text-white">
                {bloque.titulo}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {bloque.detalle}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
