<?php

namespace App;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

class Content extends Model
{
    /**
     * The primary key associated with the table.
     *
     * @var string
     */
    protected $primaryKey = 'file';

    /**
     * Indicates if the IDs are auto-incrementing.
     *
     * @var bool
     */
    public $incrementing = false;

    /**
     * The "type" of the primary key.
     *
     * @var string
     */
    protected $keyType = 'string';

    const CREATED_AT = 'created_at';        // probably redundent - we added this to our legacy table
    const UPDATED_AT = 'tstamp';            // our legacy table is currently using 'tstamp' instaad of 'update_at' field name.

    /**
     * The connection name for the model.
     *
     * @var string
     */
    protected $connection = 'sched';

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'content';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'file', 'series', 'numbers', 'content', 'guests', 'tags', 'bytes', 'seconds', 'md5', 'bestdate', 'podcastdate', 'source', 'ref',
    ];

    /**
     * The "booted" method of the model.
     *
     * @return void
     */
    protected static function booted()
    {
        static::addGlobalScope('not3ABN', function (Builder $builder) {
            $builder->where('file', 'NOT LIKE', '3abn%');                       // exclude '3abn' files by default (using global scope)
        });
    }

    //
}
