import type { Metadata } from 'next'
import { LegalPageShell } from '@/components/LegalPageShell'

export const metadata: Metadata = {
  title: 'Términos y Condiciones | NEXO - Medical Team Workflow',
  description: 'Términos y condiciones de uso de la plataforma clínica hospitalaria NEXO.',
}

export default function TerminosPage() {
  return (
    <LegalPageShell
      titulo="Términos y Condiciones de Uso"
      subtitulo="Condiciones que regulan el acceso y uso profesional de NEXO — Medical Team Workflow por residencias médicas, servicios hospitalarios y personal clínico autorizado."
      fechaVigencia="2026-11"
      rutaActual="/terminos"
    >
      <section className="space-y-2">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          1. Naturaleza de la Plataforma y Alcance Profesional
        </h2>
        <p>
          NEXO es una herramienta tecnológica de apoyo organizativo y seguimiento clínico intrahospitalario
          destinada exclusivamente a médicos, médicos residentes, personal de enfermería, laboratorio y
          administración autorizados por cada residencia o institución de salud.
        </p>
        <p>
          NEXO no sustituye el criterio médico profesional, el examen físico ni los protocolos oficiales
          del centro hospitalario. Toda indicación terapéutica, ajuste de dosis, diagnóstico y alta médica
          es responsabilidad exclusiva del profesional de la salud debidamente habilitado que la registra.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          2. Cuentas Personales, Confidencialidad y Trazabilidad
        </h2>
        <p>
          Cada usuario accede mediante credenciales personales e intransferibles. Está estrictamente
          prohibido compartir contraseñas o permitir el uso de la sesión abierta por terceros. Toda acción
          clínica o administrativa queda registrada en el historial de auditoría inmutable con nombre, rol,
          fecha y hora del servidor.
        </p>
        <p>
          El usuario debe cambiar la contraseña temporal en su primer acceso y utilizar el cierre de sesión
          cuando abandone terminales compartidas de sala o estación de enfermería.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          3. Licenciamiento, Suscripciones y Modo de Solo Lectura
        </h2>
        <p>
          El servicio opera bajo modalidad de suscripción grupal por residencia o suscripción individual
          por usuario, según la configuración de la unidad. Al vencer el período vigente y concluir los días
          de gracia aplicables, la cuenta pasa temporalmente a modo de solo lectura para preservar la
          consulta de expedientes sin pérdida de información hasta su renovación.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          4. Propiedad Intelectual y Uso Permitido
        </h2>
        <p>
          El software, diseño de interfaz, arquitectura y marca NEXO son propiedad de su titular. La
          residencia o usuario adquiere una licencia de uso limitada, no exclusiva y no transferible. Los
          datos clínicos ingresados pertenecen a la institución o residencia responsable de su custodia.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          5. Legislación Aplicable y Aceptación
        </h2>
        <p>
          Estos términos se interpretan conforme a las leyes vigentes de la República Dominicana,
          incluyendo la Ley General de Salud núm. 42-01, la Ley núm. 126-02 sobre Comercio Electrónico,
          Documentos y Firmas Digitales, y la Ley núm. 172-13 sobre Protección de Datos Personales. La
          aceptación electrónica queda registrada con fecha, hora y datos técnicos de verificación en la
          auditoría del sistema.
        </p>
      </section>
    </LegalPageShell>
  )
}
