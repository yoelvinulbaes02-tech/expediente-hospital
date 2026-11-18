import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'

const VENTANA_BLOQUEO_MS = 15 * 60 * 1000
const MAX_INTENTOS_POR_IP = 20
const MAX_INTENTOS_POR_CUENTA = 6

const intentosPorIp = new Map<string, number[]>()

function registrarIntentoIp(ip: string): boolean {
  if (!ip) return true
  const ahora = Date.now()
  const recientes = (intentosPorIp.get(ip) ?? []).filter((t) => ahora - t < VENTANA_BLOQUEO_MS)
  if (recientes.length >= MAX_INTENTOS_POR_IP) {
    intentosPorIp.set(ip, recientes)
    return false
  }
  recientes.push(ahora)
  intentosPorIp.set(ip, recientes)
  return true
}

function obtenerIpCliente(req?: Request): string | undefined {
  const xff = req?.headers?.get('x-forwarded-for')
  const realIp = req?.headers?.get('x-real-ip')
  const raw = xff?.split(',')[0]?.trim() || realIp?.trim()
  return raw ? raw.slice(0, 64) : undefined
}

function obtenerUserAgent(req?: Request): string | undefined {
  const ua = req?.headers?.get('user-agent')?.trim()
  return ua ? ua.slice(0, 255) : undefined
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: 'jwt',
    maxAge: 12 * 60 * 60, // 12 horas (duración máxima de turno clínico)
    updateAge: 15 * 60,
  },
  pages: { signIn: '/login' },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      name: 'Credenciales',
      credentials: {
        email: { label: 'Correo', type: 'email' },
        password: { label: 'Contraseña', type: 'password' },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) return null

        const ipAddress = obtenerIpCliente(req)
        const userAgent = obtenerUserAgent(req)

        if (ipAddress && !registrarIntentoIp(ipAddress)) {
          return null
        }

        const emailInput = String(credentials.email).trim().toLowerCase()
        const user = await prisma.user.findFirst({
          where: { email: { equals: emailInput, mode: 'insensitive' } },
        })

        if (!user || !user.isActive) return null

        // Bloqueo temporal por intentos fallidos recientes (se reinicia tras 15 min o cambio de clave)
        const desde = new Date(
          Math.max(Date.now() - VENTANA_BLOQUEO_MS, user.updatedAt.getTime())
        )
        const fallosRecientes = await prisma.auditLog.count({
          where: {
            actorId: user.id,
            action: 'login_failed',
            entity: 'auth',
            serverTs: { gte: desde },
          },
        })
        if (fallosRecientes >= MAX_INTENTOS_POR_CUENTA) {
          return null
        }

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        )

        if (!valid) {
          await logAudit({
            actorId: user.id,
            actorRole: user.role,
            action: 'login_failed',
            entity: 'auth',
            reason: 'Intento de inicio de sesión con contraseña incorrecta',
            ipAddress,
            userAgent,
          })
          return null
        }

        await logAudit({
          actorId: user.id,
          actorRole: user.role,
          action: 'login',
          entity: 'auth',
          reason: 'Inicio de sesión exitoso',
          ipAddress,
          userAgent,
        })

        return {
          id: user.id,
          email: user.email,
          name: user.fullName,
          role: user.role,
          residencyId: user.residencyId ?? null,
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        const email = String(profile?.email ?? user?.email ?? '').trim().toLowerCase()
        if (!email || !email.endsWith('@pacientes.com')) {
          return false
        }
        const dbUser = await prisma.user.findFirst({
          where: { email: { equals: email, mode: 'insensitive' }, isActive: true },
          select: { id: true, fullName: true, role: true, residencyId: true },
        })
        if (!dbUser) {
          return false
        }
        user.id = dbUser.id
        user.name = dbUser.fullName
        user.role = dbUser.role
        user.residencyId = dbUser.residencyId ?? null
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!
        token.role = String(user.role ?? 'READONLY')
        token.residencyId = user.residencyId ?? null
        return token
      }

      if (token?.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: String(token.id) },
          select: { isActive: true, role: true, residencyId: true },
        })
        if (!dbUser || !dbUser.isActive) {
          token.role = 'REVOKED'
          token.residencyId = null
        } else {
          token.role = String(dbUser.role)
          token.residencyId = dbUser.residencyId ?? null
        }
      }

      return token
    },
    async session({ session, token }) {
      if (token.role === 'REVOKED') {
        // Invalidar datos de sesión si el usuario fue desactivado
        return { ...session, user: undefined as unknown as typeof session.user }
      }
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.residencyId = (token.residencyId as string | null) ?? null
      }
      return session
    },
  },
})