'use client'

import { useRef, useState } from 'react'
import { Bold, Eye, EyeOff, Highlighter, Plus } from 'lucide-react'
import { renderTextoClinico } from '@/lib/texto-clinico'

type Props = {
  name: string
  defaultValue?: string
  rows?: number
  placeholder?: string
  className?: string
  required?: boolean
  id?: string
}

export function TextareaTratamiento({
  name,
  defaultValue = '',
  rows = 5,
  placeholder,
  className = '',
  required = false,
  id,
}: Props) {
  const [valor, setValor] = useState(defaultValue)
  const [vistaPrevia, setVistaPrevia] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  function aplicarFormato(marcador: '==' | '**', placeholderTexto: string) {
    const el = textareaRef.current
    if (!el) return

    const inicio = el.selectionStart ?? valor.length
    const fin = el.selectionEnd ?? valor.length
    const seleccionado = valor.slice(inicio, fin)
    const len = marcador.length

    // Si el texto seleccionado ya está envuelto con el marcador, lo quitamos (toggle)
    if (
      seleccionado.startsWith(marcador) &&
      seleccionado.endsWith(marcador) &&
      seleccionado.length > len * 2
    ) {
      const sinMarcador = seleccionado.slice(len, -len)
      const nuevo = valor.slice(0, inicio) + sinMarcador + valor.slice(fin)
      setValor(nuevo)
      requestAnimationFrame(() => {
        el.focus()
        el.setSelectionRange(inicio, inicio + sinMarcador.length)
      })
      return
    }

    // Si justo fuera de la selección ya existen los marcadores, los quitamos
    if (
      inicio >= len &&
      valor.slice(inicio - len, inicio) === marcador &&
      valor.slice(fin, fin + len) === marcador
    ) {
      const nuevo =
        valor.slice(0, inicio - len) + seleccionado + valor.slice(fin + len)
      setValor(nuevo)
      requestAnimationFrame(() => {
        el.focus()
        el.setSelectionRange(inicio - len, fin - len)
      })
      return
    }

    const textoInterior = seleccionado || placeholderTexto
    const envuelto = `${marcador}${textoInterior}${marcador}`
    const nuevo = valor.slice(0, inicio) + envuelto + valor.slice(fin)
    setValor(nuevo)

    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(inicio + len, inicio + len + textoInterior.length)
    })
  }

  function agregarLineaResaltada() {
    const el = textareaRef.current
    const plantilla = 'Nueva indicación'
    const prefijo = valor.trim().length > 0 && !valor.endsWith('\n') ? '\n' : ''
    const linea = `${prefijo}• ==${plantilla}==`
    const inicioNuevo = valor.length + prefijo.length + 4
    const nuevo = valor + linea
    setValor(nuevo)
    setVistaPrevia(false)

    requestAnimationFrame(() => {
      if (!el) return
      el.focus()
      el.setSelectionRange(inicioNuevo, inicioNuevo + plantilla.length)
    })
  }

  function manejarAtajo(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
      e.preventDefault()
      aplicarFormato('**', 'texto en negrita')
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'h') {
      e.preventDefault()
      aplicarFormato('==', 'texto resaltado')
    }
  }

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap items-center justify-between gap-1.5">
        <div className="flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={() => {
              setVistaPrevia(false)
              aplicarFormato('==', 'indicación resaltada')
            }}
            title="Resaltar texto seleccionado (==texto==)"
            className="inline-flex items-center gap-1 px-2 py-1 rounded border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-[11px] cursor-pointer transition-colors"
          >
            <Highlighter className="w-3 h-3" />
            <span>Resaltar</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setVistaPrevia(false)
              aplicarFormato('**', 'texto en negrita')
            }}
            title="Poner en negrita (Ctrl+B)"
            className="inline-flex items-center gap-1 px-2 py-1 rounded border border-slate-300 dark:border-slate-600 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 font-bold text-[11px] cursor-pointer transition-colors"
          >
            <Bold className="w-3 h-3" />
            <span>Negrita</span>
          </button>

          <button
            type="button"
            onClick={agregarLineaResaltada}
            title="Agregar una nueva línea ya resaltada al final"
            className="inline-flex items-center gap-1 px-2 py-1 rounded border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 text-blue-800 dark:text-blue-200 font-semibold text-[11px] cursor-pointer transition-colors"
          >
            <Plus className="w-3 h-3" />
            <span>Agregar resaltado</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setVistaPrevia((v) => !v)}
          className="inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
        >
          {vistaPrevia ? (
            <>
              <EyeOff className="w-3 h-3" />
              <span>Editar</span>
            </>
          ) : (
            <>
              <Eye className="w-3 h-3" />
              <span>Vista previa</span>
            </>
          )}
        </button>
      </div>

      {/* Mantenemos el textarea siempre montado para que FormData envíe el valor incluso en vista previa */}
      <textarea
        ref={textareaRef}
        id={id}
        name={name}
        rows={rows}
        required={required}
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        onKeyDown={manejarAtajo}
        placeholder={placeholder}
        className={`${className} ${vistaPrevia ? 'hidden' : ''}`}
      />

      {vistaPrevia && (
        <div className="w-full min-h-24 p-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-900/60 font-mono text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
          {valor.trim() ? (
            renderTextoClinico(valor)
          ) : (
            <span className="text-slate-400 italic">Sin contenido para previsualizar.</span>
          )}
        </div>
      )}

      <p className="text-[10px] text-slate-400">
        Selecciona texto y pulsa <strong>Resaltar</strong> (<code className="font-mono">==texto==</code>) o{' '}
        <strong>Negrita</strong> (<code className="font-mono">**texto**</code>).
      </p>
    </div>
  )
}
