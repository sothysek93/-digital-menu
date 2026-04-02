<template>
  <div class="min-h-screen bg-slate-50 flex flex-col">
    <!-- Header -->
    <header class="bg-white border-b border-slate-200">
      <div class="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <LucideLayoutDashboard class="w-5 h-5 text-slate-900" />
          <h1 class="text-xl font-bold text-slate-900">Menu Manager</h1>
        </div>
        <div class="flex items-center gap-4">
          <span class="text-sm font-medium text-slate-500">{{ user?.name }}</span>
          <Button variant="ghost" size="sm" @click="logout" class="text-slate-500 hover:text-slate-950">
            Logout
          </Button>
        </div>
      </div>
    </header>

    <main class="flex-1 max-w-7xl mx-auto px-4 py-8 w-full space-y-8">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 class="text-3xl font-bold tracking-tight text-slate-900">Catalogue</h2>
          <p class="text-slate-500 text-sm">Manage your restaurant catalog and availability</p>
        </div>

        <Dialog v-model:open="isModalOpen">
          <DialogTrigger as-child>
            <Button @click="openModal()" class="rounded-full shadow-sm">
              <LucidePlus class="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent class="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{{ form.id ? 'Edit Item' : 'New Item' }}</DialogTitle>
              <DialogDescription>Enter the details for your menu dish.</DialogDescription>
            </DialogHeader>

            <form @submit.prevent="saveItem" class="space-y-4 pt-4">
              <div class="space-y-2">
                <Label for="dish_name">Dish Name</Label>
                <Input id="dish_name" v-model="form.name" placeholder="Classic Burger" required />
              </div>

              <div class="space-y-2">
                <Label for="dish_desc">Description</Label>
                <textarea 
                  id="dish_desc"
                  v-model="form.description" 
                  class="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950"
                  placeholder="Describe your dish..."
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
                  class="relative aspect-video rounded-lg border-2 border-dashed border-slate-200 flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors overflow-hidden"
                  @click="$refs.fileInput.click()"
                >
                  <img v-if="form.image_url" :src="form.image_url" class="absolute inset-0 w-full h-full object-cover" />
                  <div v-else class="text-center">
                    <LucideImage class="mx-auto h-8 w-8 text-slate-300" />
                    <span class="text-xs text-slate-400 mt-2 block font-medium">Upload Photo</span>
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

      <!-- Inventory Table -->
      <Card class="border-slate-200 shadow-sm overflow-hidden py-1 px-1">
        <Table>
          <TableHeader class="bg-slate-50">
            <TableRow>
              <TableHead class="w-[80px]">Photo</TableHead>
              <TableHead>Item Details</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead class="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="item in items" :key="item.id">
              <TableCell>
                <div class="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden border border-slate-200">
                  <img v-if="item.image_url" :src="item.image_url" class="w-full h-full object-cover" />
                </div>
              </TableCell>
              <TableCell>
                <div class="font-semibold text-slate-900">{{ item.name }}</div>
                <div class="text-xs text-slate-500 line-clamp-1 truncate max-w-[200px]">{{ item.description }}</div>
              </TableCell>
              <TableCell class="font-medium font-mono">${{ item.price.toFixed(2) }}</TableCell>
              <TableCell>
                <Badge :variant="item.is_available ? 'outline' : 'secondary'">
                  {{ item.is_available ? 'Active' : 'Offline' }}
                </Badge>
              </TableCell>
              <TableCell class="text-right">
                <div class="flex justify-end gap-1">
                  <Button variant="ghost" size="icon" @click="openModal(item)">
                    <LucidePencil class="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" class="text-red-500 hover:text-red-600 hover:bg-red-50" @click="deleteItem(item.id)">
                    <LucideTrash2 class="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
            <TableRow v-if="!pending && items.length === 0">
              <TableCell colspan="5" class="py-12 text-center text-slate-400 font-medium">
                No items found. Add your first item above!
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Card>
      
      <!-- Public URL Info -->
      <div class="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
             <LucideGlobe class="w-5 h-5 text-slate-400" />
          </div>
          <div>
            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Public Menu Link</div>
            <div class="text-sm font-medium text-slate-900">https://digital-menu-95n.pages.dev/{{ user?.slug }}</div>
          </div>
        </div>
        <Button variant="outline" class="rounded-full shadow-sm" as-child>
           <NuxtLink :to="`/${user?.slug}`" target="_blank">
             View Live Menu
             <LucideExternalLink class="ml-2 h-4 w-4" />
           </NuxtLink>
        </Button>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { 
  LucideLayoutDashboard, LucidePlus, LucideImage, LucideLoader2, 
  LucidePencil, LucideTrash2, LucideGlobe, LucideExternalLink 
} from 'lucide-vue-next';
import { Card, CardContent } from '../../components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Checkbox } from '../../components/ui/checkbox';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogDescription, DialogFooter, DialogTrigger 
} from '../../components/ui/dialog';

// Use proper Nuxt middleware
definePageMeta({ middleware: 'auth' });

const router = useRouter();
const user = useState('user') as any;
const token = useCookie('token');
const items = ref([]);
const pending = ref(true);
const isSaving = ref(false);
const isModalOpen = ref(false);

const form = reactive({
  id: null,
  name: '',
  description: '',
  price: 0,
  image_url: '',
  is_available: true
});

onMounted(() => {
  if (token.value) {
    refreshItems();
  } else {
    router.push('/admin/login');
  }
});

const refreshItems = async () => {
  if (!user.value?.slug) return;
  pending.value = true;
  try {
    const res = await $fetch(`/api/public/menu?slug=${user.value.slug}`) as any;
    items.value = res || [];
  } catch (e) {
    console.error('Fetch items error:', e);
  } finally {
    pending.value = false;
  }
};

const openModal = (item: any = null) => {
  if (item) {
    Object.assign(form, item);
    form.is_available = !!item.is_available;
  } else {
    Object.assign(form, { id: null, name: '', description: '', price: 0, image_url: '', is_available: true });
  }
  isModalOpen.value = true;
};

const uploadImage = async (event: any) => {
  const file = event.target.files[0];
  if (!file || !user.value) return;

  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('restaurantId', user.value.id);

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
  if (!user.value) return;
  isSaving.value = true;
  try {
    const method = form.id ? 'PUT' : 'POST';
    const url = form.id ? `/api/admin/menu/${form.id}` : '/api/admin/menu';
    
    await $fetch(url, {
      method,
      body: { ...form, restaurant_id: user.value.id },
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

const logout = () => {
  token.value = null;
  user.value = null;
  router.push('/admin/login');
};
</script>
