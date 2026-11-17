'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { solicitarPagoMensual } from '@/app/dashboard/suscripcion/actions'

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

type DatosBanco = {
  bankName: string
  bankAccount: string
  bankHolder: string
  bankId: string
  whatsapp: string
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
  paypalEnv,
  datosBanco,
}: {
  monthlyPriceUsd: number
  residencyName: string
  paypalClientId: string
  paypalEnv: 'sandbox' | 'live'
  datosBanco: DatosBanco
}) {
  const router = useRouter()
  const [metodoTab, setMetodoTab] = useState<'online' | 'transferencia'>('online')
  const [periodMonths, setPeriodMonths] = useState<number>(1)
  const [estadoPago, setEstadoPago] = useState<{ tipo: 'ok' | 'error' | 'info'; texto: string } | null>(null)
  const [sdkEstado, setSdkEstado] = useState<'idle' | 'loading' | 'ready'>('idle')

  const periodMonthsRef = useRef(periodMonths)
  const contenedorPayPalRef = useRef<HTMLDivElement | null>(null)

  const montoTotal = (monthlyPriceUsd * periodMonths).toFixed(2)
  const paypalHabilitado = paypalClientId.length > 0 && monthlyPriceUsd > 0

  useEffect(() => {
    if (metodoTab !== 'online' || !paypalHabilitado) {
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
            'PayPal no pudo inicializar los botones. Verifica que PAYPAL_CLIENT_ID en .env.local sea el copiado con ❐ (sin errores de letra) y reinicia npm run dev.',
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
            setEstadoPago({ tipo: 'info', texto: 'Verificando pago y activando tu residencia...' })
            const res = await fetch('/api/paypal/capture-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ orderID: data.orderID }),
            })
            const json = (await res.json()) as { ok?: boolean; error?: string; periodMonths?: number }
            if (!res.ok || !json.ok) {
              setEstadoPago({
                tipo: 'error',
                texto: json.error || 'El pago fue aprobado pero falló la activación automática.',
              })
              return
            }
            setEstadoPago({
              tipo: 'ok',
              texto: `Pago confirmado al instante. Suscripción renovada por ${json.periodMonths ?? periodMonthsRef.current} mes(es).`,
            })
            router.refresh()
          },
          onCancel: () => {
            setEstadoPago({ tipo: 'info', texto: 'Pago cancelado. No se realizó ningún cargo.' })
          },
          onError: (err) => {
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
        texto: 'No se pudo cargar el módulo de PayPal. Revisa tu conexión o usa Transferencia Bancaria.',
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
  }, [metodoTab, paypalClientId, paypalHabilitado, router])

  const tieneDatosBanco = Boolean(datosBanco.bankName || datosBanco.bankAccount)

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Renovar Suscripción Mensual
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Elige pago automático con PayPal / Tarjeta o registra una transferencia bancaria institucional.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => {
              setMetodoTab('online')
              setEstadoPago(null)
            }}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer ${
              metodoTab === 'online'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            💳 PayPal / Tarjeta
          </button>
          <button
            type="button"
            onClick={() => {
              setMetodoTab('transferencia')
              setEstadoPago(null)
            }}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer ${
              metodoTab === 'transferencia'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            🏦 Transferencia Bancaria
          </button>
        </div>
      </div>

      {/* SELECTOR COMPARTIDO DE PERÍODO */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {OPCIONES_MESES.map((op) => {
          const activo = periodMonths === op.meses
          const subtotal = monthlyPriceUsd * op.meses
          return (
            <button
              key={op.meses}
              type="button"
              onClick={() => {
                periodMonthsRef.current = op.meses
                setPeriodMonths(op.meses)
              }}
              className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
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

      {metodoTab === 'online' ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-xs">
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                Total a pagar por {residencyName} ({periodMonths} {periodMonths === 1 ? 'mes' : 'meses'}):
              </p>
              <p className="text-slate-500 dark:text-slate-400">
                Activación inmediata automática al completarse el pago. Acepta cuenta PayPal y tarjetas Visa/Mastercard.
              </p>
            </div>
            <div className="text-right">
              <span className="text-lg font-black text-slate-900 dark:text-white tabular-nums">
                ${montoTotal} USD
              </span>
              {paypalEnv === 'sandbox' && paypalHabilitado && (
                <span className="block text-[10px] font-bold text-amber-700 uppercase">
                  Modo Pruebas (Sandbox)
                </span>
              )}
            </div>
          </div>

          {paypalHabilitado ? (
            <div className="max-w-md mx-auto pt-1">
              {sdkEstado === 'loading' && (
                <p className="text-center text-xs text-slate-500 py-4">
                  Cargando pasarela segura de PayPal / Tarjeta...
                </p>
              )}
              <div ref={contenedorPayPalRef} className="min-h-14" />
            </div>
          ) : (
            <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 p-4 text-xs text-amber-900 dark:text-amber-200 space-y-1.5">
              <p className="font-bold">Pago en línea pendiente de configuración de llaves</p>
              <p>
                Para activar el botón de PayPal y Tarjetas en esta pantalla, configura{' '}
                <code className="font-mono bg-amber-100 dark:bg-amber-900 px-1 rounded">PAYPAL_CLIENT_ID</code> y{' '}
                <code className="font-mono bg-amber-100 dark:bg-amber-900 px-1 rounded">PAYPAL_CLIENT_SECRET</code> en tus variables de entorno.
              </p>
              <p>
                Mientras tanto, puedes usar la pestaña{' '}
                <button
                  type="button"
                  onClick={() => setMetodoTab('transferencia')}
                  className="underline font-bold cursor-pointer"
                >
                  Transferencia Bancaria
                </button>
                .
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg p-4 text-xs space-y-1.5">
            <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">
              Datos para Transferencia / Pago Institucional
            </p>
            {tieneDatosBanco ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-slate-700 dark:text-slate-300">
                {datosBanco.bankName && (
                  <p>
                    <strong>Banco:</strong> {datosBanco.bankName}
                  </p>
                )}
                {datosBanco.bankAccount && (
                  <p>
                    <strong>Cuenta:</strong> <span className="font-mono">{datosBanco.bankAccount}</span>
                  </p>
                )}
                {datosBanco.bankHolder && (
                  <p>
                    <strong>Titular:</strong> {datosBanco.bankHolder}
                  </p>
                )}
                {datosBanco.bankId && (
                  <p>
                    <strong>RNC / Cédula:</strong> {datosBanco.bankId}
                  </p>
                )}
                {datosBanco.whatsapp && (
                  <p className="sm:col-span-2">
                    <strong>Soporte / Comprobantes:</strong> {datosBanco.whatsapp}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-slate-500 dark:text-slate-400">
                Realiza la transferencia por <strong>${montoTotal} USD</strong> al administrador de la plataforma y registra aquí debajo el número de referencia para validarlo.
              </p>
            )}
          </div>

          <form action={solicitarPagoMensual} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="hidden" name="periodMonths" value={periodMonths} />

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Método de pago
              </label>
              <select
                name="method"
                defaultValue="transferencia"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              >
                <option value="transferencia">Transferencia bancaria</option>
                <option value="institucional">Facturación institucional / Hospital</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Número de referencia o comprobante *
              </label>
              <input
                name="reference"
                required
                placeholder="Ej. TRF-884920 o último 4 dígitos"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nota adicional (opcional)
              </label>
              <input
                name="notes"
                placeholder="Ej. Transferencia realizada desde Banco Popular"
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>

            <div className="md:col-span-2 flex items-center justify-between gap-3">
              <p className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                Total reportado: <strong>${montoTotal} USD</strong> ({periodMonths}{' '}
                {periodMonths === 1 ? 'mes' : 'meses'})
              </p>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-sm font-bold cursor-pointer"
              >
                Enviar comprobante de transferencia
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}