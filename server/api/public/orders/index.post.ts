import { OrderService } from '../../services/order.service';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  
  if (!body.shop_id || !body.items || body.items.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid order data' });
  }

  return await OrderService.create(event, body);
});
