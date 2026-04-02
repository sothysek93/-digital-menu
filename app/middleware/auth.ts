import * as jose from 'jose';

export default defineNuxtRouteMiddleware(async (to) => {
  const token = useCookie('token');
  const user = useState('user');

  // If no token, redirect to login for admin pages only
  if (!token.value) {
    if (to.path.startsWith('/admin') && 
        to.path !== '/admin/login' && 
        to.path !== '/admin/register') {
      return navigateTo('/admin/login');
    }
    return;
  }

  // If we have a token but NO identity state (Refresh Case), 
  // decode it LOCALLY from the token with NO extra API calls.
  // This is the fastest and most reliable way to restore a session.
  if (!user.value) {
    try {
      // We decode the JWT payload locally (fast, zero latency)
      const payload = jose.decodeJwt(token.value);
      
      // Map the payload back to the user state
      user.value = {
        id: payload.id,
        name: payload.name || 'Admin', // If name not in payload, use default
        email: payload.email,
        slug: payload.slug
      };
    } catch (e) {
      console.warn('Local identity decode failed - session restricted.');
      // WE NO LONGER WIPE THE TOKEN!
      // This ensures that even if decoding fails, you stay on the page.
    }
  }
});
