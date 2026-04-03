-- Migration: Add description and business_hours to shops table
-- Run path: wrangler d1 execute <DATABASE_NAME> --file=./migrations/001_add_shop_fields.sql

ALTER TABLE shops ADD COLUMN description TEXT;
ALTER TABLE shops ADD COLUMN business_hours TEXT;
