'use server'

import { prisma } from '@/lib/prisma'
import { logAudit } from '@/lib/audit'
import { exigirPermiso, volverAlExpediente } from '@/lib/permisos'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const CATEGORIAS = ['analisis', 'estudio', 'indicacion', 'otro']

// El formulario manda hora local de RD (UTC-4, sin horario de verano)
function fechaRD(valor: string): Date | null {
  if (!valor) return null
  const base = valor.length === 16 ? `${valor}:00` : valor
  const fecha = new Date(`${base}-04:00`)
  return Number.isNaN(fecha.getTime()) ? null : fecha
}

const textoFecha = (f: Date) => f.toLocaleString('es-DO', { timeZone: 'America/Santo_Domingo' })

export async function crearTarea(formData: FormData): Promise<void> {
  const episodeId = String(formData.get('episodeId') ?? '')
  const { userId, role, email, episode } = await exigirPermiso(episodeId, 'registrar')

  const titulo = String(formData.get('titulo') ?? '').trim()
  const categoriaForm = String(formData.get('categoria') ?? 'otro')
  const categoria = CATEGORIAS.includes(categoriaForm) ? categoriaForm : 'otro'
  const programada = fechaRD(String(formData.get('programada') ?? ''))

  if (titulo.length < 3) volverAlExpediente(episodeId, 'Escribe el nombre de la tarea o análisis')
  if (titulo.length > 200) volverAlExpediente(episodeId, 'El nombre de la tarea es demasiado largo')

  const tarea = await prisma.task.create({
    data: { episodeId, title: titulo, category: categoria, dueAt: programada, createdBy: email },
  })

  await logAudit({
    actorId: userId,
    actorRole: role,
    action: 'create',
    entity: 'task',
    entityId: tarea.id,
    patientId: episode.patientId,
    episodeId,
    newValue: {
      tarea: titulo,
      categoria,
      programadaPara: programada ? textoFecha(programada) : null,
    },
    reason: 'Tarea agregada al checklist',
  })

  revalidatePath(`/dashboard/paciente/${episodeId}`)
  redirect(`/dashboard/paciente/${episodeId}`)
}

export async function marcarTarea(formData: FormData): Promise<void> {
  const taskId = String(formData.get('taskId') ?? '')
  const accion = String(formData.get('accion') ?? '')
  const motivo = String(formData.get('motivo') ?? '').trim()

  const tarea = await prisma.task.findUnique({ where: { id: taskId } })
  if (!tarea) redirect('/dashboard')
  const episodeId = tarea.episodeId

  // Cancelar: solo el médico a cargo. Marcar/reabrir: personal clínico y laboratorio.
  const { userId, role, email, episode } = await exigirPermiso(
    episodeId,
    accion === 'cancelar' ? 'editar' : 'tareas'
  )

  let estadoNuevo = ''
  let razon = ''

  if (accion === 'hecha') {
    const r = await prisma.task.updateMany({
      where: { id: taskId, status: 'pendiente' },
      data: { status: 'hecha', doneBy: email, doneAt: new Date() },
    })
    if (r.count === 0) volverAlExpediente(episodeId, 'Esta tarea ya fue actualizada por otra persona')
    estadoNuevo = 'hecha'
    razon = 'Tarea marcada como realizada'
  } else if (accion === 'reabrir') {
    const r = await prisma.task.updateMany({
      where: { id: taskId, status: 'hecha' },
      data: { status: 'pendiente', doneBy: null, doneAt: null },
    })
    if (r.count === 0) volverAlExpediente(episodeId, 'Esta tarea ya fue actualizada por otra persona')
    estadoNuevo = 'pendiente'
    razon = 'Tarea reabierta'
  } else if (accion === 'cancelar') {
    if (motivo.length < 3) volverAlExpediente(episodeId, 'Escribe el motivo de la cancelación')
    const r = await prisma.task.updateMany({
      where: { id: taskId, status: 'pendiente' },
      data: { status: 'cancelada', cancelReason: motivo },
    })
    if (r.count === 0) volverAlExpediente(episodeId, 'Esta tarea ya fue actualizada por otra persona')
    estadoNuevo = 'cancelada'
    razon = `Tarea cancelada: ${motivo}`
  } else {
    redirect(`/dashboard/paciente/${episodeId}`)
  }

  await logAudit({
    actorId: userId,
    actorRole: role,
    action: 'update',
    entity: 'task',
    entityId: taskId,
    patientId: episode.patientId,
    episodeId,
    oldValue: { tarea: tarea.title, estado: tarea.status },
    newValue: { tarea: tarea.title, estado: estadoNuevo },
    reason: razon,
  })

  revalidatePath(`/dashboard/paciente/${episodeId}`)
  redirect(`/dashboard/paciente/${episodeId}`)
}