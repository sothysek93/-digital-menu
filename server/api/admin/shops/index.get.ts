import { ShopService } from '../../../services/shop.service';
import { AuthService } from '../../../services/auth.service';

export default defineEventHandler(async (event) => {
  const token = getHeader(event, 'Authorization')?.replace('Bearer ', '');
  if (!token) throw createError({ statusCode: 401 });

  const payload = await AuthService.verify(event, token);
  if (!payload || !payload.id) throw createError({ statusCode: 401 });
  const queryParams = getQuery(event);
  const page = parseInt(queryParams.page as string || '1');
  const limit = parseInt(queryParams.limit as string || '10');

  return await ShopService.getByOwner(event, payload.id as string, page, limit);
});
