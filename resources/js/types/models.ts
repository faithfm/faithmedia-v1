/**
 * Content item from the database
 */
export interface Content {
  file: string
  series?: string
  numbers?: string
  content?: string
  guests?: string
  tags?: string
  bytes?: number
  seconds?: number
  md5?: string
  bestdate?: string
  podcastdate?: string
  source?: string
  ref?: string
  id?: number
}

/**
 * Prefilter from the database
 */
export interface Prefilter {
  id: number
  slug: string
  name: string
  filter: string
}

/**
 * Paginated content response
 */
export interface PaginatedContent {
  items: Content[]
  nextCursor: string | null
  hasMore: boolean
}
