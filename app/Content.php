<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Content extends Model
{
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

    //
}
