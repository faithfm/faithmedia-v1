<template>
  <div>
    <!-- Desktop controls only -->
    <div class="d-flex align-center">
      <!-- Filter Chip -->
      <v-tooltip location="bottom" text="Filter content by type">
        <template v-slot:activator="{ props: tooltipProps }">
          <v-menu ref="filterMenu">
            <template v-slot:activator="{ props: menuProps }">
              <v-chip
                v-bind="{ ...tooltipProps, ...menuProps }"
                :prepend-icon="prefilter ? 'mdi-filter' : 'mdi-filter-outline'"
                :closable="!!prefilter"
                color="red-darken-4"
                :variant="prefilter ? 'tonal' : 'outlined'"
                @click:close="clearFilter"
              size="default"
              class="filter-chip mr-2 touch-friendly-chip"
              >
                {{ prefilter ? getFilterDescription(prefilter) : 'Filter' }}
              </v-chip>
            </template>
            <v-list>
              <!-- Clear Prefilter Option -->
              <v-list-item
                v-if="prefilter"
                title="Clear Prefilter"
                prepend-icon="mdi-filter-remove"
                @click="clearFilter"
              />
              <v-divider v-if="prefilter" />
              
              <!-- Recent Filters (max 4) -->
              <template v-if="recentFilterItems.length > 0">
                <v-list-subheader>Recent</v-list-subheader>
                <v-list-item
                  v-for="filterSlug in recentFilterItems.slice(0, MAX_RECENT_ITEMS.FILTERS)"
                  :key="filterSlug"
                  :title="getFilterDescription(filterSlug)"
                  :prepend-icon="filterSlug === prefilter ? 'mdi-check' : undefined"
                  :active="filterSlug === prefilter"
                  @click="selectFilter(filterSlug)"
                />
                <v-divider />
              </template>
              <!-- All Filters -->
              <v-list-subheader>All Filters</v-list-subheader>
              <v-list-item
                v-for="filter in prefilters"
                :key="filter.slug"
                :title="filter.name"
                :prepend-icon="filter.slug === prefilter ? 'mdi-check' : undefined"
                :active="filter.slug === prefilter"
                @click="selectFilter(filter.slug)"
              />
            </v-list>
          </v-menu>
        </template>
      </v-tooltip>

      <!-- Search Field -->
      <div class="d-flex align-center search-container mx-2">
        <v-tooltip location="bottom" text="Search content">
          <template v-slot:activator="{ props: tooltipProps }">
            <v-menu>
              <template v-slot:activator="{ props: menuProps }">
                <v-text-field
                  v-model="searchInputModel"
                  density="compact"
                  hide-details
                  placeholder="Search..."
                  :prepend-inner-icon="'mdi-magnify'"
                  :append-inner-icon="searchInput ? 'mdi-close' : ''"
                  v-bind="{ ...tooltipProps, ...menuProps }"
                  @click:append-inner="clearSearch"
                  class="search-field"
                  style="width: 200px;"
                  variant="outlined"
                  bg-color="grey-lighten-4"
                ></v-text-field>
              </template>
              <v-list v-if="recentSearchItems.length > 0">
                <v-list-subheader>Recent Searches</v-list-subheader>
                <v-list-item
                  v-for="search in recentSearchItems.slice(0, MAX_RECENT_ITEMS.SEARCHES)"
                  :key="search"
                  :title="search"
                  @click="selectSearch(search)"
                />
              </v-list>
            </v-menu>
          </template>
        </v-tooltip>
        
        <!-- Include Subfolders Toggle -->
        <v-tooltip location="bottom" text="Include content from subfolders">
          <template v-slot:activator="{ props }">
            <v-btn 
              :icon="includeSubfolders ? 'mdi-folder-multiple' : 'mdi-folder'" 
              :color="includeSubfolders ? 'primary' : undefined"
              variant="text"
              v-bind="props"
              @click="toggleIncludeSubfolders"
              class="ml-1 touch-friendly-btn"
              size="default"
              density="default"
            ></v-btn>
          </template>
        </v-tooltip>
      </div>

      <!-- Sort Toggle -->
      <v-tooltip location="bottom" text="Toggle sort order">
        <template v-slot:activator="{ props }">
          <v-btn 
            :icon="sort === 'asc' ? 'mdi-sort-ascending' : 'mdi-sort-descending'" 
            variant="text"
            v-bind="props"
            @click="toggleSort"
            size="default"
            density="default"
            class="mx-1 touch-friendly-btn"
          ></v-btn>
        </template>
      </v-tooltip>

      <!-- View Mode Toggle -->
      <v-tooltip location="bottom" text="Toggle view mode">
        <template v-slot:activator="{ props }">
          <v-btn 
            :icon="viewMode === 'details' ? 'mdi-view-list' : 'mdi-view-grid'" 
            variant="text"
            v-bind="props"
            @click="toggleViewMode"
            size="default"
            density="default"
            class="mx-1 touch-friendly-btn"
          ></v-btn>
        </template>
      </v-tooltip>

      <!-- Upload Button -->
      <v-tooltip location="bottom" text="Upload functionality coming soon">
        <template v-slot:activator="{ props }">
          <v-btn 
            icon="mdi-upload" 
            variant="text" 
            v-bind="props"
            @click="showUpload"
            size="default"
            density="default"
            disabled
            class="ml-1 touch-friendly-btn"
          ></v-btn>
        </template>
      </v-tooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRecentItems, useFolderNavigation, SortDirection, ViewModeType, NavigationParams } from '../composables/useNavigation'

