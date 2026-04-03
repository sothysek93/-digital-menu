<template>
  <div class="min-h-screen bg-background flex flex-col font-sans selection:bg-primary selection:text-primary-foreground text-foreground">
    <!-- Clean Minimalist Header -->
    <header class="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div v-if="data?.shop?.logo_url" class="w-8 h-8 rounded-lg overflow-hidden border border-border">
           <img :src="data.shop.logo_url" class="w-full h-full object-cover" />
        </div>
        <div v-else class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
           <LucideChefHat class="w-4 h-4 text-primary" />
        </div>
        <div>
          <h1 class="text-[11px] font-bold tracking-tight text-foreground uppercase">
             {{ data?.shop?.name || 'Digital Menu' }}
          </h1>
          <div v-if="table" class="flex items-center gap-1.5 mt-0.5 text-[9px] font-medium text-muted-foreground uppercase">
             <span class="w-1 h-1 rounded-full bg-emerald-500"></span>
             Table {{ table }}
          </div>
        </div>
      </div>
      
      <!-- Minimalist Tracking Button -->
      <div v-if="persistedOrderIds.length > 0">
         <Button variant="outline" size="sm" class="h-8 rounded-lg text-[10px] font-bold uppercase px-3 gap-2" @click="viewRecentOrder">
            <LucideLoader2 v-if="isLoadingActiveOrder" class="w-3 h-3 animate-spin text-primary" />
            <LucideEye v-else class="w-3 h-3" />
            Track Status
         </Button>
      </div>
    </header>

    <!-- Clean Category Navigation -->
    <div v-if="!pending && Object.keys(groupedMenu).length > 1" class="sticky top-[57px] z-40 bg-background/95 backdrop-blur-sm border-b border-border py-2 overflow-x-auto scrollbar-hide">
      <div class="px-4 flex items-center gap-2 w-max mx-auto">
        <button 
          v-for="(_, catName) in groupedMenu" 
          :key="catName"
          @click="scrollToCategory(catName)"
          class="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all whitespace-nowrap border"
          :class="activeCategory === catName ? 'bg-foreground text-background border-foreground shadow-sm' : 'bg-background text-muted-foreground border-border hover:border-foreground/50'"
        >
          {{ catName }}
        </button>
      </div>
    </div>

    <div class="flex-1 max-w-xl mx-auto px-4 py-8 w-full space-y-12">
      <!-- Minimalist Shop Info -->
      <section class="space-y-4 animate-in fade-in duration-500">
        <div class="space-y-1 text-center">
          <h2 class="text-3xl font-bold tracking-tight text-foreground">{{ data?.shop?.name || slug }}</h2>
          <p class="text-muted-foreground text-sm font-medium leading-relaxed max-w-sm mx-auto">
            {{ data?.shop?.description || 'Curated culinary selections.' }}
          </p>
        </div>
        <div v-if="data?.shop?.address" class="flex items-center justify-center gap-1.5 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wide">
           <LucideMapPin class="w-3 h-3" />
           {{ data.shop.address }}
        </div>
      </section>

      <!-- Menu Feed -->
      <div v-if="pending" class="space-y-10">
        <div v-for="i in 3" :key="i" class="space-y-4">
           <div class="h-3 w-24 bg-muted rounded-full animate-pulse"></div>
           <div class="space-y-4">
              <div v-for="j in 2" :key="j" class="h-24 w-full bg-muted rounded-xl animate-pulse"></div>
           </div>
        </div>
      </div>

      <div v-else class="space-y-12">
         <template v-for="(groupItems, categoryName) in groupedMenu" :key="categoryName">
           <section :id="`cat-${categoryName}`" class="scroll-mt-28 space-y-6 animate-in fade-in duration-700">
             <h3 class="text-[10px] font-bold uppercase text-muted-foreground tracking-[0.2em] px-1">{{ categoryName }}</h3>
             
             <div class="space-y-1">
                <Card v-for="item in groupItems" :key="item.id" 
                  class="flex items-center gap-4 p-3 border-none hover:bg-muted/50 transition-colors cursor-pointer group shadow-none" 
                  @click="addToCart(item)"
                >
                  <div class="relative w-16 h-16 shrink-0 rounded-lg bg-muted overflow-hidden border border-border">
                    <img v-if="item.image_url" :src="item.image_url" class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div v-else class="absolute inset-0 flex items-center justify-center text-muted-foreground/20">
                      <LucideChefHat class="w-5 h-5" />
                    </div>
                  </div>
                  
                  <div class="flex-1 min-w-0 pr-1">
                     <div class="flex items-start justify-between gap-2">
                        <h4 class="font-bold text-sm text-foreground truncate uppercase tracking-tight">{{ item.name }}</h4>
                        <span class="font-mono font-bold text-sm text-foreground shrink-0">${{ item.price.toFixed(2) }}</span>
                     </div>
                     <p class="text-[11px] text-muted-foreground font-medium line-clamp-1 mt-0.5 leading-tight">{{ item.description }}</p>
                     <div class="mt-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <span class="text-[8px] font-black uppercase bg-primary text-primary-foreground px-2 py-0.5 rounded">Quick Add +</span>
                     </div>
                  </div>
                </Card>
             </div>
           </section>
         </template>
      </div>

      <!-- Empty State -->
      <div v-if="!pending && (!data?.items || data.items.length === 0)" class="py-24 text-center text-muted-foreground text-xs font-medium">
        No active items in the menu.
      </div>
    </div>
    
    <!-- Minimalist Floating Cart -->
    <div v-if="cartTotalItems > 0 && !isSheetOpen && !orderSuccess" 
      class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] w-max animate-in fade-in slide-in-from-bottom-4 duration-300"
    >
        <Button class="h-12 rounded-full bg-foreground text-background shadow-xl flex items-center gap-4 px-6 hover:scale-105 transition-transform active:scale-95" @click="isSheetOpen = true">
            <div class="flex items-center gap-2 pr-4 border-r border-background/20">
               <LucideShoppingCart class="w-4 h-4" />
               <span class="text-xs font-black">{{ cartTotalItems }}</span>
            </div>
            <span class="text-xs font-black uppercase tracking-widest leading-none">Review Basket • ${{ cartTotalValue.toFixed(2) }}</span>
        </Button>
    </div>

    <!-- Standard ShadCN Sheet for Checkout -->
    <Sheet v-model:open="isSheetOpen">
      <SheetContent side="bottom" class="h-[80vh] rounded-t-3xl px-6 pt-8 pb-10 flex flex-col border-t-0 shadow-2xl z-[130]">
        <SheetHeader class="space-y-0.5 border-b border-border pb-4 mb-4">
          <SheetTitle class="text-2xl font-bold tracking-tight uppercase">Your Order</SheetTitle>
          <p class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Select items for table {{ table || '?' }}</p>
        </SheetHeader>
        
        <div class="flex-1 overflow-y-auto space-y-4 px-1 scrollbar-hide">
           <div v-for="item in cart" :key="item.id" class="flex items-center justify-between gap-4 py-2 border-b border-border last:border-0">
             <div class="flex-1 min-w-0">
               <h5 class="font-bold text-xs text-foreground uppercase truncate">{{ item.name }}</h5>
               <p class="text-[10px] font-medium text-muted-foreground shrink-0">${{ item.price.toFixed(2) }}</p>
             </div>
             <div class="flex items-center gap-3">
                <div class="flex items-center bg-muted rounded-lg px-1.5 py-1 ring-1 ring-border">
                   <button @click="removeFromCart(item.id)" class="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-foreground">
                      <LucideMinus class="w-3 h-3" />
                   </button>
                   <span class="w-6 text-center text-[10px] font-bold">{{ item.quantity }}</span>
                   <button @click="addToCart(item)" class="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-foreground">
                      <LucidePlus class="w-3 h-3" />
                   </button>
                </div>
                <span class="font-mono font-bold text-xs min-w-[50px] text-right">${{ (item.price * item.quantity).toFixed(2) }}</span>
             </div>
           </div>
        </div>

        <div class="pt-6 border-t border-border space-y-6">
           <div class="space-y-3">
              <div class="grid grid-cols-2 gap-3">
                 <div class="space-y-1">
                    <Label class="text-[9px] font-bold uppercase text-muted-foreground px-1">Full Name</Label>
                    <Input v-model="orderForm.customer_name" placeholder="Optional" class="h-10 text-xs rounded-lg" />
                 </div>
                 <div class="space-y-1">
                    <Label class="text-[9px] font-bold uppercase text-muted-foreground px-1">Table #</Label>
                    <Input v-model="orderForm.table_number" placeholder="Required" class="h-10 text-xs rounded-lg" />
                 </div>
              </div>
           </div>

           <div class="flex items-center justify-between">
              <span class="text-xs font-bold uppercase text-muted-foreground">Order Total</span>
              <span class="text-2xl font-bold tracking-tight">${{ cartTotalValue.toFixed(2) }}</span>
           </div>

           <Button class="w-full h-12 rounded-xl bg-foreground text-background font-bold uppercase tracking-widest text-[10px]" @click="submitOrder" :disabled="isSubmitting || !orderForm.table_number">
              <LucideLoader2 v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
              Place My Order
           </Button>
        </div>
      </SheetContent>
    </Sheet>

    <!-- Success / Tracking Overlay -->
    <div v-if="orderSuccess" class="fixed inset-0 z-[150] bg-background/95 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in zoom-in duration-300">
      <Card class="max-w-md w-full p-8 text-center space-y-6 shadow-2xl border-border max-h-[90vh] overflow-hidden flex flex-col">
        <div class="flex items-center justify-between pb-4 border-b border-border">
          <div class="flex items-center gap-3">
             <div class="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white">
                <LucideCheck class="w-5 h-5" />
             </div>
             <div class="text-left">
                <h2 class="text-sm font-bold uppercase tracking-tight">Active Track</h2>
                <p class="text-[9px] font-bold text-muted-foreground uppercase opacity-60">Table {{ table || '?' }} Queue</p>
             </div>
          </div>
          <Button variant="ghost" size="icon" class="h-8 w-8 rounded-lg" @click="orderSuccess = false">
             <LucideXCircle class="w-4 h-4 text-muted-foreground" />
          </Button>
        </div>
        
        <div class="flex-1 overflow-y-auto space-y-6 py-4 scrollbar-hide">
           <div v-if="activeOrders.length === 0 && isLoadingActiveOrder" class="py-12 flex flex-col items-center">
              <LucideLoader2 class="w-8 h-8 animate-spin text-muted-foreground/20" />
              <p class="text-[10px] font-bold text-muted-foreground mt-4 uppercase animate-pulse">Syncing tickets...</p>
           </div>
           
           <div v-for="order in activeOrders" :key="order.id" class="space-y-3 bg-muted/30 rounded-lg p-5 border border-border/50 text-left">
              <div class="flex items-center justify-between">
                 <div class="flex items-center gap-2">
                    <span class="text-[9px] font-mono font-bold px-2 py-0.5 bg-background border border-border rounded-md">#{{ order.id.slice(-6).toUpperCase() }}</span>
                    <Badge :variant="getStatusVariant(order.status)" class="rounded-md text-[8px] font-bold uppercase h-5 px-1.5">{{ order.status }}</Badge>
                 </div>
                 <span class="text-[9px] font-bold text-muted-foreground">{{ formatTime(order.created_at) }}</span>
              </div>

              <div class="space-y-1.5 pt-2">
                 <div v-for="item in order.items" :key="item.id" class="flex items-center justify-between text-[11px] font-medium text-foreground">
                    <span class="truncate pr-4 uppercase tracking-tighter opacity-80"><span class="font-bold">×{{ item.quantity }}</span> {{ item.item_name }}</span>
                    <span class="font-mono text-[9px] opacity-40 shrink-0">${{ (item.price_at_time * item.quantity).toFixed(2) }}</span>
                 </div>
              </div>

              <div class="pt-3 border-t border-border/30 flex items-center justify-between">
                 <span class="text-[9px] font-bold text-muted-foreground uppercase opacity-60">Order Value</span>
                 <span class="text-[11px] font-bold text-foreground font-mono">${{ order.total_price?.toFixed(2) }}</span>
              </div>
           </div>

           <div v-if="!isLoadingActiveOrder && activeOrders.length === 0" class="py-12 text-center text-muted-foreground text-xs font-medium italic">
             No active orders detected for this session.
           </div>
        </div>

        <Button class="w-full h-11 rounded-lg bg-foreground text-background font-bold uppercase tracking-widest text-[10px] mt-4" @click="orderSuccess = false">
           Return to Menu
        </Button>
      </Card>
    </div>

    <!-- Clean Minimalist Footer -->
    <footer class="py-10 border-t border-border text-center space-y-4 bg-muted/10">
      <div v-if="data?.shop?.logo_url" class="w-8 h-8 rounded-lg overflow-hidden opacity-20 mx-auto grayscale">
         <img :src="data.shop.logo_url" class="w-full h-full object-cover" />
      </div>
      <div class="space-y-1 opacity-40">
        <p class="text-[8px] font-bold text-muted-foreground uppercase tracking-[0.4em]">Powered by</p>
        <p class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">{{ data?.shop?.name || 'System' }}</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { 
  ChefHat as LucideChefHat, Search as LucideSearch, Plus as LucidePlus, ShoppingCart as LucideShoppingCart,
  Minus as LucideMinus, Loader2 as LucideLoader2, MapPin as LucideMapPin, Info as LucideInfo,
  Check as LucideCheck, Eye as LucideEye, XCircle as LucideXCircle
} from 'lucide-vue-next';
import { Button } from '~/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, Card } from '~/components/ui';
import { Label } from '~/components/ui/label';
import { Input } from '~/components/ui/input';
import { Badge } from '~/components/ui/badge';
import { toast } from 'vue-sonner';

