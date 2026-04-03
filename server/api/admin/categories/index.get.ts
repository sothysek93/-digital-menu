import { CategoryService } from '../../../services/category.service';
import { AuthService } from '../../../services/auth.service';

export default defineEventHandler(async (event) => {
  const token = getHeader(event, 'Authorization')?.replace('Bearer ', '');
  if (!token) throw createError({ statusCode: 401 });

  const payload = await AuthService.verify(event, token);
  if (!payload || !payload.id) throw createError({ statusCode: 401 });

  const queryParams = getQuery(event);
  const shopId = queryParams.shopId as string;
  const page = parseInt(queryParams.page as string || '1');
  const limit = parseInt(queryParams.limit as string || '10');

  if (!shopId) throw createError({ statusCode: 400, statusMessage: 'Shop ID required' });

  return await CategoryService.getByShop(event, shopId, page, limit);
});
