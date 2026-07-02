import {
  createSessionToken,
  verifySessionToken,
  getCookie,
  sessionCookieHeader,
  clearSessionCookieHeader,
} from "./lib/auth.js";

function json(obj, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "Content-Type": "application/json", ...extraHeaders },
  });
}

async function requireAuth(request, env) {
  const token = getCookie(request, "session");
  const valid = await verifySessionToken(token, env.SESSION_SECRET);
  return valid;
}

async function handleLogin(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Yanlış sorğu" }, 400);
  }
  const { password, name } = body;

  if (!password || password !== env.STAFF_PASSWORD) {
    return json({ error: "Şifrə yanlışdır" }, 401);
  }

  const token = await createSessionToken(env.SESSION_SECRET);
  return json(
    { ok: true, name: name || "Staff" },
    200,
    { "Set-Cookie": sessionCookieHeader(token, 60 * 60 * 12) }
  );
}

function handleLogout() {
  return json({ ok: true }, 200, { "Set-Cookie": clearSessionCookieHeader() });
}

async function getTables(env) {
  const { results } = await env.DB.prepare("SELECT * FROM tables ORDER BY id").all();
  return json(results);
}

async function listReservations(request, env) {
  const url = new URL(request.url);
  const date = url.searchParams.get("date");

  let query = "SELECT * FROM reservations WHERE status = 'active'";
  const binds = [];
  if (date) {
    query += " AND res_date = ?";
    binds.push(date);
  }
  query += " ORDER BY res_time ASC";

  const { results } = await env.DB.prepare(query).bind(...binds).all();
  return json(results);
}

async function createReservation(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Yanlış sorğu" }, 400);
  }

  const { customer_name, phone, res_date, res_time, guests, table_id, note, created_by } = body;

  if (!customer_name || !res_date || !res_time || !guests || !table_id) {
    return json({ error: "Bütün vacib xanalar doldurulmalıdır" }, 400);
  }

  const result = await env.DB.prepare(
    `INSERT INTO reservations (customer_name, phone, res_date, res_time, guests, table_id, note, created_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(customer_name, phone || null, res_date, res_time, guests, table_id, note || null, created_by || null)
    .run();

  return json({ ok: true, id: result.meta.last_row_id }, 201);
}

async function updateReservation(request, env, id) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Yanlış sorğu" }, 400);
  }

  const { customer_name, phone, res_date, res_time, guests, table_id, note } = body;

  if (!customer_name || !res_date || !res_time || !guests || !table_id) {
    return json({ error: "Bütün vacib xanalar doldurulmalıdır" }, 400);
  }

  await env.DB.prepare(
    `UPDATE reservations
     SET customer_name = ?, phone = ?, res_date = ?, res_time = ?, guests = ?, table_id = ?, note = ?
     WHERE id = ?`
  )
    .bind(customer_name, phone || null, res_date, res_time, guests, table_id, note || null, id)
    .run();

  return json({ ok: true });
}

async function cancelReservation(env, id) {
  await env.DB.prepare(`UPDATE reservations SET status = 'cancelled' WHERE id = ?`).bind(id).run();
  return json({ ok: true });
}

async function purgeAllReservations(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Yanlış sorğu" }, 400);
  }

  if (!body.password || body.password !== env.STAFF_PASSWORD) {
    return json({ error: "Şifrə yanlışdır" }, 401);
  }

  await env.DB.prepare(`UPDATE reservations SET status = 'cancelled' WHERE status = 'active'`).run();
  return json({ ok: true });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // Auth endpoints (open)
    if (path === "/api/auth" && method === "POST") return handleLogin(request, env);
    if (path === "/api/auth" && method === "DELETE") return handleLogout();

    // Protected API endpoints
    if (path.startsWith("/api/")) {
      const authed = await requireAuth(request, env);
      if (!authed) return json({ error: "Giriş tələb olunur" }, 401);

      if (path === "/api/tables" && method === "GET") return getTables(env);
      if (path === "/api/reservations" && method === "GET") return listReservations(request, env);
      if (path === "/api/reservations" && method === "POST") return createReservation(request, env);

      const idMatch = path.match(/^\/api\/reservations\/(\d+)$/);
      if (idMatch && method === "PUT") return updateReservation(request, env, idMatch[1]);
      if (idMatch && method === "DELETE") return cancelReservation(env, idMatch[1]);

      if (path === "/api/reservations/purge" && method === "POST") return purgeAllReservations(request, env);

      return json({ error: "Tapılmadı" }, 404);
    }

    // Anything else: let static assets handle it (should rarely be reached,
    // since matching static files are served before the Worker runs).
    return env.ASSETS.fetch(request);
  },
};
