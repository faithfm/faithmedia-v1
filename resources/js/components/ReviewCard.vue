<script setup lang="ts">
import { computed } from 'vue'
import type { SongReviewSummary } from '../composables/useReviewSummaries'
import { useReviewSummaries } from '../composables/useReviewSummaries'

interface Props {
  item: SongReviewSummary | null
  showCollapseButton?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showCollapseButton: false
})

const emit = defineEmits<{
  'toggle-collapse': []
}>()

// Get reviews from the composable
const { getFileReviews } = useReviewSummaries()

// Computed property to get reviews for the selected item
const reviews = computed(() => {
  if (!props.item) {
    return []
  }
  // Use client-side filtering to get reviews for this file
  return getFileReviews(props.item.file)
})

// Function to get rating display text
function getRatingDisplay(rating: string | null): string {
  if (!rating) return 'No rating'
  
  const ratingMap: Record<string, string> = {
    'A': 'Approved',
    '+': 'Approved',
    'L': 'Low Intensity',
    'P': 'Producers Only',
    'N': 'Not Approved',
    '-': 'Not Approved',
    'U': 'Undecided',
    '?': 'Undecided'
  }
  
  return ratingMap[rating] || rating
}

// Function to get rating color class
function getRatingClass(rating: string | null): string {
  if (!rating) return ''
  
  switch (rating) {
    case 'A':
    case '+':
      return 'rating-approved'
    case 'L':
      return 'rating-low-intensity'
    case 'P':
      return 'rating-producers-only'
    case 'N':
    case '-':
      return 'rating-not-approved'
    case 'U':
    case '?':
      return 'rating-undecided'
    default:
      return ''
  }
}

// Function to get rating icon
function getRatingIcon(rating: string | null): string {
  if (!rating) return 'mdi-help'
  
  switch (rating) {
    case 'A':
    case '+':
      return 'mdi-check-circle'
    case 'L':
      return 'mdi-volume-low'
    case 'P':
      return 'mdi-account-group'
    case 'N':
    case '-':
      return 'mdi-close-circle'
    case 'U':
    case '?':
      return 'mdi-help-circle'
    default:
      return 'mdi-help'
  }
}

// Function to format date
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return dateString
  }
}

// Handle collapse toggle
function handleCollapseToggle() {
  emit('toggle-collapse')
}
</script>

