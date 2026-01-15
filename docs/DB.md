# BDD - PostgreSQL + Prisma

## Stack BDD
- PostgreSQL (Docker)
- Prisma ORM
- Prisma Client utilisé côté API (Express)

## Modèle de données
### Enum
`MatchResult` :
- `P1_WIN`
- `P2_WIN`
- `DRAW`

### Table `Player`
Champs :
- [id](http://_vscodecontentref_/2) (String, cuid, PK)
- [pseudo](http://_vscodecontentref_/3) (String, **unique**)
- [createdAt](http://_vscodecontentref_/4) (DateTime)

Rôle :
- stocker les joueurs par pseudo (créé automatiquement au démarrage d’un match si absent).

### Table `Match`
Champs :
- [id](http://_vscodecontentref_/5) (String, cuid, PK)
- [player1Id](http://_vscodecontentref_/6) / [player2Id](http://_vscodecontentref_/7) (FK -> Player)
- [winnerId](http://_vscodecontentref_/8) nullable (FK -> Player)
- [result](http://_vscodecontentref_/9) nullable (`MatchResult`)
- [movesCount](http://_vscodecontentref_/10) (Int, défaut 0)
- [durationMs](http://_vscodecontentref_/11) (Int, défaut 0)
- [startedAt](http://_vscodecontentref_/12) (DateTime)
- [endedAt](http://_vscodecontentref_/13) nullable (DateTime)
- [createdAt](http://_vscodecontentref_/14) (DateTime)

Règle :
- Un match est considéré “terminé” si [endedAt != null](http://_vscodecontentref_/15).
- L’historique (`/games`) ne remonte que les matchs terminés.

## Migration
- Une migration `init` est créée dans [prisma/migrations/**](http://_vscodecontentref_/16).

Commandes utiles :
```powershell
npx prisma migrate dev
npx prisma studio
```

## Connexion DB (Docker)
Le Postgres est exposé en local sur :
- `localhost:5432`
- DB : `puissance4`
- User/Pass : `puissance4 / puissance4`