<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, shallowRef } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { useReviewSummaries, type SongReviewSummary } from '../composables/useReviewSummaries'

interface TableHeader {
  title: string;
  value: string;
  width: string;
  sortable?: boolean;
}

interface Props {
  headers: TableHeader[]
  items: SongReviewSummary[]
  statusOptions: string[]
  sourceOptions: string[]
  loading: boolean
  editable?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'row-select': [item: SongReviewSummary | null]
}>()

// Use the composable directly for simplified communication
const { updateSummary, error } = useReviewSummaries()

// Selected row tracking
const selectedItem = ref<SongReviewSummary | null>(null)
const tableContainer = ref<HTMLElement | null>(null)

// Memoized computed properties for better performance
const memoizedStatusOptions = computed(() => props.statusOptions)
const memoizedSourceOptions = computed(() => props.sourceOptions)

// Cached status class computation to avoid repeated string operations
const statusClassCache = new Map<string, string>()

// Get field value directly from item (no local caching)
function getFieldValue(item: SongReviewSummary, field: string): string {
  return (item as any)[field] || ''
}

// Handle row selection/deselection
function selectRow(event: Event, { item }: { item: SongReviewSummary }) {
  // If clicking on the already selected row, deselect it
  if (selectedItem.value?.file === item.file) {
    selectedItem.value = null
    emit('row-select', null)
  } else {
    // Otherwise, select the new row
    selectedItem.value = item
    emit('row-select', item)
  }
}

// Handle field updates with debouncing
const updateField = useDebounceFn((item: SongReviewSummary, field: string, value: string) => {
  if (props.editable) {
    // Use composable directly for optimistic updates
    updateSummary({
      file: item.file,
      [field]: value
    })
  }
}, 600)

// Optimized function to get the appropriate Vuetify color class for status values
function getStatusClass(status: string | number | null | undefined): string {
  if (status === null || status === undefined) return ''

  const statusStr = String(status).toLowerCase()
  
  // Use cache to avoid repeated string operations
  if (statusClassCache.has(statusStr)) {
    return statusClassCache.get(statusStr)!
  }

  let className = ''
  if (statusStr.includes('approved') && !statusStr.includes('not')) {
    // Approved: Green, Low Intensity: Light Green
    className = statusStr.includes('low') ? 'text-green-lighten-1' : 'text-green'
  } else if (statusStr.includes('producers')) {
    // Producers Only: Purple
    className = 'text-purple'
  } else if (statusStr.includes('not')) {
    // Not Approved: Red
    className = 'text-red'
  }

  // Cache the result
  statusClassCache.set(statusStr, className)
  return className
}

// Simplified helper functions
function isRowSelected(item: SongReviewSummary): boolean {
  return selectedItem.value?.file === item.file
}

function hasGlobalError(): boolean {
  return !!error.value
}

// Handle click outside to unselect
function handleClickOutside(event: Event) {
  if (tableContainer.value && !tableContainer.value.contains(event.target as Node)) {
    selectedItem.value = null
    emit('row-select', null)
  }
}

// Setup click outside listener
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  // Clear cache on unmount
  statusClassCache.clear()
})
</script>

<template>
  <div ref="tableContainer">
    <v-data-table
      :headers="headers"
      :items="items"
      :loading="loading"
      loading-text="Loading song review data..."
      :class="[{ 'compact-view': !editable }]"
      hide-default-footer
      :items-per-page="-1"
      item-key="file"
      @click:row="selectRow"
      flat
    >
      <!-- ID Column -->
      <template v-slot:item.id="{ item }">
        <div 
          class="table-cell"
          :class="[getStatusClass(item.status), { 'selected-row': isRowSelected(item) }]"
        >
          {{ item.id }}
        </div>
      </template>

      <!-- Song Name Column -->
      <template v-slot:item.name="{ item }">
        <div 
          class="song-name-cell table-cell"
          :class="[
            getStatusClass(item.status), 
            { 
              'selected-row': isRowSelected(item),
              'update-error': hasGlobalError()
            }
          ]"
        >
          <div class="name-content">
            {{ item.name }}
            <!-- Global error indicator -->
            <v-icon
              v-if="hasGlobalError()"
              size="16"
              color="error"
              class="ml-2"
              :title="error || 'Update failed'"
            >
              mdi-alert-circle
            </v-icon>
          </div>
        </div>
      </template>

      <!-- Status Column -->
      <template v-slot:item.status="{ item }">
        <div 
          :class="[
            editable ? 'editable-cell' : 'readonly-cell',
            'table-cell',
            getStatusClass(item.status),
            { 'selected-row': isRowSelected(item) }
          ]"
        >
          <v-select
            v-if="editable"
            :model-value="getFieldValue(item, 'status')"
            :items="memoizedStatusOptions"
            density="compact"
            hide-details
            variant="outlined"
            @update:model-value="(value) => updateField(item, 'status', value)"
            class="responsive-field status-field"
          />
          <span v-else class="readonly-text truncated-text" :title="item.status || '-'">{{ item.status || '-' }}</span>
        </div>
      </template>

      <!-- Source Column -->
      <template v-slot:item.source="{ item }">
        <div 
          :class="[
            editable ? 'editable-cell' : 'readonly-cell',
            'table-cell',
            getStatusClass(item.status),
            { 'selected-row': isRowSelected(item) }
          ]"
        >
          <v-combobox
            v-if="editable"
            :model-value="getFieldValue(item, 'source')"
            :items="memoizedSourceOptions"
            density="compact"
            hide-details
            variant="outlined"
            @update:model-value="(value) => updateField(item, 'source', value)"
            class="responsive-field source-field"
          />
          <span v-else class="readonly-text truncated-text" :title="item.source || '-'">{{ item.source || '-' }}</span>
        </div>
      </template>

      <!-- Comment Column -->
      <template v-slot:item.comment="{ item }">
        <div 
          :class="[
            editable ? 'editable-cell' : 'readonly-cell',
            'table-cell',
            getStatusClass(item.status),
            { 'selected-row': isRowSelected(item) }
          ]"
        >
          <v-text-field
            v-if="editable"
            :model-value="getFieldValue(item, 'comment')"
            density="compact"
            hide-details
            variant="outlined"
            @update:model-value="(value) => updateField(item, 'comment', value)"
            class="responsive-field comment-field"
          />
          <span v-else class="readonly-text truncated-text" :title="item.comment || '-'">{{ item.comment || '-' }}</span>
        </div>
      </template>
    </v-data-table>
  </div>