<template>
  <v-card class="review-card" elevation="0" rounded="xl">
    <div class="review-header">
      <!-- Close button positioned absolutely in top-right corner -->
      <v-btn
        v-if="showCollapseButton"
        icon
        variant="text"
        size="small"
        class="close-btn"
        @click="handleCollapseToggle"
        title="Hide review panel"
      >
        <v-icon>mdi-close</v-icon>
      </v-btn>
      
      <!-- Header content - song information -->
      <div class="header-content">
        <div class="header-icon-wrapper">
          <v-icon class="header-icon">mdi-music-note</v-icon>
        </div>
        <div class="header-text">
          <h2 class="header-title">{{ item?.name || 'Song Title' }}</h2>
          <p class="header-subtitle">{{ item?.file || 'File path' }}</p>
        </div>
      </div>
    </div>

    <v-card-text class="review-content">
      <!-- Reviews list -->
      <div v-if="reviews.length > 0" class="reviews-section">
        <div class="reviews-header">
          <h4 class="reviews-title">Individual Reviews</h4>
          <v-chip class="reviews-count" size="small" variant="tonal">
            {{ reviews.length }} review{{ reviews.length !== 1 ? 's' : '' }}
          </v-chip>
        </div>
        
        <div class="reviews-list">
          <div
            v-for="(review, index) in reviews"
            :key="review.id"
            class="review-item"
            :style="{ animationDelay: `${index * 50}ms` }"
          >
            <div class="review-content-wrapper">
              <!-- Reviewer info -->
              <div class="reviewer-section">
                <div class="reviewer-info">
                  <v-avatar class="reviewer-avatar" size="40">
                    <v-icon>mdi-account</v-icon>
                  </v-avatar>
                  <div class="reviewer-details">
                    <p class="reviewer-name">
                      {{ review.user?.name || 'Unknown Reviewer' }}
                    </p>
                    <p class="review-date">
                      {{ formatDate(review.created_at) }}
                    </p>
                  </div>
                </div>
                
                <!-- Rating badge -->
                <div v-if="review.rating" class="rating-section">
                  <v-chip
                    :class="getRatingClass(review.rating)"
                    class="rating-chip"
                    size="small"
                    variant="flat"
                  >
                    <v-icon size="14" class="rating-icon">
                      {{ getRatingIcon(review.rating) }}
                    </v-icon>
                    {{ getRatingDisplay(review.rating) }}
                  </v-chip>
                </div>
              </div>

              <!-- Comments -->
              <div class="comments-section">
                <div v-if="review.comments" class="comment-content">
                  <v-icon size="16" class="comment-icon">mdi-comment-text-outline</v-icon>
                  <p class="comment-text">{{ review.comments }}</p>
                </div>
                <div v-else class="no-comment">
                  <v-icon size="16" class="no-comment-icon">mdi-comment-off-outline</v-icon>
                  <p class="no-comment-text">No comments provided</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- No reviews state -->
      <div v-else class="no-reviews-state">
        <div class="no-reviews-content">
          <div class="no-reviews-icon-wrapper">
            <v-icon class="no-reviews-icon">mdi-comment-off-outline</v-icon>
          </div>
          <h4 class="no-reviews-title">No Reviews Yet</h4>
          <p class="no-reviews-description">
            This song hasn't been reviewed by anyone yet. Be the first to share your feedback!
          </p>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.review-card {
  height: fit-content;
  max-height: 100%;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.06);
  background: linear-gradient(135deg, #ffffff 0%, #fafafa 100%);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.review-card:hover {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

/* Header Styles */
.review-header {
  position: relative;
  background: linear-gradient(135deg, #c62828 0%, #b71c1c 100%);
  color: white;
  padding: 20px 24px;
  border-radius: 12px 12px 0 0;
}

.header-content {
  display: flex;
  align-items: center;
  padding-right: 56px; /* Space for close button when present */
}

.header-icon-wrapper {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 12px;
  margin-right: 16px;
  backdrop-filter: blur(10px);
}

.header-icon {
  color: white;
  font-size: 24px;
}

.header-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  line-height: 1.2;
  word-break: break-word;
}

.header-subtitle {
  font-size: 0.875rem;
  opacity: 0.9;
  margin: 4px 0 0 0;
  line-height: 1.3;
  word-break: break-all;
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  transition: all 0.2s ease;
  z-index: 1;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

/* Content Styles */
.review-content {
  padding: 24px;
}

/* Reviews Section */
.reviews-section {
  margin-top: 0;
}

.reviews-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.reviews-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
}

.reviews-count {
  background: linear-gradient(135deg, #c62828 0%, #b71c1c 100%);
  color: white;
  font-weight: 500;
}

.reviews-list {
  max-height: 60vh;
  overflow-y: auto;
  padding-right: 4px;
}

.reviews-list::-webkit-scrollbar {
  width: 6px;
}

.reviews-list::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.reviews-list::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #c62828 0%, #b71c1c 100%);
  border-radius: 3px;
}

.review-item {
  background: white;
  border-radius: 16px;
  margin-bottom: 16px;
  border: 1px solid rgba(0, 0, 0, 0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: slideInLeft 0.5s ease-out both;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}

.review-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
  border-color: rgba(198, 40, 40, 0.2);
}

.review-content-wrapper {
  padding: 20px;
}

.reviewer-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.reviewer-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.reviewer-avatar {
  background: linear-gradient(135deg, #c62828 0%, #b71c1c 100%);
  color: white;
  box-shadow: 0 4px 16px rgba(198, 40, 40, 0.3);
}

.reviewer-details {
  flex: 1;
}

.reviewer-name {
  font-size: 1rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 4px 0;
  line-height: 1.2;
}

.review-date {
  font-size: 0.8125rem;
  color: #718096;
  margin: 0;
  line-height: 1.2;
}

.rating-section {
  margin-left: 12px;
}

.rating-chip {
  font-weight: 600;
  font-size: 0.8125rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.rating-chip:hover {
  transform: scale(1.05);
}

.rating-icon {
  margin-right: 4px;
}

/* Comments Section */
.comments-section {
  margin-top: 12px;
}

.comment-content {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  background: #f8fafc;
  padding: 12px;
  border-radius: 12px;
  border-left: 4px solid #c62828;
}

.comment-icon {
  color: #c62828;
  margin-top: 2px;
  flex-shrink: 0;
}

.comment-text {
  font-size: 0.9375rem;
  color: #2d3748;
  line-height: 1.5;
  margin: 0;
}

.no-comment {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #f7fafc;
  border-radius: 12px;
  border-left: 4px solid #cbd5e0;
}

.no-comment-icon {
  color: #a0aec0;
  flex-shrink: 0;
}

.no-comment-text {
  font-size: 0.875rem;
  color: #718096;
  font-style: italic;
  margin: 0;
}

/* No Reviews State */
.no-reviews-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  padding: 40px 20px;
}

.no-reviews-content {
  text-align: center;
  max-width: 300px;
}

.no-reviews-icon-wrapper {
  background: linear-gradient(135deg, #fbb6ce 0%, #f687b3 100%);
  border-radius: 50%;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  box-shadow: 0 6px 24px rgba(251, 182, 206, 0.4);
}

.no-reviews-icon {
  color: white;
  font-size: 32px;
}

.no-reviews-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0 0 8px 0;
}

.no-reviews-description {
  font-size: 0.9375rem;
  color: #718096;
  line-height: 1.5;
  margin: 0;
}

/* Rating Colors */
.rating-approved {
  background: linear-gradient(135deg, #48bb78 0%, #38a169 100%) !important;
  color: white !important;
}

.rating-low-intensity {
  background: linear-gradient(135deg, #68d391 0%, #48bb78 100%) !important;
  color: white !important;
}

.rating-producers-only {
  background: linear-gradient(135deg, #9f7aea 0%, #805ad5 100%) !important;
  color: white !important;
}

.rating-not-approved {
  background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%) !important;
  color: white !important;
}

.rating-undecided {
  background: linear-gradient(135deg, #ed8936 0%, #dd6b20 100%) !important;
  color: white !important;
}

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .review-header {
    padding: 16px 20px;
  }
  
  .header-title {
    font-size: 1.125rem;
  }
  
  .header-subtitle {
    font-size: 0.8125rem;
  }
  
  .review-content {
    padding: 20px;
  }
  
  .review-content-wrapper {
    padding: 16px;
  }
  
  .reviewer-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .rating-section {
    margin-left: 0;
    align-self: flex-end;
  }
  
  .close-btn {
    top: 12px;
    right: 12px;
  }
  
  .header-content {
    padding-right: 48px; /* Reduced padding for mobile */
  }
}
</style>
