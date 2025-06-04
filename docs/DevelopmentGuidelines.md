# Development Guidelines

This document provides guidelines for code quality, documentation standards, and performance best practices for the FaithMedia project.

## Table of Contents

1. [Code Documentation](#code-documentation)
   - [General Guidelines](#general-guidelines)
   - [Comment Types](#comment-types)
   - [Type Definitions](#type-definitions)
   - [JSDoc Annotations](#jsdoc-annotations)

2. [Performance Best Practices](#performance-best-practices)
   - [State Management](#state-management)
   - [Component Design](#component-design)
   - [Rendering Optimization](#rendering-optimization)
   - [Network Optimization](#network-optimization)
   - [Animation Performance](#animation-performance)

3. [Implementation Techniques](#implementation-techniques)
   - [Cursor-Based Pagination](#cursor-based-pagination)
   - [Infinite Scrolling with WhenVisible](#infinite-scrolling-with-whenvisible)
   - [Lazy Loading](#lazy-loading)

---

## Code Documentation

### General Guidelines

1. **Be Clear and Concise**: Explain "why" rather than "what" (the code itself shows what it does)
2. **Keep Comments Updated**: Outdated comments are worse than no comments
3. **Use Proper Grammar**: Write in complete sentences with proper punctuation
4. **Avoid Obvious Comments**: Don't state the obvious
5. **Document Edge Cases**: Explain non-obvious edge cases and workarounds
6. **Document Assumptions**: Note any assumptions made in the code

### Comment Types

#### 1. File Headers

Each file should have a header comment that describes its purpose:

```typescript
/**
 * ContentNavToolbar Component
 * 
 * Provides the main navigation interface for the content page.
 * 
 * @module components/ContentNavToolbar
 */
```

#### 2. Function/Method Comments

Functions and methods should have comments explaining their purpose, parameters, and return values:

```typescript
/**
 * Navigates to a specific folder and updates the application state.
 * 
 * @param {string} path - The folder path to navigate to
 * @returns {void}
 */
```

#### 3. Class/Component Comments

Classes and components should have comments explaining their purpose and usage:

```typescript
/**
 * BaseView Component
 * 
 * Abstract base component that defines the interface for different view implementations.
 */
```

#### 4. Property Comments

Properties should have comments explaining their purpose:

```typescript
/**
 * Current folder path being displayed.
 * Empty string represents the root folder.
 */
const path = ref('');
```

#### 5. Interface/Type Comments

Interfaces and types should have comments explaining their purpose:

```typescript
/**
 * Represents a content item in the system.
 * Maps to the Content model in the database.
 */
interface Content {
  // Properties...
}
```

#### 6. Implementation Comments

Use inline comments to explain complex or non-obvious code:

```typescript
// Use debounced search to prevent excessive API calls
const debouncedSearch = useDebounce(search, 300);
```

### Type Definitions

#### Guidelines for Type Definitions

1. **Be Specific**: Use specific types rather than `any` whenever possible
2. **Document Complex Types**: Add comments to explain complex types
3. **Use Descriptive Names**: Choose type names that clearly indicate their purpose
4. **Prefer Interfaces for Objects**: Use interfaces for object types to allow for extension
5. **Use Type Aliases for Unions/Intersections**: Use type aliases for union and intersection types

Example:

```typescript
/**
 * Represents the possible view modes.
 */
export type ViewMode = 'folder' | 'search';
```

### JSDoc Annotations

#### Guidelines for JSDoc Annotations

1. **Use TypeScript Types**: Let TypeScript handle type information when possible
2. **Document Public APIs**: Focus on documenting public APIs
3. **Include Examples**: Add examples for complex functions
4. **Document Side Effects**: Note any side effects
5. **Document Throws**: Document exceptions that might be thrown

#### Common JSDoc Tags

- `@param`: Documents a function parameter
- `@returns`: Documents the return value
- `@throws`: Documents exceptions that might be thrown
- `@example`: Provides an example of usage
- `@see`: References related documentation
- `@deprecated`: Marks a function as deprecated
- `@todo`: Indicates planned changes
- `@module`: Identifies the module

---

## Performance Best Practices

### State Management

- **Minimize Reactive Dependencies**: Keep reactive state minimal and focused
- **Use Shallow Refs**: For large objects that don't need deep reactivity, use `shallowRef`
- **Avoid Unnecessary Watchers**: Use computed properties instead of watchers when possible
- **Batch Updates**: Group related state changes to prevent cascading re-renders

### Component Design

- **Keep Components Focused**: Each component should have a single responsibility
- **Use Functional Components**: For simple, presentational components, use functional components
- **Lazy Load Components**: Use dynamic imports for components not needed on initial load
- **Optimize v-for Loops**: Always use a key and avoid expensive operations in loops

Example:

```typescript
// Lazy load a component
const AudioPlayer = defineAsyncComponent(() => import('./components/AudioPlayer.vue'));
```

### Rendering Optimization

- **Use v-show vs v-if**: Use `v-show` for elements that toggle frequently
- **Consider Virtual Scrolling**: For very large lists, virtual scrolling can improve performance (not currently implemented)
- **Memoize Expensive Computations**: Use `computed` with proper dependencies
- **Use v-once**: For static content that never changes

### Network Optimization

- **Implement Lazy Loading**: Load resources only when needed
- **Use Cursor Pagination**: Always use cursor-based pagination for large datasets
- **Cache API Responses**: Cache responses that don't change frequently
- **Optimize Asset Size**: Use appropriate image formats and compression

### Animation Performance

- **Use CSS Transitions**: Prefer CSS transitions over JavaScript animations
- **Animate Transform and Opacity**: These properties are GPU-accelerated
- **Respect Reduced Motion**: Always check and respect user preferences
- **Debounce Animations**: Prevent animation thrashing during rapid state changes

---

## Implementation Techniques

### Cursor-Based Pagination

Cursor-based pagination offers several performance advantages over traditional offset-based pagination:

- **Consistent Performance**: Performance remains stable regardless of the offset
- **Reduced Database Load**: Queries are more efficient as they use indexed lookups
- **Better Cache Utilization**: Cursor-based queries are more cache-friendly

Implementation approach:

1. Backend: Use a unique, indexed field as the cursor (typically the ID)
2. Query items after the cursor with a limit
3. Return the last item's ID as the next cursor
4. Frontend: Store the cursor and use it for subsequent requests

### Infinite Scrolling with WhenVisible

The application uses Inertia's WhenVisible component for efficient loading of large datasets:

- **Seamless User Experience**: Automatically loads more content as users scroll
- **Optimized Performance**: Only loads additional data when needed
- **Reduced Initial Load Time**: Loads content incrementally rather than all at once
- **Server-Side Pagination**: Leverages cursor-based pagination on the backend

Current implementation approach:

1. Use Inertia's WhenVisible component to detect when user approaches end of content
2. Automatically trigger server requests for additional data
3. Append new items to existing content seamlessly
4. Maintain scroll position and user context
5. Handle loading states and error conditions gracefully

### Lazy Loading

#### Audio Lazy Loading

The application implements lazy loading for audio content through the audio player:

- **Configurable Preload Strategy**: Supports 'auto', 'metadata', and 'lazy' preload strategies
- **On-Demand Loading**: Audio files are loaded only when needed to reduce bandwidth usage
- **Performance Optimization**: Prevents unnecessary audio downloads for tracks that may not be played

Implementation in `useAudioPlayer.ts`:

```typescript
// Default configuration uses lazy loading
const DEFAULT_CONFIG: AudioPlayerConfig = {
  preloadStrategy: 'lazy'
}
```

#### Server-Side Lazy Props

The application uses Inertia's lazy evaluation with closures for expensive data operations:

- **Deferred Execution**: Expensive queries are only executed when needed for partial reloads
- **Network Optimization**: Reduces initial page load time by deferring non-critical data
- **Selective Loading**: Only loads specific data when requested via Inertia's `only` parameter

Implementation examples:

```php
// SongReviewSummaryController.php
return Inertia::render('ReviewSongsSummary', [
    // Use closures for lazy evaluation - only execute when needed for partial reloads
    'summaries' => fn() => SongReviewSummary::whereIn('file', $filenames)->get(),
    'sourceSuggestions' => fn() => $this->getSourceSuggestions(),
    'allReviews' => fn() => $this->getAllReviews($filenames),
]);
```

#### Data Lazy Loading with WhenVisible

Data is loaded incrementally using Inertia's WhenVisible component:

1. Load essential data for initial render
2. Load additional data based on user scroll position
3. Implement infinite scrolling for large datasets
4. Cache loaded data to prevent redundant requests

---

## Performance Benchmarks

| Operation | Expected Performance |
|-----------|---------------------|
| Initial Render (100 items) | < 100ms |
| Search Filtering | < 50ms |
| Sorting | < 100ms |
| Virtual Scroll Update | < 16ms (60fps) |
| API Response Time | < 300ms |

---

## Conclusion

Following these development guidelines will help maintain code quality, improve documentation, and ensure optimal performance throughout the application. These practices should be applied consistently across the codebase to create a maintainable and performant application.

Remember that documentation and performance optimization are ongoing processes. Regularly review and update documentation as the codebase evolves, and conduct performance testing to identify and address bottlenecks.

## Related Documentation

- [Technical Specification](TechnicalSpecification.md) - Comprehensive technical specification
- [Architecture Documentation](Architecture.md) - Detailed system architecture and structure
- [Migration Guide](MigrationGuide.md) - Vue2 to Vue3 migration reference
- [API & Technical Implementation](API.md) - API reference and technical details
- [Component Documentation](Components.md) - UI component documentation
- [Feature Documentation](Features.md) - Specific feature documentation
