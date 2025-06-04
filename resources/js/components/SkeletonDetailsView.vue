<template>
  <div class="skeleton-details-view">
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

    <!-- Table Skeleton -->
    <div class="table-wrapper">
      <v-table>
        <thead>
          <tr>
            <th>File</th>
            <th>Series</th>
            <th>Content</th>
            <th>Guests</th>
            <th>Tags</th>
            <th>Duration</th>
            <th v-if="mode === 'search'">Path</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="i in rowCount" :key="`row-${i}`" class="skeleton-row">
            <td>
              <v-skeleton-loader type="text" width="80%"></v-skeleton-loader>
            </td>
            <td>
              <v-skeleton-loader type="text" width="70%"></v-skeleton-loader>
            </td>
            <td>
              <v-skeleton-loader type="text" width="90%"></v-skeleton-loader>
            </td>
            <td>
              <v-skeleton-loader type="text" width="60%"></v-skeleton-loader>
            </td>
            <td>
              <v-skeleton-loader type="text" width="50%"></v-skeleton-loader>
            </td>
            <td>
              <v-skeleton-loader type="text" width="40px"></v-skeleton-loader>
            </td>
            <td v-if="mode === 'search'">
              <v-skeleton-loader type="text" width="80%"></v-skeleton-loader>
            </td>
          </tr>
        </tbody>
      </v-table>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  mode: 'search' | 'folder'
  rowCount?: number
  folderCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  rowCount: 10,
  folderCount: 3
})
</script>

<style scoped>
.table-wrapper {
  overflow-x: auto;
  width: 100%;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  background: white;
}

.v-table {
  border-collapse: separate;
  border-spacing: 0;
}

.v-table thead {
  position: sticky;
  top: 0;
  z-index: 2;
  background: white;
}

.v-table th {
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.5px;
  padding: 12px 16px;
  border-bottom: 2px solid rgba(0,0,0,0.1);
}

.v-table td {
  padding: 12px 16px;
  border-bottom: 1px solid rgba(0,0,0,0.05);
}

.skeleton-row:nth-child(odd) {
  background-color: rgba(0,0,0,0.02);
}
</style>