const route = useRoute();
const slug = route.params.slug as string;
const table = ref(route.query.table as string || '');

// Core State
const isSheetOpen = ref(false);
const orderSuccess = ref(false);
const isSubmitting = ref(false);
const activeCategory = ref('');
const activeOrders = ref<any[]>([]);
const isLoadingActiveOrder = ref(false);
const cart = useState<any[]>('menu-cart', () => []);
const persistedOrderIds = useState<string[]>('active-order-ids', () => []);

// Fetch Menu Data
const { data, pending } = await useFetch<any>(`/api/public/menu?slug=${slug}` as any, {
  key: `menu-live-${slug}`
});

// Grouped Menu Logic
const groupedMenu = computed(() => {
  if (!data.value?.items) return {};
  const groups: Record<string, any[]> = {};
  data.value.items.forEach((item: any) => {
    const cat = item.category_name || 'House Specialities';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(item);
  });
  return groups;
});

// Cart Metrics
const cartTotalItems = computed(() => cart.value.reduce((sum, item) => sum + item.quantity, 0));
const cartTotalValue = computed(() => cart.value.reduce((sum, item) => sum + (item.price * item.quantity), 0));

// Logic: Fetch Active Order Statuses
const fetchActiveOrders = async () => {
    if (persistedOrderIds.value.length === 0) return;
    isLoadingActiveOrder.value = true;
    try {
        const results = await Promise.all(
            persistedOrderIds.value.map(id => $fetch(`/api/public/orders/${id}`).catch(() => null))
        );
        // Filter out nulls and sort by date (newest first)
        activeOrders.value = (results.filter(o => o !== null) as any[]).sort((a,b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    } catch (e) {
        console.error('Track orders failed', e);
    } finally {
        isLoadingActiveOrder.value = false;
    }
};

// Lifecycle: Unified Hydration
let pollTimer: any = null;

onMounted(() => {
  if (process.client) {
    // 1. Hydrate Cart
    const savedBasket = localStorage.getItem(`basket_v1_${slug}`);
    if (savedBasket && cart.value.length === 0) {
      try { 
        const parsed = JSON.parse(savedBasket); 
        if (Array.isArray(parsed)) cart.value = parsed;
      } catch (e) { console.error('Basket hydration failed', e); }
    }

    // 2. Hydrate Order Tracking (Array-based)
    const savedIds = localStorage.getItem('active_order_ids_v1');
    if (savedIds) {
      try {
        const parsed = JSON.parse(savedIds);
        if (Array.isArray(parsed)) {
            persistedOrderIds.value = parsed;
            fetchActiveOrders();
        }
      } catch (e) { console.error('Ids hydration failed', e); }
    }

    // Start Polling for status updates if we have active IDs
    pollTimer = setInterval(() => {
        if (persistedOrderIds.value.length > 0 && !isLoadingActiveOrder.value) {
            fetchActiveOrders();
        }
    }, 8000);
  }
});

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer);
});

