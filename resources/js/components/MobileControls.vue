<template>
  <div>
    <!-- Mobile controls only -->
    <div class="d-flex align-center">
      <!-- Search Button -->
      <v-btn 
        icon="mdi-magnify" 
        variant="text"
        @click="toggleSearchField"
        size="default"
        density="default"
        :color="isSearchExpanded || searchInput ? 'primary' : undefined"
        aria-label="Search"
        class="touch-friendly-btn"
      ></v-btn>
        
      <!-- More Menu -->
      <v-menu v-model="isMoreMenuOpen">
        <template v-slot:activator="{ props }">
          <v-btn 
            icon="mdi-dots-vertical" 
            variant="text"
            v-bind="props"
            size="default"
            density="default"
            aria-label="More options"
            class="touch-friendly-btn ml-2"
          ></v-btn>
        </template>
        <v-list>
          <v-list-item 
            :prepend-icon="prefilter ? 'mdi-filter' : 'mdi-filter-outline'" 
            :title="prefilter ? `Filter: ${getFilterDescription(prefilter)}` : 'Filter'"
            @click="toggleFilterMenu"
            :active="!!prefilter"
          />
          <v-list-item 
            prepend-icon="mdi-folder-multiple" 
            :title="includeSubfolders ? 'Exclude Subfolders' : 'Include Subfolders'"
            @click="toggleIncludeSubfolders"
            :active="includeSubfolders"
          />
          <v-list-item 
            :prepend-icon="sort === 'asc' ? 'mdi-sort-ascending' : 'mdi-sort-descending'" 
            :title="sort === 'asc' ? 'Sort Ascending' : 'Sort Descending'"
            @click="toggleSort"
          />
          <v-list-item 
            :prepend-icon="viewMode === 'details' ? 'mdi-view-list' : 'mdi-view-grid'" 
            :title="viewMode === 'details' ? 'List View' : 'Grid View'"
            @click="toggleViewMode"
          />
          <v-list-item 
            prepend-icon="mdi-upload" 
            title="Upload"
            @click="showUpload"
            disabled
          />
        </v-list>
      </v-menu>
    </div>
    
    <!-- Mobile Search Dialog -->
    <MobileSearchDialog
      v-model="isSearchExpanded"
      v-model:searchValue="searchInputModel"
      :recentSearchItems="recentSearchItems"
      @search="handleSearch"
      @select-search="handleSelectSearch"
      @clear-all-searches="clearAllRecentSearches"
    />
    
    <!-- Mobile Filter Dialog -->
    <MobileFilterDialog
      v-model="isFilterDialogOpen"
      :prefilters="prefilters"
      :recentFilterItems="recentFilterItems"
      :currentFilter="prefilter"
      @select-filter="selectFilter"
      @clear-filter="clearFilter"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import MobileSearchDialog from './MobileSearchDialog.vue'
import MobileFilterDialog from './MobileFilterDialog.vue'
import { SortDirection, ViewModeType, NavigationParams } from '../composables/useNavigation'

// Props
const props = defineProps<{
  path: string
  breadcrumbs: Array<{
    title: string
    disabled: boolean
    href: string
    props?: {
      path: string
      isLast: boolean
    }
  }>
  isRoot: boolean
  searchInput: string
  prefilter: string
  sort: SortDirection
  viewMode: ViewModeType
  includeSubfolders: boolean
  prefilters: any[]
  recentSearchItems: string[]
  recentFilterItems: string[]
  controlsOnly?: boolean // New prop to indicate controls-only mode
}>()

// Emits
const emit = defineEmits<{
  (e: 'navigate', params: NavigationParams): void
  (e: 'update:searchInput', value: string): void
  (e: 'add-recent-search', search: string): void
  (e: 'add-recent-filter', filter: string): void
  (e: 'clear-all-recent-searches'): void
  (e: 'toggle-filter-menu'): void
}>()

