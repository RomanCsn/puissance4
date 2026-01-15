# UI - Guide d'intégration

## Ce que l'UI doit faire (flux minimal)
1) Au démarrage d’une partie :
- appeler [POST /matches](http://_vscodecontentref_/31) avec les 2 pseudos
- stocker [matchId](http://_vscodecontentref_/32)

2) Pendant la partie :
- logique Puissance4 côté front (grille, tours, timer, coups)

3) À la fin :
- appeler `POST /matches/:id/finish` avec :
  - [result](http://_vscodecontentref_/33) (`P1_WIN` / `P2_WIN` / `DRAW`)
  - [winnerPseudo](http://_vscodecontentref_/34) (pseudo gagnant) ou `null` si égalité
  - [movesCount](http://_vscodecontentref_/35)
  - Optionnel : [endedAt](http://_vscodecontentref_/36) ISO si vous préférez (sinon le backend met [new Date()](http://_vscodecontentref_/37))

4) Écran Historique :
- appeler `GET /games` et afficher tel quel (format prof)

## Exemple fetch (TypeScript / React)
### Créer un match
```ts
export async function createMatch(player1Pseudo: string, player2Pseudo: string) {
  const res = await fetch('http://localhost:3001/matches', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ player1Pseudo, player2Pseudo }),
  })
  if (!res.ok) throw new Error('createMatch failed')
  return res.json() as Promise<{
    id: string
    startedAt: string
    player1: { id: string; pseudo: string }
    player2: { id: string; pseudo: string }
  }>
}
```

### Terminer un match
```ts
export async function finishMatch(matchId: string, payload: {
  winnerPseudo: string | null
  result: 'P1_WIN' | 'P2_WIN' | 'DRAW'
  movesCount: number
  endedAt?: string
}) {
  const res = await fetch(`http://localhost:3001/matches/${matchId}/finish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error('finishMatch failed')
  return res.json()
}
```

### Charger l’historique (format prof)
```ts
export async function getGames(limit = 50) {
  const res = await fetch(`http://localhost:3001/games?limit=${limit}`)
  if (!res.ok) throw new Error('getGames failed')
  return res.json() as Promise<Array<[string, string, string, string]>>
}
```

## Formats importants (à ne pas changer)
- `/games` retourne exactement : [Array<[date, p1, p2, winner]>](http://_vscodecontentref_/38)
- winner vaut `"DRAW"` en cas d'égalité.