import { OrderService } from '../../../services/order.service';

export default defineEventHandler(async (event) => {
  const queryParams = getQuery(event);
  const shopId = queryParams.shopId as string;
  if (!shopId) throw createError({ statusCode: 400, statusMessage: 'Shop ID required' });

  const page = Number(queryParams.page) || 1;
  const limit = Number(queryParams.limit) || 10;
  const status = queryParams.status as string || undefined;

  const [orders, total] = await Promise.all([
    OrderService.getByShop(event, shopId, page, limit, status),
    OrderService.countByShop(event, shopId, status)
  ]);

  return { orders, total };
});
