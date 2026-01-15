# API - Express + TypeScript + Prisma

## Base URL
- `http://localhost:3001`

## Middleware
- [cors({ origin: true })](http://_vscodecontentref_/17)
- [express.json()](http://_vscodecontentref_/18)
- Validation payloads via `zod`
- Error handler :
  - 400 si ZodError
  - 500 sinon

## Endpoints

### GET `/health`
**But** : vérifier que l’API tourne.

Réponse (exemple) :
```json
{ "ok": true, "service": "puissance4-api", "date": "2026-01-15T10:19:53.611Z" }
```

---

### POST `/players`
**Body**
```json
{ "pseudo": "Alice" }
```

**Réponse 201**
```json
{ "id": "xxx", "pseudo": "Alice", "createdAt": "..." }
```

Note : ce endpoint est optionnel côté UI car [POST /matches](http://_vscodecontentref_/19) upsert déjà les joueurs.

---

### POST [/matches](http://_vscodecontentref_/20)
Crée un match + upsert des joueurs si besoin.

**Body**
```json
{ "player1Pseudo": "Alice", "player2Pseudo": "Bob" }
```

**Réponse 201**
```json
{
  "id": "MATCH_ID",
  "startedAt": "2026-01-15T10:17:45.892Z",
  "player1": { "id": "P1_ID", "pseudo": "Alice" },
  "player2": { "id": "P2_ID", "pseudo": "Bob" }
}
```

---

### POST [/matches/:id/finish](http://_vscodecontentref_/21)
Termine un match : écrit [endedAt](http://_vscodecontentref_/22), [durationMs](http://_vscodecontentref_/23), [movesCount](http://_vscodecontentref_/24), [result](http://_vscodecontentref_/25), [winnerId](http://_vscodecontentref_/26).

**Body**
- Victoire :
```json
{ "winnerPseudo": "Alice", "result": "P1_WIN", "movesCount": 17 }
```

- Égalité :
```json
{ "winnerPseudo": null, "result": "DRAW", "movesCount": 42 }
```

**Réponse**
```json
{
  "ok": true,
  "match": {
    "id": "MATCH_ID",
    "startedAt": "...",
    "endedAt": "...",
    "durationMs": 127719,
    "movesCount": 17,
    "result": "P1_WIN",
    "player1": "Alice",
    "player2": "Bob",
    "winner": "Alice"
  }
}
```

---

### GET `/games` (format prof)
Retourne l'historique **au format attendu** :
[Array<[date, player1, player2, winner]>](http://_vscodecontentref_/27)

- [date](http://_vscodecontentref_/28) = `YYYY-MM-DD`
- [winner](http://_vscodecontentref_/29) = pseudo du gagnant ou `"DRAW"`

**Réponse exemple**
```json
[
  ["2026-01-15","Alice","Bob","Alice"]
]
```

---

### GET [/matches](http://_vscodecontentref_/30) (debug riche)
Retourne jusqu’à 100 matchs (terminés ou non) :
```json
[
  {
    "id": "...",
    "startedAt": "...",
    "endedAt": null,
    "durationMs": 0,
    "movesCount": 0,
    "result": null,
    "player1": "Alice",
    "player2": "Bob",
    "winner": null
  }
]
```

## Exemples PowerShell (Windows)
Créer un match :
```powershell
curl.exe -X POST http://localhost:3001/matches `
  -H "Content-Type: application/json" `
  -d '{"player1Pseudo":"Alice","player2Pseudo":"Bob"}'
```

Finir un match :
```powershell
curl.exe -X POST http://localhost:3001/matches/MATCH_ID/finish `
  -H "Content-Type: application/json" `
  -d '{"winnerPseudo":"Alice","result":"P1_WIN","movesCount":17}'
```

Historique (format prof) :
```powershell
curl.exe http://localhost:3001/games
```