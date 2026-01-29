import type { ParentProps } from 'solid-js'
import type { Store } from 'solid-js/store'
import { makePersisted, storageSync } from '@solid-primitives/storage'
import { createContext, useContext } from 'solid-js'
import { createStore } from 'solid-js/store'

interface UIState {
}

interface UILocalState {
  sidebarCollapsedLg: boolean
}

type UIStoreState = UIState & {
  local: UILocalState
}

interface UIStoreActions {
  setSidebarCollapsedLg: (collapsed: boolean) => void
  toggleSidebarCollapsedLg: () => void
}

type StoreContextType = [Store<UIState>, Store<UILocalState>, UIStoreActions]
const StoreContext = createContext<StoreContextType>()

export function UIStoreProvider(props: ParentProps) {
  const [state, _setState] = createStore<UIState>({
  })

  const [baseLocal, setBaseLocal] = createStore<UILocalState>({
    sidebarCollapsedLg: false,
  })
  const [local, _setLocal] = makePersisted([baseLocal, setBaseLocal], {
    name: 'UI',
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    sync: typeof window !== 'undefined' ? storageSync : undefined,
  })

  const actions: UIStoreActions = {
    setSidebarCollapsedLg(collapsed: boolean) {
      setBaseLocal('sidebarCollapsedLg', collapsed)
    },
    toggleSidebarCollapsedLg() {
      setBaseLocal('sidebarCollapsedLg', !baseLocal.sidebarCollapsedLg)
    },
  }

  return (
    <StoreContext.Provider value={[state, local, actions]}>
      {props.children}
    </StoreContext.Provider>
  )
}

export function useUIStore(): [UIStoreState, UIStoreActions] {
  const context = useContext(StoreContext)
  if (!context)
    throw new Error('useUIStore must be used within a UIStoreProvider')

  const [state, local, actions] = context

  return [
    Object.create(state, {
      local: {
        get: () => local,
        enumerable: true,
      },
    }),
    actions,
  ]
}
