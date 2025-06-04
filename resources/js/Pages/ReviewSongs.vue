<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import SharedLayout from '../layouts/SharedLayout.vue'
import { useReviews, type SongReview, type SongForReview, type User } from '../composables/useReviews'
import ReviewStatusChip from '../components/ReviewStatusChip.vue'
import SongReviewDialog from '../components/SongReviewDialog.vue'
import AudioPlayer from '../components/AudioPlayer.vue'
import { filePath, fileName, convertSecondsToMinutes } from '../utils/fileUtils'
import { useAudioPlayer } from '@/composables/useAudioPlayer'

// Define props that are passed to the component
const props = defineProps<{
  songReviews?: SongReview[]
  songs?: SongForReview[]
  auth?: { user: User }
}>()

// Layout configuration for the page
defineOptions({
  layout: SharedLayout
})

// Use the reviews composable
const {
  songs,
  reviews,
  currentUser,
  isLoading,
  error,
  refreshSongs,
  getCurrentUserReview,
  getFileReviews
} = useReviews()

// Define page title
const pageTitle = ref('Song Reviews')

// Get audio player instance
const audioPlayer = useAudioPlayer()

// State for selected song and dialogs
const selectedSong = ref<SongForReview | null>(null)
const showReviewDialog = ref(false)
const reviewFilename = ref('')

// Load data on component mount if needed
onMounted(async () => {
  try {
    // Data is already available from Inertia props
    // Only refresh if explicitly needed
    if (songs.value.length === 0) {
      await refreshSongs()
    }
  } catch (err: any) {
    console.error('Failed to load data:', err)
    error.value = 'Failed to load songs for review'
  }
})

// Handle song selection
const selectSong = (song: SongForReview) => {
  selectedSong.value = song
  showReviewDialog.value = true
}

// Computed properties for audio player state
const currentlyPlayingItemId = computed(() => {
  return audioPlayer.state.value.currentTrack?.id || null
})

// Check if a specific song is currently playing
const isSongPlaying = (song: SongForReview) => {
  return audioPlayer.state.value.isPlaying && currentlyPlayingItemId.value === song.file
}

// Toggle play/pause for a specific song
const togglePlayPause = (song: SongForReview) => {
  if (currentlyPlayingItemId.value === song.file) {
    // If this song is already loaded, just toggle play/pause
    audioPlayer.togglePlayPause()
  } else {
    // Otherwise, play this song
    playItem(song)
  }
}

// Plays a song in the audio player
const playItem = (song: SongForReview) => {
  // Create a track info object for the audio player
  const trackInfo = {
    id: song.file,
    file: song.file,
    title: song.title || 'Unknown',
    artist: song.artist || '',
    // Use the seconds property if available, otherwise default to 0
    // This will be updated when the actual duration is known
    duration: song.seconds || 0,
    seek: 0
  }

  // Play the track
  audioPlayer.playTrack(trackInfo)
}

// Updates the audio player playlist when songs change
watch(() => songs.value, (newSongs) => {
  if (newSongs && newSongs.length > 0) {
    // Map songs to track info objects
    const tracks = newSongs.map(song => ({
      id: song.file,
      file: song.file,
      title: song.title || 'Unknown',
      artist: song.artist || '',
      duration: song.seconds || 0,
      seek: 0
    }))

    // Update the playlist without starting playback
    if (tracks.length > 0) {
      // If there's a currently playing track, find its index in the new playlist
      let currentIndex = -1
      const currentTrackId = audioPlayer.state.value.currentTrack?.id

      if (currentTrackId) {
        currentIndex = tracks.findIndex(track => track.id === currentTrackId)
      }

      // If the current track is in the new playlist, preserve it and update the rest
      if (currentIndex >= 0) {
        // Keep the current track's state (seek position, etc.)
        tracks[currentIndex] = {
          ...tracks[currentIndex],
          seek: audioPlayer.state.value.currentTrack?.seek || 0
        }
      }

      // Update the playlist
      audioPlayer.state.value.playlist = tracks
    }
  }
}, { immediate: true })

// Open comments dialog
const openCommentsDialog = (file: string) => {
  selectedSong.value = null
  reviewFilename.value = file
  showReviewDialog.value = true
}
</script>

