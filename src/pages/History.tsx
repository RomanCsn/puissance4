import { useEffect, useState } from 'react'
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

    if (loading) return <div>Chargement…</div>
    if (error) return <div>Erreur: {error}</div>

    return (
        <main style={{ padding: '2rem', textAlign: 'center', position: 'relative' }}>
            {/* Header : titre centré + bouton nouvelle partie top-right */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {/* Bouton fixe en haut à droite */}
                <a
                    href="/game/"
                    aria-label="Nouvelle partie"
                    style={{
                        position: 'fixed',
                        top: '1rem',
                        right: '1rem',
                        background: '#111827',
                        color: '#ffffff',
                        padding: '0.5rem 0.9rem',
                        borderRadius: 10,
                        textDecoration: 'none',
                        fontWeight: 600,
                        fontSize: 14,
                        zIndex: 1000,
                        boxShadow: '0 6px 16px rgba(0,0,0,0.15)',
                    }}
                >
                    Nouvelle partie
                </a>
                <h1 style={{ margin: 0 }}>Historique</h1>
            </div>

            <p>Page d'historique des parties jouées.</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginTop: '1rem', justifyItems: 'center' }}>
                {matches.length === 0 ? (
                    <p>Aucune partie terminée.</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Joueur 1</th>
                                <th>Joueur 2</th>
                                <th>Gagnant</th>
                                <th>Durée</th>
                                <th>Coups</th>
                            </tr>
                        </thead>
                        <tbody>
                            {matches
                                .filter((m) => m.endedAt)
                                .map((m) => {
                                    const date = (m.endedAt ?? m.startedAt).slice(0, 10)
                                    const winner = m.result === 'DRAW' ? 'DRAW' : (m.winner ?? 'DRAW')
                                    return (
                                        <tr key={m.id}>
                                            <td>{date}</td>
                                            <td>{m.player1}</td>
                                            <td>{m.player2}</td>
                                            <td>{winner}</td>
                                            <td>{formatDuration(m.durationMs)}</td>
                                            <td>{m.movesCount}</td>
                                        </tr>
                                    )
                                })}
                        </tbody>
                    </table>
                )}
            </div>
        </main>
    )
}
