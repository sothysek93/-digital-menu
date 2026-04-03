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
  
  // Explicitly sign the full identity into the JWT payload
  // so the frontend middleware can decode it locally during refresh.
  const token = await AuthService.sign(event, { 
    id: user.id, 
    name: user.name,
    email: user.email,
    account_type: user.account_type
  });
  
  return { token, user };
});
