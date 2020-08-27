<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePublicContentReviewsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('public_content_reviews', function (Blueprint $table) {
            $table->id();
            $table->string('file');
            $table->unsignedBigInteger('user_id');
            $table->string('rating')->nullable();
            $table->text('comments')->nullable();
            $table->timestamps();
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
        Schema::dropIfExists('public_content_reviews');
    }
}
