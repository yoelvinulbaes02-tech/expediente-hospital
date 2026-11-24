'use client'

import { useState } from 'react'
import { Check, Copy, ExternalLink, Mail, X } from 'lucide-react'

const EMAIL_SOPORTE = 'nexo072208@gmail.com'

export function LandingContactoCorreoButton({
  subject,
  bodyDefault,
  label,
  className,
  showArrow = false,
  iconClassName = 'w-4 h-4',
}: {
  subject: string
  bodyDefault: string
  label: string
  className: string
  showArrow?: boolean
  iconClassName?: string
}) {
  const [abierto, setAbierto] = useState(false)
  const [nombre, setNombre] = useState('')
  const [servicio, setServicio] = useState('')
  const [copiado, setCopiado] = useState(false)

  const cuerpoFinal = [
    bodyDefault,
    nombre.trim() ? `Nombre / Médico: ${nombre.trim()}` : null,
    servicio.trim() ? `Residencia / Especialidad: ${servicio.trim()}` : null,
  ]
    .filter(Boolean)
    .join('\n')

  const subjectEnc = encodeURIComponent(subject)
  const bodyEnc = encodeURIComponent(cuerpoFinal)

  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${EMAIL_SOPORTE}&su=${subjectEnc}&body=${bodyEnc}`
  const outlookUrl = `https://outlook.live.com/mail/0/deeplink/compose?to=${EMAIL_SOPORTE}&subject=${subjectEnc}&body=${bodyEnc}`
  const mailtoUrl = `mailto:${EMAIL_SOPORTE}?subject=${subjectEnc}&body=${bodyEnc}`

  const copiarCorreo = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL_SOPORTE)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2500)
    } catch {
      setCopiado(false)
    }
  }

  return (
    <>
      <button type="button" onClick={() => setAbierto(true)} className={className}>
        <Mail className={iconClassName} />
        <span>{label}</span>
        {showArrow && <span aria-hidden="true">→</span>}
      </button>

      {abierto && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-contacto-nexo-titulo"
          onClick={() => setAbierto(false)}
        >
          <div
            className="w-full max-w-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl p-6 space-y-4 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-slate-200 dark:border-slate-700 pb-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#00A8B5]">
                  Redirección a tu correo
                </p>
                <h3
                  id="modal-contacto-nexo-titulo"
                  className="text-lg font-black text-[#0D2344] dark:text-white"
                >
                  {label}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAbierto(false)}
                aria-label="Cerrar ventana"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tu nombre (opcional)
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Dr. Carlos Ramírez"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#00A8B5]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Especialidad o residencia (opcional)
                </label>
                <input
                  type="text"
                  value={servicio}
                  onChange={(e) => setServicio(e.target.value)}
                  placeholder="Ej. Nefrología / Consulta Externa"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-[#00A8B5]"
                />
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <a
                href={gmailUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#00A8B5] hover:bg-[#008f9a] text-white text-sm font-bold transition-colors"
              >
                <span>Abrir y redactar en Gmail</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <a
                href={outlookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#0D2344] hover:bg-[#163463] text-white text-sm font-bold transition-colors"
              >
                <span>Abrir en Outlook / Hotmail Web</span>
                <ExternalLink className="w-4 h-4 text-[#00C4D6]" />
              </a>

              <a
                href={mailtoUrl}
                className="w-full inline-flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-[#0D2344] dark:text-white text-sm font-bold transition-colors"
              >
                <span>Abrir app de correo del dispositivo</span>
                <Mail className="w-4 h-4 text-[#00A8B5]" />
              </a>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2 text-xs">
              <span className="text-slate-500 dark:text-slate-400 truncate">
                Correo: <strong className="text-slate-800 dark:text-slate-200">{EMAIL_SOPORTE}</strong>
              </span>
              <button
                type="button"
                onClick={copiarCorreo}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 font-semibold cursor-pointer shrink-0"
              >
                {copiado ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar correo</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
