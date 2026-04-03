<template>
  <div class="space-y-10 selection:bg-slate-900 selection:text-white pb-32">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div class="space-y-1.5 px-1">
        <h2 class="text-4xl font-black tracking-tighter text-slate-900 uppercase italic leading-none">Shop Configuration</h2>
        <p class="text-slate-400 text-xs font-bold uppercase tracking-widest leading-none">Refine your identity and operational parameters.</p>
      </div>
      
      <div class="flex items-center gap-3">
         <div v-if="!currentShopId" class="px-6 py-3 bg-amber-50 rounded-2xl border border-amber-100/50 flex items-center gap-3 text-amber-700 text-[10px] font-black uppercase tracking-widest shadow-sm">
           <LucideAlertCircle class="w-4 h-4" />
           Select Shop context
         </div>
         <Button 
           v-if="currentShopId" 
           @click="saveSettings" 
           :disabled="isSaving" 
           class="h-13 px-8 rounded-2xl bg-black text-white font-black uppercase tracking-widest text-[10px] shadow-2xl hover:translate-y-[-2px] transition-all"
         >
            <LucideLoader2 v-if="isSaving" class="mr-2 h-3.5 w-3.5 animate-spin" />
            <LucideSave v-else class="mr-2 h-3.5 w-3.5" />
            Save Configuration
         </Button>
      </div>
    </div>

    <Tabs v-if="currentShopId" default-value="branding" class="w-full">
      <TabsList class="grid w-full grid-cols-3 md:w-[400px] h-12 p-1 bg-slate-100 rounded-2xl mb-8">
        <TabsTrigger value="branding" class="rounded-xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">Branding</TabsTrigger>
        <TabsTrigger value="location" class="rounded-xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">Location</TabsTrigger>
        <TabsTrigger value="qrcode" class="rounded-xl text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm text-blue-600">QR Engine</TabsTrigger>
      </TabsList>

      <!-- Branding Tab -->
      <TabsContent value="branding" class="animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <Card class="border-slate-100 shadow-xl rounded-[40px] p-8 space-y-6 bg-white overflow-hidden group">
             <div class="text-center space-y-6">
                <Label class="text-[10px] font-black uppercase tracking-widest text-slate-400">Shop Identity (Logo)</Label>
                <div 
                  class="relative w-40 h-40 mx-auto rounded-[40px] bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center cursor-pointer hover:bg-slate-100 transition-all overflow-hidden"
                  @click="logoInput?.click()"
                >
                  <img v-if="form.logo_url" :src="form.logo_url" class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div v-else class="text-slate-300">
                    <LucideImage class="w-10 h-10 mx-auto mb-2" />
                    <span class="text-[9px] font-black uppercase tracking-widest">Select Asset</span>
                  </div>
                </div>
                <input ref="logoInput" type="file" class="hidden" @change="uploadLogo" accept="image/*" />
                <p class="text-[9px] text-slate-400 italic">Square resolution recommended.</p>
             </div>
          </Card>

          <Card class="lg:col-span-2 border-slate-100 shadow-xl rounded-[40px] p-10 bg-white space-y-8">
            <div class="space-y-4">
              <Label for="shop_name" class="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Business Narrative</Label>
              <Input id="shop_name" v-model="form.name" placeholder="E.g. Zenith Gastro" class="rounded-2xl h-14 bg-slate-50 border-transparent focus:bg-white focus:ring-slate-900 text-sm font-bold" />
            </div>
            
            <div class="space-y-4">
              <Label class="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">About the Shop</Label>
              <textarea 
                id="shop_desc"
                v-model="form.description" 
                class="flex min-h-[160px] w-full rounded-[24px] border-transparent bg-slate-50 px-5 py-5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all italic leading-relaxed"
                placeholder="Share your kitchen's story and philosophy..."
              ></textarea>
            </div>
          </Card>
        </div>
      </TabsContent>

      <!-- Location/Contact Tab -->
      <TabsContent value="location" class="animate-in fade-in slide-in-from-bottom-2 duration-500">
        <Card class="border-slate-100 shadow-xl rounded-[40px] p-10 bg-white space-y-10">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div class="space-y-4">
              <Label for="shop_phone" class="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Communication Line</Label>
              <Input id="shop_phone" v-model="form.phone" placeholder="+12 345 6789" class="rounded-2xl h-14 bg-slate-50 border-transparent focus:bg-white focus:ring-slate-900 text-sm font-bold" />
            </div>
            <div class="space-y-4">
              <Label for="shop_hours" class="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Service Hours</Label>
              <Input id="shop_hours" v-model="form.business_hours" placeholder="Mon-Sun: 9 AM - 10 PM" class="rounded-2xl h-14 bg-slate-50 border-transparent focus:bg-white focus:ring-slate-900 text-sm font-bold" />
            </div>
          </div>

          <div class="space-y-4">
            <Label for="shop_address" class="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Physical Location</Label>
            <Input id="shop_address" v-model="form.address" placeholder="123 Gastronomy St, Flavortown" class="rounded-2xl h-14 bg-slate-50 border-transparent focus:bg-white focus:ring-slate-900 text-sm font-bold" />
          </div>
        </Card>
      </TabsContent>

      <!-- QR Engine Tab -->
      <TabsContent value="qrcode" class="animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
          <Card class="border-slate-100 shadow-2xl rounded-[50px] p-12 bg-white flex flex-col items-center justify-center text-center space-y-8 min-h-[500px]">
             <div class="space-y-2">
                <p class="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Live Scannable Target</p>
                <h4 class="text-2xl font-black uppercase italic text-slate-900 tracking-tighter">Table #{{ qrTable || 'General' }}</h4>
             </div>
             
             <div class="relative p-8 bg-white rounded-[40px] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] border border-slate-50 group overflow-hidden">
                <img :src="qrImageUrl" class="w-48 h-48 sm:w-64 sm:h-64 relative z-10" />
                <div class="absolute inset-0 bg-blue-50/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20 backdrop-blur-sm">
                   <Button variant="outline" class="rounded-2xl bg-white shadow-xl h-12" @click="printQR">
                     <LucidePrinter class="w-4 h-4 mr-2" />
                     Print Sticker
                   </Button>
                </div>
             </div>

             <div class="space-y-1">
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Scan to access</p>
                <p class="text-[11px] font-black text-slate-900 font-mono tracking-tighter">{{ publicUrl }}</p>
             </div>
          </Card>

          <div class="space-y-8 flex flex-col justify-center">
             <div class="space-y-4">
                <h3 class="text-3xl font-black uppercase italic text-slate-900 leading-tight tracking-tighter">QR Production Engine</h3>
                <p class="text-slate-500 text-sm font-medium italic">Generate unique scannable points for every table in your facility. Our QR system automatically injects table context into the guest's menu experience.</p>
             </div>
             
             <Separator class="bg-slate-100" />
             
             <div class="space-y-4">
                <Label class="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 px-1">Configure Target Table</Label>
                <div class="flex items-center gap-4">
                   <div class="relative flex-1">
                     <LucideHash class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                     <Input v-model="qrTable" placeholder="Table Number (Optional)" class="rounded-2xl h-14 bg-slate-50 border-transparent pl-12 focus:bg-white focus:ring-slate-900 text-sm font-bold" />
                   </div>
                   <Button variant="outline" @click="qrTable = ''" class="h-14 rounded-2xl px-6 font-black uppercase text-[9px] tracking-widest">Clear</Button>
                </div>
                <p class="text-[10px] text-slate-400 italic font-medium">Changing the table number regenerates the QR code instantly. No need to save.</p>
             </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>

    <!-- Empty State -->
    <div v-if="!currentShopId" class="py-32 text-center bg-white border-2 border-dashed border-slate-100 rounded-[60px]">
       <LucideStore class="w-20 h-20 text-slate-50 mx-auto mb-8" />
       <h3 class="text-2xl font-black text-slate-600 uppercase tracking-tight">Access Locked</h3>
       <p class="text-slate-400 text-sm font-medium italic">Please select a shop location in the sidebar to activate the settings engine.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  Save as LucideSave, Image as LucideImage, Loader2 as LucideLoader2, 
  Store as LucideStore, AlertCircle as LucideAlertCircle, QrCode as LucideQrCode,
  Printer as LucidePrinter, Hash as LucideHash
} from 'lucide-vue-next';
import { Card } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Checkbox } from '~/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui';
import { Separator } from '~/components/ui/separator';

