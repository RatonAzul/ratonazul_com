# Repository guide

## Scope and architecture

This is ratonazul's personal website: Svelte 5, SvelteKit 2, strict TypeScript,
Tailwind CSS 4, and Vite. Production uses `@sveltejs/adapter-node`.
The repository owns the website, Better Auth accounts/sessions, and a SvelteKit
gateway to three separate services. Motorsport, media, and games domain databases and
their scoring/business logic are outside this repository.

Typical data flow:
`Svelte component -> src/lib/queries -> /api route -> src/lib/api -> external API`.
Queries use TanStack Svelte Query v6. The root layout creates a QueryClient and
provides it to all pages; ordinary queries are enabled in the browser. The game
page also attempts to prefetch in its universal load function.

## Directory map

- `src/routes/+page.svelte`: personal landing page.
- `src/routes/+layout.ts` and `+layout.svelte`: query client, global styles,
  theme/CRT effect, header/footer, development query devtools.
- `src/routes/media/+page.svelte`: current and recent books, anime, manga.
- `src/routes/motorsport/+page.svelte`: entry point linking to the game.
- `src/routes/pick-the-grid/`: game page and prefetch load function.
- `src/routes/pics/+page.svelte`: placeholder page.
- `src/routes/admin/`: admin landing page and initial user administration.
- `src/routes/admin/calendar/`: admin-only hub linking to the `access`, `types`,
  `events`, and `game-results` subpages. Calendar access lives in `calendar_member` with cascading
  user deletion. Each subpage requires an admin for its load and actions. Calendar pages and
  actions must call `requireCalendarMember` in `src/lib/server/calendar/access.ts`.
- `src/routes/calendar/`: member-only calendar starting in August 2026. The month
  picker shows up to four months on desktop, two on tablets, and one on mobile.
  The selected date lives in the `date` query parameter and drives the day panel.
  The day panel reads and posts comments through `ratonazul_com_api`. Each member
  can post and edit their own comment per date. Edited comments display the
  last edit time. The Add event type picker shows each type's icon and color.
  The editor and comment cards use `UserAvatar`
  and resolve current profile details from the website database. Members can also
  add typed daily events. The first type in the admin priority order supplies
  the cell color when a day has multiple events. The root layout
  exposes membership to all navbars.
- `src/routes/profile/[userId]/`: owner-only profile editing and account deletion
  using Better Auth. The header links to the current user's profile.
- `src/routes/games/` shows the public Games heading. Only the two players
  selected in `/admin/games/access` can load the daily matchup. Compare the
  best saved result per player and game using the Calendar result rules.
  Display game scores and outcomes above separate board cards. Show submitted Wordle guesses and the Isaaconnect tie-break metrics when needed.
- `src/routes/admin/games/`: game cards and per-game calendar/result management
  at `/wordle`, `/la-palabra-del-dia`, and `/isaaconnect` using `[game]`.
- `src/lib/components/admin/Game{Calendar,ResultEditor}.svelte`: reusable
  yearly calendar and result editor. The shared `GameBoard` renders accessible colored boards. Result cards use
  two columns on large screens, labeled edit/delete icon buttons, and Wordle
  score/answer summaries below each board.
  The calendar uses the shared `MonthPicker` for four months on desktop, two on tablets, and one on mobile,
  with arrows and native horizontal swipe/scroll snapping. It opens at the
  selected date's month and retains separate year navigation.
- `src/lib/server/games-api.ts`: server-only JWT client for `ratonazul_com_api`;
  exhaustive paginated lists and safe errors. Games actions independently check
  the acting admin before any read/write; layout authorization alone is not enough.
- `src/lib/utils/games.ts`: typed game models, Wordle duplicate-letter scoring,
  Isaaconnect share parser and date calculations. On 2026-11-14, Wordle is
  #1974, La Palabra del Día #1773 and Isaaconnect #856 (#855 on 2026-11-13).
  All puzzle numbers are derived from the selected date on both client and server.
  New result forms default to the authenticated admin; edits retain the record's player.
