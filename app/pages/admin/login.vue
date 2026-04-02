<template>
  <div class="min-h-screen bg-slate-50 flex items-center justify-center p-4">
    <Card class="w-full max-w-sm border-slate-200 shadow-sm">
      <CardHeader class="space-y-1 text-center">
        <CardTitle class="text-2xl font-bold tracking-tight">Admin Login</CardTitle>
        <CardDescription>Enter your credentials to access the menu manager</CardDescription>
      </CardHeader>

      <CardContent>
        <form @submit.prevent="login" class="space-y-4">
          <div class="space-y-2">
            <Label for="email">Email</Label>
            <Input 
              id="email"
              v-model="credentials.email" 
              type="email" 
              placeholder="name@example.com"
              required
            />
          </div>

          <div class="space-y-2">
            <Label for="password">Password</Label>
            <Input 
              id="password"
              v-model="credentials.password" 
              type="password" 
              placeholder="••••••••"
              required
            />
          </div>

          <div v-if="error" class="text-xs text-red-500 font-medium text-center">
            {{ error }}
          </div>

          <Button 
            type="submit" 
            class="w-full mt-2" 
            :disabled="loading"
          >
            <LucideLoader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
            Login
          </Button>

          <div class="text-center pt-2">
            <NuxtLink to="/admin/register" class="text-sm text-slate-500 hover:text-slate-900 underline underline-offset-4 font-medium transition-colors">
              Don't have an account? Register
            </NuxtLink>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { LucideLoader2 } from 'lucide-vue-next';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

const router = useRouter();
const loading = ref(false);
const error = ref('');
const credentials = reactive({ email: '', password: '' });

// Use secure cookie for session
const token = useCookie('token', { maxAge: 60 * 60 * 24 * 7, path: '/' });
const userState = useState('user');

const login = async () => {
  if (loading.value) return;
  loading.value = true;
  error.value = '';
  
  try {
    const res = await $fetch('/api/admin/login' as any, {
      method: 'POST',
      body: credentials
    }) as any;
    
    token.value = res.token;
    userState.value = res.user;
    router.push('/admin');
  } catch (err) {
    error.value = 'Invalid email or password';
  } finally {
    loading.value = false;
  }
};
</script>
