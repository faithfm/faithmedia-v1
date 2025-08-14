<?php

namespace App\Http\Controllers;

use App\Models\Content;
use App\Models\Prefilter;
use App\Http\Requests\ContentRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class ContentController extends Controller
{
    /**
     * Instantiate a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('auth:ffm-token-guard,ffm-session-guard');    //require authentication
        $this->middleware('can:use-app');  // use-app permission required
    }

    /**
     * Display the content page.
     *
     * @param  \App\Http\Requests\ContentRequest  $request
     * @param  string|null  $path
     * @return \Inertia\Response
     */
    public function show(ContentRequest $request, string $path = ''): Response
    {
        // Cache prefilters for 1 hour since they rarely change
        $prefilters = Cache::remember('content.prefilters', 3600, function () {
            return Prefilter::orderBy('name', 'asc')->get();
        });
        $prefilterSlug = $request->query('prefilter');
        $search = $request->query('search');
        $includeSubfolders = filter_var($request->query('includeSubfolders', 'false'), FILTER_VALIDATE_BOOLEAN);
        $sort = $request->query('sort', 'desc');

        // Determine active prefilter
        $activePrefilter = $prefilterSlug;

        // Get folders and paginated content
        $folders = $this->getDirectSubfolders($path, $search, $activePrefilter, $includeSubfolders);
        $content = $this->getContent($path, $search, $activePrefilter, $includeSubfolders, $sort, $request->query('cursor'), 500);

        // Prepare props
        $initialProps = [
            'initialPath'              => $path,
            'initialPrefilter'         => $activePrefilter,
            'initialSearch'            => $search,
            'initialSort'              => $sort,
            'initialLayout'            => $request->query('layout'),
            'initialIncludeSubfolders' => $includeSubfolders,
            'folders'                  => $folders,
            'prefilters'               => $prefilters,
            'meta' => [
                'mode'              => $search ? 'search' : 'folder',
                'pagination'        => ['limit' => 500],
            ],
        ];

        // Prepare additional props for content
        $additionalProps = [
            'content' => Inertia::deepMerge([
                'items'      => $content['items'],
                'nextCursor' => $content['nextCursor'],
                'hasMore'    => $content['hasMore'],
            ]),
        ];

        // Merge the props and render the component
        return Inertia::render('Content', array_merge($initialProps, $additionalProps));
    }

    /**
     * Get direct subfolders at the next level down from the current path.
     *
     * @param  string  $path  The base path to filter subfolders by
     * @param  string|null  $search  Optional search term for filtering subfolders
     * @param  string|null  $prefilterSlug  Optional prefilter to apply
     * @param  bool  $includeSubfolders  Whether to include content from subfolders in the search
     * @return array  Array of direct subfolder paths
     *
     * @throws \Exception  If an error occurs while querying the databases
     */
    private function getDirectSubfolders(string $path, ?string $search = null, ?string $prefilterSlug = null, bool $includeSubfolders = false): array
    {
        try {
            $path = rtrim($path, '/');
            $pathPrefix = $path ? $path . '/' : '';
            $pathPrefixLength = strlen($pathPrefix);

            // Cache folder results for non-search queries (15 minutes)
            // Don't cache search results as they're more dynamic
            if (!$search) {
                $userRestrictions = $this->getUserAppRestrictions();
                $userRestrictionsKey = $userRestrictions ? md5(json_encode($userRestrictions)) : 'none';
                $cacheKey = 'content.folders.' . md5($path . '|' . ($prefilterSlug ?? 'none') . '|' . ($includeSubfolders ? '1' : '0') . '|' . $userRestrictionsKey);
                return Cache::remember($cacheKey, 900, function () use ($path, $search, $prefilterSlug, $includeSubfolders, $pathPrefix, $pathPrefixLength) {
                    return $this->executeSubfoldersQuery($path, $search, $prefilterSlug, $includeSubfolders, $pathPrefix, $pathPrefixLength);
                });
            }

            // For search queries, execute directly without caching
            return $this->executeSubfoldersQuery($path, $search, $prefilterSlug, $includeSubfolders, $pathPrefix, $pathPrefixLength);
        } catch (\Exception $e) {
            // Log the error
            Log::error('Error in getDirectSubfolders method: ' . $e->getMessage(), [
                'path' => $path,
                'search' => $search,
                'prefilter' => $prefilterSlug,
                'includeSubfolders' => $includeSubfolders
            ]);

            // Return empty results
            return [];
        }
    }

    /**
     * Execute the actual subfolders query.
     *
     * @param  string  $path
     * @param  string|null  $search
     * @param  string|null  $prefilterSlug
     * @param  bool  $includeSubfolders
     * @param  string  $pathPrefix
     * @param  int  $pathPrefixLength
     * @return array
     */
    private function executeSubfoldersQuery(string $path, ?string $search, ?string $prefilterSlug, bool $includeSubfolders, string $pathPrefix, int $pathPrefixLength): array
    {
        // Use filtered builder expression as base of our sub-folder query
        $query = $this->getContentBuilder($path, $search, $prefilterSlug, true); // Always include subfolders for folder detection

        // This query finds all distinct folder paths at the next level down from the current path
        // It works by:
        // 1. Taking each file path that starts with our current path
        // 2. Extracting the part after the current path
        // 3. Finding the position of the first slash in that part (if any)
        // 4. If there is a slash, extracting everything up to that slash
        // 5. Concatenating with the current path to get the full folder path

        // First, ensure we're only looking at paths that have at least one subfolder level
        $query->where('file', 'like', $pathPrefix . '%/%');

        // Then extract the first subfolder level
        $directSubfolders = $query
            ->selectRaw(
                '
                DISTINCT CONCAT(
                    ?,
                    SUBSTRING_INDEX(SUBSTRING(file, ?), "/", 1)
                ) AS folder_path',
                [$pathPrefix, $pathPrefixLength + 1]
            )
            ->orderBy('folder_path', 'asc') // Add explicit ordering for consistency
            ->limit(1000)
            ->pluck('folder_path')
            ->sort()
            ->values()
            ->toArray();

        return $directSubfolders;
    }


    /**
     * Build a query for content items based on various criteria.
     * Optimized with Laravel's conditional query methods.
     *
     * @param  string  $path  The base path to filter content by
     * @param  string|null  $search  Optional search term for filtering content
     * @param  string|null  $prefilterSlug  Optional prefilter to apply
     * @param  bool  $includeSubfolders  Whether to include content from subfolders
     * @return \Illuminate\Database\Eloquent\Builder  Query builder instance
     */
    private function getContentBuilder(string $path, ?string $search = null, ?string $prefilterSlug = null, bool $includeSubfolders = false): \Illuminate\Database\Eloquent\Builder
    {
        // Fields to use in smart searches
        $allowedSearchFields = 'file|series|content|guests|tags';

        // Prepare path for filtering
        $path = trim($path, '/');
        $pathFilter = empty($path) ? '' : $path . '/';

        return Content::query()
            // STEP 1: Apply path filter
            ->where('file', 'like', $pathFilter . '%')
            // 1b: Conditionally exclude subfolders
            ->when(!$includeSubfolders, function ($query) use ($pathFilter) {
                return $query->where('file', 'not like', $pathFilter . '%/%');
            })
            // STEP 2: Apply user restrictions filter
            ->when($this->getUserAppRestrictions(), function ($query, $userRestrictions) use ($allowedSearchFields) {
                if (isset($userRestrictions['filter'])) {
                    return $query->smartSearch($userRestrictions['filter'], $allowedSearchFields);
                }
                return $query;
            })
            // STEP 3: Apply prefilter conditionally
            ->when($prefilterSlug, function ($query) use ($prefilterSlug, $allowedSearchFields) {
                $prefilter = Cache::remember('prefilter.' . $prefilterSlug, 1800, function () use ($prefilterSlug) {
                    return Prefilter::where('slug', $prefilterSlug)->first();
                });

                if ($prefilter && !empty($prefilter->filter)) {
                    return $query->smartSearch($prefilter->filter, $allowedSearchFields);
                }
                return $query;
            })
            // STEP 4: Apply search string filter conditionally
            ->when($search, function ($query) use ($search, $allowedSearchFields) {
                return $query->smartSearch($search, $allowedSearchFields);
            });
    }

    /**
     * Get content items filtered by various criteria.
     *
     * @param  string  $path  The base path to filter content by
     * @param  string|null  $search  Optional search term for filtering content
     * @param  string|null  $prefilterSlug  Optional prefilter to apply
     * @param  bool  $includeSubfolders  Whether to include content from subfolders
     * @param  string  $sort  Sort direction ('asc' or 'desc')
     * @param  int|null  $cursor  Optional cursor for pagination
     * @param  int  $limit  Number of items to retrieve (pagination limit)
     * @return array  Array containing items, pagination info, and hasMore flag
     */
    private function getContent(string $path, ?string $search = null, ?string $prefilterSlug = null, bool $includeSubfolders = false, string $sort = 'asc', ?int $cursor = null, int $limit = 500): array
    {
        try {
            // Get the query builder for the Content items based on the provided parameters
            $query = $this->getContentBuilder($path, $search, $prefilterSlug, $includeSubfolders);

            // Apply sorting
            $query->orderBy('file', $sort);

            // Apply cursor-based pagination
            $cursor = $cursor ? (int)$cursor : 0;  // Convert to integer and default to 0 if not provided
            $query->skip($cursor);

            $items = $query->take($limit + 1)->get();
            $hasMore = $items->count() > $limit;
            $items = $items->take($limit);

            return [
                'items'      => $items,     // The items retrieved from the database
                'nextCursor' => $hasMore ? ($cursor + $items->count()) : null,
                'hasMore'    => $hasMore
            ];
        } catch (\Exception $e) {
            // Log the error
            Log::error('Error in getContent method: ' . $e->getMessage(), [
                'path' => $path,
                'search' => $search,
                'prefilter' => $prefilterSlug,
                'includeSubfolders' => $includeSubfolders
            ]);

            // Return empty results
            return ['items' => [], 'nextCursor' => null, 'hasMore' => false];
        }
    }


    /**
     * Get user restrictions for a specific permission.
     *
     * @param string $permissionName
     * @return array|null
     */
    private function getUserAppRestrictions(string $permissionName = 'use-app'): ?array
    {
        $permission = auth()->user()->permissions->firstWhere('permission', $permissionName);
        return $permission?->restrictions;
    }

    /**
     * Get fields that are forced by database rules for a specific file.
     *
     * @param string $file
     * @return array
     */
    private function getContentForcedFields(string $file): array
    {
        try {
            $defaults = \Illuminate\Support\Facades\DB::connection('sched')
                ->select('SELECT * FROM content_defaults WHERE ? LIKE file_pattern', [$file]);

            $forcedFields = [];
            foreach ($defaults as $default) {
                if (!empty($default->series_force)) $forcedFields[] = 'series';
                if (!empty($default->content_force)) $forcedFields[] = 'content';
                if (!empty($default->guests_force)) $forcedFields[] = 'guests';
                if (!empty($default->tags_force)) $forcedFields[] = 'tags';
            }

            return array_unique($forcedFields);
        } catch (\Exception $e) {
            Log::error('Error checking content forced fields: ' . $e->getMessage(), ['file' => $file]);
            return [];
        }
    }

    /**
     * Update content metadata.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateMetadata(Request $request): \Illuminate\Http\JsonResponse
    {
        // 1. Validate all input fields:Ensures required and optional fields meet type/length requirements before processing.
        $requestedData = $request->validate([
            'file' => 'required|string',
            'content' => 'nullable|string|max:500',
            'series' => 'nullable|string|max:255',
            'guests' => 'nullable|string|max:500',
            'tags' => 'nullable|string|max:500',
        ]);

        // 2. Load existing content record by file identifier
        $content = Content::where('file', $requestedData['file'])->firstOrFail();
        $oldData = $content->only(['file', 'content', 'series', 'guests', 'tags']);

        // 3. Determine which fields have actually changed. Compare the incoming request data with existing stored data
        $changedData = array_diff_assoc($requestedData, $oldData);
        $changedFields = array_keys($changedData);

        // 4. Identify fields with attempted changes that should be blocked based on user fields-restriction permissions
        $userRestrictions = $this->getUserAppRestrictions('edit-content') ?: [];
        $permissionAllowedFields = $userRestrictions['fields'] ?? ['content', 'series', 'guests', 'tags'];
        $permissionBlockedFields = array_diff($changedFields, $permissionAllowedFields);

        // 5. Identify fields with attempted changes that should be blocked based on forced fields from content_defaults table
        $forcedFields = $this->getContentForcedFields($requestedData['file']);
        $contentBlockedFields = array_intersect($changedFields, $forcedFields);

        // 6. Get list of fields where the changes are allowed
        $allowedChangesFields = array_diff($changedFields, $permissionBlockedFields, $contentBlockedFields);
        $allowedChangedData = array_intersect_key($changedData, array_flip($allowedChangesFields));

        // 7. Prepare response variables
        $responseCode = 200; // Assume success
        $respondMessages = [];
        // Add error messages if there are blocked fields from user permissions
        if (!empty($permissionBlockedFields)) {
            $respondMessages[] = 'You do not have permission to update: ' . implode(', ', $permissionBlockedFields);
            $responseCode = 403;
        }
        // Add error messages if there are blocked fields from content_defaults table
        if (!empty($contentBlockedFields)) {
            $respondMessages[] = 'Content Defaults table is blocking changes to: ' . implode(', ', $contentBlockedFields);
            $responseCode = 403;
        }
        // Add error messages if there are no changes detected
        if (empty($allowedChangedData)) {
            $respondMessages[] = 'No changes detected';
            $responseCode = 400;
        }

        // 8. Attempt to update allowed fields
        try {
            $content->update($allowedChangedData);
            // If no error messages exist, confirm success
            if (empty($respondMessages)) {
                $respondMessages[] = 'Content metadata updated successfully';
            }
        } catch (\Exception $e) {
            // Catch database or update errors
            $respondMessages[] = 'Failed to update content metadata: ' . $e->getMessage();
            $responseCode = 500;
        }

        // 9. Return final JSON response
        return response()->json([
            'messages' => implode(';  ', $respondMessages),
            'content' => $content->only(['file', 'content', 'series', 'guests', 'tags']),
        ], $responseCode);
    }
}
