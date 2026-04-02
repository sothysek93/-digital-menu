export default defineNuxtRouteMiddleware((to) => {
  const token = useCookie('token');
  const user = useState('user');

  // If no token, redirect to login
  if (!token.value) {
    return navigateTo('/admin/login');
  }

  // Note: We'll recover the user state in a plugin or layout
  // for persistence across refreshes.
});
