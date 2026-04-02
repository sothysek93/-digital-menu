import { AuthService } from '../../services/auth.service';
import { query } from '../../db';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { name, slug, email, password } = body;
  
  if (!name || !slug || !email || !password) {
    throw createError({ statusCode: 400, statusMessage: 'Missing registration details' });
  }

  const hash = await AuthService.hashPassword(password);
  const id = crypto.randomUUID();
  
  try {
    await query(event, `
      INSERT INTO restaurants (id, name, slug, email, password) 
      VALUES (?, ?, ?, ?, ?)
    `, [id, name, slug, email, hash]);
    
    return { id, name, slug, email };
  } catch (e: any) {
    if (e.message?.includes('UNIQUE')) {
      throw createError({ statusCode: 409, statusMessage: 'Slug or email already exists' });
    }
    throw e;
  }
});
