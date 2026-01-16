import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { createMatch, finishMatch } from '../api/matches'

type EndDialogProps = {
  open: boolean
  title: string
  description: string
  primaryLabel: string
  onPrimary: () => void
  secondaryLabel: string
  onSecondary: () => void
  tertiaryLabel: string
  onTertiary: () => void
  onClose: () => void
}

function EndGameDialog({
  open,
  title,
  description,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  tertiaryLabel,
  onTertiary,
  onClose,
}: EndDialogProps) {
  const primaryButtonRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    if (!open) return
    primaryButtonRef.current?.focus()
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="presentation">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-lg"
      >
        <div className="mb-3">
          <div className="text-2xl font-bold text-gray-900">{title}</div>
          <div className="mt-1 text-sm text-gray-700">{description}</div>
        </div>

        <div className="mt-5 flex flex-col gap-2">
          <button
            ref={primaryButtonRef}
            type="button"
            className="rounded-lg bg-gray-900 px-4 py-2 font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
            onClick={onPrimary}
          >
            {primaryLabel}
          </button>
          <button
            type="button"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-semibold text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
            onClick={onSecondary}
          >
            {secondaryLabel}
          </button>
          <button
            type="button"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-semibold text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
            onClick={onTertiary}
          >
            {tertiaryLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

function Game() {
  const navigate = useNavigate()

  const ROWS = 6
  const COLS = 7

  type Cell = 0 | 1 | 2
  type CurrentPlayer = 1 | 2

  const [player1Pseudo, setPlayer1Pseudo] = useState('')
  const [player2Pseudo, setPlayer2Pseudo] = useState('')
  const [matchId, setMatchId] = useState<string | null>(null)
  const [startedAtMs, setStartedAtMs] = useState<number | null>(null)
  const [nowMs, setNowMs] = useState(() => Date.now())

  const [board, setBoard] = useState<Cell[]>(() => Array(ROWS * COLS).fill(0))
  const [joueurActuel, setJoueurActuel] = useState<CurrentPlayer>(1)
  const [winner, setWinner] = useState<CurrentPlayer | 'DRAW' | null>(null)
  const [movesCount, setMovesCount] = useState(0)
  const [apiError, setApiError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const [searchParams] = useSearchParams()
  const autoStartRef = useRef(false)
  const confettiFiredRef = useRef(false)

  const [endDialogOpen, setEndDialogOpen] = useState(false)

  const isStarted = matchId !== null
  const isFinished = winner !== null

  const hasPseudosFromHome = Boolean(searchParams.get('p1') && searchParams.get('p2'))

  const elapsedMs = useMemo(() => {
    if (!startedAtMs) return 0
    return Math.max(0, nowMs - startedAtMs)
  }, [nowMs, startedAtMs])

  const player1Name = player1Pseudo.trim() || 'Joueur 1'
  const player2Name = player2Pseudo.trim() || 'Joueur 2'
  const currentPlayerName = joueurActuel === 1 ? player1Name : player2Name

  const statusText = useMemo(() => {
    if (winner === 'DRAW') return 'Égalité.'
    if (winner === 1) return `Victoire de ${player1Name}.`
    if (winner === 2) return `Victoire de ${player2Name}.`
    if (!isStarted) return 'La partie n\'a pas commencé.'
    return `Tour de ${currentPlayerName}.`
  }, [currentPlayerName, isStarted, player1Name, player2Name, winner])

  const winnerName = useMemo(() => {
    if (winner === 1) return player1Name
    if (winner === 2) return player2Name
    return null
  }, [player1Name, player2Name, winner])

  useEffect(() => {
    if (!isStarted || isFinished || !startedAtMs) return

    const intervalId = window.setInterval(() => {
      setNowMs(Date.now())
    }, 250)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [isFinished, isStarted, startedAtMs])

  useEffect(() => {
    const p1 = (searchParams.get('p1') ?? '').trim()
    const p2 = (searchParams.get('p2') ?? '').trim()
    if (!p1 || !p2) return

    // Pré-remplit depuis l'accueil si l'état est vide.
    setPlayer1Pseudo((prev) => (prev.trim() ? prev : p1))
    setPlayer2Pseudo((prev) => (prev.trim() ? prev : p2))
  }, [searchParams])

  useEffect(() => {
    const p1 = player1Pseudo.trim()
    const p2 = player2Pseudo.trim()
    if (!hasPseudosFromHome) return
    if (autoStartRef.current) return
    if (isSaving || isStarted) return
    if (!p1 || !p2) return

    autoStartRef.current = true
    void startMatch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasPseudosFromHome, isSaving, isStarted, player1Pseudo, player2Pseudo])

  function formatDuration(ms: number) {
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const getCell = (grid: Cell[], row: number, col: number): Cell => {
    return grid[row * COLS + col]
  }

  const setCell = (grid: Cell[], row: number, col: number, value: Cell): Cell[] => {
    const next = [...grid]
    next[row * COLS + col] = value
    return next
  }

  const getAvailableRow = (grid: Cell[], col: number): number | null => {
    for (let row = ROWS - 1; row >= 0; row--) {
      if (getCell(grid, row, col) === 0) return row
    }
    return null
  }

  const checkWinner = (grid: Cell[], lastRow: number, lastCol: number, player: Cell): boolean => {
    const directions: Array<[number, number]> = [
      [0, 1],
      [1, 0],
      [1, 1],
      [1, -1],
    ]

    for (const [dr, dc] of directions) {
      let count = 1

      for (let i = 1; i < 4; i++) {
        const r = lastRow + dr * i
        const c = lastCol + dc * i
        if (r < 0 || r >= ROWS || c < 0 || c >= COLS) break
        if (getCell(grid, r, c) !== player) break
        count++
      }

      for (let i = 1; i < 4; i++) {
        const r = lastRow - dr * i
        const c = lastCol - dc * i
        if (r < 0 || r >= ROWS || c < 0 || c >= COLS) break
        if (getCell(grid, r, c) !== player) break
        count++
      }

      if (count >= 4) return true
    }

    return false
  }

  const startMatch = async () => {
    setApiError(null)

    const p1 = player1Pseudo.trim()
    const p2 = player2Pseudo.trim()
    if (!p1 || !p2) {
      setApiError('Veuillez entrer 2 pseudos.')
      return
    }
    if (p1 === p2) {
      setApiError('Les pseudos doivent être différents.')
      return
    }

    try {
      setIsSaving(true)
      const created = await createMatch(p1, p2)
      setMatchId(created.id)
      setStartedAtMs(Date.parse(created.startedAt))
      setNowMs(Date.now())

      setBoard(Array(ROWS * COLS).fill(0))
      setJoueurActuel(1)
      setWinner(null)
      setMovesCount(0)
      setEndDialogOpen(false)
      confettiFiredRef.current = false
    } catch (e) {
      setApiError(e instanceof Error ? e.message : 'Erreur API')
    } finally {
      setIsSaving(false)
    }
  }

  const endMatch = async (payload: { winnerPseudo: string | null; result: 'P1_WIN' | 'P2_WIN' | 'DRAW'; movesCount: number }) => {
    if (!matchId) return
    try {
      setIsSaving(true)
      await finishMatch(matchId, payload)
    } catch (e) {
      setApiError(e instanceof Error ? e.message : 'Erreur API')
    } finally {
      setIsSaving(false)
    }
  }

  const gererClicColonne = (indexColonne: number) => {
    if (!isStarted) {
      setApiError('Commencez une partie en entrant les pseudos.')
      return
    }
    if (isFinished) return

    const row = getAvailableRow(board, indexColonne)
    if (row === null) return

    const playerCell: Cell = joueurActuel
    const nextBoard = setCell(board, row, indexColonne, playerCell)
    const nextMoves = movesCount + 1

    setBoard(nextBoard)
    setMovesCount(nextMoves)

    const didWin = checkWinner(nextBoard, row, indexColonne, playerCell)
    const didDraw = !didWin && nextMoves >= ROWS * COLS

    if (didWin) {
      setWinner(joueurActuel)
      const result = joueurActuel === 1 ? 'P1_WIN' : 'P2_WIN'
      const winnerPseudo = joueurActuel === 1 ? player1Pseudo.trim() : player2Pseudo.trim()
      void endMatch({ winnerPseudo, result, movesCount: nextMoves })
      return
    }

    if (didDraw) {
      setWinner('DRAW')
      void endMatch({ winnerPseudo: null, result: 'DRAW', movesCount: nextMoves })
      return
    }

    setJoueurActuel(joueurActuel === 1 ? 2 : 1)
  }

  useEffect(() => {
    if (!isStarted) return
    if (!winner) return
    setEndDialogOpen(true)
  }, [isStarted, winner])

  useEffect(() => {
    if (!endDialogOpen) return
    if (!winner || winner === 'DRAW') return
    if (confettiFiredRef.current) return

    confettiFiredRef.current = true
      ; (async () => {
        try {
          const mod = await import('canvas-confetti')
          const confetti = mod.default
          confetti({ particleCount: 120, spread: 70, origin: { y: 0.75 } })
          window.setTimeout(() => {
            confetti({ particleCount: 80, spread: 90, origin: { y: 0.6 } })
          }, 250)
        } catch {
          // no-op: si la lib n'est pas dispo, on ne bloque pas l'UI.
        }
      })()
  }, [endDialogOpen, winner])

  const isColumnFull = (col: number) => getAvailableRow(board, col) === null

  const afficherPlateau = () => {
    const cells: ReactNode[] = []
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        const cell = board[row * COLS + col]
        const cellClass =
          cell === 1
            ? 'bg-red-500'
            : cell === 2
              ? 'bg-yellow-400'
              : 'bg-white hover:bg-gray-100'

        const disabled = !isStarted || isFinished || isSaving || isColumnFull(col)

        cells.push(
          <button
            key={`${row}-${col}`}
            type="button"
            role="gridcell"
            aria-label={`Jouer dans la colonne ${col + 1}`}
            onClick={() => gererClicColonne(col)}
            disabled={disabled}
            className={`h-12 w-12 rounded-full ${cellClass} ring-1 ring-black/10 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70`}
          />
        )
      }
    }
    return cells
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6 sm:p-10">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col items-center gap-1 text-center">
            <h1 className="text-3xl font-bold text-gray-900">Puissance 4</h1>
            <p className="text-sm text-gray-700">Une partie locale, tour par tour.</p>
          </div>

          <div className="mb-6 flex flex-col items-center gap-3">
            {hasPseudosFromHome ? (
              <div className="text-sm text-gray-700">
                {player1Name} (Rouge) vs {player2Name} (Jaune)
              </div>
            ) : (
              <div className="flex w-full gap-2">
                <input
                  id="player1"
                  className="w-1/2 rounded-lg border border-gray-300 px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
                  placeholder="Pseudo Joueur 1 (Rouge)"
                  value={player1Pseudo}
                  onChange={(e) => setPlayer1Pseudo(e.target.value)}
                  disabled={isSaving}
                />
                <input
                  id="player2"
                  className="w-1/2 rounded-lg border border-gray-300 px-3 py-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
                  placeholder="Pseudo Joueur 2 (Jaune)"
                  value={player2Pseudo}
                  onChange={(e) => setPlayer2Pseudo(e.target.value)}
                  disabled={isSaving}
                />
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                className="rounded-lg bg-gray-900 px-4 py-2 font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 disabled:opacity-60"
                onClick={() => void startMatch()}
                disabled={isSaving}
              >
                {isStarted ? 'Rejouer (nouvelle partie)' : 'Commencer'}
              </button>

              <Link
                to="/history"
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-semibold text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
                aria-label="Aller à l'historique"
              >
                Historique
              </Link>

              <Link
                to="/"
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 font-semibold text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
                aria-label="Retour à l'accueil"
              >
                Accueil
              </Link>
            </div>

            {apiError ? <div className="text-sm text-red-600">{apiError}</div> : null}
            {isStarted ? <div className="text-sm text-gray-700">Temps: {formatDuration(elapsedMs)}</div> : null}
            <div className="sr-only" aria-live="polite">
              {statusText}
            </div>
          </div>


          <div className="mx-auto w-fit">
            <div
              className="rounded-2xl bg-blue-600 p-4"
              role="grid"
              aria-label="Plateau de jeu"
            >
              <div className="grid grid-cols-7 gap-2">{afficherPlateau()}</div>
            </div>
          </div>

          {winner ? (
            <div className="mt-5 text-center">
              <div className="text-sm text-gray-600">Partie terminée</div>
              <div className="mt-1 text-2xl font-bold text-gray-900">
                {winner === 'DRAW' ? 'Égalité' : `Gagnant : ${winnerName}`}
              </div>
            </div>
          ) : (
            <div className="mt-5 text-center">
              <div className="text-sm text-gray-600">À toi de jouer</div>
              <div className="mt-1 text-2xl font-bold text-gray-900">
                <span className={joueurActuel === 1 ? 'text-red-600' : 'text-yellow-600'}>
                  {currentPlayerName}
                </span>
              </div>
            </div>
          )}

          <div className="mt-2 text-center text-sm text-gray-700">Coups: {movesCount}</div>
        </div>

        <EndGameDialog
          open={endDialogOpen}
          title={winner === 'DRAW' ? 'Égalité' : 'Victoire !'}
          description={
            winner === 'DRAW'
              ? 'Bravo à vous deux — aucune place restante.'
              : `Bravo ${winnerName} — partie terminée en ${formatDuration(elapsedMs)}.`
          }
          primaryLabel="Rejouer"
          onPrimary={() => {
            setEndDialogOpen(false)
            void startMatch()
          }}
          secondaryLabel="Voir l’historique"
          onSecondary={() => {
            setEndDialogOpen(false)
            navigate('/history')
          }}
          tertiaryLabel="Retour à l’accueil"
          onTertiary={() => {
            setEndDialogOpen(false)
            navigate('/')
          }}
          onClose={() => setEndDialogOpen(false)}
        />
      </div>
    </div>
  )
}

export default Game

