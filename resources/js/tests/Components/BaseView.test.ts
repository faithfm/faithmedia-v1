import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import BaseView from '@/components/BaseView.vue'

// Mock dependencies
vi.mock('@/composables/useContentHelpers', () => ({
  useContentHelpers: () => ({
    getFileName: vi.fn((file) => file?.split('/').pop() || ''),
    getFilePath: vi.fn((file) => {
      if (!file) return ''
      const parts = file.split('/')
      parts.pop()
      return parts.join('/')
    }),
    formatDuration: vi.fn((seconds) => {
      if (!seconds) return '--:--'
      const mins = Math.floor(seconds / 60)
      const secs = Math.floor(seconds % 60)
      return `${mins}:${secs.toString().padStart(2, '0')}`
    }),
    getLastPathSegment: vi.fn((path) => path?.split('/').pop() || ''),
    highlightText: vi.fn((text) => text || ''),
    renderHtml: vi.fn((html) => ({ __html: html })),
    hasMatches: vi.fn(() => false),
    itemHasMatches: vi.fn(() => false),
    isSearchActive: { value: false }
  })
}))

vi.mock('@/composables/useRowSelection', () => ({
  useRowSelection: () => ({
    selectedRows: { value: new Set() },
    playingRow: { value: null },
    isSelected: vi.fn((id) => false),
    isPlaying: vi.fn((id) => false),
    handleRowSelect: vi.fn(),
    setPlayingRow: vi.fn(),
    clearSelection: vi.fn(),
    getSelectedRows: vi.fn(() => [])
  })
}))

vi.mock('@/composables/useFolderNavigation', () => ({
  useFolderNavigation: () => ({
    breadcrumbs: { value: [
      { label: 'Root', path: '', isLast: false },
      { label: 'folder1', path: 'folder1', isLast: true }
    ]},
    isRoot: { value: false },
    getParentPath: vi.fn(() => '')
  })
}))

// Mock content data
const mockContent = [
  {
    file: 'folder1/file1.mp3',
    series: 'Series 1',
    numbers: null,
    content: 'Content 1',
    guests: null,
    tags: 'tag1, tag2',
    bytes: 1024000,
    seconds: 180,
    md5: 'abc123',
    bestdate: '2023-01-01',
    podcastdate: null,
    source: 'source1',
    ref: null
  },
  {
    file: 'folder1/file2.mp3',
    series: 'Series 2',
    numbers: null,
    content: 'Content 2',
    guests: 'Guest 1',
    tags: 'tag2, tag3',
    bytes: 2048000,
    seconds: 240,
    md5: 'def456',
    bestdate: '2023-01-02',
    podcastdate: null,
    source: 'source1',
    ref: null
  }
]

// Mock folders
const mockFolders = ['folder1/subfolder1', 'folder1/subfolder2']

