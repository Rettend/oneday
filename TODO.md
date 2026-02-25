# TODO

## Phase 0 — Cleanup (remove gamification)

- [x] Delete achievement components (`AchievementCard.tsx`, `AchievementsSummaryRow.tsx`)
- [x] Delete gamification components (`LevelPill.tsx`, `DeadlineChip.tsx`)
- [x] Delete all `/q` routes (`today.tsx`, `questboard.tsx`, `activity.tsx`, `deadlines.tsx`, `rules.tsx`, `settings.tsx`, `achievements/*`)
- [x] Delete `/q/index.tsx` layout
- [x] Delete `QuestSidebar` from `AppNavbar.tsx`
- [x] Remove `LevelPill` import and usage from the navbar
- [x] Remove the dual-sidebar `Switch` logic in `AppNavbar` (no more `/c` vs `/q` detection)
- [x] Delete the `components/today/` folder
- [x] Delete the `components/achievements/` folder
- [x] Delete the `components/todo/` folder
- [x] Clean up any orphaned imports across the codebase after deletions

## Phase 0.5 — Testing infrastructure

### Component tests (bun:test + happy-dom + @solidjs/testing-library)

- [x] Install dev dependencies: `@solidjs/testing-library`, `@happy-dom/global-registrator`, `@testing-library/jest-dom`, `@types/bun`
- [x] Create `bunfig.toml` with test preload config and JSX rules
- [x] Create `test/setup.ts` with happy-dom registration and global mocks (ResizeObserver, matchMedia)
- [x] Verify SolidJS JSX compilation works in bun:test (uses `react-jsx` via test tsconfig)
- [x] Write a test for an existing component (e.g. `Button`) to validate the setup
- [x] Add `test` and `test:watch` scripts to `package.json` (`--conditions=browser`)

### E2E tests (Playwright)

- [ ] Install Playwright: `bun add -d @playwright/test`
- [ ] Create `playwright.config.ts` with webServer config pointing to the dev server
- [ ] Write a smoke test (page loads, login page renders)
- [ ] E2E tests for flows that can't be component-tested (auth, WebSocket chat, navigation)

### Testing approach

- [ ] Component tests for all UI components and pages (fast, run in bun:test)
- [ ] E2E tests only for what we can't test with bun:test and absolutely requires a real browser (auth flows, streaming, navigation)
- [ ] Build features with test coverage — minimize manual clicking

## Phase 1 — Restructure navigation and routes

- [x] Flatten route structure: move `/c/[id].tsx` → `/chat/[id].tsx`, `/c/settings.tsx` → `/settings.tsx`
- [x] Remove the old `/c` prefix route group
- [x] Create new routes: `/dashboard`, `/activity`, `/settings`, `/chat/[id]`
- [x] Make `/dashboard` the default authenticated landing page (redirect from `/` after login)
- [x] Unify the sidebar into one component (based on current `ChatSidebar` design)
  - Top section: nav items (Dashboard, Activity, Settings)
  - Middle section: Projects (chat project folders)
  - Bottom section: History (recent conversations)
  - Footer: settings gear
- [x] Remove the `SidebarShell` dual-mode and `AppNavbar` switch — just one sidebar always
- [x] Update `app.tsx` to use the unified sidebar for all authenticated routes
- [x] Update the home page (`/`) to show login when unauthenticated, redirect to `/dashboard` when authenticated
- [x] Add floating `LLMInput` (with `position="overlay"`) to the app shell so it appears on every page
- [x] Wire the floating input to open/create a "daily" conversation or the most recent chat
- [x] Update `router.ts` and typed routes after route changes

## Phase 2 — Tauri desktop shell

### Initial setup

- [ ] Initialize Tauri v2 in the project (`src-tauri/` directory)
- [ ] Configure Tauri to use SolidStart's dev server URL during development
- [ ] Configure Tauri to use the built SPA output for production builds
- [ ] Set up the `tauri dev` and `tauri build` npm scripts
- [ ] Add the required Tauri plugins to `src-tauri/Cargo.toml`:
  - `tauri-plugin-notification` for desktop notifications
  - `x-win` for active window polling
