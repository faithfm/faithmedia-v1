<template>
  <div>
    <v-dialog v-model="dialogModel" max-width="850" transition="dialog-transition">
      <v-card class="pa-6" elevation="2">
        <!-- Header with song info and close button -->
        <v-row no-gutters align="center" class="dialog-header">
          <v-col cols="10" sm="11">
            <div v-if="song" class="d-flex align-start">
              <v-icon icon="mdi-music" color="primary" class="mr-2 mt-1 flex-shrink-0"></v-icon>
              <div class="flex-grow-1 min-width-0">
                <v-card-title class="pa-0">
                  <div class="text-h5 song-title text-truncate">{{ song.title }}</div>
                  <div class="d-flex align-center flex-wrap">
                    <div class="text-subtitle-2 text-medium-emphasis text-truncate mr-2">{{ song.artist }}</div>
                    <v-tooltip location="top" text="View Lyrics">
                      <template v-slot:activator="{ props }">
                        <v-btn v-bind="props" variant="text" size="small" @click="openLyrics" color="primary"
                          class="lyrics-btn flex-shrink-0" aria-label="View lyrics" density="comfortable">
                          <v-icon icon="mdi-text-box-search" size="small" class="mr-1"></v-icon>
                          <span class="d-none d-sm-inline">Lyrics</span>
                        </v-btn>
                      </template>
                    </v-tooltip>
                  </div>
                </v-card-title>
              </div>
            </div>
            <div v-else class="min-width-0">
              <v-card-title class="text-h5 pa-0 text-truncate">Song Review</v-card-title>
            </div>
          </v-col>
          <v-col cols="2" sm="1" class="text-right flex-shrink-0">
            <v-btn icon="mdi-close" variant="text" @click="closeDialog" class="close-btn" size="small" density="comfortable"></v-btn>
          </v-col>
        </v-row>

        <!-- Tabbed interface for reviews and comments -->
        <v-card-text class="pa-0 mb-4">
          <v-tabs v-model="activeTab" color="primary" align-tabs="center" grow class="mb-2">
            <v-tab value="your-review" class="text-body-2"> Your Review
              <v-chip v-if="currentUserReview" color="primary" size="x-small" density="comfortable" variant="flat"
                class="ml-2">
                <v-icon icon="mdi-check" size="x-small"></v-icon>
              </v-chip>
            </v-tab>
            <v-tab value="all-reviews" class="text-body-2">
              All Reviews
              <v-chip v-if="allReviews.length > 0" color="primary" size="x-small" density="comfortable" variant="flat"
                class="ml-2">
                {{ allReviews.length }}
              </v-chip>
            </v-tab>
          </v-tabs>

          <v-window v-model="activeTab" class="review-tabs-window">
            <!-- All reviews tab -->
            <v-window-item value="all-reviews">
              <v-card style="overflow-y: auto;" variant="text">
                <!-- Compact header with legend toggle -->
                <div class="d-flex justify-between align-center px-4 py-2 bg-grey-lighten-4">
                  <span class="text-subtitle-2">Reviews</span>
                  <v-tooltip :text="showLegend ? 'Hide Rating Guide' : 'Show Rating Guide'" location="top">
                    <template v-slot:activator="{ props }">
                      <v-btn v-bind="props" icon size="small" variant="text" density="comfortable"
                        @click="showLegend = !showLegend" class="legend-toggle">
                        <v-icon :icon="showLegend ? 'mdi-eye-off-outline' : 'mdi-information-outline'"
                          size="small"></v-icon>
                      </v-btn>
                    </template>
                  </v-tooltip>
                </div>

                <!-- Inline legend -->
                <v-expand-transition>
                  <div v-if="showLegend" class="px-4 py-2 bg-grey-lighten-5 d-flex flex-wrap align-center">
                    <span class="text-caption font-weight-bold mr-2">Rating Guide:</span>
                    <div v-for="option in RATING_OPTIONS" :key="option.code" class="d-inline-flex align-center mr-2">
                      <v-avatar :color="option.color" size="16" class="mr-1">
                        <v-icon :icon="option.icon" color="white" size="x-small"></v-icon>
                      </v-avatar>
                      <span class="text-caption">{{ option.code }}: {{ option.label }}</span>
                    </div>
                  </div>
                </v-expand-transition>

                <!-- Reviews list -->
                <v-list v-if="allReviews.length" class="pa-0" max-height="320">
                  <v-list-item v-for="(review, index) in allReviews" :key="index" class="px-4 py-3 comment-item"
                    :class="{ 'highlighted': review.user_id === currentUserId }">
                    <template v-slot:prepend>
                      <div class="d-flex flex-column align-center mr-2">
                        <!-- Keep tooltip for desktop -->
                        <v-tooltip :text="getRatingLabel(review.rating)" location="top">
                          <template v-slot:activator="{ props }">
                            <v-avatar v-bind="props" :color="getRatingColor(review.rating)" size="28" class="mb-1">
                              <v-icon :icon="getRatingIcon(review.rating)" color="white" size="small"></v-icon>
                            </v-avatar>
                          </template>
                        </v-tooltip>
                      </div>
                    </template>
                    <v-list-item-title class="text-body-2 font-weight-medium mb-1 d-flex align-center">
                      <v-tooltip :text="review.user ? review.user.name : 'Anonymous'" location="top">
                        <template v-slot:activator="{ props }">
                          <span v-bind="props" class="user-name">
                            <span class="user-full-name">{{ review.user ? review.user.name : 'Anonymous' }}</span>
                            <span class="user-initials">{{ review.user ? getInitials(review.user.name) : 'A' }}</span>
                          </span>
                        </template>
                      </v-tooltip>
                      <v-chip v-if="review.user_id === currentUserId" size="x-small" color="primary" class="ml-2">
                        You
                      </v-chip>
                      <span v-if="review.updated_at" class="ml-auto text-caption text-grey">
                        {{ new Date(review.updated_at).toLocaleDateString() }}
                      </span>
                    </v-list-item-title>
                    <v-list-item-subtitle class="text-body-1">
                      <span v-if="review.comments">{{ review.comments }}</span>
                      <span v-else class="text-grey">No comment provided</span>
                    </v-list-item-subtitle>
                  </v-list-item>
                </v-list>
                <v-sheet v-else class="pa-4 text-center text-medium-emphasis">No reviews yet</v-sheet>
              </v-card>
            </v-window-item>

            <!-- Your review tab -->
            <v-window-item value="your-review">
              <!-- Rating selection -->
              <div class="mb-4">
                <div class="d-flex justify-space-between align-center mb-3">
                  <h3 class="text-subtitle-1 mb-0">Your Rating</h3>
                  <v-btn v-if="selectedRating || commentText" variant="text" color="grey" size="small"
                    @click="resetForm" prepend-icon="mdi-refresh">
                    Reset
                  </v-btn>
                </div>

                <v-card variant="text" class="pa-4">
                  <div class="rating-options">
                    <v-tooltip v-for="option in RATING_OPTIONS" :key="option.code" :text="option.description"
                      location="top">
                      <template v-slot:activator="{ props }">
                        <v-btn v-bind="props" :color="selectedRating === option.code ? option.color : ''"
                          :variant="selectedRating === option.code ? 'elevated' : 'outlined'"
                          :prepend-icon="option.icon"
                          :class="['rating-btn', selectedRating === option.code ? 'selected' : '']"
                          @click="selectedRating = option.code; submitReview()"
                          :aria-label="`Rate as ${option.label}: ${option.description}`"
                          :aria-pressed="selectedRating === option.code" elevation="1">
                          {{ option.label }}
                        </v-btn>
                      </template>
                    </v-tooltip>
                  </div>
                </v-card>
              </div>

              <!-- Your comment field -->
              <div class="mb-4">
                <h3 class="text-subtitle-1 mb-3">Your Comments</h3>
                <v-card variant="text" class="pa-3">
                  <v-textarea v-model="commentText" :rules="[rules.counter]" counter="500" maxlength="500" rows="4"
                    auto-grow placeholder="Add your comments here (optional)" variant="outlined" density="comfortable"
                    class="comment-input" hide-details="auto" bg-color="grey-lighten-5"></v-textarea>
                </v-card>
              </div>

              <!-- Action buttons for Your Review tab -->
              <div class="d-flex justify-end">
                <v-btn color="primary" :loading="isSubmitting" @click="submitReview"
                  :disabled="!selectedRating && !commentText" size="large" elevation="2">
                  {{ currentUserReview ? 'Update Review' : 'Submit Review' }}
                </v-btn>

                <v-btn class="ml-2" @click="closeDialog" variant="outlined" size="large">
                  Cancel
                </v-btn>
              </div>
            </v-window-item>
          </v-window>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useReviews, type SongForReview, type SongReview } from '../composables/useReviews'
