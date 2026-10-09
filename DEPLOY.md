# JumperNet – Deploy online senza Docker

Architettura: **Frontend Next.js → Vercel**, **Backend Express → Render**, **Database → Neon (PostgreSQL)**.
Tutti e tre hanno un piano gratuito.

```
Browser ──> Vercel (frontend) ──fetch──> Render (backend /api/...) ──Prisma──> Neon (Postgres)
```

## 1. Database (Neon)

1. Su https://neon.tech crea un progetto e copia la *connection string*
   (`postgresql://...neon.tech/neondb?sslmode=require`).
2. In locale, dentro `backend/`, crea il file `.env` (vedi `.env.example`) con `DATABASE_URL=...`.
3. Crea le tabelle:
   ```bash
   cd backend
   npm install
   npx prisma db push
   ```

## 2. Backend (Render)

1. https://render.com → **New → Web Service** → collega la repo GitHub.
2. Impostazioni:
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`
3. Environment variables:
   - `DATABASE_URL` = la stringa di Neon
   - `FRONTEND_URL` = l'URL Vercel (lo aggiungi dopo il passo 3, es. `https://jumpernet.vercel.app`, senza `/` finale)
4. Verifica: apri `https://<tuo-backend>.onrender.com/api/users` → deve rispondere `[]` o una lista JSON.

> Il piano free di Render "dorme" dopo 15 min di inattività: la prima richiesta può impiegare ~50 s.

## 3. Frontend (Vercel)

1. https://vercel.com → **Add New → Project** → importa la repo.
2. Root Directory: `frontend` (framework Next.js rilevato in automatico).
3. Environment variable:
   - `NEXT_PUBLIC_API_URL` = `https://<tuo-backend>.onrender.com` (senza `/` finale)
4. Deploy. Se cambi `NEXT_PUBLIC_API_URL` devi fare **Redeploy**: è inserita nel codice al momento della build.

## Sviluppo in locale (senza Docker)

Due terminali:

```bash
cd backend && npm install && npm run dev        # http://localhost:3001
```

```bash
cd frontend && npm install && npm run dev       # http://localhost:3000
```

Con `frontend/.env.local` contenente `NEXT_PUBLIC_API_URL=http://localhost:3001`.

Al posto di Adminer: `npx prisma studio` (dentro `backend/`) apre un'interfaccia grafica del database nel browser.
