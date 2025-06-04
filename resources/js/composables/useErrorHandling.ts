import { ref, computed } from 'vue'

export interface ErrorState {
  hasError: boolean
  message: string
  details?: string
  severity: 'error' | 'warning' | 'info'
  retryable: boolean
  retrying: boolean
}

export interface ErrorOptions {
  retryable?: boolean
  severity?: 'error' | 'warning' | 'info'
}

export function useErrorHandling() {
  const error = ref<ErrorState>({
    hasError: false,
    message: '',
    details: undefined,
    severity: 'error',
    retryable: false,
    retrying: false
  })

  const hasError = computed(() => error.value.hasError)

  /**
   * Set an error with the given message and options
   */
  const setError = (message: string, details?: string, options: ErrorOptions = {}) => {
    error.value = {
      hasError: true,
      message,
      details,
      severity: options.severity || 'error',
      retryable: options.retryable !== undefined ? options.retryable : false,
      retrying: false
    }
  }

  /**
   * Clear the current error
   */
  const clearError = () => {
    error.value = {
      hasError: false,
      message: '',
      details: undefined,
      severity: 'error',
      retryable: false,
      retrying: false
    }
  }

  /**
   * Set the retrying state
   */
  const setRetrying = (isRetrying: boolean) => {
    if (error.value.hasError && error.value.retryable) {
      error.value.retrying = isRetrying
    }
  }

  /**
   * Execute a function with error handling
   * If the function throws an error, it will be caught and set as the current error
   * Returns the result of the function if successful, or undefined if an error occurred
   */
  const executeWithErrorHandling = async <T>(
    fn: () => Promise<T>,
    errorMessage = 'An error occurred',
    options: ErrorOptions = {}
  ): Promise<T | undefined> => {
    try {
      clearError()
      return await fn()
    } catch (err) {
      const errorDetails = err instanceof Error ? err.stack || err.message : String(err)
      setError(errorMessage, errorDetails, options)
      return undefined
    }
  }

  /**
   * Retry the last operation that failed
   * @param retryFn The function to execute for the retry attempt
   */
  const retry = async <T>(retryFn: () => Promise<T>): Promise<T | undefined> => {
    if (!error.value.hasError || !error.value.retryable) {
      return undefined
    }

    try {
      setRetrying(true)
      const result = await retryFn()
      clearError()
      return result
    } catch (err) {
      const errorDetails = err instanceof Error ? err.stack || err.message : String(err)
      setError(error.value.message, errorDetails, {
        severity: error.value.severity,
        retryable: error.value.retryable
      })
      return undefined
    } finally {
      setRetrying(false)
    }
  }

  return {
    error,
    hasError,
    setError,
    clearError,
    setRetrying,
    executeWithErrorHandling,
    retry
  }
}
