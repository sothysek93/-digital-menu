<template>
  <div class="min-h-screen bg-background flex flex-col font-sans selection:bg-primary selection:text-primary-foreground">
    <!-- Header -->
    <header class="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border px-6 py-4 flex items-center justify-between transition-all">
      <div class="flex items-center gap-3">
        <div v-if="data?.shop?.logo_url" class="w-10 h-10 rounded-xl overflow-hidden shadow-md">
           <img :src="data.shop.logo_url" class="w-full h-full object-cover" />
        </div>
        <div v-else class="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
          <LucideChefHat class="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h1 class="text-[12px] font-black tracking-[0.2em] text-foreground uppercase">
             {{ data?.shop?.name || 'Menu Experience' }}
          </h1>
          <p v-if="data?.shop?.business_hours" class="text-[8px] font-bold text-muted-foreground uppercase tracking-widest leading-none mt-0.5">
            {{ data.shop.business_hours }}
          </p>
        </div>
      </div>
      <div v-if="table" class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted border border-border text-[10px] font-black uppercase tracking-widest text-muted-foreground shadow-sm">
        <div class="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
        Table {{ table }}
      </div>
    </header>

    <div class="flex-1 max-w-2xl mx-auto px-6 py-12 w-full space-y-16">
      <!-- Title Section -->
      <section class="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div class="space-y-2">
          <p class="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground leading-none">Welcome to</p>
          <h2 class="text-4xl md:text-5xl font-black tracking-tight text-foreground uppercase italic leading-[1.1] drop-shadow-sm">
            {{ data?.shop?.name || slug }}
          </h2>
        </div>
        <div class="h-1.5 w-16 bg-primary rounded-full shadow-sm"></div>
        <p class="text-muted-foreground text-sm font-medium pt-2 leading-relaxed max-w-md italic">
          {{ data?.shop?.description || 'Discover a curated collection of culinary selections crafted for your delight.' }}
        </p>
        <div v-if="data?.shop?.address" class="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest pt-2">
           <LucideMapPin class="w-3.5 h-3.5" />
           {{ data.shop.address }}
        </div>
      </section>

      <!-- Content Grid -->
      <div v-if="pending" class="space-y-12">
        <div v-for="i in 3" :key="i" class="space-y-4">
           <div class="h-4 w-32 bg-muted rounded animate-pulse"></div>
           <div class="grid grid-cols-1 gap-6">
              <div v-for="j in 2" :key="j" class="h-32 w-full bg-muted rounded-3xl animate-pulse"></div>
           </div>
        </div>
      </div>

      <div v-else class="space-y-20">
         <template v-for="(groupItems, categoryName) in groupedMenu" :key="categoryName">
           <section class="space-y-8 animate-in fade-in duration-1000">
             <div class="flex items-center gap-4">
               <h3 class="text-[12px] font-black uppercase tracking-[0.4em] text-muted-foreground whitespace-nowrap">{{ categoryName }}</h3>
               <div class="h-[1px] w-full bg-border"></div>
             </div>
             
             <div class="grid grid-cols-1 gap-12">
               <div v-for="item in groupItems" :key="item.id" class="flex items-start gap-6 group hover:translate-x-1 transition-transform cursor-pointer" @click="addToCart(item)">
                 <div class="relative w-24 h-24 md:w-32 md:h-32 shrink-0 rounded-3xl bg-muted overflow-hidden border border-border shadow-sm group-hover:shadow-md transition-shadow">
                   <img v-if="item.image_url" :src="item.image_url" class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                   <div v-else class="absolute inset-0 flex items-center justify-center text-muted-foreground/30">
                     <LucideChefHat class="w-8 h-8" />
                   </div>
                   <div class="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors"></div>
                 </div>
                 
                 <div class="flex-1 space-y-1.5 flex flex-col justify-center">
                    <div class="flex items-start justify-between">
                       <h4 class="font-black text-lg md:text-xl text-foreground leading-tight uppercase tracking-tight group-hover:text-primary transition-colors">{{ item.name }}</h4>
                       <span class="font-mono font-bold text-foreground text-sm md:text-base">${{ item.price.toFixed(2) }}</span>
                    </div>
                    <p class="text-[11px] text-muted-foreground font-medium italic line-clamp-2 leading-relaxed">{{ item.description }}</p>
                    <div class="pt-2 flex items-center gap-2">
                       <Button size="xs" variant="secondary" class="h-7 px-2.5 rounded-full text-[9px] font-black uppercase tracking-widest">
                         <LucidePlus class="w-3 h-3 mr-1" />
                         Add to Basket
                       </Button>
                    </div>
                 </div>
               </div>
             </div>
           </section>
         </template>
      </div>

      <!-- Empty State -->
      <div v-if="!pending && (!data?.items || data.items.length === 0)" class="py-32 text-center text-muted-foreground font-medium italic">
        Our menu is evolving. Please visit later!
      </div>
    </div>
    
    <!-- Floating Cart Button -->
    <transition enter-active-class="transition duration-300 ease-out" enter-from-class="translate-y-20 opacity-0" enter-to-class="translate-y-0 opacity-100" leave-active-class="transition duration-200 ease-in" leave-from-class="translate-y-0 opacity-100" leave-to-class="translate-y-20 opacity-0">
      <div v-if="cartTotalItems > 0" class="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] w-full max-w-sm px-6">
        <Sheet>
          <SheetTrigger as-child>
            <Button class="w-full h-15 rounded-3xl bg-primary text-primary-foreground shadow-2xl flex items-center justify-between px-6 transform hover:scale-[1.02] active:scale-[0.98] transition-all group">
              <div class="flex items-center gap-3">
                 <div class="relative">
                   <LucideShoppingCart class="w-6 h-6 group-hover:rotate-12 transition-transform" />
                   <span class="absolute -top-2 -right-2 bg-background text-foreground text-[9px] font-black px-1.5 py-0.5 rounded-full ring-2 ring-primary">
                     {{ cartTotalItems }}
                   </span>
                 </div>
                 <div class="flex flex-col items-start leading-none">
                    <span class="text-[11px] font-black uppercase tracking-widest">Review Basket</span>
                    <span class="text-[9px] text-primary-foreground/60 font-bold uppercase tracking-widest">{{ cartTotalItems }} items selected</span>
                 </div>
              </div>
              <span class="font-mono font-black text-base italic">${{ cartTotalValue.toFixed(2) }}</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" class="h-[85vh] rounded-t-[50px] px-8 pt-10 pb-12 flex flex-col border-t-0 shadow-[0_-20px_50px_-15px_rgba(0,0,0,0.1)]">
            <SheetHeader class="space-y-1 mb-8">
              <p class="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Order Overview</p>
              <SheetTitle class="text-4xl font-black uppercase italic text-foreground leading-none tracking-tighter">Your Selection</SheetTitle>
            </SheetHeader>
            
            <div class="flex-1 overflow-y-auto space-y-6 px-1 scrollbar-hide">
               <div v-for="item in cart" :key="item.id" class="flex items-center justify-between gap-4 py-3 border-b border-border last:border-0 border-dashed">
                 <div class="flex-1">
                   <h5 class="font-black text-sm text-foreground uppercase tracking-tight">{{ item.name }}</h5>
                   <p class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">${{ item.price.toFixed(2) }}</p>
                 </div>
                 <div class="flex items-center gap-4">
                    <div class="flex items-center bg-muted rounded-2xl px-2 py-1.5 ring-1 ring-border/50">
                       <button @click="removeFromCart(item.id)" class="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                          <LucideMinus class="w-3.5 h-3.5" />
                       </button>
                       <span class="w-8 text-center text-xs font-black font-mono">{{ item.quantity }}</span>
                       <button @click="addToCart(item)" class="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                          <LucidePlus class="w-3.5 h-3.5" />
                       </button>
                    </div>
                    <span class="font-mono font-black text-xs min-w-[60px] text-right">${{ (item.price * item.quantity).toFixed(2) }}</span>
                 </div>
               </div>
            </div>

            <div class="pt-8 border-t border-border space-y-8">
               <div class="space-y-6">
                  <div class="space-y-3">
                    <Label class="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Dining Details</Label>
                    <div class="grid grid-cols-2 gap-4">
                       <Input v-model="orderForm.customer_name" placeholder="Name" class="rounded-[20px] h-13 text-xs font-bold bg-muted border-transparent transition-all focus:bg-background focus:ring-primary" />
                       <Input v-model="orderForm.table_number" placeholder="Table #" class="rounded-[20px] h-13 text-xs font-bold bg-muted border-transparent transition-all focus:bg-background focus:ring-primary" />
                    </div>
                  </div>
                  <div class="flex items-end justify-between py-2 border-b border-border border-dashed pb-6">
                    <div class="space-y-1">
                      <span class="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground block leading-none">Order Total</span>
                      <span class="text-[9px] text-muted-foreground/50 font-bold uppercase tracking-widest">Pricing shown with no hidden fees</span>
                    </div>
                    <span class="text-4xl font-black italic text-foreground leading-none tracking-tighter">${{ cartTotalValue.toFixed(2) }}</span>
                  </div>
               </div>

               <Button class="w-full h-16 rounded-[24px] bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] text-xs shadow-2xl active:scale-95 transition-all" @click="submitOrder" :disabled="isSubmitting || !orderForm.table_number">
                  <LucideLoader2 v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
                  Proceed to Order
               </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </transition>

    <div v-if="orderSuccess" class="fixed inset-0 z-[100] bg-background/95 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in zoom-in duration-500">
      <div class="max-w-sm w-full text-center space-y-8">
        <div class="relative mx-auto w-24 h-24">
          <div class="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
          <div class="relative bg-primary rounded-full w-full h-full flex items-center justify-center shadow-2xl">
            <LucideCheck class="w-12 h-12 text-primary-foreground" />
          </div>
        </div>
        <div class="space-y-2">
          <h2 class="text-3xl font-black uppercase italic text-foreground tracking-tighter">Order Received</h2>
          <p class="text-muted-foreground text-sm font-medium leading-relaxed">
            Your table #{{ orderForm.table_number }} order is being prepared by our chefs right now.
          </p>
        </div>
        <Button class="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-[10px]" @click="orderSuccess = false">
           Back to Menu
        </Button>
      </div>
    </div>

    <!-- Footer -->
    <footer class="py-24 border-t border-border text-center space-y-6 flex flex-col items-center">
      <div v-if="data?.shop?.logo_url" class="w-12 h-12 rounded-2xl overflow-hidden opacity-30 grayscale hover:grayscale-0 transition-all duration-500">
         <img :src="data.shop.logo_url" class="w-full h-full object-cover" />
      </div>
      <div v-else class="w-10 h-10 rounded-xl bg-muted flex items-center justify-center border border-border">
         <LucideChefHat class="w-5 h-5 text-muted-foreground/20" />
      </div>
      <div class="space-y-2">
        <p class="text-[9px] font-black text-muted-foreground/50 uppercase tracking-[0.5em] leading-none mb-1">Authenticated by</p>
        <p class="text-[12px] font-black text-foreground uppercase tracking-widest italic">{{ data?.shop?.name || 'Digital Menu Platform' }}</p>
        <p v-if="data?.shop?.phone" class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{{ data.shop.phone }}</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { 
  ChefHat as LucideChefHat, Search as LucideSearch, Plus as LucidePlus, ShoppingCart as LucideShoppingCart,
  Minus as LucideMinus, Loader2 as LucideLoader2, MapPin as LucideMapPin, Info as LucideInfo,
  Check as LucideCheck
} from 'lucide-vue-next';
import { Button } from '~/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '~/components/ui';
import { Label } from '~/components/ui/label';
import { Input } from '~/components/ui/input';
import { toast } from 'vue-sonner';