import type { User } from '../composables/useSharedData'
import { RATING_OPTIONS, getRatingColor, getRatingIcon, getRatingLabel } from '../constants/ratingConstants'
import { getInitials } from '../utils/fileUtils'

interface Props {
  modelValue: boolean
  file: string
  song?: SongForReview | null
}

const props = defineProps<Props>()
const emit = defineEmits(['update:modelValue'])

// Use the reviews composable
const {
  reviews,
  currentUser,
  currentUserId,
  isLoading: composableLoading,
  submitReview: submitReviewApi,
  getCurrentUserReview,
  getFileReviews,
  normalizeRating
} = useReviews()

// State
const activeTab = ref('your-review') // Set default tab to 'your-review'
const selectedRating = ref<string | null>(null)
const commentText = ref('')
const isSubmitting = ref(false)
const isLoading = ref(false)
const showLegend = ref(false) // Control visibility of the rating legend


// Validation rules
const rules = {
  counter: (value: string) => (value || "").length <= 500 || "Max 500 characters"
}

// Computed
const dialogModel = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// Get all reviews for this file, sorted by date (newest first)
const allReviews = computed(() => {
  return getFileReviews(props.file)
    .sort((a, b) => {
      // Sort by date (newest first)
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    })
})

// Create a computed property for the current user's review
const currentUserReview = computed(() => {
  return getCurrentUserReview(props.file)
})

