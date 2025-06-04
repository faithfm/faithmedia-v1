import { ref, computed } from 'vue'
import { globalNotifications } from './useNotifications'
import { router, usePage } from '@inertiajs/vue3'

// Import the SongReview type from useReviews
import { type SongReview, type SongForReview } from './useReviews'

// Types
export interface SongReviewSummary {
  id?: number
  file: string
  name?: string
  status: string
  source: string | null
  comment: string | null
  created_at?: string
  updated_at?: string
  [key: string]: string | number | null | undefined
}


export function useReviewSummaries() {
  // State
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Get Inertia page
  const page = usePage()

  // Access data from Inertia props - ALL data loaded upfront
  const allReviews = computed(() => (page.props.allReviews as SongReview[]) || [])
  const songs = computed(() => (page.props.songs as SongForReview[]) || [])

  // Generate summaries by iterating through songs (song-driven approach)
  const summaries = computed(() => {
    const rawSummaries = (page.props.summaries as SongReviewSummary[]) || []

    // Iterate through songs and find matching summary directly
    return songs.value.map((song, index) => {
      const existingSummary = rawSummaries.find(s => s.file === song.file)

      // Create display object with song data and summary data (if exists)
      return {
        id: index + 1, // Display ID for table
        file: song.file,
        name: `${song.artist} - ${song.title}`,
        status: existingSummary?.status || '',
        source: existingSummary?.source || null,
        comment: existingSummary?.comment || null,
        created_at: existingSummary?.created_at,
        updated_at: existingSummary?.updated_at
      }
    })
  })

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
   * Refresh summaries by reloading Inertia data
   * Note: This is only needed for explicit refreshes, as Inertia
   * automatically updates props after form submissions
   */
  const refreshSummaries = async () => {
    isLoading.value = true
    error.value = null

    try {
      router.reload({ only: ['summaries'] })
      return summaries.value
    } catch (err: any) {
      return handleError(err, 'Failed to refresh summaries')
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Update a summary with optimistic updates
   */
  const updateSummary = (data: Partial<SongReviewSummary> & { file: string }) => {
    isLoading.value = true
    error.value = null

    try {
      // Find and update summary optimistically
      const summary = summaries.value.find(s => s.file === data.file)
      if (!summary) {
        throw new Error(`Summary not found for file: ${data.file}`)
      }

      // Apply optimistic update - backend handles partial updates
      Object.assign(summary, data)

      // Create clean data object for API call
      const requestData = {
        file: data.file,
        ...(data.status !== undefined && { status: data.status }),
        ...(data.source !== undefined && { source: data.source }),
        ...(data.comment !== undefined && { comment: data.comment })
      }

      // Send data to backend with partial reload - only reload summaries
      router.patch('/review-songs-summary', requestData, {
        preserveScroll: true,
        preserveState: true,
        only: ['summaries'],                                    // Only reload summaries (not reviews or sourceSuggestions)
        onSuccess: () => {
          error.value = null
          globalNotifications.success('Summary updated successfully')
          isLoading.value = false
        },
        onError: (errors) => {
          const errorMessage = Object.values(errors).flat().join(', ')
          handleError({ message: errorMessage }, 'Failed to update summary')
          isLoading.value = false
        }
      })
    } catch (err: any) {
      handleError(err, 'Failed to update summary')
      isLoading.value = false
    }
  }

  /**
   * Get all reviews for a specific file (client-side filtering)
   */
  const getFileReviews = (file: string): SongReview[] => {
    return allReviews.value.filter(review => review.file === file)
  }


  /**
   * Get source suggestions from the database
   */
  const getSourceSuggestions = computed(() => (page.props.sourceSuggestions as string[]) || [])

  return {
    // State
    summaries,
    allReviews,
    songs,
    isLoading,
    error,

    // Methods
    refreshSummaries,
    updateSummary,
    getFileReviews,
    getSourceSuggestions
  }
}
