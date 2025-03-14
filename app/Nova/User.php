<?php

namespace App\Nova;

use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Laravel\Nova\Fields\Gravatar;
use Laravel\Nova\Fields\HasMany;
use Laravel\Nova\Fields\ID;
use Laravel\Nova\Fields\Line;
use Laravel\Nova\Fields\Stack;
use Laravel\Nova\Fields\Text;
use Laravel\Nova\Http\Requests\NovaRequest;

class User extends Resource
{
    /**
     * The model the resource corresponds to.
     *
     * @var string
     */
    public static $model = \App\Models\User::class;

    /**
     * The single value that should be used to represent the resource when being displayed.
     *
     * @var string
     */
    public static $title = 'name';

    /**
     * The columns that should be searched.
     *
     * @var array
     */
    public static $search = [
        'id', 'name', 'email',
    ];

    /**
     * Get the fields displayed by the resource.
     */
    public function fields(NovaRequest $request): array
    {
        return [
            ID::make(__('ID'), 'id')
                ->sortable(),

            Gravatar::make()
                ->maxWidth(50)
                ->hideFromIndex(),

            Text::make('Name')
                ->sortable()
                ->rules('required', 'max:255')
                ->hideFromIndex(),

            Stack::make('Name / Email', [
                Line::make('Name')
                    ->sortable()
                    ->rules('required', 'max:255')
                    ->asHeading(),

                Text::make('Email')
                    ->sortable()
                    ->rules('required', 'email', 'max:254')
                    ->creationRules('unique:users,email')
                    ->updateRules('unique:users,email,{{resourceId}}'),
            ]),

            // (On the index only...) Show user permissions as a comma-separated list (using a computed text field)
            Text::make('User Permissions', function ($request) {
                //sort-order from allowed-permission list
                $permissionSortOrder = array_flip(config('auth.defined_permissions'));

                // sort the user's permission based on this standardised sort-order
                $sortedPermissions = $this->permissions->sort(function ($a, $b) use ($permissionSortOrder) {
                    // lookup order for each permission (assume 99 if permission not in allowed-permission list)
                    $aOrder = $permissionSortOrder[$a->permission] ?? 99;
                    $bOrder = $permissionSortOrder[$b->permission] ?? 99;

                    return ($aOrder < $bOrder) ? -1 : 1;
                });
                // convert UserPermission model to an array of permission names... with square-brackets around [permissions] that are restricted in some way
                $perms = $sortedPermissions->map(function ($perm) {
                    $name = $perm->permission;
                    if ($perm->restrictions != null) {
                        $name = "[$name]";
                    }

                    return $name;
                });
                // convert array to comma-separated text
                $perms = $perms->implode(', ');
                // limit its length for displayability
                return Str::limit($perms, 60);
            })->onlyOnIndex(),

            Text::make('Sub')
                ->sortable()
                ->rules('required')
                ->hideFromIndex(),

            Stack::make('Sub / API Token', [
                Line::make('Sub')
                    ->sortable()
                    ->rules('required')
                    ->readonly()
                    ->onlyOnIndex()
                    ->asSmall()
                    ->displayUsing(function ($sub) {
                        return Str::limit($sub, 30);
                    }),

                Line::make('API Token')
                    ->sortable()
                    ->asSmall(),
            ]),

            HasMany::make('UserPermission', 'permissions'),

        ];
    }

    /**
     * Get the cards available for the request.
     */
    public function cards(NovaRequest $request): array
    {
        return [];
    }

    /**
     * Get the filters available for the resource.
     */
    public function filters(NovaRequest $request): array
    {
        return [];
    }

    /**
     * Get the lenses available for the resource.
     */
    public function lenses(NovaRequest $request): array
    {
        return [];
    }

    /**
     * Get the actions available for the resource.
     */
    public function actions(NovaRequest $request): array
    {
        return [];
    }
}
