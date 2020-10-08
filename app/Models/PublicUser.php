<?php

namespace App\Models;

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

    /**
     * Get the content bookmarks for this user.
     */
    public function contentBookmarks() {
        return $this->hasMany('App\Models\PublicUserContentBookmark');
    }

    /**
     * Ditto.  (Alias for the preferred shorter version - using proper naming conventions)
     *
     * Required by Laravel when using implicit binding of nested route parameters - see: https://laravel.com/docs/8.x/routing#implicit-model-binding-scoping
     */
    public function publicUserContentBookmarks() {
        return $this->contentBookmarks();
    }

    /**
     * Retrieve the model for a bound value.
     *
     * See: https://laravel.com/docs/8.x/routing#explicit-binding
     *
     * @param  mixed  $value
     * @param  string|null  $field
     * @return \Illuminate\Database\Eloquent\Model|null
     */
    public function resolveRouteBinding($value, $field = null)
    {
        // lookup by 'id' vs 'sub' - depending on whether the value is an integer (or a string by implication)
        $lookupField = is_numeric($value) ? 'id' : 'sub';

        return $this->where($lookupField, $value)->firstOrFail();
    }

}
