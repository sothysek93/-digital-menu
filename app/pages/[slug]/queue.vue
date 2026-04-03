<script setup lang="ts">
import { 
  Users as LucideUsers, Clock as LucideClock, 
  ChevronLeft as LucideChevronLeft, CheckCircle2 as LucideCheckCircle2,
  Loader2 as LucideLoader2, ChefHat as LucideChefHat,
  Phone as LucidePhone, User as LucideUser, Search as LucideSearch,
  RefreshCw as LucideRefreshCw, Ticket as LucideTicket, History as LucideHistory,
  AlertTriangle as LucideAlertTriangle
} from 'lucide-vue-next';
import { useLocalStorage } from '@vueuse/core';
import { toast } from 'vue-sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { Badge } from '~/components/ui/badge';

const route = useRoute();
const slug = route.params.slug as string;

const { data } = await useFetch<any>(`/api/public/menu?slug=${slug}` as any, {
  key: `menu-live-${slug}`
});

const restaurantId = computed(() => data.value?.restaurant?.id || data.value?.shop?.id);

const guestName = useLocalStorage(`queue_name_${slug}`, '');
const partySize = useLocalStorage(`queue_party_${slug}`, 2);
const phone = useLocalStorage(`queue_phone_${slug}`, '');
const activeTicket = useLocalStorage<{ id: string; number: string } | null>(`queue_ticket_${slug}`, null);
const lastSeatedAt = useLocalStorage<number | null>(`queue_last_seated_${slug}`, null);

const queueStatus = ref<any>(null);
const isJoining = ref(false);
const isLoading = ref(true);
const isSearching = ref(false);
const showSearch = ref(false);
const COOLDOWN_MS = 60 * 60 * 1000; // 1 hour
const isCooldownActive = computed(() => {
  if (!lastSeatedAt.value || activeTicket.value) return false;
  return (Date.now() - lastSeatedAt.value) < COOLDOWN_MS;
});

const remainingCooldownMinutes = computed(() => {
  if (!lastSeatedAt.value) return 0;
  const diff = COOLDOWN_MS - (Date.now() - lastSeatedAt.value);
  return Math.max(0, Math.ceil(diff / 60000));
});

const fetchStatus = async (lookupPhone?: string) => {
  if (!restaurantId.value) return;
  if (!activeTicket.value?.id && !lookupPhone) {
    isLoading.value = false;
    return;
  }
  
  try {
    const params: any = { restaurantId: restaurantId.value };
    if (activeTicket.value?.id) params.queueId = activeTicket.value.id;
    if (lookupPhone) params.phone = lookupPhone;

    const res = await $fetch<any>(`/api/public/queue/status`, { params });
    
    if (res && res.status && res.status !== 'none') {
      queueStatus.value = res;
      // If they were just seated, record the time
      if (res.status === 'seated' && !lastSeatedAt.value) {
        lastSeatedAt.value = Date.now();
      }
      // Sync local storage if we recovered via phone
      if (!activeTicket.value || activeTicket.value.id !== res.id) {
          activeTicket.value = { id: res.id, number: res.ticketNumber };
          guestName.value = res.name;
          partySize.value = res.partySize;
      }
    } else if (activeTicket.value) {
      // If we had a ticket but it's gone from server, clear it
      activeTicket.value = null;
      queueStatus.value = null;
    }
  } catch (e) {
    console.error('Status sync error:', e);
  } finally {
    isLoading.value = false;
  }
};

const recoverTicket = async () => {
  if (!phone.value || !restaurantId.value) return;
  isSearching.value = true;
  await fetchStatus(phone.value);
  if (activeTicket.value) {
    toast.success('Ticket recovered!');
    showSearch.value = false;
  } else {
    toast.error('No active ticket found for this phone number');
  }
  isSearching.value = false;
};

const leaveQueue = async () => {
  if (!activeTicket.value?.id || !restaurantId.value) {
    activeTicket.value = null;
    queueStatus.value = null;
    return;
  }
  
  try {
    await $fetch('/api/public/queue/cancel', {
      method: 'POST',
      body: {
        queueId: activeTicket.value.id,
        restaurantId: restaurantId.value
      }
    });
    toast.success('You have left the waitlist.');
  } catch (e) {
    console.error('Logout error:', e);
  } finally {
    activeTicket.value = null;
    queueStatus.value = null;
  }
};