- `src/routes/api/mediaTracker/`: six current/recent media GET endpoints.
- `src/routes/api/motorsport/`: meetings, drivers, standings, meeting bets,
  user bets, and authenticated combined bet upsert.
- `src/routes/api/users/usernames/`: resolves auth user IDs to display names
  for standings and public meeting picks, using the local database.
- `src/lib/api/base.ts`: server-side external API transport; signs HS256 JWTs
  with a `userId` claim and one-hour expiry. Exports both service clients.
- `src/lib/api/{motorsport,mediaTracker}/`: typed external API wrappers.
- `src/lib/queries/`: browser fetch functions, query keys and query factories.
  Shared cache durations are in `base.ts` (one hour / one day).
- `src/lib/types/`: service DTOs and UI types. Motorsport types are exported;
  several media files currently declare ambient interfaces/enums.
- `src/lib/components/{shared,media,pick-the-grid,admin}/`: reusable UI by domain;
  `admin/AdminBreadcrumbs.svelte` renders the gray admin navigation path and
  `shared/H1WithBreadCrumb.svelte` combines it with a page heading.
- `src/lib/utils/`: date formatting, media transformations, bet drafts,
  driver lookup, and meeting status calculations.
- `src/lib/stores/globalSettings.ts`: Runed PersistedState for theme, menus,
  and CRT preference.
- `src/app.css`: semantic Tailwind color tokens, four themes and local font.
- `static/`: images, flags and fonts.
- `src/lib/server/db/`: PostgreSQL connection and Drizzle schemas.
- `drizzle/`: generated SQL migrations and metadata; `drizzle.config.ts`
  uses `src/lib/server/db/schema.ts` as its schema entry point.

## Authentication and administration

- `src/lib/server/auth.ts` configures Better Auth with the Drizzle PG adapter,
  Google OAuth, email/password, optional `username`, the admin plugin, and
  SvelteKit cookies. The visible login UI currently exposes Google sign-in.
- `src/hooks.server.ts` resolves the session into `event.locals.user/session`
  and delegates auth requests to Better Auth's SvelteKit handler.
- `src/app.d.ts` declares locals; currently uses base Better Auth types.
- `src/lib/auth-client.ts` exports the shared `authClient` and `useSession`
  with the admin plugin and inferred profile fields.
- `shared/LogInUser.svelte` shows the account popup, signs users in and out,
  and supports inline editing of the username and display name.
- `server/db/auth.schema.ts` defines user, session, account, verification,
  including role and ban fields. `schema.ts` re-exports it and contains a
  scaffold `task` table. Root `auth-schema.ts` is another schema artifact;
  the runtime DB imports `src/lib/server/db/schema.ts`.
- `/admin/+layout.server.ts` checks the session and exact `admin` role for the
  complete admin subtree. Signed-in admin users then reach
  `/admin/users/+page.server.ts`, which lists the newest 100 users through
  Better Auth with 20-user pagination. Each row links to
  `/admin/users/[id]`, where an admin can edit display name, username, image URL and role.
  The list and detail pages use Better Auth's `setRole`, `adminUpdateUser`, and
  `removeUser` server endpoints for role changes and account deletion.
  `/admin/+page.server.ts` remains an empty data load because the dashboard
  currently needs no server data.
- Driver/media CRUD and role editing UI are intended future work, not existing
  functionality. Use Better Auth's admin APIs for auth account operations and
  the external APIs for domain data.

## Game behavior

