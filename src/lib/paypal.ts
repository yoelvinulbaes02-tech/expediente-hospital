const SANDBOX_URL = 'https://api-m.sandbox.paypal.com'
const LIVE_URL = 'https://api-m.paypal.com'

const PRODUCTO_NOMBRE_NEXO = 'NEXO Medical Team Workflow'
const REGEX_SUB_TAG = /\[SUB:([A-Z0-9-]+)\]/i

export function obtenerPayPalClientId(): string {
  return (process.env.PAYPAL_CLIENT_ID ?? process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? '').trim()
}

export function estaPayPalConfigurado(): boolean {
  return Boolean(obtenerPayPalClientId() && (process.env.PAYPAL_CLIENT_SECRET ?? '').trim())
}

export function estaPayPalWebhookConfigurado(): boolean {
  return Boolean((process.env.PAYPAL_WEBHOOK_ID ?? '').trim())
}

export function obtenerPayPalBaseUrl(): string {
  return (process.env.PAYPAL_ENV ?? 'sandbox').trim().toLowerCase() === 'live'
    ? LIVE_URL
    : SANDBOX_URL
}

export function extraerSuscripcionActivaDeNota(lastPaymentNote?: string | null): string | null {
  if (!lastPaymentNote) return null
  const match = REGEX_SUB_TAG.exec(lastPaymentNote)
  return match?.[1] ? match[1].trim() : null
}

export function limpiarTagSuscripcionDeNota(nota?: string | null): string {
  if (!nota) return ''
  return nota.replace(/\s*\[SUB:[A-Z0-9-]+\]/gi, '').trim()
}

async function obtenerAccessToken(): Promise<string> {
  const clientId = obtenerPayPalClientId()
  const clientSecret = (process.env.PAYPAL_CLIENT_SECRET ?? '').trim()

  if (!clientId || !clientSecret) {
    throw new Error('PayPal no está configurado en las variables de entorno del servidor.')
  }

  const credenciales = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
  const res = await fetch(`${obtenerPayPalBaseUrl()}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credenciales}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
    cache: 'no-store',
  })

  if (!res.ok) {
    const detalle = await res.text()
    throw new Error(`Error autenticando con PayPal (${res.status}): ${detalle}`)
  }

  const data = (await res.json()) as { access_token?: string }
  if (!data.access_token) {
    throw new Error('PayPal no devolvió access_token.')
  }

  return data.access_token
}

export async function crearOrdenPayPal({
  amountUsd,
  description,
  customId,
}: {
  amountUsd: number
  description: string
  customId: string
}): Promise<{ id: string }> {
  const token = await obtenerAccessToken()

  const res = await fetch(`${obtenerPayPalBaseUrl()}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          description: description.slice(0, 127),
          custom_id: customId.slice(0, 127),
          amount: {
            currency_code: 'USD',
            value: amountUsd.toFixed(2),
          },
        },
      ],
      application_context: {
        shipping_preference: 'NO_SHIPPING',
        user_action: 'PAY_NOW',
      },
    }),
    cache: 'no-store',
  })

  const json = (await res.json()) as {
    id?: string
    message?: string
    details?: Array<{ issue?: string; description?: string }>
  }
  if (!res.ok || !json.id) {
    const detalle = json.details?.[0]?.description || json.message || `HTTP ${res.status}`
    console.error('PayPal createOrder error:', json)
    throw new Error(`No se pudo crear la orden en PayPal: ${detalle}`)
  }

  return { id: json.id }
}

export type RespuestaCapturaPayPal = {
  id: string
  status: string
  payment_source?: {
    card?: {
      last_digits?: string
      brand?: string
    }
    paypal?: {
      email_address?: string
    }
  }
  purchase_units?: Array<{
    reference_id?: string
    custom_id?: string
    payments?: {
      captures?: Array<{
        id: string
        status: string
        custom_id?: string
        amount?: { currency_code?: string; value?: string }
      }>
    }
  }>
}