<template>
  <!-- Wrap everything in a single root element to inherit attributes -->
  <div class="review-songs-container pa-4">
    <v-card flat class="pa-3 flex-grow-1">
      <v-card-title class="text-h5 font-weight-bold mb-3 px-2">
        {{ pageTitle }}
      </v-card-title>

      <!-- Loading state -->
      <v-card-text v-if="isLoading">
        <div class="d-flex align-center justify-center py-4">
          <v-progress-circular indeterminate />
          <span class="ml-2">Loading songs...</span>
        </div>
      </v-card-text>

      <!-- Error state -->
      <v-card-text v-else-if="error">
        <v-alert type="error" variant="tonal">
          {{ error }}
        </v-alert>
      </v-card-text>

      <!-- Content when loaded -->
      <v-card-text v-else class="px-2 pt-0">
        <!-- Song list section -->
        <div class="song-list mb-4">
          <v-list v-if="songs.length > 0" class="pa-0">
            <v-list-item
              v-for="song in songs"
              :key="song.file"
              @click="selectSong(song)"
              :active="selectedSong?.file === song.file"
              :class="{'playing': song.file === currentlyPlayingItemId}"
              rounded="lg"
              class="mb-1 song-list-item"
              density="compact"
            >
              <template #prepend>
                <v-btn
                  :icon="isSongPlaying(song) ? 'mdi-pause' : 'mdi-play'"
                  size="small"
                  variant="text"
                  color="red-darken-4"
                  class="play-button"
                  @click.stop="togglePlayPause(song)"
                  :aria-label="isSongPlaying(song) ? 'Pause song' : 'Play song'"
                ></v-btn>
              </template>

              <!-- First line: Title only on mobile, Title + Artist on larger screens (Primary Information) -->
              <v-list-item-title class="d-flex align-center primary-content">
                <span class="font-weight-medium song-title">{{ song.title }}</span>
                <div v-if="song.file === currentlyPlayingItemId" class="ml-2 equalizer-animation">
                  <div class="bar"></div>
                  <div class="bar"></div>
                  <div class="bar"></div>
                </div>

                <!-- Artist name with dash separator - hidden on mobile -->
                <div class="d-none d-sm-flex align-center">
                  <v-icon size="x-small" class="mx-1 text-grey">mdi-minus</v-icon>
                  <span class="artist-name text-grey-darken-1">{{ song.artist }}</span>
                </div>

                <!-- Duration as text -->
                <v-spacer></v-spacer>
                <span class="d-none d-sm-flex duration-text tertiary-content">
                  {{ convertSecondsToMinutes(song.seconds || 0) }}
                </span>
              </v-list-item-title>

              <!-- Second line: Artist on mobile, File path + Tags on all screens (Secondary Information) -->
              <v-list-item-subtitle class="d-flex align-center flex-wrap secondary-content">
                <!-- Artist name on mobile only -->
                <span class="d-sm-none artist-name-mobile">{{ song.artist }}</span>

                <!-- File path (hidden on mobile) -->
                <span class="file-path-text tertiary-content d-none d-sm-inline-block">
                  {{ filePath(song.file) }}/{{ fileName(song.file) }}
                </span>

                <!-- Spacer -->
                <v-spacer></v-spacer>
              </v-list-item-subtitle>

              <template #append>
                <div class="d-flex align-center review-status-container">
                  <!-- Combined review status section (Primary Information) -->
                  <div class="review-status">
                    <!-- Unified review status chip -->
                    <ReviewStatusChip
                      :file="song.file"
                      :myReview="getCurrentUserReview(song.file)"
                      :allReviews="getFileReviews(song.file)"
                      @click="openCommentsDialog"
                      class="primary-content"
                    />
                  </div>
                </div>
              </template>
            </v-list-item>
          </v-list>

          <v-alert v-else type="info" variant="tonal" class="text-center py-8">
            <v-icon size="large" class="mb-2">mdi-playlist-music</v-icon>
            <div class="text-h6 mb-2">No songs available for review</div>
            <div class="text-body-2">Check back later for new songs to review</div>
          </v-alert>
        </div>
      </v-card-text>
    </v-card>
  </div>

  <!-- Unified Song Review Dialog -->
  <SongReviewDialog
    v-model="showReviewDialog"
    :file="selectedSong?.file || reviewFilename"
    :song="selectedSong"
  />

  <!-- Audio Player -->
  <div class="fixed-controls">
    <AudioPlayer />
  </div>
</template>

<style scoped>
.review-songs-container {
  min-height: 100%;
  width: 100%;
  padding-bottom: 120px; /* Add padding to account for the fixed audio player */
  display: flex;
  flex-direction: column;
}

.song-list {
  width: 100%;
}

/* Custom styling for song list items */
.song-list-item {
  padding-top: 6px;
  padding-bottom: 6px;
  padding-left: 8px;
  padding-right: 8px;
}

.song-list-item:hover:not(.v-list-item--active) {
  background-color: rgba(var(--v-theme-surface-variant), 0.1);
}

/* Content hierarchy classes */
.primary-content {
  /* Highest priority content */
  color: rgba(var(--v-theme-on-surface), 1);
}

