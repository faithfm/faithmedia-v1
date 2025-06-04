<template>
  <div class="skeleton-playlist-view">
    <!-- Breadcrumb Skeleton (only in folder mode) -->
    <div v-if="mode === 'folder'" class="d-flex align-center mb-4">
      <v-skeleton-loader
        type="button"
        width="40"
        class="mr-2"
      ></v-skeleton-loader>
      <v-skeleton-loader
        type="text"
        width="60%"
      ></v-skeleton-loader>
    </div>

    <!-- Folder List Skeleton (only in folder mode) -->
    <div v-if="mode === 'folder'" class="mb-4">
      <v-skeleton-loader
        v-for="i in folderCount"
        :key="`folder-${i}`"
        type="list-item-avatar"
        class="mb-2"
      ></v-skeleton-loader>
    </div>

    <!-- Card Grid Skeleton -->
    <v-row class="card-grid">
      <v-col v-for="i in cardCount" :key="`card-${i}`" cols="12" md="6" lg="4">
        <v-skeleton-loader
          type="card"
          class="skeleton-card"
        ></v-skeleton-loader>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
interface Props {
  mode: 'search' | 'folder'
  cardCount?: number
  folderCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  cardCount: 9,
  folderCount: 3
})
</script>

<style scoped>
.card-grid {
  margin: 0 -8px;
}

.skeleton-card {
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 16px;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .skeleton-card {
    margin-bottom: 12px;
  }
}
</style>
