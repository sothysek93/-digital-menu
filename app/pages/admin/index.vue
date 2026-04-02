<template>
  <NuxtLayout name="admin">
    <div class="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-extrabold gradient-text mb-2 tracking-tight">Menu Items</h1>
        <p class="text-neutral-500 font-medium">Manage your restaurant offerings and pricing.</p>
      </div>
      <UButton 
        icon="i-heroicons-plus" 
        size="xl" 
        label="Add New Dish" 
        class="rounded-2xl px-6 font-bold uppercase tracking-wider" 
        @click="openModal()" 
      />
    </div>

    <!-- Stats Section -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
      <UCard class="bg-neutral-900 border-neutral-800 rounded-3xl">
        <template #header>
          <div class="flex items-center gap-2 text-neutral-500 font-bold uppercase text-[10px] tracking-widest px-2">
            <UIcon name="i-heroicons-list-bullet" class="w-4 h-4" />
            Total Items
          </div>
        </template>
        <div class="text-4xl font-black gradient-text">{{ items.length }}</div>
      </UCard>
      <UCard class="bg-neutral-900 border-neutral-800 rounded-3xl">
        <template #header>
          <div class="flex items-center gap-2 text-neutral-500 font-bold uppercase text-[10px] tracking-widest px-2">
            <UIcon name="i-heroicons-check-circle" class="w-4 h-4" />
            Available
          </div>
        </template>
        <div class="text-4xl font-black text-green-500">{{ items.filter(i => i.is_available).length }}</div>
      </UCard>
      <UCard v-if="user" class="bg-neutral-900 border-neutral-800 rounded-3xl group cursor-pointer hover:border-primary transition-colors overflow-hidden">
        <template #header>
          <div class="flex items-center gap-2 text-neutral-500 font-bold uppercase text-[10px] tracking-widest px-2">
            <UIcon name="i-heroicons-qr-code" class="w-4 h-4" />
            Public Link
          </div>
        </template>
        <div class="text-sm font-mono text-neutral-400 group-hover:text-primary transition-colors">
          /{{ user.slug }}
        </div>
      </UCard>
    </div>

    <!-- Main Table -->
    <UTable 
      :rows="items" 
      :columns="columns" 
      :loading="pending"
      class="bg-neutral-900/40 border border-neutral-800 rounded-3xl overflow-hidden backdrop-blur-3xl"
      :ui="{
        th: { base: 'bg-neutral-900/50 backdrop-blur-lg border-b border-neutral-800 font-bold uppercase tracking-wider text-[11px] text-neutral-400' },
        td: { base: 'text-sm text-neutral-200 border-b border-neutral-800/50 p-4' },
      }"
    >
      <template #image_url-data="{ row }">
        <UAvatar :src="row.image_url" size="lg" class="rounded-xl border border-neutral-800 shadow-xl" />
      </template>

      <template #price-data="{ row }">
        <span class="font-bold text-pink-500">${{ row.price }}</span>
      </template>

      <template #is_available-data="{ row }">
        <UBadge 
          :color="row.is_available ? 'green' : 'red'" 
          variant="soft" 
          class="rounded-full font-bold uppercase tracking-tighter text-[10px]"
        >
          {{ row.is_available ? 'Active' : 'Sold Out' }}
        </UBadge>
      </template>

      <template #actions-data="{ row }">
        <div class="flex justify-end gap-2">
          <UButton 
            icon="i-heroicons-pencil-square" 
            color="primary" 
            variant="soft" 
            size="sm" 
            class="rounded-xl"
            @click="openModal(row)" 
          />
          <UButton 
            icon="i-heroicons-trash" 
            color="red" 
            variant="soft" 
            size="sm" 
            class="rounded-xl"
            @click="deleteItem(row.id)" 
          />
        </div>
      </template>
    </UTable>

    <!-- Modal Form -->
    <UModal v-model="isModalOpen" :ui="{ content: 'bg-neutral-900 border border-neutral-800 rounded-3xl' }">
      <UCard :ui="{ base: 'shadow-none', ring: '', divide: 'divide-y divide-neutral-800' }">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-xl font-bold gradient-text">{{ form.id ? 'Edit Item' : 'New Dish' }}</h3>
            <UButton icon="i-heroicons-x-mark" color="neutral" variant="ghost" @click="isModalOpen = false" />
          </div>
        </template>

        <form @submit.prevent="saveItem" class="p-4 space-y-6">
          <UFormGroup label="Item Name" name="name" required>
            <UInput v-model="form.name" placeholder="Signature Burger" size="lg" class="rounded-xl" />
          </UFormGroup>

          <UFormGroup label="Description" name="description">
            <UTextarea v-model="form.description" placeholder="Short appetizing description..." autoresize size="lg" class="rounded-xl" />
          </UFormGroup>

          <div class="grid grid-cols-2 gap-4">
            <UFormGroup label="Price ($)" name="price" required>
              <UInput v-model.number="form.price" type="number" step="0.01" size="lg" class="rounded-xl" />
            </UFormGroup>
            <UFormGroup label="Status" name="is_available" class="flex flex-col justify-end">
              <div class="flex items-center gap-3 mb-2 px-1">
                <p class="text-sm font-medium">Available</p>
                <UToggle v-model="form.is_available" color="primary" />
              </div>
            </UFormGroup>
          </div>

          <UFormGroup label="Food Image" name="image_url">
            <div class="space-y-4">
              <div v-if="form.image_url" class="relative rounded-2xl overflow-hidden border border-neutral-800 aspect-video group">
                <img :src="form.image_url" class="w-full h-full object-cover" />
                <div class="absolute inset-0 bg-neutral-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <UButton icon="i-heroicons-arrow-path" color="white" variant="soft" label="Change Image" @click="$refs.fileInput.click()" />
                </div>
              </div>
              <UButton 
                v-else 
                icon="i-heroicons-photo" 
                block 
                color="neutral" 
                variant="outline" 
                label="Select Photo" 
                size="xl"
                class="rounded-2xl border-dashed border-2 py-8"
                @click="$refs.fileInput.click()" 
              />
              <input ref="fileInput" type="file" class="hidden" accept="image/*" @change="uploadImage" />
            </div>
          </UFormGroup>

          <div class="pt-4 flex justify-end gap-3">
            <UButton label="Cancel" color="neutral" variant="ghost" size="lg" class="rounded-xl" @click="isModalOpen = false" />
            <UButton 
              type="submit" 
              color="primary" 
              size="lg" 
              class="rounded-xl px-12 font-bold" 
              :loading="isSaving" 
              label="Save Item" 
            />
          </div>
        </form>
      </UCard>
    </UModal>
  </NuxtLayout>
