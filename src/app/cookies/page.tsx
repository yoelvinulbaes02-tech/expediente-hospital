import type { Metadata } from 'next'
import { LegalPageShell } from '@/components/LegalPageShell'

export const metadata: Metadata = {
  title: 'Política de Cookies | NEXO - Medical Team Workflow',
  description: 'Uso transparente de cookies técnicas esenciales y almacenamiento local en NEXO.',
}

export default function CookiesPage() {
  return (
    <LegalPageShell
      titulo="Política de Cookies y Almacenamiento Local"
      subtitulo="Información clara sobre las cookies estrictamente necesarias que utiliza NEXO para mantener la seguridad clínica."
      fechaVigencia="2026-11"
      rutaActual="/cookies"
    >
      <section className="space-y-2">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          1. Solo Cookies Técnicas Estrictamente Necesarias
        </h2>
        <p>
          NEXO utiliza <strong>exclusivamente cookies técnicas esenciales</strong> indispensables para la
          autenticación segura, la protección contra falsificación de solicitudes (CSRF) y el aislamiento de
          la sesión de cada profesional.
        </p>
        <p>
          <strong>No utilizamos cookies publicitarias, de perfilado comercial, redes sociales ni
          analítica de seguimiento entre sitios.</strong>
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          2. Detalle de Cookies y Almacenamiento Utilizados
        </h2>
        <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-xl">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
              <tr>
                <th className="px-4 py-2.5 font-bold">Elemento</th>
                <th className="px-4 py-2.5 font-bold">Tipo</th>
                <th className="px-4 py-2.5 font-bold">Finalidad</th>
                <th className="px-4 py-2.5 font-bold">Duración</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              <tr>
                <td className="px-4 py-2.5 font-mono">authjs.session-token</td>
                <td className="px-4 py-2.5">Cookie HttpOnly esencial</td>
                <td className="px-4 py-2.5">Mantener la sesión cifrada del profesional</td>
                <td className="px-4 py-2.5">Máximo 12 horas (o al cerrar sesión)</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-mono">authjs.csrf-token</td>
                <td className="px-4 py-2.5">Cookie HttpOnly esencial</td>
                <td className="px-4 py-2.5">Proteger envíos de formularios contra ataques CSRF</td>
                <td className="px-4 py-2.5">Sesión</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-mono">theme / nexo_hd_*</td>
                <td className="px-4 py-2.5">Almacenamiento local</td>
                <td className="px-4 py-2.5">Recordar modo claro/oscuro y paneles retraíbles</td>
                <td className="px-4 py-2.5">Preferencia local del navegador</td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-mono">draft_*</td>
                <td className="px-4 py-2.5">Borrador temporal</td>
                <td className="px-4 py-2.5">Evitar pérdida accidental de texto mientras escribes</td>
                <td className="px-4 py-2.5">Se elimina al cerrar sesión o por inactividad</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          3. Pasarela de Pago (PayPal)
        </h2>
        <p>
          Al abrir únicamente la sección de pagos en Suscripción, el SDK oficial de PayPal puede cargar
          cookies técnicas propias estrictamente necesarias para prevención de fraude y procesamiento
          seguro de la transacción financiera.
        </p>
      </section>
    </LegalPageShell>
  )
}
