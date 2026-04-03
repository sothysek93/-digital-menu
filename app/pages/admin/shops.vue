<template>
  <div class="space-y-8 animate-in fade-in duration-500 pb-12">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h2 class="text-3xl font-bold tracking-tight text-foreground">Locations</h2>
        <p class="text-muted-foreground text-sm font-medium">Manage your restaurant branches and public URLs.</p>
      </div>

      <Dialog v-model:open="isModalOpen">
        <DialogTrigger as-child>
          <Button @click="openModal()" class="rounded-lg h-10 px-4" :disabled="(shops?.length || 0) >= 3 && (user as any)?.account_type === 'free'">
            <LucidePlus class="mr-2 h-4 w-4" />
            New Location
          </Button>
        </DialogTrigger>
        <DialogContent class="sm:max-w-md rounded-lg">
          <DialogHeader>
            <DialogTitle class="text-xl font-bold tracking-tight">{{ form.id ? 'Edit Location' : 'Create Location' }}</DialogTitle>
            <DialogDescription class="text-xs font-medium">Input the official details for this branch.</DialogDescription>
          </DialogHeader>

          <form @submit.prevent="saveShop" class="space-y-5 pt-3">
            <div class="space-y-1.5">
              <Label class="text-xs font-bold text-muted-foreground px-0.5">Shop Name</Label>
              <Input v-model="form.name" @input="updateSlug" placeholder="Downtown Bistro" required class="h-10 rounded-lg bg-background" />
            </div>

            <div class="space-y-1.5">
              <Label class="text-xs font-bold text-muted-foreground px-0.5">Public Path /slug</Label>
              <div class="flex items-center gap-1">
                <span class="text-xs font-bold text-muted-foreground bg-muted px-3 h-10 flex items-center rounded-l-lg border border-r-0 border-border">/</span>
                <Input v-model="form.slug" placeholder="downtown-bistro" class="rounded-l-none h-10 bg-background" required />
              </div>
            </div>

            <div class="space-y-1.5">
              <Label class="text-xs font-bold text-muted-foreground px-0.5">Address</Label>
              <Input v-model="form.address" placeholder="123 Main St" class="h-10 rounded-lg bg-background" />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <Label class="text-xs font-bold text-muted-foreground px-0.5">Phone</Label>
                <Input v-model="form.phone" placeholder="+123..." class="h-10 rounded-lg bg-background" />
              </div>
              <div class="flex items-center space-x-2 pt-6">
                <Checkbox id="active" v-model:checked="form.is_active" class="rounded-md" />
                <Label for="active" class="text-xs font-bold text-muted-foreground cursor-pointer">Live</Label>
              </div>
            </div>

            <DialogFooter class="pt-2">
              <Button type="button" variant="ghost" @click="isModalOpen = false" class="rounded-lg h-10 px-6 text-xs font-bold">Cancel</Button>
              <Button type="submit" :disabled="isSaving" class="rounded-lg h-10 px-8 text-xs font-bold">
                <LucideLoader2 v-if="isSaving" class="mr-2 h-4 w-4 animate-spin" />
                {{ form.id ? 'Save Changes' : 'Confirm' }}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>

    <!-- Delete Confirmation Dialog -->
    <Dialog v-model:open="isDeleteModalOpen">
      <DialogContent class="sm:max-w-md rounded-lg p-8">
        <DialogHeader class="space-y-3">
          <div class="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive mb-2">
            <LucideAlertTriangle class="w-5 h-5" />
          </div>
          <DialogTitle class="text-xl font-bold tracking-tight">Remove Branch?</DialogTitle>
          <DialogDescription class="text-xs font-medium text-muted-foreground leading-relaxed">
            Are you sure you want to delete <span class="text-foreground font-bold">"{{ shopToDelete?.name }}"</span>? All associated menu items and data will be permanently removed.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter class="flex flex-row gap-2 pt-6 border-t border-border">
          <Button variant="ghost" @click="isDeleteModalOpen = false" class="flex-1 rounded-lg h-10 text-xs font-bold">Cancel</Button>
          <Button variant="destructive" @click="confirmDelete" class="flex-1 rounded-lg h-10 text-xs font-bold">
            <LucideLoader2 v-if="isSaving" class="mr-2 h-4 w-4 animate-spin" />
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <div class="space-y-8">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card v-for="shop in shops" :key="shop.id" class="border border-border rounded-lg shadow-none overflow-hidden hover:bg-muted/5 transition-colors">
          <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle class="text-lg font-bold tracking-tight text-foreground">
               {{ shop.name }}
            </CardTitle>
            <Badge :variant="shop.is_active ? 'default' : 'secondary'" class="rounded-md px-2 text-[8px] font-bold uppercase tracking-widest h-5">
              {{ shop.is_active ? 'Live' : 'Hidden' }}
            </Badge>
          </CardHeader>
          <CardContent class="space-y-5">
            <div class="space-y-2">
               <div class="flex items-center gap-2 text-[11px] font-mono font-bold text-foreground">
                 <LucideGlobe class="h-3.5 w-3.5 text-muted-foreground" /> 
                 <span class="opacity-40">/</span>{{ shop.slug }}
               </div>
               <div class="flex items-start gap-2 text-[10px] text-muted-foreground font-medium">
                 <LucideMapPin class="h-3.5 w-3.5 shrink-0" />
                 <span class="line-clamp-1 leading-tight">{{ shop.address || 'Location secret' }}</span>
               </div>
            </div>

            <div class="flex items-center gap-2 pt-2">
              <Button variant="outline" class="flex-1 rounded-lg h-9 text-xs font-bold border-border" @click="openModal(shop)">
                 Edit
              </Button>
              <Button variant="ghost" size="icon" class="h-9 w-9 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/5" @click="deleteShop(shop)">
                 <LucideTrash2 class="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <div v-if="!pending && (shops?.length || 0) === 0" class="col-span-full py-24 text-center border border-dashed border-border rounded-lg bg-muted/5">
           <div class="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mx-auto mb-4">
              <LucideStore class="h-5 w-5 text-muted-foreground/30" />
           </div>
           <h3 class="text-sm font-bold text-foreground uppercase tracking-tight">No locations found</h3>
           <p class="text-muted-foreground text-xs font-medium max-w-[200px] mx-auto mt-1 leading-relaxed">Start by adding your first restaurant branch context.</p>
        </div>
      </div>

      <!-- Minimalist Pagination -->
      <div v-if="data?.total > 9" class="flex items-center justify-between px-2 py-6 border-t border-border mt-8">
        <p class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
          Page {{ currentPage }} of {{ Math.ceil(data.total / 9) }}
        </p>
        <div class="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            class="h-9 px-4 rounded-lg text-[10px] font-bold uppercase" 
            :disabled="currentPage === 1"
            @click="currentPage--"
          >
            Previous
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            class="h-9 px-4 rounded-lg text-[10px] font-bold uppercase" 
            :disabled="currentPage >= Math.ceil(data.total / 9)"
            @click="currentPage++"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  Plus as LucidePlus, Store as LucideStore, Loader2 as LucideLoader2, Globe as LucideGlobe, 
  MapPin as LucideMapPin, Phone as LucidePhone, Trash2 as LucideTrash2, Pencil as LucidePencil,
  AlertTriangle as LucideAlertTriangle
} from 'lucide-vue-next';
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Checkbox } from '~/components/ui/checkbox';
import { Badge } from '~/components/ui/badge';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogDescription, DialogFooter, DialogTrigger 
} from '~/components/ui/dialog';
import { toast } from 'vue-sonner';

