<template>
  <Card class="bg-neutral-900/40 border-neutral-800 rounded-[2rem] overflow-hidden group hover:bg-neutral-900 transition-all duration-500 flex flex-col h-full shadow-2xl">
    <div class="aspect-square relative overflow-hidden bg-neutral-950 px-4 pt-4">
      <img 
        v-if="item.image_url" 
        :src="item.image_url" 
        class="w-full h-full rounded-[1.5rem] object-cover transition-transform duration-700 group-hover:scale-110" 
      />
      <div v-else class="w-full h-full rounded-[1.5rem] bg-neutral-900 flex items-center justify-center opacity-20 italic font-black text-[10px] uppercase tracking-[0.4em]">
        Asset Missing
      </div>
      
      <!-- Price Overlay -->
      <div class="absolute top-8 left-8 z-10 transition-transform group-hover:-translate-y-2">
        <Badge class="bg-white text-black font-black px-6 py-2 rounded-full text-xs shadow-2xl shadow-white/10 uppercase tracking-widest border-none">
          ${{ item.price.toFixed(2) }}
        </Badge>
      </div>

      <!-- Availability Overlay -->
      <div v-if="!item.is_available" class="absolute inset-4 rounded-[1.5rem] bg-neutral-950/80 backdrop-blur-sm z-20 flex items-center justify-center">
        <span class="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 border border-white/10 px-6 py-3 rounded-full">
          Sold Out / Offline
        </span>
      </div>
    </div>

    <CardContent class="p-8 flex-1 flex flex-col justify-between text-white">
      <div class="space-y-4">
        <h3 class="text-3xl font-black italic tracking-tighter uppercase text-white leading-none">{{ item.name }}</h3>
        <p class="text-[11px] text-neutral-500 leading-relaxed font-bold uppercase tracking-widest opacity-60">
          {{ item.description || 'Null culinary description provided for this node.' }}
        </p>
      </div>
      
      <div class="pt-8 flex items-center justify-between border-t border-neutral-800 mt-auto">
        <span class="text-[8px] font-black text-neutral-800 uppercase tracking-[0.4em]">Inventory ID: {{ item.id?.slice(0, 8).toUpperCase() }}</span>
        <div class="w-8 h-8 rounded-full border border-neutral-800 flex items-center justify-center group-hover:bg-white group-hover:border-white transition-all duration-500">
           <LucideArrowUpRight class="w-4 h-4 text-neutral-800 group-hover:text-black transition-colors" />
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup>
import { LucideArrowUpRight } from 'lucide-vue-next';

defineProps({
  item: {
    type: Object,
    required: true
  }
});
</script>
