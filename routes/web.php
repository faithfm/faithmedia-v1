<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;

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

Route::get('/home', function () {
    return view('home');
})->name('home');;


Route::get('phpinfo', function () {
    phpinfo();
});

// Remaining routes are handled by our Vue SPA
Route::get('/{any}', function () {
    Gate::authorize('use-app');
    $LaravelAppGlobals = [
        'guest' => auth()->guest(),
        'user' => auth()->user(),
        'csrf-token' => csrf_token(),
        'config' => [
            'name' => config('app.name'),
            'url' => config('app.url'),
            'media_download_base' => config('myapp.media_download_base'),
        ],
    ];
    return view('media')->with('LaravelAppGlobals', $LaravelAppGlobals);
})->where('any', '.*')->middleware('auth');
