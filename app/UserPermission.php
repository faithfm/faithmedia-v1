<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class UserPermission extends Model
{
    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'user_id', 'permission', 'restrictions',
    ];

    /**
     * Get the user that owns the permissions.
     */
    public function user()
    {
        return $this->belongsTo('App\User');
    }
}
