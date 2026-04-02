import { AuthService } from '../services/auth.service';

export default defineEventHandler(async (event) => {
  // Only protect admin routes, but allow login/register
  if (
    event.path.startsWith('/api/admin/') && 
    !event.path.includes('/login') && 
    !event.path.includes('/register')
  ) {
    const authHeader = getHeader(event, 'authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError({ statusCode: 401, statusMessage: 'Unauthorized' });
    }
    
    const token = authHeader.split(' ')[1];
    const user = await AuthService.verify(event, token);
    
    if (!user) {
      throw createError({ statusCode: 401, statusMessage: 'Invalid or expired token' });
    }
    
    // Attach user to context for use in handlers
    event.context.user = user;
  }
});
