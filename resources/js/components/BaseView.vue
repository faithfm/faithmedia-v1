<template>
  <div>
    <!-- Loading State with Skeleton Loaders -->
    <div v-if="isLoading">
      <SkeletonDetailsView v-if="currentView === 'details'" :mode="mode" />
      <SkeletonPlaylistView v-else :mode="mode" />
    </div>

    <!-- Error State -->
    <div v-else-if="error.hasError">
      <ErrorDisplay
        :title="error.severity === 'error' ? 'Error' : (error.severity === 'warning' ? 'Warning' : 'Information')"
        :message="error.message"
        :details="error.details"
        :severity="error.severity"
        :retryable="error.retryable"
        :retrying="error.retrying"
        @retry="$emit('retry')"
      />
    </div>

    <div v-else class="d-flex flex-column gap-2 w-100">

      <!-- Folder List (only in folder mode) -->
      <div v-if="mode === 'folder' && folders.length > 0" class="mb-4">
        <v-list>
          <v-list-item
            v-for="folder in folders"
            :key="folder"
            :title="getLastSegment(folder)"
            prepend-icon="mdi-folder"
            @click="$emit('navigate-folder', folder)"
          />
        </v-list>
      </div>

      <!-- Content Section -->
      <slot
        :content="content"
        :selected-items="selectedItems"
        :playing-item="playingItem"
        :is-selected="isItemSelected"
        :is-playing="isItemPlaying"
        :on-item-select="selectItem"
        :on-item-menu="showItemMenu"
        :on-play-item="playItem"
        :get-file-name="getFileName"
        :get-file-path="getFilePath"
        :format-duration="formatDuration"
        :highlight-text="highlightText"
        :render-html="renderHtml"
        :has-matches="hasMatches"
        :item-has-matches="itemHasMatches"
        :is-search-active="isSearchActive"
      />
    </div>

    <!-- Item Menu Dialog -->
    <v-dialog v-model="showMenu" max-width="700" transition="dialog-bottom-transition">
      <v-card class="rounded-lg elevation-8">
        <!-- Header with file name if single item selected -->
        <v-card-item v-if="selectedItems.length === 1" class="bg-red-darken-4 text-white">
          <template v-slot:prepend>
            <v-avatar color="white" class="text-red-darken-4">
              <v-icon icon="mdi-file-music-outline" size="large"></v-icon>
            </v-avatar>
          </template>
          <v-card-title class="text-h5 font-weight-medium text-wrap">
            {{ getFileName(selectedItems[0].file) }}
          </v-card-title>
          <v-card-subtitle class="text-white text-opacity-70 text-wrap">
            {{ selectedItems[0].content || 'No title' }}
          </v-card-subtitle>
          <template v-slot:append>
            <v-btn
              icon
              variant="text"
              color="white"
              @click="showMenu = false"
              aria-label="Close dialog"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </template>
        </v-card-item>

        <!-- Multiple items header -->
        <v-card-item v-else class="bg-red-darken-4 text-white">
          <template v-slot:prepend>
            <v-avatar color="white" class="text-red-darken-4">
              <v-icon icon="mdi-file-multiple-outline" size="large"></v-icon>
            </v-avatar>
          </template>
          <v-card-title class="text-h5 font-weight-medium">
            {{ selectedItems.length }} items selected
          </v-card-title>
          <template v-slot:append>
            <v-btn
              icon
              variant="text"
              color="white"
              @click="showMenu = false"
              aria-label="Close dialog"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </template>
        </v-card-item>

        <!-- Quick Actions -->
        <v-card-text class="pt-4">
          <div class="d-flex flex-wrap justify-center gap-2 mb-4">
            <v-btn
              prepend-icon="mdi-play"
              color="red-darken-4"
              variant="tonal"
              @click="playSelectedItems"
              class="action-btn"
            >
              {{ selectedItems.length > 1 ? 'Play First' : 'Play' }}
            </v-btn>

            <v-btn
              v-if="mode === 'search'"
              prepend-icon="mdi-folder"
              color="red-darken-4"
              variant="tonal"
              @click="goToItemFolder"
              :disabled="selectedItems.length > 1"
              class="action-btn"
            >
              Go to folder
            </v-btn>
          </div>
        </v-card-text>

        <!-- File Information with Sandbox (only for single item) -->
        <template v-if="selectedItems.length === 1">
          <v-divider></v-divider>

          <v-expansion-panels variant="accordion" class="mt-2">
            <v-expansion-panel elevation="0" rounded="lg">
              <v-expansion-panel-title class="text-subtitle-1 font-weight-medium">
                <div class="d-flex align-center">
                  <v-icon icon="mdi-information-outline" color="red-darken-4" class="mr-2"></v-icon>
                  File Information
                </div>
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <!-- Sandbox implementation -->
                <v-form v-if="sandbox" lazy-validation v-model="formIsValid" class="px-4 py-3 bg-grey-lighten-5 rounded-lg">
                  <v-row>
                    <v-col cols="12" v-for="(field, index) in formFields" :key="index">
                      <v-text-field
                        v-model="sandbox[field.name]"
                        :label="field.label"
                        :disabled="field.disabled"
                        :required="field.required"
                        :class="{ 'field-modified': fieldIsDirty(field.name) }"
                        variant="filled"
                        density="compact"
                        bg-color="white"
                        hide-details="auto"
                        class="rounded-lg"
                      >
                        <template v-slot:append-inner v-if="fieldIsDirty(field.name)">
                          <v-icon icon="mdi-pencil" color="red-darken-4" size="small"></v-icon>
                        </template>
                      </v-text-field>
                    </v-col>
                  </v-row>
                  <v-row class="justify-center mt-4">
                    <v-btn
                      color="red-darken-4"
                      @click="saveFileInfo"
                      :disabled="!formIsDirty"
                      prepend-icon="mdi-content-save"
                      variant="tonal"
                      class="px-6"
                    >
                      Save Changes
                    </v-btn>
                  </v-row>
                </v-form>
              </v-expansion-panel-text>
            </v-expansion-panel>

            <v-expansion-panel elevation="0" rounded="lg">
              <v-expansion-panel-title class="text-subtitle-1 font-weight-medium">
                <div class="d-flex align-center">
                  <v-icon icon="mdi-download-outline" color="red-darken-4" class="mr-2"></v-icon>
                  Download Options
                </div>
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <div class="d-flex flex-wrap justify-center gap-2">
                  <v-btn
                    prepend-icon="mdi-file-music"
                    color="red-darken-4"
                    variant="outlined"
                    class="download-btn"
                    :href="oggUrl(sandbox['file'])"
                    target="_blank"
                    download
                  >
                    OGG Master
                  </v-btn>
                  <v-btn
                    prepend-icon="mdi-music"
                    color="red-darken-4"
                    variant="outlined"
                    class="download-btn"
                    :href="mp3Url(sandbox['file'])"
                    target="_blank"
                    download
                  >
                    MP3 (App)
                  </v-btn>
                  <v-btn
                    v-if="isInMusicFolder"
                    prepend-icon="mdi-file-music-outline"
                    color="red-darken-4"
                    variant="outlined"
                    class="download-btn"
                    :href="origUrl(sandbox['file'])"
                    target="_blank"
                    download
                  >
                    MP3 (MST)
                  </v-btn>
                </div>
              </v-expansion-panel-text>
            </v-expansion-panel>

            <!-- Technical Details Panel -->
            <v-expansion-panel elevation="0" rounded="lg">
              <v-expansion-panel-title class="text-subtitle-1 font-weight-medium">
                <div class="d-flex align-center">
                  <v-icon icon="mdi-file-cog-outline" color="red-darken-4" class="mr-2"></v-icon>
                  Technical Details
                </div>
              </v-expansion-panel-title>
              <v-expansion-panel-text>
                <v-list density="compact" class="bg-grey-lighten-5 rounded-lg">
                  <v-list-item>
                    <template v-slot:prepend>
                      <v-icon icon="mdi-file-outline" size="small" color="grey"></v-icon>
                    </template>
                    <v-list-item-title class="text-body-2 font-weight-medium">File Path</v-list-item-title>
                    <v-tooltip location="bottom" :text="selectedItems[0].file">
                      <template v-slot:activator="{ props }">
                        <v-list-item-subtitle class="text-caption text-truncate" style="max-width: 100%;" v-bind="props">
                          {{ selectedItems[0].file }}
                        </v-list-item-subtitle>
                      </template>
                    </v-tooltip>
                  </v-list-item>

                  <v-list-item v-if="selectedItems[0].seconds">
                    <template v-slot:prepend>
                      <v-icon icon="mdi-clock-outline" size="small" color="grey"></v-icon>
                    </template>
                    <v-list-item-title class="text-body-2 font-weight-medium">Duration</v-list-item-title>
                    <v-list-item-subtitle class="text-caption">{{ formatDuration(selectedItems[0].seconds) }}</v-list-item-subtitle>
                  </v-list-item>

                  <v-list-item v-if="selectedItems[0].bytes">
                    <template v-slot:prepend>
                      <v-icon icon="mdi-harddisk" size="small" color="grey"></v-icon>
                    </template>
                    <v-list-item-title class="text-body-2 font-weight-medium">File Size</v-list-item-title>
                    <v-list-item-subtitle class="text-caption">{{ formatFileSize(selectedItems[0].bytes) }}</v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-expansion-panel-text>
            </v-expansion-panel>
          </v-expansion-panels>
        </template>

        <!-- Card actions section removed as close button moved to header -->
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Content } from '@/types/models'
import { useContentHelpers } from '@/composables/useContentHelpers'
import { filePath } from '@/utils/fileUtils'
import { useRowSelection } from '@/composables/useRowSelection'
import { useFolderNavigation } from '@/composables/useNavigation'
import type { ErrorState } from '@/composables/useErrorHandling'
import SkeletonDetailsView from './SkeletonDetailsView.vue'
import SkeletonPlaylistView from './SkeletonPlaylistView.vue'
import ErrorDisplay from './ErrorDisplay.vue'
import { useDbContentUrls } from '@/composables/useDbContentUrls'

