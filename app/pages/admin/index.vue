<template>
  <div v-if="!user" class="min-h-screen bg-slate-50 flex items-center justify-center p-4">
     <LucideLoader2 class="w-8 h-8 animate-spin text-slate-300" />
     <span class="ml-4 text-slate-400 font-medium tracking-tight text-xs uppercase font-black">Synchronizing Identity...</span>
  </div>
  <div v-else class="space-y-8 pb-12">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h2 class="text-3xl font-bold tracking-tight text-foreground line-clamp-1">Menu Catalog</h2>
        <p class="text-muted-foreground text-sm">Manage the dishes for your active location.</p>
      </div>

      <div class="flex items-center gap-2">
        <Dialog v-model:open="isModalOpen">
          <DialogTrigger as-child>
            <Button @click="openModal()" class="rounded-full shadow-sm" :disabled="!currentShopId || categories?.length === 0">
              <LucidePlus class="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent class="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{{ form.id ? 'Edit Item' : 'New Item' }}</DialogTitle>
              <DialogDescription>Details for your menu entry.</DialogDescription>
            </DialogHeader>

            <form @submit.prevent="saveItem" class="space-y-4 pt-2">
              <div class="space-y-2">
                <Label for="dish_name">Dish Name</Label>
                <Input id="dish_name" v-model="form.name" placeholder="Classic Wagyu Burger" required />
              </div>

              <!-- Category Selection -->
              <div class="space-y-2">
                <Label>Category</Label>
                <Select v-model="form.category_id" required>
                  <SelectTrigger class="w-full bg-background border-border">
                    <SelectValue placeholder="Select a Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem v-for="cat in categories" :key="cat.id" :value="cat.id">
                      {{ cat.name }}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p v-if="categories?.length === 0" class="text-[10px] text-destructive font-bold uppercase tracking-widest mt-1">
                   No categories found. Create one first!
                </p>
              </div>

              <div class="space-y-2">
                <Label for="dish_desc">Description</Label>
                <textarea 
                  id="dish_desc"
                  v-model="form.description" 
                  class="flex min-h-[80px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Describe the flavors..."
                ></textarea>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label for="dish_price">Price ($)</Label>
                  <Input id="dish_price" v-model.number="form.price" type="number" step="0.01" required />
                </div>
                <div class="flex items-center space-x-2 pt-8">
                  <Checkbox id="available" v-model:checked="form.is_available" />
                  <Label for="available" class="text-sm font-medium leading-none">Available</Label>
                </div>
              </div>

              <div class="space-y-2 pt-2">
                <Label>Image</Label>
                <div 
                   class="relative aspect-video rounded-xl border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:bg-muted transition-colors overflow-hidden group"
                   @click="fileInput?.click()"
                 >
                  <img v-if="form.image_url" :src="form.image_url" class="absolute inset-0 w-full h-full object-cover" />
                  <div v-else class="text-center">
                    <LucideImage class="mx-auto h-8 w-8 text-muted-foreground opacity-30 group-hover:scale-110 transition-transform" />
                    <span class="text-xs text-muted-foreground mt-2 block font-black uppercase tracking-widest leading-none">Upload Cover</span>
                  </div>
                </div>
                <input ref="fileInput" type="file" class="hidden" @change="uploadImage" />
              </div>

              <DialogFooter class="pt-4">
                <Button type="button" variant="ghost" @click="isModalOpen = false">Cancel</Button>
                <Button type="submit" :disabled="isSaving">
                  <LucideLoader2 v-if="isSaving" class="mr-2 h-4 w-4 animate-spin" />
                  {{ form.id ? 'Save Changes' : 'Create Item' }}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>

    <!-- Inventory Table -->
    <Card class="border-border shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="w-[80px]">Photo</TableHead>
            <TableHead>Item Details</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="item in (menuItems || [])" :key="item.id">
            <TableCell>
              <div class="w-12 h-12 rounded-xl bg-muted overflow-hidden border border-border">
                <img v-if="item.image_url" :src="item.image_url" class="w-full h-full object-cover" />
              </div>
            </TableCell>
            <TableCell>
              <div class="font-bold text-foreground leading-tight">{{ item.name }}</div>
              <div class="text-[10px] text-muted-foreground line-clamp-1 italic max-w-[150px]">{{ item.description }}</div>
            </TableCell>
            <TableCell>
              <Badge variant="outline" class="text-[10px] uppercase font-black tracking-widest whitespace-nowrap">
                {{ item.category_name || 'Uncategorized' }}
              </Badge>
            </TableCell>
            <TableCell class="font-mono text-sm">${{ item.price.toFixed(2) }}</TableCell>
            <TableCell>
              <Badge :variant="item.is_available ? 'secondary' : 'outline'" class="rounded-lg h-5 px-1.5 text-[9px] font-black uppercase tracking-widest">
                {{ item.is_available ? 'Active' : 'Offline' }}
              </Badge>
            </TableCell>
            <TableCell class="text-right">
              <div class="flex justify-end gap-1">
                <Button variant="ghost" size="icon" @click="openModal(item)" class="h-8 w-8 rounded-lg">
                  <LucidePencil class="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" class="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10" @click="deleteItem(item.id)">
                  <LucideTrash2 class="h-3.5 w-3.5" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
          <TableRow v-if="!pending && (!menuItems || menuItems.length === 0)">
            <TableCell colspan="6" class="py-20 text-center text-muted-foreground font-medium italic">
              {{ !currentShopId ? 'Please select a shop location' : 'No items found. Ready your first dish!' }}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Card>
      
    <!-- Public URL Info -->
    <div v-if="currentShop" class="bg-card border border-border rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative group">
      <div class="absolute -right-16 -bottom-16 w-48 h-48 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
      
      <div class="flex items-center gap-4 relative z-10">
        <div class="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-xl">
           <LucideGlobe class="w-6 h-6 text-primary-foreground" />
        </div>
        <div>
          <div class="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] leading-none mb-1.5">Live Menu Endpoint</div>
          <div class="text-sm font-bold text-foreground flex items-center gap-2">
            /{{ currentShop?.slug }}
            <Badge variant="outline" class="text-[9px] h-4 uppercase font-black">Syncing Live</Badge>
          </div>
        </div>
      </div>
      
      <div class="flex items-center gap-3 relative z-10 w-full md:w-auto">
        <Button variant="outline" class="flex-1 md:flex-none rounded-xl shadow-sm h-11 px-6 text-xs font-bold uppercase tracking-widest" @click="copyLink">
           Copy Link
        </Button>
        <Button as-child class="flex-1 md:flex-none rounded-xl shadow-lg h-11 px-6 text-xs font-bold uppercase tracking-widest bg-primary text-primary-foreground hover:translate-y-[-2px] transition-transform">
           <NuxtLink :to="`/${currentShop?.slug}`" target="_blank">
             Open Public Menu
             <LucideExternalLink class="ml-2 h-3.5 w-3.5" />
           </NuxtLink>
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  Plus as LucidePlus, Image as LucideImage, Loader2 as LucideLoader2, 
  Pencil as LucidePencil, Trash2 as LucideTrash2, Globe as LucideGlobe, ExternalLink as LucideExternalLink 
} from 'lucide-vue-next';
import { Card } from '~/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '~/components/ui/table';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Checkbox } from '~/components/ui/checkbox';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogDescription, DialogFooter, DialogTrigger 
} from '~/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui';

