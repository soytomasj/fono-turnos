import { useState } from 'react'
import { addDays, addMonths, startOfMonth } from 'date-fns'
import { fmtMesAnio, fromISO, hoyISO, inicioSemana, toISO } from '../lib/fechas.js'
import { cap } from '../lib/util.js'
import { IconChevronLeft, IconChevronRight } from './icons.jsx'

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
const LETRAS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

const fmtFecha = (iso) => {
  const [y, m, d] = iso.split('-').map(Number)
  return `${d} ${cap(MESES[m - 1])} ${y}`
}

export default function VigenciaPicker({ desde, hasta, onDesde, onHasta }) {
  const hoy = hoyISO()
  const [activo, setActivo] = useState(null)
  const [vista, setVista] = useState(() => startOfMonth(new Date()))

  const abrir = (campo) => {
    setActivo(campo)
    const base = (campo === 'desde' ? desde : hasta) || desde || hasta || hoy
    setVista(startOfMonth(fromISO(base)))
  }

  const elegir = (iso) => {
    if (activo === 'desde') onDesde(iso)
    else onHasta(iso)
    setActivo(null)
  }

  const limpiar = () => {
    if (activo === 'desde') onDesde(null)
    else onHasta(null)
    setActivo(null)
  }

  const deshabilitado = (iso) => {
    if (activo === 'hasta' && desde) return iso < desde
    if (activo === 'desde' && hasta) return iso > hasta
    return false
  }

  const celdas = Array.from({ length: 42 }, (_, i) => addDays(inicioSemana(vista), i))

  return (
    <div>
      <div className="label">Vigencia en calendario</div>
      <div className="mt-1.5 grid grid-cols-2 gap-3">
        {[
          { campo: 'desde', valor: desde, titulo: 'Desde' },
          { campo: 'hasta', valor: hasta, titulo: 'Hasta' },
        ].map(({ campo, valor, titulo }) => (
          <button
            key={campo}
            onClick={() => abrir(campo)}
            className={`rounded-xl border bg-paper px-3.5 py-2.5 text-left transition ${
              activo === campo ? 'border-teal ring-2 ring-teal/15' : 'border-line hover:border-teal/40'
            }`}
          >
            <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-muted">{titulo}</span>
            {valor ? (
              <span className="tnum mt-0.5 block font-mono text-[14px]">{fmtFecha(valor)}</span>
            ) : (
              <span className="mt-0.5 block text-[14px] text-muted/60">Sin límite</span>
            )}
          </button>
        ))}
      </div>

      {activo && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 animate-fade bg-ink/30 backdrop-blur-[2px]" onClick={() => setActivo(null)} />
          <div className="card relative w-full max-w-[20rem] animate-pop overflow-hidden shadow-modal">
            <div className="flex items-center justify-between border-b border-line bg-linen/50 px-2 py-2">
              <button aria-label="Mes anterior" className="btn-icon h-8 w-8" onClick={() => setVista(addMonths(vista, -1))}>
                <IconChevronLeft size={15} />
              </button>
              <div className="text-center">
                <div className="label">{activo === 'desde' ? 'Desde' : 'Hasta'}</div>
                <div className="font-display text-lg leading-tight">{cap(fmtMesAnio(vista))}</div>
              </div>
              <button aria-label="Mes siguiente" className="btn-icon h-8 w-8" onClick={() => setVista(addMonths(vista, 1))}>
                <IconChevronRight size={15} />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-y-0.5 px-3 pb-2 pt-2">
              {LETRAS.map((l, i) => (
                <div key={i} className="py-1 text-center text-[10px] font-bold uppercase tracking-wide text-muted">
                  {l}
                </div>
              ))}
              {celdas.map((d) => {
                const iso = toISO(d)
                const otroMes = d.getMonth() !== vista.getMonth()
                const extremo = iso === desde || iso === hasta
                const enRango = desde && hasta && iso > desde && iso < hasta
                return (
                  <button
                    key={iso}
                    disabled={deshabilitado(iso)}
                    onClick={() => elegir(iso)}
                    className={`tnum relative mx-auto flex h-9 w-9 items-center justify-center rounded-full font-mono text-[13px] transition active:scale-95 disabled:pointer-events-none disabled:opacity-25 ${
                      extremo
                        ? 'bg-teal font-bold text-paper shadow-soft'
                        : enRango
                          ? 'bg-teal-faint text-teal-deep'
                          : otroMes
                            ? 'text-muted/40 hover:bg-linen'
                            : 'hover:bg-teal-faint hover:text-teal-deep'
                    }`}
                  >
                    {d.getDate()}
                    {iso === hoy && !extremo && (
                      <span className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-clay" />
                    )}
                  </button>
                )
              })}
            </div>

            <div className="border-t border-line p-2">
              <button
                className="w-full rounded-lg py-2 text-xs font-bold text-clay-deep transition hover:bg-clay-tint/50"
                onClick={limpiar}
              >
                Sin límite ∞
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
