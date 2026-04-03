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

  static async syncFromOtherShop(event: H3Event, sourceShopId: string, targetShopId: string, includeBranding = false) {
    // 1. Optional Branding & Service Sync
    if (includeBranding) {
      const sourceShop: any[] = await query(event, 'SELECT * FROM shops WHERE id = ?', [sourceShopId]);
      if (sourceShop[0]) {
        const s = sourceShop[0];
        await query(event, `
          UPDATE shops SET 
            logo_url = ?, 
            business_hours = ?, 
            phone = ?, 
            address = ?, 
            description = ?
          WHERE id = ?
        `, [s.logo_url, s.business_hours, s.phone, s.address, s.description, targetShopId]);
      }
    }

    // 2. Load Target state for duplicate detection
    const existingCategories: any[] = await query(event, 'SELECT * FROM categories WHERE shop_id = ?', [targetShopId]);
    const targetCatMap = new Map(existingCategories.map(c => [c.name.toLowerCase(), c.id]));
    
    // 3. Sync Categories
    const sourceCategories: any[] = await query(event, 'SELECT * FROM categories WHERE shop_id = ?', [sourceShopId]);
    const categoryIdMapping = new Map<string, string>(); // sourceId -> targetId

    for (const cat of sourceCategories) {
      const existingId = targetCatMap.get(cat.name.toLowerCase());
      if (existingId) {
        categoryIdMapping.set(cat.id, existingId);
      } else {
        const newId = crypto.randomUUID();
        await query(event, 'INSERT INTO categories (id, shop_id, name, order_index) VALUES (?, ?, ?, ?)', [
          newId, targetShopId, cat.name, cat.order_index
        ]);
        categoryIdMapping.set(cat.id, newId);
      }
    }

    // 4. Load Target Items for duplicate detection
    const existingItems: any[] = await query(event, 'SELECT name, category_id FROM menu_items WHERE shop_id = ?', [targetShopId]);
    const itemGuard = new Set(existingItems.map(i => `${i.category_id}|${i.name.toLowerCase()}`));

    // 5. Sync Items
    const sourceItems: any[] = await query(event, 'SELECT * FROM menu_items WHERE shop_id = ?', [sourceShopId]);
    let syncedCount = 0;

    for (const item of sourceItems) {
      const targetCategoryId = categoryIdMapping.get(item.category_id);
      if (!targetCategoryId) continue;

      const itemKey = `${targetCategoryId}|${item.name.toLowerCase()}`;
      if (itemGuard.has(itemKey)) continue;

      const newId = crypto.randomUUID();
      await query(event, `
        INSERT INTO menu_items (id, shop_id, category_id, name, description, price, image_url, is_available, order_index)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        newId, targetShopId, targetCategoryId, item.name, item.description, item.price, item.image_url, item.is_available, item.order_index
      ]);
      syncedCount++;
    }
    
    return { itemsCount: syncedCount };
  }
}
