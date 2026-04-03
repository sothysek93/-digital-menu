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
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card class="border border-border shadow-none rounded-lg p-8 bg-background space-y-8">
            <div class="space-y-6">
              <div class="space-y-1">
                 <h3 class="text-lg font-bold tracking-tight text-foreground">Contact & Service</h3>
                 <p class="text-muted-foreground text-[10px] font-medium uppercase tracking-wider">How customers reach this location.</p>
              </div>
              
              <div class="space-y-5">
                <div class="space-y-1.5">
                  <Label class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Contact Line</Label>
                  <div class="relative">
                     <LucidePhone class="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                     <Input v-model="form.phone" placeholder="+12..." class="rounded-lg h-11 border-input bg-background pl-10 text-xs font-bold" />
                  </div>
                </div>

                <div class="space-y-1.5">
                  <Label class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Physical Address</Label>
                  <div class="relative">
                     <LucideMapPin class="absolute left-3 top-3 w-3.5 h-3.5 text-muted-foreground" />
                     <textarea 
                        v-model="form.address" 
                        class="flex min-h-[100px] w-full rounded-lg border border-input bg-background pl-10 pr-3 py-3 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground/40"
                        placeholder="123 Flavor Ave, Food Town"
                     ></textarea>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card class="border border-border shadow-none rounded-lg p-8 bg-background space-y-8">
            <div class="space-y-6">
               <div class="space-y-1">
                  <h3 class="text-lg font-bold tracking-tight text-foreground">Weekly Schedule</h3>
                  <p class="text-muted-foreground text-[10px] font-medium uppercase tracking-wider text-emerald-500 font-bold">Manage availability</p>
               </div>

               <div class="space-y-4">
                  <div v-for="day in days" :key="day" class="flex items-center justify-between gap-4 py-3 border-b border-border last:border-0">
                     <div class="w-20">
                        <span class="text-[10px] font-black uppercase tracking-widest text-foreground">{{ day }}</span>
                     </div>
                     
                     <div class="flex-1 flex items-center gap-2">
                        <template v-if="!schedule[day].closed">
                           <input 
                              type="time" 
                              v-model="schedule[day].open" 
                              class="bg-muted/50 border border-border rounded-md px-2 py-1 text-[10px] font-bold outline-none focus:ring-1 focus:ring-primary w-24" 
                           />
                           <span class="text-muted-foreground text-[10px] font-bold">to</span>
                           <input 
                              type="time" 
                              v-model="schedule[day].close" 
                              class="bg-muted/50 border border-border rounded-md px-2 py-1 text-[10px] font-bold outline-none focus:ring-1 focus:ring-primary w-24" 
                           />
                        </template>
                        <div v-else class="flex-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 italic py-1">
                           Store is Closed
                        </div>
                     </div>

                     <div class="flex items-center gap-2">
                        <Label class="text-[9px] font-bold uppercase text-muted-foreground tracking-tighter">Closed</Label>
                        <Checkbox v-model:checked="schedule[day].closed" class="rounded-sm w-4 h-4" />
                     </div>
                  </div>
               </div>
            </div>
          </Card>
        </div>
      </TabsContent>

      <!-- QR Engine Tab -->
      <TabsContent value="qrcode" class="animate-in fade-in slide-in-from-bottom-1 duration-400">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          <Card class="border border-border shadow-none rounded-lg p-10 bg-background flex flex-col items-center justify-center text-center space-y-6">
             <div class="space-y-1">
                <p class="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Live Asset Preview</p>
                <h4 class="text-xl font-bold text-foreground">{{ qrPrefix }} #{{ qrTable || '01' }}</h4>
             </div>
             
             <div class="p-6 bg-white rounded-xl border border-border shadow-sm group relative">
                <img :src="qrImageUrl" class="w-44 h-44" />
                <a :href="qrImageUrl" download="qr-code.png" target="_blank" class="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-xl backdrop-blur-sm cursor-pointer no-underline">
                   <div class="flex flex-col items-center gap-2">
                      <LucideDownload class="w-6 h-6 text-foreground" />
                      <span class="text-[10px] font-bold uppercase text-foreground">Save Image</span>
                   </div>
                </a>
             </div>

             <div class="flex flex-col items-center gap-4 w-full max-w-xs">
                <div class="text-center w-full">
                   <p class="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-2">Direct Access Link</p>
                  <div class="bg-muted px-4 py-2 rounded-lg border border-border overflow-hidden">
                    <p class="text-[10px] font-mono font-bold text-foreground opacity-60 truncate">{{ publicUrl }}</p>
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-2 w-full">
                  <Button variant="outline" class="rounded-lg h-10 text-[9px] font-bold uppercase tracking-widest border-border flex-1" @click="downloadCurrentQR">
                    <LucideDownload class="w-3.5 h-3.5 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" class="rounded-lg h-10 text-[9px] font-bold uppercase tracking-widest border-border flex-1" @click="printQR">
                    <LucidePrinter class="w-3.5 h-3.5 mr-2" />
                    Single Print
                  </Button>
                </div>
             </div>
          </Card>

          <div class="space-y-6 flex flex-col justify-center bg-muted/20 rounded-lg p-8 border border-border sm:border-dashed">
             <div class="space-y-2">
                <div class="flex items-center gap-2">
                   <div class="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center text-background">
                      <LucideQrCode class="w-4 h-4" />
                   </div>
                   <h3 class="text-2xl font-bold tracking-tight text-foreground">Series Factory</h3>
                </div>
                <p class="text-muted-foreground text-xs font-medium leading-relaxed">Produce high-resolution codes in bulk. Define your zone (VIP, Table, Bar) and generating entire sequences instantly.</p>
             </div>
             
             <Separator class="bg-border" />
             
             <div class="space-y-5">
                <div class="grid grid-cols-2 gap-4">
                   <div class="space-y-1.5">
                      <Label class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Zone Prefix</Label>
                      <Input v-model="qrPrefix" placeholder="VIP, Table, Bar" class="rounded-lg h-11 border-input bg-background text-xs font-bold" />
                   </div>
                   <div class="space-y-1.5">
                      <Label class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Active Table</Label>
                      <Input v-model="qrTable" placeholder="01" class="rounded-lg h-11 border-input bg-background text-xs font-bold" />
                   </div>
                </div>

                <div class="p-4 bg-background border border-border rounded-lg space-y-4">
                   <div class="flex items-center justify-between">
                      <Label class="text-[10px] font-bold uppercase tracking-widest text-foreground px-1">Generate Mastersheet</Label>
                      <span class="text-[8px] font-bold text-emerald-500 uppercase tracking-widest">Bulk Action</span>
                   </div>
                   <div class="grid grid-cols-2 gap-4">
                      <div class="space-y-1">
                        <Label class="text-[8px] font-black uppercase text-muted-foreground ml-1">Range Start</Label>
                        <Input v-model.number="qrStart" type="number" class="h-9 rounded-md bg-muted/30 border-border text-[10px] font-bold" />
                      </div>
                      <div class="space-y-1">
                        <Label class="text-[8px] font-black uppercase text-muted-foreground ml-1">Range End</Label>
                        <Input v-model.number="qrEnd" type="number" class="h-9 rounded-md bg-muted/30 border-border text-[10px] font-bold" />
                      </div>
                   </div>
                   <div class="flex gap-2">
                      <Button class="flex-1 h-11 bg-foreground text-background font-bold uppercase text-[10px] tracking-widest rounded-lg" @click="printBatchQR">
                         <LucideLayers class="w-4 h-4 mr-2" />
                         Produce All ({{ qrEnd - qrStart + 1 }}+)
                      </Button>
                      <Button variant="outline" class="h-11 px-6 border-border text-foreground font-bold uppercase text-[10px] tracking-widest rounded-lg" @click="downloadBatchQR" :disabled="isZipping">
                         <LucideLoader2 v-if="isZipping" class="w-4 h-4 animate-spin" />
                         <LucideDownload v-else class="w-4 h-4" />
                      </Button>
                   </div>
                </div>
             </div>
             <p class="text-[9px] text-muted-foreground font-medium italic text-center opacity-60">Automatically routes guests to correct zone via direct deep-links.</p>
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
  Printer as LucidePrinter, Hash as LucideHash, Phone as LucidePhone,
  MapPin as LucideMapPin, Layers as LucideLayers, Download as LucideDownload
} from 'lucide-vue-next';
import QRCode from 'qrcode';
import JSZip from 'jszip';
import { Card } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '~/components/ui';
import { Separator } from '~/components/ui/separator';
import { Checkbox } from '~/components/ui/checkbox';
import { toast } from 'vue-sonner';

