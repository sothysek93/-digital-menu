import { query } from '../db';
import { z } from 'zod';
import { H3Event } from 'h3';

export const CategorySchema = z.object({
  id: z.string().uuid().optional(),
  shop_id: z.string().uuid(),
  name: z.string().min(1),
  order_index: z.number().default(0),
});

export type Category = z.infer<typeof CategorySchema>;

export class CategoryService {
  static async getByShop(event: H3Event, shopId: string) {
    return await query(event, 'SELECT * FROM categories WHERE shop_id = ? ORDER BY order_index ASC', [shopId]);
  }

  static async create(event: H3Event, category: Omit<Category, 'id'>) {
    const validated = CategorySchema.omit({ id: true }).parse(category);
    const id = crypto.randomUUID();

    await query(event, `
      INSERT INTO categories (id, shop_id, name, order_index)
      VALUES (?, ?, ?, ?)
    `, [
      id,
      validated.shop_id,
      validated.name,
      validated.order_index
    ]);

    return { ...validated, id };
  }

  static async update(event: H3Event, id: string, category: Partial<Category>) {
    const validated = CategorySchema.partial().parse(category);
    const fields = Object.keys(validated).filter(k => k !== 'id' && k !== 'shop_id');
    const values = fields.map(k => (validated as any)[k]);

    if (fields.length === 0) return { id };

    const setClause = fields.map(k => `${k} = ?`).join(', ');

    await query(event, `
      UPDATE categories SET ${setClause} WHERE id = ?
    `, [...values, id]);

    return { ...validated, id };
  }

  static async delete(event: H3Event, id: string) {
    await query(event, 'DELETE FROM categories WHERE id = ?', [id]);
    return { success: true };
  }
}