// Initialize URL generation composable (now loads config internally)
const { oggUrl, mp3Url, origUrl } = useDbContentUrls()


// Props
interface Props {
  content: Content[]
  folders: string[]
  mode: 'search' | 'folder'
  isLoading?: boolean
  path: string
  searchQuery?: string
  currentView?: 'details' | 'playlist'
  error?: ErrorState
  playingItemId?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  path: '',
  searchQuery: '',
  currentView: 'details',
  error: () => ({
    hasError: false,
    message: '',
    details: undefined,
    severity: 'error',
    retryable: false,
    retrying: false
  })
})

// Emits
const emit = defineEmits([
  'navigate-folder',
  'select-item',
  'play-item',
  'save-file-info',
  'download-item',
  'retry'
])

// State
const showMenu = ref(false)
const sandbox = ref<Partial<Content>>({})
const formIsValid = ref(true)
const formIsDirty = ref(false)

// Form fields configuration
interface FormField {
  name: keyof Pick<Content, 'content' | 'guests' | 'series' | 'tags'>
  label: string
  required: boolean
  disabled: boolean
}

const formFields: FormField[] = [
  { name: 'content', label: 'Content', required: true, disabled: false },
  { name: 'guests', label: 'Guests', required: false, disabled: false },
  { name: 'series', label: 'Series', required: false, disabled: false },
  { name: 'tags', label: 'Tags', required: false, disabled: false }
]

