const SANDBOX_URL = 'https://api-m.sandbox.paypal.com'
const LIVE_URL = 'https://api-m.paypal.com'

export function obtenerPayPalClientId(): string {
  return (process.env.PAYPAL_CLIENT_ID ?? process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ?? '').trim()
}

export function estaPayPalConfigurado(): boolean {
  return Boolean(obtenerPayPalClientId() && (process.env.PAYPAL_CLIENT_SECRET ?? '').trim())
}

export function obtenerPayPalBaseUrl(): string {
  return (process.env.PAYPAL_ENV ?? 'sandbox').trim().toLowerCase() === 'live'
    ? LIVE_URL
    : SANDBOX_URL
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

  const json = (await res.json()) as { id?: string; message?: string }
  if (!res.ok || !json.id) {
    throw new Error(json.message || `No se pudo crear la orden en PayPal (${res.status}).`)
  }

  return { id: json.id }
}

export type RespuestaCapturaPayPal = {
  id: string
  status: string
  purchase_units?: Array<{
    reference_id?: string
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

  const json = (await res.json()) as RespuestaCapturaPayPal & { message?: string }
  if (!res.ok) {
    throw new Error(json.message || `PayPal rechazó la captura del pago (${res.status}).`)
  }

  return json
}