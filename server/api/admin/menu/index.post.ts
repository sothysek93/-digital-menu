import { MenuService } from '../../../services/menu.service';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  // Ensure shop_id and category_id are present (validation in service)
  return await MenuService.create(event, body);
});
