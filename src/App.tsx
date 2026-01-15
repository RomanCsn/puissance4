import { useState } from 'react'
import './App.css'

function App() {
  const ROWS = 6 
  const COLS = 7

  type Player = null | 'R' | 'Y' 


  const [board, setBoard] = useState<(Player)[]>(
    Array(ROWS * COLS).fill(null)
  )
  const [currentPlayer, setCurrentPlayer] = useState<Player>('R')
  const [winner, setWinner] = useState<Player | null>(null)

  
  const getCell = (row: number, col: number): Player => {
    return board[row * COLS + col]
  }

  
  const setCell = (row: number, col: number, player: Player) => {
    const newBoard = [...board]
    newBoard[row * COLS + col] = player
    setBoard(newBoard)
  }

  const getAvailableRow = (col: number): number | null => {
    for (let row = ROWS - 1; row >= 0; row--) {
      if (getCell(row, col) === null) {
        return row
      }
    }
    return null
  }

  const playMove = (col: number) => {
    if (winner) return

    const row = getAvailableRow(col)
    if (row === null) return

    setCell(row, col, currentPlayer)

    if (checkWinner(row, col, currentPlayer)) {
      setWinner(currentPlayer)
    } else {
      setCurrentPlayer(currentPlayer === 'R' ? 'Y' : 'R')
    }
  }

   


  const checkWinner = (row: number, col: number, player: Player): boolean => {
    // Vérifier horizontal
    let count = 1
    for (let i = 1; i < 4; i++) {
      if (col - i >= 0 && getCell(row, col - i) === player) count++
      else break
    }
    for (let i = 1; i < 4; i++) {
      if (col + i < COLS && getCell(row, col + i) === player) count++
      else break
    }
    if (count >= 4) return true

    // Vérifier vertical
    count = 1
    for (let i = 1; i < 4; i++) {
      if (row + i < ROWS && getCell(row + i, col) === player) count++
      else break
    }
    for (let i = 1; i < 4; i++) {
      if (row - i >= 0 && getCell(row - i, col) === player) count++
      else break
    }
    if (count >= 4) return true

    // Vérifier diagonal (haut-gauche à bas-droite)
    count = 1
    for (let i = 1; i < 4; i++) {
      if (row - i >= 0 && col - i >= 0 && getCell(row - i, col - i) === player) count++
      else break
    }
    for (let i = 1; i < 4; i++) {
      if (row + i < ROWS && col + i < COLS && getCell(row + i, col + i) === player) count++
      else break
    }
    if (count >= 4) return true

    // Vérifier diagonal (bas-gauche à haut-droite)
    count = 1
    for (let i = 1; i < 4; i++) {
      if (row + i < ROWS && col - i >= 0 && getCell(row + i, col - i) === player) count++
      else break
    }
    for (let i = 1; i < 4; i++) {
      if (row - i >= 0 && col + i < COLS && getCell(row - i, col + i) === player) count++
      else break
    }
    if (count >= 4) return true

    return false
  }

  const resetGame = () => {
    setBoard(Array(ROWS * COLS).fill(null))
    setCurrentPlayer('R')
    setWinner(null)
  }

  const getCellColor = (row: number, col: number): string => {
    const player = getCell(row, col)
    if (player === 'R') return 'red'
    if (player === 'Y') return 'yellow'
    return 'white'
  }

  return (
    <div className="game-container">
      <h1>Puissance 4</h1>
      <div className="game-info">
        {winner ? (
          <p>Joueur {winner} a gagné!</p>
        ) : (
          <p>Tour du joueur: {currentPlayer}</p>
        )}
      </div>
      <div className="board">
        {Array.from({ length: ROWS }).map((_, row) => (
          <div key={row} className="board-row">
            {Array.from({ length: COLS }).map((_, col) => (
              <button
                key={`${row}-${col}`}
                className="cell"
                style={{ backgroundColor: getCellColor(row, col) }}
                onClick={() => playMove(col)}
              />
            ))}
          </div>
        ))}
      </div>
      <button onClick={resetGame} className="reset-btn">Réinitialiser</button>
    </div>
  )
}

export default App