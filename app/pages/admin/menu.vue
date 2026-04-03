<template>
  <div v-if="!user" class="min-h-screen bg-background flex items-center justify-center p-4">
      <LucideLoader2 class="w-8 h-8 animate-spin text-muted-foreground/20" />
      <span class="ml-4 text-muted-foreground font-bold tracking-tight text-xs uppercase animate-pulse">Syncing...</span>
  </div>
  <div v-else class="space-y-8 pb-12 animate-in fade-in duration-500">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
      <div>
        <h2 class="text-3xl font-bold tracking-tight text-foreground">Menu Items</h2>
        <p class="text-muted-foreground text-sm font-medium">Manage dishes for the current location.</p>
      </div>

      <div class="flex items-center gap-2">
        <Dialog v-model:open="isSyncModalOpen">
          <DialogTrigger as-child>
            <Button variant="outline" class="rounded-lg h-10 px-4 border-dashed border-border hover:bg-accent/50" :disabled="!currentShopId || (shopsResult?.items?.length || 0) < 2">
              <LucideRefreshCw class="mr-2 h-3.5 w-3.5" />
              Sync Items
            </Button>
          </DialogTrigger>
          <DialogContent class="sm:max-w-md rounded-lg">
            <DialogHeader class="space-y-3">
              <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-2">
                 <LucideCopy class="w-5 h-5" />
              </div>
              <DialogTitle class="text-xl font-bold tracking-tight text-foreground">Clone Location Patterns</DialogTitle>
              <DialogDescription class="text-xs font-medium text-muted-foreground leading-relaxed">
                 Choose a source location to replicate categories and dishes into this branch. 
                 <p class="mt-2 text-destructive font-bold uppercase tracking-widest text-[9px]">Potential data duplication if already synced.</p>
              </DialogDescription>
            </DialogHeader>

            <div class="space-y-6 pt-4">
               <div class="space-y-1.5">
                  <Label class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Select Source Branch</Label>
                  <Select v-model="sourceShopId">
                    <SelectTrigger class="w-full h-11 rounded-lg border-border bg-background font-medium text-xs">
                       <SelectValue placeholder="Selecting location..." />
                    </SelectTrigger>
                    <SelectContent class="rounded-lg border-border">
                       <SelectItem 
                         v-for="s in shopsResult?.items?.filter((s: any) => s.id !== currentShopId)" 
                         :key="s.id" 
                         :value="s.id" 
                         class="text-xs font-bold py-2.5 rounded-md m-1"
                       >
                         {{ s.name }}
                       </SelectItem>
                    </SelectContent>
                  </Select>
               </div>

               <div class="flex items-center space-x-3 p-4 bg-muted/30 rounded-lg border border-border/50">
                  <Checkbox id="includeBranding" v-model:checked="includeBranding" class="rounded-md" />
                  <div class="space-y-0.5">
                    <Label for="includeBranding" class="text-[10px] font-black uppercase tracking-widest text-foreground cursor-pointer">Clone Branding & Service</Label>
                    <p class="text-[9px] text-muted-foreground font-medium">Replicates Logo, Address, Phone, and Hours.</p>
                  </div>
               </div>
            </div>

            <DialogFooter class="pt-6">
              <Button variant="ghost" @click="isSyncModalOpen = false" class="rounded-lg h-10 text-xs font-bold">Discard</Button>
              <Button :disabled="!sourceShopId || isSyncing" class="rounded-lg h-10 px-8 text-xs font-bold text-background bg-foreground" @click="handleSync">
                <LucideLoader2 v-if="isSyncing" class="mr-2 h-4 w-4 animate-spin" />
                Begin Synchronization
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog v-model:open="isModalOpen">
          <DialogTrigger as-child>
            <Button @click="openModal()" class="rounded-lg h-10 px-4" :disabled="!currentShopId || (categories && categories.length === 0)">
              <LucidePlus class="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent class="sm:max-w-md rounded-lg">
            <DialogHeader>
              <DialogTitle class="text-xl font-bold tracking-tight text-foreground">{{ form.id ? 'Edit Item' : 'Create Item' }}</DialogTitle>
              <DialogDescription class="text-xs font-medium">Update the details for this menu entry.</DialogDescription>
            </DialogHeader>

            <form @submit.prevent="saveItem" class="space-y-5 pt-3">
              <div class="space-y-1.5">
                <Label class="text-xs font-bold text-muted-foreground px-0.5">Item Name</Label>
                <Input v-model="form.name" placeholder="Classic Burger" required class="h-10 rounded-lg bg-background" />
              </div>

              <div class="space-y-1.5">
                <Label class="text-xs font-bold text-muted-foreground px-0.5">Category</Label>
                <Select v-model="form.category_id" required>
                  <SelectTrigger class="w-full h-10 rounded-lg bg-background">
                    <SelectValue placeholder="Select context" />
                  </SelectTrigger>
                  <SelectContent class="rounded-lg">
                    <SelectItem v-for="cat in categories" :key="cat.id" :value="cat.id" class="text-xs font-medium rounded-md m-1">
                      {{ cat.name }}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <p v-if="categories && categories.length === 0" class="text-[10px] text-destructive font-bold uppercase mt-1">
                   Create a category first!
                </p>
              </div>

              <div class="space-y-1.5">
                <Label class="text-xs font-bold text-muted-foreground px-0.5">Description</Label>
                <textarea 
                  v-model="form.description" 
                  class="flex min-h-[80px] w-full rounded-lg border border-input bg-background px-3 py-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/40"
                  placeholder="Details..."
                ></textarea>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-1.5">
                  <Label class="text-xs font-bold text-muted-foreground px-0.5">Price ($)</Label>
                  <Input v-model.number="form.price" type="number" step="0.01" required class="h-10 rounded-lg bg-background" />
                </div>
                <div class="flex items-center space-x-2 pt-6">
                  <Checkbox id="available" v-model:checked="form.is_available" class="rounded-md" />
                  <Label for="available" class="text-xs font-bold text-muted-foreground cursor-pointer">Available</Label>
                </div>
              </div>

              <div class="space-y-1.5">
                <Label class="text-xs font-bold text-muted-foreground px-0.5">Image URL</Label>
                <div 
                   class="relative aspect-video rounded-lg border border-dashed border-border flex items-center justify-center cursor-pointer hover:bg-muted transition-colors overflow-hidden"
                   @click="fileInput?.click()"
                 >
                  <img v-if="form.image_url" :src="form.image_url" class="absolute inset-0 w-full h-full object-cover" />
                  <div v-else class="text-center">
                    <LucideImage class="mx-auto h-6 w-6 text-muted-foreground opacity-20" />
                    <span class="text-[10px] text-muted-foreground mt-2 block font-bold uppercase tracking-wider">Empty Canvas</span>
                  </div>
                </div>
                <input ref="fileInput" type="file" class="hidden" @change="uploadImage" />
              </div>

              <DialogFooter class="pt-2">
                <Button type="button" variant="ghost" @click="isModalOpen = false" class="rounded-lg h-10 px-6 text-xs font-bold">Discard</Button>
                <Button type="submit" :disabled="isSaving" class="rounded-lg h-10 px-8 text-xs font-bold text-background bg-foreground">
                  <LucideLoader2 v-if="isSaving" class="mr-2 h-4 w-4 animate-spin" />
                  {{ form.id ? 'Save Changes' : 'Confirm Entry' }}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <Dialog v-model:open="isDeleteModalOpen">
      <DialogContent class="sm:max-w-md rounded-lg p-8">
        <DialogHeader class="space-y-3">
          <div class="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center text-destructive mb-2">
            <LucideAlertTriangle class="w-5 h-5" />
          </div>
          <DialogTitle class="text-xl font-bold tracking-tight text-foreground">Delete Dish?</DialogTitle>
          <DialogDescription class="text-xs font-medium text-muted-foreground leading-relaxed">
            Are you sure you want to remove <span class="text-foreground font-bold font-sans">"{{ itemToDelete?.name }}"</span> from the catalog? This cannot be undone.
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

    <!-- Inventory Table -->
    <div class="space-y-4">
      <Card class="border border-border shadow-none overflow-hidden rounded-lg">
        <Table>
          <TableHeader class="bg-muted/50">
            <TableRow>
              <TableHead class="w-[70px] text-[10px] font-bold uppercase tracking-wider">Photo</TableHead>
              <TableHead class="text-[10px] font-bold uppercase tracking-wider">Product</TableHead>
              <TableHead class="text-[10px] font-bold uppercase tracking-wider">Group</TableHead>
              <TableHead class="text-[10px] font-bold uppercase tracking-wider">Price</TableHead>
              <TableHead class="text-[10px] font-bold uppercase tracking-wider">Availability</TableHead>
              <TableHead class="text-right text-[10px] font-bold uppercase tracking-wider">Control</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="item in (data?.items || [])" :key="item.id" class="hover:bg-muted/30 transition-colors">
              <TableCell>
                <div class="w-10 h-10 rounded-lg bg-muted overflow-hidden border border-border shrink-0">
                  <img v-if="item.image_url" :src="item.image_url" class="w-full h-full object-cover" />
                  <div v-else class="w-full h-full flex items-center justify-center opacity-10">
                    <LucideImage class="h-4 w-4" />
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div class="font-bold text-xs text-foreground leading-tight">{{ item.name }}</div>
                <div class="text-[10px] text-muted-foreground line-clamp-1 max-w-[150px] mt-0.5">{{ item.description }}</div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" class="text-[8px] font-bold uppercase bg-background rounded-md px-1.5 h-5">
                  {{ item.category_name || 'Rest' }}
                </Badge>
              </TableCell>
              <TableCell class="font-mono text-[11px] font-bold text-foreground">${{ item.price.toFixed(2) }}</TableCell>
              <TableCell>
                <Badge :variant="item.is_available ? 'secondary' : 'outline'" class="rounded-md h-5 px-2 text-[8px] font-bold uppercase">
                  {{ item.is_available ? 'Live' : 'Hidden' }}
                </Badge>
              </TableCell>
              <TableCell class="text-right">
                <div class="flex justify-end gap-1">
                  <Button variant="ghost" size="icon" @click="openModal(item)" class="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground">
                    <LucidePencil class="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" class="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/5" @click="deleteItem(item)">
                    <LucideTrash2 class="h-3.5 w-3.5" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
            <TableRow v-if="!pending && (!data?.items || data.items.length === 0)">
              <TableCell colspan="6" class="py-24 text-center text-muted-foreground text-xs font-medium italic">
                {{ !currentShopId ? 'Select location above' : 'Inventory empty' }}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>

      <!-- Minimalist Pagination -->
      <div v-if="data?.total > 10" class="flex items-center justify-between px-2 py-4 border-t border-border mt-4">
        <p class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
          Page {{ currentPage }} of {{ Math.ceil(data.total / 10) }}
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
            :disabled="currentPage >= Math.ceil(data.total / 10)"
            @click="currentPage++"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
      
    <!-- Public URL Info -->
    <Card v-if="currentShop" class="border border-border rounded-lg p-5 flex flex-col md:flex-row items-center justify-between gap-6 shadow-none">
      <div class="flex items-center gap-4 w-full">
        <div class="w-10 h-10 rounded-lg bg-accent flex items-center justify-center border border-border shadow-sm">
           <LucideGlobe class="w-4 h-4 text-foreground" />
        </div>
        <div class="flex-1">
          <div class="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1.5">Public Endpoint</div>
          <div class="text-xs font-bold text-foreground flex items-center gap-2">
            /{{ currentShop?.slug }}
            <div class="flex items-center gap-1.5 text-[8px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
               <span class="w-1 h-1 rounded-full bg-emerald-500"></span>
               Live
            </div>
          </div>
        </div>
      </div>
      
      <div class="flex items-center gap-2 w-full md:w-auto">
        <Button variant="outline" class="flex-1 md:flex-none rounded-lg h-9 px-4 text-xs font-bold" @click="copyLink">
           Copy Link
        </Button>
        <Button as-child class="flex-1 md:flex-none rounded-lg h-9 px-4 text-xs font-bold bg-foreground text-background hover:bg-foreground/90">
           <NuxtLink :to="`/${currentShop?.slug}`" target="_blank">
             View Live
           </NuxtLink>
        </Button>
      </div>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { 
  Plus as LucidePlus, Image as LucideImage, Loader2 as LucideLoader2, 
  Pencil as LucidePencil, Trash2 as LucideTrash2, Globe as LucideGlobe, ExternalLink as LucideExternalLink,
  AlertTriangle as LucideAlertTriangle, RefreshCw as LucideRefreshCw, Copy as LucideCopy
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
import { toast } from 'vue-sonner';

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
const isSyncing = ref(false);
const isModalOpen = ref(false);
const isSyncModalOpen = ref(false);
const sourceShopId = ref('');
const includeBranding = ref(true);
const fileInput = ref<HTMLInputElement | null>(null);
const currentPage = ref(1);

const form = reactive({
  id: null as string | null,
  name: '',
  category_id: '',
  description: '',
  price: 0,
  image_url: '',
  is_available: true
});

const { data: shopsResult } = await useFetch<any>('/api/admin/shops', {
  headers: { Authorization: `Bearer ${token.value}` }
});
const currentShop = computed(() => shopsResult.value?.items?.find((s: any) => s.id === currentShopId.value));

const { data: categoriesResult, refresh: refreshCategories } = await useFetch<any>(() => 
  currentShopId.value ? `/api/admin/categories?shopId=${currentShopId.value}&limit=100` : '/api/admin/categories?shopId=none',
  { headers: { Authorization: `Bearer ${token.value}` } }
);
const categories = computed(() => categoriesResult.value?.items || []);

const { data, pending, refresh: refreshItems } = await useFetch<any>(() => 
  currentShopId.value ? `/api/admin/menu/list?shopId=${currentShopId.value}&page=${currentPage.value}&limit=10` : '/api/admin/menu/list?shopId=none',
  { headers: { Authorization: `Bearer ${token.value}` }, watch: [currentPage] }
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

const handleSync = async () => {
  if (!sourceShopId.value || !currentShopId.value) return;
  isSyncing.value = true;
  
  const syncToastId = toast.loading('Synchronizing Catalog', {
    description: 'Replicating categories and dishes...'
  });

  try {
    await $fetch('/api/admin/menu/sync', {
      method: 'POST',
      body: {
        sourceShopId: sourceShopId.value,
        targetShopId: currentShopId.value,
        includeBranding: includeBranding.value
      },
      headers: { Authorization: `Bearer ${token.value}` }
    });

    toast.success('Location Patterns Cloned', {
      id: syncToastId,
      description: 'The menu and branding are now live.'
    });

    isSyncModalOpen.value = false;
    refreshItems();
    refreshCategories();
    
    // Refresh shop data if branding was synced
    if (includeBranding.value) {
       window.location.reload(); 
    }
  } catch (e: any) {
    toast.error('Sync failure', {
      id: syncToastId,
      description: e.data?.message || 'We could not clone the catalog.'
    });
  } finally {
    isSyncing.value = false;
  }
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
    toast.success('Photo Uploaded', { description: 'Item visual has been synchronized.' });
  } catch (e: any) {
    toast.error('Upload Error', { description: 'Could not sync the dish photo.' });
  }
};

const saveItem = async () => {
  if (!currentShopId.value) return;
  isSaving.value = true;
  try {
    const isEdit = !!form.id;
    const url = isEdit ? `/api/admin/menu/${form.id}` : '/api/admin/menu';
    
    await $fetch(url, {
      method: isEdit ? 'PUT' : 'POST',
      body: { ...form, shop_id: currentShopId.value },
      headers: { Authorization: `Bearer ${token.value}` }
    });
    
    toast.success(isEdit ? 'Dish Synchronized' : 'New Dish Added', {
      description: `"${form.name}" was successfully saved to your catalog.`
    });
    
    isModalOpen.value = false;
    refreshItems();
  } catch (e: any) {
    toast.error('Sync error', { description: 'Could not save dish details. Please check your connection.' });
  } finally {
    isSaving.value = false;
  }
};

const isDeleteModalOpen = ref(false);
const itemToDelete = ref<MenuItem | null>(null);

const deleteItem = (item: MenuItem) => {
  itemToDelete.value = item;
  isDeleteModalOpen.value = true;
};

const confirmDelete = async () => {
  if (!itemToDelete.value) return;
  isSaving.value = true;
  
  try {
    await $fetch(`/api/admin/menu/${itemToDelete.value.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token.value}` }
    });
    
    toast.success('Dish Discarded', {
      description: `"${itemToDelete.value.name}" has been purged from the catalog.`
    });
    
    isDeleteModalOpen.value = false;
    refreshItems();
  } catch (e: any) {
    toast.error('Purge Failed', {
      description: e.data?.message || 'We could not remove this item at this time.'
    });
  } finally {
    isSaving.value = false;
  }
};

const copyLink = () => {
  if (!currentShop.value) return;
  const url = `${window.location.origin}/${currentShop.value.slug}`;
  navigator.clipboard.writeText(url);
  toast.success('Link Copied', { description: 'URL is now on your clipboard.' });
};

watch(currentShopId, () => {
  currentPage.value = 1;
  refreshItems();
  refreshCategories();
});
</script>
