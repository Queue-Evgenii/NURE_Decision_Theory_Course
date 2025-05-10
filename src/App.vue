<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header>
    <nav class="_container">
      <RouterLink :to="{ name: 'lab-1' }" active-class="active-link">Lab 1</RouterLink>
      <RouterLink :to="{ name: 'lab-2' }" active-class="active-link">Lab 2</RouterLink>
      <RouterLink :to="{ name: 'lab-3-4' }" active-class="active-link">Lab 3-4</RouterLink>
    </nav>
  </header>

  <RouterView />
</template>

<style>
.active-link {
  font-size: 22px;
  text-decoration: underline;
}
</style>
