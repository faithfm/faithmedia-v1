<?php

namespace App\Nova;

use Laravel\Nova\Fields\BelongsTo;
use Laravel\Nova\Fields\Code;
use Laravel\Nova\Fields\ID;
use Laravel\Nova\Fields\Select;
use Laravel\Nova\Http\Requests\NovaRequest;

class UserPermission extends Resource
{
    /**
     * The model the resource corresponds to.
     *
     * @var string
     */
    public static $model = \App\Models\UserPermission::class;

    /**
     * The single value that should be used to represent the resource when being displayed.
     *
     * @var string
     */
    public static $title = 'permission';

    /**
     * The columns that should be searched.
     *
     * @var array
     */
    public static $search = [
        'permission',
        'restrictions',
        'user_id',
    ];

    /**
     * The number of resources to show per page via relationships.
     *
     * @var int
     */
    public static $perPageViaRelationship = 25;

    /**
     * Get the fields displayed by the resource.
     */
    public function fields(NovaRequest $request): array
    {
        // Restrict Select (combobox) to only show permissions the Nova user is allowed to edit
        $user = $request->user();
        $userPermissions = $user->permissions->pluck('permission')->toArray();
        if (in_array('admin-master', $userPermissions)) {
            $allowedPermissions = config('auth.defined_permissions');
        } else {
            $allowedPermissions = array_diff(config('auth.defined_permissions'), ['review-songs', 'review-songs-summary', 'admin-master']);
        }
        return [
            ID::make(__('ID'), 'id')
                ->sortable(),

            BelongsTo::make('User')
                ->sortable(),

            Select::make('Permission')
                ->options($allowedPermissions)     // list of (restricted) permissions
                ->default('use-app')
                ->rules('required')
                ->sortable(),

            Code::make('Restrictions')->json(JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
                ->showOnIndex(),

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
