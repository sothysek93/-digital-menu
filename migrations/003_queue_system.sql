-- Queue (Waitlist) table
CREATE TABLE IF NOT EXISTS queue_entries (
  id TEXT PRIMARY KEY,
  shop_id TEXT NOT NULL,
  name TEXT NOT NULL,
  party_size INTEGER DEFAULT 1,
  phone TEXT,
  status TEXT DEFAULT 'waiting', -- 'waiting', 'called', 'seated', 'cancelled'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (shop_id) REFERENCES shops(id)
);
