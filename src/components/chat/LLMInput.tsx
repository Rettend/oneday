import type { Component } from 'solid-js'
import { createSignal, For, onMount } from 'solid-js'
import { Button } from '~/components/ui/button'
import { TextField, TextFieldTextArea } from '~/components/ui/text-field'

interface LLMInputProps {
  placeholder?: string
  onSend?: (message: string) => void
}

export const LLMInput: Component<LLMInputProps> = (props) => {
  const [focused, setFocused] = createSignal(false)
  const [message, setMessage] = createSignal('')
  const [sending, setSending] = createSignal(false)

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

  function send() {
    const text = message().trim()
    if (!text || sending())
      return
    setSending(true)
    try {
      props.onSend?.(text)
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
      send()
    }
  }

  onMount(() => {
    textareaRef?.focus()
    scheduleResize()
  })

  const quickPrompts = [
    'Suggest more like these',
    'Make variants harder',
    'Focus on deep work',
    'Balance fun and difficulty',
  ]

  return (
    <div class="pointer-events-none inset-x-0 bottom-3 fixed z-50">
      <div class="mx-auto px-3 max-w-3xl w-full">
        <div
          class="rounded-2xl pointer-events-auto hover:scale-100"
          classList={{
            'bg-card/80 border border-border/80 backdrop-blur-xl scale-100': focused(),
            'bg-transparent scale-[0.98]': !focused(),
          }}
          style={{
            'margin-inline': 'auto',
            'width': focused() ? '100%' : '92%',
            'transition': 'width 260ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 200ms ease, transform 200ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <div class="p-3">
            <div
              class="flex flex-wrap gap-2 overflow-hidden"
              style={{
                'max-height': focused() ? '208px' : '0px',
                'opacity': focused() ? '1' : '0',
                'margin-bottom': focused() ? '0.5rem' : '0',
                'pointer-events': focused() ? 'auto' : 'none',
                'transition': 'max-height 240ms cubic-bezier(0.16, 1, 0.3, 1), opacity 180ms ease, margin-bottom 180ms ease',
              }}
            >
              <For each={quickPrompts}>
                {prompt => (
                  <button
                    type="button"
                    class="text-xs text-foreground/80 px-3 py-1 border border-border/70 rounded-full bg-background/60 transition-colors hover:bg-background"
                    onPointerDown={e => e.preventDefault()}
                    onClick={() => {
                      setMessage(prev => (prev ? `${prev} ${prompt}` : prompt))
                      textareaRef?.focus()
                      scheduleResize()
                    }}
                  >
                    {prompt}
                  </button>
                )}
              </For>
            </div>

            <div class="relative">
              <TextField>
                <TextFieldTextArea
                  ref={textareaRef}
                  rows={1}
                  value={message()}
                  placeholder={props.placeholder ?? 'Describe what kinds of achievements you want more of…'}
                  onInput={(e) => {
                    const el = e.currentTarget as HTMLTextAreaElement
                    setMessage(el.value)
                    autoResize(el)
                  }}
                  onKeyDown={onKeyDown}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  class="text-sm py-4 pl-4 pr-12 outline-none rounded-3xl max-h-64 min-h-14 resize-none shadow-black shadow-xl transition-colors duration-200"
                  classList={{
                    'bg-transparent border border-border/60 shadow-[0_0_0_1px_rgba(255,255,255,0.16)_inset]': focused(),
                    'bg-transparent border border-transparent': !focused(),
                  }}
                />
              </TextField>
              <Button
                aria-label="Send"
                class="rounded-full bottom-2 right-2 absolute"
                size="icon"
                onClick={send}
                disabled={!message().trim().length || sending()}
              >
                <span class="i-ph:arrow-up-bold size-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LLMInput
