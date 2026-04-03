import { query } from '../db';
import { z } from 'zod';
import { H3Event } from 'h3';

export const OrderItemSchema = z.object({
  menu_item_id: z.string().uuid(),
  quantity: z.number().int().positive(),
  price_at_time: z.number(),
});

export const OrderSchema = z.object({
  id: z.string().uuid().optional(),
  shop_id: z.string().uuid(),
  table_number: z.string().optional(),
  customer_name: z.string().optional(),
  customer_phone: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(OrderItemSchema),
});

export type Order = z.infer<typeof OrderSchema>;

export class OrderService {
  static async create(event: H3Event, order: Omit<Order, 'id'>) {
    const validated = OrderSchema.parse(order);
    const orderId = crypto.randomUUID();
    
    // Calculate total
    const totalPrice = validated.items.reduce((sum, item) => sum + (item.price_at_time * item.quantity), 0);

    // TX start (not supported directly in simple query util, but we call multiple queries)
    // 1. Create order
    await query(event, `
      INSERT INTO orders (id, shop_id, table_number, status, total_price, customer_name, customer_phone, notes)
      VALUES (?, ?, ?, 'pending', ?, ?, ?, ?)
    `, [
      orderId,
      validated.shop_id,
      validated.table_number || null,
      totalPrice,
      validated.customer_name || null,
      validated.customer_phone || null,
      validated.notes || null
    ]);

    // 2. Create items
    for (const item of validated.items) {
      await query(event, `
        INSERT INTO order_items (id, order_id, menu_item_id, quantity, price_at_time)
        VALUES (?, ?, ?, ?, ?)
      `, [
        crypto.randomUUID(),
        orderId,
        item.menu_item_id,
        item.quantity,
        item.price_at_time
      ]);
    }

    return { ...validated, id: orderId, total_price: totalPrice, status: 'pending' };
  }

  static async getByShop(event: H3Event, shopId: string) {
    const orders = await query(event, `
      SELECT * FROM orders WHERE shop_id = ? ORDER BY created_at DESC
    `, [shopId]) as any[];

    if (orders.length === 0) return [];

    // Fetch all items for these orders in one go
    const orderIds = orders.map(o => o.id);
    const placeholders = orderIds.map(() => '?').join(', ');
    const items = await query(event, `
      SELECT oi.*, m.name as item_name
      FROM order_items oi
      JOIN menu_items m ON oi.menu_item_id = m.id
      WHERE oi.order_id IN (${placeholders})
    `, orderIds) as any[];

    // Map items to orders
    return orders.map(order => ({
      ...order,
      items: items.filter(item => item.order_id === order.id)
    }));
  }

  static async getOrderDetails(event: H3Event, orderId: string) {
    const orderRows = await query(event, 'SELECT * FROM orders WHERE id = ?', [orderId]);
    if (orderRows.length === 0) return null;

    const items = await query(event, `
      SELECT oi.*, m.name as item_name, m.image_url 
      FROM order_items oi
      JOIN menu_items m ON oi.menu_item_id = m.id
      WHERE oi.order_id = ?
    `, [orderId]);

    return {
      ...orderRows[0],
      items
    };
  }

  static async updateStatus(event: H3Event, orderId: string, status: string) {
    await query(event, 'UPDATE orders SET status = ? WHERE id = ?', [status, orderId]);
    return { success: true };
  }
}
