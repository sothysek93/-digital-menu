<template>
  <div class="space-y-12 pb-24">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div class="space-y-1">
        <h2 class="text-3xl font-black tracking-tight text-slate-900 uppercase italic">Shop Settings</h2>
        <p class="text-slate-500 text-sm font-medium">Fine-tune your brand identity and shop details.</p>
      </div>
      <div v-if="!currentShopId" class="px-4 py-2 bg-amber-50 border border-amber-100 rounded-xl flex items-center gap-2 text-amber-700 text-xs font-bold uppercase tracking-widest">
        <LucideAlertCircle class="w-4 h-4" />
        Please select a shop first
      </div>
    </div>

    <div v-if="currentShopId && !pending" class="grid grid-cols-1 lg:grid-cols-3 gap-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <!-- Branding Section -->
      <div class="space-y-6">
        <div>
          <h3 class="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">Internal Identity</h3>
          <p class="text-xs text-slate-500 italic pb-6">Your brand's visual presence on the platform.</p>
        </div>

        <Card class="border-slate-100 shadow-xl rounded-[40px] overflow-hidden group">
          <div class="p-8 space-y-8">
            <div class="space-y-4 text-center">
              <Label class="text-[10px] font-black uppercase tracking-widest text-slate-400">Shop Logo</Label>
              <div 
                class="relative w-32 h-32 mx-auto rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center cursor-pointer hover:bg-slate-100 transition-all overflow-hidden group"
                @click="logoInput?.click()"
              >
                <img v-if="form.logo_url" :src="form.logo_url" class="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <div v-else class="text-slate-300">
                  <LucideImage class="w-10 h-10 mx-auto mb-2" />
                  <span class="text-[8px] font-black uppercase tracking-widest">Upload Logo</span>
                </div>
                <div class="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors"></div>
              </div>
              <input ref="logoInput" type="file" class="hidden" @change="uploadLogo" accept="image/*" />
              <p class="text-[9px] text-slate-400 italic">Recommended: 400x400px (PNG/JPG)</p>
            </div>

            <div class="space-y-4">
              <div class="space-y-2">
                <Label class="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Shop Slug (URL)</Label>
                <div class="flex items-center gap-2 px-4 h-12 bg-slate-50 rounded-2xl border border-transparent text-xs font-mono font-bold text-slate-500">
                  /{{ form.slug }}
                </div>
                <p class="text-[9px] text-slate-400 italic px-1">Slugs are immutable to prevent broken public links.</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <!-- Main Info Section -->
      <div class="lg:col-span-2 space-y-12">
        <Card class="border-slate-100 shadow-xl rounded-[40px] p-10 bg-white">
          <form @submit.prevent="saveSettings" class="space-y-10">
            <!-- Business Info -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div class="space-y-2">
                <Label for="shop_name" class="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Business Name</Label>
                <Input id="shop_name" v-model="form.name" placeholder="E.g. Zenith Bistro" class="rounded-2xl h-14 bg-slate-50 border-transparent focus:bg-white focus:ring-slate-900 text-sm font-bold" />
              </div>
              <div class="space-y-2">
                <Label for="shop_phone" class="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Contact Phone</Label>
                <Input id="shop_phone" v-model="form.phone" placeholder="+12 345 6789" class="rounded-2xl h-14 bg-slate-50 border-transparent focus:bg-white focus:ring-slate-900 text-sm font-bold" />
              </div>
            </div>

            <div class="space-y-2">
              <Label for="shop_address" class="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Physical Address</Label>
              <Input id="shop_address" v-model="form.address" placeholder="123 Gastronomy St, Flavortown" class="rounded-2xl h-14 bg-slate-50 border-transparent focus:bg-white focus:ring-slate-900 text-sm font-bold" />
            </div>

            <div class="space-y-2">
              <Label for="shop_desc" class="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Description / Tagline</Label>
              <textarea 
                id="shop_desc"
                v-model="form.description" 
                class="flex min-h-[120px] w-full rounded-[24px] border-transparent bg-slate-50 px-4 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
                placeholder="Share your kitchen's story..."
              ></textarea>
            </div>

            <div class="space-y-2">
              <Label for="shop_hours" class="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Business Hours</Label>
              <Input id="shop_hours" v-model="form.business_hours" placeholder="Mon-Sun: 9 AM - 10 PM" class="rounded-2xl h-14 bg-slate-50 border-transparent focus:bg-white focus:ring-slate-900 text-sm font-bold" />
            </div>

            <div class="flex items-center justify-between pt-6">
              <div class="flex items-center gap-3">
                <Checkbox id="is_active" v-model:checked="form.is_active" class="w-6 h-6 rounded-lg" />
                <Label for="is_active" class="font-black text-[10px] uppercase tracking-widest cursor-pointer">Live on Public Discovery</Label>
              </div>
              
              <Button type="submit" class="h-14 px-10 rounded-2xl bg-black text-white font-black uppercase tracking-widest text-xs shadow-2xl hover:translate-y-[-2px] transition-all" :disabled="isSaving">
                <LucideLoader2 v-if="isSaving" class="mr-2 h-4 w-4 animate-spin" />
                Save Business Profile
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
    
    <!-- Skeleton Loading -->
    <div v-if="pending" class="space-y-12">
       <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div class="h-96 bg-slate-50 rounded-[40px] animate-pulse"></div>
          <div class="lg:col-span-2 h-96 bg-slate-50 rounded-[40px] animate-pulse"></div>
       </div>
    </div>
    
    <!-- Empty State -->
    <div v-if="!currentShopId" class="py-32 text-center bg-white border-2 border-dashed border-slate-100 rounded-[50px]">
       <LucideStore class="w-16 h-16 text-slate-100 mx-auto mb-6" />
       <h3 class="text-xl font-bold text-slate-600 uppercase tracking-tight">No Shop Selected</h3>
       <p class="text-slate-400 text-sm italic">Switch to a shop in the sidebar to manage its settings.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  Plus as LucidePlus, Image as LucideImage, Loader2 as LucideLoader2, 
  Store as LucideStore, AlertCircle as LucideAlertCircle 
} from 'lucide-vue-next';
import { Card } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Checkbox } from '~/components/ui/checkbox';

