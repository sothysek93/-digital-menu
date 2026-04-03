<template>
  <div class="min-h-screen bg-background flex flex-col md:flex-row text-foreground selection:bg-primary selection:text-primary-foreground">
    <!-- Desktop Sidebar -->
    <aside class="hidden md:flex w-72 bg-card border-r border-border flex-col p-6 justify-between shrink-0 h-screen sticky top-0">
      <div class="space-y-8 flex-1 overflow-y-auto scrollbar-hide">
        <div class="flex items-center gap-3 px-2">
          <div class="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 transition-transform hover:rotate-6">
            <LucideLayoutGrid class="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 class="text-[12px] font-black uppercase tracking-[0.2em] leading-none mb-1 text-foreground">D-MENU</h2>
            <p class="text-[9px] text-muted-foreground font-black uppercase tracking-[0.1em] leading-none">Console Core</p>
          </div>
        </div>

        <!-- Shop Selector -->
        <div class="px-2 space-y-3">
          <Label class="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 mb-1 block">Active Location</Label>
          <div v-if="pendingShops" class="h-11 bg-muted/50 animate-pulse rounded-2xl border border-border/50"></div>
          <Select v-else :model-value="currentShopId || ''" @update:model-value="onShopChange">
            <SelectTrigger class="w-full bg-muted border-border h-11 rounded-2xl text-[10px] font-black uppercase tracking-widest px-4 hover:bg-muted/80 transition-colors">
              <SelectValue :placeholder="shops?.length ? 'Selecting...' : 'No Locations'" />
            </SelectTrigger>
            <SelectContent class="rounded-2xl border-border bg-popover">
              <SelectItem v-for="shop in (shops as any[]) || []" :key="shop.id" :value="shop.id" class="text-[10px] font-black uppercase tracking-widest rounded-xl m-1 py-3 px-4">
                {{ shop.name }}
              </SelectItem>
              <SelectSeparator class="bg-border/50" />
              <NuxtLink to="/admin/shops" class="flex items-center w-full px-5 py-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all rounded-xl m-1">
                <LucidePlus class="w-3.5 h-3.5 mr-3" />
                Manage Branches
              </NuxtLink>
            </SelectContent>
          </Select>
        </div>
        
        <nav class="space-y-1.5 px-1">
          <Button 
            v-for="link in navLinks" 
            :key="link.to"
            as-child
            variant="ghost"
            class="w-full justify-start h-12 rounded-2xl px-4 gap-4 transition-all hover:bg-muted group"
            :class="{ 'bg-primary/5 text-primary shadow-sm border border-primary/10': route.path === link.to, 'text-muted-foreground': route.path !== link.to }"
          >
            <NuxtLink :to="link.to">
              <component :is="link.icon" class="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span class="text-[10px] font-black uppercase tracking-[0.1em]">{{ link.label }}</span>
            </NuxtLink>
          </Button>
        </nav>
      </div>

      <div class="pt-6 border-t border-border space-y-6">
        <div class="flex items-center gap-3 px-3">
          <div class="w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center text-[10px] font-black uppercase text-foreground shadow-sm">
            {{ user?.name?.charAt(0) || 'U' }}
          </div>
          <div class="overflow-hidden">
            <p class="text-[11px] font-black uppercase tracking-widest truncate text-foreground">{{ user?.name }}</p>
            <p class="text-[9px] text-muted-foreground font-bold truncate italic opacity-60 uppercase tracking-tighter">{{ user?.email }}</p>
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          class="w-full justify-start h-12 rounded-2xl px-4 gap-4 text-destructive/60 hover:bg-destructive/5 hover:text-destructive group transition-all"
          @click="handleLogout"
        >
          <LucideLogOut class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          <span class="text-[10px] font-black uppercase tracking-widest">Sign Out</span>
        </Button>
      </div>
    </aside>

    <!-- Mobile Header -->
    <header class="md:hidden bg-card border-b border-border p-4 flex items-center justify-between sticky top-0 z-50">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-md">
          <LucideLayoutGrid class="w-4 h-4 text-primary-foreground" />
        </div>
        <h2 class="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">D-MENU</h2>
      </div>
      <Sheet>
        <SheetTrigger as-child>
          <Button variant="ghost" size="icon" class="rounded-full">
            <LucideMenu class="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" class="w-80 p-6 flex flex-col bg-card border-r border-border z-[200]">
           <div class="flex-1 space-y-10">
             <div class="space-y-4">
                <Label class="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Location Context</Label>
                <Select :model-value="currentShopId || ''" @update:model-value="onShopChange">
                  <SelectTrigger class="w-full bg-muted border-border h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest px-4">
                    <SelectValue placeholder="Selecting..." />
                  </SelectTrigger>
                  <SelectContent class="rounded-2xl border-border bg-popover">
                    <SelectItem v-for="shop in (shops as any[]) || []" :key="shop.id" :value="shop.id" class="text-[10px] font-black uppercase tracking-widest py-3 px-4 rounded-xl m-1">
                      {{ shop.name }}
                    </SelectItem>
                  </SelectContent>
                </Select>
             </div>
             <nav class="space-y-2">
                <Button 
                  v-for="link in navLinks" 
                  :key="link.to"
                  as-child
                  variant="ghost"
                  class="w-full justify-start h-12 rounded-2xl px-4 gap-4"
                  :class="{ 'bg-primary/5 text-primary border border-primary/10 shadow-sm': route.path === link.to, 'text-muted-foreground': route.path !== link.to }"
                >
                  <NuxtLink :to="link.to">
                    <component :is="link.icon" class="w-4 h-4" />
                    <span class="text-[10px] font-black uppercase tracking-widest">{{ link.label }}</span>
                  </NuxtLink>
                </Button>
              </nav>
           </div>
           
           <div class="pt-6 border-t border-border mt-auto">
             <Button 
                variant="ghost" 
                class="w-full justify-start h-12 rounded-2xl px-4 gap-4 text-destructive/60 hover:bg-destructive/5 hover:text-destructive"
                @click="handleLogout"
              >
                <LucideLogOut class="w-4 h-4" />
                <span class="text-[10px] font-black uppercase tracking-widest">Sign Out</span>
              </Button>
           </div>
        </SheetContent>
      </Sheet>
    </header>

    <!-- Content Area -->
    <main class="flex-1 p-6 md:p-10 lg:p-16 overflow-y-auto relative">
      <div class="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
        <slot />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { 
  LayoutGrid as LucideLayoutGrid, List as LucideList, Settings as LucideSettings, 
  LogOut as LucideLogOut, LayoutDashboard as LucideLayoutDashboard, Store as LucideStore, 
  ChefHat as LucideChefHat, Menu as LucideMenu, Plus as LucidePlus,
  ShoppingCart as LucideShoppingCart
} from 'lucide-vue-next';
import { Button } from '~/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectSeparator } from '~/components/ui';
import { Label } from '~/components/ui/label';
import { Sheet, SheetContent, SheetTrigger } from '~/components/ui';
import { toast } from 'vue-sonner';

