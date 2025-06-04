<template>
  <div class="content-wrapper">
    <!-- Content Navigation Toolbar -->
    <ContentNavToolbar :initial-path="path" :initial-prefilter="prefilter" :initial-search="searchInput"
      :initial-sort="sort" :initial-view-mode="viewMode" :initial-include-subfolders="includeSubfolders"
      :prefilters="prefilters" :view-mode="viewMode" :meta="meta" :total-results="totalResults"
      @navigate="handleNavigate" />

    <div class="content-container">
      <!-- Responsive Layout Container -->
      <div class="folder-content-layout">
        <!-- Folder Panel Component -->
        <FolderPanel :folders="folders" :content="props.content" :mode="mode" :path="path"
          v-model:expanded="isFolderPanelExpanded" @navigate-folder="navigateToFolder" />

        <!-- Content Area -->
        <div class="content-area" :class="{ 'content-area--with-panel': isFolderPanelExpanded }">
          <!-- Files Group -->
          <div class="content-group files-group">
            <div class="group-header">
              <v-icon size="small" class="mr-1">mdi-file-music</v-icon>
              <h2 class="group-title">
                Files
                <span v-if="props.content.items.length > 0" class="count-badge">
                  ({{ props.content.hasMore ? `${props.content.items.length}+` : props.content.items.length }})
                </span>
              </h2>
            </div>
            <div class="files-container" ref="filesContainerRef">
              <!-- Direct rendering of content component with loading state -->
              <component :is="viewMode === 'details' ? DetailsView : PlaylistView" :content="props.content" :folders="[]"
                :mode="mode" :is-loading="isLoading || isLoadingMore" :path="path" :search-query="searchInput"
                :include-subfolders="includeSubfolders" :playing-item-id="currentlyPlayingItemId"
                @navigate-folder="navigateToFolder" @select-item="selectItem"
                @play-item="playItem" @save-file-info="saveFileInfo" />
              <!-- WhenVisible component handles loading more content with optimized partial reloads -->
              <template v-if="props.content.hasMore">
                <WhenVisible :buffer="500" always :params="{
                  data: {
                    cursor: props.content.nextCursor
                  },
                  only: ['content'],
                  preserveUrl: true,
                  preserveState: true
                }">
                  <div v-show="props.content.hasMore" class="loading-indicator">Loading...</div>
                </WhenVisible>
              </template>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- Audio Player -->
    <div class="fixed-controls">
      <AudioPlayer />
    </div>

    <!-- Scroll-to-top Button has been moved to SharedLayout.vue -->
  </div>
</template>

<script setup lang="ts">
// Content Page Component - Main content browsing page that displays media content in different view modes
import { ref, computed, watch, provide, onMounted, inject, onBeforeUnmount } from 'vue'
import { router, usePage, WhenVisible } from '@inertiajs/vue3'
import SharedLayout from '@/layouts/SharedLayout.vue'
import { fileName } from '@/utils/fileUtils'
import ContentNavToolbar from '@/components/ContentNavToolbar.vue'
import DetailsView from '@/components/DetailsView.vue'
import PlaylistView from '@/components/PlaylistView.vue'
import AudioPlayer from '@/components/AudioPlayer.vue'
import FolderPanel from '@/components/FolderPanel.vue'
import { useErrorHandling } from '@/composables/useErrorHandling'
import debounce from 'lodash/debounce'
import axios from 'axios'
import { Content, Prefilter } from '@/types/models'
import { useAudioPlayer } from '@/composables/useAudioPlayer'

// Interface for paginated content with cursor-based pagination
interface PaginatedContent {
  items: Content[]           // Array of content items
  nextCursor: string | null  // Cursor for the next page of results
  hasMore: boolean           // Whether there are more results available
}
import { useRecentItems, useFolderNavigation } from '@/composables/useNavigation'

// Types
type SortDirection = 'asc' | 'desc'     // Available options for sort direction
type ViewModeType = 'details' | 'playlist'  // Available view mode options for content display

// Interface for URL parameters used in navigation
interface URLParams {
  path: string                 // Current folder path
  prefilter: string            // Active prefilter
  search: string               // Search query
  sort: SortDirection          // Sort direction
  viewMode: ViewModeType       // View mode
  includeSubfolders?: boolean  // Whether to include subfolders in search
}

