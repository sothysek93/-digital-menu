<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <!-- Global Toast Provider: Ensuring newer messages are always prioritized and visible -->
  <Toaster position="top-right" :rich-colors="true" :expand="true" :close-button="true" :visible-toasts="8" />
</template>

<script setup lang="ts">
import { Toaster } from '~/components/ui/sonner';
</script>
