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
      // ONLY wipe the cookie if the server EXPLICITLY says 401 (Invalid/Expired)
      // Otherwise, keep it—it might just be a server-restarting or building issue.
      if (e.response?.status === 401) {
        token.value = null;
        user.value = null;
      }
    }
  }
});
