import { AuthService } from '../../services/auth.service';

export default defineEventHandler(async (event) => {
  const { email, password } = await readBody(event);
  
  if (!email || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Missing credentials' });
  }

  const user = await AuthService.login(event, email, password);
  
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid credentials' });
  }
  
  const token = await AuthService.sign({ 
    id: user.id, 
    email: user.email,
    slug: user.slug 
  });
  
  return { token, user };
});