The game selects a meeting from the current season, loads all season drivers for saved picks, filters the driver picker to active drivers,
personal predictions, public meeting predictions, and season standings.
Standard weekends have qualifying winner, qualifying pole time (milliseconds),
and five race positions; sprint weekends add sprint qualifying/race winners.
UI editing opens on Monday of the meeting week and closes at meeting start,
using Europe/Madrid for the Monday opening. `BetComponent.svelte` builds drafts and posts the
combined payload; the server derives the user ID from the authenticated session
and forwards position/time writes concurrently. Points and standings come from
the external service; local helpers only format/display them.
`StandingsTable.svelte` automatically includes the logged-in user when that
user has a standing. Clicking other usernames toggles them into a comparison;
the displayed totals then sum only rounds shared by every selected player.
Selected user IDs are persisted in local storage through Runed's
`PersistedState`, and the logged-in user can also be toggled off. Only saved
players present in the current standings participate in the comparison.
In non-production environments the standings table shows a labeled fixture
when the API returns no standings and meetings are available. When the API
returns standings, including rows seeded into local PostgreSQL, the table shows
those points. The development username endpoint supplies labels for the four
local Motorsport demo player IDs without adding auth accounts.

## Coding conventions and boundaries

- Prefer Svelte 5 runes (`$props`, `$state`, `$derived`, `$effect`, `$bindable`),
  snippets/`{@render}`, and modern event properties such as `onclick`.
- Use TypeScript, `$lib` imports, and generated route `$types` for server/page
  functions and page data. Match nearby formatting; the repository currently
  mixes quotes, indentation and semicolons, with no formatter/linter config.
- Reuse `Body`, `CustomH1/H2/H3`, `DefaultButton`, Bits UI primitives, and
  Phosphor icons. Preserve the monospace, lowercase-label visual style.
- Use existing semantic theme classes (`bg-bg1`, `text-fg0`, `text-purple`, etc.)
  and responsive Tailwind utilities. Dynamic color classes need to be visible
  to Tailwind; the root layout currently includes explicit color class lists.
- Follow [STYLE_GUIDE.md](STYLE_GUIDE.md) when building or editing frontend UI.
  Reuse the documented typography and component styles. When requested styles
  change, update their shared definitions, migrate every relevant use across
  the site, and update the guide in the same change.
- Media sections use `ColoredSectionTitle` with `gap-2` between a title and its
  content and `gap-4` between the current/recent sections. Relative media dates
  come from `src/lib/utils/shared/dates.ts`; `formatExactDate` is used for the
  hover tooltip and strict relative formatting floors elapsed units.
- Keep browser queries separate from external API wrappers. Despite its path,
  `src/lib/api/base.ts` is server-only because it imports private env values.
  Never import those wrappers into browser components or universal load code.
- Keep secrets and DB access on the server. Never print or commit `.env` values.
- Authorize admin reads/writes on the server. A hidden navigation link does not
  protect a route. Derive acting user identity from the session, validate input,
  and keep ownership/deadline/score enforcement in the responsible server/API.
- Reuse query-key factories and invalidate actual affected keys after writes.
- Preserve the user's in-progress changes. Check `git status` before editing;
  the initial investigation found auth/admin/schema/UI changes already present.
- Keep this file current as architecture and admin functionality evolve.

## Commands and environment

Node requirement: `>=22.12.0`; the repo has `pnpm-lock.yaml` and pnpm workspace
configuration. Use the package scripts rather than inventing new tooling.
`nix develop` provides pinned Node.js 22, pnpm 10, Docker Compose, and
PostgreSQL client tools; `.envrc` enables optional direnv activation.
See `DEVELOPMENT.md` for local setup. The shell does not load secrets or run
services/migrations.
Compose pins PostgreSQL 18, binds to `127.0.0.1:1`, and requires
`POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB` matching `DATABASE_URL`.
Drizzle configuration loads `.env` using Node's `loadEnvFile`.

- `pnpm dev`: Vite development server on port 2601.
- `pnpm check`: SvelteKit sync plus Svelte/TypeScript diagnostics.
- `pnpm test:games`: focused Node tests for scoring, parsing and calendar behavior.
- `pnpm build`: production build; `pnpm start`: run `build/index.js`.
- `pnpm preview`: preview build.
- `pnpm db:start`: Docker Compose PostgreSQL (foreground).
- `pnpm db:generate`, `db:migrate`, `db:push`, `db:studio`: Drizzle operations.
- `pnpm auth:schema`: regenerate `src/lib/server/db/auth.schema.ts`.

