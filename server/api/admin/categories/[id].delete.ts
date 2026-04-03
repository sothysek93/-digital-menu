import { CategoryService } from '../../../services/category.service';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Category ID missing' });

  return await CategoryService.delete(event, id);
});
