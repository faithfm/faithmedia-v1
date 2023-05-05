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
        Schema::create('public_user_content_bookmarks', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('public_user_id');
            $table->string('file');
            $table->timestamps();
            $table->unique(['public_user_id', 'file']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('public_user_content_bookmarks');
    }
};
