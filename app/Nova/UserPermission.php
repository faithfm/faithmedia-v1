<?php

namespace App\Nova;

use Illuminate\Http\Request;
use Laravel\Nova\Fields\ID;
use Laravel\Nova\Http\Requests\NovaRequest;
use Laravel\Nova\Fields\Text;
use Laravel\Nova\Fields\Select;
use Laravel\Nova\Fields\BelongsTo;
use Laravel\Nova\Fields\KeyValue;
use App\Repositories\AuthPermissionList;

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
     *
     * @param  \Laravel\Nova\Http\Requests\NovaRequest  $request
     * @param  \Illuminate\Database\Eloquent\Builder  $query
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public static function indexQuery(NovaRequest $request, $query)
    {
        $permissions = AuthPermissionList::getNovaAllowedPermissions();
        return $query->whereIn('permission', $permissions);
    }

    /**
     * Get the fields displayed by the resource.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function fields(Request $request)
    {
        // Restrict Select (combobox) to only show permissions the Nova user is allowed to edit
        $allowedPermissions = AuthPermissionList::getNovaAllowedPermissions();
        $allowedPermissions = array_combine($allowedPermissions, $allowedPermissions);   # we need an associative array with permissions as both keys AND values

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

            KeyValue::make('Restrictions')->rules('json'),
            Text::make('Restrictions')->onlyOnIndex(),
        ];
    }

    /**
     * Get the cards available for the request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function cards(Request $request)
    {
        return [];
    }

    /**
     * Get the filters available for the resource.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function filters(Request $request)
    {
        return [];
    }

    /**
     * Get the lenses available for the resource.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function lenses(Request $request)
    {
        return [];
    }

    /**
     * Get the actions available for the resource.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array
     */
    public function actions(Request $request)
    {
        return [];
    }
}
