import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useViewManagement } from '@/composables/useViewManagement'
import { nextTick } from 'vue'

// Mock Vue's watch function
vi.mock('vue', async () => {
  const actual = await vi.importActual('vue')
  return {
    ...actual,
    watch: vi.fn((source, callback) => {
      // Store the callback to be manually triggered in tests
      watchCallback = callback
    }),
  }
})

// Store the watch callback to trigger it manually
let watchCallback: any = null

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString()
    }),
    clear: vi.fn(() => {
      store = {}
    })
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

describe('useViewManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.clear()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('initializes with default values for folder mode', () => {
    const viewManagement = useViewManagement('folder')
    
    expect(viewManagement.view.value).toBe('details')
    expect(viewManagement.sort.value).toBe('asc')
  })

  it('initializes with default values for search mode', () => {
    const viewManagement = useViewManagement('search')
    
    expect(viewManagement.view.value).toBe('playlist')
    expect(viewManagement.sort.value).toBe('asc')
  })

  it('loads preferences from localStorage if available', () => {
    // Set up mock localStorage with stored preferences
    const storedPrefs = {
      layout: 'playlist',
      sort: 'desc'
    }
    localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(storedPrefs))
    
    const viewManagement = useViewManagement('folder')
    
    expect(localStorageMock.getItem).toHaveBeenCalledWith('faithmedia_view_folder')
    expect(viewManagement.view.value).toBe('playlist')
    expect(viewManagement.sort.value).toBe('desc')
  })

  it('handles invalid JSON in localStorage', () => {
    // Set up mock localStorage with invalid JSON
    localStorageMock.getItem.mockReturnValueOnce('invalid-json')
    
    // Mock console.error to prevent test output pollution
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    const viewManagement = useViewManagement('folder')
    
    expect(consoleErrorSpy).toHaveBeenCalled()
    expect(viewManagement.view.value).toBe('details') // Should use default
    expect(viewManagement.sort.value).toBe('asc') // Should use default
    
    consoleErrorSpy.mockRestore()
  })

  it('updates layout correctly', async () => {
    const viewManagement = useViewManagement('folder')
    
    viewManagement.setLayout('playlist')
    
    // Manually trigger the watch callback
    if (watchCallback) {
      watchCallback(viewManagement.preferences.value)
      await nextTick()
    }
    
    expect(viewManagement.view.value).toBe('playlist')
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'faithmedia_view_folder',
      expect.any(String)
    )
  })

  it('updates sort correctly', async () => {
    const viewManagement = useViewManagement('folder')
    
    viewManagement.setSort('desc')
    
    // Manually trigger the watch callback
    if (watchCallback) {
      watchCallback(viewManagement.preferences.value)
      await nextTick()
    }
    
    expect(viewManagement.sort.value).toBe('desc')
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'faithmedia_view_folder',
      expect.any(String)
    )
  })

  it('resets to defaults correctly', async () => {
    const viewManagement = useViewManagement('folder')
    
    // First change values
    viewManagement.setLayout('playlist')
    viewManagement.setSort('desc')
    
    // Then reset
    viewManagement.resetToDefaults()
    
    // Manually trigger the watch callback
    if (watchCallback) {
      watchCallback(viewManagement.preferences.value)
      await nextTick()
    }
    
    expect(viewManagement.view.value).toBe('details')
    expect(viewManagement.sort.value).toBe('asc')
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'faithmedia_view_folder',
      expect.any(String)
    )
  })

  it('handles localStorage errors when saving', async () => {
    // Mock localStorage.setItem to throw an error
    localStorageMock.setItem.mockImplementationOnce(() => {
      throw new Error('Storage error')
    })
    
    // Mock console.error to prevent test output pollution
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    const viewManagement = useViewManagement('folder')
    viewManagement.setLayout('playlist')
    
    // Manually trigger the watch callback
    if (watchCallback) {
      watchCallback(viewManagement.preferences.value)
      await nextTick()
    }
    
    expect(consoleErrorSpy).toHaveBeenCalled()
    
    consoleErrorSpy.mockRestore()
  })

  it('uses different storage keys for different modes', async () => {
    // Reset watchCallback for this test
    watchCallback = null
    
    const folderViewManagement = useViewManagement('folder')
    
    // Manually trigger the watch callback for folder mode
    if (watchCallback) {
      folderViewManagement.setLayout('playlist')
      watchCallback(folderViewManagement.preferences.value)
      await nextTick()
    }
    
    // Reset watchCallback before creating search view management
    watchCallback = null
    
    const searchViewManagement = useViewManagement('search')
    
    // Manually trigger the watch callback for search mode
    if (watchCallback) {
      searchViewManagement.setLayout('details')
      watchCallback(searchViewManagement.preferences.value)
      await nextTick()
    }
    
    // Check that both storage keys were used
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'faithmedia_view_folder',
      expect.any(String)
    )
    
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      'faithmedia_view_search',
      expect.any(String)
    )
  })
})
