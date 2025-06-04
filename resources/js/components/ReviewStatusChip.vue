<script setup lang="ts">
import { computed } from 'vue'
import type { SongReview } from '../composables/useReviews'
import { normalizeRating, getRatingColor, getRatingIcon, getRatingLabel } from '../constants/ratingConstants'

interface Props {
  file: string
  myReview: SongReview | undefined
  allReviews: SongReview[]
}

const props = defineProps<Props>()
const emit = defineEmits(['click'])

// Primary rating (current user's rating)
const myRating = computed(() => {
  return normalizeRating(props.myReview?.rating || null)
})

// Filter out the current user's review to get others' reviews
const others = computed(() => {
  return props.allReviews.filter(r => r.user_id !== props.myReview?.user_id)
})

// Group "others" by rating code
const countsByRating = computed(() => {
  return others.value.reduce((acc, r) => {
    const code = normalizeRating(r.rating || null)
    if (code) {
      acc[code] = (acc[code] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)
})

// Build an ARIA label summarizing reviews
const ariaLabel = computed(() => {
  const myRatingLabel = getRatingLabel(myRating.value)

  let label = `Your rating: ${myRatingLabel}`

  if (Object.keys(countsByRating.value).length > 0) {
    const otherRatings = Object.entries(countsByRating.value)
      .map(([code, count]) => `${count}×${getRatingLabel(code)}`)
      .join(', ')

    label += `; Others: ${otherRatings}`
  }

  return label
})

// Check if any review has comments
const hasComments = computed(() => {
  return props.allReviews.some(review =>
    !!review.comments && review.comments.trim().length > 0
  )
})

// Handle click event
const openDialog = (file: string) => {
  emit('click', file)
}
</script>

<template>
  <v-chip clickable outlined @click="() => openDialog(file)" :aria-label="ariaLabel" class="review-chip">
    <!-- User section with rating code -->
    <div class="user-section">
      <span v-if="myRating" class="rating-code text-caption text--secondary">
        ({{ myRating }})
      </span>
      <v-icon :icon="getRatingIcon(myRating)" :color="getRatingColor(myRating)" size="20" class="user-rating-icon" />
    </div>

    <!-- Divider when there are other reviews -->
    <div v-if="Object.keys(countsByRating).length > 0" class="divider"></div>

    <!-- Others section -->
    <div v-if="Object.keys(countsByRating).length > 0" class="others-ratings">
      <template v-for="(count, code) in countsByRating" :key="code">
        <div class="grouped-icon">
          <v-icon :icon="getRatingIcon(code)" size="16" :color="getRatingColor(code)" />
          <span class="count-badge text-caption text--secondary">({{ count }})</span>
        </div>
      </template>
    </div>

    <!-- Comments indicator -->
    <v-icon v-if="hasComments" icon="mdi-comment-text-outline" size="16" class="comments-icon" title="Has comments" />
  </v-chip>
</template>

<style scoped>
.review-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  height: auto;
  min-height: 32px;
}

.review-chip v-icon {
  vertical-align: middle;
}

.user-section {
  display: flex;
  align-items: center;
  gap: 4px;
}

.rating-code {
  font-size: 0.85rem;
  font-weight: 600;
  opacity: 0.8;
}

.user-rating-icon {
  font-size: 20px;
  margin-right: 1px;
}

.divider {
  width: 1px;
  height: 20px;
  background-color: rgba(var(--v-theme-on-surface), 0.12);
  margin: 0 6px;
}

.others-ratings {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-wrap: wrap;
  max-width: 120px;
}

.grouped-icon {
  display: inline-flex;
  align-items: center;
  gap: 1px;
}

.count-badge {
  font-weight: 400;
  color: rgba(var(--v-theme-on-surface), 0.7);
  margin-left: 2px;        /* nudge the badge off the icon */
}

.comments-icon {
  margin-left: 2px;
  opacity: 0.8;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .review-chip {
    padding: 3px 6px;
  }

  .others-ratings {
    max-width: 120px;
  }
}

@media (max-width: 360px) {
  .review-chip {
    padding: 2px 4px;
  }

  .divider {
    height: 16px;
  }

  .others-ratings {
    max-width: 80px;
  }
}
</style>
