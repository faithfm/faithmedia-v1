<?php

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

Route::get('/', function () {
    return view('welcome');
});

Route::get('/home', 'HomeController@index')->name('home');

// Auth0-related routes.   (Replaces Laravel's default auth routes - normally added with a "Auth::routes();" statement.)
Route::get( '/auth0/callback', '\Auth0\Login\Auth0Controller@callback' )->name( 'auth0-callback' );
Route::get( '/login', 'Auth\Auth0IndexController@login' )->name( 'login' );
Route::match(['get','post'], '/logout', 'Auth\Auth0IndexController@logout' )->name( 'logout' )->middleware('auth');
Route::get( '/profile', 'Auth\Auth0IndexController@profile' )->name( 'profile' )->middleware('auth');
