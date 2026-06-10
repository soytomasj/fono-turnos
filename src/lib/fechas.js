import { addDays, addMonths, endOfMonth, format, startOfMonth, startOfWeek } from 'date-fns'
import { es } from 'date-fns/locale'

export const toISO = (d) => format(d, 'yyyy-MM-dd')

// parse local, sin sorpresas de timezone
export function fromISO(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export const hoyISO = () => toISO(new Date())

export const inicioSemana = (d) => startOfWeek(d, { weekStartsOn: 1 })

export const diasDeSemana = (lunes, n = 5) => Array.from({ length: n }, (_, i) => addDays(lunes, i))

export const periodoDe = (d) => format(d, 'yyyy-MM')
export const periodoActual = () => periodoDe(new Date())

export function rangoMes(periodo) {
  const base = fromISO(`${periodo}-01`)
  return { desde: toISO(startOfMonth(base)), hasta: toISO(endOfMonth(base)) }
}

export const sumarMes = (periodo, delta) => periodoDe(addMonths(fromISO(`${periodo}-01`), delta))

const f = (d, fmt) => format(d, fmt, { locale: es })

export const fmtDiaNum = (d) => f(d, 'd')
export const fmtDiaLetra = (d) => f(d, 'EEEEE')
export const fmtFechaLarga = (d) => f(d, "EEEE d 'de' MMMM")
export const fmtFechaCorta = (d) => f(d, 'EEE d MMM')
export const fmtDiaMes = (d) => f(d, 'd MMM')
export const fmtMesAnio = (d) => f(d, 'MMMM yyyy')
export const fmtRangoSemana = (lunes) => `${f(lunes, 'd MMM')} – ${f(addDays(lunes, 4), 'd MMM')}`
