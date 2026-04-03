<template>
  <div class="space-y-8 pb-20">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h2 class="text-3xl font-bold tracking-tight text-foreground">Live Orders</h2>
        <p class="text-muted-foreground text-sm">Real-time incoming orders from your QR menu.</p>
      </div>
      <div v-if="pending" class="flex items-center gap-2 text-muted-foreground text-[10px] font-black uppercase tracking-widest bg-muted px-3 py-1.5 rounded-full">
         <LucideLoader2 class="w-3 h-3 animate-spin" />
         Updating...
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- High Priority / New Orders -->
      <div class="lg:col-span-2 space-y-6">
        <div v-for="order in sortedOrders" :key="order.id" 
          class="bg-card border border-border rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
        >
          <div class="p-6 flex items-start justify-between border-b border-border/50">
            <div class="flex items-center gap-4">
              <div class="w-12 h-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-black text-lg shadow-lg">
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
              <Badge :variant="getStatusVariant(order.status)" class="rounded-full px-3 py-1 text-[10px] uppercase font-black tracking-widest">
                {{ order.status }}
              </Badge>
              <p class="font-mono font-bold text-foreground">${{ order.total_price?.toFixed(2) }}</p>
            </div>
          </div>

          <div class="px-6 py-4 space-y-4">
             <!-- Order Action Buttons -->
             <div class="flex items-center gap-2">
               <Button v-if="order.status === 'pending'" size="sm" class="flex-1 rounded-xl font-black uppercase tracking-widest text-[10px] h-10 bg-primary text-primary-foreground" @click="updateStatus(order.id, 'preparing')">
                 Accept & Prepare
               </Button>
               <Button v-if="order.status === 'preparing'" size="sm" class="flex-1 rounded-xl font-black uppercase tracking-widest text-[10px] h-10 bg-primary text-primary-foreground" @click="updateStatus(order.id, 'served')">
                 Mark as Served
               </Button>
               <Button v-if="order.status === 'served'" size="sm" class="flex-1 rounded-xl font-black uppercase tracking-widest text-[10px] h-10 border-primary" variant="outline" @click="updateStatus(order.id, 'completed')">
                 Complete
               </Button>
               <Button variant="ghost" size="icon" class="h-10 w-10 text-destructive hover:bg-destructive/10" @click="updateStatus(order.id, 'cancelled')">
                 <LucideXCircle class="w-5 h-5" />
               </Button>
             </div>
          </div>
        </div>

        <div v-if="!pending && (orders?.length || 0) === 0" class="py-32 text-center border-2 border-dashed rounded-3xl">
           <LucideShoppingCart class="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
           <p class="text-muted-foreground">No active orders found.</p>
        </div>
      </div>

      <!-- Stats / Sidebar -->
      <div class="space-y-6">
        <Card class="border-border rounded-3xl p-6 bg-primary text-primary-foreground shadow-xl overflow-hidden relative">
          <div class="relative z-10">
            <p class="text-[10px] font-black uppercase tracking-widest text-primary-foreground/40 mb-6">Service Load</p>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-2xl font-bold">{{ pendingCount }}</p>
                <p class="text-[9px] font-black uppercase tracking-widest text-primary-foreground/60">Pending</p>
              </div>
              <div>
                <p class="text-2xl font-bold">{{ preparingCount }}</p>
                <p class="text-[9px] font-black uppercase tracking-widest text-primary-foreground/60">Cooking</p>
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
  LucideLoader2, LucideShoppingCart, LucideXCircle, LucideCheck 
} from 'lucide-vue-next';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

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
}

const { data: orders, refresh: refreshOrders, pending } = await useFetch<Order[]>(() => 
  currentShopId.value ? `/api/admin/orders?shopId=${currentShopId.value}` : '/api/admin/orders?shopId=none',
  { headers: { Authorization: `Bearer ${token.value}` } }
);

const sortedOrders = computed(() => {
  if (!orders.value) return [];
  // Sort: pending first, then preparing, then served.
  const statusOrder = { pending: 0, preparing: 1, served: 2, completed: 3, cancelled: 4 };
  return [...orders.value].sort((a, b) => statusOrder[a.status] - statusOrder[b.status] || new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
});

const pendingCount = computed(() => orders.value?.filter(o => o.status === 'pending').length || 0);
const preparingCount = computed(() => orders.value?.filter(o => o.status === 'preparing').length || 0);

const updateStatus = async (orderId: string, status: string) => {
  try {
    await $fetch(`/api/admin/orders/${orderId}/status`, {
      method: 'PUT',
      body: { status },
      headers: { Authorization: `Bearer ${token.value}` }
    });
    refreshOrders();
  } catch (e) {
    console.error('Update status error:', e);
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
  timer = setInterval(() => refreshOrders(), 15000); // 15s polling
});
onUnmounted(() => clearInterval(timer));

watch(currentShopId, () => refreshOrders());
</script>
