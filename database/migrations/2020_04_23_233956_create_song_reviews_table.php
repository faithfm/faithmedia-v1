<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateSongReviewsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('song_reviews', function (Blueprint $table) {
            $table->id();
            $table->string('file');
            $table->unsignedBigInteger('user_id');
            $table->string('rating')->nullable();
            $table->text('comments')->nullable();
            $table->timestamps();
            // $table->primary('id');
            $table->unique(['file', 'user_id']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('song_reviews');
    }
}
