import { Protected } from '@rttnd/gau/client/solid'

export default Protected(SettingsPage, '/')

function SettingsPage() {
  return (
    <section class="flex flex-col gap-4">
      <h1 class="text-2xl tracking-tight font-semibold">Settings</h1>
      <div class="text-muted-foreground">Tracking, extension, notifications, XP curve, theme, export.</div>
    </section>
  )
}
