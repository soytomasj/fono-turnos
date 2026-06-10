export const DIAS = [
  { corto: 'Dom', largo: 'Domingo', letra: 'D' },
  { corto: 'Lun', largo: 'Lunes', letra: 'L' },
  { corto: 'Mar', largo: 'Martes', letra: 'M' },
  { corto: 'Mié', largo: 'Miércoles', letra: 'M' },
  { corto: 'Jue', largo: 'Jueves', letra: 'J' },
  { corto: 'Vie', largo: 'Viernes', letra: 'V' },
  { corto: 'Sáb', largo: 'Sábado', letra: 'S' },
]

export const DIAS_HABILES = [1, 2, 3, 4, 5]

const nf = new Intl.NumberFormat('es-PY')

export const gs = (n) => `₲ ${nf.format(n ?? 0)}`

export const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s)

// "aGusTín peReZ" -> "Agustín Perez"
export const nombrePropio = (s) =>
  s
    .trim()
    .replace(/\s+/g, ' ')
    .toLocaleLowerCase('es')
    .replace(/(^|\s)\p{L}/gu, (c) => c.toLocaleUpperCase('es'))
