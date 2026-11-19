'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

type PayPalButtonsInstance = {
  render: (container: HTMLElement) => Promise<void>
  close?: () => Promise<void>
}

type PayPalNamespace = {
  Buttons: (options: {
    style?: Record<string, string | number>
    createOrder: () => Promise<string>
    onApprove: (data: { orderID: string }) => Promise<void>
    onCancel?: () => void
    onError?: (err: unknown) => void
  }) => PayPalButtonsInstance
}

const OPCIONES_MESES = [
  { meses: 1, label: '1 mes' },
  { meses: 3, label: '3 meses' },
  { meses: 6, label: '6 meses' },
  { meses: 12, label: '12 meses' },
]

export function PagoHibridoSuscripcion({
  monthlyPriceUsd,
  residencyName,
  paypalClientId,
  paypalConfigurado,
  paypalEnv,
}: {
  monthlyPriceUsd: number
  residencyName: string
  paypalClientId: string
  paypalConfigurado: boolean
  paypalEnv: 'sandbox' | 'live'
}) {
  const router = useRouter()
  const [periodMonths, setPeriodMonths] = useState<number>(1)
  const [procesando, setProcesando] = useState(false)
  const [estadoPago, setEstadoPago] = useState<{ tipo: 'ok' | 'error' | 'info'; texto: string } | null>(null)
  const [sdkEstado, setSdkEstado] = useState<'idle' | 'loading' | 'ready'>('idle')

  const periodMonthsRef = useRef(periodMonths)
  const contenedorPayPalRef = useRef<HTMLDivElement | null>(null)

  const montoTotal = (monthlyPriceUsd * periodMonths).toFixed(2)
  const paypalHabilitado = paypalConfigurado && paypalClientId.length > 0 && monthlyPriceUsd > 0

  useEffect(() => {
    if (!paypalHabilitado) {
      return
    }

    let cancelado = false
    let instanciaBotones: PayPalButtonsInstance | null = null

    const renderizarBotones = () => {
      if (cancelado || !contenedorPayPalRef.current) return
      const win = window as unknown as { paypal?: PayPalNamespace }
      if (!win.paypal?.Buttons) {
        setEstadoPago({
          tipo: 'error',
          texto:
            'PayPal no pudo inicializar los botones. Verifica que PAYPAL_CLIENT_ID y PAYPAL_CLIENT_SECRET coincidan con el entorno configurado (live o sandbox).',
        })
        return
      }

      contenedorPayPalRef.current.innerHTML = ''
      try {
        instanciaBotones = win.paypal.Buttons({
          style: {
            layout: 'vertical',
            color: 'blue',
            shape: 'rect',
            label: 'pay',
            height: 45,
          },
          createOrder: async () => {
            setEstadoPago(null)
            const res = await fetch('/api/paypal/create-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ periodMonths: periodMonthsRef.current }),
            })
            const json = (await res.json()) as { orderID?: string; error?: string }
            if (!res.ok || !json.orderID) {
              throw new Error(json.error || 'No se pudo iniciar el pago con PayPal.')
            }
            return json.orderID
          },
          onApprove: async (data) => {
            setProcesando(true)
            setEstadoPago({ tipo: 'info', texto: 'Verificando pago y activando tu residencia...' })
            try {
              const res = await fetch('/api/paypal/capture-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderID: data.orderID }),
              })
              const json = (await res.json()) as {
                ok?: boolean
                error?: string
                periodMonths?: number
                captureRef?: string
                amountUsd?: number
              }
              if (!res.ok || !json.ok) {
                setEstadoPago({
                  tipo: 'error',
                  texto: json.error || 'El pago fue aprobado pero falló la activación automática.',
                })
                return
              }
              const refTexto = json.captureRef ? ` · Ref. ${json.captureRef}` : ''
              setEstadoPago({
                tipo: 'ok',
                texto: `Pago confirmado al instante${refTexto}. Suscripción renovada por ${json.periodMonths ?? periodMonthsRef.current} mes(es).`,
              })
              router.refresh()
            } finally {
              setProcesando(false)
            }
          },
          onCancel: () => {
            setProcesando(false)
            setEstadoPago({ tipo: 'info', texto: 'Pago cancelado. No se realizó ningún cargo.' })
          },
          onError: (err) => {
            setProcesando(false)
            const msg = err instanceof Error ? err.message : 'Ocurrió un error al procesar el pago con PayPal.'
            setEstadoPago({ tipo: 'error', texto: msg })
          },
        })

        instanciaBotones.render(contenedorPayPalRef.current).catch((err: unknown) => {
          if (cancelado) return
          const msg = err instanceof Error ? err.message : 'No se pudieron mostrar los botones de PayPal.'
          setEstadoPago({ tipo: 'error', texto: `Error PayPal: ${msg}` })
        })
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Error inicializando botones de PayPal.'
        setEstadoPago({ tipo: 'error', texto: `Error PayPal: ${msg}` })
      }
    }

    const win = window as unknown as { paypal?: PayPalNamespace }
    if (win.paypal?.Buttons) {
      queueMicrotask(() => {
        if (!cancelado) setSdkEstado('ready')
      })
      renderizarBotones()
      return () => {
        cancelado = true
        void instanciaBotones?.close?.()
      }
    }

    const scriptId = 'nexo-paypal-sdk'
    const existingScript = document.getElementById(scriptId) as HTMLScriptElement | null
    if (existingScript && existingScript.dataset.clientId !== paypalClientId) {
      existingScript.remove()
    }

    let script = document.getElementById(scriptId) as HTMLScriptElement | null
    if (script && script.dataset.sdkLoaded === 'true') {
      queueMicrotask(() => {
        if (cancelado) return
        setSdkEstado('ready')
        renderizarBotones()
      })
      return () => {
        cancelado = true
        void instanciaBotones?.close?.()
      }
    }

    queueMicrotask(() => {
      if (!cancelado) setSdkEstado('loading')
    })

    if (!script) {
      script = document.createElement('script')
      script.id = scriptId
      script.dataset.clientId = paypalClientId
      script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(
        paypalClientId
      )}&currency=USD&intent=capture`
      script.async = true
      document.body.appendChild(script)
    }

    const onLoad = () => {
      if (script) script.dataset.sdkLoaded = 'true'
      if (cancelado) return
      setSdkEstado('ready')
      renderizarBotones()
    }
    const onError = () => {
      if (cancelado) return
      setSdkEstado('idle')
      setEstadoPago({
        tipo: 'error',
        texto: 'No se pudo cargar la pasarela de PayPal / Tarjeta. Revisa tu conexión e intenta nuevamente.',
      })
    }

    script.addEventListener('load', onLoad)
    script.addEventListener('error', onError)

    return () => {
      cancelado = true
      script?.removeEventListener('load', onLoad)
      script?.removeEventListener('error', onError)
      void instanciaBotones?.close?.()
    }
  }, [paypalClientId, paypalHabilitado, router])

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Renovar Suscripción Mensual
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Pago seguro con activación inmediata vía PayPal o tarjeta de crédito y débito (Visa / Mastercard).
          </p>
        </div>

        <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800">
          💳 PayPal · Tarjeta de Crédito y Débito
        </span>
      </div>

      {/* SELECTOR DE PERÍODO */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {OPCIONES_MESES.map((op) => {
          const activo = periodMonths === op.meses
          const subtotal = (monthlyPriceUsd * op.meses).toFixed(2)
          return (
            <button
              key={op.meses}
              type="button"
              disabled={procesando}
              onClick={() => {
                periodMonthsRef.current = op.meses
                setPeriodMonths(op.meses)
              }}
              className={`p-3 rounded-lg border text-left transition-all cursor-pointer disabled:opacity-60 ${
                activo
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/30 ring-1 ring-blue-600'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/40'
              }`}
            >
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{op.label}</p>
              <p className="text-base font-extrabold text-blue-700 dark:text-blue-400 tabular-nums mt-0.5">
                ${subtotal} USD
              </p>
            </button>
          )
        })}
      </div>

      {estadoPago && (
        <div
          className={`px-4 py-3 rounded-lg border text-sm font-medium ${
            estadoPago.tipo === 'ok'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : estadoPago.tipo === 'error'
                ? 'bg-red-50 border-red-200 text-red-800'
                : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}
        >
          {estadoPago.texto}
        </div>
      )}

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-xs">
          <div>
            <p className="font-semibold text-slate-800 dark:text-slate-200">
              Total a pagar por {residencyName} ({periodMonths} {periodMonths === 1 ? 'mes' : 'meses'}):
            </p>
            <p className="text-slate-500 dark:text-slate-400">
              Activación automática al completarse el pago. Acepta cuenta PayPal y tarjetas de crédito o débito.
            </p>
          </div>
          <div className="text-right">
            <span className="text-lg font-black text-slate-900 dark:text-white tabular-nums">
              ${montoTotal} USD
            </span>
            {paypalHabilitado && (
              <span
                className={`block text-[10px] font-bold uppercase ${
                  paypalEnv === 'live' ? 'text-emerald-700' : 'text-amber-700'
                }`}
              >
                {paypalEnv === 'live' ? 'Pago en Vivo (Producción)' : 'Modo Pruebas (Sandbox)'}
              </span>
            )}
          </div>
        </div>

        {monthlyPriceUsd <= 0 ? (
          <div className="rounded-lg border border-slate-200 bg-slate-50 dark:bg-slate-900/40 dark:border-slate-700 p-4 text-xs text-slate-700 dark:text-slate-300">
            Esta residencia tiene configurada una tarifa mensual de <strong>$0 USD</strong>, por lo que no requiere cobro en línea.
          </div>
        ) : paypalHabilitado ? (
          <div className="max-w-md mx-auto pt-1">
            {sdkEstado === 'loading' && (
              <p className="text-center text-xs text-slate-500 py-4">
                Cargando pasarela segura de PayPal y Tarjetas...
              </p>
            )}
            <div ref={contenedorPayPalRef} className="min-h-14" />
          </div>
        ) : (
          <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 p-4 text-xs text-amber-900 dark:text-amber-200 space-y-1.5">
            <p className="font-bold">Pasarela de PayPal / Tarjeta pendiente de configuración</p>
            <p>
              Configura{' '}
              <code className="font-mono bg-amber-100 dark:bg-amber-900 px-1 rounded">PAYPAL_CLIENT_ID</code>,{' '}
              <code className="font-mono bg-amber-100 dark:bg-amber-900 px-1 rounded">PAYPAL_CLIENT_SECRET</code> y{' '}
              <code className="font-mono bg-amber-100 dark:bg-amber-900 px-1 rounded">PAYPAL_ENV</code> en tus variables de entorno.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
