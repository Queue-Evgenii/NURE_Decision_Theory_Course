<script setup lang="ts">
import type { Alternative } from '@/models/Alternative';

defineProps({
  alternatives: {
    type: Array as () => ReadonlyArray<Alternative>,
    required: true,
  },
  clickable: {
    type: Boolean,
    default: false,
  },
  scrollable: {
    type: Boolean,
    default: false,
  },
});

const emits = defineEmits(['alternativeSelected']);
</script>

<template>
  <div :class="scrollable ? 'scrollable-table' : ''">
    <table class="alternatives-table">
      <thead>
        <tr>
          <th v-for="key in Object.keys(alternatives[0])" :key="key">{{ key }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(alternative, index) in alternatives" :key="index"
          @click="() => clickable ? emits('alternativeSelected', index) : undefined">
          <td v-for="(value, key) in Object.values(alternative)" :key="key">
            {{ value }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
