<template>
  <div class="space-y-8 animate-in fade-in duration-500 pb-20">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
      <div class="space-y-1">
        <h2 class="text-3xl font-bold tracking-tight text-foreground leading-none">Shop Settings</h2>
        <p class="text-muted-foreground text-sm font-medium">Refine your identity and operational parameters.</p>
      </div>
      
      <div class="flex items-center gap-3">
         <div v-if="!currentShopId" class="px-4 py-2 bg-destructive/5 rounded-lg border border-destructive/10 flex items-center gap-2 text-destructive text-[10px] font-bold uppercase tracking-wider">
            <LucideAlertCircle class="w-3.5 h-3.5" />
            Select a store location
         </div>
         <Button 
           v-if="currentShopId" 
           @click="saveSettings" 
           :disabled="isSaving" 
           class="h-10 px-6 rounded-lg bg-foreground text-background font-bold text-xs uppercase tracking-widest"
         >
            <LucideLoader2 v-if="isSaving" class="mr-2 h-3.5 w-3.5 animate-spin" />
            <LucideSave v-else class="mr-2 h-3.5 w-3.5" />
            Save Configuration
         </Button>
      </div>
    </div>

    <Tabs v-if="currentShopId" default-value="branding" class="w-full">
      <TabsList class="grid w-full grid-cols-3 md:w-[400px] h-10 p-1 bg-muted rounded-lg mb-8">
        <TabsTrigger value="branding" class="rounded-md text-[10px] font-bold uppercase tracking-wider data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all">Identity</TabsTrigger>
        <TabsTrigger value="location" class="rounded-md text-[10px] font-bold uppercase tracking-wider data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all">Service</TabsTrigger>
        <TabsTrigger value="qrcode" class="rounded-md text-[10px] font-bold uppercase tracking-wider data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all">QR Hub</TabsTrigger>
      </TabsList>

      <!-- Branding Tab -->
      <TabsContent value="branding" class="animate-in fade-in slide-in-from-bottom-1 duration-400">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card class="border border-border shadow-none rounded-lg p-6 bg-background">
             <div class="text-center space-y-4">
                <Label class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block text-left px-1">Brand Visual (Logo)</Label>
                <div 
                  class="relative w-32 h-32 mx-auto rounded-lg bg-muted border border-dashed border-border flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-all overflow-hidden"
                  @click="logoInput?.click()"
                >
                  <img v-if="form.logo_url" :src="form.logo_url" class="absolute inset-0 w-full h-full object-cover" />
                  <div v-else class="text-muted-foreground/30 flex flex-col items-center">
                    <LucideImage class="w-6 h-6 mb-2" />
                    <span class="text-[9px] font-bold uppercase">Upload</span>
                  </div>
                </div>
                <input ref="logoInput" type="file" class="hidden" @change="uploadLogo" accept="image/*" />
                <p class="text-[9px] text-muted-foreground font-medium">Standard square ratio is best.</p>
             </div>
          </Card>

          <Card class="lg:col-span-2 border border-border shadow-none rounded-lg p-8 bg-background space-y-6">
            <div class="space-y-1.5">
              <Label class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Public Shop Name</Label>
              <Input v-model="form.name" placeholder="Vibrant Bistro" class="rounded-lg h-10 border-input bg-background text-xs font-bold" />
            </div>
            
            <div class="space-y-1.5">
              <Label class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Brand Narrative (Description)</Label>
              <textarea 
                v-model="form.description" 
                class="flex min-h-[140px] w-full rounded-lg border border-input bg-background px-4 py-3 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary focus:bg-background transition-colors leading-relaxed placeholder:text-muted-foreground/40"
                placeholder="Share your kitchen philosophy..."
              ></textarea>
            </div>
          </Card>
        </div>
      </TabsContent>

      <!-- Location/Contact Tab -->
      <TabsContent value="location" class="animate-in fade-in slide-in-from-bottom-1 duration-400">
        <Card class="border border-border shadow-none rounded-lg p-8 bg-background space-y-8">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="space-y-1.5">
              <Label class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Contact Line</Label>
              <Input v-model="form.phone" placeholder="+12..." class="rounded-lg h-10 border-input bg-background text-xs font-bold" />
            </div>
            <div class="space-y-1.5">
              <Label class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Open Hours</Label>
              <Input v-model="form.business_hours" placeholder="Sun-Fri: 11 AM - 10 PM" class="rounded-lg h-10 border-input bg-background text-xs font-bold" />
            </div>
          </div>

          <div class="space-y-1.5">
            <Label class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Physical Address</Label>
            <Input v-model="form.address" placeholder="123 Flavor Ave, Food Town" class="rounded-lg h-10 border-input bg-background text-xs font-bold" />
          </div>
        </Card>
      </TabsContent>

      <!-- QR Engine Tab -->
      <TabsContent value="qrcode" class="animate-in fade-in slide-in-from-bottom-1 duration-400">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          <Card class="border border-border shadow-none rounded-lg p-10 bg-background flex flex-col items-center justify-center text-center space-y-6">
             <div class="space-y-1">
                <p class="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Scannable Point</p>
                <h4 class="text-xl font-bold text-foreground">Table #{{ qrTable || 'Generic' }}</h4>
             </div>
             
             <div class="p-6 bg-white rounded-xl border border-border shadow-sm">
                <img :src="qrImageUrl" class="w-40 h-40" />
             </div>

             <div class="flex flex-col items-center gap-4">
                <div class="text-center">
                   <p class="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">Direct Link</p>
                   <p class="text-[10px] font-mono font-bold text-foreground opacity-60">{{ publicUrl }}</p>
                </div>
                <Button variant="outline" class="rounded-lg h-9 text-[10px] font-bold uppercase tracking-widest border-border" @click="printQR">
                   <LucidePrinter class="w-3.5 h-3.5 mr-2" />
                   Print Sticker
                </Button>
             </div>
          </Card>

          <div class="space-y-6 flex flex-col justify-center bg-muted/20 rounded-lg p-8 border border-border sm:border-dashed">
             <div class="space-y-2">
                <h3 class="text-2xl font-bold tracking-tight text-foreground">QR Generator</h3>
                <p class="text-muted-foreground text-xs font-medium leading-relaxed">Instantly produce high-resolution codes for individual tables. The system automatically routes guests to the correct context.</p>
             </div>
             
             <Separator class="bg-border" />
             
             <div class="space-y-2">
                <Label class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Define Table Number</Label>
                <div class="flex items-center gap-2">
                   <div class="relative flex-1">
                     <LucideHash class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                     <Input v-model="qrTable" placeholder="01, 02, etc." class="rounded-lg h-10 border-input bg-background pl-9 text-xs font-bold" />
                   </div>
                   <Button variant="outline" @click="qrTable = ''" class="h-10 rounded-lg px-4 text-[10px] font-bold uppercase border-border">Reset</Button>
                </div>
                <p class="text-[9px] text-muted-foreground font-medium italic">Regenerates automatically on input. No save needed.</p>
             </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>

    <!-- Empty State -->
    <div v-if="!currentShopId" class="py-32 text-center bg-muted/5 border border-dashed border-border rounded-lg">
       <div class="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
          <LucideStore class="w-5 h-5 text-muted-foreground/30" />
       </div>
       <h3 class="text-sm font-bold text-muted-foreground uppercase tracking-tight">Configuration Locked</h3>
       <p class="text-muted-foreground text-xs font-medium max-w-[200px] mx-auto mt-1 leading-relaxed">Select a store from the sidebar to modify your branding.</p>
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui';
import { Separator } from '~/components/ui/separator';
import { toast } from 'vue-sonner';

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

  const uploadToastId = toast.loading('Exporting Asset', {
    description: 'Compressing and uploading logo...'
  });

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
    toast.success('Asset Ready', { id: uploadToastId, description: 'Brand asset successfully linked.' });
  } catch (e: any) {
    toast.error('Asset Failure', { 
      id: uploadToastId,
      description: e.data?.message || 'We could not process this image.' 
    });
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
    toast.success('Configuration Persistent', {
      description: 'Your shop settings are now live across the network.'
    });
    refresh();
  } catch (e: any) {
    toast.error('Configuration Error', {
      description: e.data?.message || 'We could not synchronize your changes.'
    });
  } finally {
    isSaving.value = false;
  }
};

const printQR = () => {
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(`
    <div style="text-align: center; font-family: sans-serif; padding: 40px; border: 4px solid #000; border-radius: 40px; display: inline-block;">
      <h1 style="text-transform: uppercase; letter-spacing: 2px; font-weight: 900; margin-bottom: 0;">${form.name}</h1>
      <p style="color: #666; font-size: 14px; margin-top: 5px; font-weight: bold; letter-spacing: 1px;">DIGITAL MENU</p>
      <img src="${qrImageUrl.value}" style="width: 400px; margin: 20px auto; display: block;" />
      <div style="background: #000; color: #fff; padding: 10px 40px; border-radius: 20px; display: inline-block; font-size: 32px; font-weight: 900; margin-top: 20px;">
        TABLE ${qrTable.value || 'GUEST'}
      </div>
      <p style="color: #888; font-size: 14px; margin-top: 20px; font-style: italic;">Scan to open menu and order from your table</p>
    </div>
  `);
  win.document.close();
  win.print();
};
</script>
