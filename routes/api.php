<?php

use App\Models\Content;
use App\Models\Prefilter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::middleware('auth:api,web')->get('/user', function (Request $request) {
    return $request->user();
});

Route::get('/prefilters', function () {
    return \App\Models\Prefilter::all();
});

Route::apiResource('/content', 'ContentController');

Route::apiResource('/songreviews', 'SongReviewController');

Route::apiResource('/songreviewsummary', 'SongReviewSummaryController');

Route::apiResource('/publicusers', 'PublicUserController')
    ->parameters(['publicusers' => 'publicUser']);

// query-string alternative
Route::delete('/publicusers/{publicUser}/contentbookmarks', 'PublicUserContentBookmarkController@destroy')
    ->middleware('bookmark.querystring');

// allow slashes in publicUserContentBookmark ('file') parameters  (global 'pattern' vs 'where')
Route::pattern('publicUserContentBookmark', '.*');

Route::apiResource('/publicusers/{publicUser}/contentbookmarks', 'PublicUserContentBookmarkController')
    ->parameters(['contentbookmarks' => 'publicUserContentBookmark:file']);

/**
 * Notes:
 *   - Relying on implicit binding, nested route parameters, and custom keys - see: https://laravel.com/docs/8.x/routing#implicit-binding
 *   - Relying on named parameters (to override the defaults that Laravel guesses) - see: https://laravel.com/docs/8.x/controllers#restful-naming-resource-route-parameters
 *   - Manually created an additional 'delete' route - which uses a new 'bookmark.querystring' middleware to inject the appropriate model for file=XXX query string parameters.
 *      (Problem handling slashes in the main route string).  Alternative would have been to create additional destroyXXX() controller action that did a similiar lookup.
 */

//Allows public website to get a list of the current song rotation
Route::get('/current_song_rotation', function () {
    $filter = Prefilter::where('slug', 'music-currentrotation')->pluck('filter')->implode('filter');
    $data = Content::select('file','content', 'guests')->whereNotNull('seconds')->smartSearch($filter, 'file|series|guests|tags')->get();
    $currentSongsData = collect($data)->map(function ($item, $key) {
        $guestTitle = Str::between($item->file, ' ', '.ogg');
        return [
            'guestTitle' => $guestTitle,
            'title' => $item->content,
            'guest' => $item->guests,
        ];
    })->sortBy('guest')->values();
    return $currentSongsData;
})->middleware('auth:api,web');
