export const dynamic = 'force-dynamic'

export async function GET() {
  return Response.json({
    commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? 'local',
    deployment: process.env.VERCEL_DEPLOYMENT_ID ?? null,
  })
}