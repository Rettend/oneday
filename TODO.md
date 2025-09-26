# TODO

## Navigation and pages

- Navbar
  - Desktop: left side vertical, icons + text labels
  - Medium: left side slim, icons only
  - Mobile: bottom tab bar, icons only; up to 5 primary icons + a “More” icon that opens an upward dropdown with the rest
  - Active state: highlight + indicator; tooltips on hover
  - Overflow: prioritize Today, Questboard, Achievements, Activity, Settings; overflow goes under “More”

- Today
  - Header: “Generate quests” button, date, XP/level pill
  - Left: Today’s Dailies (checklist), high/low-level Todos (outline: Today, Week, Month, Backlog)
  - Right: Live Activity timeline (categorized sessions), quick stats (time by project/category), leisure budget meters
  - Footer: Upcoming deadlines chips (Hardline/Softline)
- Questboard
  - Tabs: Day • Week • Month • Season
  - Questlines per goal (cards) with: Title, Tier (I–V), Rarity badge, XP, deadline chips, acceptance criteria, evidence progress bar, Complete button
  - Suggested (LLM) quests section with Accept/Reject
  - Filters: goal, project, horizon, difficulty, status
- Achievements
  - Badges grid with icons (Iconify: ph set), rarity color, tier progress (I, II, III, IV…)
  - Sections: Recent, In progress (multi-tier), Locked, Completed
  - “Generate custom achievements” (LLM), Accept/Reject
  - Detail drawer: description, how to earn, progress, XP reward
- Todo Lists (High ↔ Low)
  - Split view: Goals/epics (left), subtasks (right)
  - Bulk edit, promote to Quest, add Hardline/Softline, tags
  - Outline mode (indent/outdent), drag to reorder
- Activity Log
  - Timeline of sessions (process + window title + URL if browser)
  - Category/project chips, search/filter, merge/split sessions
  - Lots of stats and charts
  - “Create rule from selection” and “Auto-suggest rules” (LLM) with preview
- Rules & Categories
  - Regex rules list with test console against sample activity
  - Category manager (colors, emoji/icon)
  - LLM-suggested rules queue (Approve/Discard)
- Deadlines
  - Calendar/roadmap view (by Week/Month)
  - Hardline = red chip; Softline = blue chip
  - Drag to move Softline; Hardline fixed (confirm dialog to change)
  - Quest/Todo deadline overlays
- Settings
  - Tracking: run-in-background toggle, startup, idle threshold
  - Browser extension token + status
  - Notifications + desktop widget toggle
  - XP/Levels/Achievements tuning (show formulas, adjustable)
  - Data export/import, theme light/dark
  - Global LLM Provider/Model: header button opens a modal-like dropdown with two selects (Provider, then Model); persists selection; applied app-wide

## System highlights

- Background tracking: logs active window titles (VS Code shows project/file), idle detection
- Browser extension (tiny): sends active tab URL/title to localhost
- Categorization:
  - Rule-first (regex) with quick-create from Activity Log
  - LLM proposes new rules for uncategorized activity; review before apply
- Deadlines: Hardline (non-negotiable) and Softline (preferred) surfaced on Today, Questboard, Deadlines
- Notifications + widget:
  - Desktop toasts: near deadline, over leisure budget, quest completion
  - Optional desktop widget: Today’s quests + live progress + budgets

## Game systems

- Levels: linear or slightly increasing (default: XP_to_next = 100 + 20 × level)
- XP sources: completing quests, streaks, achievements
- Achievements (quadratic rewards): XP = base × tier² (default base = 50)
- Tiers: I, II, III, IV, V (roman numerals displayed on quest/achievement badges)
- Rarities and colors (badge + glow):
  - Iron (gray), Bronze (brown), Silver (silver), Gold (gold), Platinum (darkish cyan), Emerald (green), Diamond (blue dark purple), Rhodal (darker red-pink) Nummite (black with blue flecks), Spessar (redish dark orange)
- Icons: Iconify (ph- set, duotone), for:
  - Quests, Achievements, and lots in the UI

## Milestones

- M0 — Foundations
  - [ ] App shell + nav (Today, Questboard, Achievements, Activity, Rules, Deadlines, Settings)
  - [ ] Run-in-background + autostart, idle detection
  - [ ] Browser extension handshake + token
- M1 — Activity + Categorization
  - [ ] Live Activity timeline (process/title/url)
  - [ ] Manual category assignment; bulk edit
  - [ ] Regex rules UI with test preview
  - [ ] LLM: suggest rules for uncategorized items (approve/deny)
- M2 — Todos + Deadlines
  - [ ] High/low-level Todo Lists (outline + split view)
  - [ ] Hardline/Softline date chips + calendar view
  - [ ] Promote todo → quest
- M3 — Quests (core)
  - [ ] Questboard (Day/Week/Month/Season tabs)
  - [ ] Quest card layout: title, tier, rarity, XP, deadlines, acceptance criteria, progress, Complete
  - [ ] LLM: generate custom quests from goals + history (Accept/Reject)
- M4 — XP & Levels
  - [ ] Level pill in header; XP gains on completion
  - [ ] Level-up animation; history of XP events
  - [ ] Settings to tweak level curve (linear/slightly increasing)
- M5 — Achievements (awesome page)
  - [ ] Badges grid with rarity colors + tier stacks
  - [ ] Achievement details drawer with icon, description, progress, quadratic XP reward
  - [ ] LLM: propose custom achievements from patterns (Accept/Reject)
- M6 — Notifications + Widget
  - [ ] Desktop notifications: deadlines, caps, quest completion
  - [ ] Minimal desktop widget: Today’s quests, progress, budgets
- M7 — Polish and Launch
  - [ ] Filters/search everywhere
  - [ ] Bulk actions (multi-select in Todos/Quests)
  - [ ] Empty states, animations, confetti for wins
  - [ ] Export screenshots (Today, Questboard, Achievements)

## Acceptance criteria per page (UI-level)

- Today: can add/check todos, accept LLM quests, see timeline + budgets, see upcoming deadlines
- Questboard: filterable list, horizon tabs, clear criteria + progress, complete quests, see XP
- Achievements: view by rarity/tier, see locked/progress/completed, claim rewards, LLM suggestions
- Activity Log: edit categories, create rules, trigger LLM suggestions with preview
- Rules: test regexes, reorder priorities, approve LLM-generated rules
- Deadlines: calendar with hard/soft chips, drag softlines, see quest/todo overlays
- Settings: toggle tracking, connect extension, tune XP curves, export

## LLM touchpoints (UI)

- “Generate quests” on Today/Questboard
- “Generate custom achievements” on Achievements
- “Suggest rules” on Activity Log/Rules (with diff preview)
- Small inline justifications (“why this quest/achievement/rule?”) for trust

## Backlog (later)

- Seasonal report page (monthly recap)
- Shareable images of Achievements/Questboard
- Quick Add global shortcut
- Per-project views and color themes
- What kind of widget can we create?