// Constants
const MAX_RECENT_ITEMS = {
  FILTERS: 4,    // Show up to 4 recent filters
  FOLDERS: 5,    // Show up to 5 recent folders
  SEARCHES: 5    // Show up to 5 recent searches
} as const

// Props
const props = withDefaults(defineProps<{
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
  recentFolderItems: string[]
  controlsOnly?: boolean // New prop to indicate controls-only mode
}>(), {
  prefilter: ''
})

// Emits
const emit = defineEmits<{
  (e: 'navigate', params: NavigationParams): void
  (e: 'update:searchInput', value: string): void
  (e: 'add-recent-search', search: string): void
  (e: 'add-recent-filter', filter: string): void
  (e: 'add-recent-folder', folder: string): void
}>()

// State
const filterMenu = ref(null)

// Computed
const searchInputModel = computed({
  get: () => props.searchInput,
  set: (value: string) => emit('update:searchInput', value)
})

// Methods
const navigateToFolder = (folderPath: string) => {
  // Clean the input path
  const cleanFolderPath = folderPath
    .trim()
    .replace(/^\/+/, '')
    .replace(/\/+$/, '')
    .replace(/^content\//, '')
  
  // Add to recent folders
  emit('add-recent-folder', cleanFolderPath)
  
  // Navigate to the folder
  emit('navigate', {
    path: cleanFolderPath,
    prefilter: props.prefilter,
    search: props.searchInput,
    sort: props.sort,
    viewMode: props.viewMode,
    includeSubfolders: props.includeSubfolders
  })
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

const selectSearch = (search: string) => {
  emit('add-recent-search', search)
  emit('update:searchInput', search)
  
  // Navigate with the selected search
  emit('navigate', { 
    search,
    includeSubfolders: true
  })
}

const clearSearch = () => {
  emit('update:searchInput', '')
  
  // Preserve the current includeSubfolders value instead of resetting it
  emit('navigate', { 
    search: '',
    includeSubfolders: props.includeSubfolders
  })
}

const toggleIncludeSubfolders = () => {
  emit('navigate', { includeSubfolders: !props.includeSubfolders })
}

const toggleSort = () => {
  emit('navigate', { 
    sort: props.sort === 'asc' ? 'desc' : 'asc',
    includeSubfolders: props.includeSubfolders // Preserve includeSubfolders setting
  })
}

const toggleViewMode = () => {
  emit('navigate', { 
    viewMode: props.viewMode === 'details' ? 'playlist' : 'details',
    includeSubfolders: props.includeSubfolders // Preserve includeSubfolders setting
  })
}

const showUpload = () => {
  // TODO: Implement upload
  console.log('Show upload')
}

// Helper Methods
const getFilterDescription = (filterSlug: string) => {
  const filter = props.prefilters.find(f => f.slug === filterSlug)
  return filter ? filter.name : filterSlug
}

const getLastPathSegment = (path: string) => {
  return path.split('/').pop() || ''
}
</script>

<style scoped>
/* Custom breadcrumbs styling */
.custom-breadcrumbs {
  overflow: hidden;
  max-width: 100%;
  font-size: 0.7rem;
  line-height: 1;
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
}

.custom-breadcrumbs span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-flex;
  vertical-align: middle;
  min-width: 0;
}

/* First and last items get more space */
.custom-breadcrumbs span:first-child,
.custom-breadcrumbs span:last-child {
  max-width: 150px; /* More space for first and last items */
  flex-shrink: 0;
}

/* Middle items can shrink more */
.custom-breadcrumbs span:not(:first-child):not(:last-child) {
  max-width: 120px;
  flex-shrink: 1;
}

/* Breadcrumbs container can grow */
.breadcrumbs-container {
  min-width: 0;
  flex-grow: 2;
  max-width: 60%; /* Prevent breadcrumbs from taking too much space */
}

.cursor-pointer {
  cursor: pointer;
}

/* Fix for filter chip and search field display issues */
.filter-chip {
  display: inline-flex !important;
}

.search-field {
  width: 100%;
}

.w-100 {
  width: 100%;
}

/* Utility class for minimum width */
.min-width-0 {
  min-width: 0;
}

/* Touch-friendly button and chip styling */
.touch-friendly-btn,
.touch-friendly-chip {
  min-height: 44px;
  min-width: 44px;
  margin: 0 2px;
}
</style>
