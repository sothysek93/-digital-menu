-- Migration: Core Evolution (Categories, Orders, Order Items)
-- This script adds the category management and ordering system tables.

-- 1. Create Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  shop_id TEXT NOT NULL,
  name TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (shop_id) REFERENCES shops(id)
);

-- 2. Update Menu Items with category context
-- SQLite doesn't support ADD COLUMN IF NOT EXISTS without checks, 
-- but running these will add them if they are missing.
ALTER TABLE menu_items ADD COLUMN category_id TEXT;
ALTER TABLE menu_items ADD COLUMN order_index INTEGER DEFAULT 0;

-- 3. Create Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  shop_id TEXT NOT NULL,
  table_number TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'confirmed', 'preparing', 'served', 'completed', 'cancelled'
  total_price REAL NOT NULL,
  customer_name TEXT,
  customer_phone TEXT,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (shop_id) REFERENCES shops(id)
);

-- 4. Create Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  menu_item_id TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price_at_time REAL NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id),
  FOREIGN KEY (menu_item_id) REFERENCES menu_items(id)
);
