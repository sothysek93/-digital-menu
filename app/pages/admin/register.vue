<template>
  <div class="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
    <div class="w-full max-w-lg glass p-10 rounded-3xl border border-neutral-800 bg-neutral-900/50 backdrop-blur-2xl">
      <div class="text-center mb-10">
        <h1 class="text-3xl font-extrabold gradient-text mb-2">Create Your Restaurant</h1>
        <p class="text-neutral-400 text-sm italic">Join our platform and get your digital menu live in minutes.</p>
      </div>

      <form @submit.prevent="register" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UFormGroup label="Restaurant Name" name="name" required>
            <UInput v-model="form.name" placeholder="La Dolce Vita" size="lg" class="rounded-xl" />
          </UFormGroup>

          <UFormGroup label="Unique URL" help="menu.com/your-slug" name="slug" required>
            <UInput v-model="form.slug" placeholder="ladolcevita" size="lg" class="rounded-xl" />
          </UFormGroup>
        </div>

        <UFormGroup label="Email address" name="email" required>
          <UInput v-model="form.email" type="email" placeholder="owner@restaurant.com" size="lg" class="rounded-xl" />
        </UFormGroup>

        <UFormGroup label="Password" name="password" required>
          <UInput v-model="form.password" type="password" placeholder="••••••••" size="lg" class="rounded-xl" />
        </UFormGroup>

        <UButton 
          type="submit" 
          block 
          color="primary" 
          size="xl" 
          label="Get Started" 
          :loading="loading" 
          class="rounded-2xl font-bold uppercase tracking-wider"
        />

        <div class="text-center text-sm pt-4">
          <p class="text-neutral-400">Already with us? 
            <NuxtLink to="/admin/login" class="text-primary hover:underline font-bold">Login now</NuxtLink>
          </p>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
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
