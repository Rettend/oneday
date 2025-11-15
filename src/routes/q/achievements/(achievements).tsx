import type { ParentComponent } from 'solid-js'
import { Protected } from '@rttnd/gau/client/solid'
import { useLocation } from '@solidjs/router'
import { A, Navigate } from '~/router'

const LayoutInner: ParentComponent = (props) => {
  const location = useLocation()
  const active = (href: string) => location.pathname === href

  return (
    <section class="flex flex-col gap-4 relative">
      <nav aria-label="Achievements tabs">
        <div class="flex flex-wrap justify-center">
          <A href="/q/achievements/progress" class="group rounded-l-full inline-flex items-center justify-center">
            <div class={`${active('/q/achievements/progress') ? 'bg-primary/8 text-foreground ring-1 ring-primary/40 shadow-[0_0_16px_oklch(var(--primary)_/_0.35)] group-hover:bg-primary/12' : 'text-foreground/80 hover:bg-primary/8 hover:text-foreground/90'} mx-auto px-4 rounded-l-full inline-flex gap-3 h-12 max-w-[256px] w-full transition-all duration-200 items-center`}>
              <span class={`${active('/q/achievements/progress') ? 'text-primary' : 'opacity-90 group-hover:opacity-100'} i-ph-chart-line-up-duotone size-6 transition-colors`} />
              <span class={`text-base font-semibold ${active('/q/achievements/progress') ? 'text-primary' : ''}`}>Progress</span>
            </div>
          </A>
          <A href="/q/achievements/discover" class="group rounded-r-full inline-flex items-center justify-center">
            <div class={`${active('/q/achievements/discover') ? 'bg-primary/8 text-foreground ring-1 ring-primary/40 shadow-[0_0_16px_oklch(var(--primary)_/_0.35)] group-hover:bg-primary/12' : 'text-foreground/80 hover:bg-primary/8 hover:text-foreground/90'} mx-auto px-4 rounded-r-full inline-flex gap-3 h-12 max-w-[256px] w-full transition-all duration-200 items-center`}>
              <span class={`${active('/q/achievements/discover') ? 'text-primary' : 'opacity-90 group-hover:opacity-100'} i-ph-compass-duotone size-6 transition-colors`} />
              <span class={`text-base font-semibold ${active('/q/achievements/discover') ? 'text-primary' : ''}`}>Discover</span>
            </div>
          </A>
        </div>
      </nav>
      <div class="achievements-tab-content">
        {props.children}
      </div>
    </section>
  )
}

export const AchievementsLayout: ParentComponent = (props) => {
  const ProtectedLayout = Protected(
    () => <LayoutInner>{props.children}</LayoutInner>,
    '/',
  )

  return <ProtectedLayout />
}

export default function Achievements() {
  return <Navigate href="/q/achievements/progress" />
}
