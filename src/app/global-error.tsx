'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw, LogOut } from 'lucide-react'

export default function GlobalError({
  error,
  retry,
  reset,
}: {
  error: unknown
  retry?: () => void
  reset?: () => void
}) {
  useEffect(() => {
    console.error('[NEXO GlobalError]', error)
  }, [error])

  const handleReintentar = () => {
    if (typeof retry === 'function') {
      retry()
      return
    }
    if (typeof reset === 'function') {
      reset()
      return
    }
    window.location.reload()
  }

  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8fafc',
          fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, sans-serif',
          padding: '16px',
          color: '#0f172a',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '420px',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '28px',
            boxShadow: '0 10px 25px rgba(15, 23, 42, 0.08)',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              margin: '0 auto 16px',
              borderRadius: '9999px',
              backgroundColor: '#fef3c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#d97706',
            }}
          >
            <AlertTriangle size={24} />
          </div>

          <h2 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 700 }}>
            Se produjo un error inesperado en NEXO
          </h2>
          <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
            Si tu navegador conservaba una sesión anterior desactualizada, puedes reiniciar la sesión
            limpia con un clic sin perder los datos guardados en el servidor.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              type="button"
              onClick={handleReintentar}
              style={{
                width: '100%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '10px 16px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <RefreshCw size={16} />
              Reintentar carga
            </button>

            <form action="/api/auth/limpiar-sesion" method="POST" style={{ margin: 0 }}>
              <button
                type="submit"
                style={{
                  width: '100%',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  backgroundColor: '#f1f5f9',
                  color: '#0f172a',
                  border: '1px solid #cbd5e1',
                  borderRadius: '12px',
                  padding: '10px 16px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <LogOut size={16} />
                Reiniciar sesión limpia
              </button>
            </form>
          </div>
        </div>
      </body>
    </html>
  )
}
