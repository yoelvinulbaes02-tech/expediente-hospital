import type { ReactNode } from 'react'

export const ALERTA_LAB_PREFIJO = '[[ALERTA]] '

export function parseResultadoLab(raw: string | null | undefined): {
  esImportante: boolean
  texto: string
} {
  const valor = raw ?? ''
  if (valor.startsWith(ALERTA_LAB_PREFIJO)) {
    return {
      esImportante: true,
      texto: valor.slice(ALERTA_LAB_PREFIJO.length),
    }
  }
  if (valor.startsWith('[[ALERTA]]')) {
    return {
      esImportante: true,
      texto: valor.slice('[[ALERTA]]'.length).trimStart(),
    }
  }
  return {
    esImportante: false,
    texto: valor,
  }
}

export function marcarResultadoLab(texto: string, esImportante: boolean): string {
  const limpio = parseResultadoLab(texto).texto.trim()
  if (!limpio) return ''
  return esImportante ? `${ALERTA_LAB_PREFIJO}${limpio}` : limpio
}

export function limpiarMarcadoresClinicos(texto: string | null | undefined): string {
  return parseResultadoLab(texto).texto.replace(/==/g, '').replace(/\*\*/g, '')
}

const TOKEN_REGEX =
  /(\*\*==[^\n]+?==\*\*|==\*\*[^\n]+?\*\*==|==[^\n]+?==|\*\*[^\n]+?\*\*)/g

export function renderTextoClinico(texto: string | null | undefined): ReactNode {
  const limpio = parseResultadoLab(texto).texto
  if (!limpio) return null

  const partes = limpio.split(TOKEN_REGEX)

  return partes.map((parte, idx) => {
    if (!parte) return null

    if (
      (parte.startsWith('**==') && parte.endsWith('==**') && parte.length > 8) ||
      (parte.startsWith('==**') && parte.endsWith('**==') && parte.length > 8)
    ) {
      const contenido = parte.slice(4, -4)
      return (
        <mark
          key={idx}
          className="bg-amber-200/95 dark:bg-amber-500/35 text-slate-950 dark:text-amber-100 font-extrabold px-1 py-0.5 rounded-sm"
        >
          {contenido}
        </mark>
      )
    }

    if (parte.startsWith('==') && parte.endsWith('==') && parte.length > 4) {
      const contenido = parte.slice(2, -2)
      return (
        <mark
          key={idx}
          className="bg-amber-200/90 dark:bg-amber-500/30 text-slate-950 dark:text-amber-100 font-semibold px-1 py-0.5 rounded-sm"
        >
          {contenido}
        </mark>
      )
    }

    if (parte.startsWith('**') && parte.endsWith('**') && parte.length > 4) {
      const contenido = parte.slice(2, -2)
      return (
        <strong key={idx} className="font-extrabold text-slate-950 dark:text-white">
          {contenido}
        </strong>
      )
    }

    return <span key={idx}>{parte}</span>
  })
}
