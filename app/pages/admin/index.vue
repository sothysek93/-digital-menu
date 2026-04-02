<template>
  <NuxtLayout name="admin">
    <div class="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
      <div class="space-y-1">
        <h1 class="text-4xl font-black tracking-tighter text-white uppercase italic">Menu Catalog</h1>
        <p class="text-xs font-bold text-neutral-600 uppercase tracking-[0.3em]">Management / Inventory / Control</p>
      </div>
      
      <Dialog v-model:open="isModalOpen">
        <DialogTrigger as-child>
          <Button 
            class="h-14 px-8 rounded-2xl bg-white text-black font-black uppercase tracking-widest hover:bg-neutral-200 transition-all flex items-center gap-3 shadow-2xl shadow-white/5"
            @click="openModal()" 
          >
            <LucidePlus class="w-5 h-5" />
            Initialize New Item
          </Button>
        </DialogTrigger>
        <DialogContent class="sm:max-w-[525px] bg-neutral-900 border-neutral-800 rounded-[2rem] p-6 text-white overflow-hidden">
          <DialogHeader class="pb-6 border-b border-neutral-800 mb-6">
            <DialogTitle class="text-2xl font-black uppercase tracking-tight italic">{{ form.id ? 'Modify Record' : 'Create Terminal Entry' }}</DialogTitle>
            <DialogDescription class="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-600">Database Entry Node</DialogDescription>
          </DialogHeader>

          <form @submit.prevent="saveItem" class="space-y-6">
            <div class="space-y-2">
              <Label class="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">Dish Designation</Label>
              <Input v-model="form.name" placeholder="E.g. NEON BURGER" class="bg-neutral-950 border-neutral-800 h-12 rounded-xl focus-visible:ring-white" />
            </div>

            <div class="space-y-2">
              <Label class="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">Description Metadata</Label>
              <textarea v-model="form.description" class="w-full min-h-[100px] bg-neutral-950 border-neutral-800 rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-white transition-all" placeholder="Enter culinary details..."></textarea>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <Label class="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">Value (USD)</Label>
                <Input v-model.number="form.price" type="number" step="0.01" class="bg-neutral-950 border-neutral-800 h-12 rounded-xl focus-visible:ring-white" />
              </div>
              <div class="space-y-2">
                <Label class="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">Deployment Status</Label>
                <div class="flex items-center space-x-3 h-12">
                   <Checkbox id="is_available" v-model:checked="form.is_available" class="w-5 h-5 border-neutral-800 bg-neutral-950 data-[state=checked]:bg-white data-[state=checked]:text-black" />
                   <Label for="is_available" class="text-sm font-bold text-neutral-400">Available</Label>
                </div>
              </div>
            </div>

            <div class="space-y-2 pb-4">
              <Label class="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">Visual Asset</Label>
              <div 
                class="relative rounded-2xl overflow-hidden border-2 border-dashed border-neutral-800 aspect-video flex items-center justify-center cursor-pointer hover:border-neutral-600 transition-all group bg-neutral-950"
                @click="$refs.fileInput.click()"
              >
                <img v-if="form.image_url" :src="form.image_url" class="absolute inset-0 w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all opacity-40 group-hover:opacity-100" />
                <div class="relative z-10 flex flex-col items-center gap-2">
                  <LucideImage class="w-8 h-8 text-neutral-600 group-hover:text-white transition-colors" />
                  <span class="text-[10px] font-black uppercase tracking-widest text-neutral-600 group-hover:text-white transition-colors">
                    {{ form.image_url ? 'Replace Source' : 'Attach Signature Photo' }}
                  </span>
                </div>
              </div>
              <input ref="fileInput" type="file" class="hidden" accept="image/*" @change="uploadImage" />
            </div>

            <div class="flex gap-3 pt-4">
              <Button type="button" variant="ghost" class="flex-1 h-12 rounded-xl font-bold uppercase tracking-widest text-neutral-500 hover:bg-neutral-800" @click="isModalOpen = false">Abort</Button>
              <Button type="submit" class="flex-1 h-12 rounded-xl font-black uppercase tracking-widest bg-white text-black hover:bg-neutral-200" :disabled="isSaving">
                <span v-if="!isSaving">Commit Changes</span>
                <LucideLoader2 v-else class="w-4 h-4 animate-spin" />
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>

    <!-- Analytics / Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
      <Card class="bg-neutral-900 border-neutral-800 rounded-2xl overflow-hidden relative group">
        <div class="p-6">
          <p class="text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em] mb-4">Node Count</p>
          <div class="text-4xl font-black text-white italic tracking-tighter">{{ items.length }}</div>
        </div>
        <div class="absolute bottom-0 left-0 w-full h-1 bg-neutral-800 group-hover:bg-white transition-colors"></div>
      </Card>
      
      <Card class="bg-neutral-900 border-neutral-800 rounded-2xl overflow-hidden relative group">
        <div class="p-6">
          <p class="text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em] mb-4">Active Satus</p>
          <div class="text-4xl font-black text-white italic tracking-tighter">{{ items.filter(i => i.is_available).length }}</div>
        </div>
        <div class="absolute bottom-0 left-0 w-full h-1 bg-neutral-800 group-hover:bg-green-500 transition-colors"></div>
      </Card>

      <Card class="bg-neutral-900 border-neutral-800 rounded-2xl overflow-hidden relative col-span-1 md:col-span-2 group">
        <div class="p-6 flex items-center justify-between">
           <div>
             <p class="text-[10px] font-black text-neutral-600 uppercase tracking-[0.3em] mb-4">Public Gateway</p>
             <div class="text-xl font-mono text-neutral-400">/{{ user?.slug }}</div>
           </div>
           <Button variant="outline" class="border-neutral-800 rounded-xl h-10 px-4 group-hover:bg-white group-hover:text-black transition-all">
             <LucideExternalLink class="w-4 h-4" />
           </Button>
        </div>
        <div class="absolute bottom-0 left-0 w-full h-1 bg-neutral-800 group-hover:bg-blue-500 transition-colors"></div>
      </Card>
    </div>

    <!-- Data Grid -->
    <div class="rounded-3xl border border-neutral-800 bg-neutral-900/20 backdrop-blur-3xl overflow-hidden shadow-2xl">
      <Table>
        <TableHeader class="bg-neutral-900/50">
          <TableRow class="hover:bg-transparent border-neutral-800">
            <TableHead class="w-[80px] text-[10px] font-black uppercase text-neutral-600 tracking-widest h-12 px-6">Asset</TableHead>
            <TableHead class="text-[10px] font-black uppercase text-neutral-600 tracking-widest h-12 px-6">Component Name</TableHead>
            <TableHead class="text-[10px] font-black uppercase text-neutral-600 tracking-widest h-12 px-6">Value (USD)</TableHead>
            <TableHead class="text-[10px] font-black uppercase text-neutral-600 tracking-widest h-12 px-6">Status</TableHead>
            <TableHead class="text-right text-[10px] font-black uppercase text-neutral-600 tracking-widest h-12 px-6">System Controls</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="item in items" :key="item.id" class="border-neutral-800/50 hover:bg-white/[0.02] transition-colors group">
            <TableCell class="py-4 px-6">
              <div class="w-12 h-12 rounded-xl bg-neutral-800 overflow-hidden border border-neutral-700/50">
                <img v-if="item.image_url" :src="item.image_url" class="w-full h-full object-cover grayscale transition-all group-hover:grayscale-0" />
              </div>
            </TableCell>
            <TableCell class="py-4 px-6">
              <p class="font-black text-sm uppercase tracking-tight text-white">{{ item.name }}</p>
              <p class="text-[10px] font-medium text-neutral-600 truncate max-w-[200px]">{{ item.description }}</p>
            </TableCell>
            <TableCell class="py-4 px-6 font-mono text-sm text-neutral-400 tracking-tighter">
              ${{ item.price.toFixed(2) }}
            </TableCell>
            <TableCell class="py-4 px-6">
              <Badge 
                :variant="item.is_available ? 'secondary' : 'destructive'"
                class="rounded-full text-[9px] font-black uppercase tracking-widest px-3 py-1"
                :class="item.is_available ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' : ''"
              >
                {{ item.is_available ? 'OPERATIONAL' : 'OFFLINE' }}
              </Badge>
            </TableCell>
            <TableCell class="py-4 px-6 text-right">
              <div class="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="outline" size="icon" class="w-9 h-9 border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white" @click="openModal(item)">
                  <LucideEdit2 class="w-4 h-4 text-inherit" />
                </Button>
                <Button variant="outline" size="icon" class="w-9 h-9 border-neutral-800 bg-neutral-950 text-red-500/50 hover:text-red-500 hover:bg-red-500/10" @click="deleteItem(item.id)">
                  <LucideTrash2 class="w-4 h-4 text-inherit" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
          <TableRow v-if="pending" v-for="i in 5" :key="i" class="border-neutral-800/50">
            <TableCell colspan="5" class="p-0">
               <Skeleton class="w-full h-20 bg-neutral-900" />
            </TableCell>
          </TableRow>
          <TableRow v-if="!pending && items.length === 0">
             <TableCell colspan="5" class="py-20 text-center">
                <p class="text-[10px] font-black uppercase tracking-[0.5em] text-neutral-700">Database Empty / No Records Found</p>
             </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </NuxtLayout>
