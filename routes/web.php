<?php

use App\Http\Controllers\ContentController;
use FaithFM\SimpleAuth0\SimpleAuth0ServiceProvider;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

// Register login/logout/callback routes (for Auth0)
SimpleAuth0ServiceProvider::registerLoginLogoutCallbackRoutes();

Route::middleware(['auth', 'can:use-app'])->group(function () {
    // Root route redirects to content
    Route::get('/', function () {
        return redirect('/content');
    });

    Route::get('phpinfo', function () {
        phpinfo();
    });

    // Content page routes
    Route::get('/content/{path?}', [ContentController::class, 'show'])
        ->where('path', '.*')
        ->name('content.show');

    // Content metadata update route
    Route::put('/content/metadata', [ContentController::class, 'updateMetadata'])
        ->middleware('can:edit-content')
        ->name('content.metadata.update');

    // Song review routes - main Inertia page
    Route::get('/review-songs', [App\Http\Controllers\SongReviewController::class, 'index'])
        ->middleware('can:review-songs')
        ->name('review-songs');

    // Song review routes - process form submissions (creates/updates)
    Route::put('/review-songs', [App\Http\Controllers\SongReviewController::class, 'upsert'])
        ->middleware('can:review-songs')
        ->name('review-songs.submit');

    // Song review summary routes - main Inertia page
    Route::get('/review-songs-summary', [App\Http\Controllers\SongReviewSummaryController::class, 'index'])
        ->middleware('can:review-songs-summary')
        ->name('review-songs-summary');

    // Song review summary routes - process form submissions (creates/updates)
    Route::patch('/review-songs-summary', [App\Http\Controllers\SongReviewSummaryController::class, 'upsert'])
        ->middleware('can:review-songs-summary')
        ->name('review-songs-summary.submit');

    // Clear cache route - admin only
    Route::get('/clear-cache', function () {
        \Illuminate\Support\Facades\Cache::flush();
        return response()->json([
            'message' => 'Cache cleared successfully',
            'timestamp' => now()->toISOString()
        ]);
    })->name('clear-cache');
});

// override Nova's login/logout routes
Route::get('nova/logout', function () {
    return redirect()->route('logout');
})->name('nova.logout');
Route::get('nova/login', function () {
    return redirect()->route('login');
})->name('nova.login');
