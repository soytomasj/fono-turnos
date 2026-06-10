import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { hoyISO } from '../lib/fechas.js'
import { nombrePropio } from '../lib/util.js'

const uid = () => crypto.randomUUID()

const useStore = create(
  persist(
    (set) => ({
      pacientes: [],
      agenda: [],
      excepciones: [],
      pagos: [],
      config: { valorSesionDefault: null },

      setValorDefault: (valor) => set((s) => ({ config: { ...s.config, valorSesionDefault: valor } })),

      addPaciente: (datos, slots) => {
        const id = uid()
        set((s) => {
          return {
            pacientes: [
              ...s.pacientes,
              {
                id,
                nombre: nombrePropio(datos.nombre),
                modalidadPago: datos.modalidadPago,
                valorSesion: datos.valorSesion ?? null,
                virtual: Boolean(datos.virtual),
                vigenciaDesde: datos.vigenciaDesde ?? null,
                vigenciaHasta: datos.vigenciaHasta ?? null,
                activo: true,
                createdAt: new Date().toISOString(),
              },
            ],
            agenda: [
              ...s.agenda,
              ...slots.map((sl) => ({ id: uid(), pacienteId: id, diaSemana: sl.diaSemana, hora: sl.hora })),
            ],
          }
        })
        return id
      },

      updatePaciente: (id, datos, slots) =>
        set((s) => ({
          pacientes: s.pacientes.map((p) => (p.id === id ? { ...p, ...datos, nombre: nombrePropio(datos.nombre) } : p)),
          agenda: [
            ...s.agenda.filter((a) => a.pacienteId !== id),
            ...slots.map((sl) => ({ id: uid(), pacienteId: id, diaSemana: sl.diaSemana, hora: sl.hora })),
          ],
        })),

      removePaciente: (id) =>
        set((s) => ({
          pacientes: s.pacientes.filter((p) => p.id !== id),
          agenda: s.agenda.filter((a) => a.pacienteId !== id),
          excepciones: s.excepciones.filter((e) => e.pacienteId !== id),
          pagos: s.pagos.filter((p) => p.pacienteId !== id),
        })),

      setAusencia: (turno, motivo) =>
        set((s) => {
          const match = (e) =>
            e.tipo === 'cancelado' && e.pacienteId === turno.pacienteId && e.fecha === turno.fecha && e.hora === turno.hora
          const resto = s.excepciones.filter((e) => !match(e))
          if (motivo === null) return { excepciones: resto }
          return {
            excepciones: [
              ...resto,
              { id: uid(), tipo: 'cancelado', pacienteId: turno.pacienteId, fecha: turno.fecha, hora: turno.hora, motivo },
            ],
          }
        }),

      togglePagoSesion: (turno) =>
        set((s) => {
          const match = (p) =>
            p.tipo === 'sesion' && p.pacienteId === turno.pacienteId && p.fecha === turno.fecha && p.hora === turno.hora
          if (s.pagos.some(match)) return { pagos: s.pagos.filter((p) => !match(p)) }
          return {
            pagos: [
              ...s.pagos,
              {
                id: uid(),
                tipo: 'sesion',
                pacienteId: turno.pacienteId,
                fecha: turno.fecha,
                hora: turno.hora,
                periodo: null,
                monto: turno.monto,
                fechaPago: hoyISO(),
              },
            ],
          }
        }),

      togglePagoMensual: ({ pacienteId, periodo, monto }) =>
        set((s) => {
          const match = (p) => p.tipo === 'mensual' && p.pacienteId === pacienteId && p.periodo === periodo
          if (s.pagos.some(match)) return { pagos: s.pagos.filter((p) => !match(p)) }
          return {
            pagos: [
              ...s.pagos,
              { id: uid(), tipo: 'mensual', pacienteId, fecha: null, hora: null, periodo, monto, fechaPago: hoyISO() },
            ],
          }
        }),

      addExtra: ({ pacienteId, fecha, hora, tipoConsulta = 'sesion', monto = null }) =>
        set((s) => ({
          excepciones: [
            ...s.excepciones,
            { id: uid(), tipo: 'extra', pacienteId, fecha, hora, tipoConsulta, monto, motivo: null },
          ],
        })),

      addAbono: ({ pacienteId, monto, fecha }) =>
        set((s) => ({
          pagos: [
            ...s.pagos,
            { id: uid(), tipo: 'abono', pacienteId, fecha: null, hora: null, periodo: null, monto, fechaPago: fecha ?? hoyISO() },
          ],
        })),

      removeAbono: (id) =>
        set((s) => ({
          pagos: s.pagos.filter((p) => p.id !== id),
        })),

      removeExtra: (id) =>
        set((s) => ({
          excepciones: s.excepciones.filter((e) => e.id !== id),
        })),
    }),
    { name: 'fonoapp' },
  ),
)

export default useStore
