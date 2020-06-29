<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;

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

Route::get( '/home', function () {
    return view('home');
})->name('home');;

// Auth0-related routes.   (Replaces Laravel's default auth routes - normally added with a "Auth::routes();" statement.)
Route::get( '/auth0/callback', '\Auth0\Login\Auth0Controller@callback' )->name( 'auth0-callback' );
Route::get( '/login', 'Auth\Auth0IndexController@login' )->name( 'login' );
Route::match(['get','post'], '/logout', 'Auth\Auth0IndexController@logout' )->name( 'logout' )->middleware('auth');
Route::get( '/profile', 'Auth\Auth0IndexController@profile' )->name( 'profile' )->middleware('auth');

// Remaining routes are handled by our Vue SPA
Route::get('/{any}', function () {
    Gate::authorize('use-app');
    $LaravelAppGlobals = [
        'user' => Auth::user(),
        'config' => [
            'name' => config('app.name'),
            'media_download_base' => config('myapp.media_download_base'),
        ],
    ];
    return view('media')->with('LaravelAppGlobals', $LaravelAppGlobals);
})->where('any', '.*')->middleware('auth');

