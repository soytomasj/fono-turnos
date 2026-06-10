import { Fragment, useMemo, useState } from 'react'
import { addDays } from 'date-fns'
import useStore from '../store/useStore.js'
import { turnosEnRango } from '../lib/turnos.js'
import {
  diasDeSemana,
  fmtDiaNum,
  fmtFechaLarga,
  fmtMesAnio,
  fmtRangoSemana,
  fromISO,
  hoyISO,
  inicioSemana,
  toISO,
} from '../lib/fechas.js'
import { cap, DIAS, gs } from '../lib/util.js'
import TurnoCard from '../components/TurnoCard.jsx'
import ExtraModal from '../components/ExtraModal.jsx'
import Sheet from '../components/Sheet.jsx'
import {
  IconChevronLeft,
  IconChevronRight,
  IconPlus,
  MarcaCheck,
  MarcaCruz,
  MarcaOnda,
} from '../components/icons.jsx'

// en fin de semana, la base salta al lunes siguiente
function baseInicial() {
  let d = new Date()
  if (d.getDay() === 6) d = addDays(d, 2)
  else if (d.getDay() === 0) d = addDays(d, 1)
  return d
}

const aMin = (hora) => {
  const [h, m] = hora.split(':').map(Number)
  return h * 60 + m
}

// franjas fijas de 45 min: arranca 9:15, último turno 16:30, salida 17:15
const HORAS_GRILLA = ['09:15', '10:00', '10:45', '11:30', '13:30', '14:15', '15:00', '15:45', '16:30']

