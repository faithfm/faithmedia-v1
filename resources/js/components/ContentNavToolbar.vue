<template>
  <v-toolbar 
    ref="navBar" 
    class="navigation-wrapper" 
    :class="{ 'scrolled': isScrolled }" 
    flat 
    height="48"
    density="default"
    color="white"
  >
    <!-- Common navigation elements (back button and breadcrumbs) -->
    <v-toolbar-title class="py-1 pl-0 pr-0 text-body-2 d-flex flex-row toolbar-title-custom">
      <div class="d-flex align-center justify-space-between w-100">
        <!-- Left Section: Back Button with Tooltip -->
        <v-tooltip location="bottom" text="Go to parent folder">
          <template v-slot:activator="{ props }">
            <v-btn 
              icon="mdi-arrow-up" 
              variant="text" 
              @click="goToParentFolder"
              :disabled="isRoot"
              v-bind="props"
              size="default"
              density="default"
              class="mr-2"
            ></v-btn>
          </template>
        </v-tooltip>

        <!-- Folder Field with Breadcrumbs -->
        <div class="py-0 breadcrumbs-container">
          <v-tooltip location="bottom" text="Current folder path">
            <template v-slot:activator="{ props: tooltipProps }">
              <v-menu>
                <template v-slot:activator="{ props: menuProps }">
                  <div class="d-flex align-center" v-bind="{ ...tooltipProps, ...menuProps }">
                    <v-icon icon="mdi-folder" size="small" class="mr-2 flex-shrink-0" />
                    <template v-if="breadcrumbs.length > 0">
                      <!-- Use the extracted BreadcrumbsNav component -->
                      <BreadcrumbsNav 
                        :breadcrumbs="breadcrumbs"
                        @breadcrumb-click="handleBreadcrumbClick"
                      />
                    </template>
                    <span v-else class="text-body-2 root-text">Root</span>
                  </div>
                </template>
                <v-list v-if="recentFolderItems.length > 0">
                  <v-list-subheader>Recent Folders</v-list-subheader>
                  <v-list-item
                    v-for="folder in recentFolderItems.slice(0, 5)"
                    :key="folder"
                    :title="getLastPathSegment(folder)"
                    :subtitle="folder"
                    @click="navigateToFolder(folder)"
                  />
                </v-list>
              </v-menu>
            </template>
          </v-tooltip>
        </div>
      </div>
    </v-toolbar-title>
    
    <!-- Use v-slot:append for responsive controls -->
    <template v-slot:append>
      <!-- Mobile controls -->
      <MobileControls
        v-if="smAndDown"
        :path="path"
        :breadcrumbs="breadcrumbs"
        :isRoot="isRoot"
        :searchInput="searchInput"
        :prefilter="prefilter"
        :sort="sort"
        :viewMode="viewMode"
        :includeSubfolders="includeSubfolders"
        :prefilters="prefilters"
        :recentSearchItems="recentSearchItems"
        :recentFilterItems="recentFilterItems"
        @navigate="navigate"
        @update:searchInput="searchInput = $event"
        @add-recent-search="addRecentSearch"
        @add-recent-filter="addRecentFilter"
        @clear-all-recent-searches="clearAllRecentSearches"
        @toggle-filter-menu="toggleFilterMenu"
        controls-only
      />
      
      <!-- Desktop controls -->
      <DesktopControls
        v-else
        :path="path"
        :breadcrumbs="breadcrumbs"
        :isRoot="isRoot"
        :searchInput="searchInput"
        :prefilter="prefilter"
        :sort="sort"
        :viewMode="viewMode"
        :includeSubfolders="includeSubfolders"
        :prefilters="prefilters"
        :recentSearchItems="recentSearchItems"
        :recentFilterItems="recentFilterItems"
        :recentFolderItems="recentFolderItems"
        @navigate="navigate"
        @update:searchInput="searchInput = $event"
        @add-recent-search="addRecentSearch"
        @add-recent-filter="addRecentFilter"
        @add-recent-folder="addRecentFolder"
        controls-only
      />
    </template>
  </v-toolbar>
</template>

<script setup lang="ts">
// ContentNavToolbar Component - Provides the main navigation interface for content browsing
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import debounce from 'lodash/debounce'
import { Content, Prefilter } from '@/types/models'
import { fileName, filePath } from '@/utils/fileUtils'
import { useRecentItems, useFolderNavigation, SortDirection, ViewModeType } from '@/composables/useNavigation'
import { useDisplay } from 'vuetify'
import MobileControls from './MobileControls.vue'
import DesktopControls from './DesktopControls.vue'
import BreadcrumbsNav from './BreadcrumbsNav.vue'