describe('BaseView.vue', () => {
  it('renders loading state correctly', () => {
    const wrapper = mount(BaseView, {
      props: {
        content: [],
        folders: [],
        mode: 'folder',
        isLoading: true,
        path: 'folder1'
      },
      global: {
        stubs: ['v-progress-circular', 'v-breadcrumbs', 'v-icon', 'v-btn', 'v-list', 'v-list-item', 'v-dialog', 'v-card', 'v-card-title', 'v-card-text']
      }
    })
    
    expect(wrapper.find('.d-flex.justify-center.align-center').exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'v-progress-circular' }).exists()).toBe(true)
  })

  it('renders folder mode correctly', async () => {
    const wrapper = mount(BaseView, {
      props: {
        content: mockContent,
        folders: mockFolders,
        mode: 'folder',
        isLoading: false,
        path: 'folder1'
      },
      global: {
        stubs: ['v-breadcrumbs', 'v-icon', 'v-btn', 'v-list', 'v-list-item', 'v-dialog', 'v-card', 'v-card-title', 'v-card-text']
      },
      slots: {
        default: `
          <template #default="{ content }">
            <div class="content-slot">
              <div v-for="item in content" :key="item.file" class="content-item">
                {{ item.file }}
              </div>
            </div>
          </template>
        `
      }
    })
    
    await nextTick()
    
    // Check breadcrumb exists in folder mode
    expect(wrapper.findComponent({ name: 'v-breadcrumbs' }).exists()).toBe(true)
    
    // Check folder list exists in folder mode
    expect(wrapper.findComponent({ name: 'v-list' }).exists()).toBe(true)
    
    // Check content is passed to slot
    expect(wrapper.find('.content-slot').exists()).toBe(true)
    expect(wrapper.findAll('.content-item').length).toBe(2)
    expect(wrapper.findAll('.content-item')[0].text()).toContain('folder1/file1.mp3')
  })

  it('renders search mode correctly', async () => {
    const wrapper = mount(BaseView, {
      props: {
        content: mockContent,
        folders: [],
        mode: 'search',
        isLoading: false,
        path: '',
        searchQuery: 'test query'
      },
      global: {
        stubs: ['v-breadcrumbs', 'v-icon', 'v-btn', 'v-list', 'v-list-item', 'v-dialog', 'v-card', 'v-card-title', 'v-card-text']
      },
      slots: {
        default: `
          <template #default="{ content }">
            <div class="content-slot">
              <div v-for="item in content" :key="item.file" class="content-item">
                {{ item.file }}
              </div>
            </div>
          </template>
        `
      }
    })
    
    await nextTick()
    
    // Breadcrumb should not exist in search mode
    expect(wrapper.findComponent({ name: 'v-breadcrumbs' }).exists()).toBe(false)
    
    // Folder list should not exist in search mode
    expect(wrapper.findComponent({ name: 'v-list' }).exists()).toBe(false)
    
    // Content should still be passed to slot
    expect(wrapper.find('.content-slot').exists()).toBe(true)
    expect(wrapper.findAll('.content-item').length).toBe(2)
  })

  it('emits navigate-folder event when navigating to parent', async () => {
    const wrapper = mount(BaseView, {
      props: {
        content: mockContent,
        folders: mockFolders,
        mode: 'folder',
        isLoading: false,
        path: 'folder1'
      },
      global: {
        stubs: ['v-breadcrumbs', 'v-icon', 'v-btn', 'v-list', 'v-list-item', 'v-dialog', 'v-card', 'v-card-title', 'v-card-text']
      }
    })
    
    // Find and click the parent folder button
    const parentButton = wrapper.findComponent({ name: 'v-btn' })
    await parentButton.trigger('click')
    
    // Check that navigate-folder event was emitted
    expect(wrapper.emitted('navigate-folder')).toBeTruthy()
    expect(wrapper.emitted('navigate-folder')![0]).toEqual([''])
  })

  it('emits navigate-folder event when clicking on a folder', async () => {
    const wrapper = mount(BaseView, {
      props: {
        content: mockContent,
        folders: mockFolders,
        mode: 'folder',
        isLoading: false,
        path: 'folder1'
      },
      global: {
        stubs: {
          'v-breadcrumbs': true,
          'v-icon': true,
          'v-btn': true,
          'v-list': true,
          'v-list-item': {
            template: '<div class="v-list-item" @click="$emit(\'click\')"><slot /></div>',
            props: ['title', 'prepend-icon']
          },
          'v-dialog': true,
          'v-card': true,
          'v-card-title': true,
          'v-card-text': true
        }
      }
    })
    
    // Find and click the first folder in the list
    const folderItem = wrapper.findAll('.v-list-item')[0]
    await folderItem.trigger('click')
    
    // Check that navigate-folder event was emitted
    expect(wrapper.emitted('navigate-folder')).toBeTruthy()
    expect(wrapper.emitted('navigate-folder')![0]).toEqual(['folder1/subfolder1'])
  })

  it('exposes selected items and methods', () => {
    const wrapper = mount(BaseView, {
      props: {
        content: mockContent,
        folders: mockFolders,
        mode: 'folder',
        isLoading: false,
        path: 'folder1'
      },
      global: {
        stubs: ['v-breadcrumbs', 'v-icon', 'v-btn', 'v-list', 'v-list-item', 'v-dialog', 'v-card', 'v-card-title', 'v-card-text']
      }
    })
    
    // Check that the component exposes the expected properties and methods
    expect(wrapper.vm.selectedItems).toBeDefined()
    expect(wrapper.vm.playingItem).toBeDefined()
    expect(wrapper.vm.isItemSelected).toBeDefined()
    expect(wrapper.vm.isItemPlaying).toBeDefined()
    expect(wrapper.vm.selectItem).toBeDefined()
    expect(wrapper.vm.showItemMenu).toBeDefined()
    expect(wrapper.vm.playItem).toBeDefined()
  })

  it('shows item menu when calling showItemMenu', async () => {
    const wrapper = mount(BaseView, {
      props: {
        content: mockContent,
        folders: mockFolders,
        mode: 'folder',
        isLoading: false,
        path: 'folder1'
      },
      global: {
        stubs: ['v-breadcrumbs', 'v-icon', 'v-btn', 'v-list', 'v-list-item', 'v-dialog', 'v-card', 'v-card-title', 'v-card-text']
      }
    })
    
    // Initially, the dialog should be hidden
    expect(wrapper.findComponent({ name: 'v-dialog' }).props('modelValue')).toBeFalsy()
    
    // Call showItemMenu
    wrapper.vm.showItemMenu(mockContent[0])
    await nextTick()
    
    // Now the dialog should be visible
    expect(wrapper.findComponent({ name: 'v-dialog' }).props('modelValue')).toBeTruthy()
  })

  it('emits play-item event when calling playItem', async () => {
    const wrapper = mount(BaseView, {
      props: {
        content: mockContent,
        folders: mockFolders,
        mode: 'folder',
        isLoading: false,
        path: 'folder1'
      },
      global: {
        stubs: ['v-breadcrumbs', 'v-icon', 'v-btn', 'v-list', 'v-list-item', 'v-dialog', 'v-card', 'v-card-title', 'v-card-text']
      }
    })
    
    // Call playItem
    wrapper.vm.playItem(mockContent[0])
    await nextTick()
    
    // Check that play-item event was emitted
    expect(wrapper.emitted('play-item')).toBeTruthy()
    expect(wrapper.emitted('play-item')![0][0]).toEqual(mockContent[0])
  })
})
