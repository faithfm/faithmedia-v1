import { mount as vtuMount, shallowMount as vtuShallowMount } from '@vue/test-utils'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { vi } from 'vitest'

// Create Vuetify instance for testing
export const vuetify = createVuetify({
  components,
  directives,
})

// Helper for mounting components with Vuetify and Inertia
export function mount(component: any, options: any = {}) {
  return vtuMount(component, {
    global: {
      plugins: [vuetify],
      mocks: {
        // Mock Inertia and Laravel-specific globals
        $inertia: {
          visit: vi.fn(),
          replace: vi.fn(),
        },
        route: vi.fn(),
        ...options?.global?.mocks,
      },
      stubs: {
        // Stub out complex components if needed
        ...options?.global?.stubs,
      },
      ...options?.global,
    },
    ...options,
  })
}

// Helper for shallow mounting components with Vuetify
export function shallowMount(component: any, options: any = {}) {
  return vtuShallowMount(component, {
    global: {
      plugins: [vuetify],
      mocks: {
        // Mock Inertia and Laravel-specific globals
        $inertia: {
          visit: vi.fn(),
          replace: vi.fn(),
        },
        route: vi.fn(),
        ...options?.global?.mocks,
      },
      stubs: {
        // Stub out complex components if needed
        ...options?.global?.stubs,
      },
      ...options?.global,
    },
    ...options,
  })
}

// Mock Inertia page object
export function mockInertiaPage(component = 'Test', props = {}) {
  return {
    component,
    props,
    url: '',
    version: '',
    scrollRegions: [],
    rememberedState: {},
  }
}