const route = useRoute();
const slug = route.params.slug as string;
const table = ref(route.query.table as string || '');

// Define Interfaces
interface OrderItem {
  menu_item_id: string;
  quantity: number;
  price_at_time: number;
}

// Fetch Menu Data (Shop + Items)
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

// Cart Logic
const cart = useState<any[]>('menu-cart', () => []);
const cartTotalItems = computed(() => cart.value.reduce((sum, item) => sum + item.quantity, 0));
const cartTotalValue = computed(() => cart.value.reduce((sum, item) => sum + (item.price * item.quantity), 0));

const addToCart = (item: any) => {
  const existing = cart.value.find(i => i.id === item.id);
  if (existing) {
    existing.quantity++;
  } else {
    cart.value.push({ ...item, quantity: 1 });
    toast.success(`${item.name} added`, {
      description: 'Your selection has been updated.'
    });
  }
};

const removeFromCart = (id: string) => {
  const existing = cart.value.find(i => i.id === id);
  if (existing) {
    existing.quantity--;
    if (existing.quantity === 0) {
      cart.value = cart.value.filter(i => i.id !== id);
    }
  }
};

// Order Submission
const isSubmitting = ref(false);
const orderSuccess = ref(false);
const orderForm = reactive({
  customer_name: '',
  table_number: table.value,
  notes: ''
});

// Sync table from URL if it changes
watch(() => route.query.table, (newTable) => {
  if (newTable) table.value = newTable as string;
  orderForm.table_number = table.value;
});

const submitOrder = async () => {
  if (cart.value.length === 0 || !orderForm.table_number) {
    toast.error('Details needed', { description: 'Please provide your table number.' });
    return;
  }
  
  isSubmitting.value = true;
  try {
    const shopId = data.value?.shop?.id;
    
    await $fetch('/api/public/orders', {
      method: 'POST',
      body: {
        shop_id: shopId,
        table_number: orderForm.table_number,
        customer_name: orderForm.customer_name,
        notes: orderForm.notes,
        items: cart.value.map(i => ({
          menu_item_id: i.id,
          quantity: i.quantity,
          price_at_time: i.price
        }))
      }
    });

    orderSuccess.value = true;
    cart.value = [];
  } catch (e) {
    console.error('Order error:', e);
    toast.error('Order failed', { description: 'Please check your connection.' });
  } finally {
    isSubmitting.value = false;
  }
};
</script>
