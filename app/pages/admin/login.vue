<template>
  <div class="min-h-screen bg-background flex items-center justify-center p-4">
    <Card class="w-full max-w-sm border-border shadow-sm">
      <CardHeader class="space-y-1 text-center">
        <div class="flex justify-center mb-4">
          <div class="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shadow-lg transition-transform hover:scale-110">
            <LucideLock class="w-5 h-5 text-primary-foreground" />
          </div>
        </div>
        <CardTitle class="text-2xl font-bold tracking-tight">Access Console</CardTitle>
        <CardDescription>Enter your credentials to manage your digital menu</CardDescription>
      </CardHeader>

      <CardContent>
        <form @submit.prevent="handleLogin" class="space-y-4">
          <div class="space-y-2">
            <Label for="email">Admin Email</Label>
            <Input 
              id="email"
              v-model="credentials.email" 
              type="email" 
              placeholder="name@example.com"
              required
            />
          </div>

          <div class="space-y-2">
            <Label for="password">Security Password</Label>
            <Input 
              id="password"
              v-model="credentials.password" 
              type="password" 
              placeholder="••••••••"
              required
            />
          </div>

          <Button 
            type="submit" 
            class="w-full mt-2 h-11" 
            :disabled="loading"
          >
            <LucideLoader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
            Sign In
          </Button>

          <div class="text-center pt-2">
            <NuxtLink to="/admin/register" class="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4 font-medium transition-colors">
              Don't have an account? Create one
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
