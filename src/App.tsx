import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function App() {
  const navigate = useNavigate()

  const [player1Pseudo, setPlayer1Pseudo] = useState('')
  const [player2Pseudo, setPlayer2Pseudo] = useState('')
  const [error, setError] = useState<string | null>(null)

  const onStart = () => {
    const p1 = player1Pseudo.trim()
    const p2 = player2Pseudo.trim()

    if (!p1 || !p2) {
      setError('Veuillez entrer 2 pseudos.')
      return
    }
    if (p1 === p2) {
      setError('Les pseudos doivent être différents.')
      return
    }

    setError(null)
    const params = new URLSearchParams({ p1, p2 })
    navigate(`/game?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mx-auto max-w-lg text-center">
        <h1 className="mb-2 text-3xl font-bold">Puissance 4</h1>
        <p className="mb-8 text-gray-700">Entrez vos pseudos, puis démarrez une partie.</p>

        <div className="rounded-lg bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <input
                className="w-1/2 rounded border border-gray-300 px-3 py-2"
                placeholder="Pseudo Joueur 1 (Rouge)"
                value={player1Pseudo}
                onChange={(e) => setPlayer1Pseudo(e.target.value)}
              />
              <input
                className="w-1/2 rounded border border-gray-300 px-3 py-2"
                placeholder="Pseudo Joueur 2 (Jaune)"
                value={player2Pseudo}
                onChange={(e) => setPlayer2Pseudo(e.target.value)}
              />
            </div>

            {error ? <div className="text-sm text-red-600">{error}</div> : null}

            <button
              type="button"
              className="rounded bg-gray-900 px-4 py-2 font-semibold text-white"
              onClick={onStart}
            >
              Démarrer
            </button>

            <div className="text-sm">
              <Link className="text-gray-900 underline" to="/history">
                Voir l’historique
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App