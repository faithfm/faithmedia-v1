<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use App\Models\PublicUserContentBookmark;
use App\Models\PublicUser;

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
     * @param \App\Models\PublicUser $publicUser
     * @return \Illuminate\Http\Response
     */
    public function index(PublicUser $publicUser)
    {
        return $publicUser->contentBookmarks()->orderBy('updated_at', 'desc')->get();
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\PublicUser  $publicUser
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request, PublicUser $publicUser)
    {
        Gate::authorize('public-website-api');           // "write" operations require "public-website-api" permission

        // $publicUser = PublicUser::firstOrCreate(['sub' => $request->sub]);
        $publicUserContentBookmark = PublicUserContentBookmark::firstOrCreate([
            'public_user_id' => $publicUser->id,
            'file' => $request->file,
        ]);

        return $publicUserContentBookmark;
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\PublicUser  $publicUser
     * @param  \App\Models\PublicUserContentBookmark  $publicUserContentBookmark
     * @return \Illuminate\Http\Response
     */
    public function show(PublicUser $publicUser, PublicUserContentBookmark $publicUserContentBookmark)
    {
        return $publicUserContentBookmark;
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\PublicUser  $publicUser
     * @param  \App\Models\PublicUserContentBookmark  $publicUserContentBookmark
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
     * @param  \App\Models\PublicUser  $publicUser
     * @param  \App\Models\PublicUserContentReview  $publicUserContentBookmark
     * @return \Illuminate\Http\Response
     */
    public function destroy(PublicUser $publicUser, PublicUserContentBookmark $publicUserContentBookmark)
    {
        Gate::authorize('public-website-api');           // "write" operations require "public-website-api" permission

        return $publicUserContentBookmark->delete();
    }
}
