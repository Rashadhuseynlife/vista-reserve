-- Vista Cocktail Bar — Reservation System
-- D1 schema

CREATE TABLE IF NOT EXISTS tables (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  capacity INTEGER NOT NULL,
  pos_x INTEGER NOT NULL,   -- 0-100, left position % on the floor plan
  pos_y INTEGER NOT NULL    -- 0-100, top position % on the floor plan
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
INSERT INTO tables (name, capacity, pos_x, pos_y) VALUES
-- Red Hall
('Masa 1', 6, 49, 18),
('Masa 2', 5, 28, 25),
('Masa 3', 5, 17, 49),
('Masa 4', 5, 24, 72),
('Masa 5', 6, 45, 83),
('Masa 6', 2, 89, 54),
('Masa 7', 4, 89, 69),
('Masa 8', 2, 88, 86),
-- Kontakt Bar (tək nəfərlik stullar)
('Bar 1', 1, 72, 58),
('Bar 2', 1, 67, 65),
('Bar 3', 1, 58, 70),
('Bar 4', 1, 47, 70),
('Bar 5', 1, 38, 65),
('Bar 6', 1, 33, 58),
('Bar 7', 1, 32, 49),
('Bar 8', 1, 34, 41),
('Bar 9', 1, 40, 34),
('Bar 10', 1, 49, 31),
('Bar 11', 1, 57, 31),
('Bar 12', 1, 66, 35),
('Bar 13', 1, 72, 42);