// Watch for dialog open/close
watch(() => props.modelValue, async (newValue) => {
  if (newValue) {
    await loadCurrentReview()
  }
})

// Watch for changes in the current user's review
watch(currentUserReview, (newReview) => {
  if (newReview) {
    // Update form fields when the current user's review changes
    selectedRating.value = normalizeRating(newReview.rating)
    commentText.value = newReview.comments || ''
  }
}, { immediate: false })

// Fetch reviews when component is mounted
onMounted(async () => {
  if (props.modelValue) {
    await loadCurrentReview()
  }
})

// Methods
const loadCurrentReview = async () => {
  if (!props.file) return

  isLoading.value = true

  try {
    // Get the current user's review for this file
    // Data should already be available from Inertia props
    const currentReview = getCurrentUserReview(props.file)

    // Initialize the review data
    if (currentReview) {
      selectedRating.value = normalizeRating(currentReview.rating)
      commentText.value = currentReview.comments || ''
    } else {
      selectedRating.value = null
      commentText.value = ''
    }
  } catch (error) {
    console.error('Error loading review data:', error)
  } finally {
    isLoading.value = false
  }
}

const closeDialog = () => {
  emit('update:modelValue', false)
}

// Add a reset form method
const resetForm = () => {
  selectedRating.value = null
  commentText.value = ''
}

const submitReview = async () => {
  if (!props.file) return

  // Ensure we have a user ID
  if (!currentUser.value?.id) {
    console.error('Cannot submit review: No user ID available')
    return
  }

  isSubmitting.value = true

  try {
    const result = await submitReviewApi({
      file: props.file,
      rating: selectedRating.value,
      comments: commentText.value
    })

    if (result) {
      // Close the dialog after successful submission
      // Success notification is handled by the composable
      closeDialog()
    }
  } catch (error) {
    console.error('Error submitting review:', error)
  } finally {
    isSubmitting.value = false
  }
}


const openLyrics = () => {
  if (!props.song) return

  // Create query with + instead of %20 for spaces
  const searchQuery = `${props.song.title} ${props.song.artist}`.replace(/ /g, '+')
  const lyricsUrl = `https://www.musixmatch.com/search?query=${searchQuery}`
  window.open(lyricsUrl, '_blank')
}
</script>

<style scoped>
.song-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  font-weight: 600;
}

.close-btn {
  border-radius: 50% !important;
}

.rating-options {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: space-between;
}

