# Kallurian's home — Flatmate Expense Tracker

Track shared expenses, split bills, and settle up with minimized transfers.

- **View** — anyone with the link can browse
- **Edit** — sign in with the shared flat password (JWT session, 30 days)

## Setup

```bash
cp .env.example .env.local
```

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Neon Postgres connection string |
| `APP_SECRET` | 32+ char secret for signing JWT cookies |
| `FLAT_PASSWORD` | Shared password flatmates use to sign in |

```bash
npm run db:push
npm run db:seed
npm run dev
```

Visit `http://localhost:3000` — browse freely. Go to `/login` to sign in and edit.

## Flatmates

| Name | Default emoji |
|---|---|
| Dinesh | 🐷 |
| Nithin | 🐯 |
| Yaswanth | 🦅 |
| Pavan karthik | 🐺 |

Icons are editable on the Members tab after signing in.

## Features

- **Settings** tab — theme (light / dark / system), change flat password, sign out
- Custom expense categories with emoji icons
- Minimized settlement transfers

After pulling schema changes, run `npm run db:push` to add the `app_settings` table (stores password changes from Settings).