// Component props
const props = defineProps<{
  initialPath: string                    // Initial folder path to display
  initialPrefilter: string               // Initial prefilter to apply
  initialSearch: string                  // Initial search query
  initialSort: SortDirection             // Initial sort direction
  initialViewMode: ViewModeType          // Initial view mode
  initialIncludeSubfolders?: boolean     // Whether to include subfolders in search
  prefilters: Prefilter[]                // Available prefilters for content filtering
  viewMode?: ViewModeType                // Current view mode (can override initialViewMode)
  totalResults?: number | string         // Total number of results (optional)
  meta?: {                               // Meta information from the server
    mode?: 'search' | 'folder'           // Current mode (search or folder browsing)
    pagination?: {
      limit: number
    }
  }
}>()

// Emits
const emit = defineEmits<{
  (e: 'navigate', params: { path?: string, prefilter?: string, search?: string, sort?: SortDirection, viewMode?: ViewModeType, includeSubfolders?: boolean }): void
}>()

// Recent items composable
const { 
  recentFilters: recentFilterItems, 
  addRecentFilter,
  recentFolders: recentFolderItems,
  addRecentFolder,
  recentSearches: recentSearchItems,
  addRecentSearch
} = useRecentItems()

// State variables
const path = ref(props.initialPath)              // Current folder path being displayed
const navBar = ref<HTMLElement | null>(null)     // Reference to the navigation bar DOM element
const isScrolled = ref(false)                    // Whether the page has been scrolled (for styling)
const isDrawerOpen = ref(true)                   // Whether the navigation drawer is open
const filterMenu = ref(null)                     // Reference to the filter menu

// Detects page scroll and updates isScrolled state for styling
const handleScroll = () => {
  // Update scrolled state for styling
  if (window.scrollY > 10) {
    isScrolled.value = true
  } else {
    isScrolled.value = false
  }
}

// Updates isDrawerOpen state based on custom events
const handleDrawerChange = (event: CustomEvent) => {
  if (event.detail && typeof event.detail.open !== 'undefined') {
    isDrawerOpen.value = event.detail.open
  }
}

// Add event listeners
onMounted(() => {
  window.addEventListener('scroll', handleScroll)
  document.addEventListener('navigation-drawer-changed', handleDrawerChange as EventListener)
  
  // Initial check
  handleScroll()
  
  // Check if drawer is initially open by looking for the navigation drawer element
  const drawer = document.querySelector('.v-navigation-drawer')
  if (drawer) {
    // Check if it has the 'v-navigation-drawer--active' class
    isDrawerOpen.value = drawer.classList.contains('v-navigation-drawer--active')
  }
})

// Clean up event listeners
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  document.removeEventListener('navigation-drawer-changed', handleDrawerChange as EventListener)
})

// Computed reference to the current path for the folder navigation composable
const pathRef = computed(() => path.value)
// Get breadcrumbs and root status based on current path
const { breadcrumbs: folderBreadcrumbs, isRoot } = useFolderNavigation(pathRef)

// Transform breadcrumbs to match Vuetify's expected format
const breadcrumbs = computed(() => {
  return folderBreadcrumbs.value.map(item => ({
    title: item.label,
    disabled: item.isLast,
    href: item.path, // Use href instead of path for Vuetify compatibility
    // Store our custom properties as a data attribute
    props: {
      path: item.path,
      isLast: item.isLast
    }
  }))
})

const prefilter = ref(props.initialPrefilter)
const searchInput = ref(props.initialSearch)
const sort = ref<SortDirection>(props.initialSort)
// Use the current viewMode prop if provided, otherwise use initialViewMode
const viewMode = computed(() => props.viewMode || props.initialViewMode)
const includeSubfolders = ref(props.initialIncludeSubfolders ?? true)

// Computed
const mode = computed(() => searchInput.value ? 'search' : 'folder')

// Default layout based on mode
const defaultViewMode = computed<ViewModeType>(() => mode.value === 'search' ? 'playlist' : 'details')

// Navigation Methods
const navigate = (params: Partial<Parameters<typeof emit>[1]>) => {
  // If search mode changes, reset layout to default
  if ('search' in params && (!!params.search !== !!searchInput.value)) {
    params.viewMode = params.search ? 'playlist' : 'details'
  }
  
  // Update local state if path is provided
  if (params.path !== undefined) {
    path.value = params.path
  }
  
  // Update local state if prefilter is provided
  if (params.prefilter !== undefined) {
    prefilter.value = params.prefilter
  }
  
  // Update local state if sort is provided
  if (params.sort !== undefined) {
    sort.value = params.sort
  }
  
  // Update local state if includeSubfolders is provided
  if (params.includeSubfolders !== undefined) {
    includeSubfolders.value = params.includeSubfolders
  }
  
  emit('navigate', params)
}

// Clear all recent searches
const clearAllRecentSearches = () => {
  recentSearchItems.value = []
  // If you're using localStorage, clear it too
  localStorage.removeItem('recentSearches')
}

