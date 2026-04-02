import { query } from '../db';
import { z } from 'zod';
import { H3Event } from 'h3';

export const MenuItemSchema = z.object({
  id: z.string().uuid().optional(),
  restaurant_id: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  price: z.number(),
  image_url: z.string().optional(),
  is_available: z.boolean().default(true).or(z.number().transform(v => !!v)),
});

export type MenuItem = z.infer<typeof MenuItemSchema>;

export class MenuService {
  static async getByRestaurantSlug(event: H3Event, slug: string) {
    const rows = await query(event, `
      SELECT m.* FROM menu_items m
      JOIN restaurants r ON m.restaurant_id = r.id
      WHERE LOWER(r.slug) = LOWER(?)
    `, [slug]);
    return rows;
  }

  static async create(event: H3Event, item: Omit<MenuItem, 'id'>) {
    const validated = MenuItemSchema.omit({ id: true }).parse(item);
    const id = crypto.randomUUID();
    
    // SQLite uses 0/1 for booleans
    const isAvail = validated.is_available ? 1 : 0;
    
    await query(event, `
      INSERT INTO menu_items (id, restaurant_id, name, description, price, image_url, is_available)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      validated.restaurant_id,
      validated.name,
      validated.description,
      validated.price,
      validated.image_url,
      isAvail
    ]);
    
    return { ...validated, id };
  }

  static async update(event: H3Event, id: string, item: Partial<MenuItem>) {
    const validated = MenuItemSchema.partial().parse(item);
    const fields = Object.keys(validated).filter(k => k !== 'id');
    const values = fields.map(k => {
      const val = (validated as any)[k];
      return typeof val === 'boolean' ? (val ? 1 : 0) : val;
    });
    
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
