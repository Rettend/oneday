import type { ParentProps } from 'solid-js'
import { UIStoreProvider } from './ui'

export function RootStoreProvider(props: ParentProps) {
  return (
    <UIStoreProvider>
      {props.children}
    </UIStoreProvider>
  )
}
