export type GameTuple = [string, string, string, string]

import { apiFetch } from './client'

export async function getGames(limit = 50): Promise<GameTuple[]> {
    const res = await apiFetch(`/games?limit=${limit}`)
    if (!res.ok) throw new Error(`GET /games failed (${res.status})`)
    return res.json()
}