// Quita acentos y pasa a minúsculas: "María" -> "maria"
export function normalizar(texto?: string | null) {
  return (texto ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}