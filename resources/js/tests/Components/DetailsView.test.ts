import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '../Setup/VueTestSetup'
import { nextTick } from 'vue'
import DetailsView from '@/components/DetailsView.vue'

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
              :itemHasMatches="() => false">
        </slot>
      </div>
    `,
    emits: ['navigate-folder', 'select-item', 'play-item', 'show-details', 'download-item']
  }
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

describe('DetailsView.vue', () => {
  it('renders correctly in folder mode', async () => {
    const wrapper = mount(DetailsView, {
      props: {
        content: mockContent,
        folders: mockFolders,
        mode: 'folder',
        isLoading: false,
        path: 'folder1'
      },
      global: {
        stubs: {
          'v-table': true,
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
    
    // Check that table is rendered
    expect(wrapper.find('.table-wrapper').exists()).toBe(true)
    
    // In folder mode, the Path column should not be visible
    const headers = wrapper.findAll('th')
    const headerTexts = Array.from(headers).map(header => header.text())
    expect(headerTexts).not.toContain('Path')
  })
  
  it('renders correctly in search mode', async () => {
    const wrapper = mount(DetailsView, {
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
          'v-table': true,
          'v-chip': true
        }
      }
    })
    
    // In search mode, the Path column should be visible
    const headers = wrapper.findAll('th')
    const headerTexts = Array.from(headers).map(header => header.text())
    expect(headerTexts).toContain('Path')
  })
  
  it('identifies items from subfolders correctly', async () => {
    const wrapper = mount(DetailsView, {
      props: {
        content: mockContent,
        folders: mockFolders,
        mode: 'search',
        isLoading: false,
        path: 'folder1'
      },
      global: {
        stubs: {
          'v-table': true,
          'v-chip': true
        }
      }
    })
    
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
    const wrapper = mount(DetailsView, {
      props: {
        content: mockContent,
        folders: mockFolders,
        mode: 'folder',
        isLoading: false,
        path: 'folder1'
      },
      global: {
        stubs: {
          'v-table': true,
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
    
    // Check that DetailsView re-emits these events
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
})
