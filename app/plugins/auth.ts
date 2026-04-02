export default defineNuxtPlugin(async (nuxtApp) => {
  const token = useCookie('token');
  const user = useState('user');

  // If we have a token but no user state (refresh case), reconstruct it
  if (token.value && !user.value) {
    try {
      const data = await $fetch('/api/admin/me', {
        headers: { Authorization: `Bearer ${token.value}` }
      });
      user.value = data;
    } catch (e) {
      // Token is invalid or expired
      token.value = null;
      user.value = null;
    }
  }
});
