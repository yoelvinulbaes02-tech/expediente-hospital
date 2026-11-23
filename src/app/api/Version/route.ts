import { obtenerSesionSegura } from '@/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await obtenerSesionSegura()
  if (!session?.user?.id) {
    return Response.json({ error: 'No autorizado' }, { status: 401 })
  }

  return Response.json({
    commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? 'local',
    deployment: process.env.VERCEL_DEPLOYMENT_ID ?? null,
  })
}