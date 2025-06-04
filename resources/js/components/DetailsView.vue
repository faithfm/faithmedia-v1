<template>
  <BaseLayout :content="content.items" :folders="folders" :mode="mode" :is-loading="isLoading" :path="path"
    :search-query="searchQuery" :error="error" :current-view="'details'"
    @navigate-folder="$emit('navigate-folder', $event)" @select-item="$emit('select-item', $event)"
    @play-item="$emit('play-item', $event)" @save-file-info="$emit('save-file-info', $event)"
    @download-item="(item, format) => $emit('download-item', item, format)" @retry="handleRetry">
    <template
      #default="{ content, isSelected, isPlaying, onItemSelect, onItemMenu, onPlayItem, getFileName, getFilePath, formatDuration, itemHasMatches }">
      <div class="table-wrapper">
        <v-data-table
          :headers="headers"
          :items="content"
          :loading="isLoading"
          density="compact"
          :fixed-header="true"
          :items-per-page="-1"
          :hide-default-footer="true"
          item-key="file"
          class="content-data-table"
          :row-props="(row: any) => ({
            class: {
              'selected': isSelected(row.item),
              'playing': isPlaying(row.item),
              'has-matches': itemHasMatches(row.item),
              'zero-duration': hasZeroDuration(row.item),
              'interactive-row': true
            },
            title: 'Click to select and open options'
          })"
          @click:row="(event: any, row: any) => handleRowClick(row.item, event, onItemSelect, onItemMenu)"
        >
          <!-- Custom loading slot -->
          <template #loading>
            <div class="d-flex flex-column align-center py-8">
              <v-progress-circular indeterminate color="primary" class="mb-4"></v-progress-circular>
              <span class="text-subtitle-1 text-medium-emphasis">Loading content...</span>
            </div>
          </template>

          <!-- Custom no-data slot -->
          <template #no-data>
            <div class="d-flex flex-column align-center py-8">
              <v-icon size="large" color="grey-lighten-1" class="mb-4">mdi-file-search-outline</v-icon>
              <span class="text-subtitle-1 text-medium-emphasis">No items found</span>
              <span v-if="mode === 'search'" class="text-caption text-medium-emphasis mt-1">
                Try adjusting your search criteria
              </span>
            </div>
          </template>

          <!-- Mobile actions column -->
          <template #item.actions-mobile="{ item }">
            <TableActionButtons 
              :item="item" 
              :get-file-name="getFileName"
              @play="onPlayItem"
              @menu="onItemMenu"
            />
          </template>

          <!-- File column with subfolder indicator -->
          <template #item.file="{ item }">
            <div class="d-flex align-center">
              <span>{{ getFileName(item.file) }}</span>
              <v-chip v-if="mode === 'search' && isFromSubfolder(item)" size="x-small" color="primary"
                class="ml-2" label>
                sub
              </v-chip>
            </div>
          </template>

          <!-- Duration column with formatting -->
          <template #item.duration="{ item }">
            {{ formatDuration(item.seconds) }}
          </template>

          <!-- Path column (when includeSubfolders is true) -->
          <template #item.path="{ item }">
            {{ getFilePath(item.file) }}
          </template>

          <!-- Desktop actions column -->
          <template #item.actions-desktop="{ item }">
            <TableActionButtons 
              :item="item" 
              :get-file-name="getFileName"
              @play="onPlayItem"
              @menu="onItemMenu"
            />
          </template>

        </v-data-table>
      </div>
    </template>
  </BaseLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BaseLayout from './BaseView.vue'
import TableActionButtons from './TableActionButtons.vue'
import type { Content } from '@/types/models'
import { useErrorHandling } from '@/composables/useErrorHandling'

// Props
interface Props {
  content: {
    items: Content[]
    nextCursor: string | null
    hasMore: boolean
  }
  folders: string[]
  mode: 'search' | 'folder'
  isLoading?: boolean
  path: string
  searchQuery?: string
  onRetry?: () => Promise<void>
  includeSubfolders?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  path: '',
  searchQuery: '',
  onRetry: undefined,
  includeSubfolders: false
})

// Error handling
const { error, retry } = useErrorHandling()

// Define table headers using Vuetify's proper column configuration
const headers = computed(() => {
  const baseHeaders = [
    {
      key: 'actions-mobile',
      title: 'Actions',
      width: 100,
      minWidth: 100,
      maxWidth: 100,
      sortable: false,
      align: 'center' as const,
      cellProps: { class: 'actions-column-mobile' },
      headerProps: { class: 'actions-column-mobile' }
    },
    {
      key: 'file',
      title: 'File',
      width: 200,
      minWidth: 180,
      sortable: true,
      align: 'start' as const
    },
    {
      key: 'series',
      title: 'Series',
      width: 150,
      minWidth: 120,
      sortable: true,
      align: 'start' as const
    },
    {
      key: 'content',
      title: 'Content',
      width: 400,
      minWidth: 250,
      sortable: true,
      align: 'start' as const,
      cellProps: { class: 'content-column' },
      headerProps: { class: 'content-column' }
    },
    {
      key: 'guests',
      title: 'Guests',
      width: 150,
      minWidth: 120,
      sortable: true,
      align: 'start' as const
    },
    {
      key: 'tags',
      title: 'Tags',
      width: 150,
      minWidth: 120,
      sortable: true,
      align: 'start' as const
    },
    {
      key: 'duration',
      title: 'Duration',
      width: 80,
      minWidth: 80,
      maxWidth: 80,
      sortable: true,
      align: 'center' as const,
      cellProps: { class: 'duration-column' },
      headerProps: { class: 'duration-column' }
    }
  ]

  // Add Path column if includeSubfolders is true
  if (props.includeSubfolders) {
    baseHeaders.push({
      key: 'path',
      title: 'Path',
      width: 200,
      minWidth: 150,
      sortable: true,
      align: 'start' as const
    })
  }

  // Add desktop actions column
  baseHeaders.push({
    key: 'actions-desktop',
    title: 'Actions',
    width: 100,
    minWidth: 100,
    maxWidth: 100,
    sortable: false,
    align: 'center' as const,
    cellProps: { class: 'actions-column-desktop' },
    headerProps: { class: 'actions-column-desktop' }
  })

  return baseHeaders
})


