<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Contracts\Auditable;

class SongReviewSummary extends Model implements Auditable
{
    use \OwenIt\Auditing\Auditable;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'song_review_summary';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'file', 'source', 'status', 'comment',
    ];
}
