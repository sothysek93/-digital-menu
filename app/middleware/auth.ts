export default defineNuxtRouteMiddleware(async (to) => {
  const token = useCookie('token');
  const user = useState('user');

  // If no token, redirect to login
  if (!token.value) {
    if (to.path.startsWith('/admin') && to.path !== '/admin/login' && to.path !== '/admin/register') {
      return navigateTo('/admin/login');
    }
    return;
  }

  // If we have a token but NO user profile (Refresh Case), 
  // fetch it immediately BEFORE the page even loads.
  if (!user.value) {
    try {
      const headers = useRequestHeaders(['cookie']) as any;
      const data = await $fetch('/api/admin/me', {
        headers: { 
          ...headers,
          Authorization: `Bearer ${token.value}` 
        }
      });
      user.value = data;
    } catch (e) {
      // Token is invalid—wipe and redirect
      token.value = null;
      user.value = null;
      return navigateTo('/admin/login');
    }
  }
});
