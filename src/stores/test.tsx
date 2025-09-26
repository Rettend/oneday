import type { ParentProps } from 'solid-js'
import type { Store } from 'solid-js/store'
import { makePersisted, storageSync } from '@solid-primitives/storage'
import { createContext, useContext } from 'solid-js'
import { createStore } from 'solid-js/store'

interface TestState {
  test: string
}

interface TestLocalState {
  test: string
}

type TestStoreState = TestState & {
  local: TestLocalState
}

interface TestStoreActions {
  setTest: (test: string) => void
  setLocalTest: (test: string) => void
}

type StoreContextType = [Store<TestState>, Store<TestLocalState>, TestStoreActions]
const StoreContext = createContext<StoreContextType>()

export function TestStoreProvider(props: ParentProps) {
  const [state, setState] = createStore<TestState>({
    test: '',
  })

  const [baseLocal, setBaseLocal] = createStore<TestLocalState>({
    test: '',
  })
  const [local, setLocal] = makePersisted([baseLocal, setBaseLocal], {
    name: 'Test',
    storage: window.localStorage,
    sync: storageSync,
  })

  const actions: TestStoreActions = {
    setTest(test: string) {
      setState({ test })
    },
    setLocalTest(test: string) {
      setLocal({ test })
    },
  }

  return (
    <StoreContext.Provider value={[state, local, actions]}>
      {props.children}
    </StoreContext.Provider>
  )
}

export function useTestStore(): { test: TestStoreState, actions: TestStoreActions } {
  const context = useContext(StoreContext)
  if (!context)
    throw new Error('useTestStore must be used within a TestStoreProvider')

  const [test, localTest, actions] = context

  return {
    test: Object.create(test, {
      local: {
        get: () => localTest,
        enumerable: true,
      },
    }),
    actions,
  }
}
