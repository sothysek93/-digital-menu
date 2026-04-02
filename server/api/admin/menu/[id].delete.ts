import { MenuService } from '../../../services/menu.service';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  if (!id) throw createError({ statusCode: 400, message: 'ID required' });
  return await MenuService.delete(event, id);
});