// Component props
const props = defineProps<{
  initialPath?: string                   // Initial folder path to display
  initialPrefilter?: string              // Initial prefilter to apply
  initialSearch?: string                 // Initial search query
  initialSort?: SortDirection            // Initial sort direction
  initialViewMode?: ViewModeType         // Initial view mode
  initialIncludeSubfolders?: boolean     // Whether to include subfolders in search
  content: PaginatedContent              // Content items to display
  folders: string[]                      // Available folders in the current path
  prefilters: Prefilter[]                // Available prefilters for content filtering
  meta?: {                               // Meta information from the server
    mode?: 'search' | 'folder'           // Current mode (search or folder browsing)
    pagination?: {
      limit: number
    }
  }
}>()

// State variables
const isLoading = ref(true)                                        // Whether content is currently loading
const isLoadingMore = ref(false)                                   // Whether more content is being loaded
const path = ref(props.initialPath || '')                          // Current folder path
const prefilter = ref(props.initialPrefilter || '')                // Current active prefilter
const searchInput = ref(props.initialSearch || '')                 // Current search query
const sort = ref<SortDirection>(props.initialSort || 'asc')        // Current sort direction
const viewMode = ref<ViewModeType>(props.initialViewMode || 'details')  // Current view mode
const includeSubfolders = ref<boolean>(props.initialIncludeSubfolders ?? false)  // Whether to include subfolders in search (default: false)

// State for folder panel visibility
const isFolderPanelExpanded = ref(false)      // Default collapsed to maximize content width

const filesContainerRef = ref<HTMLElement | null>(null)
const scrollPosition = inject('scrollPosition', ref(0))
const scrollToTop = inject('scrollToTop', () => {})

// Make folders accessible in the template
const folders = computed(() => props.folders)

// Create a reference to the path for use in composables
const pathRef = computed(() => path.value)

const prefilters = computed(() => props.prefilters)
const meta = computed(() => props.meta)

// Layout configuration for the page
defineOptions({
  layout: SharedLayout,
  layoutProps: {
    isAuthenticated: computed(() => !!(usePage().props.auth as { user: unknown }).user),
    user: computed(() => (usePage().props.auth as { user: unknown }).user)
  }
})

// Toggles between details and playlist view modes
const handleToggleViewMode = () => {
  viewMode.value = viewMode.value === 'details' ? 'playlist' : 'details'
  // Update URL to persist the view mode
  navigate({ viewMode: viewMode.value })
  }

// Register event handler for layout's toggle-view-mode event
defineExpose({
  'toggle-view-mode': handleToggleViewMode
})

// Define component emits
const emit = defineEmits<{
  'update:content': [updatedContent: PaginatedContent]
}>()

// Error handling
const { error, setError, clearError } = useErrorHandling()


// Set up event listeners and initialize component state

// Note: Previously watched viewMode to update layout
// This was removed as no components were listening for the event

// Current mode (search or folder browsing) based on whether there's a search query
const mode = computed(() => searchInput.value ? 'search' : 'folder')

// Compute the total number of results
const totalResults = computed(() => {
  // If we have content items, return their count
  if (props.content && props.content.items) {
    // If there are more results (hasMore is true), indicate this is a partial count
    if (props.content.hasMore && props.content.nextCursor) {
      return `${props.content.items.length}+`
    }
    // Otherwise return the exact count
    return props.content.items.length
  }
  return 0
})

// Parses URL parameters from a URL string
const decodeUrl = (url: string): URLParams => {
  // Split URL into base and query parts
  const [basePath, queryString] = url.split('?')

  // Parse query parameters
  const params = new URLSearchParams(queryString || '')

  // Extract path from base URL, ensuring we don't include query parameters
  const pathMatch = basePath.match(/\/content(?:\/([^?]*))?/)
  const cleanPath = pathMatch ? pathMatch[1] || '' : ''

  // Determine if we're in search mode for default values
  const isSearchMode = !!params.get('search')

  // Parse includeSubfolders parameter, default to false
  const includeSubfoldersParam = params.get('includeSubfolders')
  const defaultIncludeSubfolders = false

  return {
    path: cleanPath,
    prefilter: params.get('prefilter') || '',
    search: params.get('search') || '',
    sort: (params.get('sort') as SortDirection) || 'asc',
    // Always use the current viewMode if not specified in URL
    viewMode: (params.get('viewMode') as ViewModeType) || viewMode.value || 'details',
    includeSubfolders: includeSubfoldersParam === null
      ? defaultIncludeSubfolders
      : includeSubfoldersParam === 'true'
  }
}

