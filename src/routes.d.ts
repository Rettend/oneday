/* eslint-disable */

export type Path =
  | '/'
  | '/c'
  | '/c/:id'
  | '/c/settings'

export type Params = {
  '/c/:id': { id: string }
}
