import { describe, expect, test } from 'bun:test'
import { render, screen } from '@solidjs/testing-library'
import { Button } from '~/components/ui/button'

describe('Button', () => {
  test('renders with default variant and size', () => {
    render(() => <Button>Click me</Button>)
    const button = screen.getByRole('button', { name: 'Click me' })
    expect(button).toBeInTheDocument()
    expect(button).toHaveTextContent('Click me')
  })

  test('renders with custom text', () => {
    render(() => <Button>Save changes</Button>)
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeInTheDocument()
  })

  test('applies variant classes', () => {
    render(() => <Button variant="outline">Outlined</Button>)
    const button = screen.getByRole('button', { name: 'Outlined' })
    // outline variant should include border classes
    expect(button.className).toContain('border')
  })

  test('applies size classes', () => {
    render(() => <Button size="sm">Small</Button>)
    const button = screen.getByRole('button', { name: 'Small' })
    expect(button.className).toContain('h-9')
  })

  test('applies size icon classes', () => {
    render(() => <Button size="icon" aria-label="Icon button">🔍</Button>)
    const button = screen.getByRole('button', { name: 'Icon button' })
    expect(button.className).toContain('size-10')
  })

  test('merges custom class with variant classes', () => {
    render(() => <Button class="my-custom-class">Styled</Button>)
    const button = screen.getByRole('button', { name: 'Styled' })
    expect(button.className).toContain('my-custom-class')
  })

  test('passes through disabled state', () => {
    render(() => <Button disabled>Disabled</Button>)
    const button = screen.getByRole('button', { name: 'Disabled' })
    expect(button).toBeDisabled()
  })

  test('is not disabled by default', () => {
    render(() => <Button>Enabled</Button>)
    const button = screen.getByRole('button', { name: 'Enabled' })
    expect(button).not.toBeDisabled()
  })

  test('renders children elements', () => {
    render(() => (
      <Button>
        <span data-testid="icon">★</span>
        Label
      </Button>
    ))
    expect(screen.getByTestId('icon')).toBeInTheDocument()
    expect(screen.getByRole('button')).toHaveTextContent('Label')
  })

  test('applies ghost variant', () => {
    render(() => <Button variant="ghost">Ghost</Button>)
    const button = screen.getByRole('button', { name: 'Ghost' })
    // ghost variant should NOT include border or bg-primary
    expect(button.className).not.toContain('bg-primary')
    expect(button.className).not.toContain('border')
  })

  test('applies destructive variant', () => {
    render(() => <Button variant="destructive">Delete</Button>)
    const button = screen.getByRole('button', { name: 'Delete' })
    expect(button.className).toContain('bg-destructive')
  })
})
