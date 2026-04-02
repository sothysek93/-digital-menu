<template>
  <div class="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
    <div class="w-full max-w-md glass p-8 rounded-3xl border border-neutral-800 bg-neutral-900/50 backdrop-blur-2xl">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-extrabold gradient-text mb-2">Welcome Back</h1>
        <p class="text-neutral-400 text-sm italic">Manage your digital menu items with ease.</p>
      </div>

      <form @submit.prevent="login" class="space-y-6">
        <UFormGroup label="Email address" name="email" :error="error">
          <UInput 
            v-model="credentials.email" 
            type="email" 
            placeholder="admin@restaurant.com" 
            icon="i-heroicons-envelope" 
            size="lg" 
            class="rounded-xl"
          />
        </UFormGroup>

        <UFormGroup label="Password" name="password">
          <UInput 
            v-model="credentials.password" 
            type="password" 
            placeholder="••••••••" 
            icon="i-heroicons-lock-closed" 
            size="lg"
            class="rounded-xl"
          />
        </UFormGroup>

        <UButton 
          type="submit" 
          block 
          color="primary" 
          size="xl" 
          label="Sign In" 
          :loading="loading" 
          class="rounded-2xl font-bold uppercase tracking-wider"
        />

        <div class="text-center text-sm">
          <p class="text-neutral-400">Don't have an account? 
            <NuxtLink to="/admin/register" class="text-primary hover:underline font-bold">Register here</NuxtLink>
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
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
    error.value = 'Invalid email or password';
  } finally {
    loading.value = false;
  }
};
</script>
