import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useContentState } from '@/composables/useContentState'
import { normalizeUrlParams, createUrl } from '@/utils/urlUtils'
import { nextTick } from 'vue'

// Mock dependencies
vi.mock('@inertiajs/vue3', () => ({
  router: {
    get: vi.fn()
  }
}))

vi.mock('@/utils/urlUtils', () => ({
  normalizeUrlParams: vi.fn((params) => params),
  createUrl: vi.fn((path, params) => `${path}?mocked-url-with-params`)
}))

vi.mock('@/composables/useViewManagement', () => ({
  useViewManagement: vi.fn(() => ({
    view: { value: 'details' },
    sort: { value: 'asc' },
    setLayout: vi.fn(),
    setSort: vi.fn(),
    resetToDefaults: vi.fn()
  }))
}))

// Mock the useDebounce composable
vi.mock('@/composables/useDebounce', () => ({
  useDebouncedRef: vi.fn((value) => ({
    value
  }))
}))

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

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    pathname: '/content'
  },
  writable: true
})

describe('useContentState', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.clear()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  it('initializes with default values when no initial state is provided', () => {
    const { state } = useContentState()
    
    expect(state.value).toEqual({
      path: '',
      prefilter: '',
      search: '',
      sort: 'asc',
      layout: 'details'
    })
  })

  it('initializes with provided initial state', () => {
    const initialState = {
      path: 'test/path',
      search: 'test query',
      sort: 'desc' as const
    }
    
    const { state } = useContentState(initialState)
    
    expect(state.value).toEqual({
      path: 'test/path',
      prefilter: '',
      search: 'test query',
      sort: 'desc',
      layout: 'details'
    })
    
    expect(normalizeUrlParams).toHaveBeenCalledWith(initialState)
  })

  it('computes mode based on search presence', () => {
    // Test folder mode (no search)
    const folderState = useContentState()
    expect(folderState.mode.value).toBe('folder')
    
    // Test search mode
    const searchState = useContentState({ search: 'test query' })
    expect(searchState.mode.value).toBe('search')
  })

  it('updates path correctly', () => {
    const { state, setPath } = useContentState()
    
    setPath('new/path')
    
    expect(normalizeUrlParams).toHaveBeenCalledWith({ path: 'new/path' })
    expect(state.value.path).toBe('new/path')
  })

  it('updates prefilter correctly', () => {
    const { state, setPrefilter } = useContentState()
    
    setPrefilter('audio')
    
    expect(normalizeUrlParams).toHaveBeenCalledWith({ prefilter: 'audio' })
    expect(state.value.prefilter).toBe('audio')
  })

  it('updates search correctly', () => {
    const { state, setSearch } = useContentState()
    
    setSearch('test query')
    
    expect(normalizeUrlParams).toHaveBeenCalledWith({ search: 'test query' })
    expect(state.value.search).toBe('test query')
    // We're not testing debouncedSearch.value here because it's mocked
  })

  it('updates sort correctly', () => {
    const { state, setSort } = useContentState()
    
    setSort('desc')
    
    expect(state.value.sort).toBe('desc')
  })

  it('updates layout correctly', () => {
    const { state, setLayout } = useContentState()
    
    setLayout('playlist')
    
    expect(state.value.layout).toBe('playlist')
  })

  it('resets state to defaults while preserving mode-specific preferences', () => {
    const { state, resetState } = useContentState({
      path: 'test/path',
      prefilter: 'audio',
      search: 'test query',
      sort: 'desc' as const,
      layout: 'playlist' as const
    })
    
    resetState()
    
    expect(state.value).toEqual({
      path: '',
      prefilter: '',
      search: '',
      sort: 'asc',
      layout: 'details'
    })
  })

  it('syncs state changes with URL', async () => {
    const { router } = await import('@inertiajs/vue3')
    const { state } = useContentState()
    
    // Update state to trigger URL sync
    state.value.path = 'new/path'
    
    // Wait for the next tick to allow watchers to run
    await nextTick()
    
    expect(createUrl).toHaveBeenCalled()
    expect(router.get).toHaveBeenCalledWith(
      expect.any(String),
      {},
      {
        preserveState: true,
        preserveScroll: true,
        replace: true
      }
    )
  })
})
