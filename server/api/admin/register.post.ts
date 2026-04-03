import { AuthService } from '../../services/auth.service';
import { ShopService } from '../../services/shop.service';
import { query } from '../../db';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { name, slug, email, password } = body;
  
  if (!name || !slug || !email || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Missing registration details' });
  }

  // 1. Check if user already exists
  const userExists: any[] = await query(event, 'SELECT id FROM users WHERE email = ?', [email]);
  if (userExists.length > 0) {
    throw createError({ statusCode: 409, statusMessage: 'Email already registered' });
  }

  // 2. Check if slug is taken
  const slugExists = await ShopService.getBySlug(event, slug);
  if (slugExists) {
    throw createError({ statusCode: 409, statusMessage: 'Shop URL slug already taken' });
  }

  const userId = crypto.randomUUID();
  const hash = await AuthService.hashPassword(password);
  
  try {
    // 3. Create User
    await query(event, `
      INSERT INTO users (id, name, email, password, account_type) 
      VALUES (?, ?, ?, ?, 'free')
    `, [userId, name, email, hash]);

    // 4. Create Initial Shop
    await ShopService.create(event, {
      owner_id: userId,
      name: `${name}'s First Shop`,
      slug: slug.toLowerCase().trim(),
      is_active: true
    });
    
    // 5. Generate token for auto-login
    const token = await AuthService.sign(event, { id: userId, email });
    
    return { token, user: { id: userId, name, email } };
  } catch (e: any) {
     console.error('Registration error:', e);
     throw createError({ statusCode: 500, statusMessage: 'Internal server error during registration' });
  }
});
