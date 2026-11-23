'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, CreditCard, RefreshCw, XCircle } from 'lucide-react'

type PayPalButtonsInstance = {
  render: (container: HTMLElement) => Promise<void>
  close?: () => Promise<void>
}

type PayPalButtonsOptions = {
  style?: Record<string, string | number>
  createOrder?: () => Promise<string>
  createSubscription?: () => Promise<string>
  onApprove: (data: { orderID?: string; subscriptionID?: string }) => Promise<void>
  onCancel?: () => void
  onError?: (err: unknown) => void
}

type PayPalNamespace = {
  Buttons: (options: PayPalButtonsOptions) => PayPalButtonsInstance
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
  billingMode = 'RESIDENCY',
  titularPago,
  paypalClientId,
  paypalConfigurado,
  paypalEnv,
  suscripcionAutomaticaId = null,
  paypalWebhookConfigurado = false,
}: {
  monthlyPriceUsd: number
  residencyName: string
  billingMode?: 'RESIDENCY' | 'INDIVIDUAL'
  titularPago?: string
  paypalClientId: string
  paypalConfigurado: boolean
  paypalEnv: 'sandbox' | 'live'
  suscripcionAutomaticaId?: string | null
  paypalWebhookConfigurado?: boolean
}) {
  const router = useRouter()
  const [subOverride, setSubOverride] = useState<string | null | undefined>(undefined)
  const subActivaId = subOverride !== undefined ? subOverride : (suscripcionAutomaticaId ?? null)
  const [modoPago, setModoPago] = useState<'recurrente' | 'unico'>(
    suscripcionAutomaticaId ? 'unico' : 'recurrente'
  )
  const [periodMonths, setPeriodMonths] = useState<number>(1)
  const [procesando, setProcesando] = useState(false)
  const [confirmarCancelacion, setConfirmarCancelacion] = useState(false)
  const [cancelandoAuto, setCancelandoAuto] = useState(false)
  const [estadoPago, setEstadoPago] = useState<{ tipo: 'ok' | 'error' | 'info'; texto: string } | null>(null)
  const [sdkEstado, setSdkEstado] = useState<'idle' | 'loading' | 'ready'>('idle')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [acceptPrivacy, setAcceptPrivacy] = useState(false)

  const periodMonthsRef = useRef(periodMonths)
  const acceptTermsRef = useRef(acceptTerms)
  const acceptPrivacyRef = useRef(acceptPrivacy)
  const contenedorPayPalRef = useRef<HTMLDivElement | null>(null)

  const esIndividual = billingMode === 'INDIVIDUAL'
  const esRecurrente = modoPago === 'recurrente'
  const montoTotal = esRecurrente
    ? monthlyPriceUsd.toFixed(2)
    : (monthlyPriceUsd * periodMonths).toFixed(2)
  const paypalHabilitado = paypalConfigurado && paypalClientId.length > 0 && monthlyPriceUsd > 0
  const consentimientoCompleto = acceptTerms && acceptPrivacy

  useEffect(() => {
    if (!paypalHabilitado) {
      return
    }
    if (esRecurrente && subActivaId) {
      return
    }

    let cancelado = false
    let instanciaBotones: PayPalButtonsInstance | null = null

    const nsKey = esRecurrente ? 'paypalSubscription' : 'paypalCapture'
    const scriptId = esRecurrente ? 'nexo-paypal-sdk-sub' : 'nexo-paypal-sdk-cap'
    const scriptSrc = esRecurrente
      ? `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(
          paypalClientId
        )}&currency=USD&vault=true&intent=subscription`
      : `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(
          paypalClientId
        )}&currency=USD&intent=capture`

    const renderizarBotones = () => {
      if (cancelado || !contenedorPayPalRef.current) return
      const win = window as unknown as Record<string, PayPalNamespace | undefined>
      const ns = win[nsKey]
      if (!ns?.Buttons) {
        setEstadoPago({
          tipo: 'error',
          texto:
            'PayPal no pudo inicializar los botones. Verifica que PAYPAL_CLIENT_ID y PAYPAL_CLIENT_SECRET coincidan con el entorno configurado (live o sandbox).',
        })
        return
      }

      contenedorPayPalRef.current.innerHTML = ''
      try {
        const opciones: PayPalButtonsOptions = esRecurrente
          ? {
              style: {
                layout: 'vertical',
                color: 'blue',
                shape: 'rect',
                label: 'subscribe',
                height: 45,
              },
              createSubscription: async () => {
                if (!acceptTermsRef.current || !acceptPrivacyRef.current) {
                  const msg =
                    'Marca ambas casillas de aceptación legal antes de activar la suscripción automática.'
                  setEstadoPago({ tipo: 'error', texto: msg })
                  throw new Error(msg)
                }
                setEstadoPago(null)
                const res = await fetch('/api/paypal/create-subscription', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    acceptTerms: acceptTermsRef.current,
                    acceptPrivacy: acceptPrivacyRef.current,
                  }),
                })
                const json = (await res.json()) as { subscriptionID?: string; error?: string }
                if (!res.ok || !json.subscriptionID) {
                  throw new Error(
                    json.error || 'No se pudo iniciar la suscripción automática con PayPal.'
                  )
                }
                return json.subscriptionID
              },
              onApprove: async (data) => {
                if (!data.subscriptionID) {
                  setEstadoPago({
                    tipo: 'error',
                    texto: 'PayPal no devolvió el identificador de suscripción.',
                  })
                  return
                }
                setProcesando(true)
                setEstadoPago({
                  tipo: 'info',
                  texto: 'Confirmando suscripción mensual automática con PayPal...',
                })
                try {
                  const res = await fetch('/api/paypal/activate-subscription', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ subscriptionID: data.subscriptionID }),
                  })
                  const json = (await res.json()) as {
                    ok?: boolean
                    error?: string
                    subscriptionID?: string
                  }
                  if (!res.ok || !json.ok) {
                    setEstadoPago({
                      tipo: 'error',
                      texto:
                        json.error ||
                        'La suscripción fue aprobada, pero falló la activación automática.',
                    })
                    return
                  }
                  setSubOverride(json.subscriptionID ?? data.subscriptionID)
                  setEstadoPago({
                    tipo: 'ok',
                    texto: `Suscripción mensual automática activada (${data.subscriptionID}). Se renovará cada mes sin cortes hasta que decidas cancelarla.`,
                  })
                  router.refresh()
                } finally {
                  setProcesando(false)
                }
              },
              onCancel: () => {
                setProcesando(false)
                setEstadoPago({
                  tipo: 'info',
                  texto: 'Suscripción cancelada. No se realizó ningún cargo automático.',
                })
              },
              onError: (err) => {
                setProcesando(false)
                const msg =
                  err instanceof Error
                    ? err.message
                    : 'Ocurrió un error al procesar la suscripción en PayPal.'
                setEstadoPago({ tipo: 'error', texto: msg })
              },
            }
          : {
              style: {
                layout: 'vertical',
                color: 'blue',
                shape: 'rect',
                label: 'pay',
                height: 45,
              },
              createOrder: async () => {
                if (!acceptTermsRef.current || !acceptPrivacyRef.current) {
                  const msg =
                    'Marca ambas casillas de aceptación legal antes de continuar con el pago.'
                  setEstadoPago({ tipo: 'error', texto: msg })
                  throw new Error(msg)
                }
                setEstadoPago(null)
                const res = await fetch('/api/paypal/create-order', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    periodMonths: periodMonthsRef.current,
                    acceptTerms: acceptTermsRef.current,
                    acceptPrivacy: acceptPrivacyRef.current,
                  }),
                })
                const json = (await res.json()) as { orderID?: string; error?: string }
                if (!res.ok || !json.orderID) {
                  throw new Error(json.error || 'No se pudo iniciar el pago con PayPal.')
                }
                return json.orderID
              },
              onApprove: async (data) => {
                if (!data.orderID) {
                  setEstadoPago({
                    tipo: 'error',
                    texto: 'PayPal no devolvió el identificador de la orden.',
                  })
                  return
                }
                setProcesando(true)
                setEstadoPago({
                  tipo: 'info',
                  texto: esIndividual
                    ? 'Verificando pago y activando tu cuenta...'
                    : 'Verificando pago y activando tu residencia...',
                })
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
                  }
                  if (!res.ok || !json.ok) {
                    setEstadoPago({
                      tipo: 'error',
                      texto:
                        json.error ||
                        'El pago fue aprobado pero falló la activación automática.',
                    })
                    return
                  }
                  const refTexto = json.captureRef ? ` · Ref. ${json.captureRef}` : ''
                  setEstadoPago({
                    tipo: 'ok',
                    texto: esIndividual
                      ? `Pago individual confirmado al instante${refTexto}. Tu acceso quedó renovado por ${json.periodMonths ?? periodMonthsRef.current} mes(es).`
                      : `Pago confirmado al instante${refTexto}. Suscripción renovada por ${json.periodMonths ?? periodMonthsRef.current} mes(es).`,
                  })
                  router.refresh()
                } finally {
                  setProcesando(false)
                }
              },
              onCancel: () => {
                setProcesando(false)
                setEstadoPago({
                  tipo: 'info',
                  texto: 'Pago cancelado. No se realizó ningún cargo.',
                })
              },
              onError: (err) => {
                setProcesando(false)
                const msg =
                  err instanceof Error
                    ? err.message
                    : 'Ocurrió un error al procesar el pago con PayPal.'
                setEstadoPago({ tipo: 'error', texto: msg })
              },
            }

        instanciaBotones = ns.Buttons(opciones)
        instanciaBotones.render(contenedorPayPalRef.current).catch((err: unknown) => {
          if (cancelado) return
          const msg =
            err instanceof Error ? err.message : 'No se pudieron mostrar los botones de PayPal.'
          setEstadoPago({ tipo: 'error', texto: `Error PayPal: ${msg}` })
        })
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : 'Error inicializando botones de PayPal.'
        setEstadoPago({ tipo: 'error', texto: `Error PayPal: ${msg}` })
      }
    }

    const win = window as unknown as Record<string, PayPalNamespace | undefined>
    if (win[nsKey]?.Buttons) {
      queueMicrotask(() => {
        if (!cancelado) setSdkEstado('ready')
      })
      renderizarBotones()
      return () => {
        cancelado = true
        void instanciaBotones?.close?.()
      }
    }

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
      script.dataset.namespace = nsKey
      script.src = scriptSrc
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
        texto:
          'No se pudo cargar la pasarela de PayPal / Tarjeta. Revisa tu conexión e intenta nuevamente.',
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
  }, [esIndividual, esRecurrente, paypalClientId, paypalHabilitado, router, subActivaId])

  const manejarCancelarAutoRenovacion = async () => {
    setCancelandoAuto(true)
    setEstadoPago(null)
    try {
      const res = await fetch('/api/paypal/cancel-subscription', {
        method: 'POST',
      })
      const json = (await res.json()) as { ok?: boolean; error?: string }
      if (!res.ok || !json.ok) {
        setEstadoPago({
          tipo: 'error',
          texto: json.error || 'No se pudo cancelar la renovación automática.',
        })
        return
      }
      setSubOverride(null)
      setConfirmarCancelacion(false)
      setEstadoPago({
        tipo: 'ok',
        texto:
          'Renovación automática cancelada. Mantendrás el acceso hasta la fecha de vencimiento ya pagada.',
      })
      router.refresh()
    } finally {
      setCancelandoAuto(false)
    }
  }

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            {esIndividual ? 'Renovar Mi Suscripción Individual' : 'Renovar Suscripción Mensual'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Elige cobro mensual automático o pago único por período vía PayPal y tarjetas (Visa / Mastercard).
          </p>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800">
          <CreditCard className="w-3.5 h-3.5" />
          PayPal · Tarjeta de Crédito y Débito
        </span>
      </div>

      {/* ESTADO DE AUTO-RENOVACIÓN ACTIVA */}
      {subActivaId && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-800 p-4 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-700 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-900 dark:text-emerald-200">
                <p className="font-bold text-sm">Suscripción Mensual Automática Activa</p>
                <p className="mt-0.5">
                  ID PayPal: <span className="font-mono font-bold">{subActivaId}</span> · Cargo
                  automático mensual de <strong>${monthlyPriceUsd.toFixed(2)} USD</strong>.
                </p>
                {!paypalWebhookConfigurado && (
                  <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80 mt-0.5">
                    Nota técnica: configura <code className="font-mono">PAYPAL_WEBHOOK_ID</code> para acreditar renovaciones de los meses siguientes automáticamente en segundo plano.
                  </p>
                )}
              </div>
            </div>

            {!confirmarCancelacion ? (
              <button
                type="button"
                onClick={() => setConfirmarCancelacion(true)}
                className="px-3 py-1.5 rounded-lg border border-red-200 bg-white hover:bg-red-50 text-red-700 text-xs font-bold cursor-pointer"
              >
                Cancelar renovación automática
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={cancelandoAuto}
                  onClick={manejarCancelarAutoRenovacion}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold cursor-pointer disabled:opacity-60"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  {cancelandoAuto ? 'Cancelando...' : 'Confirmar cancelación'}
                </button>
                <button
                  type="button"
                  disabled={cancelandoAuto}
                  onClick={() => setConfirmarCancelacion(false)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-medium cursor-pointer"
                >
                  Mantener activa
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SELECTOR DE MODALIDAD DE COBRO */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <button
          type="button"
          disabled={procesando}
          onClick={() => {
            setEstadoPago(null)
            setModoPago('recurrente')
          }}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer disabled:opacity-60 ${
            esRecurrente
              ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/30 ring-1 ring-blue-600'
              : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/40'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
              <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
              Suscripción Mensual Automática
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
              Recomendado
            </span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
            Cargo mensual automático de ${monthlyPriceUsd.toFixed(2)} USD en PayPal o tarjeta. Cancela cuando quieras.
          </p>
        </button>

        <button
          type="button"
          disabled={procesando}
          onClick={() => {
            setEstadoPago(null)
            setModoPago('unico')
          }}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer disabled:opacity-60 ${
            !esRecurrente
              ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/30 ring-1 ring-blue-600'
              : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900/40'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
              <CreditCard className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
              Pago Único por Período
            </span>
            <span className="text-[10px] font-semibold text-slate-500">1, 3, 6 o 12 meses</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
            Paga un bloque fijo de meses sin cargo recurrente automático.
          </p>
        </button>
      </div>

      {/* SELECTOR DE PERÍODO (SOLO EN PAGO ÚNICO) */}
      {!esRecurrente && (
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
      )}

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
              {esRecurrente
                ? esIndividual
                  ? `Suscripción mensual automática para ${titularPago || 'tu cuenta'} en ${residencyName}:`
                  : `Suscripción mensual automática para ${residencyName}:`
                : esIndividual
                  ? `Total a pagar para ${titularPago || 'tu cuenta'} en ${residencyName} (${periodMonths} ${periodMonths === 1 ? 'mes' : 'meses'}):`
                  : `Total a pagar por ${residencyName} (${periodMonths} ${periodMonths === 1 ? 'mes' : 'meses'}):`}
            </p>
            <p className="text-slate-500 dark:text-slate-400">
              {esRecurrente
                ? 'Se realizará un cargo mensual recurrente automático cada 30 días mientras permanezca activa.'
                : 'Activación automática al completarse el pago. Acepta cuenta PayPal y tarjetas de crédito o débito.'}
            </p>
          </div>
          <div className="text-right">
            <span className="text-lg font-black text-slate-900 dark:text-white tabular-nums">
              ${montoTotal} USD{esRecurrente ? '/mes' : ''}
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
            {esIndividual
              ? 'Tu residencia tiene configurada una tarifa individual de $0 USD, por lo que no requiere cobro en línea.'
              : 'Esta residencia tiene configurada una tarifa mensual de $0 USD, por lo que no requiere cobro en línea.'}
          </div>
        ) : esRecurrente && subActivaId ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 dark:bg-emerald-950/20 dark:border-emerald-800 p-4 text-xs text-emerald-900 dark:text-emerald-200">
            Ya tienes una suscripción mensual automática activa ({subActivaId}). Si deseas adelantar meses adicionales con pago único, cambia a la pestaña <strong>&quot;Pago Único por Período&quot;</strong>.
          </div>
        ) : paypalHabilitado ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 p-4 space-y-2.5">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Confirmación previa al pago
              </p>

              <label className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  disabled={procesando}
                  onChange={(e) => {
                    acceptTermsRef.current = e.target.checked
                    setAcceptTerms(e.target.checked)
                  }}
                  className="mt-0.5 rounded border-slate-300 dark:border-slate-600"
                />
                <span>
                  Acepto los{' '}
                  <Link
                    href="/terminos"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                  >
                    Términos y Condiciones de Uso
                  </Link>{' '}
                  y la{' '}
                  <Link
                    href="/reembolso"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                  >
                    Política de Reembolso y Cancelación
                  </Link>{' '}
                  {esRecurrente
                    ? 'incluyendo la autorización de cobro mensual recurrente.'
                    : 'para esta suscripción.'}
                </span>
              </label>

              <label className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptPrivacy}
                  disabled={procesando}
                  onChange={(e) => {
                    acceptPrivacyRef.current = e.target.checked
                    setAcceptPrivacy(e.target.checked)
                  }}
                  className="mt-0.5 rounded border-slate-300 dark:border-slate-600"
                />
                <span>
                  Acepto la{' '}
                  <Link
                    href="/privacidad"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                  >
                    Política de Privacidad
                  </Link>{' '}
                  y el uso de{' '}
                  <Link
                    href="/cookies"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
                  >
                    Cookies técnicas esenciales
                  </Link>{' '}
                  para procesar este pago con seguridad.
                </span>
              </label>

              {!consentimientoCompleto && (
                <p className="text-[11px] font-medium text-amber-700 dark:text-amber-300">
                  Marca ambas casillas para habilitar los botones de PayPal y tarjeta.
                </p>
              )}
            </div>

            <div className="max-w-md mx-auto pt-1 relative">
              {sdkEstado === 'loading' && (
                <p className="text-center text-xs text-slate-500 py-4">
                  Cargando pasarela segura de PayPal y Tarjetas...
                </p>
              )}
              <div
                ref={contenedorPayPalRef}
                className={`min-h-14 transition-opacity ${
                  consentimientoCompleto ? 'opacity-100' : 'opacity-40 pointer-events-none select-none'
                }`}
              />
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 p-4 text-xs text-amber-900 dark:text-amber-200 space-y-1.5">
            <p className="font-bold">Pasarela de PayPal / Tarjeta pendiente de configuración</p>
            <p>
              Configura{' '}
              <code className="font-mono bg-amber-100 dark:bg-amber-900 px-1 rounded">
                PAYPAL_CLIENT_ID
              </code>
              ,{' '}
              <code className="font-mono bg-amber-100 dark:bg-amber-900 px-1 rounded">
                PAYPAL_CLIENT_SECRET
              </code>{' '}
              y{' '}
              <code className="font-mono bg-amber-100 dark:bg-amber-900 px-1 rounded">
                PAYPAL_ENV
              </code>{' '}
              en tus variables de entorno.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
