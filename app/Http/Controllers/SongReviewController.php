<?php

namespace App\Http\Controllers;

use App\Models\SongReview;
use App\Models\Prefilter;
use App\Models\Content;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class SongReviewController extends Controller
{
    /**
     * Instantiate a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('auth:ffm-token-guard,ffm-session-guard');          // require authentication
        $this->middleware('can:review-songs');  // song-reviewers only allowed
    }

    /**
     * Display the song review page.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        // Get the songs for review
        $songs = static::getSongsForReview();

        // Fetch reviews for these songs
        $filenames = $songs->pluck('file')->toArray();
        $songReviews = SongReview::select('id', 'file', 'user_id', 'rating', 'comments')
            ->with(['user' => function ($query) {
                $query->select('id', 'name')->without('permissions');
            }])
            ->whereIn('file', $filenames)
            ->latest('updated_at')
            ->get();

        // Return the page with optimized data loading
        return Inertia::render('ReviewSongs', [
            'songReviews' => $songReviews,          // song reviews are regularly updated - always required
            'songs' => $songs,                      // lazy load the songs to save network traffic
        ]);
    }


    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function upsert(Request $request)
    {
        try {
            // Validate the request
            $request->validate([
                'file' => 'required|string',
                'user_id' => 'required|integer',
                'rating' => 'nullable|string|in:+,-,?,A,L,P,N,U',
                'comments' => 'nullable|string|max:500',
            ]);

            // Use updateOrCreate for cleaner upsert operation
            $songReview = SongReview::updateOrCreate(
                [
                    'file' => $request->file,
                    'user_id' => $request->user()->id,
                ],
                [
                    'rating' => $request->rating,
                    'comments' => $request->comments,
                ]
            );

            Log::info('Song review saved successfully', [
                'file' => $request->file,
                'user_id' => $request->user()->id,
                'action' => $songReview->wasRecentlyCreated ? 'created' : 'updated'
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to save song review', [
                'message' => $e->getMessage(),
                'file' => $request->file,
                'user_id' => $request->user()->id,
            ]);

            throw $e; // Re-throw
        }
        // Redirect back to the review page to refresh the data
        return back();
    }

    /**
     * Get songs for review with caching.
     *
     * @return \Illuminate\Support\Collection
     */
    public static function getSongsForReview()
    {
        return Cache::remember('songs-for-review', 600, function () {     // songs are cached for 10 minutes  (they won't change during a review session, but don't want to cache too long to cater for pre/post-review changes)
            // Get the filter for the lazy loading of songs
            $filter = Cache::remember('music-pending-filter', 3600, function () {           // prefilter is cached for 1 hour
                return Prefilter::where('slug', 'music-pending')
                    ->pluck('filter')
                    ->implode('filter');
            });

            return Content::select('file', 'content', 'guests', 'seconds', 'tags')          // songs are cached for 10 minutes  (they won't change during a review session, but don't want to cache too long to cater for pre/post-review changes)
                ->whereNotNull('seconds')
                ->smartSearch($filter, 'file|series|guests|tags')
                ->get()
                ->map(function ($item) {
                    return [
                        'file'    => $item->file,
                        'title'   => $item->content,
                        'artist'  => $item->guests,
                        'seconds' => $item->seconds,
                        'tags'    => $item->tags,
                    ];
                })
                ->values();
        });
    }

}
