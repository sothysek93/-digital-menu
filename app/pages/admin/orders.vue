<template>
  <div class="space-y-8 pb-20 animate-in fade-in duration-500">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h2 class="text-3xl font-bold tracking-tight text-foreground">Live Queue</h2>
        <p class="text-muted-foreground text-sm font-medium">Real-time incoming orders from the digital menu.</p>
      </div>
      <div v-if="pending" class="flex items-center gap-2 text-foreground text-[10px] font-bold uppercase tracking-widest bg-accent px-3 py-1.5 rounded-md border border-border">
         <LucideLoader2 class="w-3 h-3 animate-spin" />
         Updating
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <div class="lg:col-span-3 space-y-4">
        <div v-for="order in sortedOrders" :key="order.id" 
          class="bg-background border border-border rounded-lg overflow-hidden flex flex-col sm:flex-row items-stretch"
        >
          <div class="p-6 flex flex-col items-center justify-center bg-muted/30 border-b sm:border-b-0 sm:border-r border-border min-w-[120px]">
            <span class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Table</span>
            <span class="text-3xl font-bold text-foreground">#{{ order.table_number || '?' }}</span>
             <Badge :variant="getStatusVariant(order.status)" class="mt-4 rounded-md px-2 py-0.5 text-[9px] uppercase font-bold tracking-wider">
               {{ order.status }}
             </Badge>
          </div>

          <div class="flex-1 flex flex-col">
            <div class="p-4 border-b border-border flex items-center justify-between bg-background">
               <div class="flex flex-col">
                  <span class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{{ formatTime(order.created_at) }}</span>
                  <span class="text-sm font-bold text-foreground uppercase tracking-tight">{{ order.customer_name || 'Guest User' }}</span>
               </div>
               <span class="font-mono text-sm font-bold text-foreground">${{ order.total_price?.toFixed(2) }}</span>
            </div>
            
            <div class="p-4 flex-1 space-y-2 bg-muted/5">
                <div v-for="item in order.items" :key="item.id" class="flex items-center justify-between text-[11px] font-medium text-muted-foreground">
                   <div class="flex items-center gap-2">
                      <span class="text-foreground font-bold">×{{ item.quantity }}</span>
                      <span class="uppercase tracking-tight">{{ item.item_name }}</span>
                   </div>
                   <span class="font-mono text-[10px] opacity-60">${{ (item.price_at_time * item.quantity).toFixed(2) }}</span>
                </div>
            </div>

            <div class="p-4 border-t border-border bg-background flex items-center gap-2">
               <Button v-if="order.status === 'pending'" size="sm" class="flex-1 rounded-lg font-bold uppercase tracking-widest text-[9px] h-9" @click="updateStatus(order.id, 'preparing', 'Order Accepted')">
                 Accept Order
               </Button>
               <Button v-if="order.status === 'preparing'" size="sm" class="flex-1 rounded-lg font-bold uppercase tracking-widest text-[9px] h-9" @click="updateStatus(order.id, 'served', 'Order Served')">
                 Ready to Serve
               </Button>
               <Button v-if="order.status === 'served'" size="sm" class="flex-1 rounded-lg font-bold uppercase tracking-widest text-[9px] h-9" @click="updateStatus(order.id, 'completed', 'Order Completed')">
                 Complete
               </Button>
               <Button variant="outline" size="icon" class="h-9 w-9 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/5 border-border" @click="updateStatus(order.id, 'cancelled', 'Order Cancelled')">
                 <LucideXCircle class="w-4 h-4" />
               </Button>
            </div>
          </div>
        </div>

        <div v-if="!pending && (orders?.length || 0) === 0" class="py-32 text-center border border-dashed border-border rounded-lg bg-muted/10">
           <div class="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mx-auto mb-4">
              <LucideShoppingCart class="w-5 h-5 text-muted-foreground/40" />
           </div>
           <p class="text-muted-foreground text-xs font-bold uppercase tracking-tighter">Queue is empty</p>
        </div>
      </div>

      <div class="space-y-4">
        <Card class="border border-border rounded-lg p-6 bg-foreground text-background shadow-none">
          <p class="text-[9px] font-bold uppercase tracking-[0.2em] text-background/60 mb-6">Service Load</p>
          <div class="grid grid-cols-2 gap-6">
            <div class="space-y-1">
              <p class="text-3xl font-bold tracking-tight">{{ pendingCount }}</p>
              <p class="text-[10px] font-bold uppercase tracking-wide opacity-60">Pending</p>
            </div>
            <div class="space-y-1">
              <p class="text-3xl font-bold tracking-tight">{{ preparingCount }}</p>
              <p class="text-[10px] font-bold uppercase tracking-wide opacity-60">Active</p>
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
