import { MenuService } from '../../../services/menu.service';

export default defineEventHandler(async (event) => {
  const queryParams = getQuery(event);
  const shopId = queryParams.shopId as string;
  if (!shopId) throw createError({ statusCode: 400, statusMessage: 'Shop ID required' });

  return await MenuService.getByShopId(event, shopId);
});