</template>

<style scoped>
.editable-cell {
  padding: 4px;
}

.readonly-cell {
  padding: 4px;
}

.readonly-text {
  display: inline-block;
  padding: 8px 12px;
  min-height: 40px;
  line-height: 24px;
  font-weight: inherit;
}

/* Responsive field styling */
.responsive-field {
  width: 100%;
  max-width: 100%;
}

/* Force Vuetify form fields to use full column width */
.editable-cell .responsive-field :deep(.v-field) {
  width: 100% !important;
  min-width: 100% !important;
  max-width: 100% !important;
}

.editable-cell .responsive-field :deep(.v-field__field) {
  width: 100% !important;
}

.editable-cell .responsive-field :deep(.v-field__input) {
  width: 100% !important;
  min-width: 0 !important;
}

.editable-cell .responsive-field :deep(.v-input) {
  width: 100% !important;
  flex: 1 1 100% !important;
}

.editable-cell .responsive-field :deep(.v-input__control) {
  width: 100% !important;
}

/* Ensure select and combobox dropdowns also respect full width */
.editable-cell .responsive-field :deep(.v-select__selection) {
  max-width: 100% !important;
}

.editable-cell .responsive-field :deep(.v-combobox__selection) {
  max-width: 100% !important;
}

/* Status field - smaller since it has predefined options */
.status-field {
  min-width: clamp(120px, 15vw, 200px);
  width: 100%;
}

/* Source field - medium size for typical source names */
.source-field {
  min-width: clamp(100px, 12vw, 180px);
  width: 100%;
}

/* Comment field - larger since comments can be lengthy */
.comment-field {
  min-width: clamp(150px, 20vw, 300px);
  width: 100%;
}

/* Truncated text for readonly mode */
.truncated-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  display: block;
}

.song-name-cell {
  padding: 8px 4px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.name-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.selected-row {
  background-color: rgba(25, 118, 210, 0.08) !important;
  border-radius: 4px;
}

/* Optimistic update states */
.pending-update {
  background-color: rgba(33, 150, 243, 0.05) !important;
  border-left: 3px solid #2196f3 !important;
}

.update-error {
  background-color: rgba(244, 67, 54, 0.05) !important;
  border-left: 3px solid #f44336 !important;
}

/* Base table cell styling */
.table-cell {
  padding: 8px 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

/* Compact view - ONLY applies when NOT editable (view mode only) */
.compact-view :deep(.v-data-table__tr) {
  height: 28px !important;
}

.compact-view :deep(.v-data-table__td) {
  height: 28px !important;
  padding: 2px 6px !important;
  vertical-align: middle !important;
}

.compact-view :deep(.v-data-table__th) {
  height: 32px !important;
  padding: 4px 6px !important;
}

.compact-view .readonly-text {
  padding: 2px 4px !important;
  min-height: 24px !important;
  line-height: 18px !important;
  font-size: 0.8125rem !important;
  display: flex !important;
  align-items: center !important;
}

.compact-view .table-cell {
  padding: 2px !important;
  min-height: 24px !important;
  display: flex !important;
  align-items: center !important;
}

.compact-view .song-name-cell {
  padding: 2px !important;
}

.compact-view .readonly-cell {
  padding: 1px !important;
}

/* Responsive breakpoints for field sizing */
@media (max-width: 1200px) {
  .status-field {
    min-width: clamp(100px, 12vw, 160px);
  }
  
  .source-field {
    min-width: clamp(80px, 10vw, 140px);
  }
  
  .comment-field {
    min-width: clamp(120px, 18vw, 250px);
  }
}

@media (max-width: 768px) {
  .status-field {
    min-width: clamp(80px, 20vw, 120px);
  }
  
  .source-field {
    min-width: clamp(70px, 18vw, 100px);
  }
  
  .comment-field {
    min-width: clamp(100px, 25vw, 180px);
  }
  
  .readonly-text {
    font-size: 0.8rem;
    padding: 4px 8px;
  }
}

.v-data-table {
  table-layout: fixed;
  width: 100%;
}
</style>
