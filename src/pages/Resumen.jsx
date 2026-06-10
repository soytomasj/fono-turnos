import { useMemo, useState } from 'react'
import useStore from '../store/useStore.js'
import { cuentaPaciente, resumenPaciente, turnosEnRango } from '../lib/turnos.js'
import { fmtDiaMes, fmtMesAnio, fromISO, hoyISO, periodoActual, rangoMes, sumarMes } from '../lib/fechas.js'
import { cap, gs } from '../lib/util.js'
import Sheet from '../components/Sheet.jsx'
import MoneyInput from '../components/MoneyInput.jsx'
import { IconCheck, IconChevronLeft, IconChevronRight, IconX } from '../components/icons.jsx'

function AbonoSheet({ paciente, saldo, onClose }) {
  const addAbono = useStore((s) => s.addAbono)
  const [monto, setMonto] = useState(saldo > 0 ? saldo : null)
  const [fecha, setFecha] = useState(hoyISO())

  const guardar = () => {
    if (!monto) return
    addAbono({ pacienteId: paciente.id, monto, fecha })
    onClose()
  }

  return (
    <Sheet
      title="Registrar pago"
      subtitle={paciente.nombre}
      onClose={onClose}
      footer={
        <div className="flex gap-2">
          <button className="btn btn-ghost flex-1" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn btn-primary flex-1" disabled={!monto} onClick={guardar}>
            Registrar
          </button>
        </div>
      }
    >
      <div className="space-y-3.5">
        <div>
          <label className="label" htmlFor="abono-monto">
            Monto recibido
          </label>
          <div className="mt-1.5">
            <MoneyInput id="abono-monto" value={monto} onChange={setMonto} autoFocus />
          </div>
          {saldo > 0 && <p className="mt-1.5 text-[13px] text-muted">Saldo pendiente: {gs(saldo)}.</p>}
        </div>
        <div className="w-1/2">
          <label className="label" htmlFor="abono-fecha">
            Fecha
          </label>
          <input
            id="abono-fecha"
            type="date"
            className="input tnum mt-1.5 font-mono"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
          />
        </div>
      </div>
    </Sheet>
  )
}