export async function capturarOrdenPayPal(orderId: string): Promise<RespuestaCapturaPayPal> {
  const token = await obtenerAccessToken()

  const res = await fetch(
    `${obtenerPayPalBaseUrl()}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    }
  )

  const json = (await res.json()) as RespuestaCapturaPayPal & {
    message?: string
    details?: Array<{ issue?: string; description?: string }>
  }
  if (!res.ok) {
    const detalle = json.details?.[0]?.description || json.message || `HTTP ${res.status}`
    console.error('PayPal captureOrder error:', json)
    throw new Error(`PayPal rechazó la captura del pago: ${detalle}`)
  }

  return json
}

async function asegurarProductoPayPal(token: string): Promise<string> {
  const baseUrl = obtenerPayPalBaseUrl()
  const listRes = await fetch(`${baseUrl}/v1/catalogs/products?page_size=20&page=1`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  })

  if (listRes.ok) {
    const listJson = (await listRes.json()) as {
      products?: Array<{ id?: string; name?: string }>
    }
    const existente = listJson.products?.find((p) => p.name === PRODUCTO_NOMBRE_NEXO && p.id)
    if (existente?.id) {
      return existente.id
    }
  }

  const createRes = await fetch(`${baseUrl}/v1/catalogs/products`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: PRODUCTO_NOMBRE_NEXO,
      description: 'Plataforma clínica SaaS para residencias y profesionales médicos',
      type: 'SERVICE',
      category: 'SOFTWARE',
    }),
    cache: 'no-store',
  })

  const createJson = (await createRes.json()) as {
    id?: string
    message?: string
    details?: Array<{ issue?: string; description?: string }>
  }
  if (!createRes.ok || !createJson.id) {
    const detalle = createJson.details?.[0]?.description || createJson.message || `HTTP ${createRes.status}`
    throw new Error(`No se pudo registrar el producto en PayPal: ${detalle}`)
  }

  return createJson.id
}

export async function asegurarPlanMensualPayPal({
  amountUsd,
  scopeLabel,
}: {
  amountUsd: number
  scopeLabel: 'INDIVIDUAL' | 'RESIDENCY'
}): Promise<string> {
  const token = await obtenerAccessToken()
  const baseUrl = obtenerPayPalBaseUrl()
  const productId = await asegurarProductoPayPal(token)
  const planName = `NEXO_AUTO_${scopeLabel}_${amountUsd.toFixed(2)}`

  for (let page = 1; page <= 5; page++) {
    const listRes = await fetch(
      `${baseUrl}/v1/billing/plans?product_id=${encodeURIComponent(productId)}&page_size=20&page=${page}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      }
    )

    if (!listRes.ok) break
    const listJson = (await listRes.json()) as {
      plans?: Array<{ id?: string; name?: string; status?: string }>
    }
    const existente = listJson.plans?.find(
      (p) => p.name === planName && p.status === 'ACTIVE' && p.id
    )
    if (existente?.id) {
      return existente.id
    }
    if (!listJson.plans || listJson.plans.length < 20) break
  }

  const createRes = await fetch(`${baseUrl}/v1/billing/plans`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      product_id: productId,
      name: planName,
      description: `Suscripción mensual automática NEXO ($${amountUsd.toFixed(2)} USD/mes)`,
      status: 'ACTIVE',
      billing_cycles: [
        {
          frequency: {
            interval_unit: 'MONTH',
            interval_count: 1,
          },
          tenure_type: 'REGULAR',
          sequence: 1,
          total_cycles: 0,
          pricing_scheme: {
            fixed_price: {
              value: amountUsd.toFixed(2),
              currency_code: 'USD',
            },
          },
        },
      ],
      payment_preferences: {
        auto_bill_outstanding: true,
        setup_fee: {
          value: '0',
          currency_code: 'USD',
        },
        setup_fee_failure_action: 'CANCEL',
        payment_failure_threshold: 3,
      },
    }),
    cache: 'no-store',
  })

  const createJson = (await createRes.json()) as {
    id?: string
    message?: string
    details?: Array<{ issue?: string; description?: string }>
  }
  if (!createRes.ok || !createJson.id) {
    const detalle = createJson.details?.[0]?.description || createJson.message || `HTTP ${createRes.status}`
    console.error('PayPal createPlan error:', createJson)
    throw new Error(`No se pudo crear el plan mensual en PayPal: ${detalle}`)
  }

  return createJson.id
}

