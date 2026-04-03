<template>
  <div class="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-900 selection:bg-slate-900 selection:text-white">
    <!-- Desktop Sidebar -->
    <aside class="hidden md:flex w-72 bg-white border-r border-slate-200 flex-col p-6 justify-between shrink-0 h-screen sticky top-0">
      <div class="space-y-8 flex-1 overflow-y-auto">
        <div class="flex items-center gap-3 px-2">
          <div class="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center">
            <LucideLayoutGrid class="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 class="text-sm font-black uppercase tracking-widest leading-none mb-1">D-MENU</h2>
            <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Management Console</p>
          </div>
        </div>

        <!-- Shop Selector -->
        <div class="px-2 space-y-2">
          <Label class="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Current Shop</Label>
          <div v-if="pendingShops" class="h-10 bg-slate-100 animate-pulse rounded-lg"></div>
          <Select v-else v-model="currentShopId">
            <SelectTrigger class="w-full bg-slate-50 border-slate-200 h-10 rounded-xl text-xs font-bold uppercase tracking-widest">
              <SelectValue :placeholder="shops?.length ? 'Select Shop' : 'No Shops'" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="shop in shops" :key="shop.id" :value="shop.id" class="text-xs font-bold uppercase tracking-widest">
                {{ shop.name }}
              </SelectItem>
              <SelectSeparator />
              <NuxtLink to="/admin/shops" class="flex items-center w-full px-2 py-1.5 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors">
                <LucidePlus class="w-3.5 h-3.5 mr-2" />
                Manage Shops
              </NuxtLink>
            </SelectContent>
          </Select>
        </div>
        
        <nav class="space-y-1">
          <Button 
            v-for="link in navLinks" 
            :key="link.to"
            as-child
            variant="ghost"
            class="w-full justify-start h-11 rounded-xl px-4 gap-4 transition-all hover:bg-slate-100 group"
            :class="{ 'bg-slate-100 text-slate-900 ring-1 ring-slate-200': route.path === link.to, 'text-slate-500': route.path !== link.to }"
          >
            <NuxtLink :to="link.to">
              <component :is="link.icon" class="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span class="text-[11px] font-bold uppercase tracking-widest">{{ link.label }}</span>
            </NuxtLink>
          </Button>
        </nav>
      </div>

      <div class="pt-6 border-t border-slate-100 space-y-6">
        <div class="flex items-center gap-3 px-2">
          <div class="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-black uppercase text-slate-600">
            {{ user?.name?.charAt(0) || 'U' }}
          </div>
          <div class="overflow-hidden">
            <p class="text-[11px] font-black uppercase tracking-widest truncate">{{ user?.name }}</p>
            <p class="text-[9px] text-slate-400 font-medium truncate italic">{{ user?.email }}</p>
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          class="w-full justify-start h-11 rounded-xl px-4 gap-4 text-red-500 hover:bg-red-50 hover:text-red-600 group"
          @click="logout"
        >
          <LucideLogOut class="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          <span class="text-[11px] font-black uppercase tracking-widest text-inherit">Log Out</span>
        </Button>
      </div>
    </aside>

    <!-- Mobile Header -->
    <header class="md:hidden bg-white border-b border-slate-200 p-4 flex items-center justify-between sticky top-0 z-50">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center">
          <LucideLayoutGrid class="w-4 h-4 text-white" />
        </div>
        <h2 class="text-xs font-black uppercase tracking-widest">D-MENU</h2>
      </div>
      <Sheet>
        <SheetTrigger as-child>
          <Button variant="ghost" size="icon">
            <LucideMenu class="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" class="w-72 p-6 flex flex-col">
          <!-- Mobile Sidebar Content Repeat (Simplified) -->
           <div class="flex-1 space-y-8">
             <div class="space-y-2">
                <Label class="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Current Shop</Label>
                <Select v-model="currentShopId">
                  <SelectTrigger class="w-full bg-slate-50 border-slate-200 h-11 rounded-xl text-xs font-black uppercase tracking-widest">
                    <SelectValue placeholder="Select Shop" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="shop in shops" :key="shop.id" :value="shop.id" class="text-xs font-bold uppercase tracking-widest">
                      {{ shop.name }}
                    </SelectItem>
                  </SelectContent>
                </Select>
             </div>
             <nav class="space-y-1">
                <Button 
                  v-for="link in navLinks" 
                  :key="link.to"
                  as-child
                  variant="ghost"
                  class="w-full justify-start h-11 rounded-xl px-4 gap-4"
                  :class="{ 'bg-slate-100 text-slate-900': route.path === link.to, 'text-slate-500': route.path !== link.to }"
                >
                  <NuxtLink :to="link.to">
                    <component :is="link.icon" class="w-4 h-4" />
                    <span class="text-[11px] font-bold uppercase tracking-widest">{{ link.label }}</span>
                  </NuxtLink>
                </Button>
              </nav>
           </div>
           <Button 
              variant="ghost" 
              class="w-full justify-start h-11 rounded-xl px-4 gap-4 text-red-500 hover:bg-red-50"
              @click="logout"
            >
              <LucideLogOut class="w-4 h-4" />
              <span class="text-[11px] font-black uppercase tracking-widest">Log Out</span>
            </Button>
        </SheetContent>
      </Sheet>
    </header>

    <!-- Content Area -->
    <main class="flex-1 p-6 md:p-10 lg:p-14 overflow-y-auto relative">
      <div class="max-w-6xl mx-auto">
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

const route = useRoute();
const router = useRouter();
const user = useState<any>('user');
const currentShopId = useState<string | null>('currentShopId', () => null);
const token = useCookie('token');

const navLinks = [
  { label: 'Live Orders', to: '/admin/orders', icon: LucideShoppingCart },
  { label: 'Menu Catalog', to: '/admin', icon: LucideChefHat },
  { label: 'Categories', to: '/admin/categories', icon: LucideList },
  { label: 'Shops/Branches', to: '/admin/shops', icon: LucideStore },
  { label: 'Platform Settings', to: '/admin/settings', icon: LucideSettings },
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

const logout = () => {
  token.value = null;
  user.value = null;
  currentShopId.value = null;
  router.push('/admin/login');
};
</script>