// Create a computed ref for the search query
const searchQueryRef = computed(() => props.searchQuery)

// Check if the selected item's file path is in music folder
const isInMusicFolder = computed(() => {
  if (selectedItems.value.length !== 1 || !selectedItems.value[0]?.file) {
    return false
  }
  return selectedItems.value[0].file.toLowerCase().includes('music/')
})

// Helpers with search highlighting
const {
  getFileName,
  getFilePath,
  formatDuration,
  highlightText,
  renderHtml,
  hasMatches,
  itemHasMatches,
  isSearchActive
} = useContentHelpers(searchQueryRef)

// Row Selection
const rowSelection = useRowSelection()
const selectedItems = computed(() => {
  return props.content.filter(item => rowSelection.isSelected(item.file))
})

// Handle null value from playingRow
const playingItem = computed(() => {
  const playingFile = rowSelection.playingRow.value
  return playingFile ? props.content.find(item => item.file === playingFile) : null
})

// Folder Navigation
const pathRef = computed(() => props.path)
const { getLastSegment } = useFolderNavigation(pathRef)

// Methods
const isItemSelected = (item: Content) => rowSelection.isSelected(item.file)
const isItemPlaying = (item: Content) => {
  // First check if the item matches the playing item ID from props
  if (props.playingItemId && item.file === props.playingItemId) {
    return true
  }
  // Fallback to row selection for backward compatibility
  return rowSelection.isPlaying(item.file)
}

