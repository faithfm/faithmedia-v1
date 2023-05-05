<?php

namespace App\Http\Controllers;

use App\Models\PublicUser;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class PublicUserController extends Controller
{
    /**
     * Instantiate a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('auth.patched:api_guard,web_guard');          // require authentication
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return PublicUser::get();
    }

    /**
     * Store a newly created resource in storage.
     *
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        Gate::authorize('public-website-api');           // "write" operations require "public-website-api" permission

        // validate request
        $validatedData = $request->validate([
            'sub' => 'required',
            'user_id' => 'nullable',
            'name' => 'nullable',
            'email' => 'nullable',
            'nickname' => 'nullable',
            'picture' => 'nullable',
            'church_name' => 'nullable',
            'phone' => 'nullable',
            'listen_time_seconds' => 'nullable|integer',
            'analytics_uid' => 'nullable',
            'badges' => 'nullable',
            'site_id' => 'nullable',
            'site_search' => 'nullable',
            'timezone_type' => 'nullable',
            'user_timezone_offset' => 'nullable|integer',
        ]);

        // NOTE: instead of simple "CREATE" method, I've allowed for CREATE or UPDATE if already exists
        $publicUser = PublicUser::where('sub', $request->sub)->first();
        if ($publicUser) {
            $publicUser->update($validatedData);
        }                  // UPDATE
        else {
            $publicUser = PublicUser::create($validatedData);     // CREATE
        }

        return $publicUser;
    }

    /**
     * Display the specified resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function show(PublicUser $publicUser)
    {
        return $publicUser;
    }

    /**
     * Update the specified resource in storage.
     *
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, PublicUser $publicUser)
    {
        Gate::authorize('public-website-api');           // "write" operations require "public-website-api" permission
        $publicUser->update($request->only(['rating']));
    }

    /**
     * Remove the specified resource from storage.
     *
     * @return \Illuminate\Http\Response
     */
    public function destroy(PublicUser $publicUser)
    {
        Gate::authorize('public-website-api');           // "write" operations require "public-website-api" permission
        $publicUser->delete();
    }
}
