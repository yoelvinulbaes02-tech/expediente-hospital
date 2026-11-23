import type { Metadata } from 'next'
import { LegalPageShell } from '@/components/LegalPageShell'

export const metadata: Metadata = {
  title: 'Política de Privacidad | NEXO - Medical Team Workflow',
  description: 'Política de privacidad y tratamiento de datos personales y clínicos en NEXO.',
}

export default function PrivacidadPage() {
  return (
    <LegalPageShell
      titulo="Política de Privacidad y Protección de Datos"
      subtitulo="Cómo recopilamos, protegemos y limitamos el tratamiento de datos personales y clínicos en cumplimiento de la Ley núm. 172-13."
      fechaVigencia="2026-11"
      rutaActual="/privacidad"
    >
      <section className="space-y-2">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          1. Principio de Minimización de Datos
        </h2>
        <p>
          NEXO solicita exclusivamente los datos estrictamente necesarios para operar el flujo clínico y
          controlar la seguridad del acceso:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            <strong>Del personal autorizado:</strong> nombre completo, correo electrónico institucional o de
            acceso, rol clínico y residencia asignada.
          </li>
          <li>
            <strong>De los pacientes y episodios:</strong> únicamente la información de identificación y
            seguimiento clínico que el equipo médico necesita para la continuidad asistencial durante el
            internamiento o consulta.
          </li>
          <li>
            <strong>De facturación:</strong> los pagos en línea se procesan directamente a través de
            PayPal; NEXO no almacena números completos de tarjetas de crédito o débito ni códigos CVV.
          </li>
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          2. Roles sobre los Datos (Responsable y Encargado)
        </h2>
        <p>
          Cada residencia o centro clínico actúa como responsable de la custodia legal y consentimiento de
          los datos de sus pacientes. NEXO actúa como plataforma encargada del alojamiento seguro,
          aislamiento estricto por residencia (multi-tenant) y trazabilidad de accesos.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          3. Seguridad, Cifrado y Auditoría Inmutable
        </h2>
        <p>
          Todas las comunicaciones viajan cifradas mediante HTTPS/TLS, las contraseñas se almacenan
          mediante hash criptográfico irreversible (bcrypt) y la sesión cuenta con cierre automático por
          inactividad de 15 minutos para proteger terminales hospitalarias compartidas. Las acciones de
          lectura/escritura relevantes y aceptaciones legales quedan encadenadas mediante hash SHA-256 en
          el registro de auditoría.
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          4. Derechos de Acceso, Rectificación, Cancelación y Oposición (ARCO)
        </h2>
        <p>
          Conforme a la Ley núm. 172-13 sobre Protección de Datos Personales de la República Dominicana,
          los usuarios pueden solicitar acceso, actualización o rectificación de sus datos de cuenta a
          través de la administración de su residencia o del soporte técnico de la plataforma, respetando
          los plazos legales de conservación aplicables al historial clínico y registros de auditoría.
        </p>
      </section>
    </LegalPageShell>
  )
}
