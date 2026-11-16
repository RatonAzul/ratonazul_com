# Local development

`flake.nix` and `flake.lock` pin Node.js 22, pnpm 10, Docker Compose,
PostgreSQL client tools, and Git using the same nixpkgs revision as the API
repositories. Node satisfies the project's `>=22.12.0` requirement; pnpm
uses the same Node runtime.

```sh
nix develop
pnpm install --frozen-lockfile
pnpm dev
```

The frontend runs at http://localhost:2601. Alternatively, run `direnv allow`
once to activate the shell automatically when entering this directory.
`.envrc` loads tools only; Vite/SvelteKit load the application's `.env`.
The shell does not install dependencies, start services, or run migrations.

Create an untracked `.env` with your local configuration before starting the
app or building it. Required variable names are documented in `AGENTS.md`;
keep all credentials and JWT secrets out of Git. Point `MOTORSPORT_API_URL`
and `MEDIA_TRACKER_API_URL` to the corresponding running API services, and
match each private JWT secret to that service's configuration.

The existing `pnpm db:start` script starts PostgreSQL 18 through Docker Compose
and requires a running Docker daemon plus `POSTGRES_USER`, `POSTGRES_PASSWORD`,
and `POSTGRES_DB` in `.env`. These must match the user, password, and database
in `DATABASE_URL`. The database binds only to localhost on port 1, matching
the restored environment. The image is pinned and data persists in the
`pgdata` volume. To start it in the background and wait for readiness, run
`docker compose up -d --wait db`.

Drizzle commands load `.env` through `drizzle.config.ts` while preserving
environment variables already exported by the shell. `pnpm db:generate`
creates migration files; `pnpm db:migrate` applies them to the database.
Run migrations or schema pushes only when you intend to change the database.

```sh
pnpm check        # Svelte and TypeScript diagnostics
pnpm build        # production build; requires application environment values
pnpm start        # run the production build
```

The repository guide records existing type-check failures. Launch your editor
from the shell if it needs access to these tools.

## Games administration

Start `ratonazul_com_api` from its own dev shell with `make setup` and
`make dev`. Configure these private frontend `.env` variables:

```dotenv
RATONAZUL_COM_API_URL=http://localhost:2604
PRIVATE_RATONAZUL_COM_API_JWT_SECRET=<same value as the games API JWT_SECRET_KEY>
```

The local environment has these values configured. Sign in with an admin
account and open `/admin/games`. Each game has its own yearly calendar from
2026 onwards, with later years available as they arrive. Click a date to add,
view, edit or delete results for registered website users. Colors indicate
zero, one or at least two distinct players; multiple Isaaconnect attempts by
one player count once. Future dates cannot receive results.
The calendar shows six month cards at a time on desktop, three on tablets, and one on mobile.
Use the arrows to page through months, or swipe horizontally on mobile.
It opens at the selected date's month; year links navigate older years.

Wordle and La Palabra del Día need an answer and guesses. Puzzle numbers
are calculated from the selected date: on 2026-11-14, Wordle is #1974 and
La Palabra del Día is #1773. The server calculates these numbers too;
there is no puzzle-number input. New results default to the signed-in user,
while editing keeps the result's player and validation failures keep the selection.
Only trailing guess fields may be empty; an unsuccessful game needs six
guesses. Answers are shared per puzzle. Existing board-only results remain
viewable and can be edited by supplying their original guesses.

Paste the complete Isaaconnect share text. Puzzle #855 corresponds to
2026-11-13; other puzzle dates are calculated from this anchor. Parsed times
are stored in whole seconds because that is the API's representation.

Run `pnpm test:games` for scoring, parser and calendar tests. Integration
verification exercised authenticated CRUD, admin authorization, shared answers
and calendar counts against the running local services using temporary
accounts and records, which were removed afterwards.

## WebStorm

The local `.idea` settings select the Nix-pinned Node.js 22 runtime and pnpm.
Tailwind's language server explicitly uses `src/app.css` for `src/**`, including
custom colors declared in `@theme inline`. Reopen the project after changing
these settings externally. If the flake is updated, select the new paths from
`nix develop -c sh -c 'command -v node; command -v pnpm'` under JavaScript Runtime.