export async function crearSuscripcionPayPal({
  planId,
  customId,
  subscriberEmail,
  subscriberName,
  returnUrl,
  cancelUrl,
}: {
  planId: string
  customId: string
  subscriberEmail?: string
  subscriberName?: string
  returnUrl: string
  cancelUrl: string
}): Promise<{ id: string }> {
  const token = await obtenerAccessToken()
  const partesNombre = (subscriberName ?? '').trim().split(/\s+/).filter(Boolean)
  const givenName = partesNombre[0] ?? 'Profesional'
  const surname = partesNombre.slice(1).join(' ') || 'NEXO'

  const payload: Record<string, unknown> = {
    plan_id: planId,
    custom_id: customId.slice(0, 127),
    application_context: {
      brand_name: 'NEXO Medical Team Workflow',
      locale: 'es-ES',
      shipping_preference: 'NO_SHIPPING',
      user_action: 'SUBSCRIBE_NOW',
      return_url: returnUrl,
      cancel_url: cancelUrl,
    },
  }

  if (subscriberEmail) {
    payload.subscriber = {
      name: {
        given_name: givenName.slice(0, 140),
        surname: surname.slice(0, 140),
      },
      email_address: subscriberEmail,
    }
  }

  const res = await fetch(`${obtenerPayPalBaseUrl()}/v1/billing/subscriptions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    cache: 'no-store',
  })

  const json = (await res.json()) as {
    id?: string
    message?: string
    details?: Array<{ issue?: string; description?: string }>
  }

  if (!res.ok || !json.id) {
    const detalle = json.details?.[0]?.description || json.message || `HTTP ${res.status}`
    console.error('PayPal createSubscription error:', json)
    throw new Error(`No se pudo crear la suscripción en PayPal: ${detalle}`)
  }

  return { id: json.id }
}

export type RespuestaSuscripcionPayPal = {
  id: string
  status: string
  plan_id?: string
  custom_id?: string
  subscriber?: {
    email_address?: string
  }
  billing_info?: {
    next_billing_time?: string
    last_payment?: {
      amount?: { currency_code?: string; value?: string }
      time?: string
    }
  }
}

export async function obtenerSuscripcionPayPal(
  subscriptionId: string
): Promise<RespuestaSuscripcionPayPal> {
  const token = await obtenerAccessToken()

  const res = await fetch(
    `${obtenerPayPalBaseUrl()}/v1/billing/subscriptions/${encodeURIComponent(subscriptionId)}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    }
  )

  const json = (await res.json()) as RespuestaSuscripcionPayPal & {
    message?: string
    details?: Array<{ issue?: string; description?: string }>
  }
  if (!res.ok || !json.id) {
    const detalle = json.details?.[0]?.description || json.message || `HTTP ${res.status}`
    throw new Error(`No se pudo consultar la suscripción en PayPal: ${detalle}`)
  }

  return json
}

export async function obtenerPrecioPlanPayPal(planId: string): Promise<{
  currencyCode: string
  value: number
} | null> {
  const token = await obtenerAccessToken()
  const res = await fetch(
    `${obtenerPayPalBaseUrl()}/v1/billing/plans/${encodeURIComponent(planId)}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    }
  )
  if (!res.ok) return null
  const json = (await res.json()) as {
    billing_cycles?: Array<{
      tenure_type?: string
      pricing_scheme?: {
        fixed_price?: { value?: string; currency_code?: string }
      }
    }>
  }
  const regular = json.billing_cycles?.find((c) => c.tenure_type === 'REGULAR') ?? json.billing_cycles?.[0]
  const fixed = regular?.pricing_scheme?.fixed_price
  if (!fixed?.value) return null
  const val = parseFloat(fixed.value)
  if (Number.isNaN(val)) return null
  return {
    currencyCode: (fixed.currency_code ?? 'USD').toUpperCase(),
    value: val,
  }
}

export async function cancelarSuscripcionPayPal(
  subscriptionId: string,
  reason = 'Cancelación solicitada por el titular desde NEXO'
): Promise<void> {
  const token = await obtenerAccessToken()
  const res = await fetch(
    `${obtenerPayPalBaseUrl()}/v1/billing/subscriptions/${encodeURIComponent(subscriptionId)}/cancel`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ reason: reason.slice(0, 128) }),
      cache: 'no-store',
    }
  )

  if (res.ok || res.status === 204) return

  const text = await res.text()
  if (text.includes('SUBSCRIPTION_STATUS_INVALID') || text.includes('CANCELLED')) {
    return
  }
  throw new Error(`PayPal no pudo cancelar la suscripción (${res.status}): ${text}`)
}

export async function verificarFirmaWebhookPayPal(
  headers: Headers,
  webhookEvent: unknown
): Promise<boolean> {
  const webhookId = (process.env.PAYPAL_WEBHOOK_ID ?? '').trim()
  if (!webhookId) return false

  const transmissionId = headers.get('paypal-transmission-id')
  const transmissionTime = headers.get('paypal-transmission-time')
  const certUrl = headers.get('paypal-cert-url')
  const authAlgo = headers.get('paypal-auth-algo')
  const transmissionSig = headers.get('paypal-transmission-sig')

  if (!transmissionId || !transmissionTime || !certUrl || !authAlgo || !transmissionSig) {
    return false
  }

  const token = await obtenerAccessToken()
  const res = await fetch(`${obtenerPayPalBaseUrl()}/v1/notifications/verify-webhook-signature`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      auth_algo: authAlgo,
      cert_url: certUrl,
      transmission_id: transmissionId,
      transmission_sig: transmissionSig,
      transmission_time: transmissionTime,
      webhook_id: webhookId,
      webhook_event: webhookEvent,
    }),
    cache: 'no-store',
  })

  if (!res.ok) return false
  const json = (await res.json()) as { verification_status?: string }
  return json.verification_status === 'SUCCESS'
}
