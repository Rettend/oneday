import type { Component, JSX, ParentComponent } from 'solid-js'
import { useLocation, useNavigate } from '@solidjs/router'
import { createMemo, For } from 'solid-js'
import { A } from '~/router'
import { useUIStore } from '~/stores/ui'
import { uuidV7Base58 } from '~/utils/ids'

const SidebarShell: ParentComponent<{ footer?: JSX.Element }> = (props) => {
  const [ui, uiActions] = useUIStore()
  const isCollapsed = createMemo(() => ui.local.sidebarCollapsedLg)

  return (
    <aside class="inset-y-0 left-0 fixed z-50">
      <div class="flex h-dvh">
        <div class={`px-2 py-3 h-full w-20 ${isCollapsed() ? 'lg:px-2 lg:w-20' : 'lg:px-3 lg:w-64'}`}>
          <div class="h-full relative">
            <div class="rounded-2xl pointer-events-none inset-0 absolute from-primary/16 to-transparent via-transparent bg-gradient-to-b" />
            <div class="border border-border/80 rounded-2xl bg-background/55 h-full shadow-sm backdrop-blur-xl">
              <div class="flex flex-col h-full">
                <A
                  href="/"
                  class="mx-1.5 mt-1.5 rounded-full inline-flex gap-3 transition-colors duration-200 items-center"
                  classList={{
                    'justify-center py-0': !isCollapsed(),
                    'lg:h-12 lg:w-12 lg:px-0 lg:py-0 lg:gap-0 lg:justify-center': isCollapsed(),
                    'lg:px-4 lg:justify-start': !isCollapsed(),
                  }}
                >
                  <span class="rounded-full inline-flex size-12 items-center justify-center">
                    <span class="i-ph-sun-horizon-duotone text-primary size-7" />
                  </span>
                  <span class={`text-lg text-primary font-semibold hidden ${isCollapsed() ? '' : 'lg:inline'}`}>Oneday</span>
                </A>
                <div class="mx-1.5 mt-2 bg-border/80 h-px" />
                <div class="flex-1 relative">
                  {props.children}
                  <div class="rounded-b-2xl h-8 pointer-events-none bottom-0 left-0 right-0 absolute from-background to-transparent bg-gradient-to-t lg:h-10" />
                </div>
                {props.footer && (
                  <div class={`px-3 py-3 ${isCollapsed() ? 'lg:px-0 lg:flex lg:justify-center' : ''}`}>
                    {props.footer}
                  </div>
                )}
                <button
                  type="button"
                  aria-label="Toggle sidebar width"
                  title="Toggle sidebar width"
                  class="opacity-0 hidden transition-opacity duration-150 bottom-0 right-[-6px] top-0 absolute focus:opacity-100 hover:opacity-100 lg:block"
                  style={{ cursor: 'e-resize', width: '12px' }}
                  onClick={() => uiActions.toggleSidebarCollapsedLg()}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}

const navItems = [
  { href: '/dashboard', icon: 'i-ph-chart-bar-duotone', label: 'Dashboard' },
  { href: '/activity', icon: 'i-ph-chart-line-up-duotone', label: 'Activity' },
  { href: '/settings', icon: 'i-ph-gear-six-duotone', label: 'Settings' },
] as const

const projects = [
  { name: 'Oneday OS', icon: 'i-ph-sparkle-duotone' },
  { name: 'Client work', icon: 'i-ph-briefcase-duotone' },
  { name: 'Life admin', icon: 'i-ph-house-duotone' },
] as const

const history = [
  { id: 'daily', title: 'Daily contract planning' },
  { id: 'deep-focus-protocol', title: 'Deep focus protocol' },
  { id: 'weekly-review', title: 'Weekly review' },
] as const

const AppSidebar: Component = () => {
  const [ui] = useUIStore()
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (href: string) => location.pathname === href

  return (
    <SidebarShell
      footer={(
        <A
          href="/settings"
          class={`text-13px text-primary font-medium mx-a border border-border/70 rounded-full bg-background/80 inline-flex gap-2 h-10 w-10 items-center justify-center hover:text-foreground hover:bg-primary/5 ${
            ui.local.sidebarCollapsedLg ? '' : 'lg:w-full lg:mx-0'
          }`}
        >
          <span class="i-ph-gear-six-duotone size-5" />
          <span class={`hidden ${ui.local.sidebarCollapsedLg ? '' : 'lg:inline'}`}>Settings</span>
        </A>
      )}
    >
      <div class="nav-scroll px-2 pb-2 pt-3 [scroll-behavior:smooth] inset-0 absolute overflow-y-auto space-y-4">
        <section class="flex flex-col gap-3">
          <button
            type="button"
            class={`text-sm text-primary-foreground font-medium mx-a rounded-full bg-primary/90 inline-flex gap-2 h-10 w-10 shadow-[0_0_22px_oklch(var(--primary)_/_0.45)] transition-colors items-center justify-center hover:bg-primary ${
              ui.local.sidebarCollapsedLg ? '' : 'lg:h-10 lg:w-full lg:mx-0'
            }`}
            onClick={() => navigate(`/chat/${uuidV7Base58()}`)}
          >
            <span class="i-ph-chat-circle-dots-duotone size-5" />
            <span class={`hidden ${ui.local.sidebarCollapsedLg ? '' : 'lg:inline'}`}>New chat</span>
          </button>
          <div
            class={`flex gap-2 items-center justify-center ${
              ui.local.sidebarCollapsedLg ? '' : 'lg:justify-start'
            }`}
          >
            <button
              type="button"
              class="text-primary border border-border/70 rounded-full bg-background/80 inline-flex h-10 w-10 items-center justify-center hover:text-foreground hover:bg-primary/5"
              classList={{ 'lg:hidden': !ui.local.sidebarCollapsedLg }}
              aria-label="Search chats"
            >
              <span class="i-ph-magnifying-glass-duotone size-5" />
            </button>
            <div
              class={`flex-1 hidden relative ${
                ui.local.sidebarCollapsedLg ? '' : 'lg:block'
              }`}
            >
              <span class="i-ph-magnifying-glass-duotone text-primary/90 size-5 pointer-events-none left-3 top-1/2 absolute -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search chats"
                class="text-sm pl-10 pr-3 outline-none border border-border/70 rounded-full bg-background h-10 w-full ring-0 focus:border-primary/60 focus:bg-background"
              />
            </div>
          </div>
        </section>

        <section class="space-y-1">
          <For each={navItems}>
            {item => (
              <A
                href={item.href}
                class={`text-sm font-medium mx-a rounded-full flex gap-2 h-10 w-10 items-center justify-center ${
                  ui.local.sidebarCollapsedLg ? '' : 'lg:h-9 lg:w-full lg:px-3 lg:justify-start lg:mx-0'
                }`}
                classList={{
                  'text-foreground bg-primary/10': isActive(item.href),
                  'text-primary hover:text-foreground hover:bg-primary/6': !isActive(item.href),
                }}
              >
                <span class={`${item.icon} size-5`} />
                <span class={`hidden truncate ${ui.local.sidebarCollapsedLg ? '' : 'lg:inline'}`}>{item.label}</span>
              </A>
            )}
          </For>
        </section>

        <section class="space-y-2">
          <button
            type="button"
            class={`text-sm text-primary font-medium mx-a rounded-full flex gap-2 h-10 w-10 items-center justify-center hover:text-foreground hover:bg-primary/6 ${
              ui.local.sidebarCollapsedLg ? '' : 'lg:h-9 lg:w-full lg:px-3 lg:justify-start lg:mx-0'
            }`}
          >
            <span class="i-ph-folders-duotone size-5" />
            <span class={`hidden truncate ${ui.local.sidebarCollapsedLg ? '' : 'lg:inline'}`}>Projects</span>
          </button>
          <div class={`ml-3 pl-3 border-l border-border/70 hidden space-y-1 ${ui.local.sidebarCollapsedLg ? '' : 'lg:block'}`}>
            <For each={projects}>
              {project => (
                <button
                  type="button"
                  class="text-13px text-primary px-3 py-2 text-left rounded-full flex gap-2 w-full items-center hover:text-foreground hover:bg-primary/6"
                >
                  <span class={`${project.icon} size-5`} />
                  <span class="truncate">{project.name}</span>
                </button>
              )}
            </For>
          </div>
        </section>

        <section class="space-y-2">
          <button
            type="button"
            class={`text-sm text-primary font-medium mx-a rounded-full flex gap-2 h-10 w-10 items-center justify-center hover:text-foreground hover:bg-primary/6 ${
              ui.local.sidebarCollapsedLg ? '' : 'lg:h-9 lg:w-full lg:px-3 lg:justify-start lg:mx-0'
            }`}
          >
            <span class="i-ph-clock-counter-clockwise-duotone size-5" />
            <span class={`hidden truncate ${ui.local.sidebarCollapsedLg ? '' : 'lg:inline'}`}>History</span>
          </button>
          <div class={`ml-3 pl-3 border-l border-border/70 hidden space-y-1 ${ui.local.sidebarCollapsedLg ? '' : 'lg:block'}`}>
            <For each={history}>
              {item => (
                <A
                  href={`/chat/${item.id}`}
                  class="text-13px text-primary px-3 py-2 text-left text-start rounded-full w-full hover:text-foreground hover:bg-primary/6"
                >
                  <span class="truncate">{item.title}</span>
                </A>
              )}
            </For>
          </div>
        </section>
      </div>
      <style>
        {`
        .nav-scroll { scrollbar-width: none; }
        .nav-scroll::-webkit-scrollbar { display: none; }
        `}
      </style>
    </SidebarShell>
  )
}

export const AppNavbar: Component = () => {
  return <AppSidebar />
}
