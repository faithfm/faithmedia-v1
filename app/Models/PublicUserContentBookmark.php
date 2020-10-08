<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Contracts\Auditable;

class PublicUserContentBookmark extends Model implements Auditable
{
    use \OwenIt\Auditing\Auditable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'public_user_id', 'file',
    ];

    /**
     * Get the user that owns the public content review.
     */
    public function public_user()
    {
        return $this->belongsTo('App\Models\PublicUser');
    }
}
