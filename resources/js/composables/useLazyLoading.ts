import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import type { Ref } from 'vue'

/**
 * Priority levels for resource loading
 */
export enum LoadPriority {
  HIGH = 0,   // Load immediately
  MEDIUM = 1, // Load after high priority items
  LOW = 2     // Load only when idle or explicitly requested
}

/**
 * Options for lazy loading
 */
export interface LazyLoadOptions {
  /**
   * Root margin for Intersection Observer
   * Format: "top right bottom left" in pixels or percentage
   */
  rootMargin?: string
  
  /**
   * Threshold for Intersection Observer
   * Value between 0 and 1 indicating visibility percentage required
   */
  threshold?: number | number[]
  
  /**
   * Whether to unobserve after loading
   */
  unobserveAfterLoad?: boolean
}

/**
 * Composable for lazy loading elements when they enter the viewport
 */
export function useLazyLoading(options: LazyLoadOptions = {}) {
  // Default options
  const {
    rootMargin = '100px',
    threshold = 0.1,
    unobserveAfterLoad = true
  } = options
  
  // Track observed elements and their load status
  const observedElements = new Map<Element, {
    loaded: Ref<boolean>
    onLoad?: () => void
  }>()
  
  // Create Intersection Observer
  let observer: IntersectionObserver | null = null
  
  // Initialize observer
  const initObserver = () => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return
    }
    
    observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const element = entry.target
          const data = observedElements.get(element)
          
          if (data) {
            // Mark as loaded
            data.loaded.value = true
            
            // Handle image elements
            if (element.tagName === 'IMG') {
              const dataSrc = element.getAttribute('data-src')
              if (dataSrc) {
                (element as HTMLImageElement).src = dataSrc
                element.removeAttribute('data-src')
              }
            }
            
            // Handle v-img components
            else if (element.classList.contains('v-img')) {
              const dataSrc = element.getAttribute('data-src')
              if (dataSrc) {
                // For v-img components, we need to update the style background
                const imgElement = element.querySelector('.v-img__img')
                if (imgElement) {
                  imgElement.classList.add('v-img__img--contain')
                  imgElement.setAttribute('style', `background-image: url("${dataSrc}");`)
                }
                element.removeAttribute('data-src')
              }
            }
            
            // Call onLoad callback if provided
            if (data.onLoad) {
              data.onLoad()
            }
            
            // Unobserve if configured to do so
            if (unobserveAfterLoad) {
              observer?.unobserve(element)
            }
          }
        }
      })
    }, {
      rootMargin,
      threshold
    })
  }
  
  // Register an element for lazy loading
  const observe = (element: Element, onLoad?: () => void) => {
    if (!element || !observer) return ref(true)
    
    // Create loaded state
    const loaded = ref(false)
    
    // Store element data
    observedElements.set(element, { loaded, onLoad })
    
    // Start observing
    observer.observe(element)
    
    return loaded
  }
  
  // Unregister an element
  const unobserve = (element: Element) => {
    if (!element || !observer) return
    
    observer.unobserve(element)
    observedElements.delete(element)
  }
  
  // Initialize on mount
  onMounted(() => {
    initObserver()
  })
  
  // Clean up on unmount
  onUnmounted(() => {
    if (observer) {
      observer.disconnect()
      observer = null
    }
    
    observedElements.clear()
  })
  
  return {
    observe,
    unobserve
  }
}

/**
 * Resource request interface
 */
interface ResourceRequest {
  url: string
  priority: LoadPriority
  load: () => Promise<any>
  onComplete: (result: any) => void
  onError: (error: any) => void
}

/**
 * Class for optimizing resource loading with priority-based queuing
 */
class ResourceLoader {
  private queue: ResourceRequest[] = []
  private loading = false
  private concurrentLoads = 3
  private activeLoads = 0
  
  /**
   * Create a new ResourceLoader instance
   * @param options Configuration options
   */
  constructor(options = { concurrentLoads: 3 }) {
    this.concurrentLoads = options.concurrentLoads
  }
  
