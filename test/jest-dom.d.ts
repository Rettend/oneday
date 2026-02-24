import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers'

// Augment bun:test's Matchers with jest-dom matchers
declare module 'bun:test' {
  interface Matchers<T = unknown> extends TestingLibraryMatchers<typeof expect.stringContaining, T> {}
}
