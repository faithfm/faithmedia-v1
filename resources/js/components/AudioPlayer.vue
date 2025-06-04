<template>
  <!-- Fixed bottom player container -->
  <v-footer app class="border-t compact-mobile-player" color="white" elevation="1" role="region" aria-label="Audio player">
      <v-container fluid class="py-2 px-4">
        <!-- Desktop Layout -->
        <div class="d-none d-sm-block" aria-label="Desktop audio controls">
          <!-- Main Player Row with Progress Bar -->
          <v-row align="center" no-gutters>
            <!-- Current Time -->
            <v-col cols="1" class="text-center">
              <span class="text-caption text-medium-emphasis">{{ formatTime(currentSeek) }}</span>
            </v-col>

            <!-- Progress Bar -->
            <v-col cols="10">
              <v-progress-linear
                :model-value="trackProgress"
                :disabled="!state.currentTrack"
                color="red-darken-4"
                track-color="grey-lighten-2"
                height="4"
                rounded
                @click="onProgressBarClick"
                @keydown.left="rewind(5)"
                @keydown.right="fastForward(5)"
                class="progress-bar"
                role="slider"
                aria-label="Seek position"
                :aria-valuemin="0"
                :aria-valuemax="100"
                :aria-valuenow="trackProgress"
                :aria-valuetext="`${formatTime(currentSeek)} of ${formatTime(currentDuration)}`"
                tabindex="0"
              ></v-progress-linear>
            </v-col>

            <!-- Duration -->
            <v-col cols="1" class="text-center">
              <span class="text-caption text-medium-emphasis">{{ formatTime(currentDuration) }}</span>
            </v-col>
          </v-row>

          <!-- Controls Row -->
          <v-row align="center" no-gutters class="mt-2">
            <!-- Track Info (Left) -->
            <v-col cols="3" class="d-flex align-center">
              <div v-if="state.currentTrack" class="d-flex align-center">
                <div class="text-truncate">
                  <div class="text-subtitle-2 font-weight-medium text-truncate" aria-live="polite">
                    {{ state.currentTrack.title }}
                  </div>
                  <div v-if="state.currentTrack.artist" class="text-caption text-truncate" aria-live="polite">
                    {{ state.currentTrack.artist }}
                  </div>
                </div>
              </div>
              <div v-else class="text-subtitle-2 text-medium-emphasis" aria-live="polite">
                No track selected
              </div>
            </v-col>

            <!-- Control Buttons (Center) -->
            <v-col cols="6" class="d-flex justify-center align-center">
              <!-- Previous Button -->
              <v-btn
                icon="mdi-skip-previous"
                :disabled="!hasPrevious"
                size="small"
                variant="text"
                color="grey-darken-3"
                @click="skipTrack('prev')"
                class="mx-1"
                aria-label="Previous track"
              ></v-btn>

              <!-- Rewind Button -->
              <v-btn
                icon="mdi-rewind-30"
                :disabled="!state.currentTrack"
                size="small"
                variant="text"
                color="grey-darken-3"
                @click="rewind()"
                class="mx-1"
                aria-label="Rewind 30 seconds"
              ></v-btn>

              <!-- Play/Pause Button -->
              <v-btn
                :icon="state.isPlaying ? 'mdi-pause' : 'mdi-play'"
                :disabled="!state.currentTrack"
                size="large"
                variant="elevated"
                color="red-darken-4"
                @click="togglePlayPause"
                class="mx-2"
                aria-label="Play or pause"
              ></v-btn>

              <!-- Fast Forward Button -->
              <v-btn
                icon="mdi-fast-forward-30"
                :disabled="!state.currentTrack"
                size="small"
                variant="text"
                color="grey-darken-3"
                @click="fastForward()"
                class="mx-1"
                aria-label="Fast forward 30 seconds"
              ></v-btn>

              <!-- Next Button -->
              <v-btn
                icon="mdi-skip-next"
                :disabled="!hasNext"
                size="small"
                variant="text"
                color="grey-darken-3"
                @click="skipTrack('next')"
                class="mx-1"
                aria-label="Next track"
              ></v-btn>

            </v-col>

            <!-- Volume Control (Right) -->
            <v-col cols="3" class="d-flex justify-end align-center">
              <v-btn
                :icon="state.muted ? 'mdi-volume-off' : volumeIcon"
                size="small"
                variant="text"
                @click="toggleMute"
                class="mr-2"
                aria-label="Toggle mute"
              ></v-btn>
              <v-slider
                v-model="volume"
                :disabled="!state.currentTrack"
                class="volume-slider"
                max="100"
                hide-details
                density="compact"
                color="red-darken-4"
                track-color="grey-lighten-2"
                thumb-label
                :thumb-size="20"
                style="max-width: 100px"
                role="slider"
                aria-label="Volume control"
                :aria-valuemin="0"
                :aria-valuemax="100"
                :aria-valuenow="volume"
                :aria-valuetext="`Volume ${volume}%`"
                tabindex="0"
              ></v-slider>
            </v-col>
          </v-row>
        </div>

        <!-- Mobile Layout -->
        <div class="d-block d-sm-none mobile-player-layout" aria-label="Mobile audio controls">
          <!-- Track Info Row -->
          <v-row align="center" no-gutters class="mb-1 mobile-track-row">
            <v-col cols="12" class="mobile-track-content text-center">
              <div class="text-subtitle-2 text-truncate track-title" aria-live="polite">
                {{ state.currentTrack ? state.currentTrack.title : 'No track selected' }}
                <span v-if="state.currentTrack && state.currentTrack.artist" class="text-caption track-artist">
                  - {{ state.currentTrack.artist }}
                </span>
              </div>
            </v-col>
          </v-row>

          <!-- Progress Bar with Integrated Time -->
          <div class="mobile-progress-container mb-1">
            <span class="text-caption time-display">{{ formatTime(currentSeek) }}</span>
            <v-progress-linear
              :model-value="trackProgress"
              :disabled="!state.currentTrack"
              color="red-darken-4"
              track-color="grey-lighten-2"
              height="3"
              rounded
              @click="onProgressBarClick"
              @keydown.left="rewind(5)"
              @keydown.right="fastForward(5)"
              class="progress-bar"
              role="slider"
              aria-label="Seek position"
              :aria-valuemin="0"
              :aria-valuemax="100"
              :aria-valuenow="trackProgress"
              :aria-valuetext="`${formatTime(currentSeek)} of ${formatTime(currentDuration)}`"
              tabindex="0"
            ></v-progress-linear>
            <span class="text-caption time-display">{{ formatTime(currentDuration) }}</span>
          </div>

          <!-- Controls Row -->
          <v-row align="center" justify="center" no-gutters>
            <v-col cols="auto">
              <div class="d-flex justify-center">
                <v-btn
                  icon="mdi-skip-previous"
                  :disabled="!hasPrevious"
                  size="small"
                  variant="text"
                  color="grey-darken-3"
                  @click="skipTrack('prev')"
                  class="mx-1"
                  aria-label="Previous track"
                ></v-btn>
                <v-btn
                  icon="mdi-rewind-30"
                  :disabled="!state.currentTrack"
                  size="small"
                  variant="text"
                  color="grey-darken-3"
                  @click="rewind()"
                  class="mx-1"
                  aria-label="Rewind 30 seconds"
                ></v-btn>
                <v-btn
                  :icon="state.isPlaying ? 'mdi-pause' : 'mdi-play'"
                  :disabled="!state.currentTrack"
                  size="small"
                  variant="tonal"
                  color="red-darken-4"
                  @click="togglePlayPause"
                  class="mx-1"
                  aria-label="Play or pause"
                ></v-btn>
                <v-btn
                  icon="mdi-fast-forward-30"
                  :disabled="!state.currentTrack"
                  size="small"
                  variant="text"
                  color="grey-darken-3"
                  @click="fastForward()"
                  class="mx-1"
                  aria-label="Fast forward 30 seconds"
                ></v-btn>
                <v-btn
                  icon="mdi-skip-next"
                  :disabled="!hasNext"
                  size="small"
                  variant="text"
                  color="grey-darken-3"
                  @click="skipTrack('next')"
                  class="mx-1"
                  aria-label="Next track"
                ></v-btn>
              </div>
            </v-col>
          </v-row>
        </div>
      </v-container>
    </v-footer>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { convertSecondsToMinutes } from '../utils/fileUtils'
