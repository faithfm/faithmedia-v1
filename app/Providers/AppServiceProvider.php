<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        // Bind the Auth0UserRepository Contract and our CustomUserRepository implementation of this (descended from the baseline Auth0\Login\Repository\Auth0UserRepository implementation)
        // Note:  Our CustomUserRepository provides database persistence (combining Auth0 data with the Users Eloquent model).
        $this->app->bind(
            \Auth0\Login\Contract\Auth0UserRepository::class,   // 
            \App\Repositories\CustomUserRepository::class       // 
                                                                // 
        );
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        //
    }
}
