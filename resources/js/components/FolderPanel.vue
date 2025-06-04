<template>
  <div>
    <!-- Toggle button -->
    <v-tooltip
      :text="isExpanded ? 'Hide panel' : 'Show folders'"
      location="top"
    >
      <template v-slot:activator="{ props }">
        <v-btn
          v-if="folders.length > 0" 
          v-bind="props"
          class="folder-toggle-btn"
          @click="togglePanel"
          :aria-label="isExpanded ? 'Hide panel' : 'Show folders'"
          :aria-expanded="isExpanded"
          variant="text"
          density="compact"
          icon
        >
          <v-icon size="small">{{ isExpanded ? 'mdi-chevron-left' : 'mdi-chevron-right' }}</v-icon>
        </v-btn>
      </template>
    </v-tooltip>
    
    <!-- Folder Panel -->
    <div class="folder-panel" :class="{'folder-panel--expanded': isExpanded}">
      <div v-if="isExpanded" class="folder-list-container">
        <!-- Folders Section -->
        <div v-if="folders.length > 0" class="panel-section">
          <div class="panel-header">
            <v-icon size="small" class="mr-1">mdi-folder-multiple</v-icon>
            <h3 class="panel-title">Folders</h3>
            <span class="count-badge ml-1">
              {{ folders.length > 0 ? `(${folders.length})` : '' }}
            </span>
          </div>
          
          <div class="folder-cards">
            <v-card
              v-for="folder in folders"
              :key="folder"
              class="folder-card mb-1"
              @click="$emit('navigate-folder', folder)"
              hover
              variant="plain"
            >
              <v-card-text class="d-flex align-center py-1 px-2">
                <v-icon 
                  color="primary" 
                  size="small" 
                  class="mr-1"
                >
                  mdi-folder
                </v-icon>
                <span class="folder-name text-truncate">{{ getLastSegment(folder) }}</span>
              </v-card-text>
            </v-card>
          </div>
        </div>
        
        <!-- Empty State -->
        <div v-if="folders.length === 0" class="empty-state">
          <v-icon size="large" class="mb-2">mdi-folder-open</v-icon>
          <p>No folders found in this location.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useFolderNavigation } from '@/composables/useNavigation'

// Props
interface Props {
  folders: string[]
  content: any // Using any for now, but should be properly typed
  mode: 'search' | 'folder'
  path: string
  initialExpanded?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  initialExpanded: false
})

// Emits
const emit = defineEmits(['navigate-folder', 'update:expanded'])

// State
const isExpanded = ref(props.initialExpanded)

// Computed
const pathRef = computed(() => props.path)
const { getLastSegment } = useFolderNavigation(pathRef)

// Methods
const togglePanel = () => {
  isExpanded.value = !isExpanded.value
  emit('update:expanded', isExpanded.value)
}


</script>

<style scoped>
.folder-toggle-btn {
  display: flex;
  align-items: center;
  padding: 4px;
  background: transparent;
  border: none;
  cursor: pointer;
  position: relative;
  z-index: 20;
  height: 28px;
  margin-bottom: 4px;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.folder-toggle-btn:hover {
  background: rgba(0, 0, 0, 0.05);
}

.folder-panel {
  position: absolute;
  left: 0;
  top: 0;
  width: 0;
  overflow: hidden;
  transition: all 0.3s ease;
  background: #f5f5f5;
  border-right: 1px solid #e0e0e0;
  height: 100%;
  opacity: 0;
  visibility: hidden;
  z-index: 10;
  border-radius: 4px;
}

.folder-panel--expanded {
  width: 220px;
  opacity: 1;
  visibility: visible;
  position: relative;
}

.folder-list-container {
  overflow-y: visible; /* Remove separate scroll area */
  padding: 8px;
}

.panel-section {
  margin-bottom: 16px;
}

.panel-header {
  display: flex;
  align-items: center;
  padding: 6px 4px;
  margin-bottom: 8px;
  border-bottom: 1px solid #e0e0e0;
}

.panel-title {
  font-size: 0.95rem;
  font-weight: 500;
  margin: 0;
  padding: 0;
  margin-left: 8px;
}

.folder-cards {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.folder-card {
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 0; /* Reduce minimum height */
}

.folder-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.folder-name {
  font-size: 0.9rem;
  font-weight: 500;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  color: #757575;
  text-align: center;
}

@media (min-width: 1200px) {
  .folder-panel--expanded {
    width: 240px;
  }
}

@media (max-width: 1199px) and (min-width: 768px) {
  .folder-toggle-btn {
    padding: 6px 10px;
  }
  
  .folder-panel--expanded {
    width: 200px;
  }
}

/* Mobile-specific folder panel styles */
@media (max-width: 767px) {
  .folder-toggle-btn {
    width: 100%;
    justify-content: space-between;
    border-radius: 4px;
    margin-bottom: 8px;
    height: 36px; /* Larger touch target */
    padding: 8px 12px;
    background-color: #f5f5f5;
    border: 1px solid #e0e0e0;
  }
  
  .folder-toggle-btn:hover {
    background-color: #eeeeee;
  }
  
  .folder-panel {
    width: 100%;
    height: auto;
    max-height: 0;
    border-right: none;
    border-bottom: 1px solid #e0e0e0;
    position: relative;
    transition: max-height 0.3s ease, opacity 0.2s ease, margin 0.3s ease;
  }
  
  .folder-panel--expanded {
    width: 100%;
    max-height: 300px; /* Restore max-height for visibility */
    margin-bottom: 16px;
    overflow-y: visible; /* Ensure no separate scroll area */
    background-color: #f9f9f9;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  }
  
  .folder-list-container {
    padding: 12px;
  }
  
  .folder-card {
    margin-bottom: 6px;
  }
  
  .folder-card .v-card-text {
    padding: 8px 12px;
  }
  
  .folder-name {
    font-size: 0.95rem;
  }
}
</style>
