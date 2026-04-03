import { query } from '../db';
import { z } from 'zod';
import { H3Event } from 'h3';

export const MenuItemSchema = z.object({
  id: z.string().uuid().optional(),
  shop_id: z.string().uuid(),
  category_id: z.string().uuid(),
  name: z.string(),
  description: z.string().nullable().optional(),
  price: z.number(),
  image_url: z.string().nullable().optional(),
  is_available: z.boolean().default(true).or(z.number().transform(v => !!v)),
  order_index: z.number().default(0),
});

export type MenuItem = z.infer<typeof MenuItemSchema>;

export class MenuService {
  static async getByShopSlug(event: H3Event, slug: string) {
    const rows = await query(event, `
      SELECT m.*, c.name as category_name FROM menu_items m
      JOIN shops s ON m.shop_id = s.id
      LEFT JOIN categories c ON m.category_id = c.id
      WHERE LOWER(s.slug) = LOWER(?)
      ORDER BY COALESCE(c.order_index, 0) DESC, m.order_index ASC
    `, [slug]);
    return rows;
  }

  static async getByShopId(event: H3Event, shopId: string, page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const items = await query(event, `
      SELECT m.*, c.name as category_name FROM menu_items m
      JOIN categories c ON m.category_id = c.id
      WHERE m.shop_id = ?
      ORDER BY c.order_index ASC, m.order_index ASC
      LIMIT ? OFFSET ?
    `, [shopId, limit, offset]);

    const countRows: any[] = await query(event, 'SELECT COUNT(*) as total FROM menu_items WHERE shop_id = ?', [shopId]);
    const total = countRows[0]?.total || 0;

    return { items, total };
  }

  static async create(event: H3Event, item: Omit<MenuItem, 'id'>) {
    const validated = MenuItemSchema.omit({ id: true }).parse(item);
    const id = crypto.randomUUID();
    
    // SQLite uses 0/1 for booleans
    const isAvail = validated.is_available ? 1 : 0;
    
    await query(event, `
      INSERT INTO menu_items (id, shop_id, category_id, name, description, price, image_url, is_available, order_index)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      validated.shop_id,
      validated.category_id,
      validated.name,
      validated.description || null,
      validated.price,
      validated.image_url || null,
      isAvail,
      validated.order_index || 0
    ]);
    
    return { ...validated, id };
  }

  static async update(event: H3Event, id: string, item: Partial<MenuItem>) {
    const validated = MenuItemSchema.partial().parse(item);
    const fields = Object.keys(validated).filter(k => k !== 'id' && k !== 'shop_id');
    const values = fields.map(k => {
      const val = (validated as any)[k];
      if (typeof val === 'boolean') return val ? 1 : 0;
      return val === undefined ? null : val;
    });
    
    if (fields.length === 0) return { id };

    const setClause = fields.map(k => `${k} = ?`).join(', ');
    
    await query(event, `
      UPDATE menu_items SET ${setClause} WHERE id = ?
    `, [...values, id]);
    
    return { ...validated, id };
  }

  static async delete(event: H3Event, id: string) {
    await query(event, 'DELETE FROM menu_items WHERE id = ?', [id]);
    return { success: true };
  }
}
