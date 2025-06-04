/**
 * Rating options for song reviews
 */
export const RATING_OPTIONS = [
  { 
    code: 'A', 
    label: 'Approved', 
    color: 'green', 
    icon: 'mdi-check-circle',
    description: 'Song is approved for all audiences'
  },
  { 
    code: 'L', 
    label: 'Low Intensity', 
    color: 'light-green', 
    icon: 'mdi-check-circle-outline',
    description: 'Approved but with lower intensity/energy'
  },
  { 
    code: 'P', 
    label: 'Producers Only', 
    color: 'purple', 
    icon: 'mdi-account-lock',
    description: 'Restricted to producers and staff only'
  },
  { 
    code: 'N', 
    label: 'Not Approved', 
    color: 'red', 
    icon: 'mdi-close-circle',
    description: 'Song is not approved for broadcast'
  },
  { 
    code: 'U', 
    label: 'Unsure', 
    color: 'orange', 
    icon: 'mdi-help-circle',
    description: 'Requires additional review before decision'
  }
]

/**
 * Convert old rating codes to new ones
 */
export function normalizeRating(rating: string | null): string | null {
  if (!rating) return null
  
  const codeMap: Record<string, string> = {
    '+': 'A', // Approved
    '-': 'N', // Not Approved
    '?': 'U'  // Unsure/Needs Review
  }
  
  return codeMap[rating] || rating
}

/**
 * Get the color for a rating
 */
export function getRatingColor(rating: string | null): string {
  const normalizedRating = normalizeRating(rating)
  const option = RATING_OPTIONS.find(opt => opt.code === normalizedRating)
  return option?.color || 'grey'
}

/**
 * Get the icon for a rating
 */
export function getRatingIcon(rating: string | null): string {
  const normalizedRating = normalizeRating(rating)
  const option = RATING_OPTIONS.find(opt => opt.code === normalizedRating)
  return option?.icon || 'mdi-circle-outline'
}

/**
 * Get the label for a rating
 */
export function getRatingLabel(rating: string | null): string {
  const normalizedRating = normalizeRating(rating)
  const option = RATING_OPTIONS.find(opt => opt.code === normalizedRating)
  return option?.label || 'No Rating'
}

/**
 * Get the description for a rating
 */
export function getRatingDescription(rating: string | null): string {
  const normalizedRating = normalizeRating(rating)
  const option = RATING_OPTIONS.find(opt => opt.code === normalizedRating)
  return option?.description || 'No rating description available'
}
