<script setup lang="ts">
import { ref, computed, onMounted, provide, watch } from 'vue'
import { useNavigation, type NavigationItem } from '../composables/useNavigation'
import { laravelUserCan } from '../LaravelUserPermissions'
import { router, usePage } from '@inertiajs/vue3'
import { user, config } from '../composables/useSharedData'


// Get page for route checking
const page = usePage()

// Add validation error handling
const validationErrors = computed(() => page.props.errors || {})
const hasValidationErrors = computed(() => Object.keys(validationErrors.value).length > 0)

// Dismiss errors function
const dismissErrors = () => {
  page.props.errors = {}
}

// Computed from shared data composable values
const isAuthenticated = computed(() => !!user.value)
const appName = computed(() => config.value?.name || 'Faith Media')

const emit = defineEmits<{
  (e: 'login'): void
  (e: 'logout'): void
  (e: 'update:showNavigation', value: boolean): void
}>()

// Composables
const { navigationItems } = useNavigation()

// State
const showNavigation = ref(false)
const logoUrl = ref('/faithfm-colour-R4.png')

// Add a ref for the main content area
const mainContent = ref<HTMLElement | null>(null)
const scrollPosition = ref(0)
const fab = ref(false) // Controls visibility of scroll-to-top button

// Add a scroll handler function
const handleScroll = (event: Event) => {
  if (event.target && event.target instanceof HTMLElement) {
    scrollPosition.value = event.target.scrollTop
  }
  // Emit a custom event that child components can listen for
  if (typeof document !== 'undefined') {
    const scrollEvent = new CustomEvent('layout-scroll', {
      detail: { scrollTop: scrollPosition.value }
    })
    document.dispatchEvent(scrollEvent)
  }
}

// Add window scroll listener as a fallback
onMounted(() => {
  if (typeof window !== 'undefined') {
    // Use window scroll event as a fallback
    window.addEventListener('scroll', () => {
      // Use document.documentElement.scrollTop for most browsers
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop
      scrollPosition.value = scrollTop
    })
  }
})

// Watch scroll position to show/hide the scroll-to-top button
watch(scrollPosition, (newValue) => {
  // Show the button when scrolled down more than 10px
  fab.value = newValue > 10
})

// Provide scroll position to child components
provide('scrollPosition', scrollPosition)

// Add a method to scroll to top that can be called by child components
const scrollToTop = () => {
  try {
    // Try to scroll the main content element if it exists and has scrollTo method
    if (mainContent.value && typeof mainContent.value.scrollTo === 'function') {
      mainContent.value.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    }
  } catch (error) {
    console.error('Error scrolling mainContent:', error)
  }

  // Always use window.scrollTo as the primary method
  if (typeof window !== 'undefined') {
    try {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    } catch (error) {
      console.error('Error scrolling window:', error)
    }
  }
}

// Provide the scroll to top method
provide('scrollToTop', scrollToTop)

// Computed
const filteredNavItems = computed(() => {
  if (!user.value) return []

  return navigationItems.value.filter((item: NavigationItem) => {
    // Check role requirement
    if (item.requiredRole && item.requiredRole !== user.value?.role) return false

    // Check permission requirement
    if (item.requiredPermission) {
      // Check if user has the specific permission required for this item
      return laravelUserCan(item.requiredPermission)
    }

    // If no permission requirement, allow access
    return true
  })
})

// Methods
const toggleNavigation = () => {
  showNavigation.value = !showNavigation.value
  emit('update:showNavigation', showNavigation.value)

  // Dispatch a custom event that the ContentNavToolbar can listen for
  if (typeof document !== 'undefined') {
    const event = new CustomEvent('navigation-drawer-changed', {
      detail: { open: showNavigation.value }
    });
    document.dispatchEvent(event);
  }
}

// Helper function to check if a route is active
const isRouteActive = (route: string): boolean => {
  // Exact match for most routes
  if (page.url === route) {
    return true;
  }

  // Special case for content route with nested paths
  if (route === '/content' && page.url.startsWith('/content/')) {
    return true;
  }

  return false;
}


