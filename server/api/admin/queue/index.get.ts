import { query } from '../../../db';
import { AuthService } from '../../../services/auth.service';

export default defineEventHandler(async (event) => {
  const token = getHeader(event, 'Authorization')?.replace('Bearer ', '');
  if (!token) throw createError({ statusCode: 401 });

  const payload = await AuthService.verify(event, token);
  if (!payload || !payload.id) throw createError({ statusCode: 401 });

  const { shopId } = getQuery(event);
  if (!shopId) throw createError({ statusCode: 400, message: 'Shop ID required' });

  // Get all queue entries for the shop (including history)
  const items = await query(event, 
    'SELECT * FROM queue_entries WHERE shop_id = ? ORDER BY created_at DESC',
    [shopId]
  );

  return {
    items
  };
});
