<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Contracts\Auditable;

class PublicUser extends Model implements Auditable
{
    use \OwenIt\Auditing\Auditable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'sub', 'user_id', 'name', 'email', 'nickname', 'picture', 'church_name', 'phone', 'listen_time_seconds', 'analytics_uid', 'badges', 'site_id', 'site_search', 'timezone_type', 'user_timezone_offset',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'badges' => 'json',
        'site_search' => 'json',
    ];

}
