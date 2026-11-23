import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const COOKIES_SESION_CONOCIDAS = [
  'authjs.session-token',
  '__Secure-authjs.session-token',
  '__Host-authjs.session-token',
  'authjs.callback-url',
  '__Secure-authjs.callback-url',
  '__Host-authjs.callback-url',
  'authjs.csrf-token',
  '__Secure-authjs.csrf-token',
  '__Host-authjs.csrf-token',
  'authjs.pkce.code_verifier',
  'authjs.state',
  'next-auth.session-token',
  '__Secure-next-auth.session-token',
  '__Host-next-auth.session-token',
  'next-auth.callback-url',
  '__Secure-next-auth.callback-url',
  '__Host-next-auth.callback-url',
  'next-auth.csrf-token',
  '__Secure-next-auth.csrf-token',
  '__Host-next-auth.csrf-token',
]

function esCookieDeAutenticacion(nombre: string): boolean {
  return (
    nombre.startsWith('authjs.') ||
    nombre.startsWith('__Secure-authjs.') ||
    nombre.startsWith('__Host-authjs.') ||
    nombre.startsWith('next-auth.') ||
    nombre.startsWith('__Secure-next-auth.') ||
    nombre.startsWith('__Host-next-auth.')
  )
}

function construirUrlLogin(req: NextRequest): URL {
  const forwardedHost = req.headers.get('x-forwarded-host')?.split(',')[0]?.trim()
  const forwardedProto = req.headers.get('x-forwarded-proto')?.split(',')[0]?.trim()
  if (forwardedHost) {
    const proto = forwardedProto === 'http' ? 'http' : 'https'
    return new URL('/login?reset=1', `${proto}://${forwardedHost}`)
  }
  return new URL('/login?reset=1', req.nextUrl.origin)
}

function limpiarYRedirigir(req: NextRequest): NextResponse {
  const destino = construirUrlLogin(req)
  const esHttps =
    destino.protocol === 'https:' ||
    req.headers.get('x-forwarded-proto')?.split(',')[0]?.trim() === 'https'

  const response = NextResponse.redirect(destino, { status: 307 })
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  response.headers.set('Pragma', 'no-cache')

  const nombresAConsiderar = new Set<string>()

  for (const cookie of req.cookies.getAll()) {
    if (esCookieDeAutenticacion(cookie.name)) {
      nombresAConsiderar.add(cookie.name)
    }
  }

  for (const base of COOKIES_SESION_CONOCIDAS) {
    nombresAConsiderar.add(base)
    if (base.endsWith('session-token')) {
      for (let i = 0; i <= 9; i++) {
        nombresAConsiderar.add(`${base}.${i}`)
      }
    }
  }

  for (const nombre of nombresAConsiderar) {
    const requiereSecure =
      esHttps || nombre.startsWith('__Secure-') || nombre.startsWith('__Host-')

    response.cookies.set({
      name: nombre,
      value: '',
      path: '/',
      maxAge: 0,
      expires: new Date(0),
      httpOnly: true,
      sameSite: 'lax',
      secure: requiereSecure,
    })
  }

  return response
}

export async function GET(req: NextRequest) {
  return limpiarYRedirigir(req)
}

export async function POST(req: NextRequest) {
  return limpiarYRedirigir(req)
}
