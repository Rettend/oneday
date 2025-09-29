# Oneday

## IMPORTANT

- Do NOT fix linter warnings/errors manually — they’re autofixed later. Ignore style/order/console rules.
- Shell is Windows cmd.exe. Avoid Unix-only commands.
- No backwards-compat concerns; prefer the best implementation over non-breaking changes.
- Do NOT run dev/build/test/lint scripts yourself.

## Architecture

- SolidStart app with SSR disabled (`app.config.ts: ssr: false`). Client-only UX.
- State: store providers in `src/stores` (like `UIStoreProvider`), and a root `RootStoreProvider` to combine them.
- UI: solid-ui - headless Kobalte primitives wrapped with shadcn-like variants.
  - Example: `components/ui/button.tsx`
- Styling: UnoCSS (`uno.config.ts`) with Iconify (ph icon set). Use utility classes instead of CSS.
- Routing: `src/app.tsx` composes `AppNavbar` + page container. Pages under `src/routes` use file-based routing.
- The app will be a desktop app via Tauri.

## Database + Data Fetching

- Client‑side SQLite via Drizzle ORM + sqlocal (libsql in WASM OPFS).
  - Schema: `src/server/db/schema.ts` (snake_case).
  - Server functions: use `query` and `action` from `@solidjs/router` in server files under `src/server/remote/**`, validate input with zod v4 via `parse()` from `src/utils`.
- Migrations: generated with Drizzle, compiled into `drizzle/migrations/migrations.json` by `scripts/compile-migrations.ts` (run automatically in `prebuild`). Client `db.connect()` applies pending migrations at runtime in the browser or Tauri app.
- Dev sync: writes (INSERT/UPDATE/DELETE) are mirrored to a local libsql DB to inspect with Drizzle Studio, on app startup the whole DB from OPFS is copied to local file.
- Use queries with `createAsync` and actions with `useAction`

## Environment & Config

- Env schema validated with zod v4 in `src/env/schema.ts`.
  - Server ex.: `TURSO_DB_URL` (for Drizzle Kit).
  - Client ex.: `VITE_DB_FILE` (sqlocal file path).
- Access via `clientEnv`/`serverEnv`.

## Conventions and Patterns

- How to fix *eslint solid/reactivity: The reactive variable 'props.x' should be used within JSX, a tracked scope (like createEffect), or inside an event handler function, or else changes will be ignored.*
  - If you want the signal to be reactive, use `createMemo`
  - If you also want to mutate the signal, use `createWritableMemo`
  - Otherwise just wrap in `untrack`
- UI components should expose polymorphic props and accept `class` for composition. Use `cn()` from `src/utils` for class merging and `cva` for variants.
- IDs: use `uuidV7Base58()` from `src/utils`. Validate with `idSchema`.
- Keep casing snake_case at the DB layer.
- Prefer creating reusable components over hardcoding things in pages, always identify patterns and extract them.
- Pretty much never use `createEffect`.
