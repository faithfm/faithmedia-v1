import { ref, computed } from 'vue'
import type { Ref } from 'vue'

interface RowSelectionOptions {
  /**
   * Optional initial selection
   */
  initialSelection?: string[]
  /**
   * Optional callback when selection changes
   */
  onSelectionChange?: (selection: string[]) => void
}

export interface UseRowSelection {
  // Selected row IDs
  selectedRows: Ref<Set<string>>
  // Currently playing row ID
  playingRow: Ref<string | null>
  // Computed to check if a row is selected
  isSelected: (id: string) => boolean
  // Computed to check if a row is playing
  isPlaying: (id: string) => boolean
  // Handle row selection
  handleRowSelect: (id: string, event?: MouseEvent) => void
  // Set playing row
  setPlayingRow: (id: string | null) => void
  // Clear selection
  clearSelection: () => void
  // Get selected rows as array
  getSelectedRows: () => string[]
}

export function useRowSelection(options: RowSelectionOptions = {}): UseRowSelection {
  // State
  const selectedRows = ref<Set<string>>(new Set(options.initialSelection))
  const playingRow = ref<string | null>(null)
  const lastSelectedRow = ref<string | null>(null)

  // Methods
  const isSelected = (id: string): boolean => selectedRows.value.has(id)
  const isPlaying = (id: string): boolean => playingRow.value === id

  const handleRowSelect = (id: string, event?: MouseEvent): void => {
    if (!event) {
      // Simple single selection without modifiers
      selectedRows.value = new Set([id])
      lastSelectedRow.value = id
    } else {
      if (event.ctrlKey || event.metaKey) {
        // Toggle selection with Ctrl/Cmd
        const newSelection = new Set(selectedRows.value)
        if (newSelection.has(id)) {
          newSelection.delete(id)
        } else {
          newSelection.add(id)
        }
        selectedRows.value = newSelection
        lastSelectedRow.value = id
      } else if (event.shiftKey && lastSelectedRow.value) {
        // Range selection with Shift
        const allIds = Array.from(document.querySelectorAll('[data-row-id]'))
          .map(el => el.getAttribute('data-row-id'))
          .filter((id): id is string => id !== null)

        const startIdx = allIds.indexOf(lastSelectedRow.value)
        const endIdx = allIds.indexOf(id)
        
        if (startIdx !== -1 && endIdx !== -1) {
          const start = Math.min(startIdx, endIdx)
          const end = Math.max(startIdx, endIdx)
          const rangeIds = allIds.slice(start, end + 1)
          selectedRows.value = new Set(rangeIds)
        }
      } else {
        // Simple single selection
        selectedRows.value = new Set([id])
        lastSelectedRow.value = id
      }
    }

    // Notify of selection change if callback provided
    if (options.onSelectionChange) {
      options.onSelectionChange(Array.from(selectedRows.value))
    }
  }

  const setPlayingRow = (id: string | null): void => {
    playingRow.value = id
  }

  const clearSelection = (): void => {
    selectedRows.value.clear()
    lastSelectedRow.value = null
    if (options.onSelectionChange) {
      options.onSelectionChange([])
    }
  }

  const getSelectedRows = (): string[] => {
    return Array.from(selectedRows.value)
  }

  return {
    selectedRows,
    playingRow,
    isSelected,
    isPlaying,
    handleRowSelect,
    setPlayingRow,
    clearSelection,
    getSelectedRows
  }
}