// Builds a URL string from navigation parameters
const encodeUrl = (params: Partial<URLParams>) => {
  const currentParams = decodeUrl(window.location.href)
  const newParams = { ...currentParams, ...params }

  // Determine if we're in search mode for default values
  const isSearchMode = !!newParams.search

  // Build query string, including all necessary values
  const queryParams = new URLSearchParams()

  // Always include prefilter in query params if it exists
  if (newParams.prefilter) {
    queryParams.set('prefilter', newParams.prefilter)
  }

  if (newParams.search) queryParams.set('search', newParams.search)
  if (newParams.sort !== 'asc') queryParams.set('sort', newParams.sort)
  // Always include viewMode in URL to ensure it persists across navigation events
  queryParams.set('viewMode', newParams.viewMode)

  // Include includeSubfolders parameter regardless of search mode
  // Only include if it's different from the default (false)
  if (newParams.includeSubfolders !== undefined && newParams.includeSubfolders !== false) {
    queryParams.set('includeSubfolders', newParams.includeSubfolders.toString())
  }

  const queryString = queryParams.toString()
  const basePath = `/content${newParams.path ? `/${newParams.path}` : ''}`

  return queryString ? `${basePath}?${queryString}` : basePath
}

// Recent items composables - only using the functions we need
const { addRecentFolder, addRecentSearch } = useRecentItems()

// Navigates to a new URL using the router
const navigate = (params: Partial<URLParams>) => {
  router.visit(encodeUrl(params), {
    method: 'get',
    preserveState: true,
    preserveScroll: true
  })
}

