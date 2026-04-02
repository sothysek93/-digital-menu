<template>
  <div class="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6 text-center">
    <div class="max-w-4xl space-y-12">
      <div class="space-y-4">
        <UBadge color="primary" variant="soft" class="rounded-full px-4 py-1 text-sm font-bold uppercase tracking-widest">Digital Menu Platform</UBadge>
        <h1 class="text-6xl md:text-8xl font-black gradient-text tracking-tighter leading-tight">Modern Experience for Modern Kitchens.</h1>
        <p class="text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed">The only digital menu platform built for performance, aesthetics, and simplicity. Zero hardware, total control.</p>
      </div>

      <div class="flex flex-col sm:flex-row items-center justify-center gap-6">
        <UButton 
          to="/admin/register" 
          color="primary" 
          size="xl" 
          class="rounded-2xl px-10 py-5 font-bold uppercase tracking-wider text-lg shadow-2xl shadow-pink-500/20"
          label="Build Your Menu Now" 
        />
        <UButton 
          to="/admin/login" 
          variant="outline" 
          color="neutral" 
          size="xl" 
          class="rounded-2xl px-10 py-5 font-bold uppercase tracking-wider text-lg border-2 border-neutral-800 hover:bg-neutral-900"
          label="Manage Restaurant" 
        />
      </div>

      <div class="pt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
        <div class="glass p-8 rounded-3xl border border-neutral-800/50 bg-neutral-900/40">
          <UIcon name="i-heroicons-bolt" class="w-10 h-10 text-pink-500 mb-4" />
          <h3 class="text-xl font-bold mb-2">Lightning Fast</h3>
          <p class="text-sm text-neutral-500">Built with Nuxt 4 and Cloudflare R2 for zero-latency menu browsing experience.</p>
        </div>
        <div class="glass p-8 rounded-3xl border border-neutral-800/50 bg-neutral-900/40">
          <UIcon name="i-heroicons-eye" class="w-10 h-10 text-violet-500 mb-4" />
          <h3 class="text-xl font-bold mb-2">Visual Masterpiece</h3>
          <p class="text-sm text-neutral-500">Stunning glassmorphism design that mirrors the quality of your signature dishes.</p>
        </div>
        <div class="glass p-8 rounded-3xl border border-neutral-800/50 bg-neutral-900/40">
          <UIcon name="i-heroicons-puzzle-piece" class="w-10 h-10 text-blue-500 mb-4" />
          <h3 class="text-xl font-bold mb-2">Total Control</h3>
          <p class="text-sm text-neutral-500">Full CRUD administration with instant updates across all public devices.</p>
        </div>
      </div>

      <div class="pt-20 text-neutral-600 font-bold uppercase text-[11px] tracking-[0.4em]">
        Powered by Tipsha Technology
      </div>
    </div>
  </div>
</template>

<script setup>
// Landing page logic
</script>
