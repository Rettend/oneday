import type { Component } from 'solid-js'
import { A, useLocation } from '@solidjs/router'
import { For } from 'solid-js'

interface NavItem {
  href: string
  icon: string
  label: string
}

const NAV_ITEMS: NavItem[] = [
  { href: '/today', icon: 'i-ph-calendar-check-duotone', label: 'Today' },
  { href: '/questboard', icon: 'i-ph-sword-duotone', label: 'Questboard' },
  { href: '/achievements', icon: 'i-ph-trophy-duotone', label: 'Achievements' },
  { href: '/activity', icon: 'i-ph:presentation-chart-duotone', label: 'Activity' },
  { href: '/settings', icon: 'i-ph-gear-six-duotone', label: 'Settings' },
  { href: '/rules', icon: 'i-ph-funnel-duotone', label: 'Rules' },
  { href: '/deadlines', icon: 'i-ph-calendar-duotone', label: 'Deadlines' },
]

function isPathActive(currentPathname: string, href: string): boolean {
  if (href === '/')
    return currentPathname === '/'
  return currentPathname === href || currentPathname.startsWith(`${href}/`)
}

const Sidebar: Component = () => {
  const location = useLocation()
  return (
    <aside class="inset-y-0 left-0 fixed z-50">
      <div class="flex h-dvh">
        <div class="px-2 py-3 h-full w-20 lg:px-3 lg:w-64">
          <div class="h-full relative">
            <div class="rounded-2xl pointer-events-none inset-0 absolute from-primary/8 to-transparent via-transparent bg-gradient-to-b" />
            <div class="border border-border/80 rounded-2xl bg-background/55 h-full shadow-sm backdrop-blur-xl">
              <div class="flex flex-col h-full">
                <A href="/" class="mx-1.5 mt-1.5 py-3 rounded-full inline-flex gap-3 items-center lg:px-4 hover:bg-background/70">
                  <span class="i-ph-sun-horizon-duotone text-primary mx-a shrink-0 size-7 lg:mx-0" />
                  <span class="text-lg font-semibold hidden lg:inline">Oneday</span>
                </A>
                <div class="mx-1.5 mt-2 bg-border/80 h-px" />
                <div class="flex-1 relative">
                  <nav class="nav-scroll px-1.5 pt-2 [scroll-behavior:smooth] inset-0 absolute overflow-y-auto space-y-1">
                    <For each={NAV_ITEMS}>
                      {(item) => {
                        const active = () => isPathActive(location.pathname, item.href)
                        return (
                          <A
                            href={item.href}
                            title={item.label}
                            class="group inline-flex w-full items-center justify-center lg:justify-start"
                            onMouseEnter={(e) => {
                              if (item.icon === 'i-ph-sword-duotone')
                                e.currentTarget.classList.add('was-hovered')
                            }}
                          >
                            <div
                              class={`rounded-full inline-flex gap-4 size-12 transition-all duration-200 items-center lg:pl-4 lg:pr-6 lg:h-12 lg:w-auto ${
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
                              <span class={`text-lg font-semibold hidden truncate lg:inline ${active() ? 'text-primary' : ''}`}>{item.label}</span>
                            </div>
                          </A>
                        )
                      }}
                    </For>
                  </nav>
                  <div class="rounded-b-2xl h-8 pointer-events-none bottom-0 left-0 right-0 absolute from-background to-transparent bg-gradient-to-t lg:h-10" />
                </div>
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

export const AppNavbar: Component = () => {
  return (
    <Sidebar />
  )
}
