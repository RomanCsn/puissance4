import { apiFetch } from './client'

export type MatchResult = 'P1_WIN' | 'P2_WIN' | 'DRAW' | null

export type MatchRow = {
    id: string
    startedAt: string
    endedAt: string | null
    durationMs: number
    movesCount: number
    result: MatchResult
    player1: string
    player2: string
    winner: string | null
}

export async function getMatches(): Promise<MatchRow[]> {
    const res = await apiFetch('/matches')
    if (!res.ok) throw new Error(`GET /matches failed (${res.status})`)
    return res.json()
}

export type CreateMatchResponse = {
    id: string
    startedAt: string
    player1: { id: string; pseudo: string }
    player2: { id: string; pseudo: string }
}

export async function createMatch(player1Pseudo: string, player2Pseudo: string): Promise<CreateMatchResponse> {
    const res = await apiFetch('/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player1Pseudo, player2Pseudo }),
    })
    if (!res.ok) throw new Error(`POST /matches failed (${res.status})`)
    return res.json()
}

export async function finishMatch(matchId: string, payload: {
    winnerPseudo: string | null
    result: 'P1_WIN' | 'P2_WIN' | 'DRAW'
    movesCount: number
    endedAt?: string
}) {
    const res = await apiFetch(`/matches/${matchId}/finish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    })
    if (!res.ok) throw new Error(`POST /matches/:id/finish failed (${res.status})`)
    return res.json()
}