import { useAudioPlayer } from '../composables/useAudioPlayer'

// Get audio player instance (now loads config internally)
const audioPlayer = useAudioPlayer()


// Destructure the audio player methods and properties
const {
  state,
  trackProgress,
  hasNext,
  hasPrevious,
  togglePlayPause,
  skipTrack,
  seekTo,
  setVolume,
  toggleMute,
  fastForward,
  rewind
} = audioPlayer

// Volume control (0-100 for UI, 0-1 for Howler)
const volume = ref(state.value.volume * 100)

// Watch for volume changes and update the audio player
watch(volume, (newVolume) => {
  setVolume(newVolume / 100)
})

// Computed properties for UI
const currentSeek = computed(() => {
  return state.value.currentTrack?.seek || 0
})

const currentDuration = computed(() => {
  return state.value.currentTrack?.duration || 0
})

// Computed property for volume icon
const volumeIcon = computed(() => {
  if (volume.value > 70) return 'mdi-volume-high'
  if (volume.value > 30) return 'mdi-volume-medium'
  return 'mdi-volume-low'
})

// Format time in seconds to MM:SS
const formatTime = (seconds: number): string => {
  if (!seconds || isNaN(seconds)) return '00:00'
  return convertSecondsToMinutes(seconds)
}

// Handle click on progress bar to seek
const onProgressBarClick = (event: MouseEvent) => {
  if (!state.value.currentTrack) return

  const progressBar = event.currentTarget as HTMLElement
  const rect = progressBar.getBoundingClientRect()
  const clickPosition = (event.clientX - rect.left) / rect.width
  const seekPosition = clickPosition * state.value.currentTrack.duration

  seekTo(seekPosition)
}

