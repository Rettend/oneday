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

const SidebarFull: Component = () => {
  const location = useLocation()
  return (
    <nav class="hidden lg:p-3 lg:border-r lg:bg-card lg:flex lg:flex-col lg:gap-1 lg:w-60">
      <For each={NAV_ITEMS}>
        {(item) => {
          const active = () => isPathActive(location.pathname, item.href)
          return (
            <A
              href={item.href}
              title={item.label}
              class={`group text-sm px-3 py-2 rounded-md flex gap-3 transition-colors items-center hover:text-accent-foreground hover:bg-accent ${active() ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'}`}
            >
              <span class={`${item.icon} text-xl ${active() ? 'text-primary' : 'opacity-80 group-hover:opacity-100'}`} />
              <span class="truncate">{item.label}</span>
            </A>
          )
        }}
      </For>
    </nav>
  )
}

const SidebarSlim: Component = () => {
  const location = useLocation()
  return (
    <nav class="hidden md:p-2 md:border-r md:bg-card md:flex md:flex-col md:gap-1 md:w-16 lg:hidden md:items-center">
      <For each={NAV_ITEMS}>
        {(item) => {
          const active = () => isPathActive(location.pathname, item.href)
          return (
            <A
              href={item.href}
              title={item.label}
              class={`group rounded-md flex size-12 transition-colors items-center justify-center hover:bg-accent ${active() ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'}`}
            >
              <span class={`${item.icon} text-2xl ${active() ? 'text-primary' : 'opacity-80 group-hover:opacity-100'}`} />
            </A>
          )
        }}
      </For>
    </nav>
  )
}

const BottomTabs: Component = () => {
  const location = useLocation()
  const primary = NAV_ITEMS.slice(0, 5)
  const overflow = NAV_ITEMS.slice(5)
  return (
    <div class="border-t bg-card/95 inset-x-0 bottom-0 fixed z-40 backdrop-blur supports-[backdrop-filter]:bg-card/65 md:hidden">
      <div class="grid grid-cols-5">
        <For each={primary}>
          {(item) => {
            const active = () => isPathActive(location.pathname, item.href)
            return (
              <A
                href={item.href}
                title={item.label}
                class={`text-xs py-2 flex flex-col gap-1 items-center justify-center ${active() ? 'text-primary' : 'text-muted-foreground'}`}
              >
                <span class={`${item.icon} text-xl`} />
                <span class="truncate">{item.label}</span>
              </A>
            )
          }}
        </For>
        <Show when={overflow.length > 0}>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <button class="text-xs text-muted-foreground py-2 flex flex-col gap-1 items-center justify-center hover:text-foreground">
                <span class="i-ph-dots-three-outline-fill text-xl" />
                <span>More</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent class="min-w-44">
              <For each={overflow}>
                {item => (
                  <DropdownMenuItem>
                    <A href={item.href} class="flex gap-2 items-center">
                      <span class={`${item.icon} text-lg`} />
                      <span>{item.label}</span>
                    </A>
                  </DropdownMenuItem>
                )}
              </For>
            </DropdownMenuContent>
          </DropdownMenu>
        </Show>
      </div>
    </div>
  )
}

export const AppNavbar: Component = () => {
  return (
    <>
      <SidebarFull />
      <SidebarSlim />
      <BottomTabs />
    </>
  )
}
