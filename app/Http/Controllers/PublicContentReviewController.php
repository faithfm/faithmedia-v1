<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use App\Models\PublicContentReview;
use App\Models\PublicUser;

class PublicContentReviewController extends Controller
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
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return PublicContentReview::get();
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        Gate::authorize('public-website-api');           // "write" operations require "public-website-api" permission

        // NOTE: instead of simple "CREATE" method, I've allowed for CREATE or UPDATE if already exists
        $publicUser = PublicUser::firstOrCreate(['sub' => $request->sub]);
        $publicContentReview = PublicContentReview::where('file', $request->file)->where('user_id', $publicUser->id)->first();
        if ($publicContentReview)
            // UPDATE
            $publicContentReview->update($request->only(['rating']));
        else {
            // CREATE
            $publicContentReview = PublicContentReview::create([
                'file' => $request->file,
                'user_id' => $publicUser->id,
                'rating' => $request->rating,
            ]);
        }

        return $publicContentReview;
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\PublicContentReview  $publicContentReview
     * @return \Illuminate\Http\Response
     */
    public function show(PublicContentReview $publicContentReview)
    {
        return $publicContentReview;
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\PublicContentReview  $publicContentReview
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, PublicContentReview $publicContentReview)
    {
        Gate::authorize('public-website-api');           // "write" operations require "public-website-api" permission
        $publicContentReview->update($request->only(['rating']));
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\PublicContentReview  $publicContentReview
     * @return \Illuminate\Http\Response
     */
    public function destroy(PublicContentReview $publicContentReview)
    {
        Gate::authorize('public-website-api');           // "write" operations require "public-website-api" permission
        $publicContentReview->delete();
    }
}
