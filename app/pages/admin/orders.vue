<template>
  <div class="space-y-8 pb-20 animate-in fade-in duration-500">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h2 class="text-3xl font-bold tracking-tight text-foreground uppercase">Order Console</h2>
        <p class="text-muted-foreground text-xs font-bold uppercase tracking-widest opacity-60">Manage real-time queue and historical auditing.</p>
      </div>
      <div v-if="pending" class="flex items-center gap-2 text-foreground text-[10px] font-bold uppercase tracking-widest bg-muted/50 px-3 py-1.5 rounded-lg border border-border">
         <LucideLoader2 class="w-3 h-3 animate-spin" />
         Syncing
      </div>
    </div>

    <!-- Tabs & Filter -->
    <Tabs v-model="filterStatus" class="w-full" @update:model-value="resetPage">
      <div class="flex items-center justify-between mb-6">
        <TabsList class="h-10 bg-muted/40 border border-border rounded-lg p-1">
          <TabsTrigger value="all" class="text-[10px] font-bold uppercase tracking-widest px-4 rounded-md">All</TabsTrigger>
          <TabsTrigger value="active" class="text-[10px] font-bold uppercase tracking-widest px-4 rounded-md">Active</TabsTrigger>
          <TabsTrigger value="completed" class="text-[10px] font-bold uppercase tracking-widest px-4 rounded-md">History</TabsTrigger>
        </TabsList>

        <!-- Service Load Summary -->
        <div class="hidden md:flex items-center gap-6">
          <div class="text-right">
            <p class="text-[10px] font-bold uppercase text-muted-foreground tracking-tighter opacity-60">Total volume</p>
            <p class="text-lg font-bold text-foreground leading-none">{{ total }}</p>
          </div>
        </div>
      </div>

      <!-- Content Area -->
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div class="lg:col-span-4 space-y-4">
          <div v-if="ordersData?.orders?.length" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <div v-for="order in ordersData.orders" :key="order.id" 
              class="bg-card border border-border rounded-lg overflow-hidden flex flex-col shadow-none"
            >
              <div class="p-4 border-b border-border flex items-center justify-between bg-muted/10">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-lg bg-background border border-border flex flex-col items-center justify-center">
                    <span class="text-[8px] font-bold text-muted-foreground uppercase leading-none mb-0.5">Table</span>
                    <span class="text-sm font-bold text-foreground leading-none">#{{ order.table_number || '?' }}</span>
                  </div>
                  <div class="flex flex-col">
                    <span class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{{ formatTimeString(order.created_at) }}</span>
                    <span class="text-xs font-bold text-foreground uppercase tracking-tight truncate max-w-[120px]">{{ order.customer_name || 'Guest User' }}</span>
                  </div>
                </div>
                <div 
                  :class="[
                    'rounded-md px-2 py-0.5 text-[8px] uppercase font-bold tracking-widest border border-transparent shadow-none flex items-center h-5',
                    order.status === 'pending' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' : '',
                    order.status === 'preparing' ? 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20' : '',
                    order.status === 'served' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : '',
                    order.status === 'completed' ? 'bg-slate-500/10 text-slate-600 border-slate-500/20' : '',
                    order.status === 'cancelled' ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' : '',
                  ]"
                >
                  {{ order.status }}
                </div>
              </div>

              <div class="p-4 flex-1 space-y-2 bg-background min-h-[120px]">
                  <div v-for="item in order.items" :key="item.id" class="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase">
                     <div class="flex items-center gap-2">
                        <span class="text-foreground">×{{ item.quantity }}</span>
                        <span class="truncate max-w-[150px]">{{ item.item_name }}</span>
                     </div>
                     <span class="font-mono text-[9px] opacity-40">${{ (item.price_at_time * item.quantity).toFixed(2) }}</span>
                  </div>
              </div>

              <div class="p-4 border-t border-border bg-card flex items-center justify-between gap-3">
                <div class="flex-1 flex gap-2">
                   <Button v-if="order.status === 'pending'" size="sm" class="flex-1 rounded-lg font-bold uppercase tracking-widest text-[9px] h-8" @click="updateStatus(order.id, 'preparing', 'Order Preparing')">
                     Start
                   </Button>
                   <Button v-if="order.status === 'preparing'" size="sm" class="flex-1 rounded-lg font-bold uppercase tracking-widest text-[9px] h-8" @click="updateStatus(order.id, 'served', 'Order Served')">
                     Serve
                   </Button>
                   <Button v-if="order.status === 'served'" size="sm" class="flex-1 rounded-lg font-bold uppercase tracking-widest text-[9px] h-8" @click="updateStatus(order.id, 'completed', 'Order Finalized')">
                     Done
                   </Button>
                </div>
                <Button variant="outline" size="icon" class="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/5 border-border" @click="updateStatus(order.id, 'cancelled', 'Order Refused')">
                  <LucideXCircle class="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>

          <!-- Empty State -->
          <div v-else-if="!pending" class="py-32 text-center border border-dashed border-border rounded-lg bg-muted/10">
             <div class="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mx-auto mb-4 border border-border">
                <LucideShoppingCart class="w-5 h-5 text-muted-foreground/40" />
             </div>
             <p class="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">No orders in this state</p>
          </div>

          <!-- Pagination -->
          <div v-if="total > limit" class="pt-8 flex items-center justify-between border-t border-border mt-8">
            <p class="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">
              Context: {{ (page - 1) * limit + 1 }} - {{ Math.min(page * limit, total) }} of {{ total }}
            </p>
            <div class="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                class="rounded-lg h-9 px-4 text-[9px] font-bold uppercase tracking-widest"
                :disabled="page === 1"
                @click="prevPage"
              >
                Previous
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                class="rounded-lg h-9 px-4 text-[9px] font-bold uppercase tracking-widest"
                :disabled="page * limit >= total"
                @click="nextPage"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Tabs>
  </div>
