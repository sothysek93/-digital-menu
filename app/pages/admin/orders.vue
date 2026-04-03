<template>
  <div class="space-y-8 pb-20 animate-in fade-in duration-500">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h2 class="text-3xl font-bold tracking-tight text-foreground">Live Orders</h2>
        <p class="text-muted-foreground text-sm">Real-time incoming orders from your QR menu.</p>
      </div>
      <div v-if="pending" class="flex items-center gap-2 text-primary text-[10px] font-black uppercase tracking-widest bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
         <LucideLoader2 class="w-3 h-3 animate-spin" />
         Updating...
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- High Priority / New Orders -->
      <div class="lg:col-span-2 space-y-6">
        <div v-for="order in sortedOrders" :key="order.id" 
          class="bg-card border border-border rounded-3xl overflow-hidden shadow-sm hover:border-primary/30 transition-all group"
        >
          <div class="p-6 flex items-start justify-between border-b border-border/50">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-black text-lg shadow-lg group-hover:scale-105 transition-transform">
                #{{ order.table_number || '?' }}
              </div>
              <div>
                <p class="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">
                  Table Order • {{ formatTime(order.created_at) }}
                </p>
                <h3 class="font-bold text-foreground text-lg leading-tight uppercase">
                  {{ order.customer_name || 'Guest' }}
                </h3>
              </div>
            </div>
            <div class="flex flex-col items-end gap-2 text-right">
              <Badge :variant="getStatusVariant(order.status)" class="rounded-full px-3 py-1 text-[10px] uppercase font-black tracking-widest shadow-sm">
                {{ order.status }}
              </Badge>
              <p class="font-mono font-bold text-foreground tracking-tighter text-lg">${{ order.total_price?.toFixed(2) }}</p>
            </div>
          </div>

          <div class="px-6 py-6 border-b border-border/30 bg-muted/20">
             <div class="grid col-span-1 gap-3">
                <div v-for="item in order.items" :key="item.id" class="flex items-center justify-between text-xs font-medium">
                   <div class="flex items-center gap-3">
                      <span class="w-6 h-6 rounded-lg bg-background border border-border flex items-center justify-center font-black text-[10px]">{{ item.quantity }}x</span>
                      <span class="text-foreground uppercase tracking-tight">{{ item.item_name }}</span>
                   </div>
                   <span class="font-mono text-muted-foreground">${{ (item.price_at_time * item.quantity).toFixed(2) }}</span>
                </div>
             </div>
          </div>

          <div class="px-6 py-4 space-y-4">
             <!-- Order Action Buttons -->
             <div class="flex items-center gap-2">
               <Button v-if="order.status === 'pending'" size="sm" class="flex-1 rounded-xl font-black uppercase tracking-widest text-[10px] h-10 bg-primary text-primary-foreground hover:translate-y-[-2px] transition-transform" @click="updateStatus(order.id, 'preparing', 'Order Accepted')">
                 Accept & Prepare
               </Button>
               <Button v-if="order.status === 'preparing'" size="sm" class="flex-1 rounded-xl font-black uppercase tracking-widest text-[10px] h-10 bg-primary text-primary-foreground hover:translate-y-[-2px] transition-transform" @click="updateStatus(order.id, 'served', 'Order Served')">
                 Mark as Served
               </Button>
               <Button v-if="order.status === 'served'" size="sm" class="flex-1 rounded-xl font-black uppercase tracking-widest text-[10px] h-10 border-primary/50 text-foreground" variant="outline" @click="updateStatus(order.id, 'completed', 'Order Completed')">
                 Complete
               </Button>
               <Button variant="ghost" size="icon" class="h-10 w-10 text-destructive/60 hover:text-destructive hover:bg-destructive/10 rounded-xl" @click="updateStatus(order.id, 'cancelled', 'Order Cancelled')">
                 <LucideXCircle class="w-5 h-5" />
               </Button>
             </div>
          </div>
        </div>

        <div v-if="!pending && (orders?.length || 0) === 0" class="py-40 text-center border-2 border-dashed border-border rounded-3xl bg-muted/20">
           <div class="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <LucideShoppingCart class="w-8 h-8 text-muted-foreground/30" />
           </div>
           <p class="text-muted-foreground text-sm font-medium italic">No active orders found in the queue.</p>
        </div>
      </div>

      <!-- Stats / Sidebar -->
      <div class="space-y-6">
        <Card class="border-none rounded-3xl p-8 bg-primary text-primary-foreground shadow-2xl overflow-hidden relative group">
          <div class="absolute -right-16 -top-16 w-48 h-48 bg-white/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div class="relative z-10">
            <p class="text-[10px] font-black uppercase tracking-widest text-primary-foreground/40 mb-8">Service Metrics</p>
            <div class="grid grid-cols-2 gap-8">
              <div>
                <p class="text-4xl font-black italic tracking-tighter">{{ pendingCount }}</p>
                <p class="text-[9px] font-black uppercase tracking-widest text-primary-foreground/60 mt-1">Pending</p>
              </div>
              <div>
                <p class="text-4xl font-black italic tracking-tighter">{{ preparingCount }}</p>
                <p class="text-[9px] font-black uppercase tracking-widest text-primary-foreground/60 mt-1">Cooking</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  Loader2 as LucideLoader2, ShoppingCart as LucideShoppingCart, 
  XCircle as LucideXCircle, CheckCircle2 as LucideCheck 
} from 'lucide-vue-next';
import { Badge } from '~/components/ui/badge';
import { Card } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { toast } from 'vue-sonner';

definePageMeta({ layout: 'admin' });

const token = useCookie('token');
const currentShopId = useState<string | null>('currentShopId');

interface Order {
  id: string;
  table_number: string;
  status: 'pending' | 'preparing' | 'served' | 'completed' | 'cancelled';
  total_price: number;
  customer_name: string;
  created_at: string;
  items: any[];
}

const { data: orders, refresh: refreshOrders, pending } = await useFetch<Order[]>(() => 
  currentShopId.value ? `/api/admin/orders?shopId=${currentShopId.value}` : '/api/admin/orders?shopId=none',
  { headers: { Authorization: `Bearer ${token.value}` } }
);

const sortedOrders = computed(() => {
  if (!orders.value) return [];
  const statusOrder = { pending: 0, preparing: 1, served: 2, completed: 3, cancelled: 4 };
  return [...orders.value].sort((a, b) => statusOrder[a.status] - statusOrder[b.status] || new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
});

const pendingCount = computed(() => orders.value?.filter(o => o.status === 'pending').length || 0);
const preparingCount = computed(() => orders.value?.filter(o => o.status === 'preparing').length || 0);

const updateStatus = async (orderId: string, status: string, successMessage: string) => {
  try {
    await $fetch(`/api/admin/orders/${orderId}/status`, {
      method: 'PUT',
      body: { status },
      headers: { Authorization: `Bearer ${token.value}` }
    });
    
    toast.success(successMessage, {
      description: `Order #${orderId.slice(-4).toUpperCase()} status evolved.`
    });
    
    refreshOrders();
  } catch (e: any) {
    toast.error('Load Error', {
      description: e.data?.message || 'Could not modernize the order status.'
    });
  }
};

const getStatusVariant = (status: string) => {
  if (status === 'pending') return 'destructive';
  if (status === 'preparing') return 'default';
  if (status === 'served') return 'secondary';
  return 'outline';
};

const formatTime = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Polling for new orders
let timer: any;
onMounted(() => {
  timer = setInterval(() => refreshOrders(), 15000); 
});
onUnmounted(() => clearInterval(timer));

watch(currentShopId, () => refreshOrders());
</script>
