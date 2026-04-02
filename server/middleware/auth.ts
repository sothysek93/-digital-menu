import { AuthService } from '../services/auth.service';

export default defineEventHandler(async (event) => {
  // Only protect admin routes, but allow login/register
  if (
    event.path.startsWith('/api/admin/') && 
    !event.path.includes('/login') && 
    !event.path.includes('/register')
  ) {
    let token = '';

    // 1. Try to get token from Authorization header
    const authHeader = getHeader(event, 'authorization');
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    // 2. If no header, try to get token from Cookie (Critical for SSR Refreshes)
    if (!token) {
      const cookie = getCookie(event, 'token');
      if (cookie) {
        token = cookie;
      }
    }

    // If still no token, fail unauthorized
    if (!token) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
    }
    
    // Verify token with Cloudflare Edge compatibility
    const user = await AuthService.verify(event, token);
    
    if (!user) {
      throw createError({ statusCode: 401, statusMessage: 'Invalid or expired token' });
    }
    
    // Attach user to context for use in handlers
    event.context.user = user;
  }
});
