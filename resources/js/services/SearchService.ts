import { router } from '@inertiajs/vue3'
import { Content } from '@/types/models'

/**
 * Interface for search parameters
 */
export interface SearchParams {
  query: string
  path?: string
  prefilter?: string
  sort?: 'asc' | 'desc'
  includeSubfolders?: boolean
}

/**
 * Interface for search response
 */
export interface SearchResponse {
  items: Content[]
  nextCursor: string | null
  hasMore: boolean
  totalResults?: number
}

/**
 * Service for handling search functionality
 */
export class SearchService {
  /**
   * Performs a search with the given parameters
   */
  public static search(params: SearchParams): Promise<void> {
    // Validate search parameters
    if (!params.query || params.query.trim().length < 2) {
      throw new Error('Search query must be at least 2 characters')
    }

    // Build URL and query parameters
    const url = `/content${params.path ? `/${params.path}` : ''}`
    const data = {
      search: params.query,
      prefilter: params.prefilter,
      sort: params.sort || 'asc',
      includeSubfolders: params.includeSubfolders !== undefined ? params.includeSubfolders : true // Default to true
      // Removed layout: 'playlist' to preserve current view mode
    }

    // Make request using Inertia
    return new Promise<void>((resolve, reject) => {
      router.visit(url, {
        method: 'get',
        data,
        preserveScroll: true,
        preserveState: true,
        onFinish: () => resolve(),
        onError: () => reject(new Error('Search failed'))
      })
    })
  }

  /**
   * Creates a debounced search function
   */
  public static createDebouncedSearch(callback: () => void, delay: number = 300): (params: SearchParams) => void {
    let timeoutId: number | undefined

    return (params: SearchParams) => {
      if (timeoutId !== undefined) {
        clearTimeout(timeoutId)
      }
      
      timeoutId = window.setTimeout(async () => {
        try {
          await this.search(params)
          callback()
        } catch (error) {
          console.error('Search error:', error)
        }
      }, delay)
    }
  }

  /**
   * Highlights search matches in text
   */
  public static highlightMatches(text: string | null, query: string): string {
    if (!text || !query.trim()) return text || ''

    // Split query into terms for multi-term highlighting
    const terms = query
      .split(/\s+/)
      .filter(term => term.length > 0)
      .map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) // Escape special characters

    if (terms.length === 0) return text

    // Create regex for matching any of the terms
    const regex = new RegExp(`(${terms.join('|')})`, 'gi')
    
    // Replace matches with highlighted version
    return text.replace(regex, '<mark>$1</mark>')
  }

  /**
   * Formats a file path for display, optionally highlighting the filename
   */
  public static formatPath(filePath: string, highlightFilename: boolean = false, query: string = ''): { path: string, filename: string } {
    const lastSlashIndex = filePath.lastIndexOf('/')
    
    if (lastSlashIndex === -1) {
      // No slash found, treat the whole string as filename
      return {
        path: '',
        filename: highlightFilename && query ? this.highlightMatches(filePath, query) : filePath
      }
    }
    
    const path = filePath.substring(0, lastSlashIndex)
    const filename = filePath.substring(lastSlashIndex + 1)
    
    return {
      path,
      filename: highlightFilename && query ? this.highlightMatches(filename, query) : filename
    }
  }
}
