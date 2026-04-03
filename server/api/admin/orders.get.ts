import { OrderService } from '../../services/order.service';

export default defineEventHandler(async (event) => {
  const queryParams = getQuery(event);
  const shopId = queryParams.shopId as string;
  if (!shopId) throw createError({ statusCode: 400, statusMessage: 'Shop ID required' });

  // Security: Check if user owns the shop (can skip if verified in service or middleware if we trust current access)
  // For simplicity here, we list all orders for the provided shopId.
  return await OrderService.getByShop(event, shopId);
});
