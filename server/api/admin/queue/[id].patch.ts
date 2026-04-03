import { query } from '../../../db';
import { AuthService } from '../../../services/auth.service';

export default defineEventHandler(async (event) => {
  const token = getHeader(event, 'Authorization')?.replace('Bearer ', '');
  if (!token) throw createError({ statusCode: 401 });

  const payload = await AuthService.verify(event, token);
  if (!payload || !payload.id) throw createError({ statusCode: 401 });

  const id = getRouterParam(event, 'id');
  const body = await readBody(event);
  const { status } = body;

  if (!status) throw createError({ statusCode: 400, message: 'Status required' });

  await query(event, 
    'UPDATE queue_entries SET status = ? WHERE id = ?',
    [status, id]
  );

  return { success: true };
});
