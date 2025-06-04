<template>
  <v-dialog
    v-model="isSearchExpanded"
    fullscreen
    transition="dialog-bottom-transition"
    class="modern-search-dialog"
    content-class="modern-search-dialog-content"
  >
    <v-card flat class="modern-search-card">
      <div class="search-header pa-4">
        <div class="d-flex align-center">
          <form @submit.prevent="submitSearch" class="flex-grow-1">
            <v-text-field
              v-model="searchInput"
              density="comfortable"
              hide-details
              placeholder="Search content..."
              prepend-inner-icon="mdi-magnify"
              append-inner-icon="mdi-send"
              @click:append-inner="submitSearch"
              variant="solo"
              bg-color="grey-lighten-4"
              class="flex-grow-1 modern-search-input rounded-pill"
              autofocus
              single-line
              @keyup.enter="submitSearch"
            ></v-text-field>
          </form>
          <v-btn
            icon="mdi-close"
            variant="text"
            @click="closeSearchOverlay"
            size="small"
            class="ml-2"
            color="grey-darken-1"
          ></v-btn>
        </div>
      </div>
      
      <!-- Recent Searches Section -->
      <v-card-text v-if="recentSearchItems.length > 0" class="pt-0 recent-searches-container">
        <div class="d-flex justify-space-between align-center mb-3 mt-2">
          <span class="text-subtitle-2 font-weight-medium">Recent Searches</span>
          <v-btn
            variant="text"
            density="comfortable"
            size="small"
            @click="clearAllRecentSearches"
            color="grey-darken-1"
          >Clear</v-btn>
        </div>
        <div class="d-flex flex-wrap">
          <v-chip
            v-for="search in recentSearchItems.slice(0, 5)"
            :key="search"
            size="small"
            variant="elevated"
            class="mr-2 mb-2 rounded-pill"
            color="grey-lighten-3"
            @click="selectSearch(search)"
            prepend-icon="mdi-clock-outline"
          >
            {{ search }}
          </v-chip>
        </div>
      </v-card-text>
      
      <v-card-text v-else class="text-center text-medium-emphasis pt-6">
        <v-icon icon="mdi-magnify" size="large" color="grey-lighten-1" class="mb-2"></v-icon>
        <p>No recent searches</p>
        <p class="text-caption">Try searching for content by title, speaker, or topic</p>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// Props
const props = defineProps<{
  modelValue: boolean
  searchValue: string
  recentSearchItems: string[]
}>()

// Emits
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'update:searchValue', value: string): void
  (e: 'search', value: string): void
  (e: 'select-search', value: string): void
  (e: 'clear-all-searches'): void
}>()

// Computed properties with getters and setters for v-model
const isSearchExpanded = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value)
})

const searchInput = computed({
  get: () => props.searchValue,
  set: (value: string) => emit('update:searchValue', value)
})

// Methods
const closeSearchOverlay = () => {
  isSearchExpanded.value = false
}

const submitSearch = () => {
  if (searchInput.value.trim()) {
    emit('search', searchInput.value)
  }
}

const selectSearch = (search: string) => {
  emit('select-search', search)
}

const clearAllRecentSearches = () => {
  emit('clear-all-searches')
}
</script>

<style scoped>
/* Modern search dialog styling */
.modern-search-dialog :deep(.v-overlay__content) {
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
  border-radius: 0;
}

.modern-search-card {
  border-radius: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.search-header {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.modern-search-input :deep(.v-field__field) {
  font-size: 1rem;
}

.modern-search-input :deep(.v-field) {
  border-radius: 24px !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.modern-search-input :deep(.v-field__prepend-inner) {
  padding-right: 8px;
  color: rgba(0, 0, 0, 0.54);
}

/* Recent searches container */
.recent-searches-container {
  overflow-y: auto;
  flex-grow: 1;
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
  .modern-search-card {
    flex-direction: column;
    max-height: 100vh;
  }
  
  .search-header {
    padding: 8px 16px !important;
  }
  
  .modern-search-dialog :deep(.v-overlay__content) {
    display: flex;
    align-items: flex-start;
    overflow-y: auto;
  }
  
  .modern-search-card {
    max-height: 100%;
    overflow-y: auto;
  }
  
  .recent-searches-container {
    padding-top: 0;
    padding-bottom: 16px;
    max-height: calc(100vh - 80px);
    overflow-y: auto;
  }
  
  /* Ensure the search input is always visible */
  .search-header {
    position: sticky;
    top: 0;
    z-index: 1;
    background-color: white;
  }
}
</style>
