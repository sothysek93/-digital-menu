<template>
  <div class="space-y-8">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h2 class="text-3xl font-bold tracking-tight text-slate-900">Shops & Locations</h2>
        <p class="text-slate-500 text-sm">Manage your restaurant branches (Max 3 on Free plan)</p>
      </div>

      <Dialog v-model:open="isModalOpen">
        <DialogTrigger as-child>
          <Button @click="openModal()" class="rounded-full shadow-sm" :disabled="(shops?.length || 0) >= 3 && (user as any)?.account_type === 'free'">
            <LucidePlus class="mr-2 h-4 w-4" />
            Add Shop
          </Button>
        </DialogTrigger>
        <DialogContent class="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{{ form.id ? 'Edit Shop' : 'New Shop' }}</DialogTitle>
            <DialogDescription>Details for your restaurant location.</DialogDescription>
          </DialogHeader>

          <form @submit.prevent="saveShop" class="space-y-4 pt-4">
            <div class="space-y-2">
              <Label for="shop_name">Shop Name</Label>
              <Input id="shop_name" v-model="form.name" @input="updateSlug" placeholder="Downtown Bistro" required />
            </div>

            <div class="space-y-2">
              <Label for="shop_slug">Public Slug (URL)</Label>
              <div class="flex items-center gap-1">
                <span class="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded">/</span>
                <Input id="shop_slug" v-model="form.slug" placeholder="downtown-bistro" required />
              </div>
            </div>

            <div class="space-y-2">
              <Label for="shop_addr">Address</Label>
              <Input id="shop_addr" v-model="form.address" placeholder="123 Main St, City" />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label for="shop_phone">Phone</Label>
                <Input id="shop_phone" v-model="form.phone" placeholder="+123456789" />
              </div>
              <div class="flex items-center space-x-2 pt-8">
                <Checkbox id="active" v-model:checked="form.is_active" />
                <Label for="active" class="text-sm font-medium leading-none">Active</Label>
              </div>
            </div>

            <DialogFooter class="pt-4">
              <Button type="button" variant="ghost" @click="isModalOpen = false">Cancel</Button>
              <Button type="submit" :disabled="isSaving">
                <LucideLoader2 v-if="isSaving" class="mr-2 h-4 w-4 animate-spin" />
                {{ form.id ? 'Save Changes' : 'Create Shop' }}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card v-for="shop in shops" :key="shop.id" class="border-slate-200 shadow-sm overflow-hidden group hover:ring-2 hover:ring-slate-900 transition-all">
        <CardContent class="p-6">
          <div class="flex items-start justify-between">
            <div class="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4">
              <LucideStore class="w-6 h-6 text-slate-400" />
            </div>
            <Badge :variant="shop.is_active ? 'default' : 'secondary'">
              {{ shop.is_active ? 'Online' : 'Offline' }}
            </Badge>
          </div>
          
          <h3 class="font-bold text-lg text-slate-900 mb-1">{{ shop.name }}</h3>
          <p class="text-xs text-slate-400 font-medium mb-4 flex items-center gap-1 uppercase tracking-widest">
            <LucideGlobe class="w-3 h-3" />
            /{{ shop.slug }}
          </p>
          
          <div class="space-y-2 mb-6">
            <div class="flex items-center gap-2 text-xs text-slate-500">
              <LucideMapPin class="w-3.5 h-3.5 shrink-0" />
              <span class="truncate">{{ shop.address || 'No address set' }}</span>
            </div>
            <div class="flex items-center gap-2 text-xs text-slate-500">
              <LucidePhone class="w-3.5 h-3.5 shrink-0" />
              <span>{{ shop.phone || 'No phone set' }}</span>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <Button variant="outline" size="sm" class="flex-1 rounded-xl h-9 text-xs font-bold uppercase tracking-widest" @click="openModal(shop)">
              Edit
            </Button>
            <Button variant="outline" size="icon" class="rounded-xl h-9 w-9 text-red-500 hover:bg-red-50" @click="deleteShop(shop.id)">
              <LucideTrash2 class="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div v-if="!pending && (shops?.length || 0) === 0" class="col-span-full py-20 text-center bg-white border border-dashed border-slate-200 rounded-3xl">
         <LucideStore class="w-12 h-12 text-slate-100 mx-auto mb-4" />
         <p class="text-slate-400 font-medium italic">No shops found. Create your first location!</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  Plus as LucidePlus, Store as LucideStore, Loader2 as LucideLoader2, Globe as LucideGlobe, 
  MapPin as LucideMapPin, Phone as LucidePhone, Trash2 as LucideTrash2 
} from 'lucide-vue-next';
import { Card, CardContent } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Checkbox } from '~/components/ui/checkbox';
import { Badge } from '~/components/ui/badge';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogDescription, DialogFooter, DialogTrigger 
} from '~/components/ui/dialog';

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
    const method = form.id ? 'PUT' : 'POST';
    const url = form.id ? `/api/admin/shops/${form.id}` : '/api/admin/shops';
    
    await $fetch(url, {
      method,
      body: form,
      headers: { Authorization: `Bearer ${token.value}` }
    });
    
    isModalOpen.value = false;
    refreshShops();
  } catch (e) {
    console.error('Save error:', e);
  } finally {
    isSaving.value = false;
  }
};

const deleteShop = async (id: string) => {
  if (!confirm('Are you sure? All menu items and categories for this shop will be lost.')) return;
  try {
    await $fetch(`/api/admin/shops/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token.value}` }
    });
    refreshShops();
    if (currentShopId.value === id) currentShopId.value = null;
  } catch (e) {
    console.error('Delete error:', e);
  }
};
</script>
