import { MenuService } from '../../services/menu.service';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  return await MenuService.create(event, body);
});
