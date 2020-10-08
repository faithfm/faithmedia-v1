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

// explicit/long-hand version of the following statement... except it does not force camel-case /publicUsers/XXX route - that apiResource() requires to generate correct implied parameters
// almost equvalent to:    Route::apiResource('/publicUsers', 'PublicUserController');
Route::post  ('/publicusers',                 'PublicUserController@store');    // allows for both CREATE + UPDATE if already exists
Route::get   ('/publicusers',                 'PublicUserController@index');
Route::get   ('/publicusers/{publicUser}',    'PublicUserController@show');
Route::put   ('/publicusers/{publicUser}',    'PublicUserController@update');
Route::delete('/publicusers/{publicUser}',    'PublicUserController@destroy');

// Relying on implicit binding, nested route parameters, and custom keys - see: https://laravel.com/docs/8.x/routing#implicit-binding
Route::post  ('/publicusers/{publicUser}/contentbookmarks',                                     'PublicUserContentBookmarkController@store');
Route::get   ('/publicusers/{publicUser}/contentbookmarks',                                     'PublicUserContentBookmarkController@index');
Route::get   ('/publicusers/{publicUser}/contentbookmarks/{publicUserContentBookmark:file}',    'PublicUserContentBookmarkController@show');
Route::delete('/publicusers/{publicUser}/contentbookmarks/{publicUserContentBookmark:file}',    'PublicUserContentBookmarkController@destroy');

