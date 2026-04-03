import { ShopService } from '../../../services/shop.service';
import { AuthService } from '../../../services/auth.service';

export default defineEventHandler(async (event) => {
  const token = getHeader(event, 'Authorization')?.replace('Bearer ', '');
  if (!token) throw createError({ statusCode: 401 });

  const payload = await AuthService.verify(event, token);
  if (!payload || !payload.id) throw createError({ statusCode: 401 });

  const body = await readBody(event);
  return await ShopService.create(event, { ...body, owner_id: payload.id as string });
});
