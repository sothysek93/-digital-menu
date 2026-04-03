import { OrderService } from '../../../../services/order.service';

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id;
  if (!id) throw createError({ statusCode: 400 });

  const body = await readBody(event);
  if (!body.status) throw createError({ statusCode: 400, statusMessage: 'Status required' });

  return await OrderService.updateStatus(event, id, body.status);
});
