import { computed } from 'vue'
import { usePage } from '@inertiajs/vue3'
import type { PageProps } from '@inertiajs/core'

// Types for the shared data structure
export interface MediaDownloadBase {
  ogg: string
  mp3: string
  orig: string
}

export interface AppConfig {
  name: string
  url: string
  media_download_base: MediaDownloadBase
}

export interface User {
  id: number
  name: string
  email: string
  auth0_sub: string
  api_token?: string
  created_at: string
  updated_at: string
  permissions?: Array<{
    permission: string
    restrictions?: any
  }>
  [key: string]: any // Allow for additional user properties
}

export interface SharedData {
  user: User | null
  guest: boolean
  'csrf-token': string
  config: AppConfig
}

export interface SharedDataProps extends PageProps {
  sharedData: SharedData
}

/**
 * Composable for accessing shared data from Laravel via Inertia
 *
 * This composable provides a centralized way to access shared data that's
 * passed from the Laravel backend through HandleInertiaRequests middleware.
 *
 * @see app/Http/Middleware/HandleInertiaRequests.php - Backend middleware that provides this data
 *
 * @example
 * // Use the composable in a Vue component
 * import { useSharedData } from '@/composables/useSharedData'
 *
 * const { user, config } = useSharedData()
 *
 * // Or import individual properties directly
 * import { user, config } from '@/composables/useSharedData'
 *
 * // Check if user is authenticated
 * if (user.value) {
 *   console.log('User:', user.value.name)
 * }
 *
 * // Access app configuration
 * console.log('App name:', config.value.name)
 *
 * @returns Object containing shared data and individual properties
 */
export function useSharedData() {
  // Get the page props from Inertia
  const page = usePage<SharedDataProps>()

  // Main shared data object (new naming)
  const sharedData = computed(() => page.props.sharedData)

  // Individual properties for easier access
  const user = computed(() => page.props.sharedData?.user ?? null)
  const guest = computed(() => page.props.sharedData?.guest ?? true)
  const csrfToken = computed(() => page.props.sharedData?.['csrf-token'] ?? '')
  const config = computed(() => page.props.sharedData?.config ?? {
    name: '',
    url: '',
    media_download_base: {
      ogg: '',
      mp3: '',
      orig: ''
    }
  })

  return {
    // Main shared data object
    sharedData,

    // Individual properties
    user,
    guest,
    csrfToken,
    config,
  }
}

// Export individual properties for named imports during migration
export const {
  sharedData,
  user,
  guest,
  csrfToken,
  config,
} = useSharedData()
