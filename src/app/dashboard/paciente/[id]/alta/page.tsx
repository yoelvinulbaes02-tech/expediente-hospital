import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { cerrarExpediente } from '../actions-alta'

export default async function AltaPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session) redirect('/login')

  const { id } = await params;

  const episode = await prisma.episode.findUnique({
    where: { id: id },
    include: { patient: true }
  })

  if (!episode) return <div className="p-8 text-center">Expediente no encontrado.</div>
  if (episode.status === 'closed') return <div className="p-8 text-center text-red-600 font-bold">Este expediente ya está cerrado.</div>

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 flex items-center justify-center">
      <div className="max-w-lg w-full bg-white p-8 rounded-xl shadow-lg border border-slate-200">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
            🚪
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Cerrar Expediente</h1>
          <p className="text-slate-500 mt-2">
            Estás a punto de dar de alta a <strong>{episode.patient.firstName} {episode.patient.lastName}</strong>.
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-lg text-sm mb-6">
          <strong>⚠️ Atención:</strong> Al cerrar el expediente, este pasará a ser de <strong>solo lectura</strong>. No se podrán agregar más notas, signos vitales ni alergias.
        </div>

        <form action={cerrarExpediente} className="space-y-4">
          <input type="hidden" name="episodeId" value={episode.id} />
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Egreso *</label>
            <select name="dischargeType" required className="w-full px-3 py-2 border rounded-lg bg-white text-slate-900">
              <option value="Alta médica">Alta médica</option>
              <option value="Traslado">Traslado a otro centro</option>
              <option value="Fallecimiento">Fallecimiento</option>
              <option value="Alta voluntaria">Alta voluntaria</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Diagnóstico de Egreso *</label>
            <textarea name="diagnosis" required rows={3} className="w-full px-3 py-2 border rounded-lg text-slate-900" placeholder="Ej. Paciente recuperado satisfactoriamente..."></textarea>
          </div>

          <div className="pt-4 flex gap-3">
            <Link href={`/dashboard/paciente/${episode.id}`} className="flex-1 text-center px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors border">
              Cancelar
            </Link>
            <button type="submit" className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors">
              Confirmar Alta
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}