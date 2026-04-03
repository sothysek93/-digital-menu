import { z } from 'zod';
import { MenuService } from '../../../services/menu.service';

const syncSchema = z.object({
  sourceShopId: z.string().uuid(),
  targetShopId: z.string().uuid(),
  includeBranding: z.boolean().default(false)
});

export default defineEventHandler(async (event) => {
  const user = event.context.user;
  if (!user) {
    throw createError({ statusCode: 401, message: 'Unauthorized access' });
  }

  const body = await readBody(event);
  const { sourceShopId, targetShopId, includeBranding } = syncSchema.parse(body);

  if (sourceShopId === targetShopId) {
    throw createError({ statusCode: 400, message: 'Source and target must be unique' });
  }

  try {
    const result = await MenuService.syncFromOtherShop(event, sourceShopId, targetShopId, includeBranding);
    return { 
      success: true, 
      message: 'Location data synchronized',
      count: result.itemsCount
    };
  } catch (e: any) {
    console.error('❌ Sync Error:', e);
    throw createError({
      statusCode: 500,
      message: e.message || 'Synchronization failed'
    });
  }
});
