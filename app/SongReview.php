<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Contracts\Auditable;

class SongReview extends Model implements Auditable
{
    use \OwenIt\Auditing\Auditable;
    
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