Environment variable names used by code: `DATABASE_URL`, `ORIGIN`,
`BETTER_AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`,
`MOTORSPORT_API_URL`, `MEDIA_TRACKER_API_URL`,
`PRIVATE_MOTORSPORT_API_JWT_SECRET`, `PRIVATE_MEDIA_TRACKER_API_JWT_SECRET`,
and `PUBLIC_ENVIRONMENT` (`prod` hides query devtools). Compose also uses
`POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`. Static env imports require
the relevant keys during build. Do not run migrations or schema pushes merely
to investigate code; they change database state.

Games additionally use server-only `RATONAZUL_COM_API_URL` (base URL without
`/v1`) and `PRIVATE_RATONAZUL_COM_API_JWT_SECRET` (matching the API's
`JWT_SECRET_KEY`). Wordle forms accept six optional guess fields and a required
answer, then send a compact lowercase `o/i/x` board to match the existing API.
Isaaconnect rows use `B/R/Y/G`; its API stores whole seconds, so pasted
milliseconds are truncated. Calendar counts distinct user IDs, not attempts.
Daily answers are shared: changing one recalculates other full results where
possible, and rejects corrections that would invalidate their guesses or
board-only records. Result and solution writes use separate API requests;
partial failures are reported for review rather than claimed as success.

Focused game utility tests are available through `pnpm test:games`. For code changes, run
`pnpm check` and appropriate build/UI validation, reporting existing failures
separately. Documentation-only changes do not require new tests.

## Known issues observed during initial investigation

These are observations, not instructions to fix unrelated code automatically:

- Baseline `pnpm check` on 2026-10-27 reported 50 errors and 12 warnings
  across 22 files. Categories include `.ts` suffixes on alias imports under
  `rewriteRelativeImportExtensions`, auth custom-field inference, nullable
  values, snippet typing, and Svelte markup/reactivity warnings.
- Admin access is guarded by `src/routes/admin/+layout.server.ts`: signed-out
  visitors are redirected to `/` because there is no login route, while signed-in
  users without the exact `admin` role receive 403. Keep new admin subpages
  beneath this route so they inherit the guard.
- Server locals use base Better Auth types, without inferred custom/plugin fields.
- Current auth schema includes admin role/ban columns, but the initial SQL
  migration lacks them (and session impersonation support is not in the
  current schema). Actual database migration status was not inspected.
- Bet success invalidates `['bets', meetingId]`, which does not match the
  position/time/meeting bet query keys. The two external writes are not atomic.
- The bet proxy checks authentication but does not locally validate payloads
  or deadlines; external enforcement cannot be verified from this repository.
- Several media API wrapper return types describe a single item whereas their
  browser queries consume arrays.
- Game prefetch uses relative global fetch in a universal load and awaits each
  call inside `Promise.all`; SSR compatibility and intended parallelism need
  review if that loading path is changed.
- README is mostly the original Svelte scaffold and is not an architecture guide.

La Palabra del Día also offers a shared-result input method. `parseSpanishWordle`
validates the header, score and emoji board (including X/6 failures), and both
preview and save enforce the selected date's puzzle number. Shared results use
`is_simple: true` and `words: []`, without creating or changing daily solutions.
Existing Spanish board-only records reopen in share mode. Selected-date headings
include the derived puzzle number for all three games.

Both Wordle games also accept a board-only result through a color-toggle grid.
An optional answer is saved as the shared daily solution; changing an existing
answer follows the same safeguards and recalculation rules as word entry.

## Notifications

`/admin/notifications` publishes site-wide or group alerts from an admin-only
action. Admins manage group membership from the user editor. Calendar and
admin audiences also require their corresponding access permissions.
The Games and Calendar API stores alerts. Website PostgreSQL stores the
opt-in, bulk read position, individual reads and browser subscriptions as
account data. The bell and
profile share a session-scoped query to `/api/notifications`. Theme and CRT
settings keep using the existing browser preferences. See DEVELOPMENT.md
for the migrations, Pick the Grid scheduler, and optional VAPID configuration.
