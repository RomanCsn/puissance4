import { Router } from 'express'
import { prisma } from './db.ts'
import { createMatchSchema, createPlayerSchema, finishMatchSchema } from './validators.ts'

export const router = Router()

type MatchWithPlayersWinner = {
    id: string
    startedAt: Date
    endedAt: Date | null
    durationMs: number
    movesCount: number
    result: 'P1_WIN' | 'P2_WIN' | 'DRAW' | null
    createdAt: Date
    player1: { pseudo: string }
    player2: { pseudo: string }
    winner: { pseudo: string } | null
}

router.get('/health', (_req, res) => {
    res.json({ ok: true, service: 'puissance4-api', date: new Date().toISOString() })
})

/**
 * POST /players
 * body: { pseudo }
 * -> crée ou récupère un joueur
 */
router.post('/players', async (req, res, next) => {
    try {
        const { pseudo } = createPlayerSchema.parse(req.body)

        const player = await prisma.player.upsert({
            where: { pseudo },
            update: {},
            create: { pseudo },
        })

        res.status(201).json({ id: player.id, pseudo: player.pseudo, createdAt: player.createdAt })
    } catch (err) {
        next(err)
    }
})

/**
 * POST /matches
 * body: { player1Pseudo, player2Pseudo }
 * -> crée un match + crée joueurs si besoin
 */
router.post('/matches', async (req, res, next) => {
    try {
        const { player1Pseudo, player2Pseudo } = createMatchSchema.parse(req.body)

        if (player1Pseudo === player2Pseudo) {
            return res.status(400).json({ error: 'player1Pseudo et player2Pseudo doivent être différents' })
        }

        const [p1, p2] = await Promise.all([
            prisma.player.upsert({ where: { pseudo: player1Pseudo }, update: {}, create: { pseudo: player1Pseudo } }),
            prisma.player.upsert({ where: { pseudo: player2Pseudo }, update: {}, create: { pseudo: player2Pseudo } }),
        ])

        const match = await prisma.match.create({
            data: { player1Id: p1.id, player2Id: p2.id, startedAt: new Date() },
            include: { player1: true, player2: true },
        })

        res.status(201).json({
            id: match.id,
            startedAt: match.startedAt,
            player1: { id: match.player1.id, pseudo: match.player1.pseudo },
            player2: { id: match.player2.id, pseudo: match.player2.pseudo },
        })
    } catch (err) {
        next(err)
    }
})

/**
 * POST /matches/:id/finish
 * body: { winnerPseudo: string|null, result: "P1_WIN"|"P2_WIN"|"DRAW", movesCount: number, endedAt?: ISO }
 */
router.post('/matches/:id/finish', async (req, res, next) => {
    try {
        const matchId = req.params.id
        const body = finishMatchSchema.parse(req.body)

        const match = await prisma.match.findUnique({
            where: { id: matchId },
            include: { player1: true, player2: true },
        })
        if (!match) return res.status(404).json({ error: 'Match introuvable' })

        const endedAt = body.endedAt ? new Date(body.endedAt) : new Date()
        const durationMs = Math.max(0, endedAt.getTime() - match.startedAt.getTime())

        // winnerPseudo doit être cohérent avec result
        let winnerId: string | null = null
        if (body.result === 'DRAW') {
            winnerId = null
        } else {
            if (!body.winnerPseudo) return res.status(400).json({ error: 'winnerPseudo requis si result != DRAW' })
            const winner = await prisma.player.findUnique({ where: { pseudo: body.winnerPseudo } })
            if (!winner) return res.status(400).json({ error: 'winnerPseudo inconnu' })
            winnerId = winner.id
        }

        const updated = await prisma.match.update({
            where: { id: matchId },
            data: {
                endedAt,
                durationMs,
                movesCount: body.movesCount,
                result: body.result,
                winnerId,
            },
            include: { player1: true, player2: true, winner: true },
        })

        res.json({
            ok: true,
            match: {
                id: updated.id,
                startedAt: updated.startedAt,
                endedAt: updated.endedAt,
                durationMs: updated.durationMs,
                movesCount: updated.movesCount,
                result: updated.result,
                player1: updated.player1.pseudo,
                player2: updated.player2.pseudo,
                winner: updated.winner?.pseudo ?? null,
            },
        })
    } catch (err) {
        next(err)
    }
})

/**
 * GET /games
 * Format prof: Array<[date, player1, player2, winner]>
 * winner: pseudo ou "DRAW"
 */
router.get('/games', async (req, res, next) => {
    try {
        const limit = Math.min(Number(req.query.limit ?? 50), 200)

        const matches: MatchWithPlayersWinner[] = await prisma.match.findMany({
            where: { endedAt: { not: null } },
            orderBy: { endedAt: 'desc' },
            take: limit,
            include: { player1: true, player2: true, winner: true },
        })

        const tuples: Array<[string, string, string, string]> = matches.map((m) => {
            const date = (m.endedAt ?? m.startedAt).toISOString().slice(0, 10)
            const p1 = m.player1.pseudo
            const p2 = m.player2.pseudo
            const winner = m.result === 'DRAW' ? 'DRAW' : (m.winner?.pseudo ?? 'DRAW')
            return [date, p1, p2, winner]
        })

        res.json(tuples)
    } catch (err) {
        next(err)
    }
})

/**
 * GET /matches (debug riche)
 */
router.get('/matches', async (_req, res, next) => {
    try {
        const matches: MatchWithPlayersWinner[] = await prisma.match.findMany({
            orderBy: { createdAt: 'desc' },
            take: 100,
            include: { player1: true, player2: true, winner: true },
        })

        res.json(
            matches.map((m) => ({
                id: m.id,
                startedAt: m.startedAt,
                endedAt: m.endedAt,
                durationMs: m.durationMs,
                movesCount: m.movesCount,
                result: m.result,
                player1: m.player1.pseudo,
                player2: m.player2.pseudo,
                winner: m.winner?.pseudo ?? null,
            })),
        )
    } catch (err) {
        next(err)
    }
})