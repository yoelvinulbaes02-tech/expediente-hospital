'use client'

import { useState, useTransition } from 'react'
import { resetearPassword } from '@/app/dashboard/usuarios/actions'

type Resultado = {
  ok: boolean
  error?: string
  password?: string
  nombre?: string
  correo?: string
}

export function BotonResetClave({ userId, nombre }: { userId: string; nombre: string }) {
  const [pending, startTransition] = useTransition()
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const [copiado, setCopiado] = useState(false)

  function resetear() {
    if (!confirm(`¿Resetear la contraseña de ${nombre}? Su clave actual dejará de funcionar.`)) return
    startTransition(async () => {
      const r = await resetearPassword(userId)
      setCopiado(false)
      setResultado(r)
    })
  }

  async function copiar() {
    if (!resultado?.password) return
    try {
      await navigator.clipboard.writeText(resultado.password)
      setCopiado(true)
    } catch {
      setCopiado(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={resetear}
        disabled={pending}
        className="text-xs font-medium px-2 py-1 rounded border text-amber-600 border-amber-200 hover:bg-amber-50 disabled:opacity-60"
      >
        {pending ? 'Reseteando...' : 'Resetear Clave'}
      </button>

      {resultado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 text-left">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            {resultado.ok && resultado.password ? (
              <>
                <h3 className="text-lg font-bold text-slate-800">Contraseña reseteada</h3>
                <p className="mt-1 text-sm text-slate-600">
                  Clave temporal de <strong>{resultado.nombre}</strong> ({resultado.correo}):
                </p>
                <p className="mt-3 select-all rounded-lg border border-slate-300 bg-slate-100 px-3 py-3 text-center font-mono text-xl font-bold tracking-wider text-slate-900">
                  {resultado.password}
                </p>
                <p className="mt-3 rounded-lg border border-amber-300 bg-amber-50 p-2 text-xs text-amber-900">
                  Se muestra <strong>una sola vez</strong> y no queda guardada en ningún registro.
                  Cópiala y entrégasela al usuario; deberá cambiarla al iniciar sesión.
                </p>
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={copiar}
                    className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    {copiado ? '✓ Copiada' : 'Copiar clave'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setResultado(null)}
                    className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Cerrar
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-lg font-bold text-red-700">No se pudo resetear</h3>
                <p className="mt-2 text-sm text-slate-700">{resultado.error ?? 'Ocurrió un error.'}</p>
                <button
                  type="button"
                  onClick={() => setResultado(null)}
                  className="mt-4 w-full rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cerrar
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}