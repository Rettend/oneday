import type { Component } from 'solid-js'
import { splitProps } from 'solid-js'

interface ApiKeyInputProps {
  placeholder?: string
  value: string
  onInput: (next: string) => void
  onBlurSave: (next: string) => void | Promise<void>
  disabled?: boolean
  class?: string
}

export const ApiKeyInput: Component<ApiKeyInputProps> = (props) => {
  const [local, rest] = splitProps(props, [
    'placeholder',
    'value',
    'onInput',
    'onBlurSave',
    'disabled',
    'class',
  ])

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      void local.onBlurSave(local.value)
    }
  }

  return (
    <input
      type="password"
      autocomplete="off"
      placeholder={local.placeholder}
      class={`text-xs px-3 py-1.5 border border-input rounded-md bg-background flex h-9 w-full focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/60 ${local.class ?? ''}`}
      value={local.value}
      onInput={e => local.onInput(e.currentTarget.value)}
      onBlur={() => { void local.onBlurSave(local.value) }}
      onKeyDown={handleKeyDown}
      disabled={local.disabled}
      {...rest}
    />
  )
}

export default ApiKeyInput
