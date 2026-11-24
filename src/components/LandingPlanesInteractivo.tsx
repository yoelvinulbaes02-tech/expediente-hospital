'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Building2, Check, Sparkles, UserCheck } from 'lucide-react'
import { LandingContactoCorreoButton } from '@/components/LandingContactoCorreoButton'

const CICLOS = [
  { id: 'mensual', label: 'Mensual', meses: 1, tag: 'Pago mes a mes' },
  { id: 'trimestral', label: '3 meses', meses: 3, tag: 'Trimestral' },
  { id: 'semestral', label: '6 meses', meses: 6, tag: 'Semestral' },
  { id: 'anual', label: 'Anual', meses: 12, tag: '12 meses continuos' },
] as const

const PRECIO_INDIVIDUAL_MENSUAL = 4.99

export function LandingPlanesInteractivo({
  estaLogueado,
}: {
  estaLogueado: boolean
}) {
  const [cicloSeleccionado, setCicloSeleccionado] =
    useState<(typeof CICLOS)[number]['id']>('mensual')

  const cicloActual = CICLOS.find((c) => c.id === cicloSeleccionado) ?? CICLOS[0]
  const totalIndividual = (PRECIO_INDIVIDUAL_MENSUAL * cicloActual.meses).toFixed(2)

  return (
    <div className="space-y-8">
      {/* Selector de ciclo de pago */}
      <div className="flex flex-col items-center gap-3">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Elige el período de facturación que mejor se adapte a ti
        </p>
        <div
          role="tablist"
          aria-label="Ciclos de suscripción"
          className="inline-flex flex-wrap justify-center gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
        >
          {CICLOS.map((ciclo) => {
            const activo = ciclo.id === cicloSeleccionado
            return (
              <button
                key={ciclo.id}
                type="button"
                role="tab"
                aria-selected={activo}
                onClick={() => setCicloSeleccionado(ciclo.id)}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                  activo
                    ? 'bg-[#0D2344] text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-[#0D2344] dark:hover:text-white'
                }`}
              >
                {ciclo.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tarjetas de planes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* PLAN INDIVIDUAL */}
        <div className="bg-white dark:bg-slate-800 border-2 border-[#00A8B5] rounded-2xl p-6 md:p-8 shadow-lg flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-[#00A8B5]">
                <UserCheck className="w-4 h-4" />
                <span>PLAN MÉDICO INDIVIDUAL</span>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-teal-50 dark:bg-teal-900/40 text-[#00A8B5] dark:text-[#00C4D6] border border-teal-200 dark:border-teal-800 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                15 días de prueba gratis
              </span>
            </div>

            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl md:text-5xl font-black text-[#0D2344] dark:text-white tabular-nums">
                  $4.99
                </span>
                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  USD / mes
                </span>
              </div>
              <p className="text-xs font-semibold text-[#00A8B5] mt-1 tabular-nums">
                Total por {cicloActual.label.toLowerCase()}: ${totalIndividual} USD · {cicloActual.tag}
              </p>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Ideal para médicos residentes, especialistas independientes o consultorios personales que necesitan acceso ordenado desde PC, tablet o teléfono móvil.
            </p>

            <ul className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-200">
              {[
                '15 días de prueba gratuita completa al activar tu cuenta',
                'Ciclos flexibles: Mensual, 3 meses, 6 meses o Anual',
                'Suscripción automática con tarjeta/PayPal o pago único por período',
                'Acceso desde computadora y celular (hasta 2 sesiones simultáneas)',
                'Expedientes, signos vitales, pendientes, consulta externa e impresión',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-[#00A8B5] shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2.5 pt-2">
            <LandingContactoCorreoButton
              label="Solicitar prueba gratis de 15 días"
              subject={`Solicitud de prueba gratis 15 días - Plan Individual (${cicloActual.label})`}
              bodyDefault={`Hola equipo NEXO,\n\nDeseo activar mis 15 días de prueba gratis en el Plan Individual ($4.99 USD/mes · ciclo ${cicloActual.label}).`}
              showArrow
              className="w-full inline-flex items-center justify-center gap-2 bg-[#00A8B5] hover:bg-[#008f9a] text-white font-bold px-5 py-3 rounded-xl text-sm transition-colors cursor-pointer"
            />
            <Link
              href={estaLogueado ? '/dashboard/suscripcion' : '/login'}
              className="w-full inline-flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-[#0D2344] dark:text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-colors"
            >
              {estaLogueado ? 'Ir a Mi Suscripción' : 'Ya tengo cuenta · Iniciar Sesión'}
            </Link>
          </div>
        </div>

        {/* PLAN RESIDENCIAS / CLÍNICAS GRUPALES */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-400">
                <Building2 className="w-4 h-4" />
                <span>PLAN RESIDENCIAS Y SERVICIOS MÉDICOS</span>
              </div>
              <span className="px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-bold">
                Tarifa grupal escalable
              </span>
            </div>

            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl md:text-4xl font-black text-[#0D2344] dark:text-white">
                  A medida del equipo
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
                Base mensual grupal con ajuste automático según la cantidad de médicos y enfermería activos.
              </p>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Diseñado para residencias hospitalarias, departamentos completos y clínicas con múltiples médicos, residentes, enfermería y administración compartiendo turnos y expedientes.
            </p>

            <ul className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-700 text-sm text-slate-700 dark:text-slate-200">
              {[
                '15 días de evaluación institucional sin compromiso inicial',
                'Panel de administración para crear usuarios por rol (Médico, Residente, Enfermería, Lab)',
                'Módulos especializados: Nefrología/Hemodiálisis, Medicina Interna, Cirugía, Ortopedia o Consulta Externa',
                'Control anti-cuentas compartidas y registro de auditoría clínica completa',
                'Facturación grupal transparente actualizada según usuarios activos',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2.5 pt-2">
            <LandingContactoCorreoButton
              label="Solicitar demo para residencia o clínica"
              subject="Cotización Plan Residencias y Clínicas - NEXO"
              bodyDefault={'Hola equipo NEXO,\n\nSolicito una demo y cotización del Plan Residencias / Clínicas para nuestro servicio médico.'}
              showArrow
              iconClassName="w-4 h-4 text-[#00C4D6]"
              className="w-full inline-flex items-center justify-center gap-2 bg-[#0D2344] hover:bg-[#163463] text-white font-bold px-5 py-3 rounded-xl text-sm transition-colors cursor-pointer"
            />
            <p className="text-center text-xs text-slate-500 dark:text-slate-400">
              Contacto directo: <span className="font-semibold text-[#0D2344] dark:text-slate-200">nexo072208@gmail.com</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
