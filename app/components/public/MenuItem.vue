<template>
  <Card class="bg-white border-slate-200 rounded-2xl overflow-hidden flex flex-col h-full shadow-sm hover:shadow-md transition-shadow">
    <div class="aspect-video relative overflow-hidden bg-slate-100">
      <img 
        v-if="item.image_url" 
        :src="item.image_url" 
        class="w-full h-full object-cover transition-transform duration-500 hover:scale-105" 
      />
      <div v-else class="w-full h-full flex items-center justify-center text-slate-300">
        <LucideImage class="w-12 h-12" />
      </div>
      
      <!-- Price Badge -->
      <div class="absolute top-4 right-4">
        <Badge class="bg-slate-900 text-white font-bold px-3 py-1 rounded-full text-xs border-none">
          ${{ item.price.toFixed(2) }}
        </Badge>
      </div>

      <!-- Sold Out Overlay -->
      <div v-if="!item.is_available" class="absolute inset-0 bg-white/70 backdrop-blur-sm z-20 flex items-center justify-center">
        <span class="text-xs font-bold uppercase tracking-wider text-slate-500 border border-slate-200 px-4 py-2 rounded-full bg-white">
          Currently Unavailable
        </span>
      </div>
    </div>

    <CardContent class="p-6 flex-1 flex flex-col justify-between">
      <div class="space-y-2">
        <h3 class="text-xl font-bold text-slate-900 leading-tight">{{ item.name }}</h3>
        <p class="text-sm text-slate-500 leading-relaxed line-clamp-3">
          {{ item.description || 'No description provided.' }}
        </p>
      </div>
      
      <div class="pt-6 flex items-center justify-between border-t border-slate-100 mt-auto">
        <span class="text-[10px] font-medium text-slate-400">#{{ item.id?.slice(0, 8) }}</span>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { LucideImage } from 'lucide-vue-next';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

defineProps({
  item: {
    type: Object,
    required: true
  }
});
</script>
