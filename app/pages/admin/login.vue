<template>
  <div class="min-h-screen bg-neutral-950 flex items-center justify-center p-4 relative overflow-hidden">
    <!-- Grid Background -->
    <div class="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px]"></div>

    <Card class="w-full max-w-sm bg-neutral-900 border-neutral-800 rounded-[2rem] p-4 relative z-10">
      <CardHeader class="space-y-1 pb-8 text-center pt-8">
        <CardTitle class="text-3xl font-black tracking-tighter text-white">AUTHENTICATION</CardTitle>
        <CardDescription class="text-neutral-500 uppercase tracking-[0.2em] text-[10px] font-bold">Secure Access for Management</CardDescription>
      </CardHeader>

      <CardContent>
        <form @submit.prevent="login" class="space-y-4">
          <div class="space-y-2">
            <Label for="email" class="text-xs font-bold uppercase tracking-widest text-neutral-400">Email</Label>
            <Input 
              id="email"
              v-model="credentials.email" 
              type="email" 
              placeholder="operator@kitchen.internal"
              class="bg-neutral-950 border-neutral-800 h-12 rounded-xl focus-visible:ring-white transition-all"
            />
          </div>

          <div class="space-y-2">
            <Label for="password" class="text-xs font-bold uppercase tracking-widest text-neutral-400">Security Key</Label>
            <Input 
              id="password"
              v-model="credentials.password" 
              type="password" 
              placeholder="••••••••"
              class="bg-neutral-950 border-neutral-800 h-12 rounded-xl focus-visible:ring-white transition-all"
            />
          </div>

          <div v-if="error" class="text-xs text-red-500 font-bold uppercase tracking-tighter text-center animate-pulse">
            {{ error }}
          </div>

          <Button 
            type="submit" 
            class="w-full h-12 rounded-xl bg-white text-black font-black uppercase tracking-[0.2em] hover:bg-neutral-200 transition-all mt-4" 
            :disabled="loading"
          >
            <span v-if="!loading">Execute Login</span>
            <LucideLoader2 v-else class="w-4 h-4 animate-spin" />
          </Button>

          <div class="text-center pt-6 pb-4">
            <NuxtLink to="/admin/register" class="text-[10px] font-black uppercase tracking-widest text-neutral-500 hover:text-white transition-colors">
              Request New Credentials
            </NuxtLink>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
</template>

<script setup>
import { LucideLoader2 } from 'lucide-vue-next';

const router = useRouter();
const loading = ref(false);
const error = ref('');
const credentials = reactive({ email: '', password: '' });
const userState = useState('user');

const login = async () => {
  loading.value = true;
  error.value = '';
  
  try {
    const res = await $fetch('/api/admin/login', {
      method: 'POST',
      body: credentials
    });
    
    localStorage.setItem('token', res.token);
    userState.value = res.user;
    router.push('/admin');
  } catch (err) {
    error.value = 'ACCESS DENIED: INVALID SIGNATURE';
  } finally {
    loading.value = false;
  }
};
</script>
