import type { Component } from 'solid-js'
import type { Path } from '~/router'
import { useLocation } from '@solidjs/router'
import { createMemo, For, Match, Switch } from 'solid-js'
import LevelPill from '~/components/todo/LevelPill'
import { A } from '~/router'
import { useUIStore } from '~/stores/ui'

interface NavItem {
  href: Path
  icon: string
  label: string
}

const QUEST_NAV_ITEMS: NavItem[] = [
  { href: '/q/today', icon: 'i-ph-calendar-check-duotone', label: 'Today' },
  { href: '/q/questboard', icon: 'i-ph-sword-duotone', label: 'Questboard' },
  { href: '/q/achievements/progress', icon: 'i-ph-trophy-duotone', label: 'Achievements' },
  { href: '/q/activity', icon: 'i-ph:presentation-chart-duotone', label: 'Activity' },
  { href: '/q/settings', icon: 'i-ph-gear-six-duotone', label: 'Settings' },
  { href: '/q/rules', icon: 'i-ph-funnel-duotone', label: 'Rules' },
  { href: '/q/deadlines', icon: 'i-ph-calendar-duotone', label: 'Deadlines' },
]

function isPathActive(currentPathname: string, href: Path): boolean {
  if (href === '/')
    return currentPathname === '/'
  return currentPathname === href || currentPathname.startsWith(`${href}/`)
}

