import type { ParentProps } from 'solid-js'
import { TestStoreProvider } from './test'
import { UIStoreProvider } from './ui'

export function RootStoreProvider(props: ParentProps) {
  return (
    <TestStoreProvider>
      <UIStoreProvider>
        {props.children}
      </UIStoreProvider>
    </TestStoreProvider>
  )
}
