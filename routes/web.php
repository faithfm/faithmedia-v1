<?php

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

Route::get('/home', function () {
    return view('home');
})->name('home');

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
        ->name('content.metadata.update');

});

// override Nova's login/logout routes
Route::get('nova/logout', function () {
    return redirect()->route('logout');
})->name('nova.logout');
Route::get('nova/login', function () {
    return redirect()->route('login');
})->name('nova.login');

// Remaining routes are handled by our Vue SPA


Route::get('vue2/{any?}', function () {
    Gate::authorize('use-app');
    $LaravelAppGlobals = [
        'user' => auth()->user(),
        'guest' => auth()->guest(),
        'csrf-token' => csrf_token(),
        'config' => [
            'name' => config('app.name'),
            'url' => config('app.url'),
            'media_download_base' => config('myapp.media_download_base'),
        ],
    ];

    return view('media')->with('LaravelAppGlobals', $LaravelAppGlobals);
})->where('any', '^(?!nova).*')->middleware('auth:ffm-token-guard,ffm-session-guard');
