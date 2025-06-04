import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useRowSelection } from '@/composables/useRowSelection'

// Mock DOM elements for shift selection
const mockRowElements = (ids: string[]) => {
  // Clear any existing elements
  document.body.innerHTML = ''
  
  // Create mock row elements
  ids.forEach(id => {
    const div = document.createElement('div')
    div.setAttribute('data-row-id', id)
    document.body.appendChild(div)
  })
}

describe('useRowSelection', () => {
  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = ''
  })

  it('initializes with empty selection by default', () => {
    const { selectedRows, playingRow } = useRowSelection()
    
    expect(selectedRows.value.size).toBe(0)
    expect(playingRow.value).toBeNull()
  })

  it('initializes with provided initial selection', () => {
    const initialSelection = ['row1', 'row2']
    const { selectedRows, getSelectedRows } = useRowSelection({ initialSelection })
    
    expect(selectedRows.value.size).toBe(2)
    expect(selectedRows.value.has('row1')).toBe(true)
    expect(selectedRows.value.has('row2')).toBe(true)
    expect(getSelectedRows()).toEqual(expect.arrayContaining(initialSelection))
  })

  it('correctly identifies selected rows', () => {
    const { isSelected, handleRowSelect } = useRowSelection()
    
    handleRowSelect('row1')
    
    expect(isSelected('row1')).toBe(true)
    expect(isSelected('row2')).toBe(false)
  })

  it('correctly identifies playing row', () => {
    const { isPlaying, setPlayingRow } = useRowSelection()
    
    setPlayingRow('row1')
    
    expect(isPlaying('row1')).toBe(true)
    expect(isPlaying('row2')).toBe(false)
  })

  it('handles single row selection', () => {
    const { selectedRows, handleRowSelect } = useRowSelection()
    
    handleRowSelect('row1')
    expect(selectedRows.value.size).toBe(1)
    expect(selectedRows.value.has('row1')).toBe(true)
    
    // Selecting another row should replace the selection
    handleRowSelect('row2')
    expect(selectedRows.value.size).toBe(1)
    expect(selectedRows.value.has('row1')).toBe(false)
    expect(selectedRows.value.has('row2')).toBe(true)
  })

  it('handles Ctrl/Cmd key for toggling selection', () => {
    const { selectedRows, handleRowSelect } = useRowSelection()
    
    // First row (without modifier)
    handleRowSelect('row1')
    
    // Add second row with Ctrl
    handleRowSelect('row2', { ctrlKey: true } as MouseEvent)
    expect(selectedRows.value.size).toBe(2)
    expect(selectedRows.value.has('row1')).toBe(true)
    expect(selectedRows.value.has('row2')).toBe(true)
    
    // Toggle first row off with Ctrl
    handleRowSelect('row1', { ctrlKey: true } as MouseEvent)
    expect(selectedRows.value.size).toBe(1)
    expect(selectedRows.value.has('row1')).toBe(false)
    expect(selectedRows.value.has('row2')).toBe(true)
    
    // Test with metaKey (for Mac)
    handleRowSelect('row3', { metaKey: true } as MouseEvent)
    expect(selectedRows.value.size).toBe(2)
    expect(selectedRows.value.has('row2')).toBe(true)
    expect(selectedRows.value.has('row3')).toBe(true)
  })

  it('handles Shift key for range selection', () => {
    // Set up mock DOM
    const rowIds = ['row1', 'row2', 'row3', 'row4', 'row5']
    mockRowElements(rowIds)
    
    const { selectedRows, handleRowSelect } = useRowSelection()
    
    // Select first row
    handleRowSelect('row1')
    expect(selectedRows.value.size).toBe(1)
    
    // Shift-select to row3 (should select row1, row2, row3)
    handleRowSelect('row3', { shiftKey: true } as MouseEvent)
    expect(selectedRows.value.size).toBe(3)
    expect(selectedRows.value.has('row1')).toBe(true)
    expect(selectedRows.value.has('row2')).toBe(true)
    expect(selectedRows.value.has('row3')).toBe(true)
    
    // Now select row5
    handleRowSelect('row5')
    expect(selectedRows.value.size).toBe(1)
    
    // Shift-select to row3 (should select row3, row4, row5)
    handleRowSelect('row3', { shiftKey: true } as MouseEvent)
    expect(selectedRows.value.size).toBe(3)
    expect(selectedRows.value.has('row3')).toBe(true)
    expect(selectedRows.value.has('row4')).toBe(true)
    expect(selectedRows.value.has('row5')).toBe(true)
  })

  it('clears selection', () => {
    const { selectedRows, handleRowSelect, clearSelection } = useRowSelection()
    
    // Select multiple rows
    handleRowSelect('row1')
    handleRowSelect('row2', { ctrlKey: true } as MouseEvent)
    expect(selectedRows.value.size).toBe(2)
    
    // Clear selection
    clearSelection()
    expect(selectedRows.value.size).toBe(0)
  })

  it('calls onSelectionChange callback when selection changes', () => {
    const onSelectionChange = vi.fn()
    const { handleRowSelect, clearSelection } = useRowSelection({ onSelectionChange })
    
    // Select a row
    handleRowSelect('row1')
    expect(onSelectionChange).toHaveBeenCalledWith(['row1'])
    
    // Add another row
    handleRowSelect('row2', { ctrlKey: true } as MouseEvent)
    expect(onSelectionChange).toHaveBeenCalledWith(expect.arrayContaining(['row1', 'row2']))
    
    // Clear selection
    clearSelection()
    expect(onSelectionChange).toHaveBeenCalledWith([])
  })

  it('returns selected rows as array', () => {
    const { handleRowSelect, getSelectedRows } = useRowSelection()
    
    handleRowSelect('row1')
    handleRowSelect('row2', { ctrlKey: true } as MouseEvent)
    
    const selectedRows = getSelectedRows()
    expect(selectedRows).toHaveLength(2)
    expect(selectedRows).toEqual(expect.arrayContaining(['row1', 'row2']))
  })
})
