import type { ParentProps } from 'solid-js'
import type { Store } from 'solid-js/store'
import { makePersisted, storageSync } from '@solid-primitives/storage'
import { createContext, useContext } from 'solid-js'
import { createStore } from 'solid-js/store'

interface UIState {
}

interface UILocalState {
}

type UIStoreState = UIState & {
  local: UILocalState
}

interface UIStoreActions {
}

type StoreContextType = [Store<UIState>, Store<UILocalState>, UIStoreActions]
const StoreContext = createContext<StoreContextType>()

export function UIStoreProvider(props: ParentProps) {
  const [state, _setState] = createStore<UIState>({
  })

  const [baseLocal, setBaseLocal] = createStore<UILocalState>({
  })
  const [local, _setLocal] = makePersisted([baseLocal, setBaseLocal], {
    name: 'UI',
    storage: window.localStorage,
    sync: storageSync,
  })

  const actions: UIStoreActions = {
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
