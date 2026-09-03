<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PublicUserBadges extends Model
{
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
        return $this->belongsTo(\App\Models\PublicUser::class);
    }
}