export default function Agenda() {
  const pacientes = useStore((s) => s.pacientes)
  const agenda = useStore((s) => s.agenda)
  const excepciones = useStore((s) => s.excepciones)
  const pagos = useStore((s) => s.pagos)
  const config = useStore((s) => s.config)

  const [lunes, setLunes] = useState(() => inicioSemana(baseInicial()))
  const [diaSel, setDiaSel] = useState(() => toISO(baseInicial()))
  const [vista, setVista] = useState('grilla')
  const [modalExtra, setModalExtra] = useState(null)
  const [celdaSel, setCeldaSel] = useState(null)

  const dias = diasDeSemana(lunes)

  const turnosSemana = useMemo(
    () => turnosEnRango({ pacientes, agenda, excepciones, pagos, config }, toISO(lunes), toISO(addDays(lunes, 4))),
    [pacientes, agenda, excepciones, pagos, config, lunes],
  )

  const porDia = useMemo(() => {
    const m = {}
    for (const t of turnosSemana) (m[t.fecha] ??= []).push(t)
    return m
  }, [turnosSemana])

  const delDia = porDia[diaSel] ?? []
  const cobrables = delDia.filter((t) => t.cobrable)
  const totalDia = cobrables.reduce((acc, t) => acc + t.monto, 0)

  const moverSemana = (delta) => {
    const offset = Math.round((fromISO(diaSel) - lunes) / 86400000)
    const nuevoLunes = addDays(lunes, delta * 7)
    setLunes(nuevoLunes)
    setDiaSel(toISO(addDays(nuevoLunes, Math.min(Math.max(offset, 0), 4))))
  }

  const irHoy = () => {
    const base = baseInicial()
    setLunes(inicioSemana(base))
    setDiaSel(toISO(base))
  }

  // grilla: todas las franjas fijas, más cualquier turno fuera de horario
  const horas = useMemo(
    () => [...new Set([...HORAS_GRILLA, ...turnosSemana.map((t) => t.hora)])].sort(),
    [turnosSemana],
  )

  const irADia = (fecha) => {
    setDiaSel(fecha)
    setVista('lista')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3 animate-rise">
        <div>
          <div className="label">{cap(fmtMesAnio(lunes))}</div>
          <h1 className="mt-1 text-2xl">{fmtRangoSemana(lunes)}</h1>
        </div>
        <div className="flex items-center gap-1.5">
          <button className="btn-icon" aria-label="Semana anterior" onClick={() => moverSemana(-1)}>
            <IconChevronLeft size={17} />
          </button>
          <button
            className="rounded-full border border-line bg-paper px-3.5 py-2 text-xs font-bold transition hover:border-teal/40"
            onClick={irHoy}
          >
            Hoy
          </button>
          <button className="btn-icon" aria-label="Semana siguiente" onClick={() => moverSemana(1)}>
            <IconChevronRight size={17} />
          </button>
        </div>
      </div>

      <div className="flex justify-end animate-rise" style={{ animationDelay: '40ms' }}>
        <div className="inline-flex rounded-full border border-line bg-paper p-0.5 shadow-soft">
          {['grilla', 'lista'].map((v) => (
            <button
              key={v}
              onClick={() => setVista(v)}
              className={`rounded-full px-4 py-1.5 text-xs font-bold capitalize transition ${
                vista === v ? 'bg-ink text-paper' : 'text-muted hover:text-ink'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {vista === 'lista' ? (
        <>
          <div className="grid grid-cols-5 gap-1.5 animate-rise" style={{ animationDelay: '80ms' }}>
            {dias.map((d) => {
              const iso = toISO(d)
              const sel = iso === diaSel
              const esHoy = iso === hoyISO()
              const tiene = (porDia[iso] ?? []).length > 0
              return (
                <button
                  key={iso}
                  onClick={() => setDiaSel(iso)}
                  className={`flex flex-col items-center rounded-2xl border py-2 transition ${
                    sel
                      ? 'border-teal bg-teal text-paper shadow-soft'
                      : 'border-line bg-paper text-ink hover:border-teal/40'
                  }`}
                >
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider ${sel ? 'text-paper/70' : 'text-muted'}`}
                  >
                    {DIAS[d.getDay()].corto}
                  </span>
                  <span className={`font-mono text-lg leading-tight tnum ${esHoy && !sel ? 'font-semibold text-clay' : ''}`}>
                    {fmtDiaNum(d)}
                  </span>
                  <span className={`h-1 w-1 rounded-full ${tiene ? (sel ? 'bg-paper' : 'bg-clay') : 'bg-transparent'}`} />
                </button>
              )
            })}
          </div>

          <div className="flex items-baseline justify-between gap-3 pt-1">
            <h2 className="text-lg">{cap(fmtFechaLarga(fromISO(diaSel)))}</h2>
            <div className="label shrink-0 tnum">
              {cobrables.length} {cobrables.length === 1 ? 'turno' : 'turnos'} · {gs(totalDia)}
            </div>
          </div>

          {delDia.length === 0 ? (
            <div className="card flex flex-col items-center gap-1 border-dashed px-4 py-8 text-center shadow-none">
              <span className="font-display text-lg text-muted">Día libre</span>
              <span className="text-sm text-muted">Sin turnos para esta fecha.</span>
            </div>
          ) : (
            <div className="space-y-2">
              {delDia.map((t, i) => (
                <TurnoCard key={t.key} turno={t} className="animate-rise" style={{ animationDelay: `${i * 40}ms` }} />
              ))}
            </div>
          )}

          <button
            className="flex w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed border-line py-3 text-sm font-bold text-teal-deep transition hover:border-teal/50 hover:bg-teal-faint"
            onClick={() => setModalExtra({ fecha: diaSel })}
          >
            <IconPlus size={16} /> Turno extra
          </button>
        </>
      ) : (
        <GrillaSemana
          dias={dias}
          horas={horas}
          porDia={porDia}
          onCelda={irADia}
          onSlotLibre={(fecha, hora) => setModalExtra({ fecha, hora })}
          onTurno={(fecha, hora) => setCeldaSel({ fecha, hora })}
        />
      )}

      {modalExtra && (
        <ExtraModal fecha={modalExtra.fecha} hora={modalExtra.hora} onClose={() => setModalExtra(null)} />
      )}

      {celdaSel && (
        <Sheet
          title={`Turno · ${celdaSel.hora}`}
          subtitle={cap(fmtFechaLarga(fromISO(celdaSel.fecha)))}
          onClose={() => setCeldaSel(null)}
          footer={
            <button
              className="btn btn-ghost w-full"
              onClick={() => {
                irADia(celdaSel.fecha)
                setCeldaSel(null)
              }}
            >
              Ver día completo
            </button>
          }
        >
          <div className="space-y-2">
            {(porDia[celdaSel.fecha] ?? [])
              .filter((t) => t.hora === celdaSel.hora)
              .map((t) => (
                <TurnoCard key={t.key} turno={t} />
              ))}
          </div>
        </Sheet>
      )}
    </div>
  )
}

