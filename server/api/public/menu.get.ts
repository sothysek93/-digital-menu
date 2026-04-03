import { MenuService } from '../../services/menu.service';
import { ShopService } from '../../services/shop.service';

export default defineEventHandler(async (event) => {
  const queryParams = getQuery(event);
  const slug = queryParams.slug as string;
  if (!slug) {
    throw createError({ statusCode: 400, message: 'Missing slug' });
  }

  const shop = await ShopService.getBySlug(event, slug);
  if (!shop) throw createError({ statusCode: 404, message: 'Shop not found' });

  const items = await MenuService.getByShopSlug(event, slug);
  
  return {
    shop,
    items
  };
});
