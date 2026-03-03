import type { RuleMatchField } from '~/lib/productivity'
import { Protected } from '@rttnd/gau/client/solid'
import { createAsync, revalidate, useAction } from '@solidjs/router'
import { createEffect, createMemo, createSignal, For, onCleanup, Show } from 'solid-js'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { CATEGORY_OPTIONS, formatMinutes, getTodayDateIso, RULE_MATCH_FIELDS } from '~/lib/productivity'
import { createCategoryRule, getActivityDay, listCategoryRules, updateActivityCategory } from '~/server/remote/productivity'

const ACTIVITY_REFRESH_MS = 15_000

type ActivitySession = Awaited<ReturnType<typeof getActivityDay>>['sessions'][number]

interface RuleDraft {
  sessionId: string
  pattern: string
  matchField: RuleMatchField
  category: string
  priority: number
}

function ActivityPage() {
  const [selectedDate, setSelectedDate] = createSignal(getTodayDateIso())
  const activity = createAsync(() => getActivityDay(selectedDate()))
  const rules = createAsync(() => listCategoryRules())
  const applyCategory = useAction(updateActivityCategory)
  const createRule = useAction(createCategoryRule)

  const [refreshingActivity, setRefreshingActivity] = createSignal(false)
  const [updatingSessionId, setUpdatingSessionId] = createSignal<string | null>(null)
  const [creatingRule, setCreatingRule] = createSignal(false)
  const [ruleDraft, setRuleDraft] = createSignal<RuleDraft | null>(null)

  const currentActivity = createMemo(() => {
    const data = activity.latest
    if (!data || data.date !== selectedDate())
      return undefined
    return data
  })

  const rulesData = createMemo(() => rules.latest)

  async function refetchActivity() {
    setRefreshingActivity(true)

    try {
      await revalidate(getActivityDay.keyFor(selectedDate()))
    }
    finally {
      setRefreshingActivity(false)
    }
  }

  async function refetchRules() {
    await revalidate(listCategoryRules.key)
  }

  const maxCategoryMinutes = createMemo(() => {
    const values = currentActivity()?.byCategory ?? []
    if (!values.length)
      return 1

    return Math.max(...values.map(item => item.minutes), 1)
  })

  createEffect(() => {
    if (typeof window === 'undefined')
      return

    if (selectedDate() !== getTodayDateIso())
      return

    const interval = window.setInterval(() => {
      void refetchActivity()
    }, ACTIVITY_REFRESH_MS)

    onCleanup(() => {
      window.clearInterval(interval)
    })
  })

  async function handleAssignCategory(session: ActivitySession, category: string) {
    setUpdatingSessionId(session.id)

    try {
      await applyCategory({
        logIds: session.logIds,
        category: category === 'uncategorized' ? null : category,
      })
      await refetchActivity()
    }
    finally {
      setUpdatingSessionId(null)
    }
  }

  function openRuleDraft(session: ActivitySession) {
    const titlePattern = session.windowTitle.trim()
    const appPattern = session.appName.trim()

    setRuleDraft({
      sessionId: session.id,
      pattern: titlePattern.length >= 3 ? titlePattern : appPattern,
      matchField: titlePattern.length >= 3 ? 'window_title' : 'app_name',
      category: session.category ?? 'other',
      priority: 0,
    })
  }

  async function saveRule() {
    const draft = ruleDraft()
    if (!draft)
      return

    setCreatingRule(true)
    try {
      await createRule({
        pattern: draft.pattern,
        matchField: draft.matchField,
        category: draft.category,
        priority: draft.priority,
      })

      setRuleDraft(null)
      await Promise.all([
        refetchRules(),
        refetchActivity(),
      ])
    }
    finally {
      setCreatingRule(false)
    }
  }

  return (
    <section class="flex flex-col gap-6">
      <header class="space-y-2">
        <div class="flex flex-wrap gap-3 items-center justify-between">
          <div>
            <h1 class="text-3xl tracking-tight font-semibold">Activity</h1>
            <p class="text-sm text-muted-foreground">
              Timeline and category breakdown for what you actually did.
            </p>
          </div>
          <div class="flex flex-wrap gap-2 items-center">
            <label class="text-xs text-muted-foreground flex gap-2 items-center">
              Date
              <input
                type="date"
                value={selectedDate()}
                class="text-sm px-3 py-1.5 border border-border/70 rounded-full bg-background"
                onInput={event => setSelectedDate(event.currentTarget.value || getTodayDateIso())}
              />
            </label>

            <button
              type="button"
              class="text-xs px-3 py-1.5 border border-border/70 rounded-full transition-colors hover:bg-muted/50"
              disabled={refreshingActivity()}
              onClick={() => {
                void refetchActivity()
              }}
            >
              {refreshingActivity() ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
      </header>

      <div class="gap-4 grid lg:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
            <CardDescription>
              Contiguous sessions grouped by app/window.
            </CardDescription>
          </CardHeader>
          <CardContent class="space-y-3">
            <Show
              when={(currentActivity()?.sessions.length ?? 0) > 0}
              fallback={(
                <p class="text-sm text-muted-foreground">
                  {currentActivity() ? 'No activity logged for this day yet.' : 'Loading activity...'}
                </p>
              )}
            >
              <For each={currentActivity()?.sessions ?? []}>
                {session => (
                  <article class="p-3 border border-border/70 rounded-xl bg-card/70 space-y-2">
                    <div class="text-xs text-muted-foreground flex flex-wrap gap-2 items-center justify-between">
                      <span>{formatTimeRange(session.start, session.end)}</span>
                      <span>{formatMinutes(session.durationMinutes)}</span>
                    </div>

                    <div>
                      <p class="text-sm font-medium">{session.appName}</p>
                      <p class="text-xs text-muted-foreground break-all">{session.windowTitle}</p>
                      <Show when={session.browserUrl}>
                        <p class="text-11px text-muted-foreground/80 break-all">{session.browserUrl}</p>
                      </Show>
                    </div>

                    <div class="flex flex-wrap gap-2 items-center">
                      <select
                        class="text-xs px-2.5 py-1.5 border border-border/70 rounded-full bg-background"
                        value={session.category ?? 'uncategorized'}
                        disabled={updatingSessionId() === session.id}
                        onChange={event => handleAssignCategory(session, event.currentTarget.value)}
                      >
                        <For each={CATEGORY_OPTIONS}>
                          {option => (
                            <option value={option}>{option}</option>
                          )}
                        </For>
                      </select>

                      <button
                        type="button"
                        class="text-xs px-2.5 py-1.5 border border-border/70 rounded-full transition-colors hover:bg-muted/50"
                        onClick={() => openRuleDraft(session)}
                      >
                        Create rule from selection
                      </button>

                      <Show when={session.isIdle}>
                        <span class="text-11px text-amber-300 px-2 py-1 border border-amber-200/30 rounded-full bg-amber-400/10">Idle</span>
                      </Show>
                    </div>
                  </article>
                )}
              </For>
            </Show>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Today by category</CardTitle>
            <CardDescription>
              {`Tracked ${formatMinutes(currentActivity()?.totalMinutes ?? 0)} across ${currentActivity()?.sessions.length ?? 0} sessions.`}
            </CardDescription>
          </CardHeader>
          <CardContent class="text-sm space-y-3">
            <Show
              when={(currentActivity()?.byCategory.length ?? 0) > 0}
              fallback={
                <p class="text-sm text-muted-foreground">
                  {currentActivity() ? 'No categorized sessions yet.' : 'Loading category totals...'}
                </p>
              }
            >
              <For each={currentActivity()?.byCategory ?? []}>
                {item => (
                  <CategoryBar
                    label={item.category}
                    value={formatMinutes(item.minutes)}
                    percentage={Math.round((item.minutes / maxCategoryMinutes()) * 100)}
                  />
                )}
              </For>
            </Show>
          </CardContent>
        </Card>

        <Show when={ruleDraft()}>
          {draft => (
            <Card class="lg:col-span-2">
              <CardHeader>
                <CardTitle>Create rule from selection</CardTitle>
                <CardDescription>
                  New entries matching this pattern will auto-categorize.
                </CardDescription>
              </CardHeader>
              <CardContent class="gap-3 grid md:grid-cols-[2fr_1fr_1fr_auto]">
                <label class="text-xs text-muted-foreground flex flex-col gap-1.5">
                  Pattern
                  <input
                    type="text"
                    value={draft().pattern}
                    class="text-sm px-3 py-2 border border-border/70 rounded-lg bg-background"
                    onInput={event => setRuleDraft(prev => prev
                      ? {
                          ...prev,
                          pattern: event.currentTarget.value,
                        }
                      : null)}
                  />
                </label>

                <label class="text-xs text-muted-foreground flex flex-col gap-1.5">
                  Match field
                  <select
                    class="text-sm px-3 py-2 border border-border/70 rounded-lg bg-background"
                    value={draft().matchField}
                    onChange={event => setRuleDraft(prev => prev
                      ? {
                          ...prev,
                          matchField: event.currentTarget.value as RuleMatchField,
                        }
                      : null)}
                  >
                    <For each={RULE_MATCH_FIELDS}>
                      {field => (
                        <option value={field}>{field}</option>
                      )}
                    </For>
                  </select>
                </label>

                <label class="text-xs text-muted-foreground flex flex-col gap-1.5">
                  Category
                  <input
                    type="text"
                    value={draft().category}
                    class="text-sm px-3 py-2 border border-border/70 rounded-lg bg-background"
                    onInput={event => setRuleDraft(prev => prev
                      ? {
                          ...prev,
                          category: event.currentTarget.value,
                        }
                      : null)}
                  />
                </label>

                <div class="flex gap-2 items-end justify-end">
                  <button
                    type="button"
                    class="text-sm px-3 py-2 border border-border/70 rounded-lg transition-colors hover:bg-muted/50"
                    onClick={() => setRuleDraft(null)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    class="text-sm text-primary-foreground px-3 py-2 rounded-lg bg-primary transition-opacity disabled:opacity-50"
                    disabled={creatingRule() || !draft().pattern.trim() || !draft().category.trim()}
                    onClick={() => {
                      void saveRule()
                    }}
                  >
                    Save rule
                  </button>
                </div>
              </CardContent>
            </Card>
          )}
        </Show>

        <Card class="lg:col-span-2">
          <CardHeader>
            <CardTitle>Categorization rules</CardTitle>
            <CardDescription>
              {`${rulesData()?.length ?? 0} active rule${(rulesData()?.length ?? 0) === 1 ? '' : 's'}. Use /pattern/flags for regex or plain text for contains.`}
            </CardDescription>
          </CardHeader>
          <CardContent class="space-y-2">
            <Show
              when={(rulesData()?.length ?? 0) > 0}
              fallback={
                <p class="text-sm text-muted-foreground">{rulesData() ? 'No rules yet.' : 'Loading rules...'}</p>
              }
            >
              <For each={rulesData() ?? []}>
                {rule => (
                  <div class="text-xs px-3 py-2 border border-border/70 rounded-lg bg-card/50 flex flex-wrap gap-2 items-center justify-between">
                    <span class="font-mono break-all">{rule.pattern}</span>
                    <span class="text-muted-foreground">{rule.matchField}</span>
                    <span class="text-primary font-medium">{rule.category}</span>
                  </div>
                )}
              </For>
            </Show>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

export default Protected(ActivityPage, '/')

function CategoryBar(props: { label: string, value: string, percentage: number }) {
  return (
    <div class="space-y-1">
      <div class="flex items-center justify-between">
        <span class="text-xs text-muted-foreground tracking-wide uppercase">{props.label}</span>
        <span>{props.value}</span>
      </div>
      <div class="rounded-full bg-muted h-2 w-full overflow-hidden">
        <div class="rounded-full bg-primary/80 h-full" style={{ width: `${props.percentage}%` }} />
      </div>
    </div>
  )
}

function formatTimeRange(startIso: string, endIso: string): string {
  const start = new Date(startIso)
  const end = new Date(endIso)

  const options: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
  }

  return `${start.toLocaleTimeString([], options)} - ${end.toLocaleTimeString([], options)}`
}
