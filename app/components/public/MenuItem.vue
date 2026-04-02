<template>
  <div class="glass rounded-2xl overflow-hidden card-hover border border-neutral-800 bg-neutral-900/50 backdrop-blur-xl group">
    <div class="relative overflow-hidden aspect-[4/3]">
      <img 
        :src="item.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800'" 
        alt="item image" 
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
      />
      <div v-if="!item.is_available" class="absolute inset-0 bg-neutral-950/70 flex items-center justify-center">
        <span class="text-sm font-bold uppercase tracking-widest text-neutral-400">Sold out</span>
      </div>
      <div class="absolute bottom-3 right-3 bg-neutral-950/80 backdrop-blur-lg px-4 py-1.5 rounded-full border border-neutral-700">
        <span class="font-bold text-lg text-primary text-pink-500">${{ item.price }}</span>
      </div>
    </div>
    <div class="p-5">
      <div class="flex justify-between items-start mb-2">
        <h3 class="text-lg font-bold group-hover:text-primary transition-colors">{{ item.name }}</h3>
      </div>
      <p class="text-sm text-neutral-400 leading-relaxed line-clamp-2 mb-4">{{ item.description }}</p>
      
      <UButton 
        block 
        color="primary" 
        variant="solid" 
        size="lg" 
        label="Add to Order"
        :disabled="!item.is_available" 
        class="rounded-xl"
      />
    </div>
  </div>
</template>

<script setup>
defineProps({
  item: {
    type: Object,
    required: true
  }
});
</script>
