import { query } from '../../../db';

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { restaurantId, name, partySize, phone } = body;

  if (!restaurantId || !name || !partySize || !phone) {
    throw createError({ 
      statusCode: 400, 
      statusMessage: 'Phone number and name are required to join the waitlist.' 
    });
  }

  // Check if guest already has an active entry for this restaurant by phone
  const existingRecords = await query(event, 
    'SELECT * FROM queue_entries WHERE shop_id = ? AND phone = ? AND status IN ("waiting", "called") LIMIT 1',
    [restaurantId, phone]
  );

  if (existingRecords && (existingRecords as any[]).length > 0) {
    const existing = (existingRecords as any[])[0];
    
    // Get current position (how many people are before them)
    const positionResult = await query(event, 
      'SELECT COUNT(*) as count FROM queue_entries WHERE shop_id = ? AND status = "waiting" AND created_at < ?',
      [restaurantId, existing.created_at]
    );

    return {
      id: existing.id,
      status: existing.status,
      ticketNumber: existing.ticket_number,
      position: (positionResult[0] as any).count,
      isExisting: true
    };
  }

  // Generate a ticket number (e.g., T-001) for today
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const countToday = await query(event, 'SELECT COUNT(*) as count FROM queue_entries WHERE shop_id = ? AND created_at >= ?', [restaurantId, todayStart.toISOString()]);
  const ticketNumber = `T-${String((countToday[0] as any).count + 1).padStart(3, '0')}`;
  
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  await query(event, 'INSERT INTO queue_entries (id, shop_id, name, party_size, phone, status, ticket_number, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
    [id, restaurantId, name, partySize, phone, 'waiting', ticketNumber, createdAt]);
  
  // Get current position for the new entry
  const positionResult = await query(event, 
    'SELECT COUNT(*) as count FROM queue_entries WHERE shop_id = ? AND status = "waiting" AND created_at < ?',
    [restaurantId, createdAt]
  );

  return { 
    id, 
    status: 'waiting', 
    ticketNumber, 
    position: (positionResult[0] as any).count
  };
});
