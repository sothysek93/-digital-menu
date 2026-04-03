<template>
  <div class="min-h-screen bg-background flex flex-col md:flex-row text-foreground selection:bg-primary selection:text-primary-foreground font-sans">
    <!-- Clean Minimalist Sidebar -->
    <aside class="hidden md:flex w-64 bg-background border-r border-border flex-col p-6 shrink-0 h-screen sticky top-0">
      <div class="space-y-8 flex-1 overflow-y-auto scrollbar-hide">
        <div class="flex items-center gap-3 px-1">
          <div class="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
            <LucideLayoutGrid class="w-4 h-4 text-background" />
          </div>
          <div>
            <h2 class="text-xs font-bold uppercase tracking-wider leading-none text-foreground">Admin Console</h2>
            <p class="text-[9px] text-muted-foreground font-semibold uppercase tracking-tight mt-1">Digital Menu v1.0</p>
          </div>
        </div>

        <!-- Minimalist Shop Context -->
        <div class="px-1 space-y-2">
          <Label class="text-[10px] font-bold uppercase text-muted-foreground ml-0.5 mb-1.5 block tracking-widest">Active Store</Label>
          <div v-if="pendingShops" class="h-10 bg-muted animate-pulse rounded-lg border border-border"></div>
          <Select v-else :model-value="currentShopId || ''" @update:model-value="onShopChange">
            <SelectTrigger class="w-full bg-background border-border h-10 rounded-lg text-xs font-medium px-3 hover:bg-accent transition-colors">
              <SelectValue :placeholder="shops?.length ? 'Selecting...' : 'No Locations'" />
            </SelectTrigger>
            <SelectContent class="rounded-lg border-border bg-popover">
              <SelectItem v-for="shop in (shops as any[]) || []" :key="shop.id" :value="shop.id" class="text-xs font-medium rounded-md m-1 py-2 pr-2 pl-8">
                {{ shop.name }}
              </SelectItem>
              <SelectSeparator class="bg-border" />
              <NuxtLink to="/admin/shops" class="flex items-center w-full px-5 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-all rounded-md m-1">
                <LucidePlus class="w-3.5 h-3.5 mr-2" />
                Manage Branches
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
            class="w-full justify-start h-10 rounded-lg px-3 gap-3 transition-colors hover:bg-accent"
            :class="{ 'bg-accent text-accent-foreground font-bold': route.path === link.to, 'text-muted-foreground': route.path !== link.to }"
          >
            <NuxtLink :to="link.to">
              <component :is="link.icon" class="w-4 h-4 shrink-0" />
              <span class="text-xs">{{ link.label }}</span>
            </NuxtLink>
          </Button>
        </nav>
      </div>

      <div class="pt-6 border-t border-border space-y-6">
        <div class="flex items-center gap-3 px-1">
          <div class="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center text-[10px] font-bold text-foreground">
            {{ user?.name?.charAt(0) || 'U' }}
          </div>
          <div class="overflow-hidden">
            <p class="text-xs font-bold truncate text-foreground">{{ user?.name }}</p>
            <p class="text-[10px] text-muted-foreground truncate font-medium">{{ user?.email }}</p>
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          class="w-full justify-start h-10 rounded-lg px-3 gap-3 text-muted-foreground hover:bg-destructive/5 hover:text-destructive transition-colors group"
          @click="handleLogout"
        >
          <LucideLogOut class="w-4 h-4" />
          <span class="text-xs font-medium">Log Out</span>
        </Button>
      </div>
    </aside>

    <!-- Mobile Header -->
    <header class="md:hidden bg-background border-b border-border p-4 flex items-center justify-between sticky top-0 z-50">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
          <LucideLayoutGrid class="w-4 h-4 text-background" />
        </div>
        <h2 class="text-xs font-bold uppercase tracking-wider text-foreground">Admin</h2>
      </div>
      <Sheet>
        <SheetTrigger as-child>
          <Button variant="outline" size="icon" class="rounded-lg h-9 w-9">
            <LucideMenu class="w-4 h-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" class="w-72 p-6 flex flex-col bg-background border-r border-border z-[200]">
           <div class="flex-1 space-y-8">
             <div class="space-y-2 px-1">
                <Label class="text-[10px] font-bold uppercase text-muted-foreground tracking-widest ml-0.5">Location Manager</Label>
                <Select :model-value="currentShopId || ''" @update:model-value="onShopChange">
                  <SelectTrigger class="w-full bg-background border-border h-11 rounded-lg text-xs font-medium px-4">
                    <SelectValue placeholder="Selecting..." />
                  </SelectTrigger>
                  <SelectContent class="rounded-lg border-border bg-popover">
                    <SelectItem v-for="shop in (shops as any[]) || []" :key="shop.id" :value="shop.id" class="text-xs font-medium py-2.5 px-4 rounded-md m-1">
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
                  class="w-full justify-start h-11 rounded-lg px-4 gap-4"
                  :class="{ 'bg-accent text-accent-foreground font-bold': route.path === link.to, 'text-muted-foreground': route.path !== link.to }"
                >
                  <NuxtLink :to="link.to">
                    <component :is="link.icon" class="w-4 h-4" />
                    <span class="text-xs">{{ link.label }}</span>
                  </NuxtLink>
                </Button>
              </nav>
           </div>
           
           <div class="pt-6 border-t border-border mt-auto">
             <Button 
                variant="ghost" 
                class="w-full justify-start h-11 rounded-lg px-4 gap-4 text-muted-foreground hover:bg-destructive/5 hover:text-destructive"
                @click="handleLogout"
              >
                <LucideLogOut class="w-4 h-4" />
                <span class="text-xs font-medium tracking-tight">Log Out</span>
              </Button>
           </div>
        </SheetContent>
      </Sheet>
    </header>

    <!-- Main Content Area -->
    <main class="flex-1 p-6 md:p-8 lg:p-12 overflow-y-auto">
      <div class="max-w-5xl mx-auto animate-in fade-in duration-500">
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
