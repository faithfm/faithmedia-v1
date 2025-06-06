# API & Technical Implementation

## Table of Contents

1. [Introduction](#introduction)
2. [API Documentation](#api-documentation)
   - [Authentication](#authentication)
   - [Endpoints](#endpoints)
   - [Data Models](#data-models)
   - [Error Handling](#error-handling)
   - [Pagination](#pagination)
   - [Search](#search)
3. [Inertia Implementation](#inertia-implementation)
   - [Overview](#inertia-overview)
   - [Server-Side Setup](#server-side-setup)
   - [Client-Side Setup](#client-side-setup)
   - [Page Components](#page-components)
   - [Data Handling](#data-handling)
   - [Navigation](#navigation)
4. [Performance Optimization](#performance-optimization)
   - [Cursor-Based Pagination](#cursor-based-pagination)
   - [Virtual Scrolling](#virtual-scrolling)
   - [Lazy Loading](#lazy-loading)
   - [State Management Optimization](#state-management-optimization)
   - [Benchmarks and Metrics](#benchmarks-and-metrics)
5. [Best Practices](#best-practices)
   - [API Best Practices](#api-best-practices)
   - [Inertia Best Practices](#inertia-best-practices)
   - [Performance Best Practices](#performance-best-practices)
6. [Related Documentation](#related-documentation)

## Introduction

This document provides comprehensive documentation for the API, Inertia.js implementation, and performance optimizations in the FaithMedia project. It covers API endpoints, authentication, data models, Inertia.js integration, and performance optimization techniques.

## API Documentation

### Authentication

The API uses two authentication guards:

- `ffm-token-guard`: For API token authentication
- `ffm-session-guard`: For session-based authentication

All API endpoints require authentication. Unauthenticated requests will receive a `401 Unauthorized` response.

#### Authentication Headers

For API token authentication, include the following header:

```
Authorization: Bearer {your-api-token}
```

For session-based authentication, ensure that the user is logged in and has a valid session cookie.

### Endpoints

#### Content Page (Inertia)

##### `GET /content[?path={path}][&search={search}][&prefilter={prefilter}][&sort={sort}][&viewMode={viewMode}][&includeSubfolders={includeSubfolders}]`

Renders the content page with the specified parameters.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| path | string | No | The folder path to display. Default: empty (root). For prefilters with path patterns, this will be automatically set to the path extracted from the filter. |
| search | string | No | Search query for filtering content |
| prefilter | string | No | Slug of a predefined filter to apply |
| sort | string | No | Sort direction ('asc' or 'desc'). Default: 'asc' |
| viewMode | string | No | View mode ('details' or 'playlist'). Default: 'details' for folder mode, 'playlist' for search mode |
| includeSubfolders | boolean | No | Whether to include subfolders in the results. Default: false in folder mode, true in search mode |

**URL Override Behavior:**

When a prefilter is selected, the URL will use query parameters:

```
https://faithmedia-v1.test/content?prefilter=biblestudy
```

The frontend maintains awareness of which prefilter is active, and subfolders are included by default in all contexts.

**Response:**

Returns an Inertia page with the following props:

```json
{
  "initialPath": "path/to/folder",
  "initialPrefilter": "music",
  "initialSearch": "sermon",
  "initialSort": "asc",
  "initialViewMode": "details",
  "initialIncludeSubfolders": true,
  "content": {
    "items": [
      {
        "file": "path/to/file.mp3",
        "series": "Series Name",
        "numbers": "123",
        "content": "File description",
        "guests": "Guest names",
        "tags": "tag1,tag2",
        "bytes": 12345678,
        "seconds": 3600,
        "md5": "file-md5-hash",
        "bestdate": "2023-01-01",
        "podcastdate": "2023-01-01",
        "source": "source-info",
        "ref": "reference-info"
      }
    ],
    "nextCursor": "cursor-value",
    "hasMore": true
  },
  "folders": [
    "subfolder1",
    "subfolder2"
  ],
  "prefilters": [
    {
      "slug": "music",
      "name": "Music",
      "filter": "music OR song"
    }
  ],
  "meta": {
    "mode": "folder",
    "pagination": {
      "limit": 500
    }
  }
}
```

#### Update File Metadata

##### `PUT /content/metadata`

Updates metadata for a specific file.

**Parameters:**

| Name | Type | Required | Description |
|------|------|----------|-------------|
| file | string | Yes | File path |
| content | string | No | File description (max 500 chars) |
| series | string | No | Series name (max 255 chars) |
| guests | string | No | Guest names (max 500 chars) |
| tags | string | No | Comma-separated tags (max 500 chars) |

**Request Body:**

```json
{
  "file": "path/to/file.mp3",
  "content": "Updated description",
  "series": "Series Name",
  "guests": "Guest Name",
  "tags": "tag1,tag2"
}
```

**Response:**

```json
{
  "file": "path/to/file.mp3",
  "content": "Updated description",
  "series": "Series Name",
  "guests": "Guest Name",
  "tags": "tag1,tag2"
}
```


### Data Models

#### Content

| Field | Type | Description |
|-------|------|-------------|
| file | string | Primary key. Path to the file |
| series | string | Series name |
| numbers | string | Episode or track numbers |
| content | string | Description of the content |
| guests | string | Guest names |
| tags | string | Comma-separated tags |
| bytes | integer | File size in bytes |
| seconds | integer | Duration in seconds |
| md5 | string | MD5 hash of the file |
| bestdate | date | Best date for the content |
| podcastdate | date | Date for podcast publishing |
| source | string | Source information |
| ref | string | Reference information |

#### Prefilter

| Field | Type | Description |
|-------|------|-------------|
| id | integer | Primary key |
| slug | string | URL-friendly identifier |
| name | string | Display name |
| filter | string | Filter expression |

### Error Handling

The API uses standard HTTP status codes to indicate the success or failure of a request:

- `200 OK`: The request was successful
- `400 Bad Request`: The request was malformed or invalid
- `401 Unauthorized`: Authentication is required
- `403 Forbidden`: The authenticated user doesn't have the required permissions
- `404 Not Found`: The requested resource was not found
- `422 Unprocessable Entity`: Validation errors
- `500 Internal Server Error`: An unexpected error occurred

#### Validation Errors

Validation errors are returned with a `422 Unprocessable Entity` status code and include details about the validation failures:

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "field_name": [
      "Error message for the field"
    ]
  }
}
```

### Pagination

The API uses cursor-based pagination for efficient loading of large datasets. The response includes:

- `items`: Array of content items
- `nextCursor`: Cursor value for the next page (null if no more items)
- `hasMore`: Boolean indicating if there are more items to load

To fetch the next page, include the `cursor` parameter with the value of `nextCursor` from the previous response.

### Search

The API supports smart searching using the `search` parameter. The search is performed across multiple fields:

- `file`: File path
- `series`: Series name
- `content`: Content description
- `guests`: Guest names
- `tags`: Tags

The search uses a smart search algorithm that supports:

- Multiple terms (space-separated)
- Quoted phrases for exact matches
- Boolean operators (AND, OR, NOT)
- Parentheses for grouping

Example: `"John Doe" AND (sermon OR message) NOT music`

## Inertia Implementation

### Inertia Overview

Inertia.js is a modern approach to building classic server-driven web applications. It allows you to create fully client-side rendered, single-page applications without the complexity that comes with modern SPAs. It works by leveraging existing server-side frameworks (like Laravel) and client-side frameworks (like Vue.js).

Key benefits of Inertia.js include:

- **No API Required**: Build your application without needing to create a separate API
- **Server-Side Routing**: Use your server-side routing (Laravel routes) instead of client-side routing
- **Simplified Authentication**: Use your server's authentication system instead of building a separate one for your SPA
- **Simplified State Management**: Reduce the need for complex state management libraries
- **Progressive Enhancement**: Works even without JavaScript enabled

### Server-Side Setup

The Laravel application is configured to work with Inertia.js through several key components:

#### Middleware

The `HandleInertiaRequests` middleware is registered in the HTTP kernel to handle Inertia requests:

```php
// app/Http/Kernel.php
protected $middlewareGroups = [
    'web' => [
        // ...
        \App\Http\Middleware\HandleInertiaRequests::class,
    ],
];
```

This middleware is responsible for:
- Determining if a request is an Inertia request
- Sharing common data with all Inertia responses
- Handling Inertia-specific headers

#### Shared Data

Common data that should be available to all Inertia pages is shared in the `HandleInertiaRequests` middleware:

```php
// app/Http/Middleware/HandleInertiaRequests.php
public function share(Request $request): array
{
    return array_merge(parent::share($request), [
        'auth' => [
            'user' => $request->user() ? [
                'id' => $request->user()->id,
                'name' => $request->user()->name,
                'email' => $request->user()->email,
                'permissions' => $request->user()->permissions,
            ] : null,
        ],
        'flash' => [
            'message' => fn () => $request->session()->get('message'),
            'error' => fn () => $request->session()->get('error'),
        ],
    ]);
}
```

#### Controller Responses

Controllers return Inertia responses using the `Inertia::render()` method:

```php
// app/Http/Controllers/ContentController.php
public function show(ContentRequest $request, string $path = ''): Response
{
    // Get content and folders
    $folders = $this->getSubfolders($path);
    $content = $this->getContent($request, $path);
    
    // Determine if we're in search mode
    $isSearchMode = (bool)$request->query('search');
    
    // Get includeSubfolders parameter, default to true in search mode, false in folder mode
    $includeSubfolders = filter_var($request->query('includeSubfolders', $isSearchMode ? 'true' : 'false'), FILTER_VALIDATE_BOOLEAN);
    
    return Inertia::render('Content', [
        'initialPath' => $path,
        'initialPrefilter' => $request->query('prefilter'),
        'initialSearch' => $request->query('search'),
        'initialSort' => $request->query('sort', 'asc'),
        'initialLayout' => $request->query('layout'),
        'initialIncludeSubfolders' => $includeSubfolders,
        'content' => $content,
        'folders' => $folders,
        'prefilters' => Prefilter::all(),
        'meta' => [
            'mode' => $isSearchMode ? 'search' : 'folder',
            'pagination' => [
                'limit' => 500,
            ],
        ],
    ]);
}
```

### Client-Side Setup

The client-side setup involves configuring Vue 3 to work with Inertia.js:

#### Entry Point

The main JavaScript entry point initializes Inertia with Vue 3:

```javascript
// resources/js/app.js
import { createApp, h } from 'vue'
import { createInertiaApp } from '@inertiajs/vue3'
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers'
import { ZiggyVue } from 'ziggy-js'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const vuetify = createVuetify({
  components,
  directives,
})

createInertiaApp({
  resolve: (name) => resolvePageComponent(`./Pages/${name}.vue`, import.meta.glob('./Pages/**/*.vue')),
  setup({ el, App, props, plugin }) {
    createApp({ render: () => h(App, props) })
      .use(plugin)
      .use(ZiggyVue)
      .use(vuetify)
      .mount(el)
  },
})
```

#### Root Template

The root Blade template includes the necessary setup for Inertia:

```html
<!-- resources/views/app.blade.php -->
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ config('app.name') }}</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    @inertiaHead
</head>
<body>
    @inertia
</body>
</html>
```

### Page Components

Inertia page components are Vue components that represent entire pages. They are stored in the `resources/js/Pages` directory.

#### Content Page Component

The main content page component (`Content.vue`) is structured as follows:

```vue
<template>
  <div class="content-wrapper">
    <!-- Navigation Bar -->
    <ContentNavToolbar 
      :initial-path="path" 
      :initial-prefilter="prefilter" 
      :initial-search="searchInput"
      :initial-sort="sort" 
      :initial-view-mode="viewMode" 
      :initial-include-subfolders="includeSubfolders"
      :prefilters="prefilters" 
      :view-mode="viewMode"
      @navigate="handleNavigate" 
    />

    <div class="content-container">
      <!-- Content Display Area -->
      <component 
        :is="viewMode === 'details' ? DetailsView : PlaylistView"
        :content="content"
        :folders="folders"
        :mode="mode"
        :is-loading="isLoading"
        :path="path"
        :search-query="searchInput"
        @navigate-folder="navigateToFolder"
        @select-item="selectItem"
        @play-item="playItem"
        @save-file-info="saveFileInfo"
        @download-item="downloadItem"
      />
    </div>
    
    <!-- Audio Player and Download Manager -->
    <div class="fixed-controls">
      <!-- DownloadManager component - planned enhancement (see UnfulfilledRequirements.md) -->
      <DownloadManager class="mr-2" />
      <AudioPlayer />
    </div>
  </div>
</template>

<script setup lang="ts">
// Script implementation with TypeScript
</script>
```

### Data Handling

#### Passing Data from Server to Client

Data is passed from the server to the client through Inertia props:

```php
return Inertia::render('Content', [
    'initialPath' => $path,
    'initialPrefilter' => $request->query('prefilter'),
    'initialSearch' => $request->query('search'),
    'initialSort' => $request->query('sort', 'asc'),
    'initialLayout' => $request->query('layout'),
    'content' => $content,
    'folders' => $folders,
    'prefilters' => Prefilter::all(),
    'meta' => [
        'mode' => $isSearchMode ? 'search' : 'folder',
    ],
]);
```

These props are then available in the Vue component:

```typescript
// Props from Inertia
interface Props {
  initialPath: string
  initialPrefilter: string
  initialSearch: string
  initialSort: string
  initialViewMode: string
  initialIncludeSubfolders: boolean
  content: {
    items: Content[]
    nextCursor: string | null
    hasMore: boolean
  }
  folders: string[]
  prefilters: Prefilter[]
  meta: {
    mode: 'search' | 'folder'
    pagination: {
      limit: number
    }
  }
}

const props = defineProps<Props>()
```

#### Partial Reloads

Inertia supports partial reloads, which allow you to update only specific parts of the page:

```javascript
router.get('/content', {
  path: path.value,
  prefilter: prefilter.value,
  search: search.value,
  sort: sort.value,
  layout: layout.value
}, {
  preserveState: true,
  preserveScroll: true,
  only: ['content', 'folders']
})
```

The `only` option specifies which props should be updated, while `preserveState` and `preserveScroll` maintain the current state and scroll position.

### Navigation

#### Client-Side Navigation

Navigation is handled using Inertia's `router` object:

```javascript
// Navigate to a new page
router.get('/content', {
  path: 'new/path',
  search: 'query'
})

// Navigate with options
router.get('/content', {
  path: 'new/path'
}, {
  preserveState: true,
  preserveScroll: true,
  replace: true
})
```

#### URL Synchronization

The application synchronizes the URL with the application state:

```javascript
// Watch for state changes
watch([path, prefilter, search, sort, layout], () => {
  // Update URL when state changes
  router.get('/content', {
    path: path.value,
    prefilter: prefilter.value,
    search: search.value,
    sort: sort.value,
    layout: layout.value
  }, {
    preserveState: true,
    replace: true
  })
}, { deep: true })
```

## Performance Optimization

### Cursor-Based Pagination

The application implements cursor-based pagination using offset values for efficient data loading. This approach uses Inertia.js's WhenVisible component for seamless infinite scrolling:

- **Consistent Performance**: Performance remains stable for reasonable dataset sizes
- **Seamless User Experience**: Uses Inertia's WhenVisible component for automatic loading
- **Efficient Implementation**: Leverages Laravel's skip/take methods with cursor tracking

Implementation details:

```php
// ContentController.php (Backend)
private function getContent(string $path, ?string $search = null, ?string $prefilterSlug = null, bool $includeSubfolders = false, string $sort = 'asc', ?int $cursor = null, int $limit = 500): array
{
    // Get the query builder for the Content items
    $query = $this->getContentBuilder($path, $search, $prefilterSlug, $includeSubfolders);
    
    // Apply sorting
    $query->orderBy('file', $sort);
    
    // Apply cursor-based pagination using offset
    $cursor = $cursor ? (int)$cursor : 0;
    $query->skip($cursor);
    
    $items = $query->take($limit + 1)->get();
    $hasMore = $items->count() > $limit;
    $items = $items->take($limit);
    
    return [
        'items' => $items,
        'nextCursor' => $hasMore ? ($cursor + $items->count()) : null,
        'hasMore' => $hasMore
    ];
}
```

Frontend implementation uses Inertia's WhenVisible component:

```vue
<!-- Content.vue -->
<template v-if="props.content.hasMore">
  <WhenVisible :buffer="500" always :params="{
    data: { cursor: props.content.nextCursor },
    only: ['content'],
    preserveUrl: true,
    preserveState: true
  }">
    <div class="loading-indicator">Loading...</div>
  </WhenVisible>
</template>
```

### Virtual Scrolling

For large datasets, the application implements virtual scrolling to render only the visible items in the viewport, significantly reducing DOM size and improving rendering performance:

- **Reduced DOM Size**: Only visible items are rendered, keeping the DOM lightweight
- **Smooth Scrolling**: Prevents jank when scrolling through large lists
- **Memory Efficiency**: Reduces memory usage by not rendering off-screen items

### Lazy Loading

The application implements lazy loading for various resources to improve initial load time and reduce unnecessary network requests:

#### Inertia Lazy Props

The application uses Inertia's `lazy()` method to defer loading expensive data until after the initial page load. This approach offers several benefits:
- **Faster Initial Page Load**: The page renders quickly with essential data
- **Improved User Experience**: Users see content sooner
- **Reduced Server Load**: Expensive queries are deferred
- **Better Error Handling**: Even if lazy props fail, the page can still render with partial data

#### Multi-Step Query Strategy

For complex data requirements, the application implements a multi-step query approach:

1. First, fetch lightweight data (e.g., just file identifiers)
2. Then, fetch related data (e.g., reviews)
3. Finally, load detailed data via lazy props

This strategy significantly improves performance for pages with complex data requirements.

#### Image Lazy Loading

Images are loaded only when they are about to enter the viewport, using the Intersection Observer API.

#### Audio Preview Lazy Loading

Audio previews are loaded only when needed, reducing initial bandwidth usage.

### State Management Optimization

The application optimizes state management to reduce unnecessary re-renders and improve reactivity performance:

#### Computed Properties with Inertia Props

Instead of maintaining local reactive state that duplicates Inertia props, the application uses computed properties that directly reference Inertia props. This approach:
- Eliminates state synchronization issues
- Reduces memory usage
- Simplifies the codebase
- Ensures data consistency

#### Partial Page Updates

The application uses Inertia's `only` parameter to update only specific parts of the page. This technique:
- Reduces network traffic
- Maintains UI state during updates
- Preserves scroll position
- Improves perceived performance

#### Batched Updates

Updates to related state are batched to prevent cascading re-renders.

#### Memoization

Expensive computations are memoized to prevent redundant calculations.

### Benchmarks and Metrics

The application includes performance tests that measure various aspects of performance:

#### Rendering Performance

| Dataset Size | Average Render Time | Min | Max |
|--------------|---------------------|-----|-----|
| 100 items    | ~50ms               | 30ms | 80ms |
| 500 items    | ~120ms              | 90ms | 180ms |
| 1000 items   | ~250ms              | 180ms | 350ms |

*Note: These are example values. Actual performance may vary based on hardware and browser.*

#### Search Performance

| Search Term | Average Time | Min | Max |
|-------------|--------------|-----|-----|
| Common term | ~15ms        | 10ms | 25ms |
| Rare term   | ~8ms         | 5ms  | 15ms |
| No matches  | ~5ms         | 3ms  | 10ms |

#### Virtual Scrolling Performance

| Scroll Position | Average Time | Min | Max |
|-----------------|--------------|-----|-----|
| 1,000px         | ~5ms         | 3ms | 10ms |
| 5,000px         | ~5ms         | 3ms | 10ms |
| 50,000px        | ~5ms         | 3ms | 10ms |

*Note: Virtual scrolling performance remains consistent regardless of scroll position.*

## Best Practices

### API Best Practices

1. **Use Cursor-Based Pagination**: Always use cursor-based pagination for large datasets
2. **Implement Proper Error Handling**: Return appropriate HTTP status codes and error messages
3. **Validate Input**: Always validate input data on the server side
4. **Use Resource Transformations**: Transform data before sending it to the client
5. **Optimize Database Queries**: Use eager loading and query optimization techniques

### Inertia Best Practices

1. **Use TypeScript for Props**: Define TypeScript interfaces for Inertia props to ensure type safety
2. **Use Composables for State Management**: Extract state management logic into composables
3. **Use Partial Reloads**: Use the `only` option to update only specific parts of the page
4. **Use the Head Component**: Use the `Head` component to manage the document head
5. **Use Persistent Layouts**: Use persistent layouts to avoid re-rendering the layout on page transitions

### Performance Best Practices

1. **State Management**:
   - Minimize reactive dependencies
   - Use shallow refs for large objects
   - Avoid unnecessary watchers
   - Batch related state changes

2. **Component Design**:
   - Keep components focused
   - Use functional components for simple, presentational components
   - Lazy load components
   - Optimize v-for loops

3. **Rendering Optimization**:
   - Use v-show vs v-if appropriately
   - Implement virtual scrolling for large lists
   - Memoize expensive computations
   - Use v-once for static content

4. **Network Optimization**:
   - Implement lazy loading
   - Use cursor pagination
   - Cache API responses
   - Optimize asset size

5. **Animation Performance**:
   - Use CSS transitions
   - Animate transform and opacity
   - Respect reduced motion
   - Debounce animations

## Related Documentation

- [Technical Specification](TechnicalSpecification.md) - Comprehensive technical specification
- [Architecture Documentation](Architecture.md) - Detailed system architecture and structure
- [Component Documentation](Components.md) - UI component documentation
