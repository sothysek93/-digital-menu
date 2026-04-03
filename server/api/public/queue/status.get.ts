import { query } from '../../../db';

export default defineEventHandler(async (event) => {
  const { restaurantId, queueId, phone } = getQuery(event);

  if (!restaurantId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing restaurant ID' });
  }

  try {
    let entry: any = null;

    if (queueId) {
      // Direct lookup by ID
      const results = await query(event, 'SELECT * FROM queue_entries WHERE id = ? AND shop_id = ?', [queueId, restaurantId]);
      if (results && (results as any[]).length > 0) entry = (results as any[])[0];
    } else if (phone) {
      // Lookup by phone (only active tickets)
      const results = await query(event, 
        'SELECT * FROM queue_entries WHERE phone = ? AND shop_id = ? AND status IN ("waiting", "called") ORDER BY created_at DESC LIMIT 1', 
        [phone, restaurantId]
      );
      if (results && (results as any[]).length > 0) entry = (results as any[])[0];
    }

    if (!entry) {
      return {
        status: 'none',
        message: 'No active ticket found'
      };
    }

    // Calculate position (how many people are before this entry with 'waiting' status)
    const positionResult = await query(event, 
      'SELECT COUNT(*) as count FROM queue_entries WHERE shop_id = ? AND status = "waiting" AND created_at < ?',
      [restaurantId, entry.created_at]
    );

    const posCount = (positionResult[0] as any).count || 0;

    return {
      id: entry.id,
      status: entry.status,
      position: posCount,
      ticketNumber: entry.ticket_number,
      name: entry.name,
      partySize: entry.party_size,
      isCalled: entry.status === 'called',
      isSeated: entry.status === 'seated'
    };
  } catch (error) {
    console.error('Error fetching queue status:', error);
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal lookup error'
    });
  }
});
