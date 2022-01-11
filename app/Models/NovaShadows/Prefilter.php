<?php

namespace App\Models\NovaShadows;

use App\Models\Prefilter as PrefilterOriginal;

class Prefilter extends PrefilterOriginal
{
    /**
     * Use shadow id instead of primary key for Nova Resources Logic.
     * https://github.com/laravel/nova-issues/issues/478
     *
     * @var string
     */
    protected $primaryKey = 'id';

    /**
     * Indicates if the IDs are auto-incrementing.
     * (TRUE for shadow-ID primary key)
     *
     * @var bool
     */
    public $incrementing = true;

}
