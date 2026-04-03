import { query } from '../db';
import { z } from 'zod';
import { H3Event } from 'h3';

export const ShopSchema = z.object({
  id: z.string().uuid().optional(),
  owner_id: z.string().uuid(),
  name: z.string().min(2),
  slug: z.string().min(2),
  address: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  logo_url: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  business_hours: z.string().optional().nullable(),
  is_active: z.boolean().default(true).or(z.number().transform(v => !!v)),
});

export type Shop = z.infer<typeof ShopSchema>;

export class ShopService {
  static async getByOwner(event: H3Event, ownerId: string) {
    return await query(event, 'SELECT * FROM shops WHERE owner_id = ?', [ownerId]);
  }

  static async getBySlug(event: H3Event, slug: string) {
    const rows = await query(event, 'SELECT * FROM shops WHERE LOWER(slug) = LOWER(?)', [slug]);
    return rows[0] || null;
  }

  static async create(event: H3Event, shop: Omit<Shop, 'id'>) {
    const validated = ShopSchema.omit({ id: true }).parse(shop);
    
    // Check limit
    const existing = await this.getByOwner(event, validated.owner_id);
    const userRows: any[] = await query(event, 'SELECT account_type FROM users WHERE id = ?', [validated.owner_id]);
    const accountType = userRows[0]?.account_type || 'free';
    
    if (accountType === 'free' && existing.length >= 3) {
      throw createError({
        statusCode: 403,
        statusMessage: 'LIMIT_REACHED: Free accounts are limited to 3 shops. Please upgrade your account.'
      });
    }

    const id = crypto.randomUUID();
    const isActive = validated.is_active ? 1 : 0;

    await query(event, `
      INSERT INTO shops (id, owner_id, name, slug, address, phone, logo_url, description, business_hours, is_active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      validated.owner_id,
      validated.name,
      validated.slug.toLowerCase(),
      validated.address || null,
      validated.phone || null,
      validated.logo_url || null,
      validated.description || null,
      validated.business_hours || null,
      isActive
    ]);

    return { ...validated, id };
  }

  static async update(event: H3Event, id: string, shop: Partial<Shop>) {
    const validated = ShopSchema.partial().parse(shop);
    const fields = Object.keys(validated).filter(k => k !== 'id' && k !== 'owner_id');
    const values = fields.map(k => {
      const val = (validated as any)[k];
      return typeof val === 'boolean' ? (val ? 1 : 0) : val;
    });

    if (fields.length === 0) return { id };

    const setClause = fields.map(k => `${k} = ?`).join(', ');

    await query(event, `
      UPDATE shops SET ${setClause} WHERE id = ?
    `, [...values, id]);

    return { ...validated, id };
  }

  static async delete(event: H3Event, id: string) {
    await query(event, 'DELETE FROM shops WHERE id = ?', [id]);
    return { success: true };
  }
}