.secondary-content {
  /* Medium priority content */
  color: rgba(var(--v-theme-on-surface), 0.8);
}

.tertiary-content {
  /* Lowest priority content */
  color: rgba(var(--v-theme-on-surface), 0.6);
}

/* Song title styling - Primary content */
.song-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 600;
  /* No max-width by default - let it use available space on larger screens */
}

/* Artist name styling - Secondary content */
.artist-name {
  font-size: 0.85rem;
  font-style: italic;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  /* No max-width by default - let it use available space on larger screens */
}

/* Mobile artist name styling */
.artist-name-mobile {
  font-size: 0.85rem;
  font-style: italic;
  font-weight: 500;
  margin-bottom: 4px;
  display: block;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Duration text styling - Tertiary content */
.duration-text {
  font-size: 0.85rem;
  font-weight: 500;
  min-width: 45px;
  text-align: right;
}

/* File path styling - more responsive to available space */
.file-path-text {
  font-size: 0.7rem;
  color: rgba(var(--v-theme-on-surface), 0.5);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 80px;
  max-width: min(400px, 45vw); /* Reduced to show more of other elements */
  display: inline-block;
}


/* Review status container */
.review-status-container {
  display: flex;
  align-items: center;
}

.review-status {
  display: flex;
  align-items: center;
}


.playing:not(.v-list-item--active) {
  background-color: rgba(var(--v-theme-red-darken-4), 0.05);
}

/* Equalizer animation */
.equalizer-animation {
  display: inline-flex;
  align-items: flex-end;
  height: 16px;
  gap: 2px;
}

.equalizer-animation .bar {
  width: 3px;
  background-color: rgba(var(--v-theme-red-darken-4), 1);
  border-radius: 1px;
  animation: equalize 1s infinite;
}

.equalizer-animation .bar:nth-child(1) {
  height: 8px;
  animation-delay: 0s;
}

.equalizer-animation .bar:nth-child(2) {
  height: 16px;
  animation-delay: 0.2s;
}

.equalizer-animation .bar:nth-child(3) {
  height: 12px;
  animation-delay: 0.4s;
}

@keyframes equalize {
  0% { height: 4px; }
  50% { height: 16px; }
  100% { height: 4px; }
}

.fixed-controls {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

/* Medium screens */
@media (min-width: 601px) and (max-width: 960px) {
  .song-title {
    max-width: 35%;
  }

  .artist-name {
    max-width: 30%;
  }

  .file-path-text {
    max-width: min(300px, 35vw);
  }
}

/* Large screens */
@media (min-width: 961px) {
  .song-title, .artist-name {
    transition: max-width 0.2s ease;
  }
}

/* Small screens / Mobile */
@media (max-width: 600px) {
  .v-btn.play-button {
    min-height: 48px;
    min-width: 48px;
    margin-right: 4px; /* Reduce right margin to bring content closer */
    margin-left: -16px; /* Move button further to the left to save more space */
  }

  .v-list-item {
    padding: 6px 2px 6px 0px; /* Further reduced left and right padding for maximum content space */
  }

  /* Override Vuetify's default padding-inline for compact density list items */
  .v-list-item--density-compact:not(.v-list-item--nav).v-list-item--one-line {
    padding-inline: 2px !important;
  }

  .v-btn {
    min-height: 44px; /* Increased to recommended minimum touch target size */
  }

  /* Enhanced content hierarchy for mobile */

  /* Primary content - Make more prominent */
  .song-title {
    max-width: 95%; /* Increased from 90% to utilize more available space */
    font-size: 1rem; /* Slightly larger */
    font-weight: 600; /* Bolder */
  }

  /* Adjust artist name on very small screens */
  @media (max-width: 360px) {
    .artist-name {
      margin-top: 2px;
      width: 100%;
    }
  }

  /* Tertiary content - Hidden or de-emphasized */
  .duration-text {
    font-size: 0.7rem;
    opacity: 0.7;
  }

  /* Hide file path on mobile */
  .file-path-text {
    display: none;
  }

  /* Custom styling for song list items on mobile */
  .song-list-item {
    padding: 8px 2px; /* Further reduced horizontal padding for maximum content space */
    transition: all 0.2s ease;
  }

  /* Improve review status container on mobile */
  .review-status-container {
    margin-top: 8px;
    width: 100%;
    justify-content: flex-start; /* Align to the left */
  }

  /* Emphasize user's own review status (primary) over others (secondary) */
  .review-status :deep(.v-chip) {
    font-weight: 600;
  }

  /* De-emphasize secondary content */
  .secondary-content {
    opacity: 0.8;
  }

  /* Further de-emphasize tertiary content */
  .tertiary-content {
    opacity: 0.6;
  }
}
</style>
