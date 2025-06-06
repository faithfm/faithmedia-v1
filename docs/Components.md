# Component Documentation

This document provides an overview of the Vue components used in the FaithMedia application, organized by their role and responsibility within the application architecture.

## Table of Contents

1. [Introduction](#introduction)
3. [Application Structure & Layout](#application-structure--layout)
4. [Content Display & Visualization](#content-display--visualization)
5. [Navigation & Wayfinding](#navigation--wayfinding)
6. [Search & Discovery](#search--discovery)
7. [Media Playback](#media-playback)
8. [Review & Rating System](#review--rating-system)
9. [User Feedback & Loading States](#user-feedback--loading-states)
10. [Component Architecture Principles](#component-architecture-principles)
11. [Component Relationships](#component-relationships)
12. [Best Practices](#best-practices)
13. [Related Documentation](#related-documentation)

## Introduction

The FaithMedia project uses a component-based architecture with Vue 3 and Vuetify 3. Components are designed to be reusable, maintainable, and follow consistent patterns. This documentation provides an overview of each component, their relationships, and best practices for using them.

## Component Categories

## Application Structure & Layout

**Functionality**: Components that provide the foundational structure and layout framework for the application.

### SharedLayout

**Location**: `resources/js/layouts/SharedLayout.vue`

**Purpose**: Provides a consistent layout structure for all pages in the application.

**Functionality**: Establishes the overall application structure and navigation framework

**Key Features**:
- App bar with logo and user profile
- Navigation drawer with role-based menu items
- Main content area with responsive container
- Scroll-to-top button with responsive positioning

**Props**:
- `isAuthenticated`: Boolean indicating authentication state
- `user`: Object containing user information

**Usage**:
```vue
<shared-layout
  :is-authenticated="$page.props.auth.user !== null"
  :user="$page.props.auth.user"
>
  <!-- Page content here -->
</shared-layout>
```

### BaseView

**Location**: `resources/js/components/BaseView.vue`

**Purpose**: Abstract base component that defines the interface for different view implementations.

**Functionality**: Provides the abstract foundation for content display areas

**Key Features**:
- Common functionality for all views
- Row selection handling
- Context menus and double-click actions
- Integration point for other components
- Consistent styling framework

**Key Props**:
- `items`: List of items to display
- `loading`: Whether items are currently loading
- `error`: Error object if loading failed
- `selectedItems`: Currently selected items
- `playingItem`: Currently playing item

## Content Display & Visualization

**Functionality**: Components responsible for presenting and visualizing content to users.

### DetailsView

**Location**: `resources/js/components/DetailsView.vue`

**Purpose**: Table-based view optimized for folder browsing.

**Functionality**: Displays content in detailed tabular format with comprehensive information

**Key Features**:
- Detailed table format with all fields
- Horizontal scrolling for wide content
- Split file/path columns
- Default view for folder mode
- Sortable columns

**Key Props**: Extends BaseView props plus:
- `columns`: Table columns configuration
- `sortBy`: Current sort field
- `sortDirection`: Current sort direction

### PlaylistView

**Location**: `resources/js/components/PlaylistView.vue`

**Purpose**: Grid-based view optimized for media browsing.

**Functionality**: Displays content in visual grid format optimized for media consumption

**Key Features**:
- Visual grid format with media preview
- Optimized for media content
- Default view for search mode
- Action menu for item operations
- Responsive grid sizing

**Key Props**: Extends BaseView props plus:
- `gridSize`: Size of grid items
- `showSubfolderIndicator`: Whether to show subfolder indicators

### EditableTable

**Location**: `resources/js/components/EditableTable.vue`

**Purpose**: Advanced editable table component used in `ReviewSongsSummary.vue`

**Functionality**: Displays and allows inline editing of tabular data

**Key Features**:
- Inline editing of song review summary data with debounced updates
- Data validation and error handling
- Bulk operations support
- Sortable and filterable data display

## Navigation & Wayfinding

**Functionality**: Components that help users navigate through the application and understand their current location.

### ContentNavToolbar

**Location**: `resources/js/components/ContentNavToolbar.vue`

**Purpose**: Provides the main navigation interface for the content page, adapting to different screen sizes.

**Key Features**:
- Responsive design that uses different controls for mobile and desktop
- Folder navigation with breadcrumbs and history
- Integration with MobileControls and DesktopControls components

**Key Props**:
- `initialPath`: Initial folder path
- `initialPrefilter`: Initial filter selection
- `initialSearch`: Initial search query
- `initialSort`: Initial sort direction
- `initialViewMode`: Initial view mode ('details' or 'playlist')
- `initialIncludeSubfolders`: Whether to include subfolders in search results
- `prefilters`: List of available prefilters
- `viewMode`: Current view mode
- `meta`: Meta information from the server

**Events**:
- `navigate`: Emitted when navigation parameters change

### MobileControls

**Location**: `resources/js/components/MobileControls.vue`

**Purpose**: Provides navigation controls optimized for mobile devices.

**Key Features**:
- Search button with expandable search dialog
- More menu with filter, subfolder, sort, and view options
- Touch-friendly interface elements

**Key Props**:
- `path`: Current folder path
- `breadcrumbs`: Array of breadcrumb items
- `isRoot`: Whether current location is root
- `searchInput`: Current search query
- `prefilter`: Current filter selection
- `sort`: Current sort direction
- `viewMode`: Current view mode
- `includeSubfolders`: Whether to include subfolders
- `prefilters`: List of available prefilters
- `recentSearchItems`: Recent search history
- `recentFilterItems`: Recent filter history
- `controlsOnly`: Whether to show only controls (no breadcrumbs)

**Events**:
- `navigate`: Emitted when navigation parameters change
- `update:searchInput`: Emitted when search input changes
- `add-recent-search`: Emitted when a search is performed
- `add-recent-filter`: Emitted when a filter is selected
- `clear-all-recent-searches`: Emitted when recent searches are cleared
- `toggle-filter-menu`: Emitted when filter menu is toggled

### BreadcrumbsNav

**Location**: `resources/js/components/BreadcrumbsNav.vue`

**Purpose**: Provides a responsive breadcrumb navigation component that intelligently adapts to screen size and orientation.

**Why Custom Instead of Vuetify's v-breadcrumbs**:
- **Path Handling Requirements**: Needed special handling for content paths without the '/content/' prefix
- **Responsive Behavior**: Required more sophisticated responsive behavior than Vuetify's component offers, particularly for handling different device orientations
- **Adaptive Collapsing**: Needed intelligent collapsing of middle breadcrumbs based on available space
- **Dropdown Menu Integration**: Required a dropdown menu for accessing collapsed breadcrumbs
- **Touch Optimization**: Needed specific touch-friendly sizing and spacing
- **Navigation Logic**: Required custom navigation logic to prevent path duplication issues

**Key Features**:
- Responsive design that adapts to screen size and device orientation
- Collapses middle breadcrumbs with ellipsis when space is limited
- Dropdown menu for accessing collapsed breadcrumbs
- Touch-friendly interface with appropriate sizing
- Intelligent handling of portrait vs. landscape orientation
- Prevents path duplication issues when navigating

**Key Props**:
- `breadcrumbs`: Array of breadcrumb items with title, href, and disabled properties

**Events**:
- `breadcrumb-click`: Emitted when a breadcrumb item is clicked

**Usage**:
```vue
<breadcrumbs-nav
  :breadcrumbs="breadcrumbsArray"
  @breadcrumb-click="handleBreadcrumbClick"
/>
```

### DesktopControls

**Location**: `resources/js/components/DesktopControls.vue`

**Purpose**: Provides navigation controls optimized for desktop devices.

**Role**: Enhanced controls for desktop environments

**Key Features**:
- Filter chip with dropdown menu
- Search field with history
- Include subfolders toggle
- Sort direction toggle
- View mode toggle
- Keyboard shortcuts support

**Key Props**:
- `path`: Current folder path
- `breadcrumbs`: Array of breadcrumb items
- `isRoot`: Whether current location is root
- `searchInput`: Current search query
- `prefilter`: Current filter selection
- `sort`: Current sort direction
- `viewMode`: Current view mode
- `includeSubfolders`: Whether to include subfolders
- `prefilters`: List of available prefilters
- `recentSearchItems`: Recent search history
- `recentFilterItems`: Recent filter history
- `recentFolderItems`: Recent folder history
- `controlsOnly`: Whether to show only controls (no breadcrumbs)

**Events**:
- `navigate`: Emitted when navigation parameters change
- `update:searchInput`: Emitted when search input changes
- `add-recent-search`: Emitted when a search is performed
- `add-recent-filter`: Emitted when a filter is selected
- `add-recent-folder`: Emitted when a folder is added to history

### FolderPanel

**Location**: `resources/js/components/FolderPanel.vue`

**Purpose**: Collapsible folder navigation panel used in `Content.vue`

**Role**: Hierarchical content browsing interface

**Key Features**:
- Provides folder navigation with responsive behavior
- Hierarchical folder structure display
- Category-based filtering
- Quick access to content sections

### MobileSearchDialog

**Location**: `resources/js/components/MobileSearchDialog.vue`

**Purpose**: Mobile-optimized search dialog used in `MobileControls.vue`

**Role**: Full-screen search experience for mobile

**Key Features**:
- Full-screen search experience for mobile devices
- Touch-optimized input handling
- Search suggestions and results

## Search & Discovery

**Functionality**: Components that enable users to search for and discover content.

### MobileSearchDialog

**Location**: `resources/js/components/MobileSearchDialog.vue`

**Purpose**: Mobile-optimized search dialog used in `MobileControls.vue`

**Functionality**: Provides full-screen search experience for mobile devices

**Key Features**:
- Full-screen search experience for mobile devices
- Touch-optimized input handling
- Search suggestions and results
- Recent search history
- Quick search filters

## Media Playback

**Functionality**: Components that handle audio/media playback functionality.

### AudioPlayer

**Location**: `resources/js/components/AudioPlayer.vue`

**Purpose**: Provides a responsive UI for audio playback using Howler.js.

**Functionality**: Central audio control and playback management system

**Key Features**:
- Play/pause, skip, and volume controls
- Progress tracking with seek functionality
- Track information display
- Playlist management
- Loop and shuffle functionality
- Rewind and fast-forward controls
- Keyboard shortcuts for accessibility
- Mobile-responsive design
- State persistence for user preferences

**Implementation**:
- Uses the `useAudioPlayer` composable for state management
- Integrates with Howler.js for audio playback
- Implements ARIA attributes for accessibility

**Usage**:
```vue
<!-- Simple usage in a parent component -->
<script setup>
import { provide } from 'vue'
import { useAudioPlayer } from '@/composables/useAudioPlayer'
import AudioPlayer from '@/components/AudioPlayer.vue'

// Create and provide audio player instance
const audioPlayer = useAudioPlayer()
provide('audioPlayer', audioPlayer)
</script>

<template>
  <AudioPlayer />
</template>
```

**Related Composables**:
- `useAudioPlayer`: Manages audio playback state and controls

## Review & Rating System

**Functionality**: Components specific to the song review and rating workflow.

### ReviewStatusChip

**Location**: `resources/js/components/ReviewStatusChip.vue`

**Purpose**: Unified component that displays both the user's review and other reviewers' ratings

**Functionality**: Review status visualization and visual feedback

**Key Features**:
- Unified display of user's rating and other reviewers' ratings in a single chip
- Color-coded based on rating type
- Icon representation of ratings
- Count indicators for each rating type from other reviewers
- Comment indicator if any review has comments
- Fully responsive design with adaptive layout
- Accessible with ARIA labels summarizing all ratings

### SongReviewDialog

**Location**: `resources/js/components/SongReviewDialog.vue`

**Purpose**: Dialog for submitting and viewing reviews

**Functionality**: Complete review management workflow

**Key Features**:
- Tabbed interface for "Your Review" and "All Reviews"
- Rating selection with color-coded buttons
- Comment field with 500 character counter
- Lyrics lookup functionality
- Submit/Update Review button

### ReviewCard

**Location**: `resources/js/components/ReviewCard.vue`

**Purpose**: Review display component used in `ReviewSongsSummary.vue`

**Functionality**: Review data presentation and basic interactions

**Key Features**:
- Shows detailed review information in a collapsible card format
- Review information display
- Rating visualization
- Review metadata presentation

## User Feedback & Loading States

**Functionality**: Components that provide feedback, loading states, and error handling to enhance user experience.

### SkeletonDetailsView

**Location**: `resources/js/components/SkeletonDetailsView.vue`

**Purpose**: Skeleton loading component that mimics the DetailsView structure during data loading.

**Functionality**: Loading state management and user feedback

**Key Features**:
- Matches DetailsView table structure with proper column layout
- Animated skeleton placeholders using Vuetify's v-skeleton-loader
- Responsive column widths that adapt to content
- Mode-aware display (shows different columns for search vs folder mode)
- Proper accessibility attributes for screen readers

**Key Props**:
- `mode`: Current mode ('search' or 'folder') - affects column display
- `rowCount`: Number of skeleton rows to display (default: 10)
- `folderCount`: Number of folder skeleton items (default: 3, folder mode only)

**Usage**: Automatically displayed by `BaseView.vue` during loading states when currentView is 'details'

### SkeletonPlaylistView

**Location**: `resources/js/components/SkeletonPlaylistView.vue`

**Purpose**: Skeleton loading component that mimics the PlaylistView grid structure during data loading.

**Functionality**: Playlist loading state management

**Key Features**:
- Matches PlaylistView grid layout with responsive columns
- Animated skeleton placeholders using Vuetify's v-skeleton-loader
- Responsive grid sizing (12/6/4 columns on mobile/tablet/desktop)
- Mode-aware display (shows breadcrumbs and folders in folder mode)
- Proper accessibility attributes for screen readers

**Key Props**:
- `mode`: Current mode ('search' or 'folder') - affects layout display
- `cardCount`: Number of skeleton cards to display (default: 9)
- `folderCount`: Number of folder skeleton items (default: 3, folder mode only)

**Usage**: Automatically displayed by `BaseView.vue` during loading states when currentView is 'playlist'

### ErrorDisplay

**Location**: `resources/js/components/ErrorDisplay.vue`

**Purpose**: Standardized way to display errors with retry options

**Functionality**: Error communication and recovery guidance

**Key Features**:
- Used by `BaseView.vue` to show error states with retry functionality
- Consistent error message presentation
- User-friendly error descriptions
- Recovery action suggestions
- Error state styling

## Component Architecture Principles

### Design Patterns

- **Composition API**: All components use Vue 3's Composition API for better code organization and TypeScript integration
- **Responsive Design**: Components adapt to different screen sizes and device capabilities
- **Accessibility**: Components include proper ARIA attributes and keyboard navigation support
- **Type Safety**: TypeScript integration ensures type safety across component interfaces
- **Separation of Concerns**: Clear distinction between presentation, logic, and data management

### Functional Organization Benefits

- **Intuitive Grouping**: Components are grouped by what they actually do, making it easier to find the right component for specific functionality
- **Clear Purpose**: Each functional category has a specific role in the user experience
- **Logical Dependencies**: Related components are grouped together, making relationships clearer
- **Easier Maintenance**: Developers can quickly locate components based on the functionality they need to modify

### Component Relationships

- Application Structure components provide the foundation for all other components
- Content Display components rely on the structure provided by Application Structure components
- Navigation components coordinate with each other to provide consistent user experience
- Search & Discovery components integrate with Navigation components
- Media Playback components can be embedded in various contexts
- Review & Rating components form a cohesive workflow system
- User Feedback components are used throughout the application to maintain consistent feedback patterns

This functional organization reflects the actual usage patterns and responsibilities within the FaithMedia application, making it easier to understand component roles and relationships.

## Component Relationships

The following diagram illustrates the relationships between the main components:

```mermaid
graph TD
    SharedLayout[SharedLayout.vue] --> Content[Content.vue]
    SharedLayout --> ReviewSongs[ReviewSongs.vue]
    
    Content --> ContentNavToolbar[ContentNavToolbar.vue]
    Content --> BaseView[BaseView.vue]
    Content --> AudioPlayer[AudioPlayer.vue]
    Content --> FolderPanel[FolderPanel.vue]
    
    ContentNavToolbar --> MobileControls[MobileControls.vue]
    ContentNavToolbar --> DesktopControls[DesktopControls.vue]
    ContentNavToolbar --> BreadcrumbsNav[BreadcrumbsNav.vue]
    
    MobileControls --> MobileSearchDialog[MobileSearchDialog.vue]
    
    BaseView --> DetailsView[DetailsView.vue]
    BaseView --> PlaylistView[PlaylistView.vue]
    BaseView --> SkeletonDetailsView[SkeletonDetailsView.vue]
    BaseView --> SkeletonPlaylistView[SkeletonPlaylistView.vue]
    BaseView --> ErrorDisplay[ErrorDisplay.vue]
    
    ReviewSongs --> ReviewStatusChip[ReviewStatusChip.vue]
    ReviewSongs --> SongReviewDialog[SongReviewDialog.vue]

## Best Practices

When using these components, follow these best practices:

### Component Usage

1. **Composable Integration**: Use the associated composables with components
   - `useRowSelection` with BaseView and its derivatives
   - `useAudioPlayer` with AudioPlayer

2. **Prop Validation**: Always provide the required props with correct types

3. **Event Handling**: Implement handlers for all emitted events
   - Selection events (`select`)
   - Action events (`action`)
   - Navigation events (`navigate`, `parentFolder`)
   - Media events (`ended`, `timeupdate`)

### Accessibility

1. **ARIA Attributes**: Use appropriate ARIA attributes for interactive elements
2. **Keyboard Navigation**: Ensure all interactive elements are keyboard accessible
3. **Color Contrast**: Maintain sufficient color contrast for text and UI elements

### Performance

1. **Lazy Loading**: Use lazy loading directives for images and heavy components
2. **Conditional Rendering**: Use v-show instead of v-if for frequently toggled content
3. **List Rendering**: Always use keys for list rendering

### Responsive Design

1. **Mobile-First Approach**: Design for mobile first, then enhance for larger screens
2. **Responsive Components**: Leverage the responsive design patterns built into components like BreadcrumbsNav and ContentNavToolbar

### Error Handling and Loading States

1. **Error Display**: Always implement proper error handling with ErrorDisplay
2. **Loading States**: Use skeleton components (SkeletonDetailsView, SkeletonPlaylistView) for better user experience during loading

## Related Documentation

- [Technical Specification](TechnicalSpecification.md) - Comprehensive technical specification
- [Architecture Documentation](Architecture.md) - Detailed system architecture and structure
- [API & Technical Implementation](API.md) - API reference and technical details
