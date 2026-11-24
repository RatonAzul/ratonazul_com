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

## Notifications

Apply the website migration with `pnpm db:migrate` and the
`ratonazul_com_api` migration with `make migrate-up` before testing the
notification inbox. Sign in, open your profile and enable notifications.
In **Admin → Users**, open a user and assign any of the games, calendar,
motorsport, or admin notification groups. In **Admin → Notifications**, choose
site-wide or one group when publishing. Group assignment does not grant
access to restricted pages. Calendar alerts also require calendar membership,
and admin alerts also require the admin role. The same checks apply to the
inbox and browser delivery. Existing alerts remain site-wide.

The bell and profile Notifications tab show the latest 50 eligible alerts.
Opening an alert marks it as read for that account. Both views have unread
and read tabs and can mark all listed alerts as read.

New calendar comments and manually added events publish to the Calendar group
and exclude the author. The titles are “{display name} wrote a comment” and
“{display name} added an event”. Alerts contain the comment or event text and
link to the selected date or the event’s start date. Edits do not generate
another alert. Long text stays complete in the inbox and is shortened in
the browser push preview.

New Wordle, La Palabra del Día, and Isaaconnect results publish to the Games
group. Alerts use the recorded player’s display name and exclude that player.
The description reconstructs the game’s share text from the saved result,
including the emoji board and omitting the external link. Updating an existing
result does not generate another alert.

Pick the Grid sends reminders to opted-in Motorsport subscribers on Monday
at midnight in Europe/Madrid, 24 hours before the meeting starts, and one
hour before it starts. The website checks for any saved position or time bet
before sending. The Node server checks every 30 seconds and catches up for
up to ten minutes after a scheduled time. Each checkpoint is stored once
per meeting. Set `PICK_THE_GRID_REMINDERS=false` to disable scheduling in a
website process. In Vite development the scheduler starts on the first request.

In the profile’s notification settings, users can opt out of individual
categories. Pick the Grid and Games switches are visible to everyone.
Calendar and Admin switches require their corresponding page access.
Category switches preserve admin-managed group assignments.

Choose **enable notifications on this device** in the profile to open the
browser permission prompt. Without Web Push configuration, an open site tab
shows browser alerts for new unread items as it refreshes the inbox. Device
settings can be changed separately from the account’s inbox setting.

For delivery even when the site is closed, generate a VAPID key pair with
`pnpm exec web-push generate-vapid-keys`. Set `VAPID_PUBLIC_KEY`,
`VAPID_PRIVATE_KEY` and `VAPID_SUBJECT` in the website's private environment.
Use a contact URI such as `mailto:admin@example.com` for the subject. Keep the
key pair stable for existing subscriptions. Browser alerts require a secure
origin, permission on each device and, on iPhone and iPad, opening the site
from the Home Screen. Localhost can be used for desktop testing. The in-site
inbox works without VAPID configuration.
