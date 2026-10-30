import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { crearUsuario } from './actions'

export default async function UsuariosPage() {
  const session = await auth()
  
  // Solo el ADMIN puede entrar aquí
  if (!session || (session.user as any)?.role !== 'ADMIN') {
    redirect('/dashboard')
  }

  const usuarios = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <Link href="/dashboard" className="text-sm text-blue-600 hover:underline mb-2 inline-block">← Volver al Dashboard</Link>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Administración de Usuarios</h1>
          </div>
        </div>

        {/* Formulario para crear usuario */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 mb-6">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Crear Nuevo Usuario</h2>
          <form action={crearUsuario} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input name="fullName" placeholder="Nombre completo (Ej. Dr. Pedro López)" required className="px-3 py-2 border rounded-lg text-slate-900" />
            <input name="email" type="email" placeholder="Correo electrónico" required className="px-3 py-2 border rounded-lg text-slate-900" />
            <input name="password" type="password" placeholder="Contraseña temporal" required className="px-3 py-2 border rounded-lg text-slate-900" />
            <select name="role" required className="px-3 py-2 border rounded-lg text-slate-900 bg-white">
              <option value="DOCTOR">Médico Tratante</option>
              <option value="RESIDENT">Residente</option>
              <option value="NURSE">Enfermería</option>
              <option value="LAB">Laboratorio/Imágenes</option>
              <option value="READONLY">Solo Lectura</option>
              <option value="ADMIN">Administrador</option>
            </select>
            <button type="submit" className="md:col-span-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Crear Usuario
            </button>
          </form>
        </div>

        {/* Lista de usuarios */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Correo</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id} className="border-b dark:border-slate-700">
                  <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-100">{u.fullName}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{u.email}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{u.role}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${u.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {u.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}