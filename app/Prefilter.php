<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Prefilter extends Model
{
     /**
     * The primary key associated with the table.
     *
     * @var string
     */
    protected $primaryKey = 'slug';
    /**
     * Indicates if the IDs are auto-incrementing.
     *
     * @var bool
     */
    public $incrementing = false;
    /**
     * The "type" of the auto-incrementing ID.
     *
     * @var string
     */
    protected $keyType = 'string';
}
