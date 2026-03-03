import { invoke, isTauri } from '@tauri-apps/api/core'

const DEFAULT_PENDING_BATCH_LIMIT = 500

export interface DesktopActivityEntry {
  sequence: number
  timestamp: number
  appName: string
  windowTitle: string
  browserUrl: string | null
  isIdle: boolean
}

function canUseDesktopApi(): boolean {
  return typeof window !== 'undefined' && isTauri()
}

export function isDesktopApp(): boolean {
  return canUseDesktopApi()
}

export async function getDesktopCurrentActivity(): Promise<DesktopActivityEntry | null> {
  if (!canUseDesktopApi())
    return null

  try {
    return await invoke<DesktopActivityEntry | null>('tracker_get_current_activity')
  }
  catch {
    return null
  }
}

export async function getDesktopPendingActivity(limit = DEFAULT_PENDING_BATCH_LIMIT): Promise<DesktopActivityEntry[]> {
  if (!canUseDesktopApi())
    return []

  try {
    return await invoke<DesktopActivityEntry[]>('tracker_get_pending_activity', { limit })
  }
  catch {
    return []
  }
}

export async function acknowledgeDesktopPendingActivity(upToSequence: number): Promise<number> {
  if (!canUseDesktopApi())
    return 0

  try {
    return await invoke<number>('tracker_ack_pending_activity', { upToSequence })
  }
  catch {
    return 0
  }
}
