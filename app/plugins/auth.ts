export default defineNuxtPlugin(async (nuxtApp) => {
  const token = useCookie('token');
  const user = useState('user');

  // ON THE SERVER: We need to ensure internal $fetch forwards the cookies
  // ON THE CLIENT: It works automatically
  
  if (token.value && !user.value) {
    try {
      // Use useRequestHeaders to forward cookies during SSR
      const headers = useRequestHeaders(['cookie']) as any;
      
      const data = await $fetch('/api/admin/me' as any, {
        headers: {
          ...headers,
          Authorization: `Bearer ${token.value}`
        }
      });
      user.value = data;
    } catch (e: any) {
      console.warn('Session reconstruction failed, but keeping the token for retry.');
      // WE NO LONGER WIPE THE TOKEN HERE!
      // This ensures that temporary server delays don't log you out.
    }
  }
});
