<template>
  <div class="min-h-screen bg-neutral-950 pb-20">
    <!-- Header -->
    <header class="sticky top-0 z-50 glass px-4 py-4 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <UAvatar src="/logo.png" alt="Restaurant Logo" size="md" />
        <h1 class="text-xl font-bold gradient-text">Modern Menu</h1>
      </div>
      <UButton icon="i-heroicons-shopping-cart" color="primary" variant="soft" />
    </header>

    <div class="container mx-auto px-4 mt-8">
      <!-- Welcome Section -->
      <section class="mb-12 text-center">
        <h2 class="text-4xl font-extrabold mb-2 uppercase tracking-wide">Welcome to our kitchen</h2>
        <p class="text-neutral-400 max-w-lg mx-auto">Discover our curated selection of signature dishes prepared with passion and fresh ingredients.</p>
      </section>

      <!-- Loading State -->
      <div v-if="pending" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <USkeleton v-for="i in 6" :key="i" class="h-64 w-full rounded-2xl bg-neutral-900" />
      </div>

      <!-- Menu Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <PublicMenuItem 
          v-for="item in menuItems" 
          :key="item.id" 
          :item="item" 
        />
      </div>

      <!-- Empty State -->
      <div v-if="!pending && menuItems.length === 0" class="text-center py-20">
        <p class="text-neutral-500 italic text-lg">No menu items found for this restaurant.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute();
const slug = route.params.slug;

const { data: menuItems, pending } = await useFetch(`/api/public/menu?slug=${slug}`, {
  default: () => []
});
</script>
