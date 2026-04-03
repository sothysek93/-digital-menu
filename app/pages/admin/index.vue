<script setup lang="ts">
import { Loader2 as LucideLoader2 } from 'lucide-vue-next';

// Minimalist redirect for the admin root
definePageMeta({ 
  layout: 'admin'
});

onMounted(() => {
  navigateTo('/admin/orders');
});
</script>

<template>
  <div class="h-64 flex items-center justify-center">
    <div class="flex flex-col items-center gap-4">
      <LucideLoader2 class="w-8 h-8 animate-spin text-muted-foreground/20" />
      <span class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest animate-pulse">Routing Context...</span>
    </div>
  </div>
</template>