definePageMeta({ layout: 'admin' });

const token = useCookie('token');
const currentShopId = useState<string | null>('currentShopId');
const logoInput = ref<HTMLInputElement | null>(null);
const isSaving = ref(false);
const qrTable = ref('');

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

const publicUrl = computed(() => {
  if (!currentShop.value) return '';
  const base = `${window.location.origin}/${currentShop.value.slug}`;
  return qrTable.value ? `${base}?table=${qrTable.value}` : base;
});

const qrImageUrl = computed(() => {
  return `https://api.qrserver.com/v1/create-qr-code/?size=500x500&data=${encodeURIComponent(publicUrl.value)}&bgcolor=FFFFFF&color=000000&margin=10`;
});

// Sync form with current shop
watch(() => currentShop.value, (newShop) => {
  if (newShop) {
    Object.assign(form, {
      ...newShop,
      is_active: !!newShop.is_active,
      address: newShop.address || '',
      phone: newShop.phone || '',
      logo_url: newShop.logo_url || '',
      description: newShop.description || '',
      business_hours: newShop.business_hours || ''
    });
  }
}, { immediate: true });

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
      body: { ...form },
      headers: { Authorization: `Bearer ${token.value}` }
    });
    alert('Global shop configuration updated!');
    refresh();
  } catch (e) {
    console.error('Save error:', e);
    alert('Failed to save settings. Please ensure the API is reachable.');
  } finally {
    isSaving.value = false;
  }
};

const printQR = () => {
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(`
    <div style="text-align: center; font-family: sans-serif; padding: 40px;">
      <h1 style="text-transform: uppercase; letter-spacing: 2px;">${form.name}</h1>
      <img src="${qrImageUrl.value}" style="width: 400px; margin: 20px auto;" />
      <p style="font-size: 24px; font-weight: bold;">TABLE ${qrTable.value || 'GUEST'}</p>
      <p style="color: #888; font-size: 14px;">Scan to order online</p>
    </div>
  `);
  win.document.close();
  win.print();
};
</script>
