import type { Component } from 'solid-js'
import { createEffect, createMemo, createSignal, onMount, Show } from 'solid-js'
import { Button } from '~/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '~/components/ui/select'
import { TextField, TextFieldTextArea } from '~/components/ui/text-field'

type LLMInputPosition = 'overlay' | 'inline'
type LLMInputSettingsMode = 'always' | 'active'
type ReasoningEffort = 'none' | 'low' | 'med' | 'high'

interface LLMInputProps {
  placeholder?: string
  onSend?: (message: string) => void | Promise<void>
  /**
   * Where the input should be rendered.
   * - `inline`: rendered in the document flow
   * - `overlay`: floating at the bottom of the viewport
   *
   * Defaults to `overlay`.
   */
  position?: LLMInputPosition
  /**
   * When to show the settings row.
   * - `always`: settings are always visible
   * - `active`: settings are hidden by default and shown on hover / focus / when there is a message
   *
   * Defaults to `always`.
   */
  settingsMode?: LLMInputSettingsMode
  disabled?: boolean
  prefill?: string
  onPrefillApplied?: () => void
}

export const LLMInput: Component<LLMInputProps> = (props) => {
  const [focused, setFocused] = createSignal(false)
  const [hovered, setHovered] = createSignal(false)
  const [message, setMessage] = createSignal('')
  const [sending, setSending] = createSignal(false)
  const [reasoningEffort, setReasoningEffort] = createSignal<ReasoningEffort>('med')

  let textareaRef: HTMLTextAreaElement | undefined

  function autoResize(el: HTMLTextAreaElement) {
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }

  function scheduleResize() {
    requestAnimationFrame(() => {
      if (textareaRef)
        autoResize(textareaRef)
    })
  }

  async function send() {
    const text = message().trim()
    if (!text || sending())
      return
    setSending(true)
    try {
      const result = props.onSend?.(text)
      if (result && typeof (result as Promise<void>).then === 'function')
        await result
      setMessage('')
      scheduleResize()
    }
    finally {
      setSending(false)
      textareaRef?.blur()
    }
  }

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void send()
    }
  }

  onMount(() => {
    textareaRef?.focus()
    scheduleResize()
  })

  const position = createMemo(() => props.position ?? 'overlay')
  const settingsMode = createMemo(() => props.settingsMode ?? 'always')

  const isActive = createMemo(() => focused() || message().trim().length > 0)
  const isHoverOrActive = createMemo(() => hovered() || isActive())

  const disabled = createMemo(() => Boolean(props.disabled) || sending())

  const showSettingsRow = createMemo(() =>
    settingsMode() === 'always' || (settingsMode() === 'active' && isHoverOrActive()),
  )

  const showBackground = createMemo(() =>
    position() === 'inline' || showSettingsRow() || isActive(),
  )

  const reasoningOptions: ReasoningEffort[] = ['none', 'low', 'med', 'high']
  const reasoningIcons: Record<ReasoningEffort, string> = {
    none: 'i-speedometer-none',
    low: 'i-speedometer-low',
    med: 'i-speedometer-med',
    high: 'i-speedometer-high',
  }

  function reasoningLabel(effort?: ReasoningEffort) {
    if (!effort)
      return 'None'

    switch (effort) {
      case 'none':
        return 'None'
      case 'low':
        return 'Low'
      case 'med':
        return 'Medium'
      case 'high':
        return 'High'
    }
  }

  createEffect(() => {
    if (props.prefill === undefined)
      return
    setMessage(props.prefill)
    scheduleResize()
    textareaRef?.focus()
    props.onPrefillApplied?.()
  })

  const inner = (
    <div
      class="border rounded-2xl pointer-events-auto"
      classList={{
        'bg-card/80 border-border/80 backdrop-blur-xl shadow-lg shadow-black/40': showBackground(),
        'bg-transparent border-transparent': !showBackground() && position() === 'overlay',
      }}
      style={{
        'margin-inline': position() === 'overlay' ? 'auto' : undefined,
        'width': position() === 'overlay' ? (focused() ? '100%' : '92%') : '100%',
        'transition':
          'width 260ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 200ms ease, transform 200ms cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div class="p-3 space-y-3">
        {showSettingsRow() && (
          <div class="flex flex-wrap gap-2 items-center justify-between">
            <div class="flex flex-wrap gap-2 items-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                class="text-xs px-3 rounded-full h-9"
              >
                <span class="i-ph-brain-duotone size-4" />
                <span class="truncate">Model</span>
                <span class="i-ph-caret-down-duotone size-4" />
              </Button>
              <Select
                options={reasoningOptions}
                value={reasoningEffort()}
                onChange={value => setReasoningEffort(value ?? 'none')}
                itemComponent={props => (
                  <SelectItem item={props.item}>
                    <div class="flex gap-2 items-center">
                      <span class={`${reasoningIcons[props.item.rawValue]} size-4`} />
                      <span class="text-xs">{reasoningLabel(props.item.rawValue)}</span>
                    </div>
                  </SelectItem>
                )}
              >
                <SelectTrigger class="text-xs px-3 rounded-full h-9 min-w-36">
                  <div class="flex gap-2 items-center">
                    <span class={`${reasoningIcons[reasoningEffort()]} size-4`} />
                    <span class="truncate">{reasoningLabel(reasoningEffort())}</span>
                  </div>
                </SelectTrigger>
                <SelectContent />
              </Select>
            </div>
            <div class="ml-auto flex gap-1.5 items-center">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                class="text-xs px-3 rounded-full h-9"
              >
                <span class="i-ph-magnifying-glass-duotone mr-1 size-4" />
                <span>Search</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                class="rounded-full h-9 w-9"
              >
                <span class="i-ph-paperclip-duotone size-5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                class="rounded-full h-9 w-9"
              >
                <span class="i-ph-gear-six-duotone size-5" />
              </Button>
            </div>
          </div>
        )}

        <div class="relative">
          <TextField>
            <TextFieldTextArea
              ref={textareaRef}
              rows={1}
              value={message()}
              placeholder={props.placeholder ?? 'What should we focus on today?'}
              disabled={disabled()}
              onInput={(e) => {
                const el = e.currentTarget as HTMLTextAreaElement
                setMessage(el.value)
                autoResize(el)
              }}
              onKeyDown={onKeyDown}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              class="text-sm py-4 pl-4 pr-12 outline-none border rounded-3xl bg-card/90 max-h-64 min-h-14 resize-none shadow-black/40 shadow-xl transition-colors duration-200 backdrop-blur-sm"
              classList={{
                'border-border/60 shadow-[0_0_0_1px_rgba(255,255,255,0.16)_inset]': focused(),
                'border-transparent': !focused(),
              }}
            />
          </TextField>
          <Button
            aria-label="Send"
            class="rounded-full bottom-2 right-2 absolute"
            size="icon"
            onClick={() => {
              void send()
            }}
            disabled={!message().trim().length || disabled()}
          >
            <span class="i-ph:arrow-up-bold size-5" />
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <Show
      when={position() === 'inline'}
      fallback={(
        <div class="pointer-events-none inset-x-0 bottom-3 fixed z-50">
          <div class="mx-auto px-3 max-w-3xl w-full">
            {inner}
          </div>
        </div>
      )}
    >
      <div class="mx-auto max-w-3xl w-full">
        {inner}
      </div>
    </Show>
  )
}

export default LLMInput