</template>

<script setup>
const router = useRouter();
const user = useState('user');
const items = ref([]);
const pending = ref(true);
const isSaving = ref(false);
const isModalOpen = ref(false);

const columns = [
  { key: 'image_url', label: 'Dish' },
  { key: 'name', label: 'Name', sortable: true },
  { key: 'price', label: 'Price (USD)', sortable: true },
  { key: 'is_available', label: 'Status' },
  { key: 'actions', label: '' }
];

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
  } else {
    Object.assign(form, { id: null, name: '', description: '', price: 0, image_url: '', is_available: true });
  }
  isModalOpen.value = true;
};

const uploadImage = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  try {
    // 1. Get pre-signed URL
    const { uploadUrl, key } = await $fetch('/api/upload', {
      method: 'POST',
      body: { 
        fileName: file.name, 
        restaurantId: user.value.id 
      },
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });

    // 2. Upload file directly to R2
    await $fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type }
    });

    // 3. Set public URL
    // Construct the public URL (you'll need to define your R2 public bucket URL)
    const R2_PUBLIC_DOMAIN = 'https://pub-your-id.r2.dev'; // Replace with your R2 domain
    form.image_url = `https://menus.tipsha.com/${key}`; // Example: if using custom domain
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
  if (!confirm('Are you sure?')) return;
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
