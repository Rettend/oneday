/* eslint-disable */

export type Path =
  | '/'
  | '/c'
  | '/c/:id'
  | '/q'
  | '/q/achievements'
  | '/q/achievements/discover'
  | '/q/achievements/progress'
  | '/q/activity'
  | '/q/deadlines'
  | '/q/questboard'
  | '/q/rules'
  | '/q/settings'
  | '/q/today'

export type Params = {
  '/c/:id': { id: string }
}