// Handles navigation events from child components
const handleNavigate = (params: Partial<URLParams>) => {
  if ('path' in params) {
    // Clean the path to ensure consistent format
    // Remove any leading/trailing slashes and 'content/' prefix if present
    const cleanPath = (params.path || '')
      .trim()
      .replace(/^\/+/, '')
      .replace(/\/+$/, '')
      .replace(/^content\//, '')

    // Update local state to keep `path.value` accurate
    // This is important for subsequent navigation operations
    path.value = cleanPath

    // Construct query parameters
    const queryParams = new URLSearchParams()

    // Preserve all current query parameters
    if (prefilter.value) queryParams.set('prefilter', prefilter.value)
    if (searchInput.value) queryParams.set('search', searchInput.value)
    if (sort.value !== 'asc') queryParams.set('sort', sort.value)
    queryParams.set('viewMode', viewMode.value)

    // Include includeSubfolders parameter regardless of search mode
    if (includeSubfolders.value !== false) {
      queryParams.set('includeSubfolders', includeSubfolders.value.toString())
    }

    // Override with any new parameters provided
    if (params.prefilter !== undefined) {
      if (params.prefilter) queryParams.set('prefilter', params.prefilter)
      else queryParams.delete('prefilter')
    }
    if (params.search !== undefined) {
      if (params.search) queryParams.set('search', params.search)
      else queryParams.delete('search')
    }
    if (params.sort !== undefined && params.sort !== 'asc') {
      queryParams.set('sort', params.sort)
    }
    if (params.viewMode !== undefined) {
      queryParams.set('viewMode', params.viewMode)
    }

    // Include includeSubfolders parameter regardless of search mode
    if (params.includeSubfolders !== undefined) {
      if (params.includeSubfolders !== false) {
        queryParams.set('includeSubfolders', params.includeSubfolders.toString())
      } else {
        queryParams.delete('includeSubfolders')
      }
    }

    // Construct the final URL
    // Always add the '/content/' prefix here
    const baseUrl = cleanPath ? `/content/${cleanPath}` : '/content'
    const queryString = queryParams.toString()
    const finalUrl = queryString ? `${baseUrl}?${queryString}` : baseUrl

    // Use Inertia's router.visit for hard navigation
    router.visit(finalUrl, {
      method: 'get',
      preserveState: false, // Don't preserve state for path changes
      preserveScroll: false // Don't preserve scroll for path changes
    })
  } else {
    // For non-path navigation (like sorting, etc.), use the router
    navigate(params)
  }
}

// Navigates to a folder (handles both absolute and relative paths)
const navigateToFolder = (folderPath: string) => {
  // Clean the input path
  const cleanFolderPath = folderPath
    .trim()
    .replace(/^\/+/, '')
    .replace(/\/+$/, '')
    .replace(/^content\//, '')

  // Determine if this is a relative or absolute path
  // If the path doesn't contain a slash and we're not at the root,
  // it's likely a folder within the current directory
  let absolutePath = cleanFolderPath
  if (!cleanFolderPath.includes('/') && path.value) {
    absolutePath = `${path.value}/${cleanFolderPath}`
  }

  // Add to recent folders
  addRecentFolder(absolutePath)

  // Update the local path state
  path.value = absolutePath

  // Use handleNavigate to ensure query parameters are preserved
  // This will trigger our new handleNavigate function that properly handles paths
  handleNavigate({ path: absolutePath })
}

// Empty handler for the select-item event from child components
const selectItem = (item: Content) => {
  // Intentionally empty - child components rely on this handler existing
}

// Get audio player instance
const audioPlayer = useAudioPlayer()

// Computed property to get the currently playing item ID
const currentlyPlayingItemId = computed(() => {
  return audioPlayer.state.value.currentTrack?.id || null
})

// Updates the audio player playlist when content changes
watch(() => props.content.items, (newItems) => {
  if (newItems && newItems.length > 0) {
    // Map content items to track info objects
    const tracks = newItems.map(item => {
      const filename = fileName(item.file) || 'Unknown'
      return {
        id: item.file,
        file: item.file,
        title: item.content || filename,
        artist: item.guests || '',
        duration: item.seconds || 0,
        seek: 0
      }
    })

    // Update the playlist without starting playback
    if (tracks.length > 0) {
      // Update the playlist directly without trying to play
      audioPlayer.state.value.playlist = tracks
    }
  }
}, { immediate: true })

// Plays a content item in the audio player
const playItem = (item: Content) => {
  // Extract filename from the file path
  const filename = fileName(item.file) || 'Unknown'

  // Create a track info object for the audio player
  const trackInfo = {
    id: item.file, // Use file as id
    file: item.file,
    title: item.content || filename, // Use content field as title, or filename if not available
    artist: item.guests || '', // Use guests field as artist
    duration: item.seconds || 0, // Use seconds field as duration if available
    seek: 0
  }

  // Play the track
  audioPlayer.playTrack(trackInfo)
}


// Saves updated metadata for a content item
const saveFileInfo = async (updatedItem: Content) => {
  // Extract the metadata fields to update
  const metadata = {
    file: updatedItem.file,
    content: updatedItem.content,
    guests: updatedItem.guests,
    series: updatedItem.series,
    tags: updatedItem.tags
  }

  try {
    // Make PUT request
    const response = await axios.put('/content/metadata', metadata)

    // Clear any previous errors on success
    const page = usePage()
    if (page.props.errors) {
      ;(page.props as any).errors = {}
    }

    // Update local state by finding and mutating the relevant content item
    const contentItems = (usePage().props as any).content.items
    const index = contentItems.findIndex((i: Content) => i.file === updatedItem.file)
    if (index !== -1) {
      Object.assign(contentItems[index], response.data)
    }

  } catch (error: unknown) {
    console.error('Error updating file information:', error)

    // Set global errors for SharedLayout display
    const page = usePage()
    
    if (axios.isAxiosError(error) && error.response?.status === 422) {
      // Laravel validation errors - use the exact format Laravel provides
      page.props.errors = error.response.data.errors || {}
    } else {
      // All other errors - simple general error
      const message = (axios.isAxiosError(error) && error.response?.data?.message) || 'Failed to update file information'
      page.props.errors = { general: message }
    }
  }
}

// Initializes component state from the current URL
const initFromUrl = () => {
  const params = decodeUrl(window.location.href)
  path.value = params.path
  prefilter.value = params.prefilter
  searchInput.value = params.search
  sort.value = params.sort
  viewMode.value = params.viewMode
  includeSubfolders.value = params.includeSubfolders ?? false
  isLoading.value = false
}

// Debounced search navigation to prevent excessive API calls (700ms delay)
const debouncedSearch = debounce((value: string) => {
  if (value) {
    addRecentSearch(value)
    // Keep the current includeSubfolders value (don't force it to any default)
    navigate({
      search: value,
      viewMode: viewMode.value,
      includeSubfolders: includeSubfolders.value
    })
  } else {
    // When search is empty, reset includeSubfolders to false
    includeSubfolders.value = false
    navigate({
      search: value,
      viewMode: viewMode.value,
      includeSubfolders: false
    })
  }
}, 700)

// Watch for navigation events and reinitialize state
router.on('navigate', (event) => {
  initFromUrl()
})

// Watch for search changes and trigger debounced search
watch(searchInput, (value) => {
  debouncedSearch(value)
})

// Initialize state from URL on component creation
initFromUrl()

// Clean up debounced functions when component is unmounted
onBeforeUnmount(() => {
  // Clean up debounced functions to prevent memory leaks
  debouncedSearch.cancel()
})

</script>

<style scoped>
.content-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  width: 100%;
  position: relative;
  padding-bottom: 20px;
}

.content-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-top: 20px;
  transition: padding 0.3s ease;
  width: 100%;
  overflow: visible; /* Explicitly prevent scrolling */
}

