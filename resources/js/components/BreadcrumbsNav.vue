<template>
  <div class="custom-breadcrumbs d-flex align-center">
    <template v-if="breadcrumbs.length > 0">
      <template v-for="(item, index) in breadcrumbs" :key="index">
        <!-- Only show items that should be visible -->
        <template v-if="shouldShowItem(index)">
          <!-- Add chevron between visible items -->
          <v-icon 
            v-if="isNotFirstVisibleItem(index)" 
            icon="mdi-chevron-right" 
            size="small" 
            class="mx-1 chevron-divider" 
          />
          
          <!-- Show ellipsis for collapsed middle items -->
          <span 
            v-if="isEllipsis(index)" 
            class="text-body-2 text-truncate ellipsis-breadcrumb text-red-darken-4 cursor-pointer"
            @click="showEllipsisMenu"
          >
            ...
          </span>
          
          <!-- Show regular breadcrumb item -->
          <span
            v-else
            class="text-body-2 text-truncate"
            :class="getItemClasses(index)"
            @click.prevent="item.disabled ? null : handleBreadcrumbClick(item)"
          >
            {{ item.title }}
          </span>
          
          <!-- Dropdown menu for ellipsis -->
          <v-menu v-if="isEllipsis(index)">
            <template v-slot:activator="{ props }">
              <span 
                class="hidden-activator" 
                v-bind="props"
                ref="ellipsisActivator"
              ></span>
            </template>
            <v-list>
              <v-list-item
                v-for="(middleItem, middleIndex) in breadcrumbs.slice(1, -1)"
                :key="middleIndex"
                :title="middleItem.title"
                @click="handleBreadcrumbClick(middleItem)"
              />
            </v-list>
          </v-menu>
        </template>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useDisplay } from 'vuetify'
import { ref, computed, onMounted, onUnmounted } from 'vue'

// Props
const props = defineProps<{
  breadcrumbs: Array<{
    title: string
    disabled: boolean
    href: string
    props?: {
      path: string
      isLast: boolean
    }
  }>
}>()

// Emits
const emit = defineEmits<{
  (e: 'breadcrumb-click', item: any): void
}>()

// Get Vuetify display properties
const { smAndDown, mobile, name } = useDisplay()

// Track orientation
const isPortrait = ref(window.matchMedia("(orientation: portrait)").matches)

// Update orientation when it changes
const updateOrientation = () => {
  isPortrait.value = window.matchMedia("(orientation: portrait)").matches
}

// Set up orientation change listener
onMounted(() => {
  window.addEventListener('resize', updateOrientation)
})

// Clean up listener
onUnmounted(() => {
  window.removeEventListener('resize', updateOrientation)
})

// Reference to ellipsis activator for menu
const ellipsisActivator = ref<HTMLElement | null>(null)

// Handle breadcrumb click
const handleBreadcrumbClick = (item: any) => {
  if (!item.href || item.disabled) {
    return
  }
  
  emit('breadcrumb-click', item)
}

// Computed property to determine if we should collapse breadcrumbs
const shouldCollapse = computed(() => {
  // Always collapse if there are many breadcrumbs (more than 4)
  if (props.breadcrumbs.length > 4) return true;
  
  // On mobile in portrait mode, collapse if there are more than 2 breadcrumbs
  if (mobile.value && isPortrait.value && props.breadcrumbs.length > 2) return true;
  
  // On small screens (but not mobile) in portrait mode, collapse if there are more than 3 breadcrumbs
  if (smAndDown.value && !mobile.value && isPortrait.value && props.breadcrumbs.length > 3) return true;
  
  // Otherwise, don't collapse
  return false;
});

// Determine if an item should be shown
const shouldShowItem = (index: number) => {
  // Always show first and last items
  if (index === 0 || index === props.breadcrumbs.length - 1) return true;
  
  // If we should collapse, only show the ellipsis at index 1
  if (shouldCollapse.value) {
    return index === 1;
  }
  
  // Otherwise show all items
  return true;
};

// Check if this is an ellipsis position
const isEllipsis = (index: number) => {
  // Only show ellipsis at position 1 when we should collapse
  return shouldCollapse.value && index === 1;
};