function GrillaSemana({ dias, horas, porDia, onCelda, onSlotLibre, onTurno }) {
  const filas = []
  horas.forEach((h, i) => {
    if (i > 0 && aMin(h) - aMin(horas[i - 1]) > 60) filas.push({ tipo: 'sep', key: `sep-${h}` })
    filas.push({ tipo: 'hora', hora: h, key: h })
  })

  // estado visual de la celda completa: prioriza faltó > pagado > pendiente; cancelados no pintan
  const claseCelda = (ts) => {
    const activos = ts.filter((t) => t.ausencia !== 'cancelo')
    if (activos.length === 0) return 'bg-linen text-muted'
    if (activos.every((t) => t.ausencia === 'ausente')) return 'bg-clay-tint text-clay-deep'
    if (activos.every((t) => t.pagado)) return 'bg-teal text-paper shadow-soft'
    return 'bg-teal-tint text-teal-deep'
  }

  return (
    <div className="card overflow-hidden animate-rise" style={{ animationDelay: '80ms' }}>
      <div className="grid" style={{ gridTemplateColumns: '2.9rem repeat(5, minmax(0, 1fr))' }}>
        {/* esquina: rótulo de la columna horaria, con margen estilo libreta */}
        <div className="flex items-end justify-end border-r border-clay/20 pb-1.5 pr-1.5">
          <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted/60">hs</span>
        </div>
        {dias.map((d, i) => {
          const iso = toISO(d)
          const esHoy = iso === hoyISO()
          return (
            <button
              key={iso}
              onClick={() => onCelda(iso)}
              className={`group flex flex-col items-center gap-0.5 py-2 transition hover:bg-linen/60 ${
                i > 0 ? 'border-l border-line/70' : ''
              } ${esHoy ? 'bg-clay-tint/25' : ''}`}
            >
              <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted">
                {DIAS[d.getDay()].corto}
              </span>
              <span
                className={`grid h-6 w-6 place-items-center rounded-full font-mono text-[13px] tnum transition ${
                  esHoy ? 'bg-clay font-semibold text-paper shadow-soft' : 'text-ink group-hover:bg-linen'
                }`}
              >
                {fmtDiaNum(d)}
              </span>
            </button>
          )
        })}

        {/* doble filete contable bajo el encabezado */}
        <div className="col-span-full h-[3px] border-y border-line" />

        {filas.map((fila) =>
          fila.tipo === 'sep' ? (
            <div
              key={fila.key}
              className="col-span-full flex items-center gap-2.5 border-y border-dashed border-ocre/30 bg-ocre-tint/40 px-4 py-1.5"
            >
              <span className="flex-1 border-t border-dotted border-ocre/40" />
              <span className="text-[9.5px] font-bold uppercase tracking-[0.26em] text-ocre-deep/80">Almuerzo</span>
              <span className="flex-1 border-t border-dotted border-ocre/40" />
            </div>
          ) : (
            <FilaHora
              key={fila.key}
              hora={fila.hora}
              dias={dias}
              porDia={porDia}
              onSlotLibre={onSlotLibre}
              onTurno={onTurno}
              claseCelda={claseCelda}
            />
          ),
        )}
      </div>
    </div>
  )
}

function FilaHora({ hora, dias, porDia, onSlotLibre, onTurno, claseCelda }) {
  return (
    <>
      <div className="flex items-start justify-end border-r border-clay/20 pr-1.5 pt-2.5 font-mono text-[11px] font-medium text-muted tnum">
        {hora.replace(/^0/, '')}
      </div>
      {dias.map((d, i) => {
        const iso = toISO(d)
        const esHoy = iso === hoyISO()
        const celda = (porDia[iso] ?? []).filter((t) => t.hora === hora)
        return (
          <button
            key={iso}
            onClick={() => (celda.length === 0 ? onSlotLibre(iso, hora) : onTurno(iso, hora))}
            className={`group relative min-h-[3.1rem] border-t border-line/80 p-1 text-left transition hover:bg-linen/50 ${
              i > 0 ? 'border-l border-line/70' : ''
            } ${esHoy ? 'bg-clay-tint/15' : ''}`}
          >
            {celda.length === 0 ? (
              <IconPlus
                size={11}
                className="absolute right-1.5 top-1.5 text-muted opacity-0 transition group-hover:opacity-60"
              />
            ) : (
              <div
                className={`flex h-full min-h-[2.6rem] items-center justify-center rounded-[7px] px-2 text-center text-[11px] font-bold leading-tight ${claseCelda(celda)}`}
              >
                <span className="truncate">
                  {celda.map((t, i) => (
                    <Fragment key={t.key}>
                      {i > 0 && ' y '}
                      <span className={t.ausencia === 'cancelo' ? 'line-through opacity-60' : ''}>
                        {t.paciente.nombre.split(' ')[0]}
                      </span>
                      {t.ausencia === 'ausente' ? (
                        <MarcaCruz size={10} className="ml-0.5 inline -rotate-6 text-clay-deep" />
                      ) : t.ausencia === 'cancelo' ? (
                        <MarcaOnda size={10} className="ml-0.5 inline text-ocre-deep" />
                      ) : !t.futuro ? (
                        <MarcaCheck size={10} className="ml-0.5 inline -rotate-6" />
                      ) : null}
                    </Fragment>
                  ))}
                </span>
              </div>
            )}
          </button>
        )
      })}
    </>
  )
}
