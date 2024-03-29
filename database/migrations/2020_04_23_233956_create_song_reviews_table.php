<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
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
     */
    public function down(): void
    {
        Schema::dropIfExists('song_reviews');
    }
};
