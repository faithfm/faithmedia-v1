import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '../Setup/VueTestSetup'
import { nextTick } from 'vue'
import PlaylistView from '@/components/PlaylistView.vue'

// Mock BaseView component
vi.mock('@/components/BaseView.vue', () => ({
  default: {
    name: 'BaseLayout',
    props: {
      content: { type: Array, required: true },
      folders: { type: Array, required: true },
      mode: { type: String, required: true },
      isLoading: { type: Boolean, default: false },
      path: { type: String, default: '' },
      searchQuery: { type: String, default: '' }
    },
    template: `
      <div class="base-layout">
        <slot :content="content" 
              :isSelected="() => false" 
              :isPlaying="() => false" 
              :onItemSelect="(item, event) => $emit('select-item', item)" 
              :onItemMenu="(item) => $emit('show-details', item)"
              :onPlayItem="(item) => $emit('play-item', item)"
              :getFileName="(file) => file?.split('/').pop() || ''"
              :getFilePath="(file) => file ? file.split('/').slice(0, -1).join('/') : ''"
              :formatDuration="(seconds) => seconds ? \`\${Math.floor(seconds / 60)}:\${Math.floor(seconds % 60).toString().padStart(2, '0')}\` : '--:--'"
              :highlightText="(text) => text || ''"
              :renderHtml="(html) => ({ __html: html })"
              :itemHasMatches="() => false">
        </slot>
      </div>
    `,
    emits: ['navigate-folder', 'select-item', 'play-item', 'show-details', 'download-item']
  }
}))

// Mock useContentHelpers composable
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

// Mock content data
const mockContent = {
  items: [
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
    },
    {
      file: 'folder1/subfolder/file3.mp3',
      series: 'Series 3',
      numbers: null,
      content: 'Content 3',
      guests: 'Guest 2',
      tags: 'tag3, tag4',
      bytes: 3072000,
      seconds: 300,
      md5: 'ghi789',
      bestdate: '2023-01-03',
      podcastdate: null,
      source: 'source1',
      ref: null
    }
  ],
  nextCursor: 'cursor123',
  hasMore: true
}

// Mock folders
const mockFolders = ['folder1/subfolder1', 'folder1/subfolder2']

