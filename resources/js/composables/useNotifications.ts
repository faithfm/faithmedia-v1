import { ref, computed } from 'vue'

export interface Notification {
  id: string
  message: string
  type: 'success' | 'info' | 'warning' | 'error'
  timeout?: number
  dismissible?: boolean
}

export function useNotifications() {
  const notifications = ref<Notification[]>([])

  const hasNotifications = computed(() => notifications.value.length > 0)

  // Simple ID generator
  let idCounter = 0
  const generateId = () => {
    idCounter += 1
    return `notification-${Date.now()}-${idCounter}`
  }

  /**
   * Add a notification
   */
  const addNotification = (
    message: string,
    type: 'success' | 'info' | 'warning' | 'error' = 'info',
    timeout = 5000,
    dismissible = true
  ) => {
    const id = generateId()
    notifications.value.push({
      id,
      message,
      type,
      timeout,
      dismissible
    })

    if (timeout > 0) {
      setTimeout(() => {
        removeNotification(id)
      }, timeout)
    }

    return id
  }

  /**
   * Remove a notification by ID
   */
  const removeNotification = (id: string) => {
    const index = notifications.value.findIndex(n => n.id === id)
    if (index !== -1) {
      notifications.value.splice(index, 1)
    }
  }

  /**
   * Clear all notifications
   */
  const clearNotifications = () => {
    notifications.value = []
  }

  /**
   * Shorthand methods for different notification types
   */
  const success = (message: string, timeout = 5000, dismissible = true) => {
    console.info('success', message)
    return addNotification(message, 'success', timeout, dismissible)
  }

  const info = (message: string, timeout = 5000, dismissible = true) => {
    console.info('info', message)
    return addNotification(message, 'info', timeout, dismissible)
  }

  const warning = (message: string, timeout = 5000, dismissible = true) => {
    console.warn('warning', message)
    return addNotification(message, 'warning', timeout, dismissible)
  }

  const error = (message: string, timeout = 0, dismissible = true) => {
    console.error('error', message)
    return addNotification(message, 'error', timeout, dismissible)
  }

  return {
    notifications,
    hasNotifications,
    addNotification,
    removeNotification,
    clearNotifications,
    success,
    info,
    warning,
    error
  }
}

// Create a global instance for app-wide notifications
export const globalNotifications = useNotifications()
