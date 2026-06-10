import { Redis } from '@upstash/redis'

const KEY = 'fono-turnos-state'

export default async function handler(req, res) {
  const secret = process.env.SYNC_SECRET
  if (!secret || req.headers['x-clave'] !== secret) {
    return res.status(401).json({ error: 'No autorizado' })
  }

  const redis = Redis.fromEnv()

  if (req.method === 'GET') {
    const state = await redis.get(KEY)
    return res.status(200).json({ state: state ?? null })
  }

  if (req.method === 'PUT') {
    const { state } = req.body ?? {}
    if (!state || typeof state !== 'object' || Array.isArray(state)) {
      return res.status(400).json({ error: 'Estado inválido' })
    }
    await redis.set(KEY, state)
    return res.status(200).json({ ok: true })
  }

  res.setHeader('Allow', 'GET, PUT')
  return res.status(405).end()
}
