/* eslint-disable */

export type Path =
  | '/'
  | '/api/auth/*gau'
  | '/c'
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
  '/api/auth/*gau': { gau: string }
}
