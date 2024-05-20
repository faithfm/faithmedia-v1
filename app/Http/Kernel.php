<?php

namespace App\Http;

use Illuminate\Foundation\Http\Kernel as HttpKernel;

class Kernel extends HttpKernel
{
    /**
     * The application's global HTTP middleware stack.
     *
     * These middleware are run during every request to your application.
     *
     * @var array
     */
    protected $middleware = [
        \App\Http\Middleware\TrustProxies::class,
        \Illuminate\Http\Middleware\HandleCors::class,
        \App\Http\Middleware\CheckForMaintenanceMode::class,
        \Illuminate\Foundation\Http\Middleware\ValidatePostSize::class,
        \App\Http\Middleware\TrimStrings::class,
        \Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull::class,
    ];

    /**
     * The application's route middleware groups.
     *
     * @var array
     */
    protected $middlewareGroups = [
        'web' => [
            \App\Http\Middleware\EncryptCookies::class,
            \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
            // \Illuminate\Session\Middleware\StartSession::class,      // replace with...
            \FaithFM\SimpleAuthTokens\Http\Middleware\StartSession::class,  // ...FaithFM\SimpleAuthTokens class - which prevents creation of (numerous) session files for requests containing 'api_token=XXXX'  (ie: clients without support for cookies will normally result in creation of a session-file for every API call - potentially resulting in hundreds/thousands of session-files)
            \Illuminate\View\Middleware\ShareErrorsFromSession::class,
            \App\Http\Middleware\VerifyCsrfToken::class,
            \Illuminate\Routing\Middleware\SubstituteBindings::class,
        ],

        'api' => [
            \Illuminate\Routing\Middleware\ThrottleRequests::class . ':60,1',
            \Illuminate\Routing\Middleware\SubstituteBindings::class,

            // OPTIONAL session-related middleware for API routes - recommended by FaithFM\SimpleAuthTokens
            \App\Http\Middleware\EncryptCookies::class,
            \Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse::class,
            \FaithFM\SimpleAuthTokens\Http\Middleware\StartSession::class,        // FaithFM\SimpleAuthTokens class
            \Illuminate\View\Middleware\ShareErrorsFromSession::class,
            \App\Http\Middleware\VerifyCsrfToken::class,
        ],
    ];

    /**
     * The application's middleware aliases.
     *
     * Aliases may be used to conveniently assign middleware to routes and groups.
     *
     * @var array
     */
    protected $middlewareAliases = [
        'auth' => \App\Http\Middleware\Authenticate::class,
        'auth.basic' => \Illuminate\Auth\Middleware\AuthenticateWithBasicAuth::class,
        'auth.session' => \Illuminate\Session\Middleware\AuthenticateSession::class,

        'bindings' => \Illuminate\Routing\Middleware\SubstituteBindings::class,
        'bookmark.querystring' => \App\Http\Middleware\PublicUserContentBookmarkQueryString::class,
        'cache.headers' => \Illuminate\Http\Middleware\SetCacheHeaders::class,
        'can' => \Illuminate\Auth\Middleware\Authorize::class,
        'guest' => \App\Http\Middleware\RedirectIfAuthenticated::class,
        'password.confirm' => \Illuminate\Auth\Middleware\RequirePassword::class,
        'signed' => \Illuminate\Routing\Middleware\ValidateSignature::class,
        'throttle' => \Illuminate\Routing\Middleware\ThrottleRequests::class,
        'verified' => \Illuminate\Auth\Middleware\EnsureEmailIsVerified::class,
    ];
}
