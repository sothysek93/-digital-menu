<template>
  <div class="min-h-screen bg-background flex items-center justify-center p-4 animate-in fade-in duration-500">
    <Card class="w-full max-w-md border-border shadow-none rounded-lg p-6 bg-card">
      <CardHeader class="space-y-4 px-0 pt-0 pb-6 text-center">
        <div class="flex justify-center">
          <div class="w-10 h-10 rounded-lg bg-muted flex items-center justify-center border border-border">
            <LucideShieldCheck class="w-4 h-4 text-foreground" />
          </div>
        </div>
        <div class="space-y-1">
          <CardTitle class="text-xl font-bold tracking-tight uppercase">Platform Onboarding</CardTitle>
          <CardDescription class="text-[10px] font-bold uppercase tracking-widest opacity-60">Initialize New Restaurant Unit</CardDescription>
        </div>
      </CardHeader>

      <CardContent class="px-0 pb-0">
        <form @submit.prevent="handleRegister" class="space-y-5">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="space-y-1.5">
              <Label for="name" class="text-[10px] font-bold uppercase text-muted-foreground px-0.5 tracking-wider">Unit Name</Label>
              <Input 
                id="name"
                v-model="form.name" 
                placeholder="The Burger Joint"
                required
                class="h-10 rounded-lg bg-background font-medium"
              />
            </div>

            <div class="space-y-1.5">
              <Label for="slug" class="text-[10px] font-bold uppercase text-muted-foreground px-0.5 tracking-wider">URL Identifier</Label>
              <Input 
                id="slug"
                v-model="form.slug" 
                placeholder="slug-name"
                required
                class="h-10 rounded-lg bg-background font-medium"
              />
            </div>
          </div>

          <div class="space-y-1.5">
            <Label for="email" class="text-[10px] font-bold uppercase text-muted-foreground px-0.5 tracking-wider">Admin Contact</Label>
            <Input 
              id="email"
              v-model="form.email" 
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
              v-model="form.password" 
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
              Initialize & Deploy
            </Button>
          </div>

          <div class="text-center pt-2">
            <NuxtLink to="/admin/login" class="text-[10px] uppercase font-bold text-muted-foreground hover:text-foreground tracking-widest transition-colors">
              Access Existing Unit
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
    const res = await $fetch('/api/admin/register', {
      method: 'POST',
      body: form
    }) as any;
    
    // Server returns token and user on successful registration
    token.value = res.token;
    userState.value = res.user;

    toast.success('Account Created', {
      description: `Welcome! Your restaurant console is ready.`
    });
    
    setTimeout(() => {
      router.push('/admin');
    }, 1000);
  } catch (err: any) {
    // Specifically handle statusMessage from H3 errors
    const errorMsg = err.statusMessage || err.data?.message || 'We could not create your account at this time.';
    
    toast.error('Registration Blocked', {
      description: errorMsg,
      action: {
        label: 'Retry',
        onClick: () => handleRegister()
      }
    });
  } finally {
    loading.value = false;
  }
};
</script>
