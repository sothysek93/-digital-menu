<template>
  <div class="min-h-screen bg-background flex items-center justify-center p-4">
    <Card class="w-full max-w-lg border-border shadow-sm">
      <CardHeader class="space-y-1 text-center">
        <div class="flex justify-center mb-4">
          <div class="w-10 h-10 rounded-lg bg-primary flex items-center justify-center transition-transform hover:rotate-12">
            <LucideShieldCheck class="w-5 h-5 text-primary-foreground" />
          </div>
        </div>
        <CardTitle class="text-2xl font-bold tracking-tight">Create Account</CardTitle>
        <CardDescription>Register your restaurant to start managing your menu</CardDescription>
      </CardHeader>

      <CardContent>
        <form @submit.prevent="handleRegister" class="space-y-4">
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
            <Label for="email">Email Address</Label>
            <Input 
              id="email"
              v-model="form.email" 
              type="email" 
              placeholder="name@example.com"
              required
            />
          </div>

          <div class="space-y-2">
            <Label for="password">Security Password</Label>
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
            class="w-full mt-4 h-11" 
            :disabled="loading"
          >
            <LucideLoader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
            <span v-else>Register & Connect</span>
          </Button>

          <div class="text-center pt-4">
            <NuxtLink to="/admin/login" class="text-sm text-muted-foreground hover:text-foreground underline underline-offset-4 font-medium transition-colors">
              Already have an account? Sign In
            </NuxtLink>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ShieldCheck as LucideShieldCheck, Loader2 as LucideLoader2 } from 'lucide-vue-next';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { toast } from 'vue-sonner';

definePageMeta({ layout: false });

const router = useRouter();
const loading = ref(false);

const token = useCookie('token', { 
  maxAge: 60 * 60 * 24 * 7, 
  path: '/', 
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production'
});
const userState = useState('user');

const form = reactive({
  name: '',
  slug: '',
  email: '',
  password: ''
});

const handleRegister = async () => {
  if (loading.value) return;
  loading.value = true;
  
  try {
    await $fetch('/api/admin/register', {
      method: 'POST',
      body: form
    });
    
    toast.success('Welcome! Your restaurant has been created.', {
      description: 'Redirecting you to your dashboard...'
    });
    
    // Auto login after registration
    const res = await $fetch('/api/admin/login', {
      method: 'POST',
      body: { email: form.email, password: form.password }
    }) as any;
    
    token.value = res.token;
    userState.value = res.user;
    
    setTimeout(() => {
      router.push('/admin');
    }, 1000);
  } catch (err: any) {
    const errorMsg = err.data?.message || 'Registration failed. Please check your details.';
    toast.error('Unable to create account', {
      description: errorMsg
    });
  } finally {
    loading.value = false;
  }
};
</script>
