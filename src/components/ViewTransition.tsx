import type { ParentComponent } from 'solid-js'
import { useBeforeLeave } from '@solidjs/router'

export const ViewTransition: ParentComponent = (props) => {
  useBeforeLeave((e) => {
    if (!document.startViewTransition)
      return

    if (e.defaultPrevented)
      return

    e.preventDefault()
    document.startViewTransition(() => {
      e.retry(true)
    })
  })

  return <>{props.children}</>
}
