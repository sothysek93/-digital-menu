import { CategoryService } from '../../services/category.service';
import { AuthService } from '../../services/auth.service';

export default defineEventHandler(async (event) => {
  const token = getHeader(event, 'Authorization')?.replace('Bearer ', '');
  if (!token) throw createError({ statusCode: 401 });

  const payload = await AuthService.verify(event, token);
  if (!payload || !payload.id) throw createError({ statusCode: 401 });

  const body = await readBody(event);
  return await CategoryService.create(event, body);
});