// Format file size to human-readable format
const formatFileSize = (bytes?: number): string => {
  if (!bytes) return '0 B'

  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  let size = bytes
  let unitIndex = 0

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`
}

const selectItem = (item: Content, event?: MouseEvent) => {
  rowSelection.handleRowSelect(item.file, event)
  const selected = selectedItems.value
  if (selected.length === 1) {
    emit('select-item', selected[0])
  }
}

const showItemMenu = (item: Content) => {
  if (!rowSelection.isSelected(item.file)) {
    rowSelection.handleRowSelect(item.file)
  }
  showMenu.value = true
}

const playItem = (item: Content) => {
  rowSelection.setPlayingRow(item.file)
  emit('play-item', item)
}

const playSelectedItems = () => {
  const selected = selectedItems.value
  if (selected.length > 0) {
    // Play first selected item
    playItem(selected[0])
  }
  showMenu.value = false
}

const goToItemFolder = () => {
  const selected = selectedItems.value
  if (selected.length === 1 && props.mode === 'search') {
    // Get the file path
    const filePathStr = selected[0].file

    // Extract the folder path directly
    if (filePathStr) {
      const folderPath = filePath(filePathStr)

      // Emit the folder path
      emit('navigate-folder', folderPath)
    }
  }
  showMenu.value = false
}


// Sandbox methods
const fieldIsDirty = (fieldName: string) => {
  if (selectedItems.value.length !== 1 || !sandbox.value) return false

  const selectedItem = selectedItems.value[0]
  if (!(fieldName in selectedItem) || !(fieldName in sandbox.value)) return false

  // Check if the field is one of our editable fields
  if (fieldName === 'content' || fieldName === 'guests' ||
      fieldName === 'series' || fieldName === 'tags') {
    return selectedItem[fieldName] !== sandbox.value[fieldName]
  }

  return false
}

// Initialize sandbox when menu is opened
watch(showMenu, (isOpen: boolean) => {
  if (isOpen && selectedItems.value.length === 1) {
    // Create a copy of the selected item for the sandbox
    sandbox.value = { ...selectedItems.value[0] }

    // Check if any fields are dirty after initialization
    formIsDirty.value = formFields.some(field => fieldIsDirty(field.name))
  }
})

// Watch for changes in the sandbox values to update formIsDirty
watch(() => sandbox.value, () => {
  if (selectedItems.value.length === 1) {
    formIsDirty.value = formFields.some(field => fieldIsDirty(field.name))
  }
}, { deep: true })

// Save file information
const saveFileInfo = () => {
  if (selectedItems.value.length !== 1) return

  // Create a copy of the selected item
  const updatedItem: Content = { ...selectedItems.value[0] }

  // Update the item with sandbox values in a type-safe way
  formFields.forEach(field => {
    if (sandbox.value[field.name] !== undefined) {
      updatedItem[field.name] = sandbox.value[field.name]
    }
  })

  // Emit the updated item to the parent component for saving to the server
  emit('save-file-info', updatedItem)


}

// Expose key properties and methods for child components
defineExpose({
  selectedItems,
  playingItem,
  isItemSelected,
  isItemPlaying,
  selectItem,
  showItemMenu,
  playItem,
  rowSelection
})
</script>

<style scoped>
.selected {
  background-color: rgba(var(--v-theme-red-darken-4), 0.1);
}

.playing:not(.selected) {
  background-color: rgba(var(--v-theme-red-darken-4), 0.05);
}

.cursor-pointer {
  cursor: pointer;
}

.field-modified {
  border-left: 3px solid rgb(var(--v-theme-red-darken-4)) !important;
  transition: all 0.2s ease;
}
</style>