describe('PlaylistView.vue', () => {
  it('renders correctly in folder mode', async () => {
    const wrapper = mount(PlaylistView, {
      props: {
        content: mockContent,
        folders: mockFolders,
        mode: 'folder',
        isLoading: false,
        path: 'folder1'
      },
      global: {
        stubs: {
          'v-row': true,
          'v-col': true,
          'v-card': true,
          'v-card-title': true,
          'v-card-subtitle': true,
          'v-card-text': true,
          'v-card-actions': true,
          'v-btn': true,
          'v-chip': true
        }
      }
    })
    
    // Check that BaseLayout is rendered with correct props
    expect(wrapper.findComponent({ name: 'BaseLayout' }).exists()).toBe(true)
    expect(wrapper.findComponent({ name: 'BaseLayout' }).props('content')).toEqual(mockContent.items)
    expect(wrapper.findComponent({ name: 'BaseLayout' }).props('folders')).toEqual(mockFolders)
    expect(wrapper.findComponent({ name: 'BaseLayout' }).props('mode')).toBe('folder')
    expect(wrapper.findComponent({ name: 'BaseLayout' }).props('path')).toBe('folder1')
    
    // Check that card grid is rendered
    expect(wrapper.find('.card-grid').exists()).toBe(true)
    
    // Check that we have the right number of cards
    expect(wrapper.findAllComponents({ name: 'v-card' }).length).toBe(mockContent.items.length)
  })
  
  it('renders correctly in search mode', async () => {
    const wrapper = mount(PlaylistView, {
      props: {
        content: mockContent,
        folders: [],
        mode: 'search',
        isLoading: false,
        path: '',
        searchQuery: 'test query'
      },
      global: {
        stubs: {
          'v-row': true,
          'v-col': true,
          'v-card': true,
          'v-card-title': true,
          'v-card-subtitle': true,
          'v-card-text': true,
          'v-card-actions': true,
          'v-btn': true,
          'v-chip': true
        }
      }
    })
    
    // In search mode, path information should be visible
    const cardTexts = wrapper.findAllComponents({ name: 'v-card-text' })
    expect(cardTexts.length).toBe(mockContent.items.length)
    
    // Check that the subfolder chip is not shown for items in the current folder
    const chips = wrapper.findAllComponents({ name: 'v-chip' })
    expect(chips.length).toBe(1) // Only one item is from a subfolder
  })
  
  it('tests subfolder detection logic', () => {
    // Create a function to test isFromSubfolder logic
    const isFromSubfolder = (item: any, path: string) => {
      if (!path) return false
      
      const itemPath = item.file.split('/')
      itemPath.pop() // Remove filename
      const itemFolder = itemPath.join('/')
      
      return itemFolder !== path
    }
    
    // Test the subfolder logic
    expect(isFromSubfolder(mockContent.items[0], 'folder1')).toBe(false) // folder1/file1.mp3
    expect(isFromSubfolder(mockContent.items[2], 'folder1')).toBe(true)  // folder1/subfolder/file3.mp3
  })
  
  it('emits events correctly', async () => {
    const wrapper = mount(PlaylistView, {
      props: {
        content: mockContent,
        folders: mockFolders,
        mode: 'folder',
        isLoading: false,
        path: 'folder1'
      },
      global: {
        stubs: {
          'v-row': true,
          'v-col': true,
          'v-card': true,
          'v-card-title': true,
          'v-card-subtitle': true,
          'v-card-text': true,
          'v-card-actions': true,
          'v-btn': true,
          'v-chip': true
        }
      }
    })
    
    // Simulate BaseLayout emitting events
    wrapper.findComponent({ name: 'BaseLayout' }).vm.$emit('navigate-folder', 'folder1/subfolder1')
    wrapper.findComponent({ name: 'BaseLayout' }).vm.$emit('select-item', mockContent.items[0])
    wrapper.findComponent({ name: 'BaseLayout' }).vm.$emit('play-item', mockContent.items[0])
    wrapper.findComponent({ name: 'BaseLayout' }).vm.$emit('show-details', mockContent.items[0])
    wrapper.findComponent({ name: 'BaseLayout' }).vm.$emit('download-item', mockContent.items[0])
    
    await nextTick()
    
    // Check that PlaylistView re-emits these events
    expect(wrapper.emitted('navigate-folder')).toBeTruthy()
    expect(wrapper.emitted('navigate-folder')![0]).toEqual(['folder1/subfolder1'])
    
    expect(wrapper.emitted('select-item')).toBeTruthy()
    expect(wrapper.emitted('select-item')![0]).toEqual([mockContent.items[0]])
    
    expect(wrapper.emitted('play-item')).toBeTruthy()
    expect(wrapper.emitted('play-item')![0]).toEqual([mockContent.items[0]])
    
    expect(wrapper.emitted('show-details')).toBeTruthy()
    expect(wrapper.emitted('show-details')![0]).toEqual([mockContent.items[0]])
    
    expect(wrapper.emitted('download-item')).toBeTruthy()
    expect(wrapper.emitted('download-item')![0]).toEqual([mockContent.items[0]])
  })
  
  it('renders item metadata correctly', async () => {
    const wrapper = mount(PlaylistView, {
      props: {
        content: {
          items: [mockContent.items[1]], // Use the item with all metadata fields
          nextCursor: null,
          hasMore: false
        },
        folders: [],
        mode: 'folder',
        isLoading: false,
        path: 'folder1'
      },
      global: {
        stubs: {
          'v-row': {
            template: '<div class="v-row"><slot /></div>'
          },
          'v-col': {
            template: '<div class="v-col"><slot /></div>'
          },
          'v-card': {
            template: '<div class="v-card"><slot /></div>'
          },
          'v-card-title': {
            template: '<div class="v-card-title"><slot /></div>'
          },
          'v-card-subtitle': {
            template: '<div class="v-card-subtitle"><slot /></div>'
          },
          'v-card-text': {
            template: '<div class="v-card-text"><slot /></div>'
          },
          'v-card-actions': {
            template: '<div class="v-card-actions"><slot /></div>'
          },
          'v-btn': {
            props: ['icon'],
            template: '<button class="v-btn" :data-icon="icon"><slot /></button>'
          },
          'v-chip': true
        }
      }
    })
    
    // Check that the card title contains the filename
    expect(wrapper.find('.v-card-title').text()).toContain('file2.mp3')
    
    // Check that the card subtitle contains the series
    expect(wrapper.find('.v-card-subtitle').text()).toContain('Series 2')
    
    // Check that the card text contains the content
    expect(wrapper.find('.v-card-text').text()).toContain('Content 2')
    
    // Check that the card text contains the guests
    expect(wrapper.find('.v-card-text').text()).toContain('Guests:')
    expect(wrapper.find('.v-card-text').text()).toContain('Guest 1')
    
    // Check that the card text contains the tags
    expect(wrapper.find('.v-card-text').text()).toContain('Tags:')
    expect(wrapper.find('.v-card-text').text()).toContain('tag2, tag3')
    
    // Check that the card text contains the duration
    expect(wrapper.find('.v-card-text').text()).toContain('Duration:')
    expect(wrapper.find('.v-card-text').text()).toContain('4:00')
    
    // Check that the card has play and menu buttons
    const buttons = wrapper.findAll('.v-btn')
    expect(buttons.length).toBe(2)
    expect(buttons[0].attributes('data-icon')).toBe('mdi-play')
    expect(buttons[1].attributes('data-icon')).toBe('mdi-dots-vertical')
  })
})
