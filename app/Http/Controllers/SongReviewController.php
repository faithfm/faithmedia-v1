<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use App\Models\SongReview;

class SongReviewController extends Controller
{
    /**
     * Instantiate a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('auth:api,web');          // require authentication
        $this->middleware('can:review-songs');  // song-reviewers only allowed
    }
    
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $songReviews = \App\Models\SongReview::with('user:id,name,email')->get();
        return $songReviews;
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        // NOTE: instead of simple "CREATE" method, I've allowed for CREATE or UPDATE if already exists
        $songReview = SongReview::where('file', $request->file)->where('user_id', $request->user()->id)->first();
        if ($songReview)
            // UPDATE
            $songReview->update($request->only(['rating', 'comments']));
        else {
            // CREATE
            $songReview = SongReview::create([
                'file' => $request->file,
                'user_id' => $request->user()->id,
                'rating' => $request->rating,
                'comments' => $request->comments,
            ]);
        }

        $songReview->load('user:id,name,email');
        return $songReview;
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\SongReview  $songReview
     * @return \Illuminate\Http\Response
     */
    public function show(SongReview $songReview)
    {
        return $songReview;
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\SongReview  $songReview
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, SongReview $songReview)
    {
        $songReview->update($request->only(['rating', 'comments']));
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\SongReview  $songReview
     * @return \Illuminate\Http\Response
     */
    public function destroy(SongReview $songReview)
    {
        $songReview->delete();
    }
}
