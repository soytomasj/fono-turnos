import { useState } from 'react'
import useStore from '../store/useStore.js'
import { valorDe } from '../lib/turnos.js'
import { DIAS, gs } from '../lib/util.js'
import MoneyInput from '../components/MoneyInput.jsx'
import PacienteModal from '../components/PacienteModal.jsx'
import { IconPlus, IconUsers } from '../components/icons.jsx'

const TINTES = ['bg-teal-tint text-teal-deep', 'bg-clay-tint text-clay-deep', 'bg-ocre-tint text-ocre-deep']

export default function Pacientes() {
  const pacientes = useStore((s) => s.pacientes)
  const agenda = useStore((s) => s.agenda)
  const config = useStore((s) => s.config)
  const setValorDefault = useStore((s) => s.setValorDefault)

  const [editando, setEditando] = useState(null) // null | 'nuevo' | paciente

  const activos = pacientes.filter((p) => p.activo).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))

  const agendaDe = (p) =>
    agenda
      .filter((a) => a.pacienteId === p.id)
      .sort((a, b) => a.diaSemana - b.diaSemana || a.hora.localeCompare(b.hora))
      .map((a) => `${DIAS[a.diaSemana].corto} ${a.hora}`)
      .join(' · ')

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-3 animate-rise">
        <div>
          <div className="label tnum">
            {activos.length} {activos.length === 1 ? 'activo' : 'activos'}
          </div>
          <h1 className="mt-1 text-2xl">Pacientes</h1>
        </div>
        <button className="btn btn-primary" onClick={() => setEditando('nuevo')}>
          <IconPlus size={16} /> Nuevo
        </button>
      </div>

      <div className="card flex items-center justify-between gap-4 p-4 animate-rise" style={{ animationDelay: '40ms' }}>
        <div className="min-w-0">
          <div className="label">Valor de sesión general</div>
          <p className="mt-1 text-xs text-muted">Para pacientes sin valor propio.</p>
        </div>
        <div className="w-36 shrink-0">
          <MoneyInput value={config.valorSesionDefault} onChange={setValorDefault} />
        </div>
      </div>

      {activos.length === 0 ? (
        <div className="card flex flex-col items-center gap-2 border-dashed px-4 py-10 text-center shadow-none animate-rise" style={{ animationDelay: '80ms' }}>
          <IconUsers size={28} className="text-muted" />
          <span className="font-display text-lg text-muted">Sin pacientes todavía</span>
          <button className="btn btn-soft mt-1" onClick={() => setEditando('nuevo')}>
            <IconPlus size={16} /> Agregar paciente
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {activos.map((p, i) => {
            const propio = p.valorSesion != null
            return (
              <button
                key={p.id}
                onClick={() => setEditando(p)}
                className="card flex w-full items-center gap-3 p-3 text-left transition animate-rise hover:shadow-lift"
                style={{ animationDelay: `${80 + i * 40}ms` }}
              >
                <span
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-display text-lg ${
                    TINTES[i % TINTES.length]
                  }`}
                >
                  {p.nombre.charAt(0).toUpperCase()}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5">
                    <span className="truncate text-[15px] font-bold">{p.nombre}</span>
                    {p.modalidadPago === 'mensual' ? (
                      <span className="chip bg-clay-tint text-clay-deep">Mensual</span>
                    ) : (
                      <span className="chip bg-teal-tint text-teal-deep">Por sesión</span>
                    )}
                    {p.virtual && <span className="chip border border-line text-muted">Virtual</span>}
                  </span>
                  <span className="mt-0.5 block truncate font-mono text-xs text-muted tnum">
                    {agendaDe(p) || 'Sin agenda fija'}
                  </span>
                </span>
                <span className="shrink-0 text-right">
                  <span className="block font-mono text-sm font-semibold tnum">{gs(valorDe(p, config))}</span>
                  <span className="label">{propio ? 'propio' : 'general'}</span>
                </span>
              </button>
            )
          })}
        </div>
      )}

      {editando !== null && (
        <PacienteModal paciente={editando === 'nuevo' ? null : editando} onClose={() => setEditando(null)} />
      )}
    </div>
  )
}
