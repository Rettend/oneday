import type { ParentComponent } from 'solid-js'
import { useBeforeLeave, useLocation } from '@solidjs/router'
import { createEffect, onCleanup } from 'solid-js'

export const ViewTransition: ParentComponent = (props) => {
  const location = useLocation()

  createEffect(() => {
    const path = location.pathname
    const isAchievements = path.startsWith('/achievements/')

    if (isAchievements) {
      const root = document.documentElement
      if (path.includes('progress'))
        root.setAttribute('data-achievements-direction', '-1')
      else if (path.includes('discover'))
        root.setAttribute('data-achievements-direction', '1')
    }
    else {
      document.documentElement.removeAttribute('data-achievements-direction')
    }
  })

  useBeforeLeave((e) => {
    if (!document.startViewTransition)
      return

    if (e.defaultPrevented)
      return

    const fromPath = e.from?.pathname ?? ''
    const toPath = typeof e.to === 'string' ? e.to : ''
    const fromAchievements = fromPath.startsWith('/achievements/')
    const toAchievements = toPath.startsWith('/achievements/')
    const isAchievementsTabSwitch = fromAchievements && toAchievements

    if (isAchievementsTabSwitch) {
      const root = document.documentElement
      const goingToProgress = toPath.includes('progress')
      const goingToDiscover = toPath.includes('discover')

      if (goingToProgress)
        root.setAttribute('data-achievements-direction', '-1')

      else if (goingToDiscover)
        root.setAttribute('data-achievements-direction', '1')
    }

    e.preventDefault()
    document.startViewTransition(() => {
      e.retry(true)
    })
  })

  onCleanup(() => {
    document.documentElement.removeAttribute('data-achievements-direction')
  })

  return <>{props.children}</>
}
