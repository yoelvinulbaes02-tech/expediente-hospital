'use client'

import { useState, useRef, useEffect } from 'react'
import { Bold, Highlighter } from 'lucide-react'

type Props = {
  name: string
  placeholder?: string
  rows?: number
  required?: boolean
  defaultValue?: string
  className?: string
  id?: string
  storageKey?: string
  conFormatoClinico?: boolean
}

export function TextareaConDeshacer({
  name,
  placeholder,
  rows = 3,
  required = false,
  defaultValue = '',
  className = '',
  id,
  storageKey,
  conFormatoClinico = false,
}: Props) {
  const [valor, setValor] = useState(defaultValue)
  const [historial, setHistorial] = useState<string[]>([defaultValue])
  const [indiceHistorial, setIndiceHistorial] = useState(0)
  const [ultimoBorrado, setUltimoBorrado] = useState<string | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  // Cargar borrador diferido para evitar renders en cascada y satisfacer a ESLint
  useEffect(() => {
    if (!storageKey || typeof window === 'undefined') return

    const timer = setTimeout(() => {
      try {
        const guardado = sessionStorage.getItem(storageKey)
        if (guardado && guardado !== defaultValue) {
          setValor(guardado)
          setHistorial([defaultValue, guardado])
          setIndiceHistorial(1)
        }
      } catch {
        // En caso de que el almacenamiento local esté bloqueado
      }
    }, 0)

    return () => clearTimeout(timer)
  }, [storageKey, defaultValue])

  const actualizarHistorial = (nuevoValor: string) => {
    // Si se borró más de 12 caracteres de golpe a casi nada (accidente típico táctil)
    if (valor.length > 12 && nuevoValor.length < 4) {
      setUltimoBorrado(valor)
    }

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      setHistorial((prev) => {
        const nuevoHistorial = prev.slice(0, indiceHistorial + 1)
        return [...nuevoHistorial, nuevoValor]
      })
      setIndiceHistorial((prev) => prev + 1)

      if (storageKey && typeof window !== 'undefined') {
        try {
          if (nuevoValor) {
            sessionStorage.setItem(storageKey, nuevoValor)
          } else {
            sessionStorage.removeItem(storageKey)
          }
        } catch {
          // Ignorar error de cuota o permisos
        }
      }
    }, 250)
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const nuevo = e.target.value
    setValor(nuevo)
    actualizarHistorial(nuevo)
  }

  const aplicarFormato = (marcador: '==' | '**', textoBase: string) => {
    const el = textareaRef.current
    if (!el) return

    const inicio = el.selectionStart ?? valor.length
    const fin = el.selectionEnd ?? valor.length
    const seleccionado = valor.slice(inicio, fin)
    const len = marcador.length

    let nuevo = valor
    let selInicio = inicio
    let selFin = fin

    if (
      seleccionado.startsWith(marcador) &&
      seleccionado.endsWith(marcador) &&
      seleccionado.length > len * 2
    ) {
      const sinMarcador = seleccionado.slice(len, -len)
      nuevo = valor.slice(0, inicio) + sinMarcador + valor.slice(fin)
      selInicio = inicio
      selFin = inicio + sinMarcador.length
    } else if (
      inicio >= len &&
      valor.slice(inicio - len, inicio) === marcador &&
      valor.slice(fin, fin + len) === marcador
    ) {
      nuevo = valor.slice(0, inicio - len) + seleccionado + valor.slice(fin + len)
      selInicio = inicio - len
      selFin = fin - len
    } else {
      const textoInterior = seleccionado || textoBase
      const envuelto = `${marcador}${textoInterior}${marcador}`
      nuevo = valor.slice(0, inicio) + envuelto + valor.slice(fin)
      selInicio = inicio + len
      selFin = inicio + len + textoInterior.length
    }

    setValor(nuevo)
    actualizarHistorial(nuevo)

    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(selInicio, selFin)
    })
  }

  const deshacer = () => {
    if (indiceHistorial > 0) {
      const nuevoIndice = indiceHistorial - 1
      const textoAnterior = historial[nuevoIndice]
      setValor(textoAnterior)
      setIndiceHistorial(nuevoIndice)
      if (storageKey && typeof window !== 'undefined') {
        try {
          sessionStorage.setItem(storageKey, textoAnterior)
        } catch {}
      }
    }
  }

  const rehacer = () => {
    if (indiceHistorial < historial.length - 1) {
      const nuevoIndice = indiceHistorial + 1
      const textoSiguiente = historial[nuevoIndice]
      setValor(textoSiguiente)
      setIndiceHistorial(nuevoIndice)
      if (storageKey && typeof window !== 'undefined') {
        try {
          sessionStorage.setItem(storageKey, textoSiguiente)
        } catch {}
      }
    }
  }

  const restaurarBorrado = () => {
    if (ultimoBorrado) {
      setValor(ultimoBorrado)
      setHistorial((prev) => [...prev, ultimoBorrado])
      setIndiceHistorial((prev) => prev + 1)
      setUltimoBorrado(null)
      if (storageKey && typeof window !== 'undefined') {
        try {
          sessionStorage.setItem(storageKey, ultimoBorrado)
        } catch {}
      }
    }
  }

  const puedeDeshacer = indiceHistorial > 0
  const puedeRehacer = indiceHistorial < historial.length - 1

  return (
    <div className="space-y-1">
      <div className="flex flex-wrap items-center justify-between gap-1.5 text-xs select-none">
        {conFormatoClinico ? (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => aplicarFormato('==', 'valor alterado')}
              title="Resaltar valor alterado o importante (==valor==)"
              className="px-2 py-1 rounded border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer"
            >
              <Highlighter className="w-3 h-3" />
              <span>Resaltar valor</span>
            </button>
            <button
              type="button"
              onClick={() => aplicarFormato('**', 'texto')}
              title="Poner en negrita (**texto**)"
              className="px-2 py-1 rounded border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer"
            >
              <Bold className="w-3 h-3" />
              <span>Negrita</span>
            </button>
          </div>
        ) : (
          <div />
        )}

        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={deshacer}
            disabled={!puedeDeshacer}
            title="Deshacer cambio anterior"
            className="px-2.5 py-1 rounded border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed font-semibold text-[11px] flex items-center gap-1 active:bg-slate-200"
          >
            <span>↶</span> Deshacer
          </button>
          <button
            type="button"
            onClick={rehacer}
            disabled={!puedeRehacer}
            title="Rehacer cambio"
            className="px-2.5 py-1 rounded border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed font-semibold text-[11px] flex items-center gap-1 active:bg-slate-200"
          >
            <span>↷</span> Rehacer
          </button>
        </div>
      </div>

      <textarea
        ref={textareaRef}
        id={id}
        name={name}
        rows={rows}
        required={required}
        value={valor}
        onChange={handleChange}
        placeholder={placeholder}
        className={className}
      />

      {ultimoBorrado && (
        <div className="bg-amber-100 border border-amber-300 text-amber-900 px-3 py-1.5 rounded-lg text-xs flex items-center justify-between gap-2 shadow-xs">
          <span>⚠️ ¿Borraste el texto por accidente?</span>
          <button
            type="button"
            onClick={restaurarBorrado}
            className="bg-amber-600 text-white font-bold px-2.5 py-1 rounded hover:bg-amber-700 active:scale-95 transition-all text-xs"
          >
            Restaurar texto
          </button>
        </div>
      )}
    </div>
  )
}