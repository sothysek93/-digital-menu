<template>
  <div class="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6 text-center overflow-hidden relative">
    <!-- Subtle Background Accents -->
    <div class="absolute top-0 left-1/4 w-[500px] h-[500px] bg-pink-500/10 blur-[120px] rounded-full -translate-y-1/2"></div>
    <div class="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-violet-600/10 blur-[120px] rounded-full translate-y-1/2"></div>

    <div class="max-w-5xl space-y-16 relative z-10">
      <div class="space-y-6 animate-in fade-in slide-in-from-bottom-10 duration-1000">
        <Badge variant="secondary" class="rounded-full px-6 py-2 text-xs font-bold uppercase tracking-[0.2em] bg-neutral-900 border-neutral-800 text-neutral-400">
          Digital Menu Platform v1.0
        </Badge>
        <h1 class="text-6xl md:text-8xl font-black tracking-tight leading-[0.95] text-white">
          The <span class="text-neutral-500">Fastest</span> Way <br> to Fresh Menus.
        </h1>
        <p class="text-xl text-neutral-400 max-w-2xl mx-auto font-light leading-relaxed">
          Elite digital menu management for high-performance kitchens. 
          Upload assets, manage stock, and deploy in seconds—zero hardware required.
        </p>
      </div>

      <div class="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
        <Button 
          as-child
          size="lg" 
          class="h-14 px-10 rounded-full font-bold text-base uppercase tracking-widest bg-white text-black hover:bg-neutral-200"
        >
          <NuxtLink to="/admin/register">Get Started Free</NuxtLink>
        </Button>
        <Button 
          as-child
          variant="outline" 
          size="lg" 
          class="h-14 px-10 rounded-full font-bold text-base uppercase tracking-widest border-neutral-800 bg-neutral-950 text-white hover:bg-neutral-900"
        >
          <NuxtLink to="/admin/login">Manage Table</NuxtLink>
        </Button>
      </div>

      <div class="pt-24 grid grid-cols-1 md:grid-cols-3 gap-6 text-left animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-500">
        <Card class="bg-neutral-900/40 border-neutral-800/50 backdrop-blur-md rounded-[2.5rem] p-8 hover:bg-neutral-900 transition-colors cursor-default group">
          <div class="w-12 h-12 rounded-2xl bg-neutral-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <LucideZap class="w-6 h-6 text-white" />
          </div>
          <h3 class="text-xl font-bold text-white mb-2 italic">Nitro-Speed</h3>
          <p class="text-sm text-neutral-500 leading-relaxed font-medium">Built on Nuxt 4 & Cloudflare for instantaneous updates across every customer device.</p>
        </Card>

        <Card class="bg-neutral-900/40 border-neutral-800/50 backdrop-blur-md rounded-[2.5rem] p-8 hover:bg-neutral-900 transition-colors cursor-default group">
          <div class="w-12 h-12 rounded-2xl bg-neutral-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <LucideImage class="w-6 h-6 text-white" />
          </div>
          <h3 class="text-xl font-bold text-white mb-2 italic">R2 Storage</h3>
          <p class="text-sm text-neutral-500 leading-relaxed font-medium">Ultra-high resolution image hosting for your dishes with globally distributed delivery.</p>
        </Card>

        <Card class="bg-neutral-900/40 border-neutral-800/50 backdrop-blur-md rounded-[2.5rem] p-8 hover:bg-neutral-900 transition-colors cursor-default group">
          <div class="w-12 h-12 rounded-2xl bg-neutral-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <LucideTerminal class="w-6 h-6 text-white" />
          </div>
          <h3 class="text-xl font-bold text-white mb-2 italic">Serverless D1</h3>
          <p class="text-sm text-neutral-500 leading-relaxed font-medium">Real-time SQLite database ensures your menu logic is always in sync with your kitchen.</p>
        </Card>
      </div>

      <div class="pt-32 flex items-center justify-center gap-8 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
        <span class="text-[10px] font-black uppercase tracking-[0.5em] text-neutral-400">Powered by Nuxt 4</span>
        <div class="w-1 h-1 rounded-full bg-neutral-800"></div>
        <span class="text-[10px] font-black uppercase tracking-[0.5em] text-neutral-400">Cloudflare Edge</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { LucideZap, LucideImage, LucideTerminal } from 'lucide-vue-next';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
</script>
