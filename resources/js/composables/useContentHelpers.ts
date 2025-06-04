import { Ref, ref } from 'vue'
import { useSearchHighlighting } from './useSearchHighlighting'

export function useContentHelpers(searchQuery: Ref<string> = ref('')) {
  // Get search highlighting utilities
  const { highlightText, renderHtml, hasMatches, isSearchActive } = useSearchHighlighting(searchQuery)

  /**
   * Gets the filename from a path, with optional highlighting
   */
  const getFileName = (filePath: string | null | undefined, highlight: boolean = true) => {
    if (!filePath) return ''
    const filename = filePath.split('/').pop() || ''
    
    // Apply highlighting if search is active and highlighting is requested
    if (highlight && isSearchActive.value) {
      return highlightText(filename)
    }
    
    return filename
  }

  /**
   * Gets the directory path from a file path, with optional highlighting
   */
  const getFilePath = (filePath: string | null | undefined, highlight: boolean = true): string => {
    if (!filePath) return ''
    const parts = filePath.split('/')
    parts.pop() // Remove filename
    const path = parts.join('/')
    
    // Apply highlighting if search is active and highlighting is requested
    if (highlight && isSearchActive.value) {
      // Ensure we return a string, not null
      return highlightText(path) || path
    }
    
    return path
  }

  /**
   * Formats a duration in seconds to MM:SS format
   */
  const formatDuration = (seconds: number | null | undefined) => {
    if (!seconds) return '--:--'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  /**
   * Gets the last segment of a path
   */
  const getLastPathSegment = (path: string | null | undefined) => {
    if (!path) return ''
    return path.split('/').pop() || ''
  }

  /**
   * Checks if a content item has matches for the current search query
   */
  const itemHasMatches = (item: any) => {
    if (!isSearchActive.value) return false
    
    // Check various fields for matches
    return hasMatches(item.file) || 
           hasMatches(item.series) || 
           hasMatches(item.content) || 
           hasMatches(item.guests) || 
           hasMatches(item.tags)
  }

  return {
    getFileName,
    getFilePath,
    formatDuration,
    getLastPathSegment,
    highlightText,
    renderHtml,
    hasMatches,
    itemHasMatches,
    isSearchActive
  }
}
