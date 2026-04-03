<template>
  <div class="min-h-screen bg-background flex items-center justify-center p-4 animate-in fade-in duration-500">
    <Card class="w-full max-w-sm border-border shadow-none rounded-lg p-6 bg-card">
      <CardHeader class="space-y-4 px-0 pt-0 pb-6 text-center">
        <div class="flex justify-center">
          <div class="w-10 h-10 rounded-lg bg-muted flex items-center justify-center border border-border">
            <LucideLock class="w-4 h-4 text-foreground" />
          </div>
        </div>
        <div class="space-y-1">
          <CardTitle class="text-xl font-bold tracking-tight uppercase">Admin Console</CardTitle>
          <CardDescription class="text-[10px] font-bold uppercase tracking-widest opacity-60">Authorize Session</CardDescription>
        </div>
      </CardHeader>

      <CardContent class="px-0 pb-0">
        <form @submit.prevent="handleLogin" class="space-y-5">
          <div class="space-y-1.5">
            <Label for="email" class="text-[10px] font-bold uppercase text-muted-foreground px-0.5 tracking-wider">Email Context</Label>
            <Input 
              id="email"
              v-model="credentials.email" 
              type="email" 
              placeholder="admin@platform.com"
              required
              class="h-10 rounded-lg bg-background font-medium"
            />
          </div>

          <div class="space-y-1.5">
            <Label for="password" class="text-[10px] font-bold uppercase text-muted-foreground px-0.5 tracking-wider">Security Phrase</Label>
            <Input 
              id="password"
              v-model="credentials.password" 
              type="password" 
              placeholder="••••••••"
              required
              class="h-10 rounded-lg bg-background font-medium"
            />
          </div>

          <div class="pt-2">
            <Button 
              type="submit" 
              class="w-full h-11 rounded-lg bg-foreground text-background font-bold uppercase text-[10px] tracking-[0.2em] hover:bg-foreground/90" 
              :disabled="loading"
            >
              <LucideLoader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
              Establish Connection
            </Button>
          </div>

          <div class="text-center pt-2">
            <NuxtLink to="/admin/register" class="text-[10px] uppercase font-bold text-muted-foreground hover:text-foreground tracking-widest transition-colors">
              Deploy New Profile
            </NuxtLink>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { Loader2 as LucideLoader2, Lock as LucideLock } from 'lucide-vue-next';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { toast } from 'vue-sonner';

definePageMeta({ layout: false });

const router = useRouter();
const loading = ref(false);
const credentials = reactive({ email: '', password: '' });

const token = useCookie('token', { 
  maxAge: 60 * 60 * 24 * 7, 
  path: '/', 
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production'
});
const userState = useState('user');

const handleLogin = async () => {
  if (loading.value) return;
  loading.value = true;
  
  try {
    const res = await $fetch('/api/admin/login' as any, {
      method: 'POST',
      body: credentials
    }) as any;
    
    token.value = res.token;
    userState.value = res.user;
    
    toast.success('Login Successful', {
      description: 'Redirecting to your dashboard...'
    });
    
    setTimeout(() => {
      router.push('/admin');
    }, 800);
  } catch (err: any) {
    const message = err.data?.message || 'Invalid email or password. Please try again.';
    toast.error('Authentication Failed', {
      description: message
    });
  } finally {
    loading.value = false;
  }
};
</script>
