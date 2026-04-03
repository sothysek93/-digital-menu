import { ShopService } from '../../../services/shop.service';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Shop ID missing' });

  return await ShopService.delete(event, id);
});
