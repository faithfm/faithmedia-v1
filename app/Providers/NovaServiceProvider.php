<?php

namespace App\Providers;

use App\Nova\Dashboards\Main;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Laravel\Nova\Cards\Help;
use Laravel\Nova\Menu\Menu;
use Laravel\Nova\Menu\MenuItem;
use Laravel\Nova\Nova;
use Laravel\Nova\NovaApplicationServiceProvider;

class NovaServiceProvider extends NovaApplicationServiceProvider
{
    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        parent::boot();

        // Unfortunately, Nova 4 lost the ability to detect the browser timezone.  We have temporarily created a global environment variable but may want to add an option in the User Model in the future.  See: https://nova.laravel.com/docs/4.0/resources/date-fields.html#timezones
        Nova::userTimezone(function (Request $request) {
            //return $request->user()->timezone;
            return config('myapp.nova_default_timezone');
        });

        Nova::mainMenu(function (Request $request, Menu $menu) {
            return $menu
                ->prepend(
                    MenuItem::externalLink('Back to '.config('app.name'), config('app.url'))
                );
        });
    }

    /**
     * Register the Nova routes.
     */
    protected function routes(): void
    {
        Nova::routes()
            ->withAuthenticationRoutes()
            ->withPasswordResetRoutes()
            ->register();
    }

    /**
     * Register the Nova gate.
     *
     * This gate determines who can access Nova in non-local environments.
     */
    protected function gate(): void
    {
        Gate::define('viewNova', function ($user) {
            return Gate::any(['admin-media', 'admin-master']);
        });
    }

    /**
     * Get the cards that should be displayed on the default Nova dashboard.
     */
    protected function cards(): array
    {
        return [
            new Help,
        ];
    }

    /**
     * Get the extra dashboards that should be displayed on the Nova dashboard.
     */
    protected function dashboards(): array
    {
        return [
            new Main,
        ];
    }

    /**
     * Get the tools that should be listed in the Nova sidebar.
     */
    public function tools(): array
    {
        return [];
    }

    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }
}
