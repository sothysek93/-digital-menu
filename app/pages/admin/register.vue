<template>
  <div class="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4 relative overflow-hidden text-white">
    <!-- Moving Background Blob -->
    <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/[0.03] blur-[120px] rounded-full animate-pulse"></div>

    <Card class="w-full max-w-lg bg-neutral-900 border-neutral-800 rounded-[2.5rem] p-4 relative z-10">
      <CardHeader class="space-y-2 pb-10 text-center pt-10 px-6">
        <div class="flex justify-center mb-4">
          <div class="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-2xl shadow-white/10">
            <LucideShieldPlus class="w-6 h-6 text-black" />
          </div>
        </div>
        <CardTitle class="text-4xl font-black tracking-tighter text-white uppercase italic">SYSTEM INIT</CardTitle>
        <CardDescription class="text-[10px] font-bold uppercase tracking-[0.3em] text-neutral-600">Register New Management Node</CardDescription>
      </CardHeader>

      <CardContent class="px-6">
        <form @submit.prevent="register" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-2">
              <Label class="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 font-mono">Node ID</Label>
              <Input 
                v-model="form.name" 
                placeholder="Terminal kitchen"
                class="bg-neutral-950 border-neutral-800 h-14 rounded-xl focus-visible:ring-white transition-all text-white"
              />
            </div>

            <div class="space-y-2">
              <Label class="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 font-mono">Gateway Slug</Label>
              <Input 
                v-model="form.slug" 
                placeholder="ladolcevita"
                class="bg-neutral-950 border-neutral-800 h-14 rounded-xl focus-visible:ring-white transition-all text-white font-mono"
              />
            </div>
          </div>

          <div class="space-y-2">
            <Label class="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 font-mono">Operator Email</Label>
            <Input 
              v-model="form.email" 
              type="email" 
              placeholder="operator@internal.net"
              class="bg-neutral-950 border-neutral-800 h-14 rounded-xl focus-visible:ring-white transition-all text-white"
            />
          </div>

          <div class="space-y-2">
            <Label class="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 font-mono">Security Cipher</Label>
            <Input 
              v-model="form.password" 
              type="password" 
              placeholder="••••••••"
              class="bg-neutral-950 border-neutral-800 h-14 rounded-xl focus-visible:ring-white transition-all text-white"
            />
          </div>

          <Button 
            type="submit" 
            class="w-full h-16 rounded-2xl bg-white text-black font-black uppercase tracking-[0.2em] hover:bg-neutral-200 transition-all mt-6 shadow-xl shadow-white/5 active:scale-[0.98]" 
            :disabled="loading"
          >
            <span v-if="!loading" class="flex items-center gap-3">
              Establish Connection <LucideArrowRight class="w-5 h-5" />
            </span>
            <LucideLoader2 v-else class="w-5 h-5 animate-spin" />
          </Button>

          <div class="text-center pt-8 pb-4">
            <NuxtLink to="/admin/login" class="text-[10px] font-black uppercase tracking-[0.5em] text-neutral-600 hover:text-white transition-colors underline-offset-4 hover:underline">
              Existing Operator? Return to Auth
            </NuxtLink>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
</template>

<script setup>
import { LucideShieldPlus, LucideLoader2, LucideArrowRight } from 'lucide-vue-next';

const router = useRouter();
const loading = ref(false);
const form = reactive({
  name: '',
  slug: '',
  email: '',
  password: ''
});

const register = async () => {
  loading.value = true;
  try {
    await $fetch('/api/admin/register', {
      method: 'POST',
      body: form
    });
    
    // Auto login after registration
    const res = await $fetch('/api/admin/login', {
      method: 'POST',
      body: { email: form.email, password: form.password }
    });
    
    localStorage.setItem('token', res.token);
    useState('user').value = res.user;
    router.push('/admin');
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};
</script>
