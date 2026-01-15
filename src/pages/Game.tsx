import { useState } from 'react';

function Game() {
  const ROWS = 6;
  const COLS = 7;

  type Player = null | 'R' | 'Y';

  const [board, setBoard] = useState<(Player)[]>(
    Array(ROWS * COLS).fill(null)
  );
  const [currentPlayer, setCurrentPlayer] = useState<Player>('R');
  const [winner, setWinner] = useState<Player | null>(null);

  const getCell = (row: number, col: number): Player => {
    return board[row * COLS + col];
  };

  const setCell = (row: number, col: number, player: Player) => {
    const newBoard = [...board];
    newBoard[row * COLS + col] = player;
    setBoard(newBoard);
  };

  const getAvailableRow = (col: number): number | null => {
    for (let row = ROWS - 1; row >= 0; row--) {
      if (getCell(row, col) === null) {
        return row;
      }
    }
    return null;
  };

  const playMove = (col: number) => {
    if (winner) return;

    const row = getAvailableRow(col);
    if (row === null) return;

    console.log(`${currentPlayer} joue colonne ${col} (ligne ${row})`);

    setCell(row, col, currentPlayer);

    if (checkWinner(row, col, currentPlayer)) {
      setWinner(currentPlayer);
    } else {
      setCurrentPlayer(currentPlayer === 'R' ? 'Y' : 'R');
    }
  };

  const checkWinner = (row: number, col: number, player: Player): boolean => {
    // Vérifier horizontal
    let count = 1;
    for (let i = 1; i < 4; i++) {
      if (col - i >= 0 && getCell(row, col - i) === player) count++;
      else break;
    }
    for (let i = 1; i < 4; i++) {
      if (col + i < COLS && getCell(row, col + i) === player) count++;
      else break;
    }
    if (count >= 4) return true;

    // Vérifier vertical
    count = 1;
    for (let i = 1; i < 4; i++) {
      if (row + i < ROWS && getCell(row + i, col) === player) count++;
      else break;
    }
    for (let i = 1; i < 4; i++) {
      if (row - i >= 0 && getCell(row - i, col) === player) count++;
      else break;
    }
    if (count >= 4) return true;

    // Vérifier diagonal (haut-gauche à bas-droite)
    count = 1;
    for (let i = 1; i < 4; i++) {
      if (row - i >= 0 && col - i >= 0 && getCell(row - i, col - i) === player) count++;
      else break;
    }
    for (let i = 1; i < 4; i++) {
      if (row + i < ROWS && col + i < COLS && getCell(row + i, col + i) === player) count++;
      else break;
    }
    if (count >= 4) return true;

    // Vérifier diagonal (bas-gauche à haut-droite)
    count = 1;
    for (let i = 1; i < 4; i++) {
      if (row + i < ROWS && col - i >= 0 && getCell(row + i, col - i) === player) count++;
      else break;
    }
    for (let i = 1; i < 4; i++) {
      if (row - i >= 0 && col + i < COLS && getCell(row - i, col + i) === player) count++;
      else break;
    }
    if (count >= 4) return true;

    return false;
  };

  const resetGame = () => {
    setBoard(Array(ROWS * COLS).fill(null));
    setCurrentPlayer('R');
    setWinner(null);
  };

  const getCellColor = (row: number, col: number): string => {
    const player = getCell(row, col);
    if (player === 'R') return 'bg-red-500';
    if (player === 'Y') return 'bg-yellow-400';
    return 'bg-white';
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-lg mx-auto text-center">
        <h1 className="text-4xl font-bold mb-8 text-gray-800">Puissance 4</h1>
        
        <div className="mb-6">
          {!winner && (
            <p className={`text-xl font-semibold ${currentPlayer === 'R' ? 'text-red-500' : 'text-yellow-500'}`}>
              Tour du joueur: {currentPlayer === 'R' ? 'Rouge' : 'Jaune'}
            </p>
          )}
        </div>

        <div className="bg-blue-600 p-6 rounded-lg inline-block shadow-lg mb-6">
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: ROWS }).map((_, row) =>
              Array.from({ length: COLS }).map((_, col) => (
                <button
                  key={`${row}-${col}`}
                  className={`w-12 h-12 rounded-full border-2 border-gray-300 hover:border-gray-500 transition-all duration-200 ${getCellColor(row, col)}`}
                  onClick={() => playMove(col)}
                />
              ))
            )}
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <button 
            onClick={resetGame} 
            className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Nouvelle partie
          </button>
          
          <button 
            onClick={() => window.location.href = '/history'} 
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Historique
          </button>
        </div>

        {/* Modale de victoire */}
        {winner && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-white bg-opacity-95 p-8 rounded-xl shadow-2xl text-center max-w-sm mx-4 border-4 border-gray-300">
              <div className="mb-6">
                <div className={`w-16 h-16 rounded-full mx-auto mb-4 ${winner === 'R' ? 'bg-red-500' : 'bg-yellow-400'} border-4 border-gray-200`}></div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Félicitations !</h2>
                <p className={`text-xl font-semibold ${winner === 'R' ? 'text-red-500' : 'text-yellow-500'}`}>
                  Joueur {winner === 'R' ? 'Rouge' : 'Jaune'} a gagné !
                </p>
              </div>
              <div className="space-y-3">
                <button 
                  onClick={resetGame} 
                  className={`w-full py-3 px-6 rounded-lg font-bold text-white transition-colors duration-200 ${
                    winner === 'R' 
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-yellow-500 hover:bg-yellow-600'
                  }`}
                >
                  Nouvelle partie
                </button>
                <button 
                  onClick={() => window.location.href = '/history'} 
                  className="w-full py-3 px-6 rounded-lg font-bold text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors duration-200"
                >
                  Voir l'historique
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Game;

