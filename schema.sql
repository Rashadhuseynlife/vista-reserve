-- Vista Cocktail Bar — Reservation System
-- D1 schema

CREATE TABLE IF NOT EXISTS tables (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  capacity_label TEXT,      -- optional override text, e.g. '4-6 nəfər' instead of the plain number
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
INSERT INTO tables (name, capacity, capacity_label, pos_x, pos_y, shape) VALUES
-- Red Hall (böyük dairə üzrə, Kontakt Bar-dan uzaq saxlanılıb ki, üst-üstə düşməsin)
('Masa 1', 5, '4-6 nəfər', 52, 12, 'half_circle'),
('Masa 2', 5, '4-6 nəfər', 21, 28, 'half_circle'),
('Masa 3', 5, '4-6 nəfər', 14, 50, 'half_circle'),
('Masa 4', 5, '4-6 nəfər', 25, 77, 'half_circle'),
('Masa 5', 5, '4-6 nəfər', 52, 88, 'half_circle'),
-- Sağ tərəf, ayrıca sütun
('Masa 6', 2, NULL, 88, 36, 'square'),
('Masa 7', 4, NULL, 88, 56, 'rect'),
('Masa 8', 2, NULL, 88, 78, 'square'),
-- Kontakt Bar (tək nəfərlik stullar, kiçik daxili dairə)
('Bar 1', 1, NULL, 68, 46, 'dot'),
('Bar 2', 1, NULL, 64, 39, 'dot'),
('Bar 3', 1, NULL, 57, 35, 'dot'),
('Bar 4', 1, NULL, 50, 34, 'dot'),
('Bar 5', 1, NULL, 43, 37, 'dot'),
('Bar 6', 1, NULL, 38, 43, 'dot'),
('Bar 7', 1, NULL, 36, 50, 'dot'),
('Bar 8', 1, NULL, 38, 58, 'dot'),
('Bar 9', 1, NULL, 43, 63, 'dot'),
('Bar 10', 1, NULL, 50, 66, 'dot'),
('Bar 11', 1, NULL, 58, 65, 'dot'),
('Bar 12', 1, NULL, 64, 60, 'dot'),
('Bar 13', 1, NULL, 68, 54, 'dot');



