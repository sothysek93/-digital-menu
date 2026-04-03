import { ShopService } from '../../../services/shop.service';

export default defineEventHandler(async (event) => {
  const account = event.context.user;
  if (!account) throw createError({ statusCode: 401, message: 'Unauthorized' });

  const id = getRouterParam(event, 'id');
  if (!id) throw createError({ statusCode: 400, message: 'Missing ID' });

  const body = await readBody(event);
  
  // Update shop
  return await ShopService.update(event, id, body);
});