definePageMeta({ layout: 'admin' });

const user = useState<any>('user');
const token = useCookie('token');
const currentShopId = useState<string | null>('currentShopId');

interface Shop {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  address: string;
  phone: string;
  is_active: boolean;
}

const currentPage = ref(1);

const { data, refresh: refreshShops, pending } = await useFetch<any>(() => 
  `/api/admin/shops?page=${currentPage.value}&limit=9`, 
  { headers: { Authorization: `Bearer ${token.value}` }, watch: [currentPage] }
);

const shops = computed(() => data.value?.items || []);

const isModalOpen = ref(false);
const isSaving = ref(false);
const form = reactive({
  id: null as string | null,
  name: '',
  slug: '',
  address: '',
  phone: '',
  is_active: true
});

const updateSlug = () => {
  if (!form.id) {
    form.slug = form.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  }
};

const openModal = (shop: any = null) => {
  if (shop) {
    Object.assign(form, shop);
    form.is_active = !!shop.is_active;
  } else {
    Object.assign(form, { id: null, name: '', slug: '', address: '', phone: '', is_active: true });
  }
  isModalOpen.value = true;
};

const saveShop = async () => {
  isSaving.value = true;
  try {
    const isEdit = !!form.id;
    const url = isEdit ? `/api/admin/shops/${form.id}` : '/api/admin/shops';
    
    await $fetch(url, {
      method: (isEdit ? 'PUT' : 'POST') as any,
      body: form,
      headers: { Authorization: `Bearer ${token.value}` }
    });
    
    toast.success(isEdit ? 'Store Updated' : 'New Store Created', {
      description: `"${form.name}" has been successfully synchronized.`
    });
    
    isModalOpen.value = false;
    refreshShops();
  } catch (e: any) {
    toast.error('Sync Error', {
      description: e.data?.message || 'Could not save the shop details. Please verify your data.'
    });
  } finally {
    isSaving.value = false;
  }
};

const isDeleteModalOpen = ref(false);
const shopToDelete = ref<Shop | null>(null);

const deleteShop = (shop: Shop) => {
  shopToDelete.value = shop;
  isDeleteModalOpen.value = true;
};

const confirmDelete = async () => {
  if (!shopToDelete.value) return;
  isSaving.value = true;
  
  try {
    await $fetch(`/api/admin/shops/${shopToDelete.value.id}`, {
      method: 'DELETE' as any,
      headers: { Authorization: `Bearer ${token.value}` }
    });
    
    toast.success('Branch Liquidated', {
      description: `"${shopToDelete.value.name}" has been removed.`
    });
    
    isDeleteModalOpen.value = false;
    refreshShops();
    if (currentShopId.value === shopToDelete.value.id) currentShopId.value = null;
  } catch (e: any) {
    toast.error('Liquidation Failed', {
      description: e.data?.message || 'The branch could not be removed.'
    });
  } finally {
    isSaving.value = false;
  }
};
</script>
