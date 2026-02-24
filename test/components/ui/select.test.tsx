import { cleanup, fireEvent, render, screen, waitFor } from '@solidjs/testing-library'
import { afterEach, describe, expect, it } from 'bun:test'
import {
  Select,
  SelectContent,
  SelectDescription,
  SelectErrorMessage,
  SelectHiddenSelect,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'

const FRUITS = ['Apple', 'Banana', 'Blueberry', 'Grapes', 'Pineapple']

describe('Select Component', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders trigger correctly', () => {
    render(() => (
      <Select
        options={FRUITS}
        placeholder="Select a fruit…"
        itemComponent={(props) => <SelectItem item={props.item}>{props.item.rawValue}</SelectItem>}
      >
        <SelectTrigger aria-label="Fruit" data-testid="select-trigger">
          <SelectValue<string>>{(state) => state.selectedOption()}</SelectValue>
        </SelectTrigger>
        <SelectContent />
      </Select>
    ))

    const trigger = screen.getByTestId('select-trigger')
    expect(trigger).toBeInTheDocument()
    expect(screen.getByText('Select a fruit…')).toBeInTheDocument()
  })

  it('opens content and shows items on click', async () => {
    render(() => (
      <Select
        options={FRUITS}
        placeholder="Select a fruit…"
        itemComponent={(props) => <SelectItem item={props.item}>{props.item.rawValue}</SelectItem>}
      >
        <SelectTrigger aria-label="Fruit" data-testid="select-trigger">
          <SelectValue<string>>{(state) => state.selectedOption()}</SelectValue>
        </SelectTrigger>
        <SelectContent />
      </Select>
    ))

    const trigger = screen.getByTestId('select-trigger')
    
    expect(screen.queryByRole('option', { name: 'Apple' })).not.toBeInTheDocument()

    fireEvent.click(trigger)

    const listbox = await screen.findByRole('listbox')
    expect(listbox).toBeInTheDocument()

    const options = screen.getAllByRole('option')
    expect(options).toHaveLength(FRUITS.length)
    expect(screen.getByRole('option', { name: 'Apple' })).toBeInTheDocument()
  })

  it('selects an item and updates value', async () => {
    let selectedValue = ''
    render(() => (
      <Select
        options={FRUITS}
        placeholder="Select a fruit…"
        onChange={(val) => selectedValue = val || ''}
        itemComponent={(props) => <SelectItem item={props.item}>{props.item.rawValue}</SelectItem>}
      >
        <SelectTrigger aria-label="Fruit" data-testid="select-trigger">
          <SelectValue<string>>{(state) => state.selectedOption()}</SelectValue>
        </SelectTrigger>
        <SelectContent />
      </Select>
    ))

    const trigger = screen.getByTestId('select-trigger')
    fireEvent.click(trigger)

    const bananaOption = await screen.findByRole('option', { name: 'Banana' })
    fireEvent.click(bananaOption)

    await waitFor(() => {
      expect(selectedValue).toBe('Banana')
    })
    expect(trigger).toHaveTextContent('Banana')
  })

  it('supports disabled state', () => {
    render(() => (
      <Select
        disabled
        options={FRUITS}
        placeholder="Select a fruit…"
        itemComponent={(props) => <SelectItem item={props.item}>{props.item.rawValue}</SelectItem>}
      >
        <SelectTrigger aria-label="Fruit" data-testid="select-trigger">
          <SelectValue<string>>{(state) => state.selectedOption()}</SelectValue>
        </SelectTrigger>
        <SelectContent />
      </Select>
    ))

    const trigger = screen.getByTestId('select-trigger')
    expect(trigger).toBeDisabled()
  })

  it('renders label, description, and error message', () => {
    render(() => (
      <Select
        options={FRUITS}
        validationState="invalid"
        itemComponent={(props) => <SelectItem item={props.item}>{props.item.rawValue}</SelectItem>}
      >
        <SelectLabel>Fruit Label</SelectLabel>
        <SelectTrigger aria-label="Fruit" data-testid="select-trigger">
          <SelectValue<string>>{(state) => state.selectedOption()}</SelectValue>
        </SelectTrigger>
        <SelectContent />
        <SelectDescription>Choose a fruit from the list</SelectDescription>
        <SelectErrorMessage>Please select a valid fruit</SelectErrorMessage>
      </Select>
    ))

    expect(screen.getByText('Fruit Label')).toBeInTheDocument()
    expect(screen.getByText('Choose a fruit from the list')).toBeInTheDocument()
    expect(screen.getByText('Please select a valid fruit')).toBeInTheDocument()
    
    const errorMsg = screen.getByText('Please select a valid fruit')
    expect(errorMsg).toHaveClass('text-destructive')
    
    const desc = screen.getByText('Choose a fruit from the list')
    expect(desc).toHaveClass('text-muted-foreground')
  })

  it('applies custom classes to components', async () => {
    render(() => (
      <Select
        options={FRUITS}
        itemComponent={(props) => (
          <SelectItem item={props.item} class="custom-item">
            {props.item.rawValue}
          </SelectItem>
        )}
      >
        <SelectLabel class="custom-label">Fruit Label</SelectLabel>
        <SelectTrigger class="custom-trigger" aria-label="Fruit" data-testid="select-trigger">
          <SelectValue<string>>{(state) => state.selectedOption()}</SelectValue>
        </SelectTrigger>
        <SelectContent class="custom-content" />
        <SelectDescription class="custom-desc">Description</SelectDescription>
        <SelectErrorMessage class="custom-error">Error</SelectErrorMessage>
      </Select>
    ))

    expect(screen.getByText('Fruit Label')).toHaveClass('custom-label')
    expect(screen.getByTestId('select-trigger')).toHaveClass('custom-trigger')
    expect(screen.getByText('Description')).toHaveClass('custom-desc')
    expect(screen.getByText('Error')).toHaveClass('custom-error')

    const trigger = screen.getByTestId('select-trigger')
    fireEvent.click(trigger)

    const listbox = await screen.findByRole('listbox')
    // SelectPrimitive.Content is a parent of listbox.
    expect(document.querySelector('.custom-content')).toBeInTheDocument()
    
    const options = screen.getAllByRole('option')
    expect(options[0]).toHaveClass('custom-item')
  })

  it('renders hidden select for forms', () => {
    const { container } = render(() => (
      <Select
        name="fruit-select"
        value="Apple"
        options={FRUITS}
        itemComponent={(props) => <SelectItem item={props.item}>{props.item.rawValue}</SelectItem>}
      >
        <SelectHiddenSelect />
        <SelectTrigger aria-label="Fruit" data-testid="select-trigger">
          <SelectValue<string>>{(state) => state.selectedOption()}</SelectValue>
        </SelectTrigger>
        <SelectContent />
      </Select>
    ))

    const hiddenSelect = container.querySelector('select[name="fruit-select"]')
    expect(hiddenSelect).toBeInTheDocument()
    expect(hiddenSelect?.innerHTML).toContain('<option value="Apple">Apple</option>')
  })
})
