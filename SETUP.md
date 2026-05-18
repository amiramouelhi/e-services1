# OTDAV — Setup & Migration Guide

This project has three parts:
- `backend/` — Node.js + Express + Prisma + PostgreSQL API
- `client/` — React + Vite frontend (public-facing)
- `admin/` — React + Vite frontend (admin panel)

## System requirements

| Tool | Version | Notes |
|---|---|---|
| Node.js | **>= 20 LTS** | required by Vite 7/8 and Puppeteer 24 |
| npm | bundled with Node | comes with Node install |
| PostgreSQL | **>= 14** | tested with the Prisma 5 PostgreSQL driver |
| Git | any recent | for cloning and tracking changes |

### OS-specific notes

- **Puppeteer (PDF generation):** the first `npm install` in `backend/` downloads a Chromium binary (~170 MB) under `node_modules/`. On Linux you may also need: `libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 libpango-1.0-0 libcairo2 libasound2`.
- **Windows:** no extra system packages needed.

## First-time install

From the project root, run each subproject's install:

```bash
# Backend
cd backend
npm install
npx prisma generate

# Public client
cd ../client
npm install

# Admin
cd ../admin
npm install
```

## Database setup

1. Create a PostgreSQL database (default name: `otdav_db`).
2. Create `backend/.env` with the following keys (this file is gitignored — do not commit):

   ```env
   DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/otdav_db"
   JWT_SECRET=<long-random-string>
   EMAIL_USER=<gmail-address>
   EMAIL_PASS=<gmail-app-password>
   ```

   - `JWT_SECRET`: generate with `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`.
   - `EMAIL_PASS`: a Google **App Password** (not your normal Gmail password). Required for verification, password reset, and renewal-reminder emails.

3. Apply migrations and seed reference data:

   ```bash
   cd backend
   npx prisma migrate deploy   # apply existing migrations
   npx prisma db seed          # seed the 16 work categories (idempotent)
   ```

4. Create the first admin user (no UI for this — insert directly):

   ```bash
   node -e "const b=require('bcrypt');b.hash('YOUR_PASSWORD',10).then(h=>console.log(h))"
   # then in psql:
   #   INSERT INTO \"Admin\" (email, password) VALUES ('admin@example.com', '<hash>');
   ```

## Running locally

Open three terminals:

```bash
# Terminal 1 — backend (port 5000)
cd backend && npm run dev

# Terminal 2 — public client (port 5173)
cd client && npm run dev

# Terminal 3 — admin (port 5174)
cd admin && npm run dev
```

The frontends call the backend at `import.meta.env.VITE_API_URL` (configured in their `src/api.ts` / axios setup — adjust if your backend runs elsewhere).

## Production build

```bash
cd client && npm run build   # outputs client/dist
cd ../admin && npm run build # outputs admin/dist
cd ../backend && npm start   # runs node src/server.js
```

Serve the `dist/` folders behind any static host (Nginx, Caddy, Vercel, etc.) and proxy `/api` (or whatever path you choose) to the backend.

## Migration to a new machine

This project ships **without** `node_modules/` and `dist/` — they regenerate on install.

What you must bring to the new machine:
- All source folders (`backend/`, `client/`, `admin/`)
- `backend/uploads/` (user-uploaded files: CINs, factures, PDFs)
- A dump of the PostgreSQL database (`pg_dump otdav_db > otdav_db.sql`)
- A new `backend/.env` (do **not** copy the old one if it had production secrets — regenerate `JWT_SECRET`)

On the new machine:

```bash
# 1. Restore the database
createdb otdav_db
psql otdav_db < otdav_db.sql

# 2. Install dependencies
cd backend && npm install && npx prisma generate
cd ../client && npm install
cd ../admin && npm install

# 3. Start
cd ../backend && npm run dev
```

If the schema changed since the dump, also run `npx prisma migrate deploy` after the restore.

## Cron job

`backend/src/cron/renewalReminder.js` runs daily at 8:00 AM (server local time) and sends renewal reminder emails for depots expiring in 30 / 23 / 16 / 9 / 1 days. It starts automatically when `npm run dev` or `npm start` is invoked — no separate process needed.

## Useful scripts

| Folder | Command | What it does |
|---|---|---|
| `backend` | `npm run dev` | runs Express with nodemon (auto-restart) |
| `backend` | `npm start` | runs Express in plain Node |
| `backend` | `npx prisma studio` | opens a DB GUI on `localhost:5555` |
| `backend` | `npx prisma migrate dev --name <description>` | creates a new migration when you change `schema.prisma` |
| `client` / `admin` | `npm run dev` | Vite dev server |
| `client` / `admin` | `npm run build` | type-check + production build |
| `client` / `admin` | `npm run lint` | run ESLint |
