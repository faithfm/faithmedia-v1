<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * This data is consumed by the frontend useSharedData composable.
     *
     * @see https://inertiajs.com/shared-data
     * @see resources/js/composables/useSharedData.ts - Frontend composable that consumes this data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        try {
            $user = auth()->user();
        } catch (\Throwable $th) {
            $user = null;
        }

        $x = [
            'sharedData' => [
                'user' => $user,
                'guest' => auth()->guest(),
                'csrf-token' => csrf_token(),
                'config' => [
                    'name' => config('app.name'),
                    'url' => config('app.url'),
                    'media_download_base' => config('myapp.media_download_base'),
                ],
            ],
            // Add automatic validation error sharing
            'errors' => $request->session()->get('errors')?->getBag('default')->getMessages() ?: (object) [],
        ];

        return array_merge(parent::share($request), $x);
    }
}
