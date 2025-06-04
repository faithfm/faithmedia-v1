<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { usePage } from '@inertiajs/vue3'
import SharedLayout from '../layouts/SharedLayout.vue'
import EditableTable from '../components/EditableTable.vue'
import ReviewCard from '../components/ReviewCard.vue'
import { useReviewSummaries, type SongReviewSummary } from '../composables/useReviewSummaries'

interface TableHeader {
  title: string;
  value: string;
  width: string;
  sortable?: boolean;
}

// Layout configuration for the page
defineOptions({
  layout: SharedLayout,
  layoutProps: {
    isAuthenticated: computed(() => !!(usePage().props.auth as { user: unknown }).user),
    user: computed(() => (usePage().props.auth as { user: unknown }).user)
  }
})

// Define page title
const pageTitle = ref('Song Review Summary')

// Status options
const statusOptions = [
  "approved",
  "approved - low intensity",
  "producers only",
  "not approved"
]

// Use the review summaries composable
const {
  summaries,
  isLoading,
  refreshSummaries,
  getSourceSuggestions
} = useReviewSummaries()

// Table headers
const headers: TableHeader[] = [
  { title: "ID", value: "id", width: "5%" },
  { title: "Song", value: "name", width: "33%" },
  { title: "Status", value: "status", width: "15%" },
  { title: "Source", value: "source", width: "15%" },
  { title: "Comment", value: "comment", sortable: false, width: "32%" },
]

// Selected item state
const selectedItem = ref<SongReviewSummary | null>(null)

// Panel collapse state
const isPanelCollapsed = ref(true)

// Edit mode state
const isEditMode = ref(true)


// Handle row selection from EditableTable
function handleRowSelect(item: SongReviewSummary | null) {
  selectedItem.value = item
  
  // Auto-expand panel when a song is selected, collapse when deselected
  if (item && isPanelCollapsed.value) {
    isPanelCollapsed.value = false
  } else if (!item && !isPanelCollapsed.value) {
    isPanelCollapsed.value = true
  }
}

// Toggle panel collapse
function togglePanel() {
  isPanelCollapsed.value = !isPanelCollapsed.value
}

// Scroll position tracking for manual sticky positioning
const scrollY = ref(0)
const reviewPanelRef = ref<HTMLElement | null>(null)

// Throttled scroll handler for better performance
let scrollTimeout: number | null = null
const throttledScrollHandler = (callback: () => void) => {
  if (scrollTimeout) return
  
  scrollTimeout = requestAnimationFrame(() => {
    callback()
    scrollTimeout = null
  })
}

// Handle scroll events to manually position the review panel
onMounted(() => {
  const handleScroll = () => {
    throttledScrollHandler(() => {
      scrollY.value = window.scrollY || document.documentElement.scrollTop
    })
  }

  // Listen to both window scroll and the v-main scroll
  window.addEventListener('scroll', handleScroll, { passive: true })
  
  // Also listen to the layout scroll event from SharedLayout
  const handleLayoutScroll = (event: any) => {
    throttledScrollHandler(() => {
      scrollY.value = event.detail.scrollTop
    })
  }
  
  document.addEventListener('layout-scroll', handleLayoutScroll, { passive: true })

  // Cleanup
  return () => {
    window.removeEventListener('scroll', handleScroll)
    document.removeEventListener('layout-scroll', handleLayoutScroll)
    if (scrollTimeout) {
      cancelAnimationFrame(scrollTimeout)
    }
  }
})

// Computed style for manual sticky positioning
const reviewPanelStyle = computed(() => {
  if (isPanelCollapsed.value) return {}
  
  return {
    position: 'fixed' as const,
    top: '84px', // Account for header height
    right: '20px',
    width: '350px',
    zIndex: 100,
    maxHeight: 'calc(100vh - 104px)',
    overflow: 'visible'
  }
})
</script>

<template>
  <div class="review-summary-container pa-4">
    <v-card flat border rounded="lg" class="pa-4">
      <v-card-title class="d-flex align-center">
        <span class="text-h5 font-weight-bold">{{ pageTitle }}</span>
        <v-spacer></v-spacer>
        
        <!-- Edit Mode Toggle -->
        <v-btn
          :color="isEditMode ? 'grey' : 'primary'"
          :variant="isEditMode ? 'outlined' : 'elevated'"
          @click="isEditMode = !isEditMode"
          class="mr-2"
          :title="isEditMode ? 'Switch to View Mode' : 'Switch to Edit Mode'"
        >
          <v-icon>{{ isEditMode ? 'mdi-eye' : 'mdi-pencil' }}</v-icon>
          <span class="ml-2">{{ isEditMode ? 'View Mode' : 'Edit Mode' }}</span>
        </v-btn>
        
        <v-btn icon variant="text" @click="refreshSummaries" :loading="isLoading" title="Refresh data">
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <p class="text-body-1 mb-4">
          This page enables content managers to make and track decisions about songs based on collected reviews.
        </p>

        <!-- Table with dynamic width to accommodate fixed review panel -->
        <div class="table-layout mt-4" :class="{ 'with-review-panel': !isPanelCollapsed }">
          <EditableTable
            :headers="headers"
            :items="summaries"
            :status-options="statusOptions"
            :source-options="getSourceSuggestions"
            :loading="isLoading"
            :editable="isEditMode"
            @row-select="handleRowSelect"
          />
        </div>

        <!-- Fixed positioned review panel -->
        <div v-if="!isPanelCollapsed" class="fixed-review-panel" :style="reviewPanelStyle" ref="reviewPanelRef">
          <ReviewCard :item="selectedItem" :show-collapse-button="true" @toggle-collapse="togglePanel" />
        </div>

        <!-- Simple hint button - only show when no song is selected -->
        <v-btn
          v-if="!selectedItem"
          class="collapsed-panel-toggle"
          color="grey"
          variant="outlined"
          disabled
        >
          <v-icon>mdi-comment-multiple-outline</v-icon>
          <span class="ml-2">Select a Song First</span>
        </v-btn>

        <div class="mt-4">
          <p class="text-caption text-grey">
            Click on a song row to view its review details. Click again to deselect.
            {{ isEditMode ? 'Edit status, source, or comment fields directly in the table.' : 'Use the Edit Mode button to enable editing.' }}
          </p>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<style scoped>
.review-summary-container {
  height: 100%;
  width: 100%;
}

/* Table layout - dynamic width based on review panel state */
.table-layout {
  width: 100%;
  transition: all 0.3s ease;
}

/* When review panel is open, make room for it */
.table-layout.with-review-panel {
  width: calc(100% - 390px); /* Account for panel width (350px) + gap (40px) */
  max-width: calc(100% - 390px);
}

/* Fixed positioned review panel */
.fixed-review-panel {
  /* Styles are applied via computed style */
  overflow-y: auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  background: white;
}

.collapsed-panel-toggle {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Mobile responsiveness */
@media (max-width: 960px) {
  .fixed-review-panel {
    position: relative !important;
    top: auto !important;
    right: auto !important;
    width: 100% !important;
    max-height: none !important;
    margin-top: 16px;
  }
}
</style>