export default function Resumen() {
  const pacientes = useStore((s) => s.pacientes)
  const agenda = useStore((s) => s.agenda)
  const excepciones = useStore((s) => s.excepciones)
  const pagos = useStore((s) => s.pagos)
  const config = useStore((s) => s.config)
  const setAusencia = useStore((s) => s.setAusencia)
  const togglePagoMensual = useStore((s) => s.togglePagoMensual)

  const removeAbono = useStore((s) => s.removeAbono)

  const [periodo, setPeriodo] = useState(periodoActual)
  const [expandido, setExpandido] = useState(null)
  const [pagoA, setPagoA] = useState(null) // fila | null

  const turnosMes = useMemo(() => {
    const { desde, hasta } = rangoMes(periodo)
    return turnosEnRango({ pacientes, agenda, excepciones, pagos, config }, desde, hasta)
  }, [pacientes, agenda, excepciones, pagos, config, periodo])

  const filas = useMemo(
    () =>
      pacientes
        .filter((p) => turnosMes.some((t) => t.pacienteId === p.id))
        .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
        .map((p) => {
          const turnos = turnosMes.filter((t) => t.pacienteId === p.id)
          const abonos = pagos
            .filter((x) => x.tipo === 'abono' && x.pacienteId === p.id && x.fechaPago.startsWith(periodo))
            .sort((a, b) => a.fechaPago.localeCompare(b.fechaPago))
          const pagadoMes = pagos
            .filter(
              (x) =>
                x.pacienteId === p.id &&
                (x.tipo === 'mensual'
                  ? x.periodo === periodo
                  : (x.tipo === 'abono' ? x.fechaPago : x.fecha)?.startsWith(periodo)),
            )
            .reduce((acc, x) => acc + (x.monto ?? 0), 0)
          return {
            p,
            turnos,
            abonos,
            pagadoMes,
            r: resumenPaciente(turnos, p, pagos, periodo),
            cuenta: cuentaPaciente({ pacientes, agenda, excepciones, pagos, config }, p),
          }
        }),
    [pacientes, agenda, excepciones, turnosMes, pagos, config, periodo],
  )

  const tot = filas.reduce(
    (a, f) => ({
      total: a.total + f.r.total,
      pagado: a.pagado + f.pagadoMes,
      saldo: a.saldo + Math.max(f.cuenta.saldo, 0),
    }),
    { total: 0, pagado: 0, saldo: 0 },
  )

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3 animate-rise">
        <div>
          <div className="label">Resumen del mes</div>
          <h1 className="mt-1 text-2xl">{cap(fmtMesAnio(fromISO(`${periodo}-01`)))}</h1>
        </div>
        <div className="flex items-center gap-1.5">
          <button className="btn-icon" aria-label="Mes anterior" onClick={() => setPeriodo(sumarMes(periodo, -1))}>
            <IconChevronLeft size={17} />
          </button>
          <button
            className="rounded-full border border-line bg-paper px-3.5 py-2 text-xs font-bold transition hover:border-teal/40"
            onClick={() => setPeriodo(periodoActual())}
          >
            Hoy
          </button>
          <button className="btn-icon" aria-label="Mes siguiente" onClick={() => setPeriodo(sumarMes(periodo, 1))}>
            <IconChevronRight size={17} />
          </button>
        </div>
      </div>

      <div className="card grid grid-cols-3 divide-x divide-line overflow-hidden animate-rise" style={{ animationDelay: '40ms' }}>
        {[
          ['A cobrar', tot.total, 'text-ink'],
          ['Cobrado', tot.pagado, 'text-teal-deep'],
          ['Saldo', tot.saldo, tot.saldo > 0 ? 'text-clay-deep' : 'text-teal-deep'],
        ].map(([etiqueta, valor, clase]) => (
          <div key={etiqueta} className="px-2 py-3.5 text-center">
            <div className="label">{etiqueta}</div>
            <div className={`mt-1 font-mono text-[15px] font-semibold tnum ${clase}`}>{gs(valor)}</div>
          </div>
        ))}
      </div>

      {filas.length === 0 ? (
        <div className="card flex flex-col items-center gap-1 border-dashed px-4 py-10 text-center shadow-none animate-rise" style={{ animationDelay: '80ms' }}>
          <span className="font-display text-lg text-muted">Sin sesiones</span>
          <span className="text-sm text-muted">No hay turnos en este mes.</span>
        </div>
      ) : (
        <div className="space-y-2">
          {filas.map((f, i) => {
            const mensual = f.p.modalidadPago === 'mensual'
            const mesPagado =
              mensual && pagos.some((p) => p.tipo === 'mensual' && p.pacienteId === f.p.id && p.periodo === periodo)
            const exp = expandido === f.p.id
            return (
              <div key={f.p.id} className="card p-4 animate-rise" style={{ animationDelay: `${80 + i * 40}ms` }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-[17px]">{f.p.nombre}</h3>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {mensual ? (
                        <span className="chip bg-clay-tint text-clay-deep">Mensual</span>
                      ) : (
                        <span className="chip bg-teal-tint text-teal-deep">Por sesión</span>
                      )}
                      {f.cuenta.saldo > 0 ? (
                        <span className="chip bg-ocre-tint text-ocre-deep tnum">Debe {gs(f.cuenta.saldo)}</span>
                      ) : f.cuenta.saldo < 0 ? (
                        <span className="chip bg-teal-tint text-teal-deep tnum">A favor {gs(-f.cuenta.saldo)}</span>
                      ) : (
                        <span className="chip bg-teal-tint text-teal-deep">Al día</span>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="label tnum">
                      {f.r.sesiones} {f.r.sesiones === 1 ? 'sesión' : 'sesiones'}
                    </div>
                    <div className="mt-0.5 font-mono text-sm font-semibold tnum">{gs(f.r.total)}</div>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  {mensual && (
                    <button
                      className={`btn btn-sm ${mesPagado ? 'btn-primary' : 'btn-soft'}`}
                      onClick={() => togglePagoMensual({ pacienteId: f.p.id, periodo, monto: f.r.total })}
                    >
                      {mesPagado ? (
                        <>
                          <IconCheck size={13} /> Mes pagado
                        </>
                      ) : (
                        'Marcar mes pagado'
                      )}
                    </button>
                  )}
                  <button className="btn btn-soft btn-sm" onClick={() => setPagoA(f)}>
                    Registrar pago
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setExpandido(exp ? null : f.p.id)}>
                    {exp ? 'Ocultar' : 'Ver extracto'}
                  </button>
                </div>

                {exp && (
                  <div className="mt-3 animate-fade border-t border-line pt-2">
                    {f.turnos.map((t) => (
                      <div
                        key={t.key}
                        className={`flex items-center justify-between gap-2 py-1.5 ${t.futuro ? 'opacity-50' : ''}`}
                      >
                        <div className="flex min-w-0 items-center gap-1.5">
                          <span className="shrink-0 font-mono text-xs text-muted tnum">
                            {fmtDiaMes(fromISO(t.fecha))} · {t.hora}
                          </span>
                          {t.tipo === 'extra' && (
                            <span className="chip bg-ocre-tint text-ocre-deep">
                              {t.tipoConsulta === 'entrevista'
                                ? 'Entrevista'
                                : t.tipoConsulta === 'informativa'
                                  ? 'Informativa'
                                  : 'Extra'}
                            </span>
                          )}
                        </div>
                        {t.futuro ? (
                          <span className="shrink-0 px-2 text-[11px] font-bold text-muted">Pendiente</span>
                        ) : (
                          <div className="flex shrink-0 rounded-full border border-line p-0.5">
                            {[
                              [null, 'Asistió', 'bg-teal text-paper'],
                              ['cancelo', 'Canceló', 'bg-ocre text-paper'],
                              ['ausente', 'Faltó', 'bg-clay text-paper'],
                            ].map(([motivo, etiqueta, activa]) => (
                              <button
                                key={etiqueta}
                                onClick={() => setAusencia(t, motivo)}
                                className={`rounded-full px-2 py-1 text-[11px] font-bold transition ${
                                  t.ausencia === motivo ? activa : 'text-muted hover:text-ink'
                                }`}
                              >
                                {etiqueta}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    {f.abonos.length > 0 && (
                      <div className="mt-1 border-t border-line pt-1">
                        {f.abonos.map((a) => (
                          <div key={a.id} className="flex items-center justify-between gap-2 py-1.5">
                            <div className="flex min-w-0 items-center gap-1.5">
                              <span className="shrink-0 font-mono text-xs text-muted tnum">
                                {fmtDiaMes(fromISO(a.fechaPago))}
                              </span>
                              <span className="chip bg-teal-tint text-teal-deep">Pago</span>
                            </div>
                            <div className="flex shrink-0 items-center gap-1.5">
                              <button
                                aria-label="Eliminar pago"
                                onClick={() => removeAbono(a.id)}
                                className="flex h-6 w-6 items-center justify-center rounded-full text-muted/40 transition hover:text-clay-deep"
                              >
                                <IconX size={13} />
                              </button>
                              <span className="font-mono text-sm font-semibold tnum text-teal-deep">{gs(a.monto)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-1 space-y-1 border-t border-line pt-2.5 text-[13px]">
                      <div className="flex items-baseline justify-between">
                        <span className="text-muted">Total del mes</span>
                        <span className="font-mono text-sm font-semibold tnum">{gs(f.r.total)}</span>
                      </div>
                      <div className="flex items-baseline justify-between">
                        <span className="text-muted">Pagado</span>
                        <span className="font-mono text-sm font-semibold tnum text-teal-deep">{gs(f.pagadoMes)}</span>
                      </div>
                      <div className="mt-2 flex items-baseline justify-between border-t-[3px] border-double border-ink/20 pt-2">
                        <span className="font-bold text-ink">
                          {f.cuenta.saldo < 0 ? 'Saldo a favor' : 'Saldo'}
                        </span>
                        <span
                          className={`font-mono text-base font-bold tnum ${
                            f.cuenta.saldo > 0 ? 'text-clay-deep' : 'text-teal-deep'
                          }`}
                        >
                          {gs(Math.abs(f.cuenta.saldo))}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {pagoA && <AbonoSheet paciente={pagoA.p} saldo={pagoA.cuenta.saldo} onClose={() => setPagoA(null)} />}
    </div>
  )
}
