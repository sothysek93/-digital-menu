import { query } from '../../../db';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { queueId, restaurantId } = body;

  if (!queueId || !restaurantId) {
    throw createError({ statusCode: 400, statusMessage: 'Ticket ID and Restaurant ID required' });
  }

  try {
    // Only allow cancelling if it exists and is in 'waiting' or 'called' status
    const results = await query(event, 
      'UPDATE queue_entries SET status = "cancelled" WHERE id = ? AND shop_id = ? AND status IN ("waiting", "called")',
      [queueId, restaurantId]
    );

    return { 
      success: true,
      message: 'You have left the waitlist.'
    };
  } catch (error) {
    console.error('Cancellation error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Could not process cancellation'
    });
  }
});
