import type { Component } from 'solid-js'
import { A, useLocation } from '@solidjs/router'
import { For, Show } from 'solid-js'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '~/components/ui/dropdown-menu'

interface NavItem {
  href: string
  icon: string
  label: string
}

const NAV_ITEMS: NavItem[] = [
  { href: '/today', icon: 'i-ph-calendar-check-duotone', label: 'Today' },
  { href: '/questboard', icon: 'i-ph-sword-duotone', label: 'Questboard' },
  { href: '/achievements', icon: 'i-ph-trophy-duotone', label: 'Achievements' },
  { href: '/activity', icon: 'i-ph-activity-duotone', label: 'Activity' },
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
  const primary = NAV_ITEMS.slice(0, 5)
  const overflow = NAV_ITEMS.slice(5)
  return (
    <aside class="hidden inset-y-0 left-0 fixed z-50 md:block">
      <div class="flex h-dvh">
        <div class="px-2 py-3 h-full w-20 lg:px-3 lg:w-64">
          <div class="h-full relative">
            <div class="rounded-2xl pointer-events-none inset-0 absolute from-primary/8 to-transparent via-transparent bg-gradient-to-b" />
            <div class="border border-border/80 rounded-2xl bg-background/55 h-full shadow-sm backdrop-blur-xl">
              <div class="flex flex-col h-full">
                <A href="/" class="mx-1.5 mt-1.5 px-4 py-3 rounded-full inline-flex gap-3 items-center hover:bg-background/70">
                  <span class="i-ph-sun-horizon-duotone text-primary size-7" />
                  <span class="text-lg font-semibold hidden lg:inline">Oneday</span>
                </A>
                <div class="mx-1.5 mt-2 bg-border/80 h-px" />
                <nav class="px-1.5 pt-2 flex-1 overflow-y-auto space-y-1">
                  <For each={primary}>
                    {(item) => {
                      const active = () => isPathActive(location.pathname, item.href)
                      return (
                        <A
                          href={item.href}
                          title={item.label}
                          class="group inline-flex w-full items-center justify-center lg:justify-start"
                        >
                          <div
                            class={`rounded-full inline-flex gap-4 size-12 transition-all duration-200 items-center lg:px-4 lg:h-12 lg:w-auto ${active() ? 'bg-background/80 text-foreground ring-1 ring-primary/40 shadow-[0_0_16px_oklch(var(--primary)_/_0.35)]' : 'text-foreground/80'} group-hover:bg-primary/8`}
                          >
                            <span class={`shrink- mx-a ${item.icon} size-7 transition-colors ${active() ? 'text-primary' : 'opacity-90 group-hover:opacity-100'}`} />
                            <span class={`text-lg font-semibold hidden truncate lg:inline ${active() ? 'text-primary' : ''}`}>{item.label}</span>
                          </div>
                        </A>
                      )
                    }}
                  </For>
                </nav>
                <Show when={overflow.length > 0}>
                  <div class="mt-auto px-1.5 pt-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <button class="text-foreground/80 px-4 py-3 rounded-xl inline-flex gap-4 w-full transition-all items-center hover:bg-background/60 hover:shadow-md">
                          <span class="i-ph-dots-three-outline-fill text-2xl" />
                          <span class="text-base hidden lg:inline">More</span>
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent class="border border-border/80 bg-background/70 min-w-44 backdrop-blur-md">
                        <For each={overflow}>
                          {(item) => {
                            const active = () => isPathActive(location.pathname, item.href)
                            return (
                              <DropdownMenuItem class={active() ? 'bg-background/70 text-foreground' : ''}>
                                <A href={item.href} class="flex gap-2 items-center">
                                  <span class={`${item.icon} text-lg ${active() ? 'text-primary' : ''}`} />
                                  <span>{item.label}</span>
                                </A>
                              </DropdownMenuItem>
                            )
                          }}
                        </For>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </Show>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}

const MobileDock: Component = () => {
  const location = useLocation()
  const primary = NAV_ITEMS.slice(0, 5)
  const overflow = NAV_ITEMS.slice(5)
  return (
    <div class="flex inset-x-0 bottom-4 justify-center fixed z-40 md:hidden">
      <div class="relative">
        <div class="rounded-28px pointer-events-none inset-0 absolute from-primary/20 to-transparent bg-gradient-to-b blur-xl -z-10" />
        <div class="px-2 py-1.5 border border-border/80 rounded-2xl bg-background/55 shadow-lg backdrop-blur-xl">
          <div class="gap-1 grid grid-cols-5">
            <For each={primary}>
              {(item) => {
                const active = () => isPathActive(location.pathname, item.href)
                return (
                  <A
                    href={item.href}
                    title={item.label}
                    class={`group px-5 py-3 rounded-xl flex flex-col gap-1 transition-all items-center justify-center hover:bg-primary/10 ${active() ? 'text-primary bg-background/60 ring-1 ring-primary/40 shadow-[0_0_16px_oklch(var(--primary)_/_0.35)]' : 'text-foreground/80'}`}
                  >
                    <span class={`${item.icon} text-3xl`} />
                    <span class="sr-only">{item.label}</span>
                  </A>
                )
              }}
            </For>
            <Show when={overflow.length > 0}>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <button class="text-foreground/80 px-5 py-3 rounded-xl flex flex-col gap-1 transition-all items-center justify-center hover:text-foreground hover:bg-background/60 hover:shadow-md">
                    <span class="i-ph-dots-three-outline-fill text-3xl" />
                    <span class="sr-only">More</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent class="border border-border/80 bg-background/70 min-w-44 backdrop-blur-md">
                  <For each={overflow}>
                    {(item) => {
                      const active = () => isPathActive(location.pathname, item.href)
                      return (
                        <DropdownMenuItem class={active() ? 'bg-background/70 text-foreground' : ''}>
                          <A href={item.href} class="flex gap-2 items-center">
                            <span class={`${item.icon} text-lg ${active() ? 'text-primary' : ''}`} />
                            <span>{item.label}</span>
                          </A>
                        </DropdownMenuItem>
                      )
                    }}
                  </For>
                </DropdownMenuContent>
              </DropdownMenu>
            </Show>
          </div>
        </div>
      </div>
    </div>
  )
}

export const AppNavbar: Component = () => {
  return (
    <>
      <Sidebar />
      <MobileDock />
    </>
  )
}
