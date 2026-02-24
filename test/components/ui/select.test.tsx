import { cleanup, fireEvent, render, screen } from '@solidjs/testing-library'
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

describe('Select Component', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders correctly', () => {
    render(() => (
      <Select
        options={['Apple', 'Banana', 'Blueberry', 'Grapes', 'Pineapple']}
        placeholder="Select a fruit…"
        itemComponent={props => <SelectItem item={props.item}>{props.item.rawValue}</SelectItem>}
      >
        <SelectTrigger aria-label="Fruit">
          <SelectValue<string>>{state => state.selectedOption()}</SelectValue>
        </SelectTrigger>
        <SelectContent />
      </Select>
    ))

    expect(screen.getByText('Select a fruit…')).toBeInTheDocument()
  })
})