  /**
   * Add a resource to the loading queue
   * @param request The resource request to queue
   */
  public enqueue(request: ResourceRequest): void {
    // Add to queue and sort by priority
    this.queue.push(request)
    this.queue.sort((a, b) => a.priority - b.priority)
    
    // Start processing if not already
    this.processQueue()
  }
  
  /**
   * Process the queue of resource requests
   */
  private processQueue(): void {
    if (this.loading) return
    this.loading = true
    
    const processNext = () => {
      // If queue is empty or we've reached concurrent limit, stop
      if (this.queue.length === 0 || this.activeLoads >= this.concurrentLoads) {
        if (this.activeLoads === 0) {
          this.loading = false
        }
        return
      }
      
      // Get next request
      const request = this.queue.shift()!
      this.activeLoads++
      
      // Process request
      request.load()
        .then(result => {
          request.onComplete(result)
        })
        .catch(error => {
          request.onError(error)
        })
        .finally(() => {
          this.activeLoads--
          processNext()
        })
      
      // Process more if we can
      if (this.activeLoads < this.concurrentLoads) {
        processNext()
      }
    }
    
    processNext()
  }
  
  /**
   * Helper method to load an image with priority
   * @param url The image URL
   * @param priority The loading priority
   * @returns Promise that resolves when the image is loaded
   */
  public loadImage(url: string, priority: LoadPriority = LoadPriority.MEDIUM): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      this.enqueue({
        url,
        priority,
        load: () => {
          return new Promise((innerResolve, innerReject) => {
            const img = new Image()
            img.onload = () => innerResolve(img)
            img.onerror = (e) => innerReject(e)
            img.src = url
          })
        },
        onComplete: (img) => resolve(img),
        onError: (error) => reject(error)
      })
    })
  }
  
  /**
   * Helper method to load audio with priority
   * @param url The audio URL
   * @param priority The loading priority
   * @returns Promise that resolves when the audio is loaded
   */
  public loadAudio(url: string, priority: LoadPriority = LoadPriority.MEDIUM): Promise<HTMLAudioElement> {
    return new Promise((resolve, reject) => {
      this.enqueue({
        url,
        priority,
        load: () => {
          return new Promise((innerResolve, innerReject) => {
            const audio = new Audio()
            audio.oncanplaythrough = () => innerResolve(audio)
            audio.onerror = (e) => innerReject(e)
            audio.src = url
            audio.load()
          })
        },
        onComplete: (audio) => resolve(audio),
        onError: (error) => reject(error)
      })
    })
  }
  
  /**
   * Create a singleton instance of ResourceLoader
   */
  private static instance: ResourceLoader | null = null
  
  /**
   * Get the singleton instance of ResourceLoader
   */
  public static getInstance(): ResourceLoader {
    if (!ResourceLoader.instance) {
      ResourceLoader.instance = new ResourceLoader()
    }
    return ResourceLoader.instance
  }
}

/**
 * Composable for using the ResourceLoader
 */
export function useResourceLoader() {
  return ResourceLoader.getInstance()
}

/**
 * Composable for lazy loading audio previews
 */
export function useLazyAudio() {
  // Create lazy loading instance
  const { observe, unobserve } = useLazyLoading({
    rootMargin: '200px', // Preload audio before it's visible
    unobserveAfterLoad: true
  })
  
  // Track audio elements
  const audioElements = new Map<string, HTMLAudioElement>()
  
  // Preload audio when element is visible
  const preloadAudio = (id: string, src: string, containerElement: Element) => {
    // Check if already preloaded
    if (audioElements.has(id)) {
      return audioElements.get(id)
    }
    
    // Create audio element
    const audio = new Audio()
    audio.preload = 'none' // Don't load until we're ready
    
    // Store audio element
    audioElements.set(id, audio)
    
    // Observe container element
    observe(containerElement, () => {
      // Set source and start preloading
      audio.src = src
      audio.preload = 'metadata' // Just load metadata first
      
      // Load more data after metadata is loaded
      audio.addEventListener('loadedmetadata', () => {
        // Now preload some of the audio data
        audio.preload = 'auto'
        
        // Just load a bit of the audio
        setTimeout(() => {
          if (audio.readyState < 3) { // HAVE_FUTURE_DATA
            audio.pause() // Stop loading more data
          }
        }, 2000)
      })
    })
    
    return audio
  }
  
  // Clean up audio elements
  const cleanup = () => {
    audioElements.forEach((audio) => {
      audio.src = ''
      audio.load() // Reset and release resources
    })
    
    audioElements.clear()
  }
  
  // Clean up on unmount
  onUnmounted(() => {
    cleanup()
  })
  
  return {
    preloadAudio,
    cleanup
  }
}

