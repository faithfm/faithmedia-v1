import { computed, type ComputedRef } from 'vue'
import { config } from './useSharedData'

// Types
interface DbContentUrlsReturn {
  oggUrl: (dbPathname?: string) => string
  mp3Url: (dbPathname?: string) => string
  origUrl: (dbPathname?: string) => string
  isConfigValid: ComputedRef<boolean>
}

/**
 * Composable for generating database content URLs
 *
 * Automatically loads configuration from shared data (Laravel myapp.php config-file,
 * passed to the front end via Inertia shared data).
 *
 * @returns Object with URL generation functions
 */
export function useDbContentUrls(): DbContentUrlsReturn {

  // Validate that required config is present
  const isConfigValid = computed(() => {
    return !!(
      config.value?.media_download_base?.ogg &&
      config.value?.media_download_base?.mp3 &&
      config.value?.media_download_base?.orig
    )
  })

  /**
   * Internal function to encode database URLs
   * Handles special cloudfront distribution for ads and URL encoding
   */
  const dbUrlEncode = (dbPathname: string): string => {
    let encodedPath = dbPathname

    // Use special cloudfront dist for paths containing 'ads' to prevent ad blockers blocking it
    encodedPath = encodedPath.replace(
      'content96k.faithfm.com.au/ads/stationads/',
      'content96k-link2.faithfm.com.au/'
    )
    encodedPath = encodedPath.replace(
      'content96k.faithfm.com.au/ads/',
      'content96k-link1.faithfm.com.au/'
    )

    // Manually URL-encode any '+' characters
    return encodedPath.replace(/\+/g, "%2B")
  }

  /**
   * Generate URL for main OGG file downloaded by playout systems and logged in the content db
   */
  const oggUrl = (dbPathname?: string): string => {
    if (!dbPathname || !isConfigValid.value) {
      if (!dbPathname) console.warn('useDbContentUrls: No pathname provided for oggUrl')
      if (!isConfigValid.value) console.warn('useDbContentUrls: Invalid config provided for oggUrl')
      return ''
    }
    return dbUrlEncode(config.value.media_download_base.ogg + dbPathname)
  }

  /**
   * Generate URL for low-quality MP3 file played by web+app listeners
   */
  const mp3Url = (dbPathname?: string): string => {
    if (!dbPathname || !isConfigValid.value) {
      if (!dbPathname) console.warn('useDbContentUrls: No pathname provided for mp3Url')
      if (!isConfigValid.value) console.warn('useDbContentUrls: Invalid config provided for mp3Url')
      return ''
    }
    const mp3Path = (config.value.media_download_base.mp3 + dbPathname).replace(".ogg", ".mp3")
    return dbUrlEncode(mp3Path)
  }

  /**
   * Generate URL for non-compressed "original" file (when available, e.g., music library)
   */
  const origUrl = (dbPathname?: string): string => {
    if (!dbPathname || !isConfigValid.value) {
      if (!dbPathname) console.warn('useDbContentUrls: No pathname provided for origUrl')
      if (!isConfigValid.value) console.warn('useDbContentUrls: Invalid config provided for origUrl')
      return ''
    }
    const origPath = (config.value.media_download_base.orig + dbPathname)
      .replace(/\/([^\/]+)$/, '/originals/$1')
      .replace(".ogg", ".mp3")
    return dbUrlEncode(origPath)
  }

  return {
    oggUrl,
    mp3Url,
    origUrl,
    isConfigValid
  }
}