// Helper function to check if the current focus target should receive normal keyboard input
const shouldIgnoreKeyboardShortcuts = (): boolean => {
  const activeElement = document.activeElement
  if (!activeElement) return false

  const tagName = activeElement.tagName.toLowerCase()
  
  // Standard input elements
  if (['input', 'textarea', 'select'].includes(tagName)) {
    return true
  }
  
  // Vuetify input components (main case for this app)
  if (activeElement.closest('.v-text-field, .v-textarea, .v-select')) {
    return true
  }
  
  // Contenteditable elements
  if (activeElement.getAttribute('contenteditable') === 'true') {
    return true
  }
  
  return false
}

// Keyboard event handlers for accessibility
const handleKeyboardControls = (event: KeyboardEvent) => {
  if (!state.value.currentTrack) return

  // Skip keyboard shortcuts if user is in a text input context
  if (shouldIgnoreKeyboardShortcuts()) {
    return
  }

  switch (event.key) {
    case ' ':
      // Space bar toggles play/pause
      event.preventDefault()
      togglePlayPause()
      break
    case 'ArrowRight':
      // Right arrow seeks forward 5 seconds
      event.preventDefault()
      fastForward(5)
      break
    case 'ArrowLeft':
      // Left arrow seeks backward 5 seconds
      event.preventDefault()
      rewind(5)
      break
    case 'ArrowUp':
      // Up arrow increases volume
      event.preventDefault()
      volume.value = Math.min(volume.value + 5, 100)
      break
    case 'ArrowDown':
      // Down arrow decreases volume
      event.preventDefault()
      volume.value = Math.max(volume.value - 5, 0)
      break
  }
}

// Add keyboard event listener when component is mounted
onMounted(() => {
  window.addEventListener('keydown', handleKeyboardControls)
})

// Remove keyboard event listener when component is unmounted
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyboardControls)
})
</script>

<style scoped>
.v-footer {
  border-top: 1px solid rgba(0,0,0,0.1);
  transition: transform 0.3s ease;
}

.progress-bar {
  cursor: pointer;
  transition: height 0.2s ease;
}

.progress-bar:hover {
  height: 6px !important;
}

