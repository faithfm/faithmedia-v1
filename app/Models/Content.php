<?php

namespace App\Models;

use FaithFM\SmartSearch\SmartSearchable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use OwenIt\Auditing\Contracts\Auditable;

class Content extends Model implements Auditable
{
    use \OwenIt\Auditing\Auditable;
    use SmartSearchable;

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
     */
    protected static function booted(): void
    {
        static::addGlobalScope('not3ABN', function (Builder $builder) {
            $builder->where('file', 'NOT LIKE', '3abn%');                       // exclude '3abn' files by default (using global scope)
        });
    }

    //
}
