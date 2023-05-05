<?php

namespace App\Http\Controllers;

use App\Models\Content;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class ContentController extends Controller
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
        return \App\Models\Content::get();
    }

    /**
     * Store a newly created resource in storage.
     *
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        // NOTE: instead of simple "CREATE" method, I've allowed for CREATE or UPDATE if already exists
        Gate::authorize('edit-content');  // metadata editors only allowed
        $content = Content::where('file', $request->file)->first();
        if ($content) {
            // UPDATE
            $content->update($request->only(['series', 'numbers', 'content', 'guests', 'tags', 'bytes', 'seconds', 'md5', 'bestdate', 'podcastdate', 'source', 'ref']));
        } else {
            // CREATE
            $content = Content::create([
                'file' => $request->file,
                'series' => $request->series,
                'numbers' => $request->numbers,
                'content' => $request->content,
                'guests' => $request->guests,
                'tags' => $request->tags,
                'bytes' => $request->bytes,
                'seconds' => $request->seconds,
                'md5' => $request->md5,
                'bestdate' => $request->bestdate,
                'podcastdate' => $request->podcastdate,
                'source' => $request->source,
                'ref' => $request->ref,
            ]);
        }

        $content = $content->fresh();   // reload from database - since table triggers may have modified what we tried to write

        return $content;
    }

    // /**
    //  * Display the specified resource.
    //  *
    //  * @param  \App\Models\Content  $content
    //  * @return \Illuminate\Http\Response
    //  */
    // public function show(Content $content)
    // {
    //     return $content;
    // }

    // /**
    //  * Update the specified resource in storage.
    //  *
    //  * @param  \Illuminate\Http\Request  $request
    //  * @param  \App\Models\Content  $content
    //  * @return \Illuminate\Http\Response
    //  */
    // public function update(Request $request, Content $content)
    // {
    //     $content->update($request->only(['rating', 'comments']));
    // }

    // /**
    //  * Remove the specified resource from storage.
    //  *
    //  * @param  \App\Models\Content  $content
    //  * @return \Illuminate\Http\Response
    //  */
    // public function destroy(Content $content)
    // {
    //     $content->delete();
    // }
}
