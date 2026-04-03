import { OrderService } from '../../../services/order.service';
import { defineEventHandler, getRouterParam, createError } from 'h3';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Order ID required' });

  const order = await OrderService.getOrderDetails(event, id);
  if (!order) throw createError({ statusCode: 404, statusMessage: 'Order not found' });

  return order;
});