// Get Vuetify display properties
const { smAndDown } = useDisplay()

const toggleFilterMenu = () => {
  // Different approach for mobile vs desktop
  if (smAndDown.value) {
    // For mobile, use the existing filter menu functionality
    const filterChip = document.querySelector('.v-chip')
    if (filterChip) {
      filterChip.dispatchEvent(new Event('click'))
    }
  } else {
    // For desktop, find the filter chip in the DesktopControls
    const desktopFilterChip = document.querySelector('.filter-chip')
    if (desktopFilterChip) {
      desktopFilterChip.dispatchEvent(new Event('click'))
    }
  }
}

// Debounced search navigation to prevent excessive API calls (600ms delay)
const debouncedSearch = debounce((value: string) => {
  if (value) {
    addRecentSearch(value)
    // When search is not empty, ensure includeSubfolders is set to true by default
    if (!includeSubfolders.value) {
      includeSubfolders.value = true
    }
    navigate({ 
      search: value,
      includeSubfolders: includeSubfolders.value
    })
  } else {
    // When search is empty, preserve the current includeSubfolders value
    navigate({ 
      search: value,
      includeSubfolders: includeSubfolders.value
    })
  }
}, 600)

// Navigation methods for breadcrumbs
const goToParentFolder = () => {
  if (!path.value) {
    return
  }
  
  // Get the parent folder path
  const newPath = filePath(path.value)
  
  // Preserve the current viewMode and includeSubfolders when navigating to the parent folder
  navigate({ 
    path: newPath,
    viewMode: viewMode.value,
    includeSubfolders: includeSubfolders.value
  })
}

const handleBreadcrumbClick = (item: any) => {
  // Skip if disabled or no path available
  if (item.disabled || !item.props?.path) {
    return
  }
  
  // Simply use the path directly from the props
  // The path is already properly formatted by useFolderNavigation
  navigate({
    path: item.props.path,
    prefilter: prefilter.value,
    search: searchInput.value,
    sort: sort.value,
    viewMode: viewMode.value,
    includeSubfolders: includeSubfolders.value
  })
}

// Helper method to get the last segment of a path
const getLastPathSegment = (path: string) => {
  return fileName(path) || ''
}

// Navigate to a specific folder
const navigateToFolder = (folderPath: string) => {
  // Clean the input path
  const cleanFolderPath = folderPath
    .trim()
    .replace(/^\/+/, '')
    .replace(/\/+$/, '')
    .replace(/^content\//, '')
  
  // Add to recent folders
  addRecentFolder(cleanFolderPath)
  
  // Navigate to the folder
  navigate({
    path: cleanFolderPath,
    prefilter: prefilter.value,
    search: searchInput.value,
    sort: sort.value,
    viewMode: viewMode.value,
    includeSubfolders: includeSubfolders.value
  })
}

// Watch for search changes
watch(searchInput, (value: string) => {
  // Only trigger debounced search if not coming from mobile dialog
  // Mobile dialog handles its own search via handleSearch method
  if (!smAndDown.value) {
    debouncedSearch(value)
  }
})
</script>

<style scoped>
.navigation-wrapper {
  z-index: 1000; /* Increase z-index to be higher than v-navigation-drawer */
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  transition: all 0.3s ease;
  padding: 4px 0; /* Add vertical padding for better touch targets */
}

/* Enhanced shadow when scrolled */
.navigation-wrapper.scrolled {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(8px);
}


/* Breadcrumbs container can grow */
.breadcrumbs-container {
  min-width: 0;
  flex-grow: 1;
  max-width: 90%; /* Increased to allow more space for breadcrumbs */
  margin-left: 0; /* Ensure no left margin */
}


/* Utility class for minimum width */
.min-width-0 {
  min-width: 0;
}

/* Fix for width issues */
.w-100 {
  width: 100%;
}

/* Root text styling - match breadcrumb items for touch */
.root-text {
  display: inline-flex;
  min-height: 44px; /* Increased from 36px to meet touch guidelines */
  align-items: center; /* Center content vertically */
  border-radius: 4px; /* Rounded corners for better touch feel */
  font-weight: bold; /* Make it stand out */
  padding: 6px 8px; /* Reduced padding to match breadcrumb items */
}


/* Custom toolbar title styling */
.toolbar-title-custom {
  width: 100%;
  padding: 0;
  margin: 0;
}

/* Responsive adjustments for different screen sizes */
@media (min-width: 600px) {
  /* More space for breadcrumbs on larger screens */
  .breadcrumbs-container {
    max-width: 85%;
  }
}

@media (min-width: 960px) {
  /* Even more space for breadcrumbs on desktop */
  .breadcrumbs-container {
    max-width: 90%;
  }
}
</style>
