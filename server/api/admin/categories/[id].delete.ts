import { CategoryService } from '../../../services/category.service';
import { AuthService } from '../../../services/auth.service';

export default defineEventHandler(async (event) => {
  const token = getHeader(event, 'Authorization')?.replace('Bearer ', '');
  if (!token) throw createError({ statusCode: 401 });

  const payload = await AuthService.verify(event, token);
  if (!payload || !payload.id) throw createError({ statusCode: 401 });

  const id = getRouterParam(event, 'id');
  if (!id) throw createError({ statusCode: 400, message: 'ID required' });

  return await CategoryService.delete(event, id);
});
