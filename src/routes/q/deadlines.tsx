import { Protected } from '@rttnd/gau/client/solid'

export default Protected(DeadlinesPage, '/')

function DeadlinesPage() {
  return (
    <section class="flex flex-col gap-4">
      <h1 class="text-2xl tracking-tight font-semibold">Deadlines</h1>
      <div class="text-muted-foreground">Calendar view with hard/soft chips coming soon.</div>
    </section>
  )
}
