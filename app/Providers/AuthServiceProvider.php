<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array
     */
    protected $policies = [
        // 'App\Model' => 'App\Policies\ModelPolicy',
    ];

    /**
     * Register any authentication / authorization services.
     *
     * @return void
     */
    public function boot()
    {
        $this->registerPolicies();

        $defined_permissions = ['use-app', 'edit-metadata', 'upload-files', 'review-songs', 'admin-media', 'admin-master'];

        // define gates for each permission
        foreach ($defined_permissions as $permission) {
            Gate::define($permission, function ($user) use ($permission) {
                return $user->permissions->firstWhere('permission', $permission) !== null;     // check if the specified permission exists in the current User's UserPermissions model
            });
        }
    }
}
