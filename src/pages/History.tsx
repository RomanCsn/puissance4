import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMatches, type MatchRow } from '../api/matches'

function formatDuration(durationMs: number) {
    const totalSeconds = Math.floor(durationMs / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export default function History() {
    const [matches, setMatches] = useState<MatchRow[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let cancelled = false

            ; (async () => {
                try {
                    setLoading(true)
                    setError(null)
                    const data = await getMatches()
                    if (!cancelled) setMatches(data)
                } catch (e) {
                    if (!cancelled) setError(e instanceof Error ? e.message : 'Erreur inconnue')
                } finally {
                    if (!cancelled) setLoading(false)
                }
            })()

        return () => {
            cancelled = true
        }
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 p-8">
                <div className="mx-auto max-w-4xl text-center text-gray-700">Chargement…</div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 p-8">
                <div className="mx-auto max-w-4xl text-center text-red-600">Erreur: {error}</div>
            </div>
        )
    }

    const finished = matches.filter((m) => m.endedAt)

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="mx-auto max-w-4xl">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Historique</h1>
                        <p className="text-sm text-gray-700">Qui a gagné contre qui, en combien de temps.</p>
                    </div>

                    <div className="flex gap-2">
                        <Link to="/" className="rounded border border-gray-300 bg-white px-4 py-2">
                            Accueil
                        </Link>
                        <Link to="/game" className="rounded bg-gray-900 px-4 py-2 font-semibold text-white">
                            Nouvelle partie
                        </Link>
                    </div>
                </div>

                <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
                    {finished.length === 0 ? (
                        <div className="p-6 text-center text-gray-700">Aucune partie terminée.</div>
                    ) : (
                        <table className="min-w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-700">
                                <tr>
                                    <th className="px-4 py-3 font-semibold">Date</th>
                                    <th className="px-4 py-3 font-semibold">Joueur 1</th>
                                    <th className="px-4 py-3 font-semibold">Joueur 2</th>
                                    <th className="px-4 py-3 font-semibold">Gagnant</th>
                                    <th className="px-4 py-3 font-semibold">Durée</th>
                                    <th className="px-4 py-3 font-semibold">Coups</th>
                                </tr>
                            </thead>
                            <tbody>
                                {finished.map((m) => {
                                    const date = (m.endedAt ?? m.startedAt).slice(0, 10)
                                    const winner = m.result === 'DRAW' ? 'DRAW' : (m.winner ?? 'DRAW')
                                    return (
                                        <tr key={m.id} className="border-t">
                                            <td className="px-4 py-3">{date}</td>
                                            <td className="px-4 py-3">{m.player1}</td>
                                            <td className="px-4 py-3">{m.player2}</td>
                                            <td className="px-4 py-3">{winner}</td>
                                            <td className="px-4 py-3">{formatDuration(m.durationMs)}</td>
                                            <td className="px-4 py-3">{m.movesCount}</td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    )
}
