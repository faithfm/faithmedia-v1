<?php

namespace App\Http\Controllers;

use App\Models\Content;
use App\Models\SongReviewSummary;
use App\Http\Controllers\SongReviewController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class SongReviewSummaryController extends Controller
{
    /**
     * Restrict access to content managers who make final song decisions.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('auth:ffm-token-guard,ffm-session-guard');
        $this->middleware('can:review-songs-summary');
    }

    /**
     * Display song review summary management interface.
     * Content managers make final decisions based on reviewer feedback.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $songs = SongReviewController::getSongsForReview();
        $filenames = $songs->pluck('file')->toArray();

        return Inertia::render('ReviewSongsSummary', [
            // Use closures for lazy evaluation - only execute when needed for partial reloads
            'summaries' => fn() => SongReviewSummary::whereIn('file', $filenames)->get(),
            'sourceSuggestions' => fn() => $this->getSourceSuggestions(),
            'allReviews' => fn() => $this->getAllReviews($filenames),
            'songs' => $songs,
        ]);
    }

    /**
     * Save management decisions (status, source, comments) for songs.
     * Supports partial updates of individual fields.
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
                'status' => 'nullable|string',
                'source' => 'nullable|string',
                'comment' => 'nullable|string',
            ]);

            $songReviewSummary = SongReviewSummary::firstOrNew(['file' => $request->file]);

            // Use exists() instead of has() to allow clearing values like source = null or ""
            foreach (['status', 'source', 'comment'] as $field) {
                if ($request->exists($field)) {
                    $songReviewSummary->$field = $request->$field;
                }
            }

            $songReviewSummary->save();

            Log::info('Song review summary saved successfully', [
                'file' => $request->file,
                'changes' => $songReviewSummary->getDirty(),
                'action' => $songReviewSummary->wasRecentlyCreated ? 'created' : 'updated'
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to save song review summary: ', [
                'message' => $e->getMessage(),
                'file' => $request->file,
            ]);
            throw $e;
        }

        return back();
    }


    /**
     * Get all individual reviewer feedback
     *
     * @param string[] $filenames Array of song filenames to process
     * @return \Illuminate\Support\Collection
     */
    private function getAllReviews(array $filenames)
    {
        return \App\Models\SongReview::with('user:id,name,email')
            ->select('id', 'file', 'rating', 'comments', 'created_at', 'user_id')
            ->whereIn('file', $filenames)
            ->orderBy('created_at', 'desc')
            ->get();
    }

    /**
     * Provide autocomplete suggestions for source attribution field.
     *
     * @return string[] Array of unique source values for autocomplete suggestions
     */
    private function getSourceSuggestions(): array
    {
        return Cache::remember('source-suggestions', 3600, function () {
            return SongReviewSummary::whereNotNull('source')
                ->where('source', '!=', '')
                ->distinct()
                ->pluck('source')
                ->filter()
                ->sort()
                ->values()
                ->toArray();
        });
    }
}
