<?php

namespace App\Http\Controllers;

use App\Models\SongReviewSummary;
use Illuminate\Http\Request;

class SongReviewSummaryController extends Controller
{
    /**
     * Instantiate a new controller instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('auth:api,web');      // require authentication
        $this->middleware('can:review-songs-summary');  // song-reviewers only allowed
    }

    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        $songReviewsSummary = SongReviewSummary::all();
        return $songReviewsSummary;
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
        $songReviewSummary = SongReviewSummary::where('file', $request->file)->first();
        if ($songReviewSummary)
            // UPDATE
            $songReviewSummary->update($request->only(['status', 'source', 'comment']));
        else {
            // CREATE
            $songReviewSummary = SongReviewSummary::create([
                'file' => $request->file,
                'status' => $request->status,
                'source' => $request->source,
                'comment' => $request->comment,
            ]);
        }
        return $songReviewSummary;
    }

    /**
     * Display the specified resource.
     *
     * @param  App\Models\SongReviewSummary $songReviewSummary
     * @return \Illuminate\Http\Response
     */
    public function show(SongReviewSummary $songReviewSummary)
    {
        return $songReviewSummary;
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  App\Models\SongReviewSummary $songReviewSummary
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, SongReviewSummary $songReviewSummary)
    {
        $songReviewSummary->update($request->only(['status', 'source', 'comment']));
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  App\Models\SongReviewSummary 
     * @return \Illuminate\Http\Response
     */
    public function destroy(SongReviewSummary $songReviewSummary)
    {
        $songReviewSummary->delete();
    }
}