definePageMeta({ layout: 'admin' });

interface Shop { id: string; name: string; slug: string; }
interface Category { id: string; name: string; }
interface MenuItem { 
  id: string; 
  name: string; 
  category_id: string; 
  category_name?: string;
  description: string; 
  price: number; 
  image_url: string; 
  is_available: boolean; 
}

const user = useState<any>('user');
const token = useCookie('token');
const currentShopId = useState<string | null>('currentShopId');
const isSaving = ref(false);
const isModalOpen = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

const form = reactive({
  id: null as string | null,
  name: '',
  category_id: '',
  description: '',
  price: 0,
  image_url: '',
  is_available: true
});

// Fetch shops to get slug for public URL
const { data: shops } = await useFetch<Shop[]>('/api/admin/shops', {
  headers: { Authorization: `Bearer ${token.value}` }
});
const currentShop = computed(() => shops.value?.find(s => s.id === currentShopId.value));

// Categories for selector
const { data: categories } = await useFetch<Category[]>(() => 
  currentShopId.value ? `/api/admin/categories?shopId=${currentShopId.value}` : '/api/admin/categories?shopId=none',
  { headers: { Authorization: `Bearer ${token.value}` } }
);

// Items for current shop
const { data: menuItems, pending, refresh: refreshItems } = await useFetch<MenuItem[]>(() => 
  currentShopId.value ? `/api/admin/menu/list?shopId=${currentShopId.value}` : '/api/admin/menu/list?shopId=none',
  { headers: { Authorization: `Bearer ${token.value}` } }
);

const openModal = (item: any = null) => {
  if (item) {
    Object.assign(form, item);
    form.is_available = !!item.is_available;
  } else {
    Object.assign(form, { 
      id: null, name: '', category_id: categories.value?.[0]?.id || '', 
      description: '', price: 0, image_url: '', is_available: true 
    });
  }
  isModalOpen.value = true;
};

const uploadImage = async (event: any) => {
  const file = event.target.files[0];
  if (!file || !currentShopId.value) return;

  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('restaurantId', currentShopId.value);

    const res = await $fetch('/api/upload', {
      method: 'POST',
      body: formData,
      headers: { Authorization: `Bearer ${token.value}` }
    }) as any;

    form.image_url = res.url;
  } catch (e) {
    console.error('Upload error:', e);
  }
};

const saveItem = async () => {
  if (!currentShopId.value) return;
  isSaving.value = true;
  try {
    const method = form.id ? 'PUT' : 'POST';
    const url = form.id ? `/api/admin/menu/${form.id}` : '/api/admin/menu';
    
    await $fetch(url, {
      method,
      body: { ...form, shop_id: currentShopId.value },
      headers: { Authorization: `Bearer ${token.value}` }
    });
    
    isModalOpen.value = false;
    refreshItems();
  } catch (e) {
    console.error('Save error:', e);
  } finally {
    isSaving.value = false;
  }
};

const deleteItem = async (id: string) => {
  if (!confirm('Are you sure you want to delete this item?')) return;
  try {
    await $fetch(`/api/admin/menu/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token.value}` }
    });
    refreshItems();
  } catch (e) {
    console.error('Delete error:', e);
  }
};

const copyLink = () => {
  if (!currentShop.value) return;
  const url = `${window.location.origin}/${currentShop.value.slug}`;
  navigator.clipboard.writeText(url);
  alert('Link copied!');
};

watch(currentShopId, () => refreshItems());
</script>
