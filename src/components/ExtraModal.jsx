import { useState } from 'react'
import useStore from '../store/useStore.js'
import { fmtFechaLarga, fromISO } from '../lib/fechas.js'
import { cap } from '../lib/util.js'
import Sheet from './Sheet.jsx'
import MoneyInput from './MoneyInput.jsx'
import { valorDe } from '../lib/turnos.js'

const MODOS = [
  { id: 'existente', label: 'Paciente' },
  { id: 'nuevo', label: 'Nuevo' },
  { id: 'reserva', label: 'Sin nombre' },
]

const TIPOS = [
  { id: 'sesion', label: 'Sesión' },
  { id: 'entrevista', label: 'Entrevista' },
  { id: 'informativa', label: 'Informativa' },
]

export default function ExtraModal({ fecha, hora: horaInicial, onClose }) {
  const pacientes = useStore((s) => s.pacientes)
  const addExtra = useStore((s) => s.addExtra)
  const addPaciente = useStore((s) => s.addPaciente)
  const config = useStore((s) => s.config)

  const activos = pacientes.filter((p) => p.activo).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
  const [modo, setModo] = useState(activos.length > 0 ? 'existente' : 'nuevo')
  const [pacienteId, setPacienteId] = useState(activos[0]?.id ?? '')
  const [nombreNuevo, setNombreNuevo] = useState('')
  const [hora, setHora] = useState(horaInicial ?? '15:00')
  const [tipoConsulta, setTipoConsulta] = useState('sesion')
  const [montoEditado, setMontoEditado] = useState(null)

  const pacienteSel = modo === 'existente' ? activos.find((p) => p.id === pacienteId) : null
  const montoDefault = valorDe(pacienteSel ?? {}, config)
  const monto = montoEditado ?? montoDefault

  const valido =
    modo === 'reserva' || (modo === 'nuevo' ? nombreNuevo.trim().length > 0 : Boolean(pacienteId))

  const agregar = () => {
    if (!valido) return
    let id = null
    if (modo === 'existente') id = pacienteId
    if (modo === 'nuevo') id = addPaciente({ nombre: nombreNuevo.trim(), modalidadPago: 'sesion' }, [])
    addExtra({
      pacienteId: id,
      fecha,
      hora,
      tipoConsulta: modo === 'reserva' ? 'sesion' : tipoConsulta,
      monto: modo === 'reserva' ? null : montoEditado,
    })
    onClose()
  }

  return (
    <Sheet
      title="Turno extra"
      subtitle={cap(fmtFechaLarga(fromISO(fecha)))}
      onClose={onClose}
      footer={
        <div className="flex gap-2">
          <button className="btn btn-ghost flex-1" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn btn-primary flex-1" disabled={!valido} onClick={agregar}>
            {modo === 'reserva' ? 'Reservar' : modo === 'nuevo' ? 'Crear y agregar' : 'Agregar'}
          </button>
        </div>
      }
    >
      <div className="space-y-3.5">
        <div className="grid grid-cols-3 gap-1 rounded-2xl border border-line bg-paper p-1">
          {MODOS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setModo(m.id)}
              className={`rounded-xl px-2 py-2 text-[13px] font-bold transition ${
                modo === m.id ? 'bg-teal text-paper shadow-soft' : 'text-muted hover:text-ink'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {modo === 'existente' &&
          (activos.length === 0 ? (
            <p className="rounded-xl bg-ocre-tint px-3.5 py-3 text-sm text-ocre-deep">
              Todavía no hay pacientes. Usá «Nuevo» para crear uno rápido.
            </p>
          ) : (
            <div>
              <label className="label" htmlFor="extra-paciente">
                Paciente
              </label>
              <select
                id="extra-paciente"
                className="input mt-1.5"
                value={pacienteId}
                onChange={(e) => setPacienteId(e.target.value)}
              >
                {activos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </div>
          ))}

        {modo === 'nuevo' && (
          <div>
            <label className="label" htmlFor="extra-nombre">
              Nombre
            </label>
            <input
              id="extra-nombre"
              type="text"
              className="input mt-1.5"
              placeholder="Nombre y apellido"
              autoFocus
              value={nombreNuevo}
              onChange={(e) => setNombreNuevo(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && agregar()}
            />
            <p className="mt-1.5 text-[13px] text-muted">
              Se crea como paciente (por sesión) y le podés completar los datos después.
            </p>
          </div>
        )}

        {modo === 'reserva' && (
          <p className="rounded-xl bg-linen px-3.5 py-3 text-sm text-muted">
            El horario queda bloqueado como «Reservado», sin paciente ni cobro.
          </p>
        )}

        {modo !== 'reserva' && (
          <div>
            <span className="label">Tipo de consulta</span>
            <div className="mt-1.5 flex gap-1.5">
              {TIPOS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setTipoConsulta(t.id)
                    setMontoEditado(null)
                  }}
                  className={`rounded-full border px-3 py-1.5 text-[13px] font-bold transition ${
                    tipoConsulta === t.id
                      ? 'border-teal bg-teal text-paper shadow-soft'
                      : 'border-line bg-paper text-muted hover:text-ink'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {modo !== 'reserva' && (
          <div className="w-1/2">
            <label className="label" htmlFor="extra-monto">
              Valor
            </label>
            <div className="mt-1.5">
              <MoneyInput id="extra-monto" value={monto || null} onChange={setMontoEditado} />
            </div>
          </div>
        )}

        <div className="w-1/2">
          <label className="label" htmlFor="extra-hora">
            Hora
          </label>
          <input
            id="extra-hora"
            type="time"
            className="input tnum mt-1.5 font-mono"
            value={hora}
            onChange={(e) => setHora(e.target.value)}
          />
        </div>
      </div>
    </Sheet>
  )
}
