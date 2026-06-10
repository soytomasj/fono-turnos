import useStore from '../store/useStore.js'
import { gs } from '../lib/util.js'
import { IconCheck, IconSlash, IconX } from './icons.jsx'

export default function TurnoCard({ turno, className = '', style }) {
  const setAusencia = useStore((s) => s.setAusencia)
  const togglePagoSesion = useStore((s) => s.togglePagoSesion)
  const removeExtra = useStore((s) => s.removeExtra)

  const { paciente } = turno
  const reservado = !turno.pacienteId
  const mensual = paciente.modalidadPago === 'mensual'
  const cancelo = turno.ausencia === 'cancelo'
  const ausente = turno.ausencia === 'ausente'

  const bloqueHora = cancelo
    ? 'border border-line bg-linen text-muted'
    : ausente
      ? 'bg-clay-tint text-clay-deep'
      : turno.pagado
        ? 'bg-teal text-paper'
        : 'bg-teal-tint text-teal-deep'

  let estadoTexto
  let estadoClase
  if (reservado) {
    estadoTexto = 'Sin paciente asignado'
    estadoClase = 'text-muted'
  } else if (cancelo) {
    estadoTexto = 'Canceló · no se cobra'
    estadoClase = 'text-muted'
  } else if (ausente) {
    estadoTexto = `Faltó sin avisar · ${gs(turno.monto)}`
    estadoClase = 'text-clay-deep'
  } else if (mensual) {
    estadoTexto = turno.pagado ? 'Mensual · al día' : `Mensual · ${gs(turno.monto)}`
    estadoClase = turno.pagado ? 'text-teal-deep' : 'text-muted'
  } else if (turno.pagado) {
    estadoTexto = `Pagado · ${gs(turno.monto)}`
    estadoClase = 'text-teal-deep'
  } else {
    estadoTexto = `${gs(turno.monto)} a cobrar`
    estadoClase = 'text-muted'
  }

  return (
    <div className={`card flex items-center gap-3 p-3 ${cancelo ? 'opacity-75' : ''} ${className}`} style={style}>
      <div
        className={`flex w-14 shrink-0 flex-col items-center justify-center self-stretch rounded-xl py-2.5 font-mono text-sm font-semibold tnum ${bloqueHora}`}
      >
        {turno.hora}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className={`truncate text-[15px] font-bold ${cancelo ? 'text-muted line-through' : ''}`}>
            {paciente.nombre}
          </span>
          {turno.tipo === 'extra' && (
            <span className="chip bg-ocre-tint text-ocre-deep">
              {turno.tipoConsulta === 'entrevista'
                ? 'Entrevista'
                : turno.tipoConsulta === 'informativa'
                  ? 'Informativa'
                  : 'Extra'}
            </span>
          )}
          {paciente.virtual && <span className="chip border border-line text-muted">Virtual</span>}
        </div>
        <div className={`mt-0.5 text-[13px] ${estadoClase}`}>{estadoTexto}</div>

        {turno.estado === 'cancelado' && turno.tipo === 'fijo' && (
          <div className="mt-1.5 inline-flex rounded-full border border-line bg-paper p-0.5">
            <button
              onClick={() => setAusencia(turno, 'cancelo')}
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold transition ${
                cancelo ? 'bg-muted text-paper' : 'text-muted hover:text-ink'
              }`}
            >
              Canceló
            </button>
            <button
              onClick={() => setAusencia(turno, 'ausente')}
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold transition ${
                ausente ? 'bg-clay text-paper' : 'text-muted hover:text-ink'
              }`}
            >
              Faltó
            </button>
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1.5">
        {reservado ? (
          <button
            aria-label="Eliminar reserva"
            onClick={() => removeExtra(turno.extraId)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-paper text-muted transition hover:border-clay/50 hover:text-clay-deep active:scale-90"
          >
            <IconX size={18} />
          </button>
        ) : (
          <>
            {!mensual && turno.cobrable && (
              <button
                aria-label={turno.pagado ? 'Marcar como no pagado' : 'Marcar como pagado'}
                onClick={() => togglePagoSesion(turno)}
                className={`flex h-10 w-10 items-center justify-center rounded-full border transition active:scale-90 ${
                  turno.pagado
                    ? 'border-teal bg-teal text-paper'
                    : 'border-line bg-paper text-muted hover:border-teal/50 hover:text-teal'
                }`}
              >
                <IconCheck size={18} />
              </button>
            )}
            <button
              aria-label="No vino"
              onClick={() => setAusencia(turno, turno.ausencia ? null : 'cancelo')}
              className={`flex h-10 w-10 items-center justify-center rounded-full border transition active:scale-90 ${
                turno.estado === 'cancelado'
                  ? 'border-clay/40 bg-clay-tint text-clay-deep'
                  : 'border-line bg-paper text-muted hover:border-clay/50 hover:text-clay-deep'
              }`}
            >
              <IconSlash size={18} />
            </button>
          </>
        )}
      </div>
    </div>
  )
}
