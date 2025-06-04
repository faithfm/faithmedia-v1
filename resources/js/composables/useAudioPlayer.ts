import { ref, computed, watch } from 'vue'
import { Howl } from 'howler'
import type { Ref } from 'vue'
import { useDbContentUrls } from './useDbContentUrls'

// Audio player configuration
export interface AudioPlayerConfig {
  /**
   * Preload strategy for audio files
   * - 'auto': Load everything immediately (default Howler behavior)
   * - 'metadata': Only load metadata (duration, etc.)
   * - 'lazy': Only load when user interacts with the track
   */
  preloadStrategy: 'auto' | 'metadata' | 'lazy'
}

// Options interface for useAudioPlayer
export interface AudioPlayerOptions {
  preloadStrategy?: 'auto' | 'metadata' | 'lazy'
}

// Types for our audio player state
export interface TrackInfo {
  id: string
  file: string
  title: string
  artist?: string
  duration: number
  seek: number
}

export interface AudioPlayerState {
  currentTrack: TrackInfo | null
  playlist: TrackInfo[]
  isPlaying: boolean
  volume: number
  muted: boolean
  loop: boolean
  shuffle: boolean
}

// Default state values
const DEFAULT_STATE: AudioPlayerState = {
  currentTrack: null,
  playlist: [],
  isPlaying: false,
  volume: 1.0,
  muted: false,
  loop: false,
  shuffle: false
}

// Storage keys for persisting preferences
const STORAGE_KEY_AUDIO_PREFS = 'faithmedia_audio_preferences'

export interface UseAudioPlayer {
  // State
  state: Ref<AudioPlayerState>
  trackProgress: Ref<number>

  // Computed
  hasNext: Ref<boolean>
  hasPrevious: Ref<boolean>

  // Methods
  playTrack: (track: TrackInfo) => void
  playTracks: (tracks: TrackInfo[], startIndex?: number) => void
  pauseTrack: () => void
  stopTrack: () => void
  togglePlayPause: () => void
  skipTrack: (direction: 'next' | 'prev') => void
  seekTo: (position: number) => void
  setVolume: (volume: number) => void
  toggleMute: () => void
  toggleLoop: () => void
  toggleShuffle: () => void
  fastForward: (seconds?: number) => void
  rewind: (seconds?: number) => void
  clearPlaylist: () => void

  // Configuration methods
  setPreloadStrategy: (strategy: 'auto' | 'metadata' | 'lazy') => void
  getConfig: () => AudioPlayerConfig
}

// Global singleton instance
let globalAudioPlayerInstance: UseAudioPlayer | null = null

// Default configuration
const DEFAULT_CONFIG: AudioPlayerConfig = {
  preloadStrategy: 'lazy'
}

/**
 * Create the audio player instance (internal function)
 */
