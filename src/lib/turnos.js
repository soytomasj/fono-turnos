import { addDays } from 'date-fns'
import { fromISO, toISO } from './fechas.js'

export const valorDe = (paciente, config) => paciente.valorSesion ?? config.valorSesionDefault ?? 0

export function turnosEnRango(state, desdeISO, hastaISO) {
  const { pacientes, agenda, excepciones, pagos, config } = state
  const porId = Object.fromEntries(pacientes.map((p) => [p.id, p]))
  const hoy = toISO(new Date())
  const turnos = []

  for (let d = fromISO(desdeISO); toISO(d) <= hastaISO; d = addDays(d, 1)) {
    const fecha = toISO(d)
    const dow = d.getDay()

    const fijos = agenda
      .filter((s) => s.diaSemana === dow)
      .map((s) => ({ pacienteId: s.pacienteId, hora: s.hora, tipo: 'fijo', key: `${s.pacienteId}|${fecha}|${s.hora}` }))
    const extras = excepciones
      .filter((e) => e.tipo === 'extra' && e.fecha === fecha)
      .map((e) => ({
        pacienteId: e.pacienteId,
        hora: e.hora,
        tipo: 'extra',
        extraId: e.id,
        tipoConsulta: e.tipoConsulta ?? 'sesion',
        montoFijo: e.monto ?? null,
        key: `extra|${e.id}`,
      }))

    for (const t of [...fijos, ...extras]) {
      if (t.tipo === 'extra' && !t.pacienteId) {
        turnos.push({
          key: t.key,
          pacienteId: null,
          paciente: { nombre: 'Reservado', modalidadPago: 'sesion', virtual: false },
          tipo: 'extra',
          extraId: t.extraId,
          fecha,
          hora: t.hora,
          estado: fecha > hoy ? 'pendiente' : 'asistio',
          ausencia: null,
          futuro: fecha > hoy,
          cobrable: false,
          pagado: false,
          monto: 0,
          periodo: fecha.slice(0, 7),
        })
        continue
      }

      const paciente = porId[t.pacienteId]
      if (!paciente || !paciente.activo) continue

      if (t.tipo === 'fijo') {
        if (paciente.vigenciaDesde && fecha < paciente.vigenciaDesde) continue
        if (paciente.vigenciaHasta && fecha > paciente.vigenciaHasta) continue
      }
      const periodo = fecha.slice(0, 7)

      const exc = excepciones.find(
        (e) => e.tipo === 'cancelado' && e.pacienteId === t.pacienteId && e.fecha === fecha && e.hora === t.hora,
      )
      const ausencia = exc ? exc.motivo : null
      const tipoConsulta = t.tipoConsulta ?? 'sesion'
      const monto = t.montoFijo ?? valorDe(paciente, config)
      const pagado =
        paciente.modalidadPago === 'mensual'
          ? pagos.some((p) => p.tipo === 'mensual' && p.pacienteId === paciente.id && p.periodo === periodo)
          : pagos.some(
              (p) => p.tipo === 'sesion' && p.pacienteId === paciente.id && p.fecha === fecha && p.hora === t.hora,
            )

      turnos.push({
        key: t.key,
        pacienteId: t.pacienteId,
        paciente,
        tipo: t.tipo,
        tipoConsulta,
        extraId: t.extraId ?? null,
        fecha,
        hora: t.hora,
        estado: exc ? 'cancelado' : fecha > hoy ? 'pendiente' : 'asistio',
        ausencia,
        futuro: fecha > hoy,
        cobrable: ausencia !== 'cancelo',
        pagado,
        monto,
        periodo,
      })
    }
  }

  turnos.sort((a, b) => (a.fecha === b.fecha ? a.hora.localeCompare(b.hora) : a.fecha.localeCompare(b.fecha)))
  return turnos
}

export function cuentaPaciente(state, paciente) {
  const hoy = toISO(new Date())
  const extras = state.excepciones.filter((e) => e.tipo === 'extra' && e.pacienteId === paciente.id)
  const inicios = [
    paciente.createdAt ? `${paciente.createdAt.slice(0, 7)}-01` : null,
    paciente.vigenciaDesde,
    ...extras.map((e) => e.fecha),
  ].filter(Boolean)
  const desde = inicios.length ? inicios.sort()[0] : hoy
  const turnos = turnosEnRango(state, desde, hoy).filter((t) => t.pacienteId === paciente.id)
  const devengado = turnos.filter((t) => t.cobrable && !t.futuro).reduce((acc, t) => acc + t.monto, 0)
  const pagado = state.pagos
    .filter((p) => p.pacienteId === paciente.id)
    .reduce((acc, p) => acc + (p.monto ?? 0), 0)
  return { devengado, pagado, saldo: devengado - pagado }
}

export function resumenPaciente(turnosDelMes, paciente, pagos, periodo) {
  // solo se cobra lo que ya ocurrió: los turnos futuros no suman hasta que pase la fecha
  const cobrables = turnosDelMes.filter((t) => t.cobrable && !t.futuro)
  const total = cobrables.reduce((acc, t) => acc + t.monto, 0)

  let pagado
  if (paciente.modalidadPago === 'mensual') {
    const mesPagado = pagos.some((p) => p.tipo === 'mensual' && p.pacienteId === paciente.id && p.periodo === periodo)
    pagado = mesPagado ? total : 0
  } else {
    pagado = cobrables.filter((t) => t.pagado).reduce((acc, t) => acc + t.monto, 0)
  }

  return { sesiones: cobrables.length, total, pagado, saldo: total - pagado }
}
