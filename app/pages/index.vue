<template>
  <div class="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-700">
    <!-- Header Badge -->
    <div class="space-y-12 max-w-4xl w-full">
      <div class="space-y-6 flex flex-col items-center">
        <Badge variant="outline" class="rounded-full px-4 py-1 text-[10px] font-bold uppercase tracking-widest border-border bg-muted/60 text-muted-foreground transition-all">
          Product Preview v1.0
        </Badge>
        
        <h1 class="text-5xl md:text-7xl font-bold tracking-tighter text-foreground leading-[1.1] max-w-2xl px-4 animate-in slide-in-from-bottom-5 duration-700">
          Digital Menu <span class="text-muted-foreground/30">Platform.</span>
        </h1>
        
        <p class="text-lg text-muted-foreground max-w-lg mx-auto font-medium leading-relaxed px-4 opacity-80">
          Deploy high-performance menus in seconds. 
          Manage catalog, stock, and live orders—all from a single, minimalist dashboard.
        </p>
      </div>

      <!-- Main Actions -->
      <div class="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <Button 
          as-child
          size="lg" 
          class="h-12 px-8 rounded-lg font-bold text-[10px] uppercase tracking-widest bg-foreground text-background hover:bg-foreground/90 transition-all shadow-sm"
        >
          <NuxtLink to="/admin/register">Create Store Unit</NuxtLink>
        </Button>
        <Button 
          as-child
          variant="outline" 
          size="lg" 
          class="h-12 px-8 rounded-lg font-bold text-[10px] uppercase tracking-widest border-border bg-background text-foreground hover:bg-muted transition-all"
        >
          <NuxtLink to="/admin/login">Management Login</NuxtLink>
        </Button>
      </div>

      <!-- Feature Grid -->
      <div class="pt-20 grid grid-cols-1 md:grid-cols-3 gap-6 text-left px-4">
        <Card class="bg-card border border-border shadow-none rounded-lg p-8 transition-colors hover:bg-muted/30 group">
          <div class="w-10 h-10 rounded-lg bg-muted flex items-center justify-center mb-6 border border-border group-hover:bg-foreground group-hover:text-background transition-all duration-300">
            <LucideZap class="w-5 h-5" />
          </div>
          <h3 class="text-sm font-bold text-foreground mb-3 uppercase tracking-tight">Admin Console</h3>
          <p class="text-xs text-muted-foreground leading-relaxed font-medium">Full-stack dashboard to manage categories, items, and store settings in real-time.</p>
        </Card>

        <Card class="bg-card border border-border shadow-none rounded-lg p-8 transition-colors hover:bg-muted/30 group">
          <div class="w-10 h-10 rounded-lg bg-muted flex items-center justify-center mb-6 border border-border group-hover:bg-foreground group-hover:text-background transition-all duration-300">
            <LucideImage class="w-5 h-5" />
          </div>
          <h3 class="text-sm font-bold text-foreground mb-3 uppercase tracking-tight">Public Menu</h3>
          <p class="text-xs text-muted-foreground leading-relaxed font-medium">Ultra-light guest interface with high-performance asset delivery across all devices.</p>
        </Card>

        <Card class="bg-card border border-border shadow-none rounded-lg p-8 transition-colors hover:bg-muted/30 group">
          <div class="w-10 h-10 rounded-lg bg-muted flex items-center justify-center mb-6 border border-border group-hover:bg-foreground group-hover:text-background transition-all duration-300">
            <LucideTerminal class="w-5 h-5" />
          </div>
          <h3 class="text-sm font-bold text-foreground mb-3 uppercase tracking-tight">Live Tracking</h3>
          <p class="text-xs text-muted-foreground leading-relaxed font-medium">Session-based order tracking ensures guests never lose sight of their meal status.</p>
        </Card>
      </div>

      <!-- Technical Footer -->
      <div class="pt-32 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 opacity-30">
        <div class="flex items-center gap-3">
           <LucideServer class="w-3 h-3" />
           <span class="text-[9px] font-bold uppercase tracking-[0.3em]">Cloudflare Pages</span>
        </div>
        <div class="w-1 h-1 rounded-full bg-foreground/20 hidden md:block"></div>
        <div class="flex items-center gap-3">
           <LucideDatabase class="w-3 h-3" />
           <span class="text-[9px] font-bold uppercase tracking-[0.3em]">D1 Engine</span>
        </div>
        <div class="w-1 h-1 rounded-full bg-foreground/20 hidden md:block"></div>
        <div class="flex items-center gap-3">
           <LucideCode class="w-3 h-3" />
           <span class="text-[9px] font-bold uppercase tracking-[0.3em]">Nuxt 4 / ShadCN</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  Zap as LucideZap, 
  Image as LucideImage, 
  Terminal as LucideTerminal,
  Server as LucideServer,
  Database as LucideDatabase,
  Code as LucideCode
} from 'lucide-vue-next';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

definePageMeta({
  layout: false
})
</script>
