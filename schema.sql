-- Vista Cocktail Bar — Reservation System
-- D1 schema

CREATE TABLE IF NOT EXISTS tables (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  pos_x INTEGER NOT NULL,   -- 0-100, left position % on the floor plan
  pos_y INTEGER NOT NULL,   -- 0-100, top position % on the floor plan
  shape TEXT NOT NULL DEFAULT 'dot'   -- 'half_circle' | 'dot' | 'square' | 'rect'
);

CREATE TABLE IF NOT EXISTS reservations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_name TEXT NOT NULL,
  phone TEXT,
  res_date TEXT NOT NULL,      -- 'YYYY-MM-DD'
  res_time TEXT NOT NULL,      -- 'HH:MM'
  guests INTEGER NOT NULL,
  table_id INTEGER NOT NULL,
  note TEXT,
  status TEXT NOT NULL DEFAULT 'active',   -- active | cancelled
  created_by TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (table_id) REFERENCES tables(id)
);

CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(res_date);

-- Vista-nın real planı: Red Hall (Masa 1-8) + Kontakt Bar (13 tək nəfərlik stul)
-- pos_x / pos_y are percentages (0-100) placing the table dot on the floor plan.
-- shape: half_circle = Red Hall divan-masalar (1-5), dot = Kontakt Bar stulları,
--        square = Masa 6/8 (oval künclü kvadrat), rect = Masa 7 (oval künclü düzbucaqlı)
INSERT INTO tables (name, capacity, pos_x, pos_y, shape) VALUES
-- Red Hall
('Masa 1', 6, 49, 18, 'half_circle'),
('Masa 2', 5, 28, 25, 'half_circle'),
('Masa 3', 5, 17, 49, 'half_circle'),
('Masa 4', 5, 24, 72, 'half_circle'),
('Masa 5', 6, 45, 83, 'half_circle'),
('Masa 6', 2, 89, 54, 'square'),
('Masa 7', 4, 89, 69, 'rect'),
('Masa 8', 2, 88, 86, 'square'),
-- Kontakt Bar (tək nəfərlik stullar)
('Bar 1', 1, 72, 58, 'dot'),
('Bar 2', 1, 67, 65, 'dot'),
('Bar 3', 1, 58, 70, 'dot'),
('Bar 4', 1, 47, 70, 'dot'),
('Bar 5', 1, 38, 65, 'dot'),
('Bar 6', 1, 33, 58, 'dot'),
('Bar 7', 1, 32, 49, 'dot'),
('Bar 8', 1, 34, 41, 'dot'),
('Bar 9', 1, 40, 34, 'dot'),
('Bar 10', 1, 49, 31, 'dot'),
('Bar 11', 1, 57, 31, 'dot'),
('Bar 12', 1, 66, 35, 'dot'),
('Bar 13', 1, 72, 42, 'dot');


