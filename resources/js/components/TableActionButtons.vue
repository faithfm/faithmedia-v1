<template>
  <div class="d-flex justify-center">
    <v-tooltip text="Play this item">
      <template v-slot:activator="{ props }">
        <v-btn 
          icon="mdi-play" 
          size="small" 
          variant="text" 
          @click.stop="$emit('play', item)"
          class="mr-1 action-btn" 
          :aria-label="`Play ${getFileName(item.file)}`" 
          v-bind="props"
        />
      </template>
    </v-tooltip>
    <v-tooltip text="More options">
      <template v-slot:activator="{ props }">
        <v-btn 
          icon="mdi-dots-vertical" 
          size="small" 
          variant="text" 
          @click.stop="$emit('menu', item)"
          class="action-btn" 
          :aria-label="`More options for ${getFileName(item.file)}`"
          v-bind="props"
        />
      </template>
    </v-tooltip>
  </div>
</template>

<script setup lang="ts">
import type { Content } from '@/types/models'

interface Props {
  item: Content
  getFileName: (file: string) => string
}

defineProps<Props>()

defineEmits<{
  play: [item: Content]
  menu: [item: Content]
}>()
</script>

<style scoped>
.action-btn:hover {
  background-color: rgba(var(--v-theme-primary), 0.08);
}
</style>