const route = useRoute();
const router = useRouter();
const user = useState<any>('user');
const currentShopId = useState<string | null>('currentShopId', () => null);
const token = useCookie('token');

const navLinks = [
  { label: 'Incoming Orders', to: '/admin/orders', icon: LucideShoppingCart },
  { label: 'Shop Catalog', to: '/admin', icon: LucideChefHat },
  { label: 'Classification', to: '/admin/categories', icon: LucideList },
  { label: 'Branch Manager', to: '/admin/shops', icon: LucideStore },
  { label: 'Core Settings', to: '/admin/settings', icon: LucideSettings },
];

const { data: shops, pending: pendingShops } = await useFetch<any[]>('/api/admin/shops', {
  headers: { Authorization: `Bearer ${token.value}` }
});

// Set default shop if none selected
watchEffect(() => {
  if (shops.value?.length && !currentShopId.value) {
    currentShopId.value = (shops.value as any)[0].id;
  }
});

const onShopChange = (id: any) => {
  currentShopId.value = id;
  const shopName = (shops.value as any[])?.find(s => s.id === id)?.name;
  toast.success('Location Switched', {
    description: `Currently managing "${shopName}" context.`
  });
};

const handleLogout = () => {
  token.value = null;
  user.value = null;
  currentShopId.value = null;
  toast.info('Session Terminated', {
    description: 'You have been securely signed out.'
  });
  router.push('/admin/login');
};
</script>
