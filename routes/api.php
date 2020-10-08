<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

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

Route::apiResource('/publicusers', 'PublicUserController')
    ->parameters(['publicusers' => 'publicUser']);

Route::apiResource('/publicusers/{publicUser}/contentbookmarks', 'PublicUserContentBookmarkController')
    ->parameters(['contentbookmarks' => 'publicUserContentBookmark:file']);

/**
 * Notes:
 *   - Relying on implicit binding, nested route parameters, and custom keys - see: https://laravel.com/docs/8.x/routing#implicit-binding
 *   - Relying on named parameters (to override the defaults that Laravel guesses) - see: https://laravel.com/docs/8.x/controllers#restful-naming-resource-route-parameters
 */

