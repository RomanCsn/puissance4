# DEV - Lancer le projet (Windows)

## Pré-requis
- Node.js (version récente)
- Docker Desktop
- npm

## Installation
Depuis la racine du projet :
```powershell
npm install
```

## Démarrer la base de données (PostgreSQL)
```powershell
docker compose up -d
```

## Variables d'environnement
Le fichier [.env](http://_vscodecontentref_/1) contient :
- `DATABASE_URL="postgresql://puissance4:puissance4@localhost:5432/puissance4?schema=public"`

## Prisma (génération + migrations)
Générer le client Prisma :
```powershell
npx prisma generate
```

Appliquer les migrations :
```powershell
npx prisma migrate dev
```

## Démarrer l'API
```powershell
npm run dev:api
```
API par défaut : `http://localhost:3001`

## Démarrer le front (UI)
```powershell
npm run dev
```

## Lancer front + API ensemble
```powershell
npm run dev:all
```

## Notes PowerShell (important)
Sous Windows PowerShell :
- `curl` peut être un alias (`Invoke-WebRequest`) et casser les JSON.
- Utiliser **curl.exe** (recommandé) :

```powershell
curl.exe http://localhost:3001/health
```