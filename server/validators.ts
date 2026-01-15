import { z } from 'zod'

export const createPlayerSchema = z.object({
    pseudo: z.string().trim().min(1).max(30),
})

export const createMatchSchema = z.object({
    player1Pseudo: z.string().trim().min(1).max(30),
    player2Pseudo: z.string().trim().min(1).max(30),
})

export const finishMatchSchema = z.object({
    winnerPseudo: z.string().trim().min(1).max(30).nullable(),
    result: z.enum(['P1_WIN', 'P2_WIN', 'DRAW']),
    movesCount: z.number().int().min(0).max(42),
    endedAt: z.string().datetime().optional(),
})