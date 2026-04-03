<script setup lang="ts">
import {
  Users as LucideUsers,
  Clock as LucideClock,
  CheckCircle2 as LucideCheckCircle2,
  XCircle as LucideXCircle,
  MoreVertical as LucideMoreVertical,
  Utensils as LucideUtensils,
  Bell as LucideBell,
  History as LucideHistory,
  Loader2 as LucideLoader2,
  Phone as LucidePhone,
  User as LucideUser,
  RefreshCw as LucideRefreshCw,
} from "lucide-vue-next";
import { toast } from "vue-sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Card } from "~/components/ui/card";

definePageMeta({ layout: "admin" });
const token = useCookie("token");
const currentShopId = useState<string | null>("currentShopId");
const activeEntries = ref<any[]>([]);
const historyEntries = ref<any[]>([]);
const isLoading = ref(true);
const lastEntryCount = ref(0);

const playChime = () => {
  if (process.client) {
    try {
      const audioCtx = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // High A
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(
        0.0001,
        audioCtx.currentTime + 0.5,
      );

      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.warn("Audio chime failed (interaction required?)");
    }
  }
};

const fetchQueue = async () => {
  if (!currentShopId.value) return;
  try {
    const response = await $fetch<any>("/api/admin/queue", {
      params: { shopId: currentShopId.value },
      headers: { Authorization: `Bearer ${token.value}` }
    });
    
    const data = response.items || [];
    const active = data.filter(
      (e: any) => e.status === "waiting" || e.status === "called",
    );

    // Play chime if new entries arrived
    if (lastEntryCount.value > 0 && active.length > lastEntryCount.value) {
      playChime();
      toast.info("New guest joined the waitlist!");
    }
    lastEntryCount.value = active.length;

    activeEntries.value = active;
    historyEntries.value = data.filter(
      (e: any) => e.status === "seated" || e.status === "cancelled",
    );
  } catch (e) {
    toast.error("Failed to fetch queue");
  } finally {
    isLoading.value = false;
  }
};

const updateStatus = async (id: string, status: string) => {
  try {
    await $fetch(`/api/admin/queue/${id}`, {
      method: "PATCH" as any,
      body: { status },
      headers: { Authorization: `Bearer ${token.value}` }
    });
    toast.success(`Guest marked as ${status}`);
    fetchQueue();
  } catch (e) {
    toast.error("Failed to update status");
  }
};

onMounted(() => {
  fetchQueue();
  const interval = setInterval(fetchQueue, 15000);
  onUnmounted(() => clearInterval(interval));
});

watch(currentShopId, () => {
  isLoading.value = true;
  fetchQueue();
});

const getStatusColor = (status: string) => {
  switch (status) {
    case "waiting":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "called":
      return "bg-blue-100 text-blue-700 border-blue-200 animate-pulse";
    case "seated":
      return "bg-emerald-100 text-emerald-700 border-emerald-200";
    case "cancelled":
      return "bg-neutral-100 text-neutral-500 border-neutral-200";
    default:
      return "bg-neutral-100 text-neutral-700 border-neutral-200";
  }
};
</script>

