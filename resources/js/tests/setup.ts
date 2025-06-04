import { config } from '@vue/test-utils'
import { beforeAll, afterEach, vi } from 'vitest'

// Mock Inertia
beforeAll(() => {
  // Mock global objects that Inertia.js expects
  global.route = vi.fn((name, params) => {
    return `https://example.com/${name}/${JSON.stringify(params)}`
  })
  
  // Mock Inertia global object
  global.Inertia = {
    visit: vi.fn(),
    replace: vi.fn(),
    reload: vi.fn(),
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  }

  // Mock InertiaProgress
  global.InertiaProgress = {
    init: vi.fn(),
  }
})

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks()
})

// Add any global mocks or stubs here
config.global.mocks = {
  // Add any global Vue mocks here
}

// Add any global stubs here
config.global.stubs = {
  // Add any global Vue stubs here
}
