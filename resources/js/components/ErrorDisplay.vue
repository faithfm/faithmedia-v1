<template>
  <div class="error-display">
    <v-alert
      :type="severity"
      :title="title"
      :text="message"
      :closable="dismissible"
      class="mb-4"
      variant="tonal"
      :icon="icon"
    >
      <div class="d-flex flex-column">
        <div v-if="details" class="error-details mt-2">
          <v-btn
            variant="text"
            size="small"
            color="error"
            @click="showDetails = !showDetails"
            class="px-0"
          >
            {{ showDetails ? 'Hide Details' : 'Show Details' }}
          </v-btn>
          <pre v-if="showDetails" class="error-stack mt-2 pa-2">{{ details }}</pre>
        </div>
        
        <div v-if="retryable" class="mt-3">
          <v-btn
            variant="outlined"
            color="error"
            size="small"
            @click="$emit('retry')"
            :loading="retrying"
            :disabled="retrying"
          >
            <v-icon start>mdi-refresh</v-icon>
            Retry
          </v-btn>
        </div>
      </div>
    </v-alert>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  title?: string
  message: string
  details?: string
  severity?: 'error' | 'warning' | 'info'
  dismissible?: boolean
  retryable?: boolean
  retrying?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Error',
  severity: 'error',
  dismissible: false,
  retryable: false,
  retrying: false
})

const emit = defineEmits<{
  (e: 'retry'): void
  (e: 'dismiss'): void
}>()

const showDetails = ref(false)

const icon = computed(() => {
  switch (props.severity) {
    case 'error':
      return 'mdi-alert-circle'
    case 'warning':
      return 'mdi-alert'
    case 'info':
      return 'mdi-information'
    default:
      return 'mdi-alert-circle'
  }
})
</script>

<style scoped>
.error-stack {
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.85rem;
  white-space: pre-wrap;
  overflow-x: auto;
  max-height: 200px;
  overflow-y: auto;
}
</style>
