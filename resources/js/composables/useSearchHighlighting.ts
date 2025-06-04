import { SearchService } from '@/services/SearchService'
import { computed, Ref } from 'vue'

export function useSearchHighlighting(searchQuery: Ref<string>) {
  /**
   * Highlights search matches in text
   */
  const highlightText = (text: string | null | undefined) => {
    if (!text || !searchQuery.value.trim()) return text || ''
    return SearchService.highlightMatches(text, searchQuery.value)
  }

  /**
   * Safely renders HTML content (for highlighted text)
   */
  const renderHtml = (html: string) => {
    return { __html: html }
  }

  /**
   * Checks if the text contains any search matches
   */
  const hasMatches = (text: string | null | undefined) => {
    if (!text || !searchQuery.value.trim()) return false
    
    // Split query into terms
    const terms = searchQuery.value
      .split(/\s+/)
      .filter(term => term.length > 0)
      .map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) // Escape special characters
    
    if (terms.length === 0) return false
    
    // Create regex for matching any of the terms
    const regex = new RegExp(`(${terms.join('|')})`, 'i')
    
    return regex.test(text)
  }

  /**
   * Computed property that returns true if there's an active search query
   */
  const isSearchActive = computed(() => searchQuery.value.trim().length > 0)

  return {
    highlightText,
    renderHtml,
    hasMatches,
    isSearchActive
  }
}
