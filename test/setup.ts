import { GlobalRegistrator } from '@happy-dom/global-registrator'
import h from 'solid-js/h'
import '@testing-library/jest-dom'

const Fragment = (props: { children?: unknown }) => props.children

GlobalRegistrator.register()

Object.defineProperty(globalThis, 'React', {
  value: {
    createElement: h,
    Fragment,
  },
  configurable: true,
})

globalThis.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
})