function createAudioPlayerInstance(): UseAudioPlayer {
  // Configuration state
  const config = ref<AudioPlayerConfig>({ ...DEFAULT_CONFIG })

  // URL generation composable
  const { mp3Url } = useDbContentUrls()

  // Initialize state with defaults and stored preferences
  const getStoredPreferences = (): Partial<AudioPlayerState> => {
    const stored = localStorage.getItem(STORAGE_KEY_AUDIO_PREFS)
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch (e) {
        console.error('Failed to parse stored audio preferences:', e)
      }
    }
    return {}
  }

  // Main state
  const state = ref<AudioPlayerState>({
    ...DEFAULT_STATE,
    ...getStoredPreferences()
  })

  // Track progress as a separate ref for more frequent updates
  const trackProgress = ref(0)

  // Howl instance for the current track
  let howl: Howl | null = null

  // Timer for updating seek position
  let seekTimer: ReturnType<typeof setInterval> | null = null

  // Computed properties
  const hasNext = computed(() => {
    if (!state.value.currentTrack || state.value.playlist.length <= 1) return false
    const currentIndex = state.value.playlist.findIndex(track =>
      track.id === state.value.currentTrack?.id
    )
    return currentIndex < state.value.playlist.length - 1
  })

  const hasPrevious = computed(() => {
    if (!state.value.currentTrack || state.value.playlist.length <= 1) return false
    const currentIndex = state.value.playlist.findIndex(track =>
      track.id === state.value.currentTrack?.id
    )
    return currentIndex > 0
  })

  // Persist preferences when they change
  watch(() => ({
    volume: state.value.volume,
    muted: state.value.muted,
    loop: state.value.loop,
    shuffle: state.value.shuffle
  }), (newPrefs) => {
    try {
      localStorage.setItem(STORAGE_KEY_AUDIO_PREFS, JSON.stringify(newPrefs))
    } catch (e) {
      console.error('Failed to save audio preferences:', e)
    }
  }, { deep: true })

  // Helper to update the current track's seek position
  const updateSeekPosition = () => {
    if (howl && state.value.currentTrack) {
      const seek = howl.seek() as number
      if (typeof seek === 'number' && !isNaN(seek)) {
        state.value.currentTrack.seek = seek
        trackProgress.value = (seek / state.value.currentTrack.duration) * 100
      }
    }
  }

  // Start the seek timer
  const startSeekTimer = () => {
    stopSeekTimer()
    seekTimer = setInterval(updateSeekPosition, 1000)
  }

  // Stop the seek timer
  const stopSeekTimer = () => {
    if (seekTimer) {
      clearInterval(seekTimer)
      seekTimer = null
    }
  }

  // Clean up the current Howl instance
  const cleanupHowl = () => {
    if (howl) {
      howl.stop()
      howl.unload()
      howl = null
    }
    stopSeekTimer()
  }

  // Create a new Howl instance for a track
  const createHowl = (track: TrackInfo): Howl => {
    cleanupHowl()

    // Determine preload strategy
    let preload = true
    if (config.value.preloadStrategy === 'lazy' || config.value.preloadStrategy === 'metadata') {
      preload = false
    }

    // Create new Howl instance
    const newHowl = new Howl({
      src: [mp3Url(track.file)],
      html5: true, // Enable streaming
      preload: preload,
      volume: state.value.volume,
      mute: state.value.muted,
      onplay: () => {
        state.value.isPlaying = true
        startSeekTimer()
      },
      onpause: () => {
        state.value.isPlaying = false
        stopSeekTimer()
      },
      onstop: () => {
        state.value.isPlaying = false
        stopSeekTimer()
      },
      onend: () => {
        if (state.value.loop && state.value.playlist.length === 1) {
          // Loop single track
          howl?.play()
        } else {
          // Play next track if available
          skipTrack('next')
        }
      },
      onloaderror: (id: number, error: any) => {
        console.error(`Error loading audio: ${error}`)
        skipTrack('next')
      },
      onplayerror: (id: number, error: any) => {
        console.error(`Error playing audio: ${error}`)
        skipTrack('next')
      },
      onload: () => {
        if (track) {
          // Update duration once loaded
          track.duration = newHowl.duration()
        }
      }
    })

    return newHowl
  }

  // Play a specific track
  const playTrack = (track: TrackInfo) => {
    // If the track is already loaded and playing, just return
    if (state.value.currentTrack?.id === track.id && state.value.isPlaying) {
      return
    }

    // If the track is already loaded but paused, resume playback
    if (state.value.currentTrack?.id === track.id && howl) {
      howl.play()
      return
    }

    // Otherwise, load and play the new track
    state.value.currentTrack = { ...track, seek: 0 }
    howl = createHowl(track)

    // For lazy loading, ensure the track is loaded before playing
    if (config.value.preloadStrategy === 'lazy' || config.value.preloadStrategy === 'metadata') {
      // For metadata only, we still need to load the full track when playing
      howl.load()
    }

    howl.play()
  }

  // Play a list of tracks starting from a specific index
  const playTracks = (tracks: TrackInfo[], startIndex = 0) => {
    if (tracks.length === 0) return

    // Update the playlist
    state.value.playlist = [...tracks]

    // If startIndex is negative, just update the playlist without playing
    if (startIndex < 0) return

    // Play the track at the specified index
    const trackToPlay = tracks[startIndex] || tracks[0]
    playTrack(trackToPlay)
  }

  // Pause the current track
  const pauseTrack = () => {
    howl?.pause()
  }

  // Stop the current track
  const stopTrack = () => {
    howl?.stop()
    if (state.value.currentTrack) {
      state.value.currentTrack.seek = 0
      trackProgress.value = 0
    }
  }

  // Toggle play/pause
  const togglePlayPause = () => {
    if (state.value.isPlaying) {
      pauseTrack()
    } else if (state.value.currentTrack) {
      howl?.play()
    } else if (state.value.playlist.length > 0) {
      // Play the first track in the playlist if nothing is currently playing
      playTrack(state.value.playlist[0])
    }
  }

  // Skip to next or previous track
  const skipTrack = (direction: 'next' | 'prev') => {
    if (!state.value.currentTrack || state.value.playlist.length <= 1) return

    const currentIndex = state.value.playlist.findIndex(track =>
      track.id === state.value.currentTrack?.id
    )

    if (currentIndex === -1) return

    let nextIndex: number

    if (direction === 'next') {
      if (state.value.shuffle) {
        // Random track excluding current
        const availableIndices = Array.from(
          { length: state.value.playlist.length },
          (_, i) => i
        ).filter(i => i !== currentIndex)

        if (availableIndices.length === 0) return

        nextIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)]
      } else {
        // Next track or loop to beginning
        nextIndex = currentIndex + 1 >= state.value.playlist.length ? 0 : currentIndex + 1
      }
    } else {
      // Previous track or loop to end
      nextIndex = currentIndex - 1 < 0 ? state.value.playlist.length - 1 : currentIndex - 1
    }

    // Play the next track
    playTrack(state.value.playlist[nextIndex])
  }

  // Seek to a specific position
  const seekTo = (position: number) => {
    if (howl && state.value.currentTrack) {
      // Ensure position is within bounds
      const clampedPosition = Math.max(0, Math.min(position, state.value.currentTrack.duration))
      howl.seek(clampedPosition)
      updateSeekPosition()
    }
  }

  // Set volume (0-1)
  const setVolume = (volume: number) => {
    // Ensure volume is within bounds
    const clampedVolume = Math.max(0, Math.min(volume, 1))
    state.value.volume = clampedVolume

    if (howl) {
      howl.volume(clampedVolume)
    }
  }

  // Toggle mute
  const toggleMute = () => {
    state.value.muted = !state.value.muted

    if (howl) {
      howl.mute(state.value.muted)
    }
  }

  // Toggle loop
  const toggleLoop = () => {
    state.value.loop = !state.value.loop
  }

  // Toggle shuffle
  const toggleShuffle = () => {
    state.value.shuffle = !state.value.shuffle
  }

  // Fast forward by a number of seconds
  const fastForward = (seconds = 30) => {
    if (howl && state.value.currentTrack) {
      const currentSeek = howl.seek() as number
      const newPosition = Math.min(currentSeek + seconds, state.value.currentTrack.duration)
      seekTo(newPosition)
    }
  }

  // Rewind by a number of seconds
  const rewind = (seconds = 30) => {
    if (howl) {
      const currentSeek = howl.seek() as number
      const newPosition = Math.max(currentSeek - seconds, 0)
      seekTo(newPosition)
    }
  }

  // Clear the playlist
  const clearPlaylist = () => {
    stopTrack()
    state.value.playlist = []
    state.value.currentTrack = null
  }

  // Configuration methods
  const setPreloadStrategy = (strategy: 'auto' | 'metadata' | 'lazy') => {
    config.value.preloadStrategy = strategy
  }

  const getConfig = (): AudioPlayerConfig => {
    return { ...config.value }
  }

  // Return the composable API
  return {
    // State
    state,
    trackProgress,

    // Computed
    hasNext,
    hasPrevious,

    // Methods
    playTrack,
    playTracks,
    pauseTrack,
    stopTrack,
    togglePlayPause,
    skipTrack,
    seekTo,
    setVolume,
    toggleMute,
    toggleLoop,
    toggleShuffle,
    fastForward,
    rewind,
    clearPlaylist,

    // Configuration methods
    setPreloadStrategy,
    getConfig
  }
}

/**
 * Singleton audio player composable
 * First call creates the instance, subsequent calls return the same instance
 */
export function useAudioPlayer(options: AudioPlayerOptions = {}): UseAudioPlayer {
  // Early exit if instance already exists
  if (globalAudioPlayerInstance) {
    return globalAudioPlayerInstance
  }

  // First call creates the singleton
  globalAudioPlayerInstance = createAudioPlayerInstance()

  // Apply options if provided
  if (options.preloadStrategy) {
    globalAudioPlayerInstance.setPreloadStrategy(options.preloadStrategy)
  }

  return globalAudioPlayerInstance
}
