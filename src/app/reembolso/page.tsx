import type { Metadata } from 'next'
import { LegalPageShell } from '@/components/LegalPageShell'

export const metadata: Metadata = {
  title: 'Política de Reembolso y Cancelación | NEXO - Medical Team Workflow',
  description: 'Condiciones de cancelación, pagos y reembolsos de suscripciones en NEXO.',
}

export default function ReembolsoPage() {
  return (
    <LegalPageShell
      titulo="Política de Reembolso y Cancelación"
      subtitulo="Reglas claras para renovaciones grupales e individuales, cancelaciones y solicitudes de reembolso."
      fechaVigencia="2026-11"
      rutaActual="/reembolso"
    >
      <section className="space-y-2">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          1. Modalidad de Cobro sin Renovación Oculta
        </h2>
        <p>
          Los pagos realizados en NEXO mediante PayPal o tarjeta de crédito/débito corresponden al período
          seleccionado expresamente por el usuario o administrador (1, 3, 6 o 12 meses) y activan de
          inmediato el acceso correspondiente. No aplicamos cargos automáticos ocultos sin autorización del
          titular.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          2. Cancelación en Cualquier Momento
        </h2>
        <p>
          Puedes dejar de renovar tu suscripción al finalizar el período ya pagado sin penalidades ni cargos
          de cancelación. Al vencer el período, los expedientes se conservan íntegros en modo de solo
          lectura para garantizar la continuidad de la consulta clínica.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          3. Casos Elegibles para Reembolso
        </h2>
        <p>Se otorgará reembolso íntegro cuando ocurra cualquiera de las siguientes situaciones:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Cobro duplicado o error técnico de acreditación:</strong> si se procesó más de un pago
            por el mismo período o la cuenta no recibió la activación correspondiente.
          </li>
          <li>
            <strong>Solicitud dentro de los primeros 7 días calendario:</strong> para suscripciones recién
            adquiridas en las que se reporte indisponibilidad técnica imputable a la plataforma no resuelta
            en 48 horas hábiles.
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          4. Cómo Solicitar un Reembolso
        </h2>
        <p>
          Conserva la referencia de transacción de PayPal o el número de orden visible en el historial de
          tu sección <strong>Suscripción</strong> y comunícalo a través del administrador de plataforma o
          canal de soporte oficial de NEXO. Las devoluciones aprobadas se procesan hacia el mismo método de
          pago original dentro de 5 a 10 días hábiles según los tiempos de PayPal y la entidad emisora de
          la tarjeta.
        </p>
      </section>
    </LegalPageShell>
  )
}
