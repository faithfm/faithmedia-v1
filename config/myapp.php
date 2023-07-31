<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Media Download Base URLs
    |--------------------------------------------------------------------------
    |
    | These URLs are use by the media player to determine the location of
    | the different types of media files.
    |
    */

    'media_download_base' => [
        'ogg' => env('MEDIA_DOWNLOAD_BASE_OGG', 'http://content.mediaserver.com/'),
        'mp3' => env('MEDIA_DOWNLOAD_BASE_MP3', 'http://content96k.mediaserver.com/'),
        'orig' => env('MEDIA_DOWNLOAD_BASE_ORIG', 'http://content.mediaserver.com/'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Sample rates for New Relic traces
    |--------------------------------------------------------------------------
    |
    */
    'nr_sample_rate' => [
        'pubusers' =>env('NR_SAMPLE_RATE_PUBUSERS', 0.01),
    ],



];