definePageMeta({ layout: 'admin' });

const token = useCookie('token');
const currentShopId = useState<string | null>('currentShopId');
const logoInput = ref<HTMLInputElement | null>(null);
const isSaving = ref(false);
const qrTable = ref('01');
const qrPrefix = ref('Table');
const qrStart = ref(1);
const qrEnd = ref(10);

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const schedule = reactive<Record<string, any>>({
  Monday: { open: '09:00', close: '22:00', closed: false },
  Tuesday: { open: '09:00', close: '22:00', closed: false },
  Wednesday: { open: '09:00', close: '22:00', closed: false },
  Thursday: { open: '09:00', close: '22:00', closed: false },
  Friday: { open: '09:00', close: '22:00', closed: false },
  Saturday: { open: '10:00', close: '23:00', closed: false },
  Sunday: { open: '09:00', close: '22:00', closed: false },
});

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

const { data: shopsResult, pending, refresh } = await useFetch<any>('/api/admin/shops', {
  headers: { Authorization: `Bearer ${token.value}` }
});

const currentShop = computed(() => (shopsResult.value?.items as Shop[])?.find(s => s.id === currentShopId.value));

const publicUrl = computed(() => {
  if (!currentShop.value || typeof window === 'undefined') return '';
  const label = `${qrPrefix.value} ${qrTable.value}`.trim();
  return `${window.location.origin}/${currentShop.value.slug}?table=${encodeURIComponent(label)}`;
});