// Handle retry action
const handleRetry = async () => {
  if (props.onRetry) {
    await retry(props.onRetry)
  }
}

// Emits
const emit = defineEmits<{
  'navigate-folder': [path: string]
  'select-item': [item: Content]
  'play-item': [item: Content]
  'save-file-info': [item: Content]
  'download-item': [item: Content, format?: string]
}>()

// Check if an item is from a subfolder
const isFromSubfolder = (item: Content) => {
  if (!props.path) return false

  const itemPath = item.file.split('/')
  itemPath.pop() // Remove filename
  const itemFolder = itemPath.join('/')

  return itemFolder !== props.path
}

// Optimize event handler to avoid inline functions
const handleRowClick = (item: Content, event: MouseEvent, onItemSelect: Function, onItemMenu: Function) => {
  onItemSelect(item, event)
  onItemMenu(item)
}

// Check if an item has zero duration
const hasZeroDuration = (item: Content) => {
  return item.seconds === 0 || item.seconds === null || item.seconds === undefined || item.seconds < 0
}
</script>

<style scoped>
.table-wrapper {
  overflow-x: auto;
  overflow-y: visible;
  width: 100%;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  background: white;
  margin: 0 !important;
  padding: 0 !important;
  -webkit-overflow-scrolling: touch;
  position: relative;
}

.content-data-table {
  cursor: pointer;
  width: 100%;
}

.content-data-table :deep(.v-table__wrapper) {
  min-width: 1200px;
}

.content-data-table :deep(th) {
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.5px;
  color: rgba(0, 0, 0, 0.87);
  white-space: nowrap;
  overflow: visible;
}

/* Default cell behavior - truncate all columns except content */
.content-data-table :deep(td) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: background-color 0.15s ease;
}

/* Content column */
.content-data-table :deep(.content-column) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: unset;
  min-width: 250px;
  width: 400px;
}

.content-data-table :deep(tr.interactive-row) {
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.content-data-table :deep(tr.selected) {
  background-color: rgba(var(--v-theme-primary), 0.1);
}

.content-data-table :deep(tr.playing:not(.selected)) {
  background-color: rgba(var(--v-theme-error), 0.1);
}

.content-data-table :deep(tr.has-matches:not(.selected):not(.playing)) {
  background-color: rgba(var(--v-theme-warning), 0.05);
}

.content-data-table :deep(tr.zero-duration),
.content-data-table :deep(tr.zero-duration *) {
  color: rgba(0, 0, 0, 0.38) !important;
  opacity: 0.6;
}

/* Hover states */
.content-data-table :deep(tr:hover:not(.selected):not(.playing)) {
  background-color: rgba(var(--v-theme-primary), 0.03);
}

.content-data-table :deep(.action-btn:hover) {
  background-color: rgba(var(--v-theme-primary), 0.08);
}

/* Desktop: Hide mobile actions by default */
.content-data-table :deep(.actions-column-mobile) {
  display: none;
}

/* Tablet and below */
@media (max-width: 1024px) {
  .content-data-table :deep(.v-table__wrapper) {
    min-width: 1100px;
  }

  /* Switch to mobile actions column */
  .content-data-table :deep(.actions-column-mobile) {
    display: table-cell;
    width: 100px;
    min-width: 100px;
    position: sticky;
    left: 0;
    z-index: 1;
    background-color: white;
    box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  }

  .content-data-table :deep(.actions-column-desktop) {
    display: none;
  }

  .content-data-table :deep(thead th.actions-column-mobile) {
    z-index: 3;
  }
}

/* Mobile optimizations */
@media (max-width: 767px) {
  .content-data-table :deep(.v-table__wrapper) {
    min-width: 1000px;
  }

  /* Enhanced touch targets */
  .content-data-table :deep(tbody tr) {
    min-height: 48px;
  }

  .content-data-table :deep(.v-btn) {
    min-width: 40px;
    min-height: 40px;
    margin: 0 4px;
  }

  .content-data-table :deep(.actions-column-mobile) {
    width: 110px;
    min-width: 110px;
  }

  /* Touch feedback */
  .content-data-table :deep(tbody tr:active) {
    background-color: rgba(var(--v-theme-primary), 0.05);
  }
}
</style>
