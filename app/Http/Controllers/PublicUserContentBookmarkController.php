<?php

namespace App\Http\Controllers;

use App\Models\PublicUser;
use App\Models\PublicUserContentBookmark;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

/**
 * NOTE: All controller methods work on records related to a specific PublicUser.
 *
 * Relying on implicit binding, and nested route parameters - see: https://laravel.com/docs/8.x/routing#implicit-binding
 */
class PublicUserContentBookmarkController extends Controller
{
    /**
     * Instantiate a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('auth:api,web');          // require authentication
    }

    /**
     * Display a listing of resources
     *
     * (for the publicUser, sorted with most-recent first)
     *
     * @return \Illuminate\Http\Response
     */
    public function index(PublicUser $publicUser)
    {
        return $publicUser->contentBookmarks()->orderBy('updated_at', 'desc')->get()->pluck('file');
    }

    /**
     * Store a newly created resource in storage.
     *
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request, PublicUser $publicUser)
    {
        Gate::authorize('public-website-api');           // "write" operations require "public-website-api" permission

        $publicUserContentBookmark = PublicUserContentBookmark::firstOrCreate([
            'public_user_id' => $publicUser->id,
            'file' => $request->file,
        ]);

        return $publicUserContentBookmark;
    }

    /**
     * Display the specified resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function show(PublicUser $publicUser, PublicUserContentBookmark $publicUserContentBookmark)
    {
        return $publicUserContentBookmark->only('files');
    }

    /**
     * Update the specified resource in storage.
     *
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, PublicUser $publicUser, PublicUserContentBookmark $publicUserContentBookmark)
    {
        Gate::authorize('public-website-api');           // "write" operations require "public-website-api" permission

        $publicUserContentBookmark->update();            // no updateable fields currently exist - currently a dummy operation

        return $publicUserContentBookmark;
    }

    /**
     * Remove the specified resource from storage.
     *
     * @return \Illuminate\Http\Response
     */
    public function destroy(PublicUser $publicUser, PublicUserContentBookmark $publicUserContentBookmark)
    {
        Gate::authorize('public-website-api');           // "write" operations require "public-website-api" permission

        return $publicUserContentBookmark->delete();
    }
}
