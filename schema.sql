-- Vista Cocktail Bar — Reservation System
-- D1 schema

CREATE TABLE IF NOT EXISTS tables (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  capacity_label TEXT,      -- optional override text, e.g. '4-6 nəfər' instead of the plain number
  pos_x INTEGER NOT NULL,   -- 0-100, left position % on the floor plan
  pos_y INTEGER NOT NULL,   -- 0-100, top position % on the floor plan
  shape TEXT NOT NULL DEFAULT 'dot',   -- 'half_circle' | 'dot' | 'square' | 'rect'
  rotation INTEGER NOT NULL DEFAULT 0  -- degrees, used by half_circle shapes to face the center
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
-- rotation: half_circle masalarının mərkəzə tərəf "baxması" üçün bucaq
INSERT INTO tables (name, capacity, capacity_label, pos_x, pos_y, shape, rotation) VALUES
-- Red Hall (böyük dairə üzrə, hər biri mərkəzə tərəf baxır)
('Masa 1', 5, '4-6 nəfər', 52, 10, 'half_circle', 0),
('Masa 2', 5, '4-6 nəfər', 19, 27, 'half_circle', -45),
('Masa 3', 5, '4-6 nəfər', 12, 50, 'half_circle', -90),
('Masa 4', 5, '4-6 nəfər', 19, 78, 'half_circle', -135),
('Masa 5', 5, '4-6 nəfər', 52, 90, 'half_circle', -180),
-- Sağ tərəf, ayrıca sütun
('Masa 6', 2, NULL, 88, 34, 'square', 0),
('Masa 7', 4, NULL, 88, 56, 'rect', 0),
('Masa 8', 2, NULL, 88, 80, 'square', 0),
-- Kontakt Bar (tək nəfərlik stullar, sağda giriş üçün boşluq — Bar13 ilə Bar1 arasında)
('Bar 13', 1, NULL, 69, 44, 'dot', 0),
('Bar 12', 1, NULL, 64, 37, 'dot', 0),
('Bar 11', 1, NULL, 57, 33, 'dot', 0),
('Bar 10', 1, NULL, 49, 32, 'dot', 0),
('Bar 9', 1, NULL, 41, 36, 'dot', 0),
('Bar 8', 1, NULL, 36, 42, 'dot', 0),
('Bar 7', 1, NULL, 34, 50, 'dot', 0),
('Bar 6', 1, NULL, 36, 58, 'dot', 0),
('Bar 5', 1, NULL, 41, 64, 'dot', 0),
('Bar 4', 1, NULL, 49, 68, 'dot', 0),
('Bar 3', 1, NULL, 57, 67, 'dot', 0),
('Bar 2', 1, NULL, 64, 63, 'dot', 0),
('Bar 1', 1, NULL, 69, 56, 'dot', 0);