- [ ] Configure Tauri capabilities/permissions for notifications and system access

### System tray

- [ ] Create a system tray icon with the Oneday sun icon
- [ ] Add tray menu items: Show/Hide window, Status (shows contract status), Quit
- [ ] Configure the app to minimize to tray on window close instead of quitting
- [ ] Configure autostart on system boot (optional, user-configurable)

### Window polling service

- [ ] Create a Rust background task that polls `x_win::get_active_window()` every 5 seconds
- [ ] Collect: timestamp, process name, window title
- [ ] Also call `x_win::get_browser_url()` when the active app is a browser
- [ ] Buffer entries in-memory (Vec), sync to remote DB every 60 seconds (not every poll — reduces writes from ~17k to ~1,440/day)
- [ ] Handle offline gracefully: keep buffering, retry on reconnect
- [ ] Expose a Tauri command so the frontend can query the current active window (for live activity display)
- [ ] Add idle detection: if the same window/title persists for X minutes with no input, mark as idle

## Phase 3 — Database schema for activity and contracts

### Activity tables

- [x] Add `activity_logs` table: `id`, `userId`, `timestamp`, `appName`, `windowTitle`, `browserUrl` (nullable), `category` (nullable), `isIdle` (boolean)
- [x] Add `category_rules` table: `id`, `userId`, `pattern` (regex or contains), `matchField` (app_name | window_title | browser_url), `category`, `priority` (integer), `createdAt`
- [x] Add indexes on `activity_logs` for `userId + timestamp` range queries

### Contract tables

- [x] Add `contracts` table: `id`, `userId`, `date` (unique per user per day), `status` (draft | active | complete), `createdAt`, `updatedAt`
- [x] Add `contract_blocks` table: `id`, `contractId`, `label` (e.g. "Math study"), `category`, `targetMinutes`, `completedMinutes`, `order`, `createdAt`
- [x] Add `goals` table: `id`, `userId`, `name` (e.g. "Math exam"), `type` (countdown | counter | tracker), `metadata` (JSON — target date, current/total counts, etc.), `createdAt`, `updatedAt`

### Server functions

- [x] `ingestActivity` action — receives batched activity entries from Tauri, writes to `activity_logs`
- [x] `getActivityDay` query — returns today's activity summary (grouped by category, total time per category)
- [x] `getActivityWeek` query — returns this week's daily summaries
- [x] `getTodayContract` query — returns today's contract with blocks
- [x] `upsertContract` action — creates or updates today's contract (used by LLM tools)
- [x] `updateContractBlock` action — updates a block's `completedMinutes`
- [x] `listGoals` query — returns all active goals for the user
- [x] `updateGoal` action — updates a goal's metadata (used by LLM tools)
- [x] `listCategoryRules` query — returns categorization rules
- [x] `createCategoryRule` action — creates a new categorization rule

## Phase 4 — Activity page

- [x] Build the Activity page UI at `/activity`
- [x] Timeline view: chronological list of activity sessions, grouped by contiguous app usage
- [x] Show app name, window title, browser URL (if any), duration, category chip
- [x] Allow manual category assignment (click category chip → dropdown)
- [x] Quick stats section: time by category today (bar chart or simple bars)
- [x] Date picker to view past days
- [x] "Create rule from selection" — select an activity entry, create a regex rule from its title/app

## Phase 5 — Dashboard page

- [x] Build the Dashboard page UI at `/dashboard`
- [x] **Status light**: large, prominent red/green indicator at the top
  - Red: shows remaining time per block ("1.5h math left, 0.5h freelance left")
  - Green: celebration state with a satisfying visual
