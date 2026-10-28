# Repository guide

## Scope and architecture

This is ratonazul's personal website: Svelte 5, SvelteKit 2, strict TypeScript,
Tailwind CSS 4, and Vite. Production uses `@sveltejs/adapter-node`.
The repository owns the website, Better Auth accounts/sessions, and a SvelteKit
gateway to two separate services. Motorsport and media domain databases and
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
- `src/lib/auth-client.ts` exports an `authClient` with `adminClient()`, a
  sign-out helper, and `useSession` from a second, unconfigured client.
- `shared/LogInUser.svelte` owns sign-in/out and username editing/prompting.
- `server/db/auth.schema.ts` defines user, session, account, verification,
  including role and ban fields. `schema.ts` re-exports it and contains a
  scaffold `task` table. Root `auth-schema.ts` is another schema artifact;
  the runtime DB imports `src/lib/server/db/schema.ts`.
- `/admin/+layout.server.ts` checks the session and exact `admin` role for the
  complete admin subtree. Signed-in admin users then reach
  `/admin/users/+page.server.ts`, which lists the newest 100 users through
  Better Auth with 20-user pagination. Each row links to
  `/admin/users/[id]`, where an admin can edit username, image URL and role.
  The list and detail pages use Better Auth's `setRole`, `adminUpdateUser`, and
  `removeUser` server endpoints for role changes and account deletion.
  `/admin/+page.server.ts` remains an empty data load because the dashboard
  currently needs no server data.
- Driver/media CRUD and role editing UI are intended future work, not existing
  functionality. Use Better Auth's admin APIs for auth account operations and
  the external APIs for domain data.

## Game behavior

The game selects a meeting from the current season, loads active drivers,
personal predictions, public meeting predictions, and season standings.
Standard weekends have qualifying winner, qualifying pole time (milliseconds),
and five race positions; sprint weekends add sprint qualifying/race winners.
UI editing opens on Monday of the meeting week and closes at meeting start,
using browser-local dates. `BetComponent.svelte` builds drafts and posts the
combined payload; the server derives the user ID from the authenticated session
and forwards position/time writes concurrently. Points and standings come from
the external service; local helpers only format/display them.
`StandingsTable.svelte` automatically includes the logged-in user when that
user has a standing. Clicking other usernames toggles them into a comparison;
the displayed totals then sum only rounds shared by every selected player.
Selected user IDs are persisted in local storage through Runed's
`PersistedState`, and the logged-in user can also be toggled off.
In non-production environments it also adds deterministic fixture points with
5–7 missing meetings per player plus sample players, marked in the UI as a
development fixture, so this comparison can be exercised without mutating
external data.

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
- Shared visual primitives in `src/app.css` include `surface-card`,
  `surface-card-hover`, `section-label`, `internal-link`, `external-link`, and
  `data-table`; use these for new surfaces, links, section labels and tables.
- Media sections use `MediaColoredTitle` with `gap-2` between a title and its
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

- `pnpm dev`: Vite development server on port 2601.
- `pnpm check`: SvelteKit sync plus Svelte/TypeScript diagnostics.
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

No automated test suite or test script was found. For code changes, run
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
- The exported `useSession` comes from a client without the admin plugin;
  username inference is also missing. Existing role/username accesses have
  typing gaps; locals do not include inferred custom/plugin user fields.
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
