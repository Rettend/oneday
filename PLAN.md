# PLAN

Oneday is a personal productivity app that tracks what you actually do on your computer, helps you make a daily contract with an LLM, and shows you one thing: are you done for the day or not.

## Stack

- **Frontend**: SolidStart (SPA mode, `ssr: false`) + UnoCSS + Kobalte
- **Desktop shell**: Tauri v2 wrapping the SolidStart app in a webview
  - Activity tracking via the `x-win` Rust crate (polls active window title + process every 5s)
  - System tray (runs in background, always on)
  - Desktop notifications via `tauri-plugin-notification` (for nudges)
- **Backend**: Cloudflare Workers
  - Chat agent: Durable Object (`@rttnd/agents` + Vercel AI SDK) for LLM streaming
  - API worker: handles auth, data reads/writes
- **DB**: Turso (LibSQL) via Drizzle ORM — remote only, no local SQLite
  - Activity logs batched and synced every 60s (reduces writes to ~1,440/day)
  - Same DB for mobile later — no replication needed
  - If offline, Tauri buffers in-memory indefinitely and flushes on reconnect
- **Auth**: Gau (OAuth: Google, GitHub, Discord)
- **LLM**: BYOK (Bring Your Own Keys), multiple providers via Vercel AI SDK, model registry via `@rttnd/llm`

## Architecture decisions

- **No local database.** Everything lives in Turso. This means the mobile app (later) gets instant access to all data without sync logic. Activity logs are small enough that remote-only is fine.
- **Tauri is the same app, not separate.** It wraps the SolidStart SPA. The Rust backend only handles: window polling, system tray, and notifications. Everything else goes through the existing Cloudflare API.
- **One sidebar, one layout.** No more dual sidebar (/c chat vs /q quest). Single chat-style sidebar on every page. Floating LLM chatbox at the bottom of every page.
- **Testing approach.** Fast component testing via `bun:test` + `happy-dom` for robust UI base. Playwright for E2E user flows. Full test coverage instead of manual clicking.

## The activity logger

Background process in Tauri's Rust backend, always running.

- Poll active window every 5 seconds using `x-win` crate: `(timestamp, app_name, window_title)`
- Also grab browser URL when applicable via `x-win::get_browser_url()`
- Buffer entries in memory locally.
- Classify into categories: `study | project | freelance | entertainment | other`
- Simple rule-based classification to start (window title contains "youtube" → entertainment, VS Code with project repo name → project, etc.)
- POST batches to Cloudflare Worker API every 60 seconds, which writes to Turso. Reduces DB writes drastically.
- This is the source of truth. It never lies.

## The daily contract

Each morning (and/or night before), you open the chat. The LLM has context:

- Your recurring obligations (math study 2h on days X and Y, school/personal projects)
- Your leisure goals (anime, gaming, YouTube)
- Today's calendar (classes, commute)
- Yesterday's actual activity breakdown
- Exam countdown + trajectory data

It proposes a contract for the day. Something like:

```txt
TODAY (Wednesday) — math class tomorrow
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
□ Math study: 2h (definitions 31-45, review proof 7)
□ Freelance: 1.5h
□ School project: 1h

After contract: FREE
  - Project coding, anime, gaming, whatever

Schedule suggestion:
  10:00-12:00  Math (get it done first)
  12:00-13:00  Lunch + break
  13:00-14:30  Freelance
  14:30-15:30  School project
  15:30→       Free ✓
```

You confirm, adjust, or negotiate. Once confirmed, it's the contract.
We create custom tools for the LLM to view/edit all this.

**Key rules:**

- Study blocks go first in the day when possible. Front-loading the aversive task means the rest of the day is guilt-free.
- Free time is explicitly in the plan. It's not leftover time, it's earned time. The app should visually celebrate when you enter it.
- The plan is allowed to have zero study hours on non-study days. On those days, the status light is green from the moment you wake up.

## The status light

This is the single most important element in the UI. Always visible. Two states:

🔴 **Contract incomplete** — shows what's remaining ("1.5h math left")

🟢 **Contract complete** — "You're free. Go build something."

That's it. That's the core of the whole app. Everything else supports this.

## Nudges

When you're in a contract block (say, 10:00-12:00 math) and the activity logger sees you've been in a non-study app for more than 10 minutes:

**One desktop notification.** Calm. Factual.

> "Math block: 43 min done, 1h 17min left. Currently: Twitter (12 min). Switch back?"

If you switch back, great. If you don't, it doesn't escalate further in the moment. But the time doesn't count toward your 2 hours. The activity log is honest.

## Navigation and layout

**Single sidebar** (chat-style, unified for all pages):

```txt
☀️ Oneday                  ← logo, links home

📊 Dashboard               ← /dashboard
📈 Activity                ← /activity
⚙️ Settings                ← /settings

── Projects ──
  ✨ Oneday OS              ← chat project folders
  💼 Client work
  🏠 Life admin

── History ──
  Daily standup planning    ← recent chats
  Deep focus protocol
```

**Floating LLM chatbox** at the bottom of every page (already built: `LLMInput` with `position="overlay"`). Quick messages and daily contract negotiation happen here without leaving the page.

**Full chat view** at `/chat/[id]` for longer conversations. Clicking a history item in the sidebar opens it.

## The dashboard

The landing page. Shows everything at a glance:

- **Status light** (the big one — red/green, always at the top)
- **Today's contract** (checklist of blocks with progress)
- **Goal trackers** (exam countdown, definitions covered, proofs reviewed — LLM-managed counters)
- **This week** (day-by-day status: 🟢/🔴 + hours summary)
- **Live activity** (current session info from the tracker)

## The chat

Already partially built. Changes needed:

- Feed it the daily contract and current status as system context
- Feed it today's activity summary (updated periodically)
- Feed it the dashboard/goal data
- Give it tools to create/modify contracts, update goal counters, create categorization rules
- Multiple LLM backends — different models, user picks per-conversation

The chat is where the morning planning happens, where you vent, where you get nudged, and where the weekly review happens.

## Weekly review

Every Sunday (or whenever), the LLM generates a summary from the activity data:

```txt
WEEK 3 REVIEW
━━━━━━━━━━━━━━━━━━━━━━━
Planned study sessions:  4
Completed:               2 (50%)
Study hours:             3.2
Project coding:          18.4
Entertainment:           11.7
Definitions learned:     31 / 160
Proofs reviewed:         5 / 30

vs. last week:           +1.8h study, +12 definitions
Trajectory:              BEHIND (need ~6/week, doing ~3)
━━━━━━━━━━━━━━━━━━━━━━━
```

Then it asks what happened on the days you missed. The activity log is right there — you can't lie to yourself.

## Later (not V1)

- Tauri mobile app (view-only: see today's plan, chat with LLM, no activity tracking)
- Browser extension for richer URL/tab tracking
- LLM-suggested categorization rules
- Calendar integration
- Weekly/monthly report exports
