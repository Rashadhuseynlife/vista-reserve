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

-- Sample floor plan for Vista — edit names / capacity / positions to match your real layout.
-- pos_x / pos_y are percentages (0-100) placing the table dot on the floor plan.
INSERT INTO tables (name, capacity, pos_x, pos_y) VALUES
('Masa 1', 2, 12, 18),
('Masa 2', 2, 12, 42),
('Masa 3', 4, 12, 68),
('Masa 4', 4, 34, 18),
('Masa 5', 4, 34, 42),
('Masa 6', 6, 34, 68),
('Masa 7', 2, 58, 22),
('Masa 8', 2, 58, 48),
('Masa 9', 6, 58, 74),
('Bar Stul 1', 1, 82, 22),
('Bar Stul 2', 1, 82, 38),
('VIP Bölmə', 8, 82, 68);
