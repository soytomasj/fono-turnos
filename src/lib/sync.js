import { useSyncExternalStore } from 'react'
import useStore from '../store/useStore.js'

const CLAVE_KEY = 'fono-sync-clave'
const EDIT_KEY = 'fono-sync-lastEdit'

let estado = localStorage.getItem(CLAVE_KEY) ? 'ok' : 'off'
const listeners = new Set()
let aplicando = false
let timer = null

const setEstado = (e) => {
  estado = e
  listeners.forEach((l) => l())
}

export const getClave = () => localStorage.getItem(CLAVE_KEY)

export function useSyncEstado() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => estado,
  )
}

const datosDe = (s) => ({
  pacientes: s.pacientes,
  agenda: s.agenda,
  excepciones: s.excepciones,
  pagos: s.pagos,
  config: s.config,
})

const aplicarRemoto = (state) => {
  aplicando = true
  useStore.setState({
    pacientes: state.pacientes ?? [],
    agenda: state.agenda ?? [],
    excepciones: state.excepciones ?? [],
    pagos: state.pagos ?? [],
    config: state.config ?? { valorSesionDefault: null },
  })
  aplicando = false
  localStorage.setItem(EDIT_KEY, String(state.updatedAt ?? Date.now()))
}

async function pull() {
  const clave = getClave()
  if (!clave) return
  try {
    const r = await fetch('/api/state', { headers: { 'x-clave': clave } })
    if (r.status === 401) return setEstado('clave')
    if (!r.ok) throw new Error()
    const { state } = await r.json()
    if (state && Number(state.updatedAt ?? 0) > Number(localStorage.getItem(EDIT_KEY) ?? 0)) {
      aplicarRemoto(state)
    }
    setEstado('ok')
  } catch {
    setEstado('error')
  }
}

async function push() {
  const clave = getClave()
  if (!clave) return
  setEstado('sync')
  try {
    const updatedAt = Number(localStorage.getItem(EDIT_KEY) ?? Date.now())
    const r = await fetch('/api/state', {
      method: 'PUT',
      headers: { 'content-type': 'application/json', 'x-clave': clave },
      body: JSON.stringify({ state: { ...datosDe(useStore.getState()), updatedAt } }),
    })
    if (r.status === 401) return setEstado('clave')
    if (!r.ok) throw new Error()
    setEstado('ok')
  } catch {
    setEstado('error')
  }
}

export async function conectar(claveNueva) {
  const clave = claveNueva.trim()
  try {
    const r = await fetch('/api/state', { headers: { 'x-clave': clave } })
    if (r.status === 401) return { ok: false, motivo: 'clave' }
    if (!r.ok) throw new Error()
    localStorage.setItem(CLAVE_KEY, clave)
    const { state } = await r.json()
    if (state) aplicarRemoto(state)
    else await push()
    setEstado('ok')
    return { ok: true }
  } catch {
    return { ok: false, motivo: 'red' }
  }
}

export function desconectar() {
  localStorage.removeItem(CLAVE_KEY)
  setEstado('off')
}

export function iniciarSync() {
  useStore.subscribe(() => {
    if (aplicando || !getClave()) return
    localStorage.setItem(EDIT_KEY, String(Date.now()))
    clearTimeout(timer)
    timer = setTimeout(push, 2000)
  })
  if (getClave()) pull()
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && getClave()) pull()
  })
}
