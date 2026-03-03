import type { DesktopActivityEntry } from '~/lib/desktop/activityTracker'
import { createEffect, onCleanup } from 'solid-js'
import {
  acknowledgeDesktopPendingActivity,

  getDesktopPendingActivity,
  isDesktopApp,
} from '~/lib/desktop/activityTracker'
import { ingestActivity } from '~/server/remote/productivity'

const SYNC_INTERVAL_MS = 60_000
const SYNC_BATCH_SIZE = 500

export function DesktopActivityBridge(props: { enabled: boolean }) {
  createEffect(() => {
    if (!props.enabled || !isDesktopApp())
      return

    let stopped = false
    let syncing = false

    const flush = async () => {
      if (stopped || syncing)
        return

      syncing = true

      try {
        const pending = await getDesktopPendingActivity(SYNC_BATCH_SIZE)
        if (!pending.length)
          return

        await ingestActivity({
          entries: pending.map(toIngestEntry),
        })

        const lastSequence = pending[pending.length - 1]?.sequence
        if (lastSequence !== undefined)
          await acknowledgeDesktopPendingActivity(lastSequence)
      }
      catch {
      }
      finally {
        syncing = false
      }
    }

    void flush()

    const interval = window.setInterval(() => {
      void flush()
    }, SYNC_INTERVAL_MS)

    onCleanup(() => {
      stopped = true
      window.clearInterval(interval)
    })
  })

  return null
}

function toIngestEntry(entry: DesktopActivityEntry) {
  return {
    timestamp: new Date(entry.timestamp),
    appName: entry.appName,
    windowTitle: entry.windowTitle,
    browserUrl: entry.browserUrl,
    isIdle: entry.isIdle,
  }
}