<template>
  <div class="space-y-8 animate-in fade-in duration-500 pb-12">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
      <div>
        <h2 class="text-3xl font-bold tracking-tight text-foreground">Queue Station</h2>
        <p class="text-muted-foreground text-sm font-medium">Live waitlist management for your restaurant.</p>
      </div>

      <div class="flex items-center gap-3">
        <div class="flex items-center gap-2 px-3 py-1.5 bg-primary/5 rounded-lg border border-primary/10">
          <div class="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
          <span class="text-[10px] font-bold uppercase tracking-widest text-primary">{{ activeEntries.length }} Waiting</span>
        </div>
        <Button @click="fetchQueue" variant="outline" size="sm" class="h-10 px-4 rounded-lg">
          <LucideRefreshCw class="w-3.5 h-3.5 mr-2" /> Sync Queue
        </Button>
      </div>
    </div>

    <Tabs defaultValue="active" class="w-full space-y-6">
      <TabsList class="bg-muted/50 p-1 rounded-lg border border-border/50">
        <TabsTrigger value="active" class="px-6 text-xs font-bold">
          Live Queue
        </TabsTrigger>
        <TabsTrigger value="history" class="px-6 text-xs font-bold">
          Seated History
        </TabsTrigger>
      </TabsList>

      <TabsContent value="active" class="space-y-4">
        <div
          v-if="isLoading && activeEntries.length === 0"
          class="py-20 flex flex-col items-center gap-4 text-center"
        >
          <LucideLoader2 class="w-8 h-8 animate-spin text-muted-foreground/20" />
          <p class="text-xs font-bold text-muted-foreground uppercase tracking-widest animate-pulse">Syncing list...</p>
        </div>

        <div
          v-else-if="activeEntries.length === 0"
          class="py-24 text-center space-y-4 rounded-lg border border-dashed border-border/60 bg-muted/5"
        >
          <div class="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mx-auto mb-2 opacity-40">
            <LucideUtensils class="w-6 h-6" />
          </div>
          <div class="space-y-1">
            <h3 class="text-sm font-bold text-foreground">No Waiting Guests</h3>
            <p class="text-xs text-muted-foreground font-medium">The floor is clear. Enjoy the quiet.</p>
          </div>
        </div>

        <Card class="border border-border shadow-none overflow-hidden rounded-lg">
          <Table>
            <TableHeader class="bg-muted/50">
              <TableRow>
                <TableHead class="text-[10px] font-bold uppercase tracking-widest px-6 h-12">Ticket</TableHead>
                <TableHead class="text-[10px] font-bold uppercase tracking-widest h-12">Guest Details</TableHead>
                <TableHead class="text-[10px] font-bold uppercase tracking-widest h-12">Party Size</TableHead>
                <TableHead class="text-[10px] font-bold uppercase tracking-widest h-12 text-right px-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="entry in activeEntries" :key="entry.id" class="hover:bg-muted/30 transition-colors">
                <TableCell class="px-6 py-4">
                  <div class="text-xl font-bold tracking-tight text-foreground">
                    #{{ entry.ticket_number }}
                  </div>
                </TableCell>
                <TableCell class="py-4">
                  <div class="space-y-0.5">
                    <div class="text-xs font-bold text-foreground">
                      {{ entry.name }}
                    </div>
                    <div class="text-[10px] text-muted-foreground font-medium">
                      {{ entry.phone }}
                    </div>
                  </div>
                </TableCell>
                <TableCell class="py-4 text-xs font-bold">
                   {{ entry.party_size }} Persons
                </TableCell>
                <TableCell class="text-right px-6 py-4">
                  <div class="flex items-center justify-end gap-2">
                    <Button 
                      v-if="entry.status === 'waiting'"
                      @click="updateStatus(entry.id, 'called')"
                      size="sm"
                      variant="outline"
                      class="h-8 px-3 rounded-lg text-[10px] font-bold"
                    >
                      <LucideBell class="w-3 h-3 mr-1.5" /> Call Guest
                    </Button>
                    <Button 
                      @click="updateStatus(entry.id, 'seated')"
                      size="sm"
                      class="h-8 px-4 rounded-lg text-[10px] font-bold bg-foreground text-background"
                    >
                      Seat Now
                    </Button>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" class="h-8 w-8 rounded-lg hover:bg-muted transition-colors"><LucideMoreVertical class="w-4 h-4 text-muted-foreground" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" class="w-40 p-1 rounded-lg border-border">
                        <DropdownMenuItem @click="updateStatus(entry.id, 'cancelled')" class="text-destructive focus:text-destructive text-xs font-medium rounded-md cursor-pointer">
                          <LucideXCircle class="w-3.5 h-3.5 mr-2" /> Cancel Entry
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
      </TabsContent>

      <TabsContent value="history" class="animate-in fade-in slide-in-from-top-2 duration-500">
        <div v-if="historyEntries.length === 0" class="py-24 text-center border border-dashed border-border/40 rounded-lg bg-muted/5">
          <p class="text-xs font-bold text-muted-foreground uppercase tracking-widest opacity-40">History is empty</p>
        </div>
        <Card v-else class="border border-border shadow-none rounded-lg overflow-hidden">
          <Table>
            <TableHeader class="bg-muted/50">
              <TableRow>
                <TableHead class="text-[10px] font-bold uppercase tracking-widest px-6 h-12">Ticket</TableHead>
                <TableHead class="text-[10px] font-bold uppercase tracking-widest h-12">Outcome</TableHead>
                <TableHead class="text-[10px] font-bold uppercase tracking-widest h-12">Guest</TableHead>
                <TableHead class="text-[10px] font-bold uppercase tracking-widest h-12 text-right px-6">Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="entry in historyEntries" :key="entry.id" class="hover:bg-muted/30 transition-colors opacity-70 hover:opacity-100">
                <TableCell class="px-6 py-4 font-bold">#{{ entry.ticket_number }}</TableCell>
                <TableCell>
                  <Badge variant="outline" :class="[getStatusColor(entry.status), 'text-[8px] font-bold uppercase tracking-widest py-0.5 rounded-md']">
                    {{ entry.status }}
                  </Badge>
                </TableCell>
                <TableCell class="text-xs font-bold text-foreground capitalize">{{ entry.name }}</TableCell>
                <TableCell class="text-right px-6 text-[10px] font-mono font-bold text-muted-foreground">
                  {{ new Date(entry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
      </TabsContent>
    </Tabs>
  </div>
</template>