.folder-content-layout {
  display: flex;
  width: 100%;
  position: relative;
  flex: 1;
  overflow: visible; /* Explicitly prevent scrolling */
}

.content-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: visible; /* Explicitly prevent scrolling */
  padding: 0;
  width: 100%;
  margin: 0;
  transition: all 0.3s ease;
  padding-bottom: 0;
}

.content-area--with-panel {
  width: calc(100% - 220px);
  padding-left: 8px;
}

/* Unified Content View Styles */
.unified-content-view {
  width: 100%;
}

.content-group {
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  flex: 1; /* Take up all available space */
}

.group-header {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background-color: #f5f5f5;
  border-radius: 4px;
  margin-bottom: 16px;
}

.group-title {
  font-size: 1.1rem;
  font-weight: 500;
  margin: 0;
  padding: 0;
  margin-left: 8px;
}

.count-badge {
  font-size: 0.85rem;
  font-weight: 400;
  color: rgba(0, 0, 0, 0.6);
  margin-left: 4px;
}

.folders-group {
  margin-bottom: 32px;
}

.folders-container {
  padding: 0 4px;
}

.folder-card {
  cursor: pointer;
  transition: all 0.2s ease;
  height: 100%;
}

.folder-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.folder-name {
  font-size: 0.95rem;
  font-weight: 500;
}

.files-group {
  margin-bottom: 16px;
}

.files-container {
  position: relative;
  min-height: 150px;
  flex: 1;
  overflow: visible; /* Explicitly prevent scrolling */
  width: 100%;
  display: flex;
  flex-direction: column;
}

/* Ensure child components take full width */
.files-container > * {
  width: 100%;
}

/* Target tables inside the files container to ensure they take full width */
.files-container :deep(table) {
  width: 100%;
  table-layout: fixed;
}

/* Ensure table cells don't wrap unnecessarily */
.files-container :deep(td) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.loading-indicator {
  text-align: center;
  padding: 5px;
  font-weight: 500;
  color: #666;
  width: 100%;
  margin-top: 5px;
  margin-bottom: 5px;
}

.fixed-controls {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 16px;
  position: static;
  z-index: 30;
}

@media (min-width: 1200px) {
  .content-container {
    padding: 0;
  }

  .content-area--with-panel {
    width: calc(100% - 240px);
  }
}

@media (max-width: 1199px) and (min-width: 768px) {
  .content-area--with-panel {
    width: calc(100% - 200px);
  }
}

/* Mobile-specific styles */
@media (max-width: 767px) {
  .content-wrapper {
    min-height: 100%;
    padding-bottom: 120px; /* Extra padding to account for audio player */
  }

  .content-container {
    padding: 0 8px;
    margin-top: 16px; /* Slightly reduced top margin on mobile */
    width: 100%;
  }

  .folder-content-layout {
    flex-direction: column;
    width: 100%;
  }

  .content-area {
    width: 100% !important;
    padding: 0;
  }

  .content-area--with-panel {
    padding-left: 0;
  }

  .group-header {
    padding: 6px 10px; /* Slightly smaller padding on mobile */
    margin-bottom: 12px;
  }

  .group-title {
    font-size: 1rem; /* Slightly smaller font on mobile */
  }

  /* Improve spacing for files container */
  .files-container {
    margin-top: 4px;
  }

  /* Adjust loading indicator for better visibility */
  .loading-indicator {
    padding: 8px;
    margin: 8px 0;
    background-color: #f5f5f5;
    border-radius: 4px;
    font-size: 0.9rem;
  }
}

/* Small mobile devices */
@media (max-width: 375px) {
  .content-container {
    padding: 0 6px;
  }

  .group-header {
    padding: 5px 8px;
  }

  .group-title {
    font-size: 0.95rem;
  }
}
</style>