// State
const isMoreMenuOpen = ref(false)
const isSearchExpanded = ref(false)
const isFilterDialogOpen = ref(false)

// Computed
const searchInputModel = computed({
  get: () => props.searchInput,
  set: (value: string) => emit('update:searchInput', value)
})

// Methods
const toggleSearchField = () => {
  isSearchExpanded.value = !isSearchExpanded.value
  // Close more menu if open
  if (isSearchExpanded.value && isMoreMenuOpen.value) {
    isMoreMenuOpen.value = false
  }
}

const handleSearch = (search: string) => {
  handleSelectSearch(search)
}

const handleSelectSearch = (search: string) => {
  emit('add-recent-search', search)
  isSearchExpanded.value = false
  
  emit('navigate', { 
    search,
    includeSubfolders: true
  })
}

const clearAllRecentSearches = () => {
  emit('clear-all-recent-searches')
}

const toggleFilterMenu = () => {
  isFilterDialogOpen.value = true
  isMoreMenuOpen.value = false
}

const selectFilter = (filterSlug: string) => {
  emit('add-recent-filter', filterSlug)
  
  // Find the selected prefilter to get its filter value
  const selectedPrefilter = props.prefilters.find(p => p.slug === filterSlug)
  
  if (selectedPrefilter) {
    // Special case for "all-content" prefilter
    if (filterSlug === 'all-content') {
      // For the "all-content" prefilter, use the root path without query parameters
      // but preserve the includeSubfolders setting
      emit('navigate', { 
        path: '',  // Root path
        prefilter: '',  // Don't include in query params
        includeSubfolders: props.includeSubfolders // Preserve includeSubfolders setting
      })
      return
    }
    
    // Always navigate to the root path with prefilter as query parameter
    emit('navigate', { 
      path: '',  // Root path
      prefilter: filterSlug,  // Use the slug as the prefilter parameter
      includeSubfolders: true  // Always include subfolders
    })
  } else {
    // Fallback to query parameter if prefilter not found
    emit('navigate', { 
      path: '',
      prefilter: filterSlug,
      includeSubfolders: true
    })
  }
}

const clearFilter = () => {
  // Only reset the prefilter, don't change the path
  // This ensures the filter chip remains visible during navigation
  // and preserves the includeSubfolders setting
  emit('navigate', { 
    prefilter: '',
    includeSubfolders: props.includeSubfolders // Preserve includeSubfolders setting
  })
}

const toggleIncludeSubfolders = () => {
  emit('navigate', { includeSubfolders: !props.includeSubfolders })
  isMoreMenuOpen.value = false
}

const toggleSort = () => {
  emit('navigate', { 
    sort: props.sort === 'asc' ? 'desc' : 'asc',
    includeSubfolders: props.includeSubfolders
  })
  isMoreMenuOpen.value = false
}

const toggleViewMode = () => {
  emit('navigate', { 
    viewMode: props.viewMode === 'details' ? 'playlist' : 'details',
    includeSubfolders: props.includeSubfolders
  })
  isMoreMenuOpen.value = false
}

const showUpload = () => {
  // TODO: Implement upload
  console.log('Show upload')
  isMoreMenuOpen.value = false
}

// Helper Methods
const getFilterDescription = (filterSlug: string) => {
  const filter = props.prefilters.find(f => f.slug === filterSlug)
  return filter ? filter.name : filterSlug
}
</script>

<style scoped>
/* Toolbar title styling for breadcrumbs */
:deep(.v-toolbar-title) {
  flex: 1; /* Take up available space */
  overflow: hidden;
  padding-right: 8px; /* Add some spacing between breadcrumbs and controls */
}

/* Cursor pointer for clickable items */
.cursor-pointer {
  cursor: pointer;
}

/* Active state indicators for search button */
.v-btn--active {
  color: rgb(var(--v-theme-primary));
}

/* Touch-friendly button styling */
.touch-friendly-btn {
  min-height: 44px;
  min-width: 44px;
  margin: 0 2px;
}
</style>
