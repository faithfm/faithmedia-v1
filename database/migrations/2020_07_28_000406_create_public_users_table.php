<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePublicUsersTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('public_users', function (Blueprint $table) {
            $table->id();
            $table->string('sub')->nullable()->unique();
            $table->string('user_id')->nullable();
            $table->string('name')->nullable()->default('');
            $table->string('email')->nullable()->default('');
            $table->string('nickname')->nullable();
            $table->string('picture', 1000)->nullable();
            $table->string('church_name')->nullable();
            $table->string('phone')->nullable();
            $table->bigInteger('listen_time_seconds')->nullable();
            $table->string('analytics_uid', 100)->nullable();
            $table->string('badges', 1000)->nullable();
            $table->string('site_id', 10)->nullable();
            $table->string('site_search', 1000)->nullable();
            $table->string('timezone_type', 20)->nullable();
            $table->integer('user_timezone_offset')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('public_users');
    }
}