.volume-slider {
  transition: width 0.3s ease;
}

/* Track info styling */
.text-truncate {
  max-width: 100%;
}

.text-subtitle-2 {
  font-weight: 500;
  line-height: 1.2;
}

/* Improved color contrast for accessibility */
.track-artist,
.text-caption.text-medium-emphasis,
.time-display {
  color: rgba(0, 0, 0, 0.7) !important; /* Darker text for better contrast */
}

/* Focus styles for keyboard navigation */
.v-btn:focus-visible {
  outline: 2px solid #b71c1c !important; /* Red darken-4 outline for focus */
  outline-offset: 2px;
}

.progress-bar:focus-visible {
  outline: 2px solid #b71c1c !important;
}

.volume-slider:focus-visible {
  outline: 2px solid #b71c1c !important;
}

/* Responsive adjustments for various screen sizes */
@media (max-width: 768px) {
  .compact-mobile-player .v-container {
    padding: 6px 10px;
  }

  .compact-mobile-player {
    height: auto !important;
    min-height: 64px; /* Compact height */
    box-shadow: 0 -2px 8px rgba(0,0,0,0.1); /* Add shadow for better separation */
  }

  /* Mobile player layout */
  .mobile-player-layout {
    width: 100%;
  }

  .mobile-track-row {
    padding: 0 4px;
  }

  .mobile-track-content {
    padding: 0 4px;
    text-align: center;
  }

  .track-title {
    font-size: 0.85rem;
    font-weight: 500;
    line-height: 1.2;
  }

  .track-artist {
    font-size: 0.75rem;
    color: rgba(0, 0, 0, 0.7); /* Improved contrast */
  }

  .mobile-progress-container {
    display: flex;
    align-items: center;
    width: 100%;
  }

  .time-display {
    font-size: 0.7rem;
    color: rgba(0, 0, 0, 0.7); /* Improved contrast */
    min-width: 40px; /* Ensure enough space for longer times */
    text-align: center;
    white-space: nowrap; /* Prevent line breaks in time display */
  }

  .progress-bar {
    flex: 1;
    margin: 0 4px;
    height: 4px !important; /* Slightly larger for better touch targets */
  }

  .progress-bar:hover {
    height: 6px !important; /* Larger on hover for better touch targets */
  }

  /* Typography adjustments */
  .text-subtitle-2 {
    font-size: 0.85rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Ensure controls are properly sized for touch */
  .compact-mobile-player .v-btn {
    min-width: 40px; /* Increased for better touch targets */
    min-height: 40px; /* Increased for better touch targets */
    margin: 0 2px; /* Reduced margins to fit on smaller screens */
  }
}

/* Additional responsive breakpoints for different screen sizes */
@media (max-width: 320px) {
  /* Extra small devices (iPhone SE, etc) */
  .compact-mobile-player {
    min-height: 60px;
  }

  .track-title {
    font-size: 0.8rem;
  }

  .time-display {
    min-width: 36px; /* Smaller but still enough for most time formats */
    font-size: 0.65rem;
    padding: 0 2px;
  }

  .compact-mobile-player .v-btn {
    margin: 0 !important; /* Reduce margins to fit small screens */
  }
}

@media (min-width: 375px) and (max-width: 428px) {
  /* Small devices (iPhone X, 11, 12, etc) */
  .mobile-track-content {
    padding: 0 6px;
  }

  .time-display {
    min-width: 42px; /* Slightly larger for medium phones */
  }
}

@media (min-width: 429px) and (max-width: 768px) {
  /* Medium devices (tablets, larger phones) */
  .mobile-track-content {
    padding: 0 8px;
  }

  .track-title {
    font-size: 0.9rem;
  }

  .time-display {
    min-width: 45px; /* Larger for tablets */
    font-size: 0.75rem;
  }
}

/* Landscape orientation adjustments */
@media (max-height: 450px) and (orientation: landscape) {
  .compact-mobile-player {
    min-height: 54px; /* Even more compact for landscape */
  }

  .mobile-track-row {
    margin-bottom: 0 !important;
  }

  .mobile-progress-container {
    margin-bottom: 0 !important;
  }
}
</style>
