'use client'

import { useActionState } from 'react'
import { crearUsuario } from '@/app/dashboard/usuarios/actions'

type Estado = {
  ok?: boolean
  error?: string
  campo?: 'fullName' | 'email' | 'password' | 'role'
  creado?: string
  valores?: { fullName?: string; email?: string; role?: string }
}

export function FormularioCrearUsuario() {
  const [state, formAction, pending] = useActionState(crearUsuario, {} as Estado)

  const borde = (campo: string) =>
    state.error && state.campo === campo ? 'border-red-500' : ''

  const errorDe = (campo: string) =>
    state.error && state.campo === campo ? (
      <p className="mt-1 text-sm font-medium text-red-600">{state.error}</p>
    ) : null

  return (
    <form action={formAction} className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <input
          name="fullName"
          defaultValue={state.valores?.fullName ?? ''}
          placeholder="Nombre completo (Ej. Dr. Pedro López)"
          required
          className={`w-full px-3 py-2 border rounded-lg text-slate-900 ${borde('fullName')}`}
        />
        {errorDe('fullName')}
      </div>

      <div>
        <input
          name="email"
          type="email"
          defaultValue={state.valores?.email ?? ''}
          placeholder="Correo electrónico"
          required
          className={`w-full px-3 py-2 border rounded-lg text-slate-900 ${borde('email')}`}
        />
        {errorDe('email')}
      </div>

      <div>
        <input
          name="password"
          type="password"
          placeholder="Contraseña temporal"
          required
          className={`w-full px-3 py-2 border rounded-lg text-slate-900 ${borde('password')}`}
        />
        {errorDe('password')}
      </div>

      <div>
        <select
          name="role"
          required
          defaultValue={state.valores?.role || 'DOCTOR'}
          className={`w-full px-3 py-2 border rounded-lg text-slate-900 bg-white ${borde('role')}`}
        >
          <option value="DOCTOR">Médico Tratante</option>
          <option value="RESIDENT">Residente</option>
          <option value="NURSE">Enfermería</option>
          <option value="LAB">Laboratorio/Imágenes</option>
          <option value="READONLY">Solo Lectura</option>
          <option value="ADMIN">Administrador</option>
        </select>
        {errorDe('role')}
      </div>

      {state.ok && state.creado && (
        <p className="md:col-span-2 rounded-lg border border-green-300 bg-green-50 p-2 text-sm font-medium text-green-700">
          Usuario creado: {state.creado}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="md:col-span-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
      >
        {pending ? 'Creando...' : 'Crear Usuario'}
      </button>
    </form>
  )
}