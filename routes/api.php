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

Route::apiResource('/content', 'ContentController');
Route::apiResource('/songreviews', 'SongReviewController');
Route::apiResource('/publicusers', 'PublicUserController');
Route::apiResource('/publiccontentreviews', 'PublicContentReviewController');

Route::get('/prefilters', function () {
    return \App\Models\Prefilter::all();
});

