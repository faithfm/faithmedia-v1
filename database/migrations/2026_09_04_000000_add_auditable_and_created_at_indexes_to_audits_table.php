<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Add the two indexes the audits table has always been missing.
 *
 * The package's stock migration creates an (auditable_type, auditable_id) index; our
 * 2020 migration only created (user_id, user_type). Without the auditable index every
 * $model->audits() call - and any per-model audit threshold - is a full-table scan,
 * and without created_at nothing can prune by date.
 *
 * Idempotent: on production these indexes were created on the empty replacement table
 * during the September 2026 swap-table prune, so this must be safe to run before or
 * after that (and on a fresh database).
 */
return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('audits', function (Blueprint $table) {
            if (! Schema::hasIndex('audits', ['auditable_type', 'auditable_id'])) {
                $table->index(['auditable_type', 'auditable_id']);
            }
            if (! Schema::hasIndex('audits', ['created_at'])) {
                $table->index('created_at');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('audits', function (Blueprint $table) {
            if (Schema::hasIndex('audits', ['auditable_type', 'auditable_id'])) {
                $table->dropIndex(['auditable_type', 'auditable_id']);
            }
            if (Schema::hasIndex('audits', ['created_at'])) {
                $table->dropIndex(['created_at']);
            }
        });
    }
};
