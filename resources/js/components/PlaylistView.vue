<template>
  <BaseLayout
    :content="content.items"
    :folders="folders"
    :mode="mode"
    :is-loading="isLoading"
    :path="path"
    :search-query="searchQuery"
    :error="error"
    :current-view="'playlist'"
    @navigate-folder="$emit('navigate-folder', $event)"
    @select-item="$emit('select-item', $event)"
    @play-item="$emit('play-item', $event)"
    @save-file-info="$emit('save-file-info', $event)"
    @download-item="(item, format) => $emit('download-item', item, format)"
    @retry="handleRetry"
  >
    <template #default="{ content, isSelected, isPlaying, onItemSelect, onItemMenu, onPlayItem, getFileName, getFilePath, formatDuration, renderHtml, highlightText, itemHasMatches }">
      <v-row class="card-grid">
        <v-col v-for="item in content" :key="item.file" cols="12" md="6" lg="4">
          <v-card
            :class="{ 
              'selected': isSelected(item),
              'playing': isPlaying(item),
              'has-matches': itemHasMatches(item),
              'zero-duration': hasZeroDuration(item)
            }"
            @click="(event: MouseEvent) => { onItemSelect(item, event); onItemMenu(item); }"
          >
            <!-- Card Title with Highlighting -->
            <v-card-title class="text-truncate">
              <span v-html="getFileName(item.file)"></span>
              
              <!-- Sub-folder Indicator (in search mode) -->
              <v-chip
                v-if="mode === 'search' && isFromSubfolder(item)"
                size="x-small"
                color="primary"
                class="ml-2"
                label
              >
                subfolder
              </v-chip>
            </v-card-title>
            
            <!-- Series with Highlighting -->
            <v-card-subtitle v-if="item.series" v-html="highlightText(item.series)"></v-card-subtitle>
            
            <v-card-text>
              <!-- Content with Highlighting -->
              <div v-if="item.content" v-html="highlightText(item.content)"></div>
              
              <!-- Guests with Highlighting -->
              <div v-if="item.guests">
                <strong>Guests:</strong> <span v-html="highlightText(item.guests)"></span>
              </div>
              
              <!-- Tags with Highlighting -->
              <div v-if="item.tags">
                <strong>Tags:</strong> <span v-html="highlightText(item.tags)"></span>
              </div>
              
              <!-- Duration -->
              <div><strong>Duration:</strong> {{ formatDuration(item.seconds) }}</div>
              
              <!-- Path with Highlighting (only when includeSubfolders is true) -->
              <div v-if="mode === 'search' && includeSubfolders" class="text-caption text-grey">
                <strong>Path:</strong> <span v-html="getFilePath(item.file)"></span>
              </div>
            </v-card-text>
            
            <v-card-actions>
              <v-btn icon="mdi-play" @click.stop="onPlayItem(item)"></v-btn>
              <v-btn icon="mdi-dots-vertical" @click.stop="onItemMenu(item)"></v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </BaseLayout>
</template>

<script setup lang="ts">
import BaseLayout from './BaseView.vue'
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

// Check if an item has zero duration
const hasZeroDuration = (item: Content) => {
  return item.seconds === 0 || item.seconds === null || item.seconds === undefined || item.seconds < 0
}
</script>

<style scoped>
.card-grid {
  margin: 0 !important;
  width: 100%;
  padding: 0 !important;
}

/* Override Vuetify's default padding on v-col */
:deep(.v-col) {
  padding: 8px !important;
}

/* Remove any default margins from v-row */
:deep(.v-row) {
  margin: 0 !important;
}

.v-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
  margin-bottom: 16px;
  border-radius: 8px;
  overflow: hidden;
  height: 100%;
}

.v-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0,0,0,0.1) !important;
}

.v-card.selected {
  background-color: rgba(var(--v-theme-primary), 0.1);
}

.v-card.playing:not(.selected) {
  background-color: rgba(var(--v-theme-error), 0.1);
}

.v-card.has-matches:not(.selected):not(.playing) {
  background-color: rgba(var(--v-theme-warning), 0.05);
}

.v-card.zero-duration {
  color: rgba(0, 0, 0, 0.38) !important;
  opacity: 0.6;
}

.v-card.zero-duration * {
  color: inherit !important;
}

.v-card-title {
  font-size: 1.1rem;
  font-weight: 500;
  padding-bottom: 8px;
}

.v-card-subtitle {
  font-size: 0.9rem;
  opacity: 0.8;
}

.v-card-text {
  font-size: 0.9rem;
  padding-top: 8px;
}

.v-card-text div {
  margin-bottom: 4px;
}

.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Style for highlighted text */
:deep(mark) {
  background-color: rgba(var(--v-theme-warning), 0.3);
  border-radius: 2px;
  font-weight: 500;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .v-card {
    margin-bottom: 12px;
  }
  
  .v-card-title {
    font-size: 1rem;
  }
  
  .v-card-text {
    font-size: 0.85rem;
  }
}
</style>