.rating-btn {
  flex: 1;
  min-width: 0;
  text-transform: none;
  letter-spacing: normal;
  height: 44px !important;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.rating-btn:active {
  transform: scale(0.96);
}

.rating-btn.selected {
  font-weight: 600;
}

.comment-item {
  min-height: 60px !important;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
  transition: background-color 0.2s ease;
  padding-top: 8px;
  padding-bottom: 8px;
}

.comment-item:hover {
  background-color: rgba(0, 0, 0, 0.03);
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-input :deep(.v-field__append-inner) {
  padding-top: 0;
  align-self: center;
}

.v-textarea :deep(.v-field__field) {
  padding-top: 8px;
}

.lyrics-btn {
  transition: all 0.2s ease;
}

.lyrics-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.dialog-transition-enter-active,
.dialog-transition-leave-active {
  transition: opacity 0.3s ease;
}

.dialog-transition-enter-from,
.dialog-transition-leave-to {
  opacity: 0;
}

/* Rating label styling */
.rating-label {
  font-size: 10px;
  line-height: 1;
  font-weight: 600;
}

/* User name styling */
.user-name {
  font-weight: 600;
  color: #555;
  margin-right: 4px;
}

.user-full-name {
  display: inline;
  font-size: 0.9rem;
}

.user-initials {
  display: none;
  font-size: 0.9rem;
}

@media (max-width: 600px) {
  .user-full-name {
    display: none;
  }

  .user-initials {
    display: inline;
  }
}

@media (max-width: 600px) {

  /* Bottom Sheet Pattern for Mobile */
  .v-dialog {
    margin: 0;
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    max-height: 90vh;
    max-width: 100% !important;
    border-radius: 16px 16px 0 0;
  }

  /* Visual handle for bottom sheet */
  .v-card::before {
    content: '';
    width: 36px;
    height: 4px;
    background: rgba(0, 0, 0, 0.1);
    border-radius: 4px;
    position: absolute;
    top: 8px;
    left: 50%;
    transform: translateX(-50%);
  }

  /* Increase overall padding for better readability */
  .v-dialog .v-card {
    padding: 24px !important;
  }

  /* More space between sections */
  .v-card-text {
    margin-bottom: 32px !important;
  }

  /* Larger touch targets for buttons */
  .v-btn {
    height: 56px !important;
    min-height: 56px !important;
    min-width: 80px !important;
  }

  /* More space in comments */
  .comment-item {
    padding: 16px !important;
  }

  /* Improved rating options for mobile */
  .rating-options {
    gap: 12px;
    flex-direction: column;
  }

  .rating-btn {
    width: 100%;
    padding: 16px;
    font-size: 16px;
    margin-bottom: 8px;
    height: 56px !important;
  }

  /* Make rating label more visible on mobile */
  .rating-label {
    font-size: 11px;
    font-weight: 700;
  }

  /* Increase spacing for action buttons */
  .d-flex.justify-end {
    margin-top: 24px;
    gap: 16px;
  }

  /* Ensure adequate spacing between interactive elements */
  .v-list-item-title,
  .v-list-item-subtitle {
    padding: 4px 0;
  }

  /* Increase touch target for legend toggle */
  .legend-toggle {
    min-width: 44px !important;
    min-height: 44px !important;
  }
}

/* Vertical Stacking for Small Screens */
@media (max-width: 400px) {

  /* Stack rating buttons vertically */
  .rating-btn {
    margin-bottom: 12px;
    padding: 16px;
    font-size: 16px;
    height: 64px !important;
  }

  /* Adjust spacing for better mobile experience */
  .v-card-text {
    margin-bottom: 24px !important;
  }

  /* Ensure buttons have enough space between them */
  .d-flex.justify-end {
    flex-direction: column;
    gap: 12px;
  }

  .d-flex.justify-end .v-btn {
    width: 100%;
  }

  /* Increase padding for better touch experience */
  .v-dialog .v-card {
    padding: 20px 16px 32px !important;
  }
}

/* Touch-friendly improvements for all screen sizes */
.v-btn {
  transition: transform 0.15s ease;
}

.v-btn:active {
  transform: scale(0.97);
}

/* Add more space between interactive elements */
.v-tabs {
  margin-bottom: 16px !important;
}

.v-tab {
  padding: 0 16px;
  height: 48px;
}

/* Ensure adequate spacing in the review list */
.v-list {
  padding: 8px 0;
}

/* Dialog header styling with background color */
.dialog-header {
  background-color: var(--v-theme-primary-lighten-5, #e3f2fd);
  margin: -24px -24px 16px -24px;
  /* Reduced bottom margin from 24px to 16px */
  padding: 16px 24px;
  border-radius: 4px 4px 0 0;
}

/* Ensure the lyrics button is properly styled */
.lyrics-btn {
  white-space: nowrap;
  min-height: 36px;
}

@media (max-width: 600px) {
  .dialog-header {
    margin: -24px -24px 24px -24px;
    padding: 16px 24px;
    border-radius: 16px 16px 0 0;
  }

  /* Make lyrics button more compact on mobile */
  .lyrics-btn {
    min-width: 36px !important;
    padding: 0 8px !important;
  }
}

@media (max-width: 400px) {
  .dialog-header {
    margin: -20px -16px 24px -16px;
    padding: 20px 16px;
  }
}
</style>
