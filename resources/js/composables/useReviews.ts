import { ref, computed } from 'vue'
import { globalNotifications } from './useNotifications'
import { router, usePage } from '@inertiajs/vue3'
import { normalizeRating } from '../constants/ratingConstants'
import { user, type User } from './useSharedData'
import type { PageProps } from '@inertiajs/core'

// Types

export interface SongReview {
  id: number
  file: string
  user_id: number
  rating: string | null
  comments: string | null
  created_at: string
  updated_at: string
  user?: User
}

export interface ReviewSubmission {
  file: string
  rating: string | null
  comments: string | null
  action?: string
  id?: number
}

export interface SongForReview {
  file: string
  title: string
  artist: string
  seconds?: number
  tags?: string
}

export interface AuthProps {
  user: User
}

export interface InertiaPageProps extends PageProps {
  auth: AuthProps
  songReviews: SongReview[]
  songs: SongForReview[]
}

/**
 * Composable for handling song review data and operations
 */
export function useReviews() {
  // State
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Get Inertia page
  const page = usePage()

  // Access data from Inertia props and window global
  const reviews = computed(() => (page.props.songReviews as SongReview[]) || [])
  const songs = computed(() => (page.props.songs as SongForReview[]) || [])

  // Use shared data composable for user data
  const currentUser = computed(() => user.value)
  const currentUserId = computed(() => user.value?.id || 0)

  /**
   * Handle API errors consistently
   */
  const handleError = (err: any, defaultMessage: string) => {
    const errorMessage = err.message || defaultMessage
    error.value = errorMessage
    globalNotifications.error(errorMessage)
    return false
  }

  /**
   * Refresh reviews by reloading Inertia data
   * Note: This is only needed for explicit refreshes, as Inertia
   * automatically updates props after form submissions
   */
  const refreshReviews = async () => {
    router.reload({ only: ['songReviews'] })
    return reviews.value
  }

  /**
   * Refresh songs that need review
   * Note: This is only needed for explicit refreshes, as Inertia
   * automatically updates props after form submissions
   */
  const refreshSongs = async () => {
    router.reload({ only: ['songs'] })
    return songs.value
  }

  /**
   * Submit a review (create or update) with optimistic updates
   */
  const submitReview = async (review: ReviewSubmission): Promise<SongReview | null> => {
    isLoading.value = true
    error.value = null

    try {
      const userId = currentUserId.value
      if (!userId) {
        throw new Error('User not authenticated')
      }

      // Check if this user already has a review for this file
      const existingReview = reviews.value.find(
        r => r.file === review.file && r.user_id === userId
      )

      // Create optimistic review for immediate UI feedback
      const optimisticReview: SongReview = {
        id: existingReview?.id || Date.now(), // Temporary ID for new reviews
        file: review.file,
        user_id: userId,
        rating: review.rating,
        comments: review.comments,
        created_at: existingReview?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user: currentUser.value || undefined
      }

      // Prepare form data
      const formData = {
        file: review.file,
        rating: review.rating,
        comments: review.comments,
        user_id: userId,
        ...(existingReview && { id: existingReview.id })
      }

      // Submit using Inertia with partial reload
      await router.put('/review-songs', formData, {
        only: ['songReviews'],                                  // only reload the song reviews (not the songs) when redirected back to the main page
        preserveState: true,                                    // preserve the state of the page (so the songs are still loaded)
        preserveScroll: true,                                   // preserve the scroll position of the page (so the user doesn't have to scroll back to the top)
        onSuccess: () => {
          globalNotifications.success('Review saved successfully')
        },
        onError: (errors) => {
          const errorMessage = Object.values(errors).flat().join(', ')
          error.value = errorMessage || 'Failed to submit review'
          globalNotifications.error(error.value)
        }
      })

      return optimisticReview
    } catch (err: any) {
      handleError(err, 'Failed to submit review')
      return null
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Get the current user's review for a specific file
   */
  const getCurrentUserReview = (file: string): SongReview | undefined => {
    const userId = currentUserId.value
    if (!userId) return undefined

    return reviews.value.find(
      review => review.file === file && review.user_id === userId
    )
  }

  /**
   * Get reviews from other users for a specific file
   */
  const getOtherReviews = (file: string): SongReview[] => {
    const userId = currentUserId.value
    if (!userId) return []

    return reviews.value.filter(
      review => review.file === file && review.user_id !== userId
    )
  }

  /**
   * Get all reviews for a specific file
   */
  const getFileReviews = (file: string): SongReview[] => {
    return reviews.value.filter(review => review.file === file)
  }

  /**
   * Get a count of each rating type for a specific file
   */
  const getRatingCounts = (file: string) => {
    if (!file) return { A: 0, L: 0, P: 0, N: 0, U: 0, total: 0 }

    const fileReviews = getFileReviews(file)

    return {
      A: fileReviews.filter(r => r.rating === 'A' || r.rating === '+').length,
      L: fileReviews.filter(r => r.rating === 'L').length,
      P: fileReviews.filter(r => r.rating === 'P').length,
      N: fileReviews.filter(r => r.rating === 'N' || r.rating === '-').length,
      U: fileReviews.filter(r => r.rating === 'U' || r.rating === '?').length,
      total: fileReviews.length
    }
  }


  return {
    // State
    reviews,
    songs,
    currentUser,
    currentUserId,
    isLoading,
    error,

    // Methods
    refreshReviews,
    refreshSongs,
    submitReview,
    getCurrentUserReview,
    getOtherReviews,
    getFileReviews,
    getRatingCounts,
    normalizeRating
  }
}
