<template>
  <div class="min-h-screen bg-black flex flex-col md:flex-row text-white selection:bg-white selection:text-black">
    <!-- Desktop Sidebar -->
    <aside class="hidden md:flex w-72 bg-neutral-950 border-r border-neutral-900 flex-col p-8 justify-between">
      <div class="space-y-12">
        <div class="flex items-center gap-4">
          <div class="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
            <LucideLayoutGrid class="w-5 h-5 text-black" />
          </div>
          <div>
            <h2 class="text-sm font-black uppercase tracking-[0.2em] leading-none mb-1">D-MENU</h2>
            <p class="text-[9px] text-neutral-600 font-bold uppercase tracking-widest leading-none">Management Console</p>
          </div>
        </div>
        
        <nav class="space-y-1">
          <Button 
            v-for="link in navLinks" 
            :key="link.to"
            as-child
            variant="ghost"
            class="w-full justify-start h-12 rounded-xl px-4 gap-4 transition-all hover:bg-neutral-900 group"
            :class="{ 'bg-neutral-900 text-white': route.path === link.to, 'text-neutral-500': route.path !== link.to }"
          >
            <NuxtLink :to="link.to">
              <component :is="link.icon" class="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span class="text-xs font-bold uppercase tracking-widest">{{ link.label }}</span>
            </NuxtLink>
          </Button>
        </nav>
      </div>

      <div class="pt-8 border-t border-neutral-900 space-y-6">
        <div class="flex items-center gap-4 px-4">
          <div class="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-xs font-black">
            {{ user?.name?.charAt(0) || 'U' }}
          </div>
          <div class="overflow-hidden">
            <p class="text-[11px] font-black uppercase tracking-widest truncate">{{ user?.name }}</p>
            <p class="text-[9px] text-neutral-600 font-medium truncate italic">{{ user?.email }}</p>
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          class="w-full justify-start h-12 rounded-xl px-4 gap-4 text-red-500 hover:bg-red-500/10 hover:text-red-500 group"
          @click="logout"
        >
          <LucideLogOut class="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          <span class="text-xs font-black uppercase tracking-widest text-inherit">Logout System</span>
        </Button>
      </div>
    </aside>

    <!-- Content Area -->
    <main class="flex-1 p-6 md:p-12 overflow-y-auto bg-neutral-950 relative">
      <!-- Subtle Ambient Glow -->
      <div class="absolute top-0 right-0 w-[800px] h-[800px] bg-white/[0.02] blur-[150px] rounded-full pointer-events-none"></div>
      
      <div class="relative z-10">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup>
import { LucideLayoutGrid, LucideList, LucideSettings, LucideLogOut } from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const user = useState('user');

const navLinks = [
  { label: 'Menu Catalog', to: '/admin', icon: LucideList },
  { label: 'Platform Settings', to: '/admin/settings', icon: LucideSettings },
];

const logout = () => {
  localStorage.removeItem('token');
  user.value = null;
  router.push('/admin/login');
};
</script>
