<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <!-- Global Toast Provider: Ensuring it floats above all overlays -->
  <Toaster position="top-right" :rich-colors="true" :expand="false" :close-button="true" />
</template>

<script setup lang="ts">
import { Toaster } from '~/components/ui/sonner';
</script>
