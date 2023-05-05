<?php

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PrefiltersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run(): void
    {
        DB::table('prefilters')->insert([
            ['slug' => 'all-content',             'name' => 'Entire Media Library',       'filter' => ''],
            ['slug' => 'music-all',               'name' => 'Entire Music Library',       'filter' => 'file:music/v2/*'],
            ['slug' => 'music-currentrotation',   'name' => 'Current Song Rotation',      'filter' => 'file:music/v2/* -tags:pending -tags:rejected 2020-'],
            ['slug' => 'music-approved',          'name' => 'Music Library (Approved)',   'filter' => 'file:music/v2/* -tags:pending -tags:rejected'],
            ['slug' => 'music-pending',           'name' => 'Music - Pending Approval',   'filter' => 'file:music/v2/* tags:pending'],
            ['slug' => 'music-rejected',          'name' => 'Music - Rejected',           'filter' => 'file:music/v2/* tags:rejected'],
            ['slug' => 'drivetime',               'name' => 'SA Drivetime Show',          'filter' => 'file:sa/drive/'],
            ['slug' => 'breakfast',               'name' => 'NNSW Breakfast Show 2020',   'filter' => 'file:nnsw/breakfast/2020'],
        ]);
        $this->command->info('Prefilters table seeded!');
    }
}
