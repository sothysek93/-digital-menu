import { MenuService } from '../../../services/menu.service';

export default defineEventHandler(async (event) => {
  const queryParams = getQuery(event);
  const shopId = queryParams.shopId as string;
  const page = parseInt(queryParams.page as string || '1');
  const limit = parseInt(queryParams.limit as string || '10');

  if (!shopId) throw createError({ statusCode: 400, statusMessage: 'Shop ID required' });

  return await MenuService.getByShopId(event, shopId, page, limit);
});