definePageMeta({ layout: 'admin' });

const token = useCookie('token');
const currentShopId = useState<string | null>('currentShopId');
const logoInput = ref<HTMLInputElement | null>(null);
const isSaving = ref(false);

interface Shop {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  phone: string | null;
  logo_url: string | null;
  description: string | null;
  business_hours: string | null;
  is_active: boolean;
}

const form = reactive({
  name: '',
  slug: '',
  address: '',
  phone: '',
  logo_url: '',
  description: '',
  business_hours: '',
  is_active: true
});

const { data: shops, pending, refresh } = await useFetch<Shop[]>('/api/admin/shops', {
  headers: { Authorization: `Bearer ${token.value}` }
});

const currentShop = computed(() => shops.value?.find(s => s.id === currentShopId.value));

// Sync form with current shop
watchEffect(() => {
  if (currentShop.value) {
    Object.assign(form, {
      ...currentShop.value,
      is_active: !!currentShop.value.is_active
    });
  }
});

const uploadLogo = async (event: any) => {
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

    form.logo_url = res.url;
  } catch (e) {
    console.error('Upload error:', e);
  }
};

const saveSettings = async () => {
  if (!currentShopId.value) return;
  isSaving.value = true;
  try {
    await $fetch(`/api/admin/shops/${currentShopId.value}`, {
      method: 'PUT',
      body: form,
      headers: { Authorization: `Bearer ${token.value}` }
    });
    alert('Business profile updated!');
    refresh();
  } catch (e) {
    console.error('Save error:', e);
  } finally {
    isSaving.value = false;
  }
};
</script>
