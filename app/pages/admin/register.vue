<template>
  <div class="min-h-screen bg-slate-50 flex items-center justify-center p-4">
    <Card class="w-full max-w-lg border-slate-200 shadow-sm">
      <CardHeader class="space-y-1 text-center">
        <div class="flex justify-center mb-4">
          <div class="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center">
            <LucideShieldCheck class="w-5 h-5 text-white" />
          </div>
        </div>
        <CardTitle class="text-2xl font-bold tracking-tight">Create Account</CardTitle>
        <CardDescription>Register your restaurant to start managing your menu</CardDescription>
      </CardHeader>

      <CardContent>
        <form @submit.prevent="register" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <Label for="name">Restaurant Name</Label>
              <Input 
                id="name"
                v-model="form.name" 
                placeholder="The Burger Joint"
                required
              />
            </div>

            <div class="space-y-2">
              <Label for="slug">URL Slug</Label>
              <Input 
                id="slug"
                v-model="form.slug" 
                placeholder="burger-joint"
                required
              />
            </div>
          </div>

          <div class="space-y-2">
            <Label for="email">Email</Label>
            <Input 
              id="email"
              v-model="form.email" 
              type="email" 
              placeholder="name@example.com"
              required
            />
          </div>

          <div class="space-y-2">
            <Label for="password">Password</Label>
            <Input 
              id="password"
              v-model="form.password" 
              type="password" 
              placeholder="••••••••"
              required
            />
          </div>

          <Button 
            type="submit" 
            class="w-full mt-4" 
            :disabled="loading"
          >
            <LucideLoader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
            <span v-else>Register & Connect</span>
          </Button>

          <div class="text-center pt-4">
            <NuxtLink to="/admin/login" class="text-sm text-slate-500 hover:text-slate-900 underline underline-offset-4 font-medium transition-colors">
              Already have an account? Login
            </NuxtLink>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { LucideShieldCheck, LucideLoader2 } from 'lucide-vue-next';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';

const router = useRouter();
const loading = ref(false);
const token = useCookie('token', { maxAge: 60 * 60 * 24 * 7, path: '/' });
const userState = useState('user');

const form = reactive({
  name: '',
  slug: '',
  email: '',
  password: ''
});

const register = async () => {
  if (loading.value) return;
  loading.value = true;
  try {
    await $fetch('/api/admin/register' as any, {
      method: 'POST',
      body: form
    });
    
    // Auto login after registration
    const res = await $fetch('/api/admin/login' as any, {
      method: 'POST',
      body: { email: form.email, password: form.password }
    }) as any;
    
    token.value = res.token;
    userState.value = res.user;
    router.push('/admin');
  } catch (err) {
    console.error('Registration failed:', err);
  } finally {
    loading.value = false;
  }
};
</script>
