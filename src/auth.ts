import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt' },
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

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user || !user.isActive) return null

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
            ipAddress: req?.headers?.get('x-forwarded-for') ?? undefined,
          })
          return null
        }

        await logAudit({
          actorId: user.id,
          actorRole: user.role,
          action: 'login',
          entity: 'auth',
          ipAddress: req?.headers?.get('x-forwarded-for') ?? undefined,
        })

        return {
          id: user.id,
          email: user.email,
          name: user.fullName,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
       // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        const email = profile?.email || ''
        
        // RESTRICCIÓN: Solo permitir correos del dominio @pacientes.com
        if (!email.endsWith('@pacientes.com')) {
          return false // Rechaza cualquier otro dominio (Gmail, Hotmail, etc.)
        }
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id!
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ;(session.user as any).role = token.role as string
      }
      return session
    },
  },
})