const qrImageUrl = ref('');

watchEffect(async () => {
  if (!publicUrl.value) {
    qrImageUrl.value = '';
    return;
  }
  try {
    qrImageUrl.value = await QRCode.toDataURL(publicUrl.value, { 
      width: 600, 
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' }
    });
  } catch (e) {
    console.error('QR generation failed:', e);
  }
});

// Sync form and schedule with current shop
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

    // Try to parse schedule JSON
    if (newShop.business_hours) {
       try {
          const parsed = JSON.parse(newShop.business_hours);
          Object.assign(schedule, parsed);
       } catch (e) {
          // Keep defaults if not JSON
       }
    }
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
  
  // Pack schedule into form
  form.business_hours = JSON.stringify(schedule);

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

const downloadCurrentQR = async () => {
    try {
        const dataUrl = await QRCode.toDataURL(publicUrl.value, { width: 500, margin: 2 });
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = `qr-${qrPrefix.value}-${qrTable.value}.png`.toLowerCase().replace(/\s+/g, '-');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (err) {
        toast.error('Asset Export Failed');
    }
};

const printQR = async () => {
  const dataUrl = await QRCode.toDataURL(publicUrl.value, { width: 500, margin: 2 });
  const win = window.open('', '_blank');
  if (!win) return;
  const label = `${qrPrefix.value} #${qrTable.value}`;
  win.document.write(`
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&display=swap');
      body { font-family: 'Outfit', sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; }
    </style>
    <div style="text-align: center; padding: 60px; border: 8px solid #000; border-radius: 60px; display: inline-block;">
      <h1 style="text-transform: uppercase; letter-spacing: 4px; font-size: 48px; font-weight: 900; margin: 0 0 10px 0;">${form.name}</h1>
      <p style="color: #666; font-size: 18px; margin: 0; font-weight: 700; letter-spacing: 3px; opacity: 0.5;">DIGITAL MENU</p>
      <div style="margin: 40px auto; padding: 20px; background: #fff; border-radius: 30px; box-shadow: 0 20px 50px rgba(0,0,0,0.1);">
         <img src="${dataUrl}" style="width: 350px; display: block;" />
      </div>
      <div style="background: #000; color: #fff; padding: 15px 50px; border-radius: 25px; display: inline-block; font-size: 42px; font-weight: 900; margin-top: 20px; letter-spacing: -1px;">
        ${label}
      </div>
      <p style="color: #000; font-size: 16px; margin-top: 30px; font-weight: 700; opacity: 0.8;">SCAN TO BROWSE & ORDER</p>
    </div>
    <script>window.onload = () => { window.print(); window.onafterprint = () => window.close(); };<\/script>
  `);
  win.document.close();
};
const isZipping = ref(false);

const downloadBatchQR = async () => {
    if (!currentShop.value) return;
    isZipping.value = true;
    const zip = new JSZip();
    try {
        for (let i = qrStart.value; i <= qrEnd.value; i++) {
            const num = String(i).padStart(2, '0');
            const label = `${qrPrefix.value} ${num}`.trim();
            const url = `${window.location.origin}/${currentShop.value.slug}?table=${encodeURIComponent(label)}`;
            const dataUrl = await QRCode.toDataURL(url, { width: 1000, margin: 2 });
            const base64Data = dataUrl.split(',')[1];
            if (base64Data) {
                zip.file(`${qrPrefix.value}-${num}.png`.toLowerCase().replace(/\s+/g, '-'), base64Data, {base64: true});
            }
        }
        const blob = await zip.generateAsync({type: "blob"});
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${form.slug}-qr-codes.zip`;
        link.click();
        toast.success('Batch Exported', { description: `${qrEnd.value - qrStart.value + 1} codes ready in your downloads.` });
    } catch (e) {
        toast.error('Export Failed');
    } finally {
        isZipping.value = false;
    }
};

const printBatchQR = async () => {
  if (!currentShop.value) return;
  const win = window.open('', '_blank');
  if (!win) return;
  let qrBlocks = '';
  for (let i = qrStart.value; i <= qrEnd.value; i++) {
    const num = String(i).padStart(2, '0');
    const label = `${qrPrefix.value} ${num}`.trim();
    const deepLink = `${window.location.origin}/${currentShop.value.slug}?table=${encodeURIComponent(label)}`;
    const dataUrl = await QRCode.toDataURL(deepLink, { width: 500, margin: 2 });
    qrBlocks += `<div style="border: 4px solid #000; border-radius: 40px; padding: 40px; text-align: center; break-inside: avoid; margin-bottom: 30px; display: inline-block; background: white;">
      <h2 style="text-transform: uppercase; letter-spacing: 2px; font-size: 32px; font-weight: 900; margin: 0 0 10px 0;">${form.name}</h2>
      <img src="${dataUrl}" style="width: 250px; margin: 20px 0;" />
      <div style="background: #000; color: #fff; padding: 10px 30px; border-radius: 20px; font-size: 32px; font-weight: 900;">${qrPrefix.value} #${num}</div>
    </div>`;
  }
  win.document.write(`
    <style>@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;900&display=swap');
    body { font-family: 'Outfit', sans-serif; padding: 20px; background: white; text-align: center; }
    .grid { display: grid; grid-template-cols: repeat(2, 1fr); gap: 20px; }</style>
    <div class="grid">${qrBlocks}</div>
    <script>window.onload = () => { window.print(); window.onafterprint = () => window.close(); };<\/script>
  `);
  win.document.close();
};
</script>
