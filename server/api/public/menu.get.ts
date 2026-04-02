import { MenuService } from '../../services/menu.service';

export default defineEventHandler(async (event) => {
  const queryParams = getQuery(event);
  const slug = queryParams.slug as string;
  if (!slug) {
    throw createError({ statusCode: 400, message: 'Missing slug' });
  }
  return await MenuService.getByRestaurantSlug(event, slug);
});
