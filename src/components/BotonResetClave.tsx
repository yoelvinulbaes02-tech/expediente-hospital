'use client'

export function BotonResetClave() {
  return (
    <button
      type="submit"
      onClick={() =>
        alert('Contraseña reseteada. Revisa la pantalla de Auditoría para ver la nueva clave temporal.')
      }
      className="text-xs font-medium px-2 py-1 rounded border text-amber-600 border-amber-200 hover:bg-amber-50"
    >
      Resetear Clave
    </button>
  )
}