- [x] **Today's contract card**: checklist of blocks with progress bars
  - Each block shows: label, target time, completed time (auto-calculated from activity logs matching the block's category)
  - Checkbox or visual completion state
- [x] **Goal trackers card**: show each goal from the `goals` table
  - Countdown type: days remaining, progress bar
  - Counter type: current / total (e.g. definitions 31/160)
  - Updated by the LLM via chat tools
- [x] **This week card**: 7-day row showing each day's status
  - 🟢/🔴 dot, label (study day / free day), and hours summary
- [x] **Live activity indicator**: small card showing current window/app from Tauri
- [x] Responsive layout: single column on mobile, two columns on desktop

## Phase 6 — Chat improvements

### LLM tools (function calling)

- [x] Define tools the LLM can call during conversation:
  - `create_contract` — create today's contract with blocks
  - `update_contract` — modify blocks on the current contract
  - `complete_block` — mark a contract block as done
  - `update_goal` — update a goal's counters (e.g. "covered definitions 31-45" → updates count)
  - `create_goal` — set up a new goal tracker
  - `get_activity_summary` — fetch today's or a date range's activity breakdown
  - `get_contract_status` — fetch the current contract and completion state
  - `create_rule` — add a categorization rule
- [x] Register tools with the ChatAgent's `streamText` call
- [x] Render tool results in the chat UI (show contract cards, activity summaries inline)

### System context injection

- [x] Before each chat message, inject system context:
  - Today's contract status (blocks + completion)
  - Today's activity summary (hours per category)
  - Active goals and their current state
  - Day of week, any upcoming deadlines
- [x] Make system context refresh periodically (not just on page load)

### Model selection

- [x] Wire the model picker button in `LLMInput` to a real dropdown/modal
- [x] Fetch available providers and models from `@rttnd/llm` registry (`llm.rettend.me`)
- [x] Store user's API keys per provider (already have BYOK encryption + `api_keys` table)
- [x] Pass selected provider + model to the ChatAgent (replace hardcoded Llama 2 7B)
- [x] ChatAgent resolves the user's API key for the selected provider from Turso
- [x] Allow per-conversation model selection (stored in `conversations.modelId` / `modelProviderId`)
- [x] Store default model preference in user settings
- [x] Show model name in chat header/input area

### Conversation management

- [x] Implement "New chat" button in sidebar (create conversation in Turso, navigate to `/chat/[id]`)
- [x] Implement conversation list in sidebar History section (fetch from Turso)
- [x] Implement conversation deletion
- [x] Auto-generate conversation titles (first user prompt heuristic)
- [x] Implement the "daily contract" special conversation (auto-created each morning, pinned)

## Phase 7 — Nudges (desktop notifications)

- [ ] Implement nudge logic in Tauri's Rust backend:
  - While a contract block is active (current time within a scheduled block)
  - If the activity logger detects 10+ minutes in a non-matching category
  - Send one desktop notification via `tauri-plugin-notification`
  - Don't repeat the nudge for the same off-track period (one nudge per drift)
- [ ] Notification content: block name, time done, time remaining, current app, how long off-track
- [ ] Add a user setting to enable/disable nudges
- [ ] Add a user setting for the drift threshold (default: 10 minutes)

## Phase 8 — Settings page

- [ ] Build Settings page at `/settings`
- [ ] **BYOK section**: API key inputs per provider (already exists in `/c/settings`, move it here)
- [ ] **Model preferences**: default model picker
- [ ] **Tracking section**: enable/disable background tracking toggle
- [ ] **Notifications section**: enable/disable nudges, drift threshold slider
- [ ] **Categorization rules section**: list rules, add/edit/delete, test against sample activity
- [ ] **Goals section**: list active goals, create new, edit, archive
- [ ] **Account section**: connected OAuth providers, sign out
- [ ] **Data section**: future — export activity data

## Phase 9 — Polish

- [ ] Transition animations between pages
- [ ] Status light celebration animation when contract completes (confetti? glow? satisfying pulse?)
- [ ] Empty states for all pages (no activity yet, no contract today, no goals)
- [ ] Loading states and skeletons
- [ ] Error handling and retry UI for API calls
- [ ] Keyboard shortcuts (Cmd/Ctrl+K for chat, etc.)
- [ ] Dark/light theme toggle (currently dark only?)
- [ ] Mobile-responsive layouts (even though desktop-first, the web version should work on phone browsers)
- [ ] Weekly review: auto-generate on Sunday, show as a special chat message or dashboard card
