<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Contracts\Auditable;

class PublicUserBadges extends Model implements Auditable
{
    use \OwenIt\Auditing\Auditable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'user_id', 'name', 'status',
    ];

    /**
     * Get the user that owns the public content review.
     */
    public function user()
    {
        return $this->belongsTo('App\Models\PublicUser');
    }
}
