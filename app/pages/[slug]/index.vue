<template>
  <div class="min-h-screen bg-black text-white selection:bg-white selection:text-black">
    <!-- Header -->
    <header class="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-neutral-900 px-6 py-4 flex items-center justify-between">
      <div class="flex items-center gap-4">
        <div class="w-10 h-10 rounded-full bg-white flex items-center justify-center">
          <LucideChefHat class="w-5 h-5 text-black" />
        </div>
        <h1 class="text-sm font-black uppercase tracking-[0.4em] leading-none">DIGITAL MENU</h1>
      </div>
      <Button variant="ghost" size="icon" class="text-white hover:bg-neutral-900">
        <LucideSearch class="w-5 h-5" />
      </Button>
    </header>

    <div class="container max-w-5xl mx-auto px-6 py-12">
      <!-- Welcome Section -->
      <section class="mb-16 space-y-4">
        <p class="text-[10px] font-black uppercase tracking-[0.5em] text-neutral-600">Restaurant Archive / Table View</p>
        <h2 class="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] italic uppercase italic">
          {{ slug?.toUpperCase() }} <br> <span class="text-neutral-800">COLLECTION</span>
        </h2>
        <p class="text-xl text-neutral-500 max-w-2xl font-light italic leading-relaxed pt-4">
          Experience culinary mastery delivered in real-time. Select any node to view nutritional metadata and origin details.
        </p>
      </section>

      <!-- Loading State -->
      <div v-if="pending" class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Skeleton v-for="i in 4" :key="i" class="h-80 w-full rounded-[2.5rem] bg-neutral-900" />
      </div>

      <!-- Menu Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <MenuItem 
          v-for="item in menuItems" 
          :key="item.id" 
          :item="item" 
        />
      </div>

      <!-- Empty State -->
      <div v-if="!pending && menuItems.length === 0" class="py-32 text-center">
        <p class="text-[10px] font-black uppercase tracking-[0.5em] text-neutral-700 italic underline-offset-8 underline">Zero records available for this deployment</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { LucideChefHat, LucideSearch } from 'lucide-vue-next';
import MenuItem from '../../components/public/MenuItem.vue';

const route = useRoute();
const slug = route.params.slug as string;

const { data: menuItems, pending } = await useAsyncData(`menu-${slug}`, () => $fetch(`/api/public/menu?slug=${slug}`), {
  default: () => []
});
</script>
