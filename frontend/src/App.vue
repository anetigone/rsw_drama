<script setup lang="ts">
import { RouterView } from 'vue-router'
import GlobalNavbar from './components/GlobalNavbar.vue'
</script>

<template>
  <div class="app-container">
    <GlobalNavbar />
    <RouterView />
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
}
</style>