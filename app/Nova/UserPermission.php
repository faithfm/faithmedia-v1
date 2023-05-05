<?php

namespace App\Nova;

use App\Repositories\AuthPermissionList;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
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
     * Restrict index query - depending on what permissions the Nova user is allowed to edit
     */
    public static function indexQuery(NovaRequest $request, Builder $query): Builder
    {
        $permissions = AuthPermissionList::getNovaAllowedPermissions();

        return $query->whereIn('permission', $permissions);
    }

    /**
     * Get the fields displayed by the resource.
     */
    public function fields(NovaRequest $request): array
    {
        // Restrict Select (combobox) to only show permissions the Nova user is allowed to edit
        $allowedPermissions = AuthPermissionList::getNovaAllowedPermissions();
        $allowedPermissions = array_combine($allowedPermissions, $allowedPermissions);   // we need an associative array with permissions as both keys AND values

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