</template>

<script setup lang="ts">
import { 
  Loader2 as LucideLoader2, 
  ShoppingCart as LucideShoppingCart, 
  XCircle as LucideXCircle 
} from 'lucide-vue-next';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '~/components/ui/tabs';
import { toast } from 'vue-sonner';

definePageMeta({ layout: 'admin' });

const token = useCookie('token');
const currentShopId = useState<string | null>('currentShopId');

// Pagination & Filtering
const page = ref(1);
const limit = ref(9);
const filterStatus = ref('all');

// Helper to construct API URL
const apiUrl = computed(() => {
  if (!currentShopId.value) return '/api/admin/orders?shopId=none';
  let url = `/api/admin/orders?shopId=${currentShopId.value}&page=${page.value}&limit=${limit.value}`;
  if (filterStatus.value !== 'all') {
    // If 'active', handle specifically? Or assume backend handles 'active' status filter?
    // Since our backend service 'getByStatus' supports a string, we pass it.
    // However, if we want multi-status (pending + preparing), we'd need more logic.
    // For now, let's map 'active' to a special case or just filter by status.
    if (filterStatus.value === 'active') {
        // We'll let the user filter by 'pending' for now or update backend later.
        url += `&status=pending`; 
    } else {
        url += `&status=${filterStatus.value}`;
    }
  }
  return url;
});

const { data: ordersData, refresh: refreshOrders, pending } = await useFetch<any>(apiUrl, {
  headers: { Authorization: `Bearer ${token.value}` }
});

const total = computed(() => ordersData.value?.total || 0);

const nextPage = () => {
  if (page.value * limit.value < total.value) {
    page.value++;
    refreshOrders();
  }
};

const prevPage = () => {
  if (page.value > 1) {
    page.value--;
    refreshOrders();
  }
};

const resetPage = () => {
  page.value = 1;
};

const updateStatus = async (orderId: string, status: string, successMessage: string) => {
  try {
    await $fetch(`/api/admin/orders/${orderId}/status`, {
      method: 'PUT',
      body: { status },
      headers: { Authorization: `Bearer ${token.value}` }
    });
    
    toast.success(successMessage, {
      description: `Order context updated successfully.`
    });
    
    refreshOrders();
  } catch (e: any) {
    toast.error('Sync Error', {
      description: e.data?.message || 'Action failed.'
    });
  }
};

const getStatusVariant = (status: string) => {
  if (status === 'pending') return 'secondary'; // Valid variant, color handled via class
  if (status === 'preparing') return 'default';
  if (status === 'served') return 'secondary';
  return 'outline';
};

const formatTimeString = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
};

// Polling for new orders (only if on page 1 of active/all)
let pollTimer: any;
onMounted(() => {
  pollTimer = setInterval(() => {
    if (page.value === 1) refreshOrders();
  }, 15000); 
});
onUnmounted(() => clearInterval(pollTimer));

watch([currentShopId, filterStatus], () => {
  resetPage();
  refreshOrders();
});
</script>
