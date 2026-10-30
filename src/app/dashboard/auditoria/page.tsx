import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AuditoriaPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const session = await auth()
  
  // Solo el ADMIN puede ver la auditoría
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  const { q } = await searchParams
  const busqueda = q || ''

  const registros = await prisma.auditLog.findMany({
    where: busqueda ? {
      OR: [
        { action: { contains: busqueda, mode: 'insensitive' } },
        { entity: { contains: busqueda, mode: 'insensitive' } },
        { actorRole: { contains: busqueda, mode: 'insensitive' } },
      ]
    } : {},
    orderBy: { serverTs: 'desc' },
    take: 100, // Mostramos los últimos 100 registros
  })

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <Link href="/dashboard" className="text-sm text-blue-600 hover:underline mb-2 inline-block">← Volver al Dashboard</Link>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Registro de Auditoría</h1>
            <p className="text-sm text-slate-500">Historial inmutable de acciones (Últimos 100 movimientos)</p>
          </div>
          
          <form className="flex w-full md:w-auto gap-2">
            <input 
              name="q" 
              defaultValue={busqueda}
              placeholder="Buscar por acción o rol..." 
              className="w-full md:w-64 px-3 py-2 border rounded-lg text-sm text-slate-900"
            />
            <button type="submit" className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-900">
              Buscar
            </button>
          </form>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
              <tr>
                <th className="px-4 py-3">Fecha / Hora</th>
                <th className="px-4 py-3">Usuario</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">Acción</th>
                <th className="px-4 py-3">Entidad</th>
                <th className="px-4 py-3">Detalles</th>
              </tr>
            </thead>
            <tbody>
              {registros.map((log) => (
                <tr key={log.id.toString()} className="border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {log.serverTs.toLocaleString('es-DO', { timeZone: 'America/Santo_Domingo' })}
                  </td>
                  <td className="px-4 py-3 text-slate-800 dark:text-slate-200">{log.actorId}</td>
                  <td className="px-4 py-3">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-bold">
                      {log.actorRole}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">{log.action}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{log.entity}</td>
                  <td className="px-4 py-3 text-xs text-slate-500 max-w-xs truncate" title={JSON.stringify(log.newValue)}>
                    {log.reason || JSON.stringify(log.newValue)}
                  </td>
                </tr>
              ))}
              {registros.length === 0 && (
                <tr><td colSpan={6} className="text-center py-8 text-slate-500">No hay registros de auditoría.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}