// Handle logout functionality
const handleLogout = () => {
  // Redirect to the logout route
  window.location.href = '/logout'
}

</script>

<template>
  <v-app>
    <v-app-bar color="white" elevation="0" class="px-4 border-b" height="64">
      <v-app-bar-nav-icon @click="toggleNavigation" color="grey-darken-1" class="mr-2" />
      <div class="d-flex align-center">
        <v-img :src="logoUrl" alt="Faith FM logo" height="32" width="auto" max-width="120" contain class="mr-3"></v-img>
        <h1 class="text-h6 font-weight-medium text-grey-darken-3 d-none d-sm-block">{{ appName }}</h1>
      </div>
      <v-spacer />

      <template v-if="isAuthenticated">
        <v-menu location="bottom" transition="slide-y-transition">
          <template v-slot:activator="{ props }">
            <v-btn v-bind="props" icon variant="text" color="grey-darken-1" density="comfortable">
              <v-icon size="small">mdi-account-circle</v-icon>
            </v-btn>
          </template>
          <v-list density="compact" elevation="1" rounded="lg" class="pa-2">
            <v-list-item prepend-icon="mdi-account" class="mb-1">
              <v-list-item-title class="text-body-2">{{ user?.name }}</v-list-item-title>
            </v-list-item>
            <v-divider class="my-1"></v-divider>
            <v-list-item prepend-icon="mdi-logout" @click="handleLogout" class="mt-1">
              <v-list-item-title class="text-body-2">Logout</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </template>
      <v-btn v-else @click="$emit('login')" variant="text" color="primary" density="comfortable" size="small">
        Login
      </v-btn>
    </v-app-bar>

    <v-navigation-drawer v-if="isAuthenticated" v-model="showNavigation" elevation="0" border width="240">
      <v-list class="pa-2">
        <v-list-subheader class="text-grey-darken-1 text-uppercase text-caption font-weight-medium ml-2 mt-2">
          Navigation
        </v-list-subheader>

        <template v-for="item in filteredNavItems" :key="item.route">
          <v-list-item @click="router.visit(item.route)" :prepend-icon="item.icon" rounded="lg" class="mb-1"
            color="primary" density="comfortable" :active="isRouteActive(item.route)">
            <v-list-item-title class="text-body-2">
              {{ item.label }}
            </v-list-item-title>
          </v-list-item>
        </template>
      </v-list>
    </v-navigation-drawer>

    <v-main class="bg-white overflow-y-auto" ref="mainContent" @scroll="handleScroll">
      <!-- Global validation error display -->
      <v-alert
        v-if="hasValidationErrors"
        type="error"
        variant="tonal"
        closable
        class="ma-4"
        title="Please fix the following errors:"
        @click:close="dismissErrors"
      >
        <v-list density="compact" class="bg-transparent">
          <v-list-item
            v-for="(error, field) in validationErrors"
            :key="field"
            class="px-0"
          >
            <v-list-item-title class="text-body-2">
              <strong>{{ field === 'general' ? 'Error' : field }}:</strong> {{ error }}
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-alert>

      <slot />

      <!-- Scroll-to-top Button -->
      <v-btn v-show="fab" icon color="red-darken-3" @click="scrollToTop" class="scroll-to-top-btn" size="small" elevation="2">
        <v-icon>mdi-arrow-up</v-icon>
      </v-btn>
    </v-main>
  </v-app>
</template>

<style scoped>
.scroll-to-top-btn {
  position: fixed;
  bottom: 100px;
  right: 30px;
  z-index: 1000;
}

/* For tablets */
@media (max-width: 1199px) and (min-width: 768px) {
  .scroll-to-top-btn {
    bottom: 90px;
    right: 25px;
  }
}

/* For mobile devices */
@media (max-width: 767px) {
  .scroll-to-top-btn {
    bottom: 120px;
    /* Further from bottom on mobile to avoid thumb zone */
    right: 20px;
  }
}
</style>
