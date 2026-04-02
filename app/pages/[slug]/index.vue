<template>
  <div class="min-h-screen bg-slate-50 flex flex-col">
    <!-- Header -->
    <header class="sticky top-0 z-50 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center">
          <LucideChefHat class="w-4 h-4 text-white" />
        </div>
        <h1 class="text-sm font-bold tracking-tight text-slate-900 uppercase italic">Digital Menu</h1>
      </div>
      <Button variant="ghost" size="icon" class="text-slate-500 hover:bg-slate-100">
        <LucideSearch class="w-5 h-5 text-inherit" />
      </Button>
    </header>

    <div class="flex-1 max-w-5xl mx-auto px-6 py-12 w-full">
      <!-- Title Section -->
      <section class="mb-12 space-y-2">
        <h2 class="text-4xl font-bold tracking-tight text-slate-900 uppercase">
          {{ slug }}
        </h2>
        <div class="h-1 w-12 bg-slate-950 rounded-full"></div>
        <p class="text-slate-500 text-sm italic pt-2">
          Discover our curated collection of culinary selections.
        </p>
      </section>

      <!-- Loading State -->
      <div v-if="pending" class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div v-for="i in 4" :key="i" class="h-64 w-full bg-white border border-slate-200 rounded-2xl p-4 flex flex-col gap-4 animate-pulse">
          <div class="flex-1 bg-slate-100 rounded-xl"></div>
          <div class="h-4 w-1/2 bg-slate-100 rounded"></div>
        </div>
      </div>

      <!-- Menu Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        <!-- MenuItem is an auto-imported component -->
        <MenuItem 
          v-for="item in menuItems" 
          :key="item.id" 
          :item="item" 
        />
      </div>

      <!-- Empty State -->
      <div v-if="!pending && (!menuItems || menuItems.length === 0)" class="py-32 text-center text-slate-400 font-medium">
        No menu items are currently available for this restaurant.
      </div>
    </div>
    
    <!-- Footer -->
    <footer class="py-8 border-t border-slate-200 text-center text-xs text-slate-400 font-medium">
      Created with Digital Menu Platform
    </footer>
  </div>
</template>

<script setup lang="ts">
import { LucideChefHat, LucideSearch } from 'lucide-vue-next';
import MenuItem from '../../components/public/MenuItem.vue';
import { Button } from '../../components/ui/button';

const route = useRoute();
const slug = route.params.slug as string;

// Fetch with SSR support
const { data: menuItems, pending } = await useFetch(`/api/public/menu?slug=${slug}` as any, {
  key: `menu-live-${slug}`,
  transform: (data: any) => data || []
});
</script>