/**
 * Options for content lazy loading
 */
export interface ContentLazyLoadOptions {
  /**
   * Path to load content from
   */
  path: Ref<string>
  
  /**
   * Search query (optional)
   */
  search?: Ref<string>
  
  /**
   * Prefilter slug (optional)
   */
  prefilter?: Ref<string>
  
  /**
   * Sort direction (optional)
   */
  sort?: Ref<string>
  
  /**
   * Whether to include subfolders (optional)
   */
  includeSubfolders?: Ref<boolean>
  
  /**
   * Initial content items (optional)
   */
  initialItems?: any[]
  
  /**
   * Initial cursor (optional)
   */
  initialCursor?: string | null
  
  /**
   * Threshold for loading more items (in pixels)
   */
  threshold?: number
}

/**
 * Composable for lazy loading content items with optimized performance
 * This is a specialized version that works with the content API
 */
export function useContentLazyLoading(options: ContentLazyLoadOptions) {
  const {
    path,
    search = ref(''),
    prefilter = ref(''),
    sort = ref('asc'),
    includeSubfolders = ref(false),
    initialItems = [],
    initialCursor = null,
    threshold = 200
  } = options
  
  // Track if we're in search mode
  const isSearchMode = computed(() => !!search.value)
  
  // Create a fetch function for the infinite pagination
  const fetchContentItems = async (cursor: string | null) => {
    // Build the URL with query parameters
    const params = new URLSearchParams()
    if (cursor) params.append('cursor', cursor)
    if (search.value) params.append('search', search.value)
    if (prefilter.value) params.append('prefilter', prefilter.value)
    if (sort.value) params.append('sort', sort.value)
    params.append('includeSubfolders', includeSubfolders.value ? 'true' : 'false')
    
    // Encode the path properly, handling empty paths
    const encodedPath = path.value ? encodeURIComponent(path.value) : ''
    
    // Fetch the data
    const response = await fetch(`/api/content/${encodedPath}?${params.toString()}`)
    
    if (!response.ok) {
      throw new Error(`Failed to fetch content: ${response.statusText}`)
    }
    
    const data = await response.json()
    
    // Validate response structure
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid response format: Expected object')
    }
    
    // Ensure items is always an array
    const items = Array.isArray(data.items) ? data.items : []
    
    return {
      data: items,
      nextCursor: data.nextCursor || null
    }
  }
  
  // Use the infinite pagination composable
  const items = ref(initialItems)
  const isLoading = ref(false)
  const hasMore = ref(true)   /// ?????
  const error = ref<Error | null>(null)
  const currentCursor = ref(initialCursor)
  
  // Function to load more items
  const loadMore = async () => {
    if (isLoading.value || !hasMore.value) return
    
    isLoading.value = true
    error.value = null
    
    try {
      const result = await fetchContentItems(currentCursor.value)
      
      // Check if result.data is an array before spreading
      if (Array.isArray(result.data)) {
        // Add new items to the list
        items.value = [...items.value, ...result.data]
        
        // Update cursor and hasMore flag
        currentCursor.value = result.nextCursor
        hasMore.value = !!result.nextCursor
      } else {
        // Handle non-array data
        console.error('Expected array but received:', result.data)
        error.value = new Error('Invalid response format from server')
        hasMore.value = false
      }
    } catch (err) {
      error.value = err as Error
      console.error('Error loading content:', err)
    } finally {
      isLoading.value = false
    }
  }
  
  // Function to reset pagination
  const reset = () => {
    items.value = []
    currentCursor.value = null
    hasMore.value = true
    error.value = null
    // loadMore()
  }
  
  // Watch for changes in path, search, prefilter, or sort to reset pagination
  watch([path, search, prefilter, sort, includeSubfolders], () => {
    reset()
  })
  
  // Optimize memory usage by cleaning up items that are far out of view
  const cleanupThreshold = 1000 // Items to keep before and after visible range
  const visibleRangeStart = ref(0)
  const visibleRangeEnd = ref(0)
  
  // Function to update visible range based on scroll position
  const updateVisibleRange = () => {
    const scrollTop = window.scrollY
    const viewportHeight = window.innerHeight
    
    // Estimate which items are visible based on average item height (assuming 100px per item)
    const averageItemHeight = 100
    visibleRangeStart.value = Math.floor(scrollTop / averageItemHeight)
    visibleRangeEnd.value = Math.ceil((scrollTop + viewportHeight) / averageItemHeight)
    
    // Only perform cleanup if we have a lot of items
    if (items.value.length > cleanupThreshold * 3) {
      cleanupOffscreenItems()
    }
  }
  
  // Function to clean up items that are far out of view
  const cleanupOffscreenItems = () => {
    // Keep a buffer of items before and after the visible range
    const keepStart = Math.max(0, visibleRangeStart.value - cleanupThreshold)
    const keepEnd = visibleRangeEnd.value + cleanupThreshold
    
    // If we have items far above the visible range, remove them
    if (keepStart > cleanupThreshold) {
      // Remove items that are far above the visible range
      items.value = items.value.slice(keepStart)
      
      console.log(`Cleaned up ${keepStart} items above the visible range`)
    }
    
    // If we have items far below the visible range, remove them
    if (items.value.length > keepEnd + cleanupThreshold) {
      items.value = items.value.slice(0, keepEnd)
      
      console.log(`Cleaned up ${items.value.length - keepEnd} items below the visible range`)
    }
  }
  
  // Set up scroll listener for updating visible range
  onMounted(() => {
    window.addEventListener('scroll', updateVisibleRange, { passive: true })
    updateVisibleRange() // Initial update
    
    // // Load initial items if none provided
    // if (items.value.length === 0) {
    //   loadMore()
    // }
  })
  
  // Clean up scroll listener
  onUnmounted(() => {
    window.removeEventListener('scroll', updateVisibleRange)
  })
  
  return {
    items,
    isLoading,
    hasMore,
    error,
    loadMore,
    reset,
    isSearchMode,
    visibleRangeStart,
    visibleRangeEnd
  }
}

