import type { Component } from 'solid-js'
import type { AssistantChatMessage } from './types'
import { createEffect, createMemo, createSignal, Show } from 'solid-js'
import { Button } from '~/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '~/components/ui/collapsible'
import { cn } from '~/utils'

interface AssistantMessageProps {
  message: AssistantChatMessage
  isStreaming?: boolean
  onRegenerate?: (message: AssistantChatMessage) => void
}

export const AssistantMessage: Component<AssistantMessageProps> = (props) => {
  const [thinkingOpen, setThinkingOpen] = createSignal(false)

  createEffect(() => {
    if (props.message.thinking?.state === 'streaming')
      setThinkingOpen(true)
  })

  async function copy() {
    if (navigator?.clipboard)
      await navigator.clipboard.writeText(props.message.content)
  }

  function handleRegenerate() {
    if (!props.isStreaming)
      props.onRegenerate?.(props.message)
  }

  const stats = () => props.message.stats
  const thinkingText = createMemo(() => props.message.thinking?.text?.trim())

  return (
    <div class="group/assistant flex flex-col gap-2">
      <Show when={props.message.modelLabel}>
        <p class="text-11px text-muted-foreground/70 tracking-[0.2em] uppercase">
          {props.message.modelLabel}
        </p>
      </Show>
      <div class="p-4 border border-border/70 rounded-2xl bg-card/60 max-w-[min(90vw,720px)] shadow-[0_18px_45px_rgba(0,0,0,0.35)] backdrop-blur">
        <Show when={thinkingText()}>
          <Collapsible open={thinkingOpen()} onOpenChange={setThinkingOpen}>
            <CollapsibleTrigger class="text-base text-muted-foreground font-medium px-3 py-2 border border-border/70 rounded-xl bg-muted/30 flex w-full transition items-center justify-between hover:text-foreground hover:border-border">
              <span class="flex gap-2 items-center">
                <span class="i-ph-brain-duotone size-4" />
                <span>Thinking</span>
                <Show when={props.message.thinking?.state === 'streaming'}>
                  <span class="i-ph-activity-duotone text-primary size-4 animate-spin" />
                </Show>
              </span>
              <span
                class={cn(
                  'i-ph-caret-down-duotone size-4 transition-transform duration-200',
                  thinkingOpen() ? 'rotate-180' : '',
                )}
              />
            </CollapsibleTrigger>
            <CollapsibleContent class="text-base text-muted-foreground/90 px-3 py-2 border border-border/60 rounded-xl bg-muted/10">
              <span class="text-foreground/90 leading-relaxed whitespace-pre-wrap">
                {thinkingText()}
              </span>
            </CollapsibleContent>
          </Collapsible>
        </Show>

        <div class="mt-3 space-y-3">
          <p class="text-base text-foreground leading-relaxed whitespace-pre-wrap">
            {props.message.content || (props.isStreaming ? 'Generating…' : '')}
            <Show when={props.message.status === 'streaming'}>
              <span class="ml-1 align-middle rounded bg-primary/80 h-4 w-2 inline-block animate-pulse" />
            </Show>
          </p>
          <Show when={props.message.status === 'error'}>
            <p class="text-base text-destructive px-3 py-2 border border-destructive/40 rounded-xl bg-destructive/10">
              {props.message.errorText ?? 'The assistant ran into an issue. Try regenerating.'}
            </p>
          </Show>
        </div>

        <div class="text-11px text-muted-foreground mt-4 flex flex-wrap gap-3 items-center">
          <Show when={stats()}>
            {stat => (
              <>
                <span>
                  {stat()?.totalTokens ?? '—'} tokens · {stat()?.tokensPerSecond ?? '—'} tok/s
                </span>
                <span aria-hidden="true">•</span>
                <span>{((stat()?.durationMs ?? 0) / 1000).toFixed(2)}s</span>
              </>
            )}
          </Show>
        </div>
      </div>
      <div class="opacity-0 flex gap-1 transition-opacity duration-150 group-hover/assistant:opacity-100">
        <Button
          size="icon"
          variant="ghost"
          class="size-7"
          title="Copy response"
          onClick={copy}
        >
          <span class="i-ph-copy-duotone size-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          class="size-7"
          title="Regenerate response"
          disabled={props.isStreaming}
          onClick={handleRegenerate}
        >
          <span class="i-ph-arrow-counter-clockwise-duotone size-4" />
        </Button>
      </div>
    </div>
  )
}
