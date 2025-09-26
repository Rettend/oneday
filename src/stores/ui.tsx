import type { ParentProps } from 'solid-js'
import type { Store } from 'solid-js/store'
import type { Mode } from '~/lib/constants'
import { makePersisted, storageSync } from '@solid-primitives/storage'
import { createContext, useContext } from 'solid-js'
import { createStore } from 'solid-js/store'

interface UIState {
}

interface UILocalState {
  mode: Mode
}

type UIStoreState = UIState & {
  local: UILocalState
}

interface UIStoreActions {
  setMode: (mode: Mode) => void
}

type StoreContextType = [Store<UIState>, Store<UILocalState>, UIStoreActions]
const StoreContext = createContext<StoreContextType>()

export function UIStoreProvider(props: ParentProps) {
  const [state, _setState] = createStore<UIState>({
  })

  const [baseLocal, setBaseLocal] = createStore<UILocalState>({
    mode: 'system',
  })
  const [local, setLocal] = makePersisted([baseLocal, setBaseLocal], {
    name: 'UI',
    storage: window.localStorage,
    sync: storageSync,
  })

  const actions: UIStoreActions = {
    setMode(mode: Mode) {
      setLocal({ mode })
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
