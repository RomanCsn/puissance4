import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { createMatch, finishMatch } from '../api/matches'

function Game() {
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

  const isStarted = matchId !== null
  const isFinished = winner !== null

  const hasPseudosFromHome = Boolean(searchParams.get('p1') && searchParams.get('p2'))

  const elapsedMs = useMemo(() => {
    if (!startedAtMs) return 0
    return Math.max(0, nowMs - startedAtMs)
  }, [nowMs, startedAtMs])

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

  // Créer la grille 6 lignes x 7 colonnes
  const afficherPlateau = () => {
    const lignes = [];
    for (let ligne = 0; ligne < 6; ligne++) {
      for (let colonne = 0; colonne < 7; colonne++) {
        const cell = board[ligne * COLS + colonne]
        const cellClass =
          cell === 1 ? 'bg-red-500' : cell === 2 ? 'bg-yellow-400' : 'bg-white hover:bg-gray-100'

        lignes.push(
          <button
            key={`${ligne}-${colonne}`}
            onClick={() => gererClicColonne(colonne)}
            className={`w-12 h-12 rounded-full ${cellClass}`}
          />
        );
      }
    }
    return lignes;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-lg mx-auto text-center">
        <h1 className="text-3xl font-bold mb-8">Puissance 4</h1>

        <div className="mb-6 flex flex-col items-center gap-3">
          {hasPseudosFromHome ? (
            <div className="text-sm text-gray-700">
              {player1Pseudo.trim() || 'Joueur 1'} (Rouge) vs {player2Pseudo.trim() || 'Joueur 2'} (Jaune)
            </div>
          ) : (
            <div className="flex w-full gap-2">
              <input
                className="w-1/2 rounded border border-gray-300 px-3 py-2"
                placeholder="Pseudo Joueur 1 (Rouge)"
                value={player1Pseudo}
                onChange={(e) => setPlayer1Pseudo(e.target.value)}
                disabled={isSaving}
              />
              <input
                className="w-1/2 rounded border border-gray-300 px-3 py-2"
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
              className="rounded bg-gray-900 px-4 py-2 text-white"
              onClick={() => void startMatch()}
              disabled={isSaving}
            >
              {isStarted ? 'Rejouer (nouvelle partie)' : 'Commencer'}
            </button>

            <Link
              to="/history"
              className="rounded border border-gray-300 bg-white px-4 py-2"
              aria-label="Aller à l'historique"
            >
              Historique
            </Link>

            <Link
              to="/"
              className="rounded border border-gray-300 bg-white px-4 py-2"
              aria-label="Retour à l'accueil"
            >
              Accueil
            </Link>
          </div>

          {apiError ? <div className="text-sm text-red-600">{apiError}</div> : null}
          {isStarted ? <div className="text-sm text-gray-700">Temps: {formatDuration(elapsedMs)}</div> : null}
        </div>

        <div className="bg-blue-600 p-4 rounded-lg inline-block">
          <div className="grid grid-cols-7 gap-2">
            {afficherPlateau()}
          </div>
        </div>

        {winner ? (
          <h2 className="text-xl mt-4">
            {winner === 'DRAW'
              ? 'Égalité !'
              : `Gagnant : ${winner === 1 ? player1Pseudo.trim() || 'Joueur 1' : player2Pseudo.trim() || 'Joueur 2'}`}
          </h2>
        ) : (
          <h2 className={`text-xl mt-4 ${joueurActuel === 1 ? 'text-red-500' : 'text-yellow-500'}`}>
            Tour : {joueurActuel === 1 ? (player1Pseudo.trim() || 'Joueur 1') : (player2Pseudo.trim() || 'Joueur 2')} (
            {joueurActuel === 1 ? 'Rouge' : 'Jaune'})
          </h2>
        )}

        <div className="mt-2 text-sm text-gray-700">Coups: {movesCount}</div>
      </div>
    </div>
  );
}

export default Game

