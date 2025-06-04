import { ref, computed } from 'vue'
import type { Ref } from 'vue'

/**
 * Navigation control types and interfaces
 * Used for consistent navigation parameter handling across components
 */

// Sort direction type
export type SortDirection = 'asc' | 'desc';

// View mode type
export type ViewModeType = 'details' | 'playlist';

// Navigation parameters interface
export interface NavigationParams {
  // Path to navigate to (folder path)
  path?: string;
  
  // Prefilter to apply (content type filter)
  prefilter?: string;
  
  // Search query
  search?: string;
  
  // Sort direction
  sort?: SortDirection;
  
  // View mode
  viewMode?: ViewModeType;
  
  // Whether to include subfolders in search/browse
  includeSubfolders?: boolean;
}

// Navigation item interface
export interface NavigationItem {
  label: string;
  icon: string;
  route: string;
  requiredRole?: string;
  requiredPermission?: string;
}

// Breadcrumb item interface
export interface BreadcrumbItem {
  label: string;
  path: string;
  isLast: boolean;
}

/**
 * Composable for application navigation
 * Combines global navigation and folder navigation functionality
 */
export function useNavigation() {
  // Global navigation items
  const navigationItems = ref<NavigationItem[]>([
    {
      label: 'Content Library',
      icon: 'mdi-music-box',
      route: '/content',
      requiredPermission: 'use-app'
    },
    {
      label: 'Song Reviews',
      icon: 'mdi-playlist-check',
      route: '/review-songs',
      requiredPermission: 'review-songs'
    },
    {
      label: 'Review Summary',
      icon: 'mdi-playlist-star',
      route: '/review-songs-summary',
      requiredPermission: 'review-songs-summary'
    },
    {
      label: 'Media Management (Nova)',
      icon: 'mdi-shield-crown',
      route: '/nova',
      requiredPermission: 'admin-media'
    }
    // Add more navigation items as needed
  ])

  return {
    navigationItems
  }
}

/**
 * Composable for folder navigation
 * 
 * IMPORTANT: All paths are stored internally WITHOUT the '/content/' prefix
 * The prefix is only added when constructing the final URL
 */
export function useFolderNavigation(pathRef: Ref<string>) {
  // Compute breadcrumb items from current path
  const breadcrumbs = computed<BreadcrumbItem[]>(() => {
    // Clean the path - remove any leading/trailing slashes and ensure no '/content/' prefix
    const path = pathRef.value.trim()
      .replace(/^\/+/, '')  // Remove leading slashes
      .replace(/\/+$/, '')  // Remove trailing slashes
      .replace(/^content\//, '')  // Remove 'content/' prefix if present
    
    if (!path) return []

    const segments = path.split('/')
    
    // Create breadcrumbs with clean, absolute paths (no '/content/' prefix)
    return segments.map((segment: string, index: number) => {
      // Create a clean absolute path up to this segment
      const absolutePath = segments.slice(0, index + 1).join('/')
      
      return {
        label: segment || 'Root',
        path: absolutePath, // Store clean path without '/content/' prefix
        isLast: index === segments.length - 1
      }
    })
  })

  // Compute if we're at root level
  const isRoot = computed(() => !pathRef.value.trim())

  // Get parent folder path
  const getParentPath = (): string => {
    const path = pathRef.value.trim()
    if (!path) return ''

    const lastSlashIndex = path.lastIndexOf('/')
    return lastSlashIndex === -1 ? '' : path.substring(0, lastSlashIndex)
  }

  // Format path for display (e.g., truncate long paths)
  const formatPath = (path: string): string => {
    const maxLength = 50
    if (path.length <= maxLength) return path

    const segments = path.split('/')
    if (segments.length <= 2) return path

    return `.../${segments.slice(-2).join('/')}`
  }

  // Get last segment of path
  const getLastSegment = (path: string): string => {
    const trimmed = path.trim()
    if (!trimmed) return ''

    const segments = trimmed.split('/')
    return segments[segments.length - 1] || ''
  }

  return {
    breadcrumbs,
    getParentPath,
    isRoot,
    formatPath,
    getLastSegment
  }
}

/**
 * Composable for recent items management
 */
export function useRecentItems() {
  // Constants for storage keys and limits
  const RECENT_FOLDERS_KEY = 'faithmedia_recent_folders'
  const RECENT_SEARCHES_KEY = 'faithmedia_recent_searches'
  const RECENT_FILTERS_KEY = 'faithmedia_recent_filters'

  const MAX_RECENT_FOLDERS = 5
  const MAX_RECENT_SEARCHES = 5
  const MAX_RECENT_FILTERS = 4

  // Load recent items from localStorage
  const loadRecentItems = <T>(key: string): T[] => {
    try {
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : []
    } catch (e) {
      console.error(`Failed to load recent items for ${key}:`, e)
      return []
    }
  }

  // Save recent items to localStorage
  const saveRecentItems = <T>(key: string, items: T[]): void => {
    try {
      localStorage.setItem(key, JSON.stringify(items))
    } catch (e) {
      console.error(`Failed to save recent items for ${key}:`, e)
    }
  }

  // Recent folders
  const recentFolders = ref<string[]>(loadRecentItems(RECENT_FOLDERS_KEY))

  const addRecentFolder = (folder: string): void => {
    if (!folder.trim()) return

    // Remove if already exists
    const index = recentFolders.value.indexOf(folder)
    if (index !== -1) {
      recentFolders.value.splice(index, 1)
    }

    // Add to beginning
    recentFolders.value.unshift(folder)

    // Limit size
    if (recentFolders.value.length > MAX_RECENT_FOLDERS) {
      recentFolders.value = recentFolders.value.slice(0, MAX_RECENT_FOLDERS)
    }

    // Save
    saveRecentItems(RECENT_FOLDERS_KEY, recentFolders.value)
  }

  // Recent searches
  const recentSearches = ref<string[]>(loadRecentItems(RECENT_SEARCHES_KEY))

  const addRecentSearch = (search: string): void => {
    if (!search.trim()) return

    // Remove if already exists
    const index = recentSearches.value.indexOf(search)
    if (index !== -1) {
      recentSearches.value.splice(index, 1)
    }

    // Add to beginning
    recentSearches.value.unshift(search)

    // Limit size
    if (recentSearches.value.length > MAX_RECENT_SEARCHES) {
      recentSearches.value = recentSearches.value.slice(0, MAX_RECENT_SEARCHES)
    }

    // Save
    saveRecentItems(RECENT_SEARCHES_KEY, recentSearches.value)
  }

  // Recent filters
  const recentFilters = ref<string[]>(loadRecentItems(RECENT_FILTERS_KEY))

  const addRecentFilter = (filter: string): void => {
    if (!filter.trim()) return

    // Remove if already exists
    const index = recentFilters.value.indexOf(filter)
    if (index !== -1) {
      recentFilters.value.splice(index, 1)
    }

    // Add to beginning
    recentFilters.value.unshift(filter)

    // Limit size
    if (recentFilters.value.length > MAX_RECENT_FILTERS) {
      recentFilters.value = recentFilters.value.slice(0, MAX_RECENT_FILTERS)
    }

    // Save
    saveRecentItems(RECENT_FILTERS_KEY, recentFilters.value)
  }

  return {
    recentFolders,
    addRecentFolder,
    recentSearches,
    addRecentSearch,
    recentFilters,
    addRecentFilter
  }
}