/**
 * Vue directive for lazy loading images
 * Usage: v-lazy-load="imageUrl"
 */
export const vLazyLoad = {
  mounted(el: HTMLElement, binding: any) {
    const dataSrc = binding.value
    
    // Skip if no value provided
    if (!dataSrc) return
    
    // Set placeholder and data-src attribute
    if (el.tagName === 'IMG') {
      // For regular img tags
      el.setAttribute('data-src', dataSrc)
      // Optional: set a placeholder or loading image
      // el.setAttribute('src', '/path/to/placeholder.png')
    } else if (el.classList.contains('v-img')) {
      // For Vuetify v-img components
      el.setAttribute('data-src', dataSrc)
    }
    
    // Create and configure IntersectionObserver
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (el.tagName === 'IMG') {
            // For regular img tags
            el.setAttribute('src', dataSrc)
          } else if (el.classList.contains('v-img')) {
            // For Vuetify v-img components
            const imgElement = el.querySelector('.v-img__img')
            if (imgElement) {
              imgElement.classList.add('v-img__img--contain')
              imgElement.setAttribute('style', `background-image: url("${dataSrc}");`)
            }
          }
          
          // Remove data-src attribute
          el.removeAttribute('data-src')
          
          // Stop observing
          observer.unobserve(el)
        }
      })
    }, {
      rootMargin: '100px', // Load images when they're 100px from entering the viewport
      threshold: 0.1
    })
    
    // Start observing the element
    observer.observe(el)
  }
}
