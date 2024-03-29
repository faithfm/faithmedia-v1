<?php

namespace App\Http\Middleware;

use App\Models\PublicUserContentBookmark;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class PublicUserContentBookmarkQueryString
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $publicUser = [];
        // lookup PublicUserContentBookmark using 'file' query string argument (if present)
        if ($request->filled('file')) {
            $publicUserContentBookmark = $request->publicUser->contentBookmarks()->where('file', $request->file)->firstOrFail();
            $request->route()->setParameter('publicUserContentBookmark', $publicUserContentBookmark);
        //$request->merge(['publicUserContentBookmark' => $publicUserContentBookmark]);
        }

        // lookup PublicUserContentBookmark using 'id' query string argument (if present)
        elseif ($request->filled('id')) {
            $publicUserContentBookmark = PublicUserContentBookmark::where('id', $request->id)->firstOrFail();
            $request->merge(['publicUserContentBookmark' => $publicUserContentBookmark]);
        }

        return $next($request);
    }
}
