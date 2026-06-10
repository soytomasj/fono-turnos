import { useState } from 'react'
import useStore from '../store/useStore.js'
import { DIAS, DIAS_HABILES } from '../lib/util.js'
import Sheet from './Sheet.jsx'
import MoneyInput from './MoneyInput.jsx'
import VigenciaPicker from './VigenciaPicker.jsx'
import { IconPlus, IconX } from './icons.jsx'

export default function PacienteModal({ paciente, onClose }) {
  const agenda = useStore((s) => s.agenda)
  const addPaciente = useStore((s) => s.addPaciente)
  const updatePaciente = useStore((s) => s.updatePaciente)
  const removePaciente = useStore((s) => s.removePaciente)

  const [nombre, setNombre] = useState(paciente?.nombre ?? '')
  const [modalidadPago, setModalidadPago] = useState(paciente?.modalidadPago ?? 'sesion')
  const [valorSesion, setValorSesion] = useState(paciente?.valorSesion ?? null)
  const [virtual, setVirtual] = useState(paciente?.virtual ?? false)
  const [vigenciaDesde, setVigenciaDesde] = useState(paciente?.vigenciaDesde ?? '')
  const [vigenciaHasta, setVigenciaHasta] = useState(paciente?.vigenciaHasta ?? '')
  const [slots, setSlots] = useState(() =>
    paciente
      ? agenda
          .filter((a) => a.pacienteId === paciente.id)
          .sort((a, b) => a.diaSemana - b.diaSemana || a.hora.localeCompare(b.hora))
          .map((a) => ({ key: a.id, diaSemana: a.diaSemana, hora: a.hora }))
      : [{ key: crypto.randomUUID(), diaSemana: 1, hora: '15:00' }],
  )

  const setSlot = (key, campo, valor) =>
    setSlots((prev) => prev.map((s) => (s.key === key ? { ...s, [campo]: valor } : s)))

  const guardar = () => {
    if (!nombre.trim()) return
    const datos = {
      nombre,
      modalidadPago,
      valorSesion,
      virtual,
      vigenciaDesde: vigenciaDesde || null,
      vigenciaHasta: vigenciaHasta || null,
    }
    const limpios = slots.map(({ diaSemana, hora }) => ({ diaSemana, hora }))
    if (paciente) updatePaciente(paciente.id, datos, limpios)
    else addPaciente(datos, limpios)
    onClose()
  }

  const eliminar = () => {
    if (window.confirm(`¿Eliminar a ${paciente.nombre}? Se borran su agenda, excepciones y pagos.`)) {
      removePaciente(paciente.id)
      onClose()
    }
  }

  return (
    <Sheet
      title={paciente ? 'Editar paciente' : 'Nuevo paciente'}
      subtitle={paciente ? paciente.nombre : 'Datos y agenda fija semanal'}
      onClose={onClose}
      footer={
        <div className="space-y-2">
          <div className="flex gap-2">
            <button className="btn btn-ghost flex-1" onClick={onClose}>
              Cancelar
            </button>
            <button className="btn btn-primary flex-1" disabled={!nombre.trim()} onClick={guardar}>
              Guardar
            </button>
          </div>
          {paciente && (
            <button className="w-full py-1 text-center text-xs font-bold text-clay-deep" onClick={eliminar}>
              Eliminar paciente
            </button>
          )}
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="label" htmlFor="nombre">
            Nombre
          </label>
          <input
            id="nombre"
            className="input mt-1.5"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre y apellido"
            autoFocus={!paciente}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label" htmlFor="modalidad">
              Pago
            </label>
            <select
              id="modalidad"
              className="input mt-1.5"
              value={modalidadPago}
              onChange={(e) => setModalidadPago(e.target.value)}
            >
              <option value="sesion">Por sesión</option>
              <option value="mensual">Mensual</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="valor">
              Valor
            </label>
            <div className="mt-1.5">
              <MoneyInput id="valor" value={valorSesion} onChange={setValorSesion} placeholder="General" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-line bg-paper px-3.5 py-3">
          <div>
            <div className="text-sm font-bold">Sesión virtual</div>
            <div className="text-xs text-muted">Atiende por videollamada</div>
          </div>
          <button
            role="switch"
            aria-checked={virtual}
            onClick={() => setVirtual(!virtual)}
            className={`relative h-7 w-12 shrink-0 rounded-full transition ${virtual ? 'bg-teal' : 'bg-line'}`}
          >
            <span
              className={`absolute top-1 h-5 w-5 rounded-full bg-paper shadow-soft transition-all ${
                virtual ? 'left-6' : 'left-1'
              }`}
            />
          </button>
        </div>

        <div>
          <div className="label">Agenda fija</div>
          <div className="mt-1.5 space-y-2">
            {slots.map((s) => (
              <div key={s.key} className="flex items-center gap-2">
                <select
                  className="input flex-1"
                  value={s.diaSemana}
                  onChange={(e) => setSlot(s.key, 'diaSemana', Number(e.target.value))}
                >
                  {DIAS_HABILES.map((d) => (
                    <option key={d} value={d}>
                      {DIAS[d].largo}
                    </option>
                  ))}
                </select>
                <input
                  type="time"
                  className="input tnum w-28 font-mono"
                  value={s.hora}
                  onChange={(e) => setSlot(s.key, 'hora', e.target.value)}
                />
                <button
                  aria-label="Quitar día"
                  className="btn-icon shrink-0 text-muted hover:border-clay/40 hover:text-clay-deep"
                  onClick={() => setSlots((prev) => prev.filter((x) => x.key !== s.key))}
                >
                  <IconX size={15} />
                </button>
              </div>
            ))}
            <button
              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-line py-2.5 text-sm font-bold text-teal-deep transition hover:border-teal/50 hover:bg-teal-faint"
              onClick={() => setSlots((prev) => [...prev, { key: crypto.randomUUID(), diaSemana: 1, hora: '15:00' }])}
            >
              <IconPlus size={16} /> Agregar día
            </button>
          </div>
        </div>

        <VigenciaPicker
          desde={vigenciaDesde}
          hasta={vigenciaHasta}
          onDesde={setVigenciaDesde}
          onHasta={setVigenciaHasta}
        />
      </div>
    </Sheet>
  )
}
