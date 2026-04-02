<template>
  <div class="min-h-screen bg-neutral-950 flex flex-col md:flex-row">
    <!-- Sidebar -->
    <aside class="w-full md:w-64 bg-neutral-900/50 border-r border-neutral-800 backdrop-blur-xl p-6 flex flex-col justify-between">
      <div>
        <div class="flex items-center gap-3 mb-10">
          <UAvatar src="/logo.png" size="sm" />
          <h2 class="text-xl font-bold gradient-text">Admin Panel</h2>
        </div>
        
        <nav class="space-y-2">
          <UButton 
            v-for="link in navLinks" 
            :key="link.to"
            :to="link.to"
            :icon="link.icon"
            color="primary"
            :variant="route.path === link.to ? 'solid' : 'ghost'"
            block
            class="justify-start px-4 py-3 rounded-xl"
            label="Dashboard"
            size="md"
          >
            {{ link.label }}
          </UButton>
        </nav>
      </div>

      <div class="pt-6 border-t border-neutral-800">
        <div class="flex items-center gap-3 mb-4">
          <UAvatar :alt="user?.name" size="sm" color="primary" />
          <div class="overflow-hidden">
            <p class="text-xs font-bold truncate">{{ user?.name }}</p>
            <p class="text-[10px] text-neutral-500 truncate">{{ user?.email }}</p>
          </div>
        </div>
        <UButton 
          icon="i-heroicons-arrow-left-on-rectangle" 
          color="red" 
          variant="ghost" 
          block 
          label="Logout"
          @click="logout" 
        />
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 p-4 md:p-8 overflow-y-auto">
      <slot />
    </main>
  </div>
</template>

<script setup>
const route = useRoute();
const router = useRouter();
const user = useState('user');

const navLinks = [
  { label: 'Menu Items', to: '/admin', icon: 'i-heroicons-list-bullet' },
  { label: 'Settings', to: '/admin/settings', icon: 'i-heroicons-cog-6-tooth' },
];

const logout = () => {
  localStorage.removeItem('token');
  user.value = null;
  router.push('/admin/login');
};
</script>
