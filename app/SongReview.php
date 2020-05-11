<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class SongReview extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'file', 'user_id', 'rating', 'comments',
    ];

    /**
     * Get the user that owns the song review.
     */
    public function user()
    {
        return $this->belongsTo('App\User');
    }
}
