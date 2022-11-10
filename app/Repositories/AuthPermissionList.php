<?php
/**
 * This file was templated from the "laravel-auth0-pattern" composer package.
 * It should be updated with your own list of permissions used by your application.
 * See: https://github.com/faithfm/laravel-auth0-pattern for more details.
 */

namespace App\Repositories;

use Illuminate\Support\Arr;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Gate;

class AuthPermissionList
{
    /**
     * The list of permissions recognised by the application 
     * (as applied from the 'user_permissions' table)
     *
     * Gates are automatically created for all permissions defined here.
     * See: Auth0PatternServiceProvider
     *
     * @var array
     */
    public const DEFINED_PERMISSIONS = [
        'use-app',                  // minimum permission to use the app
        'edit-content',             // content metadata editor
        'upload-files',             // file upload permission
        'public-website-api',       // special API access (used by public website)
        'review-songs',             // 'admin-media'-restricted permission
        'review-songs-summary',     // 'admin-media'-restricted permission
        'admin-master',             // MASTER admin privilege - also an 'admin-media'-restricted permission
        'admin-media',              // lower-level administrator access... can do most things but CAN'T view/edit permissions:  'admin-master', 'review-songs', 'review-songs-summary'
    ];

    /**
     * The list of permissions visible in our Nova admin interface
     *
     * Note: high-level permissions should not be visible or editable UNLESS user has 'admin-master' permission
     */
    public static function getNovaAllowedPermissions() {
        if (Gate::allows('admin-master')) {
            // unfiltered access for 'admin-master' users
            return static::DEFINED_PERMISSIONS;
        } else {
            // restricted access for other admins
            return Arr::where(static::DEFINED_PERMISSIONS, function ($value, $key) {
                return !(in_array($value, [
                    'review-songs',
                    'review-songs-summary',
                    'admin-master',
                ]));
        });
    }
}

}