// Watch: Persist Cart Changes
watch(cart, (newCart) => {
    if (process.client) {
        localStorage.setItem(`basket_v1_${slug}`, JSON.stringify(newCart));
    }
}, { deep: true });

// Actions
const scrollToCategory = (catName: string) => {
  activeCategory.value = catName;
  const el = document.getElementById(`cat-${catName}`);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
};

const addToCart = (item: any) => {
  const existing = cart.value.find(i => i.id === item.id);
  if (existing) {
    existing.quantity++;
  } else {
    cart.value.push({ ...item, quantity: 1 });
  }
  toast.success('Added to basket', { description: `${item.name} is ready.` });
};

const removeFromCart = (id: string) => {
  const existingIndex = cart.value.findIndex(i => i.id === id);
  if (existingIndex > -1) {
    const item = cart.value[existingIndex];
    item.quantity--;
    if (item.quantity === 0) cart.value.splice(existingIndex, 1);
  }
};

const orderForm = reactive({
  customer_name: '',
  table_number: table.value,
  notes: ''
});

watch(() => route.query.table, (newTable) => {
  if (newTable) {
      table.value = newTable as string;
      orderForm.table_number = table.value;
  }
});

const submitOrder = async () => {
  if (cart.value.length === 0 || !orderForm.table_number) return;
  
  isSubmitting.value = true;
  try {
    const res = await $fetch('/api/public/orders' as any, {
      method: 'POST',
      body: {
        shop_id: data.value?.shop?.id,
        table_number: orderForm.table_number,
        customer_name: orderForm.customer_name,
        items: cart.value.map(i => ({
          menu_item_id: i.id,
          quantity: i.quantity,
          price_at_time: i.price
        }))
      }
    }) as any;

    if (res.id) {
        persistedOrderIds.value.push(res.id);
        if (process.client) {
            localStorage.setItem('active_order_ids_v1', JSON.stringify(persistedOrderIds.value));
        }
        fetchActiveOrders();
    }

    toast.success('Ticket Sent', { description: 'Our chef is notified.' });
    orderSuccess.value = true;
    isSheetOpen.value = false;
    cart.value = [];
    if (process.client) localStorage.removeItem(`basket_v1_${slug}`);
  } catch (e: any) {
    toast.error('Dispatch failed', { description: e.data?.message || 'Check connection.' });
  } finally {
    isSubmitting.value = false;
  }
};

const viewRecentOrder = () => {
    fetchActiveOrders();
    orderSuccess.value = true;
};

const getStatusVariant = (status: string) => {
    const map: Record<string, string> = {
        'pending': 'destructive',
        'preparing': 'default',
        'served': 'secondary',
        'completed': 'outline',
        'cancelled': 'outline'
    };
    return (map[status] || 'secondary') as any;
};

const formatTime = (dateStr: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
</script>