const joinQueue = async () => {
  if (!guestName.value || !partySize.value || !phone.value || !restaurantId.value) {
    toast.error('All fields are required');
    return;
  }

  isJoining.value = true;
  try {
    const res = await $fetch<any>('/api/public/queue/join', {
      method: 'POST',
      body: {
        restaurantId: restaurantId.value,
        name: guestName.value,
        partySize: partySize.value,
        phone: phone.value
      }
    });
    
    activeTicket.value = { id: res.id, number: res.ticketNumber };
    queueStatus.value = res;
    toast.success(res.isExisting ? 'Welcome back! Found your ticket.' : 'Joined waitlist successfully!');
  } catch (e: any) {
    toast.error(e.statusMessage || 'Failed to join');
  } finally {
    isJoining.value = false;
  }
};

onMounted(async () => {
  isLoading.value = true;
  // Delay slightly to ensure restaurantId is computed
  setTimeout(async () => {
    if (activeTicket.value?.id) {
        await fetchStatus();
    } else if (phone.value) {
        await fetchStatus(phone.value);
    }
    isLoading.value = false;
  }, 500);

  if (process.client) {
    const interval = setInterval(fetchStatus, 15000);
    onUnmounted(() => clearInterval(interval));
  }
});
</script>

<template>
  <div class="min-h-screen bg-background flex flex-col font-sans text-foreground">
    <header class="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border px-4 py-2 flex items-center justify-between">
      <NuxtLink :to="`/${slug}`" class="flex items-center gap-2.5">
        <div v-if="data?.shop?.logo_url" class="w-8 h-8 rounded-lg overflow-hidden border border-border">
           <img :src="data.shop.logo_url" class="w-full h-full object-cover" />
        </div>
        <div v-else class="w-8 h-8 rounded-lg bg-muted flex items-center justify-center border border-border">
           <LucideChefHat class="w-4 h-4 text-muted-foreground" />
        </div>
        <div>
          <h1 class="text-xs font-bold tracking-tight text-foreground uppercase truncate max-w-[120px]">
             {{ data?.shop?.name || 'Waitlist' }}
          </h1>
          <p class="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5 opacity-50">Waitlist Station</p>
        </div>
      </NuxtLink>
      
      <Button as-child variant="ghost" size="sm" class="h-8 rounded-lg text-[10px] font-bold uppercase gap-2">
        <NuxtLink :to="`/${slug}`">
          <LucideChevronLeft class="w-3.5 h-3.5" />
          Menu
        </NuxtLink>
      </Button>
    </header>

    <main class="flex-1 max-w-sm mx-auto px-4 py-12 w-full space-y-8 animate-in fade-in duration-500">
      
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-20">
        <div class="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
        <p class="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Identifying your ticket...</p>
      </div>

      <div v-else-if="activeTicket" class="space-y-6">
        <Card class="border border-border shadow-none rounded-3xl overflow-hidden">
          <div class="bg-muted/30 border-b border-border/50 py-3.5 px-6 flex items-center justify-between">
             <span class="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">My Position</span>
             <Badge variant="secondary" class="text-[8px] font-bold uppercase rounded-md h-5">Live Update</Badge>
          </div>
          
          <CardHeader class="text-center py-8">
            <CardDescription class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 mb-1">Queue Number</CardDescription>
            <CardTitle class="text-6xl font-bold tracking-tighter text-foreground">#{{ activeTicket.number }}</CardTitle>
          </CardHeader>
          
          <CardContent class="text-center pb-10 pt-2 px-8">
            <div v-if="queueStatus" class="space-y-8">
              <div v-if="queueStatus.status === 'called'" class="animate-in zoom-in duration-500">
                <div class="bg-foreground text-background rounded-2xl p-6 shadow-2xl shadow-black/10">
                    <p class="text-xs font-bold uppercase tracking-widest mb-2">Ready for Seating</p>
                    <p class="text-[11px] font-medium opacity-80 leading-relaxed">Your table is prepared. Please proceed to the stand now.</p>
                </div>
              </div>
              
              <div v-else-if="queueStatus.status === 'waiting'" class="space-y-3">
                <div class="text-5xl font-bold tracking-tighter text-primary">{{ queueStatus.position || '0' }}</div>
                <div class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center justify-center gap-2 opacity-60">
                   Groups still ahead
                </div>
              </div>

              <div v-else-if="queueStatus.status === 'seated'">
                <div class="py-4 space-y-4">
                    <div class="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                        <LucideCheckCircle2 class="w-6 h-6" />
                    </div>
                    <p class="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Checked In Successfully</p>
                    <Button 
                      @click="() => { 
                        lastSeatedAt = Date.now();
                        activeTicket = null;
                        queueStatus = null;
                      }" 
                      variant="outline" 
                      size="sm" 
                      class="text-[10px] uppercase font-bold rounded-xl"
                    >
                      Finish Visit
                    </Button>
                </div>
              </div>

              <div v-else-if="queueStatus.status === 'cancelled'" class="animate-in fade-in duration-500 py-6 space-y-5">
                <div class="w-14 h-14 bg-destructive/5 text-destructive rounded-full flex items-center justify-center mx-auto border border-destructive/10">
                    <LucideAlertTriangle class="w-6 h-6" />
                </div>
                <div class="space-y-1">
                   <p class="text-xs font-bold uppercase tracking-widest text-destructive">Entry Cancelled</p>
                   <p class="text-[10px] text-muted-foreground font-medium px-8 leading-relaxed italic opacity-80">
                     Your spot has been removed by the restaurant. Please contact the host for assistance.
                   </p>
                </div>
                <Button @click="activeTicket = null" variant="ghost" size="sm" class="text-[9px] uppercase font-bold text-muted-foreground hover:text-foreground">
                   Clear Ticket
                </Button>
              </div>
            </div>
            <div v-else class="py-12 flex flex-col items-center gap-4">
               <LucideLoader2 class="w-6 h-6 animate-spin text-muted-foreground/20" />
               <p class="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/40">Syncing Waitlist...</p>
            </div>
          </CardContent>

          <CardFooter class="border-t bg-muted/5 py-4 flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">
             <div class="flex items-center gap-2 font-black truncate max-w-[150px]"><LucideUser class="w-3 h-3"/> {{ guestName }}</div>
             <div class="flex items-center gap-2"><LucideUsers class="w-3 h-3"/> Party: {{ partySize }}</div>
          </CardFooter>
        </Card>

        <div class="flex flex-col items-center gap-8">
            <p class="text-center text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] px-12 leading-relaxed opacity-40">
               We'll notify you automatically when your table is prepared.
            </p>
            <div class="flex items-center gap-4 w-full">
                <Button @click="fetchStatus()" variant="outline" size="sm" class="h-10 px-6 rounded-full text-[10px] font-bold border-border bg-background flex-1">
                    <LucideRefreshCw class="w-3.5 h-3.5 mr-2 text-primary" /> Sync Status
                </Button>
                <Button @click="leaveQueue" variant="ghost" size="sm" class="h-10 px-6 text-[10px] font-bold text-destructive hover:bg-destructive/5 rounded-full flex-1">
                    Leave Queue
                </Button>
            </div>
        </div>
      </div>

      <div v-else-if="isCooldownActive" class="space-y-10 animate-in zoom-in duration-500 py-12">
        <div class="text-center space-y-6">
          <div class="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-2 opacity-30">
            <LucideHistory class="w-8 h-8" />
          </div>
          <div class="space-y-2">
            <h2 class="text-2xl font-bold tracking-tight">Thanks for visiting!</h2>
            <p class="text-[11px] text-muted-foreground font-medium px-4 leading-relaxed">
              You were recently seated. To keep our waitlist moving fairly, there is a short cooldown before you can join again.
            </p>
          </div>
          
          <div class="bg-muted/30 rounded-2xl p-6 border border-border/50 inline-block mx-auto min-w-[200px]">
            <p class="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Available in approx.</p>
            <p class="text-3xl font-bold tracking-tighter text-foreground">{{ remainingCooldownMinutes }} min</p>
          </div>

          <div class="pt-4">
             <Button @click="lastSeatedAt = null" variant="ghost" class="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/30 hover:text-foreground">
                (Staff Override)
             </Button>
          </div>
        </div>
      </div>

      <div v-else class="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
        <div class="text-center space-y-2">
          <h2 class="text-4xl font-bold tracking-tighter">Waitlist</h2>
          <p class="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.3em] opacity-40">Secure your position today</p>
        </div>

        <Card class="border-none shadow-none bg-transparent">
          <CardContent class="space-y-6 pt-6">
            <div v-if="!showSearch" class="space-y-6">
                <div class="space-y-2">
                <Label class="text-[10px] font-bold uppercase tracking-widest ml-1 text-muted-foreground">Registered Phone</Label>
                <Input v-model="phone" type="tel" placeholder="For notifications" class="h-12 text-sm px-4 bg-muted/30 border-none font-semibold rounded-xl" />
                </div>

                <div class="space-y-2">
                <Label class="text-[10px] font-bold uppercase tracking-widest ml-1 text-muted-foreground">Your Name</Label>
                <Input v-model="guestName" placeholder="For the host" class="h-12 text-sm px-4 bg-muted/30 border-none font-semibold rounded-xl" />
                </div>

                <div class="space-y-3">
                <Label class="text-[10px] font-bold uppercase tracking-widest ml-1 text-muted-foreground">Party Size</Label>
                <div class="grid grid-cols-5 gap-2">
                    <Button v-for="i in 4" :key="i"
                      variant="outline" size="sm" class="h-11 font-bold text-xs border-none rounded-xl transition-all"
                      :class="[partySize === i ? 'bg-foreground text-background shadow-lg shadow-black/10' : 'bg-muted/30 text-muted-foreground']"
                      @click="partySize = i"
                    >
                    {{ i }}
                    </Button>
                    <Button variant="outline" size="sm" class="h-11 font-bold text-xs border-none rounded-xl transition-all"
                      :class="[partySize >= 5 ? 'bg-foreground text-background shadow-lg shadow-black/10' : 'bg-muted/30 text-muted-foreground']"
                      @click="partySize = 5"
                    >
                    5+
                    </Button>
                </div>
                </div>

                <Button @click="joinQueue" :disabled="!guestName || !phone || isJoining" size="lg" class="w-full h-12 font-bold uppercase tracking-widest text-[10px] bg-foreground text-background hover:opacity-90 rounded-xl mt-4 shadow-xl shadow-black/5">
                <LucideLoader2 v-if="isJoining" class="w-3.5 h-3.5 mr-2 animate-spin" />
                Join Waitlist
                </Button>

                <div class="text-center pt-2">
                    <button @click="showSearch = true" class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 hover:text-foreground transition-all">
                       Already joined? Recover ticket
                    </button>
                </div>
            </div>

            <div v-else class="space-y-6 animate-in slide-in-from-right-4 duration-300">
                <div class="space-y-2">
                    <Label class="text-[10px] font-black uppercase tracking-widest ml-2 text-muted-foreground">Registered Phone Number</Label>
                    <div class="relative">
                        <LucidePhone class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/30" />
                        <Input v-model="phone" type="tel" placeholder="Enter number" class="h-14 text-sm pl-12 bg-muted/30 border-none font-bold rounded-xl" />
                    </div>
                </div>
                
                <div class="flex flex-col gap-3">
                    <Button @click="recoverTicket" :disabled="!phone || isSearching" size="lg" class="w-full h-14 font-black uppercase tracking-widest text-[11px] bg-primary text-white rounded-xl shadow-lg shadow-primary/10">
                        <LucideLoader2 v-if="isSearching" class="w-4 h-4 mr-2 animate-spin" />
                        <LucideSearch v-else class="w-4 h-4 mr-2" />
                        Find Active Ticket
                    </Button>
                    <Button @click="showSearch = false" variant="ghost" class="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 h-12 rounded-xl">
                         Back
                    </Button>
                </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>

    <footer class="py-12 border-t border-border text-center space-y-4 bg-muted/5 mt-auto">
      <div v-if="data?.restaurant?.logo_url" class="w-8 h-8 rounded-lg overflow-hidden opacity-10 mx-auto grayscale">
         <img :src="data.restaurant.logo_url" class="w-full h-full object-cover" />
      </div>
      <div class="space-y-1 opacity-20">
        <p class="text-[8px] font-bold text-muted-foreground uppercase tracking-[0.4em]">Powered by</p>
        <p class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">{{ data?.restaurant?.name || 'Digital Menu' }}</p>
      </div>
    </footer>
  </div>
</template>