const QuestSidebar: Component = () => {
  const location = useLocation()
  const [ui, uiActions] = useUIStore()

  return (
    <aside class="inset-y-0 left-0 fixed z-50">
      <div class="flex h-dvh">
        <div class={`px-2 py-3 h-full w-20 ${ui.local.sidebarCollapsedLg ? 'lg:px-2 lg:w-20' : 'lg:px-3 lg:w-64'}`}>
          <div class="h-full relative">
            <div class="rounded-2xl pointer-events-none inset-0 absolute from-primary/8 to-transparent via-transparent bg-gradient-to-b" />
            <div class="border border-border/80 rounded-2xl bg-background/55 h-full shadow-sm backdrop-blur-xl">
              <div class="flex flex-col h-full">
                <A href="/" class={`mx-1.5 mt-1.5 py-3 rounded-full inline-flex gap-3 items-center ${ui.local.sidebarCollapsedLg ? 'lg:px-0 lg:justify-center' : 'lg:px-4'}`}>
                  <span class="i-ph-sun-horizon-duotone text-primary mx-a shrink-0 size-7 lg:mx-0" />
                  <span class={`text-lg font-semibold hidden ${ui.local.sidebarCollapsedLg ? '' : 'lg:inline'}`}>Oneday</span>
                </A>
                <div class="mx-1.5 mt-2 bg-border/80 h-px" />
                <div class="flex-1 relative">
                  <nav class="nav-scroll px-1.5 pt-2 [scroll-behavior:smooth] inset-0 absolute overflow-y-auto space-y-1">
                    <For each={QUEST_NAV_ITEMS}>
                      {(item) => {
                        const active = () => isPathActive(location.pathname, item.href)
                        return (
                          <A
                            href={item.href}
                            title={item.label}
                            class={`group rounded-full inline-flex w-full items-center justify-center ${ui.local.sidebarCollapsedLg ? 'lg:justify-center' : 'lg:justify-start'}`}
                            onMouseEnter={(e) => {
                              if (item.icon === 'i-ph-sword-duotone')
                                e.currentTarget.classList.add('was-hovered')
                            }}
                          >
                            <div
                              class={`rounded-full inline-flex gap-4 size-12 transition-all duration-200 items-center ${ui.local.sidebarCollapsedLg ? 'lg:pl-0 lg:pr-0' : 'lg:pl-4 lg:pr-6'} lg:h-12 ${ui.local.sidebarCollapsedLg ? 'lg:w-12' : 'lg:w-auto'}  ${
                                active()
                                  ? 'bg-primary/8 text-foreground ring-1 ring-primary/40 shadow-[0_0_16px_oklch(var(--primary)_/_0.35)] group-hover:bg-primary/12'
                                  : 'text-foreground/80 group-hover:bg-primary/8 group-hover:text-foreground/90'
                              }`}
                            >
                              {item.icon === 'i-ph-sword-duotone'
                                ? (
                                    <span class={`sword-wrap mx-a shrink-0 ${active() ? 'placed' : ''}`}>
                                      <span class={`sword-icon ${item.icon} size-7 transition-colors ${active() ? 'text-primary' : 'opacity-90 group-hover:opacity-100'}`} />
                                    </span>
                                  )
                                : (
                                    <span class={`mx-a shrink-0 ${item.icon} size-7 transition-colors ${active() ? 'text-primary' : 'opacity-90 group-hover:opacity-100'}`} />
                                  )}
                              <span class={`text-lg font-semibold hidden truncate ${ui.local.sidebarCollapsedLg ? '' : 'lg:inline'}  ${active() ? 'text-primary' : ''}`}>{item.label}</span>
                            </div>
                          </A>
                        )
                      }}
                    </For>
                  </nav>
                  <div class="rounded-b-2xl h-8 pointer-events-none bottom-0 left-0 right-0 absolute from-background to-transparent bg-gradient-to-t lg:h-10" />
                </div>
                <div class={`px-3 py-3 ${ui.local.sidebarCollapsedLg ? 'lg:px-0' : ''}`}>
                  <LevelPill level={3} currentXp={60} nextLevelXp={120} href="/q/achievements/progress" forceIconMode={ui.local.sidebarCollapsedLg} />
                </div>
                <button
                  type="button"
                  aria-label="Toggle sidebar width"
                  title="Toggle sidebar width"
                  class="opacity-0 hidden transition-opacity duration-150 bottom-0 right-[-6px] top-0 absolute focus:opacity-100 hover:opacity-100 lg:block"
                  style={{ cursor: 'e-resize', width: '12px' }}
                  onClick={() => uiActions.toggleSidebarCollapsedLg()}
                />
                <style>
                  {`
                  .nav-scroll { scrollbar-width: none; }
                  .nav-scroll::-webkit-scrollbar { display: none; }
                  .sword-wrap { display: inline-flex; will-change: transform; transform: translateY(0); animation: none; }
                  .sword-icon { will-change: transform; transform-origin: 50% 50%; transition: transform 360ms cubic-bezier(0.22, 1, 0.36, 1); }
                  .group:hover .sword-icon, .sword-wrap.placed .sword-icon { transform: rotate(135deg); }
                  .group:hover .sword-wrap, .sword-wrap.placed { animation: sword-drop 420ms cubic-bezier(0.16, 1, 0.3, 1) both; }
                  .group.was-hovered:not(:hover) .sword-wrap:not(.placed) { animation: sword-pull-out 600ms cubic-bezier(0.22, 1, 0.36, 1) both; }
                  .group.was-hovered:not(:hover) .sword-icon:not(.placed) { transition-delay: 600ms; }
                  @keyframes sword-drop {
                    0% { transform: translateY(-4px); }
                    86% { transform: translateY(-4px); }
                    100% { transform: translateY(0); }
                  }
                  @keyframes sword-pull-out {
                    0% { transform: translateY(0); }
                    100% { transform: translateY(-4px); }
                  }
                  `}
                </style>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}

const ChatSidebar: Component = () => {
  const [ui, uiActions] = useUIStore()

  const projects = [
    { name: 'Oneday OS', icon: 'i-ph-sparkle-duotone' },
    { name: 'Client work', icon: 'i-ph-briefcase-duotone' },
    { name: 'Life admin', icon: 'i-ph-house-duotone' },
  ]

  const history = [
    { title: 'Daily standup planning' },
    { title: 'Deep focus protocol' },
    { title: 'Weekly review script' },
    { title: 'Quest design brainstorm' },
  ]

  return (
    <aside class="inset-y-0 left-0 fixed z-50">
      <div class="flex h-dvh">
        <div class={`px-2 py-3 h-full w-20 ${ui.local.sidebarCollapsedLg ? 'lg:px-2 lg:w-20' : 'lg:px-3 lg:w-64'}`}>
          <div class="h-full relative">
            <div class="rounded-2xl pointer-events-none inset-0 absolute from-primary/8 to-transparent via-transparent bg-gradient-to-b" />
            <div class="border border-border/80 rounded-2xl bg-background/55 h-full shadow-sm backdrop-blur-xl">
              <div class="flex flex-col h-full">
                <A href="/" class={`mx-1.5 mt-1.5 py-3 rounded-full inline-flex gap-3 items-center ${ui.local.sidebarCollapsedLg ? 'lg:px-0 lg:justify-center' : 'lg:px-4'}`}>
                  <span class="i-ph-sun-horizon-duotone text-primary mx-a shrink-0 size-7 lg:mx-0" />
                  <span class={`text-lg font-semibold hidden ${ui.local.sidebarCollapsedLg ? '' : 'lg:inline'}`}>Oneday</span>
                </A>
                <div class="mx-1.5 mt-2 bg-border/80 h-px" />
                <div class="flex-1 relative">
                  <div class="nav-scroll px-2 pb-2 pt-3 [scroll-behavior:smooth] inset-0 absolute overflow-y-auto space-y-4">
                    <section class="space-y-3">
                      <button
                        type="button"
                        class="text-sm text-primary-foreground font-medium rounded-full bg-primary inline-flex gap-2 h-10 w-full shadow-[0_0_22px_oklch(var(--primary)_/_0.45)] transition-colors items-center justify-center hover:bg-primary/90"
                      >
                        <span class="i-ph-sparkle-duotone size-5" />
                        <span>New chat</span>
                      </button>
                      <div class="relative">
                        <span class="i-ph-magnifying-glass-duotone text-muted-foreground size-5 pointer-events-none left-3 top-1/2 absolute -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Search chats"
                          class="text-sm pl-10 pr-3 outline-none border border-border/70 rounded-full bg-background h-10 w-full ring-0 focus:border-primary/60 focus:bg-background"
                        />
                      </div>
                    </section>

                    <section class="space-y-2">
                      <button
                        type="button"
                        class="text-sm text-foreground/90 font-medium px-3 py-1.5 rounded-full flex gap-2 h-9 w-full items-center hover:bg-primary/6"
                      >
                        <span class="i-ph-folders-duotone text-primary/90 size-5" />
                        <span class="truncate">Projects</span>
                      </button>
                      <div class="ml-3 pl-3 border-l border-border/70 space-y-1">
                        <For each={projects}>
                          {project => (
                            <button
                              type="button"
                              class="text-13px text-foreground/90 px-3 py-2 text-left rounded-full flex gap-2 w-full items-center hover:bg-primary/6"
                            >
                              <span class={`${project.icon} text-primary/90 size-5`} />
                              <span class="truncate">{project.name}</span>
                            </button>
                          )}
                        </For>
                      </div>
                    </section>

                    <section class="space-y-2">
                      <button
                        type="button"
                        class="text-sm text-foreground/90 font-medium px-3 py-1.5 rounded-full flex gap-2 h-9 w-full items-center hover:bg-primary/6"
                      >
                        <span class="i-ph-clock-counter-clockwise-duotone text-primary/90 size-5" />
                        <span class="truncate">History</span>
                      </button>
                      <div class="ml-3 pl-3 border-l border-border/70 space-y-1">
                        <For each={history}>
                          {item => (
                            <button
                              type="button"
                              class="text-13px text-foreground/90 px-3 py-2 text-left text-start rounded-lg w-full hover:bg-primary/6"
                            >
                              <span class="truncate">{item.title}</span>
                            </button>
                          )}
                        </For>
                      </div>
                    </section>
                  </div>
                  <div class="rounded-b-2xl h-8 pointer-events-none bottom-0 left-0 right-0 absolute from-background to-transparent bg-gradient-to-t lg:h-10" />
                </div>
                <div class={`px-3 py-3 ${ui.local.sidebarCollapsedLg ? 'lg:px-0' : ''}`}>
                  <button
                    type="button"
                    class="text-13px text-foreground/80 font-medium border border-border/70 rounded-full bg-background/80 inline-flex gap-2 h-10 w-full items-center justify-center hover:bg-primary/5"
                  >
                    <span class="i-ph-gear-six-duotone size-5" />
                    <span class={ui.local.sidebarCollapsedLg ? 'lg:inline' : ''}>Chat settings</span>
                  </button>
                </div>
                <button
                  type="button"
                  aria-label="Toggle sidebar width"
                  title="Toggle sidebar width"
                  class="opacity-0 hidden transition-opacity duration-150 bottom-0 right--6px top-0 absolute focus:opacity-100 hover:opacity-100 lg:block"
                  style={{ cursor: 'e-resize', width: '12px' }}
                  onClick={() => uiActions.toggleSidebarCollapsedLg()}
                />
                <style>
                  {`
                  .nav-scroll { scrollbar-width: none; }
                  .nav-scroll::-webkit-scrollbar { display: none; }
                  `}
                </style>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}

export const AppNavbar: Component = () => {
  const location = useLocation()
  const isChat = createMemo(() => location.pathname.startsWith('/c'))
  const isQuest = createMemo(() => location.pathname.startsWith('/q'))

  return (
    <Switch>
      <Match
        when={isChat()}
      >
        <ChatSidebar />
      </Match>
      <Match
        when={isQuest()}
      >
        <QuestSidebar />
      </Match>
    </Switch>
  )
}
