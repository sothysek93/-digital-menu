<template>
  <div class="space-y-8 animate-in fade-in duration-500">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h2 class="text-3xl font-bold tracking-tight text-foreground">Shops & Locations</h2>
        <p class="text-muted-foreground text-sm">Manage your restaurant branches (Limit based on plan)</p>
      </div>

      <Dialog v-model:open="isModalOpen">
        <DialogTrigger as-child>
          <Button @click="openModal()" class="rounded-full shadow-lg" :disabled="(shops?.length || 0) >= 3 && (user as any)?.account_type === 'free'">
            <LucidePlus class="mr-2 h-4 w-4" />
            Add Location
          </Button>
        </DialogTrigger>
        <DialogContent class="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{{ form.id ? 'Edit Location' : 'New Location' }}</DialogTitle>
            <DialogDescription>Input the official details for your restaurant branch.</DialogDescription>
          </DialogHeader>

          <form @submit.prevent="saveShop" class="space-y-4 pt-4">
            <div class="space-y-2">
              <Label for="shop_name">Shop Name</Label>
              <Input id="shop_name" v-model="form.name" @input="updateSlug" placeholder="Downtown Bistro" required />
            </div>

            <div class="space-y-2">
              <Label for="shop_slug">Public Slug (URL Path)</Label>
              <div class="flex items-center gap-1">
                <span class="text-[10px] font-black text-muted-foreground bg-muted px-2 py-2 rounded-l border border-r-0 border-border">/</span>
                <Input id="shop_slug" v-model="form.slug" placeholder="downtown-bistro" class="rounded-l-none" required />
              </div>
            </div>

            <div class="space-y-2">
              <Label for="shop_addr">Physical Address</Label>
              <Input id="shop_addr" v-model="form.address" placeholder="123 Main St, City" />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="shop_phone">Contact Phone</Label>
                <Input id="shop_phone" v-model="form.phone" placeholder="+123456789" />
              </div>
              <div class="flex items-center space-x-2 pt-8">
                <Checkbox id="active" v-model:checked="form.is_active" />
                <Label for="active" class="text-sm font-medium leading-none">Live Status</Label>
              </div>
            </div>

            <DialogFooter class="pt-4">
              <Button type="button" variant="ghost" @click="isModalOpen = false">Cancel</Button>
              <Button type="submit" :disabled="isSaving" class="px-8">
                <LucideLoader2 v-if="isSaving" class="mr-2 h-4 w-4 animate-spin" />
                {{ form.id ? 'Save Changes' : 'Create Shop' }}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>

    <!-- Delete Confirmation Dialog -->
    <Dialog v-model:open="isDeleteModalOpen">
      <DialogContent class="sm:max-w-md bg-card border-border rounded-[32px] p-8 text-foreground">
        <DialogHeader class="space-y-3">
          <div class="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center text-destructive mb-2">
            <LucideAlertTriangle class="w-6 h-6" />
          </div>
          <DialogTitle class="text-2xl font-black uppercase italic tracking-tighter">Liquidate Branch?</DialogTitle>
          <DialogDescription class="text-sm font-medium italic text-muted-foreground leading-relaxed">
            Are you sure you want to permanently remove <span class="text-foreground font-bold font-sans not-italic">"{{ shopToDelete?.name }}"</span>?
            <br/><br/>
            All associated catalog items, categories, and historical order data will be purged from the switch. This action is irreversible.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter class="flex flex-row gap-3 pt-6 border-t border-border/50">
          <Button variant="ghost" @click="isDeleteModalOpen = false" class="flex-1 rounded-2xl h-12 font-black uppercase text-[10px] tracking-widest">Keep It</Button>
          <Button variant="destructive" @click="confirmDelete" class="flex-1 rounded-2xl h-12 font-black uppercase text-[10px] tracking-widest shadow-lg shadow-destructive/20">
            <LucideLoader2 v-if="isSaving" class="mr-2 h-4 w-4 animate-spin" />
            Liquidate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card v-for="shop in shops" :key="shop.id" class="overflow-hidden border-border group hover:border-primary/50 transition-all duration-300">
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle class="text-lg font-bold tracking-tight text-foreground">
             {{ shop.name }}
          </CardTitle>
          <Badge :variant="shop.is_active ? 'default' : 'secondary'" class="rounded-full px-3 uppercase text-[9px] font-black tracking-widest">
            {{ shop.is_active ? 'Live' : 'Private' }}
          </Badge>
        </CardHeader>
        <CardContent class="space-y-6">
          <div class="space-y-2">
             <div class="flex items-center gap-2 text-xs font-mono text-primary font-bold">
               <LucideGlobe class="h-3.5 w-3.5" /> 
               <span class="opacity-50">/</span>{{ shop.slug }}
             </div>
             <div class="flex items-start gap-2 text-sm text-muted-foreground italic">
               <LucideMapPin class="h-4 w-4 shrink-0 mt-0.5" />
               <span class="line-clamp-1">{{ shop.address || 'No address provided' }}</span>
             </div>
          </div>

          <div class="flex items-center gap-2 pt-2">
            <Button variant="secondary" class="w-full rounded-full h-9 text-xs font-bold" @click="openModal(shop)">
               <LucidePencil class="h-3.5 w-3.5 mr-2" />
               Edit Store
            </Button>
            <Button variant="ghost" size="icon" class="rounded-full h-9 w-9 text-destructive/60 hover:text-destructive hover:bg-destructive/10" @click="deleteShop(shop)">
               <LucideTrash2 class="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div v-if="!pending && (shops?.length || 0) === 0" class="col-span-full py-32 text-center border-2 border-dashed border-border rounded-2xl bg-muted/30">
         <div class="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
            <LucideStore class="h-8 w-8 text-muted-foreground/50" />
         </div>
         <h3 class="text-lg font-bold text-foreground">No shops found</h3>
         <p class="text-muted-foreground text-sm max-w-xs mx-auto">Start by creating your first restaurant location to begin building your catalog.</p>
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

const { data: shops, refresh: refreshShops, pending } = await useFetch<Shop[]>('/api/admin/shops', {
  headers: { Authorization: `Bearer ${token.value}` }
});

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