</template>

<script setup>
import { 
  LucidePlus, LucideImage, LucideLoader2, LucideExternalLink, 
  LucideEdit2, LucideTrash2 
} from 'lucide-vue-next';

const router = useRouter();
const user = useState('user');
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
  const token = localStorage.getItem('token');
  if (!token) {
    router.push('/admin/login');
  } else {
    refreshItems();
  }
});

const refreshItems = async () => {
  if (!user.value?.slug) return;
  pending.value = true;
  try {
    const res = await $fetch(`/api/public/menu?slug=${user.value.slug}`);
    items.value = res;
  } catch (e) {
    console.error(e);
  } finally {
    pending.value = false;
  }
};

const openModal = (item = null) => {
  if (item) {
    Object.assign(form, item);
    // Handle SQLite binary boolean properly
    form.is_available = !!item.is_available;
  } else {
    Object.assign(form, { id: null, name: '', description: '', price: 0, image_url: '', is_available: true });
  }
  isModalOpen.value = true;
};

const uploadImage = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('restaurantId', user.value.id);

    const res = await $fetch('/api/upload', {
      method: 'POST',
      body: formData,
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });

    form.image_url = res.url;
  } catch (e) {
    console.error('Upload error:', e);
  }
};

const saveItem = async () => {
  isSaving.value = true;
  try {
    const method = form.id ? 'PUT' : 'POST';
    const url = form.id ? `/api/admin/menu/${form.id}` : '/api/admin/menu';
    
    await $fetch(url, {
      method,
      body: { ...form, restaurant_id: user.value.id },
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    
    isModalOpen.value = false;
    refreshItems();
  } catch (e) {
    console.error(e);
  } finally {
    isSaving.value = false;
  }
};

const deleteItem = async (id) => {
  if (!confirm('COMMIT DELETION: ARE YOU SURE?')) return;
  try {
    await $fetch(`/api/admin/menu/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    refreshItems();
  } catch (e) {
    console.error(e);
  }
};
</script>
