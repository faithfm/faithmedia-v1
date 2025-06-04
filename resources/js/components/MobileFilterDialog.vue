<template>
  <v-dialog
    v-model="isFilterDialogOpen"
    fullscreen
    transition="dialog-bottom-transition"
    class="modern-filter-dialog"
    content-class="modern-filter-dialog-content"
  >
    <v-card flat class="modern-filter-card">
      <div class="filter-header pa-4">
        <div class="d-flex align-center justify-space-between">
          <h2 class="text-h6 font-weight-medium">Filter Content</h2>
          <v-btn
            icon="mdi-close"
            variant="text"
            @click="closeFilterDialog"
            size="small"
            color="grey-darken-1"
          ></v-btn>
        </div>
      </div>
      
      <!-- Clear Filter Section (when active) -->
      <v-card-text v-if="currentFilter" class="pt-0 pb-2">
        <v-chip
          prepend-icon="mdi-filter-remove"
          color="red-darken-1"
          variant="tonal"
          size="large"
          class="rounded-pill clear-filter-chip"
          @click="clearFilter"
        >
          Clear Filter: {{ getFilterDescription(currentFilter) }}
        </v-chip>
      </v-card-text>
      
      <!-- Recent Filters Section -->
      <v-card-text v-if="recentFilterItems.length > 0" class="pt-0 recent-filters-container">
        <div class="d-flex justify-space-between align-center mb-3 mt-2">
          <span class="text-subtitle-2 font-weight-medium">Recent</span>
        </div>
        <div class="d-flex flex-wrap">
          <v-chip
            v-for="filterSlug in recentFilterItems.slice(0, 4)"
            :key="filterSlug"
            size="default"
            variant="elevated"
            class="mr-2 mb-2 rounded-pill filter-chip"
            :color="filterSlug === currentFilter ? 'primary' : 'grey-lighten-3'"
            @click="selectFilter(filterSlug)"
            :prepend-icon="filterSlug === currentFilter ? 'mdi-check' : 'mdi-clock-outline'"
          >
            {{ getFilterDescription(filterSlug) }}
          </v-chip>
        </div>
        <v-divider class="mt-3 mb-2"></v-divider>
      </v-card-text>
      
      <!-- All Filters Section -->
      <v-card-text class="pt-0 all-filters-container">
        <div class="mb-3">
          <span class="text-subtitle-2 font-weight-medium">All Filters</span>
        </div>
        <v-list class="pa-0">
          <v-list-item
            v-for="filter in prefilters"
            :key="filter.slug"
            :title="filter.name"
            :prepend-icon="filter.slug === currentFilter ? 'mdi-check' : 'mdi-filter-outline'"
            :active="filter.slug === currentFilter"
            @click="selectFilter(filter.slug)"
            class="filter-list-item rounded-lg mb-1"
            :class="{ 'active-filter': filter.slug === currentFilter }"
            density="comfortable"
          />
        </v-list>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// Props
const props = defineProps<{
  modelValue: boolean
  prefilters: any[]
  recentFilterItems: string[]
  currentFilter: string
}>()

// Emits
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'select-filter', filterSlug: string): void
  (e: 'clear-filter'): void
}>()

// Computed properties with getters and setters for v-model
const isFilterDialogOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})

// Methods
const closeFilterDialog = () => {
  isFilterDialogOpen.value = false
}

const selectFilter = (filterSlug: string) => {
  emit('select-filter', filterSlug)
  // Auto-close dialog after selection
  closeFilterDialog()
}

const clearFilter = () => {
  emit('clear-filter')
  // Auto-close dialog after clearing
  closeFilterDialog()
}

// Helper Methods
const getFilterDescription = (filterSlug: string) => {
  const filter = props.prefilters.find(f => f.slug === filterSlug)
  return filter ? filter.name : filterSlug
}
</script>

<style scoped>
/* Modern filter dialog styling */
.modern-filter-dialog :deep(.v-overlay__content) {
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
  border-radius: 0;
}

.modern-filter-card {
  border-radius: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.filter-header {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  background-color: white;
}

/* Filter sections */
.recent-filters-container,
.all-filters-container {
  overflow-y: auto;
}

.all-filters-container {
  flex-grow: 1;
}

/* Filter chips styling */
.filter-chip {
  min-height: 44px;
  font-size: 0.875rem;
}

.clear-filter-chip {
  min-height: 48px;
  font-size: 1rem;
  font-weight: 500;
}

/* Filter list items */
.filter-list-item {
  min-height: 48px;
  margin-bottom: 4px;
  border: 1px solid transparent;
  transition: all 0.2s ease;
}

.filter-list-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.active-filter {
  background-color: rgba(var(--v-theme-primary), 0.08);
  border-color: rgba(var(--v-theme-primary), 0.2);
}

.active-filter :deep(.v-list-item__prepend .v-icon) {
  color: rgb(var(--v-theme-primary));
}

/* Dialog transition */
:deep(.dialog-bottom-transition-enter-active),
:deep(.dialog-bottom-transition-leave-active) {
  transition: transform 0.3s ease-in-out;
}

:deep(.dialog-bottom-transition-enter-from),
:deep(.dialog-bottom-transition-leave-to) {
  transform: translateY(100%);
}

/* Landscape mode optimizations */
@media (orientation: landscape) and (max-width: 959px) {
  .modern-filter-card {
    flex-direction: column;
    max-height: 100vh;
  }
  
  .filter-header {
    padding: 8px 16px !important;
  }
  
  .modern-filter-dialog :deep(.v-overlay__content) {
    display: flex;
    align-items: flex-start;
    overflow-y: auto;
  }
  
  .modern-filter-card {
    max-height: 100%;
    overflow-y: auto;
  }
  
  .recent-filters-container,
  .all-filters-container {
    padding-top: 0;
    padding-bottom: 16px;
    max-height: calc(100vh - 80px);
    overflow-y: auto;
  }
  
  /* Ensure the header is always visible */
  .filter-header {
    position: sticky;
    top: 0;
    z-index: 1;
    background-color: white;
  }
}
</style>