// Check if this is not the first visible item (for chevron display)
const isNotFirstVisibleItem = (index: number) => {
  return index !== 0;
};

// Get classes for a breadcrumb item
const getItemClasses = (index: number) => {
  return {
    'first-breadcrumb': index === 0,
    'middle-breadcrumb': index > 0 && index < props.breadcrumbs.length - 1,
    'last-breadcrumb font-weight-bold': index === props.breadcrumbs.length - 1,
    'text-red-darken-4': !props.breadcrumbs[index].disabled,
    'cursor-pointer': !props.breadcrumbs[index].disabled
  };
};


// Show the ellipsis dropdown menu
const showEllipsisMenu = () => {
  // This would trigger the menu programmatically if needed
  if (ellipsisActivator.value) {
    ellipsisActivator.value.click();
  }
};
</script>

<style scoped>
/* Custom breadcrumbs styling - improved for touch */
.custom-breadcrumbs {
  overflow: hidden;
  width: 100%; /* Use full width of container */
  max-width: 100%;
  font-size: 0.875rem; /* Increased from 0.7rem for better readability */
  line-height: 1.4;    /* Increased for better readability */
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: flex-start; /* Align items to the start */
}

.custom-breadcrumbs span {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-flex;
  vertical-align: middle;
  min-width: 0;
  min-height: 44px; /* Increased from 36px to meet touch guidelines */
  align-items: center; /* Center content vertically */
  border-radius: 4px; /* Rounded corners for better touch feel */
  padding: 6px 8px; /* Reduced padding for more compact layout */
  margin: 0 1px; /* Reduced margin between items */
}

/* First breadcrumb item styling */
.first-breadcrumb {
  flex: 0 0 auto; /* Don't shrink, don't grow, use auto width */
  min-width: 50px; /* Ensure a minimum width */
  max-width: 120px; /* Limit maximum width */
}

/* Middle breadcrumb items styling */
.middle-breadcrumb {
  flex: 0 1 auto; /* Can shrink but not grow */
  min-width: 40px; /* Ensure a minimum width */
  max-width: 100px; /* Limit maximum width */
}

/* Ellipsis breadcrumb styling */
.ellipsis-breadcrumb {
  flex: 0 0 auto; /* Don't shrink, don't grow */
  min-width: 30px; /* Ensure a minimum width */
  text-align: center;
  background-color: rgba(0, 0, 0, 0.03);
  border-radius: 4px;
  padding: 4px 8px;
}

/* Last breadcrumb item styling */
.last-breadcrumb {
  flex: 0 0 auto; /* Don't shrink, don't grow */
  min-width: 60px; /* Ensure a minimum width */
  max-width: 150px; /* Limit maximum width */
  background-color: rgba(0, 0, 0, 0.03); /* Light background to make it stand out */
  padding-left: 10px; /* Reduced padding on the left */
  padding-right: 10px; /* Reduced padding on the right */
}

/* Chevron divider styling */
.chevron-divider {
  opacity: 0.7; /* Make the divider slightly less prominent */
  flex-shrink: 0; /* Prevent the divider from shrinking */
}

.cursor-pointer {
  cursor: pointer;
}

/* Hidden activator for ellipsis menu */
.hidden-activator {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  pointer-events: none;
}

/* Responsive adjustments for different screen sizes */
@media (min-width: 600px) {
  /* Allow breadcrumb items to show more text on larger screens */
  .middle-breadcrumb {
    min-width: 60px;
    max-width: 120px;
  }
  
  .first-breadcrumb, .last-breadcrumb {
    max-width: 150px;
  }
}

@media (min-width: 960px) {
  /* Larger minimum width for breadcrumb items on desktop */
  .middle-breadcrumb {
    min-width: 80px;
    max-width: 150px;
  }
  
  .first-breadcrumb {
    max-width: 180px;
  }
  
  .last-breadcrumb {
    max-width: 200px;
  }
}

/* Mobile-specific adjustments */
@media (max-width: 599px) {
  .first-breadcrumb, .last-breadcrumb {
    max-width: 100px;
  }
}
</style>
