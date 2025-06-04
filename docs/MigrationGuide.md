# Vue 2 to Vue 3 Migration Guide

This comprehensive guide documents the migration from Vue 2/Vuetify 2/SPA to Vue 3/Vuetify 3/Inertia for the FaithMedia project. It covers migration patterns, implementation details, historical context, lessons learned, and troubleshooting tips.

## Table of Contents

1. [Overview](#overview)
2. [Migration Patterns](#migration-patterns)
3. [Implementation Plan](#implementation-plan)
4. [Historical Context](#historical-context)
5. [Lessons Learned and Best Practices](#lessons-learned-and-best-practices)
6. [Troubleshooting Common Migration Issues](#troubleshooting-common-migration-issues)
7. [Future Migrations](#future-migrations)

## Overview

This guide documents the migration patterns from Vue 2/Vuetify 2/SPA to Vue 3/Vuetify 3/Inertia for the FaithMedia project. It covers key migration patterns, lessons learned, and troubleshooting tips that can be applied to any component in the project.

### TL;DR

- **Key Changes**: Options API → Composition API, Vue Router → Inertia.js, Vuetify 2 → Vuetify 3
- **Benefits**: Better code organization, improved type safety, enhanced reusability
- **Best Practices**: Use composables for reusable logic, leverage TypeScript, implement progressive migration
- **Common Issues**: Reactivity problems, component registration, event handling, TypeScript integration

## Migration Patterns

### 1. Options API to Composition API

The most significant change in the migration was moving from the Options API to the Composition API.

#### Before (Vue 2 Options API):

```vue
<script>
export default {
  props: {
    initialItems: Array
  },
  data() {
    return {
      items: this.initialItems,
      selectedItem: null,
      isLoading: false
    }
  },
  computed: {
    hasSelectedItem() {
      return this.selectedItem !== null
    }
  },
  methods: {
    selectItem(item) {
      this.selectedItem = item
      this.$emit('item-selected', item)
    }
  },
  created() {
    this.loadItems()
  }
}
</script>
```

#### After (Vue 3 Composition API):

```vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

// Props with TypeScript
interface Props {
  initialItems: Item[]
}
const props = defineProps<Props>()

// Emits with TypeScript
const emit = defineEmits<{
  'item-selected': [item: Item]
}>()

// State
const items = ref(props.initialItems)
const selectedItem = ref<Item | null>(null)
const isLoading = ref(false)

// Computed
const hasSelectedItem = computed(() => selectedItem.value !== null)

// Methods
const selectItem = (item: Item) => {
  selectedItem.value = item
  emit('item-selected', item)
}

// Lifecycle hooks
onMounted(() => {
  loadItems()
})
</script>
```

### 2. Extracting Composables

A key pattern in the migration was extracting reusable logic into composables.

```typescript
// Example: useFormValidation.ts
import { ref, computed } from 'vue'

export function useFormValidation(options = {}) {
  // State
  const errors = ref({})
  const isSubmitting = ref(false)
  
  // Methods
  const validate = (formData) => {
    // Validation logic...
    return Object.keys(errors.value).length === 0
  }
  
  const isValid = computed(() => Object.keys(errors.value).length === 0)
  
  return {
    errors,
    isSubmitting,
    validate,
    isValid
  }
}

// Using the composable in a component
const { errors, validate, isValid } = useFormValidation()
```

```typescript
// Example: useRowSelection.ts (from Content Page)
import { ref } from 'vue'

export function useRowSelection(options = {}) {
  // State
  const selectedRows = ref(new Set())
  const playingRow = ref(null)
  
  // Methods
  const isSelected = (id) => selectedRows.value.has(id)
  const isPlaying = (id) => playingRow.value === id
  
  const handleRowSelect = (id, event) => {
    // Selection logic...
  }
  
  return {
    selectedRows,
    playingRow,
    isSelected,
    isPlaying,
    handleRowSelect
  }
}
```

### 3. Vuetify 2 to Vuetify 3 Changes

#### Icon Changes:

```vue
<!-- Before (Vuetify 2) -->
<v-icon>mdi-home</v-icon>

<!-- After (Vuetify 3) -->
<v-icon icon="mdi-home"></v-icon>
```

#### Slot Syntax Changes:

```vue
<!-- Before (Vuetify 2) -->
<v-list-item>
  <v-list-item-icon>
    <v-icon>mdi-home</v-icon>
  </v-list-item-icon>
  <v-list-item-content>
    <v-list-item-title>Home</v-list-item-title>
  </v-list-item-content>
</v-list-item>

<!-- After (Vuetify 3) -->
<v-list-item>
  <template v-slot:prepend>
    <v-icon icon="mdi-home"></v-icon>
  </template>
  Home
</v-list-item>
```

#### Color Classes:

```vue
<!-- Before (Vuetify 2) -->
<v-card class="red darken-2"></v-card>

<!-- After (Vuetify 3) -->
<v-card class="red-darken-2"></v-card>
```

#### Form Components:

```vue
<!-- Before (Vuetify 2) -->
<v-text-field
  v-model="name"
  label="Name"
  :error-messages="errors.name"
  required
></v-text-field>

<!-- After (Vuetify 3) -->
<v-text-field
  v-model="name"
  label="Name"
  :error-messages="errors.name"
  variant="outlined"
  density="comfortable"
  required
></v-text-field>
```

### 4. SPA to Inertia.js Migration

#### Before (Vue Router):

```javascript
// router.js
const routes = [
  {
    path: '/users',
    name: 'users',
    component: UserList,
    props: (route) => ({
      page: parseInt(route.query.page) || 1,
      search: route.query.search || ''
    })
  }
]
```

```vue
<!-- UserList.vue -->
<script>
export default {
  props: {
    page: Number,
    search: String
  },
  methods: {
    async fetchUsers() {
      const response = await axios.get('/api/users', {
        params: { page: this.page, search: this.search }
      })
      this.users = response.data.users
    }
  },
  watch: {
    '$route.query': {
      handler() { this.fetchUsers() },
      immediate: true
    }
  }
}
</script>
```

#### After (Inertia.js):

```php
// UserController.php
public function index(Request $request): Response
{
    return Inertia::render('Users/Index', [
        'users' => User::query()
            ->when($request->search, function($query, $search) {
                $query->where('name', 'like', "%{$search}%");
            })
            ->paginate(10)
            ->withQueryString(),
        'filters' => [
            'search' => $request->search
        ]
    ]);
}
```

```vue
<!-- Users/Index.vue -->
<script setup lang="ts">
import { ref, watch } from 'vue'
import { router } from '@inertiajs/vue3'

// Props from Inertia
const props = defineProps<{
  users: {
    data: User[]
    links: any
  }
  filters: {
    search: string
  }
}>()

// State
const search = ref(props.filters.search)

// Update URL when search changes
watch(search, (value) => {
  router.get('/users', {
    search: value
  }, {
    preserveState: true,
    replace: true,
    debounce: 300
  })
})
</script>
```

### 5. TypeScript Integration

#### Before (JavaScript):

```vue
<script>
export default {
  props: {
    user: Object,
    isAdmin: Boolean
  },
  data() {
    return {
      isEditing: false,
      form: {
        name: this.user.name,
        email: this.user.email
      }
    }
  },
  methods: {
    submit() {
      // Submit logic
    }
  }
}
</script>
```

#### After (TypeScript):

```vue
<script setup lang="ts">
import { ref, reactive } from 'vue'

// Define interfaces
interface User {
  id: number
  name: string
  email: string
  role: string
}

interface Form {
  name: string
  email: string
}

// Props with TypeScript
interface Props {
  user: User
  isAdmin?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isAdmin: false
})

// State with type annotations
const isEditing = ref<boolean>(false)
const form = reactive<Form>({
  name: props.user.name,
  email: props.user.email
})

// Methods with type annotations
const submit = async (): Promise<void> => {
  // Submit logic
}
</script>
```

## Implementation Plan

This section outlines the detailed implementation plan for migrating the content page from Vue2/Vuetify2/SPA to Vue3/Vuetify3/Inertia.

### Project Structure Convention

Following Laravel and Inertia.js conventions with a simplified structure:

```
resources/js/
  ├── Pages/              # Inertia page components
  │   └── Content.vue     # Main content page (used to be Index.vue)
  │
  ├── Components/         # All Vue components
  │   ├── ContentNavToolbar.vue
  │   ├── MobileControls.vue
  │   ├── DesktopControls.vue
  │   ├── BaseView.vue (used to be baseLayout.vue)
  │   ├── DetailsView.vue (used to be DetailsLayout.vue)
  │   └── PlaylistView.vue (used to be PlaylistLayout.vue)
  │
  ├── composables/        # Vue composables
  │   └── useRowSelection.ts
  │
  ├── services/          # Services
  │   └── SearchService.ts
  │
  └── types/             # TypeScript types
```

Note: Using a flat structure for better maintainability. All components are directly under Components/ without deep nesting.

### Implementation Phases

#### Phase 1: Core Structure

1. **Create Inertia Page Component**
   - Set up base Inertia page component structure
   - Implement URL parameter handling
   - Create computed mode state
   - Create URL utilities
   - Set up basic responsive layout structure

2. **Navigation Components**
   - Create ContentNavToolbar component
   - Implement MobileControls and DesktopControls components
   - Create responsive design for different screen sizes
   - Create local storage utilities
   - Build popup menus
   - Add event handlers

3. **View Components**
   - Create base view interface
   - Implement Details view
   - Port Playlist view
   - Create view switching system
   - Add common features

#### Phase 2: Data & Interaction

1. **Backend Integration**
   - Update ContentController for Inertia
   - Implement Inertia 2.0 style pagination
   - Add proper data transformation

2. **Frontend State Management**
   - Create state management system
   - Implement URL synchronization
   - Add debounced updates
   - Create view persistence

3. **User Interactions**
   - Implement row selection system
   - Create action menu
   - Implement double-click system
   - Add folder navigation

#### Phase 3: Advanced Features

1. **Search Implementation**
   - Create search service
   - Implement server-side search
   - Add sub-folder inclusion
   - Create results renderer

2. **Media Integration**
   - Integrate audio player with Howler.js
   - Create AudioPlayer.vue component with Vuetify 3
   - Develop useAudioPlayer.ts composable for state management
   - Implement playlist management
   - Add play status tracking
   - Add keyboard controls and accessibility features
   - Implement responsive design for mobile devices
   - Add state persistence for user preferences
   - Implement download system (pending)

3. **Performance Optimization**
   - Implement pagination strategy
   - Add lazy loading
   - Optimize state updates

#### Phase 4: Testing & Polish

1. **Testing**
   - Add unit tests
   - Create integration tests
   - Implement UI testing
   - Add E2E tests
   - Browser compatibility testing
   - Mobile device testing

2. **UX Improvements**
   - Add loading states
   - Implement error handling
   - Add user feedback
   - Polish animations

3. **Documentation**
   - Update technical docs
   - Add inline documentation
   - Create user documentation
   - Component Usage Guide
   - Testing Resources
   - Project Structure Documentation
   - API Documentation
   - Migration Guide
   - Performance Documentation

### Key Implementation Decisions

1. **Pagination Strategy**: Implemented Inertia 2.0 style pagination with cursor-based approach
   - Default page size = 500 items
   - Load-when-visible/within pagination
   - Scroll position tracking and restoration

2. **View Management**: Implemented view switching system with mode-based defaults
   - "details" view for folder mode
   - "playlist" view for search mode
   - User preferences persistence

3. **Search Implementation**: Created search service with TypeScript interfaces
   - Server-side search with Inertia integration
   - Text highlighting for search matches
   - Sub-folder inclusion toggle

## Historical Context

This section provides historical context about the Content Page migration requirements.

### Original Requirements

The Content Page was designed to handle the following state parameters:

- **path**: The current folder path
- **prefilter**: The selected prefilter
- **search**: The search query
- **sort**: The sort direction (asc/desc)
- **layout**: The selected layout (details/playlist)

The page has two modes:
- **folder mode**: When search is blank
- **search mode**: When search is non-blank

### URL Structure

The routing for the Content Page follows this pattern:
```
/content/[path] ?prefilter=xxx &search=xxx &sort=desc &layout=details
```

Default values:
- **path**: BLANK
- **prefilter**: BLANK
- **search**: BLANK
- **sort**: "asc"
- **layout**: "details" (folder mode) or "playlist" (search mode)

### Navigation Components

The Content Page navigation components include:

**ContentNavToolbar**:
- Responsive design that adapts to different screen sizes
- Folder navigation with breadcrumbs
- Parent folder button for navigating up

**MobileControls** (for mobile devices):
- Search button with expandable search dialog
- More menu with filter, subfolder, sort, and view options
- Touch-friendly interface elements

**DesktopControls** (for desktop devices):
- Filter chip: Shows filter icon + "Filter" text (blank state) or filter icon + filter description + clear X (active state)
- Search field: With magnifying glass icon (shows up to 20 recent searches) and clear X
- Include subfolders toggle
- Sort toggle: For toggling between asc/desc
- View toggle: For switching between views
- Upload button: Hidden in search mode

### View Layouts

Two layouts were implemented:

1. **Details Layout**:
   - Table/column view with all relevant fields
   - Horizontal scrolling for wide content
   - File field split into "path" and "file" columns
   - Default layout for folder mode

2. **Playlist Layout**:
   - Same layout as in the legacy Vue2 system
   - Default layout for search mode

Both layouts include:
- Folder list (only in folder mode)
- Row selection system
- Double-click handlers with menu options

## Lessons Learned and Best Practices

### 1. Composition API Benefits

- **Better Code Organization**: Related code is grouped together
- **Improved Type Safety**: TypeScript integration is more natural
- **Enhanced Reusability**: Logic can be extracted into composables
- **More Flexible**: Provides more flexibility in code structure

### 2. Composables for Reusable Logic

Create composables for:
- State management
- Data fetching
- Form handling
- UI interactions
- Utility functions

### 3. TypeScript Integration

- Define interfaces for props, emits, and state
- Use type annotations for function parameters and return values
- Create dedicated type files for complex types

### 4. Inertia.js Integration

- Use Inertia's `router` for navigation
- Leverage `preserveState` and `preserveScroll` options
- Use Inertia's `Head` component for managing the document head

### 5. Progressive Migration

- Migrate one component at a time
- Start with leaf components (components with no children)
- Add TypeScript gradually
- Write tests before and after migration

### 6. Performance Optimization

- Use `shallowRef` for large objects that don't need deep reactivity
- Implement virtual scrolling for long lists
- Use `v-once` for static content
- Leverage `v-memo` for memoizing parts of the template

## Troubleshooting Common Migration Issues

### 1. Reactivity Issues

**Problem**: Data changes are not reflected in the UI.

**Solution**:
- Use `ref` or `reactive` for reactive state
- Modify values correctly (e.g., `myRef.value = newValue`)
- Use `toRefs` when destructuring reactive objects

```typescript
// Incorrect
const state = reactive({ count: 0 })
const { count } = state // Loses reactivity

// Correct
const state = reactive({ count: 0 })
const { count } = toRefs(state) // Preserves reactivity
```

### 2. Component Registration

**Problem**: Components are not recognized in templates.

**Solution**:
- Import and register components explicitly
- With `<script setup>`, imported components are automatically registered

### 3. Event Handling

**Problem**: Events are not emitted or received correctly.

**Solution**:
- Use `defineEmits()` to declare emitted events
- Ensure event names match between parent and child components

```vue
<script setup>
const emit = defineEmits(['update:modelValue', 'submit'])

const handleInput = (e) => {
  emit('update:modelValue', e.target.value)
}
</script>
```

### 4. Vuetify 3 Styling Issues

**Problem**: Styles are not applied correctly in Vuetify 3.

**Solution**:
- Use the new utility classes in Vuetify 3
- Check for changes in component props and slots

### 5. TypeScript Errors

**Problem**: TypeScript errors in components or composables.

**Solution**:
- Use `defineProps<Interface>()` and `defineEmits<Interface>()` for type-safe props and emits
- Add proper type annotations for function parameters and return values

### 6. Inertia.js Navigation Issues

**Problem**: Navigation doesn't work as expected with Inertia.js.

**Solution**:
- Use `router.get()`, `router.post()`, etc. for navigation
- Use the `preserveState` and `preserveScroll` options when needed

## Media Integration Implementation Status

This section documents the current implementation status of the media integration features.

### Completed Features

- ✅ **Audio Player Component**: Implemented AudioPlayer.vue with Vuetify 3
- ✅ **Audio Player Composable**: Created useAudioPlayer.ts for state management
- ✅ **Basic Controls**: Play, pause, stop, seek, volume
- ✅ **Advanced Controls**: Loop, shuffle, rewind, fast-forward
- ✅ **Playlist Management**: Multiple tracks, next/previous navigation
- ✅ **Metadata Handling**: Track title, artist, duration
- ✅ **Keyboard Controls**: Space for play/pause, arrow keys for navigation
- ✅ **Accessibility Features**: ARIA attributes, keyboard support
- ✅ **Mobile Responsive Design**: Adapts to different screen sizes
- ✅ **State Persistence**: Remembers volume, mute, loop, shuffle settings
- ✅ **Integration with Content Page**: Audio player embedded in Content.vue
- ✅ **Howler.js Integration**: HTML5 audio playback with fallbacks
- ✅ **Download System**: 
  - ✅ Download functionality (fully implemented in DownloadService and integrated with DownloadManager)
  - ✅ Progress tracking (implemented in DownloadService)
  - ✅ Error handling (implemented in DownloadService)
- ✅ **File Information Dialog**:
  - ✅ Detailed metadata popup when "Details" action is selected
  - ✅ Integration with sandbox pattern for editing metadata
  - ✅ Implemented directly in BaseView.vue's Item Menu Dialog
  - ✅ Type-safe implementation with TypeScript
  - ✅ UI improvements:
    - ✅ Increased dialog width (700px) to prevent content cropping
    - ✅ Added tooltips with text truncation for long file paths
    - ✅ Consistent red-darken-4 color scheme throughout

- ✅ **Server-side API Integration**:
  - ✅ Implemented API calls to save file metadata changes
  - ✅ Added proper error handling for API responses
  - ✅ Unified route handling for metadata operations
  - ✅ Implemented reactive UI updates for metadata changes

### Implementation Details

The audio player implementation uses Howler.js for audio playback and a custom Vuetify 3 UI. The state management is handled by the useAudioPlayer composable, which provides a reactive interface for controlling playback and managing playlists.

```typescript
// Example of using the audio player composable
const audioPlayer = useAudioPlayer()

// Play a track
audioPlayer.playTrack({
  id: 'track-1',
  file: 'path/to/file.mp3',
  title: 'Track Title',
  artist: 'Artist Name',
  duration: 180,
  seek: 0
})

// Control playback
audioPlayer.togglePlayPause()
audioPlayer.skipTrack('next')
audioPlayer.setVolume(0.8)
```

The AudioPlayer component is designed to be responsive and accessible, with keyboard controls and ARIA attributes for screen readers. It also includes features like state persistence, so user preferences like volume and shuffle settings are remembered between sessions.

## Future Migrations

As more components are migrated from Vue 2 to Vue 3, this guide will be expanded to include:

- **Song Review System**: Migration patterns specific to the Song Review and Song Review Summary components
- **Upload System**: Migration patterns for file upload components
- **Authentication**: Migration patterns for Auth0 integration with Vue 3
- **Additional Composables**: More examples of reusable logic extracted into composables
- **Advanced TypeScript Patterns**: More complex TypeScript usage examples
- **Component-Specific Challenges**: Solutions to challenges encountered during migration of specific components
- **Media Integration Enhancements**: 
  - **Playback Speed Control**: Implementation of variable playback speed in the audio player
  - **Additional Audio Features**: Equalizer, visualization, and other advanced audio features

## Related Documentation

- [Technical Specification](TechnicalSpecification.md) - Comprehensive technical specification
- [Architecture Documentation](Architecture.md) - Detailed system architecture and structure
- [API & Technical Implementation](API.md) - API reference and technical details
- [Component Documentation](Components.md) - UI component documentation

## Conclusion

Migrating from Vue 2/Vuetify 2/SPA to Vue 3/Vuetify 3/Inertia offers numerous benefits in terms of performance, maintainability, and developer experience. By following the patterns and best practices outlined in this guide, you can make the migration process smoother and more efficient.

Start with small, manageable changes, and gradually work your way up to more complex components. Write tests before and after migration to ensure that functionality remains consistent.
