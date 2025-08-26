<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContentDefaults extends Model
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
    protected $table = 'content_defaults';

    /**
     * Indicates if the model should be timestamped.
     *
     * @var bool
     */
    public $timestamps = false;

    /**
     * The attributes that aren't mass assignable.
     * Using guarded instead of fillable to be more flexible with unknown columns.
     *
     * @var array
     */
    protected $guarded = [];

    /**
     * Get content defaults that match a given file pattern.
     *
     * @param string $file
     * @return \Illuminate\Database\Eloquent\Collection
     */
    public static function getMatchingDefaults(string $file)
    {
        return static::whereRaw('? LIKE file_pattern', [$file])->get();
    }

    /**
     * Get forced fields for a specific file.
     * This method dynamically checks for any *_force fields in the model.
     *
     * @param string $file
     * @return array
     */
    public static function getForcedFields(string $file): array
    {
        $defaults = static::getMatchingDefaults($file);
        
        $forcedFields = [];
        foreach ($defaults as $default) {
            // Dynamically check all attributes that end with '_force'
            foreach ($default->getAttributes() as $attribute => $value) {
                if (str_ends_with($attribute, '_force') && !empty($value)) {
                    // Extract field name by removing '_force' suffix
                    $fieldName = str_replace('_force', '', $attribute);
                    $forcedFields[] = $fieldName;
                }
            }
        }

        return array_unique($forcedFields);
    }
}
