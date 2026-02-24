/* eslint-disable */

export type Path =
  | '/'
  | '/activity'
  | '/chat/:id'
  | '/dashboard'
  | '/settings'

export type Params = {
  '/chat/:id': { id: string }
}
