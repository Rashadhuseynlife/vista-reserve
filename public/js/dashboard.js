let tables = [];
let reservations = [];
let editingId = null;
let selectedTableId = null;

const $ = (id) => document.getElementById(id);

// ---------- Init ----------
(function init() {
  const staffName = localStorage.getItem("vista_staff_name");
  if (staffName) $("staffLabel").textContent = staffName;

  const today = new Date().toISOString().slice(0, 10);
  $("datePicker").value = today;

  buildTimeOptions();
  loadTables().then(loadReservations);

  $("prevDay").addEventListener("click", () => shiftDay(-1));
  $("nextDay").addEventListener("click", () => shiftDay(1));
  $("datePicker").addEventListener("change", loadReservations);
  $("timeFilter").addEventListener("change", renderFloorPlan);
  $("newResBtn").addEventListener("click", () => openModal());
  $("modalCloseBtn").addEventListener("click", closeModal);
  $("modalSaveBtn").addEventListener("click", saveReservation);
  $("cancelResBtn").addEventListener("click", cancelReservation);
  $("logoutBtn").addEventListener("click", logout);
})();

function buildTimeOptions() {
  const select = $("timeFilter");
  select.innerHTML = "";
  for (let h = 12; h <= 25; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hour = h % 24;
      const label = `${String(hour).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      const opt = document.createElement("option");
      opt.value = label;
      opt.textContent = label;
      select.appendChild(opt);
    }
  }
  // default to current time rounded to nearest 30 min, fallback 19:00
  const now = new Date();
  const rounded = `${String(now.getHours()).padStart(2, "0")}:${now.getMinutes() < 30 ? "00" : "30"}`;
  select.value = [...select.options].some((o) => o.value === rounded) ? rounded : "19:00";
}

function shiftDay(delta) {
  const d = new Date($("datePicker").value);
  d.setDate(d.getDate() + delta);
  $("datePicker").value = d.toISOString().slice(0, 10);
  loadReservations();
}

// ---------- Data loading ----------
async function loadTables() {
  const res = await fetch("/api/tables", { credentials: "include" });
  if (!handleAuth(res)) return;
  tables = await res.json();
  populateTableSelect();
}

async function loadReservations() {
  const date = $("datePicker").value;
  const res = await fetch(`/api/reservations?date=${date}`, { credentials: "include" });
  if (!handleAuth(res)) return;
  reservations = await res.json();
  renderFloorPlan();
  renderAgenda();
}

function handleAuth(res) {
  if (res.status === 401) {
    window.location.href = "/index.html";
    return false;
  }
  return true;
}

// ---------- Floor plan ----------
function renderFloorPlan() {
  const plan = $("floorPlan");
  plan.innerHTML = "";
  const filterTime = $("timeFilter").value;

  tables.forEach((t) => {
    const match = reservations.find((r) => r.table_id === t.id && r.res_time === filterTime);
    const dot = document.createElement("button");
    dot.className = "table-dot shape-" + (t.shape || "dot") + (match ? " reserved" : "");
    dot.style.left = t.pos_x + "%";
    dot.style.top = t.pos_y + "%";
    if (t.rotation) dot.style.setProperty("--rot", t.rotation + "deg");
    const capText = t.capacity_label || `${t.capacity} nəfər`;
    if (t.shape === "dot") {
      const shortLabel = t.name.replace(/[^0-9]/g, "") || t.name;
      dot.innerHTML = escapeHtml(shortLabel);
    } else {
      dot.innerHTML = `${escapeHtml(t.name)}<span class="cap">${escapeHtml(capText)}</span>`;
    }
    dot.title = match ? `${match.customer_name} — ${match.guests} nəfər${match.created_by ? " · qəbul edən: " + match.created_by : ""}` : "Boşdur";
    dot.addEventListener("click", () => {
      if (match) {
        openModal(match);
      } else {
        openModal(null, t.id, filterTime);
      }
    });
    plan.appendChild(dot);
  });
}

// ---------- Agenda ----------
function renderAgenda() {
  const list = $("agendaList");
  list.innerHTML = "";

  if (reservations.length === 0) {
    list.innerHTML = `<div class="empty-state">
      <div class="display">Bu gün üçün rezervasiya yoxdur</div>
      <div>"+ Yeni rezervasiya" düyməsi ilə əlavə edin</div>
    </div>`;
    return;
  }

  reservations.forEach((r) => {
    const table = tables.find((t) => t.id === r.table_id);
    const item = document.createElement("div");
    item.className = "agenda-item";
    item.innerHTML = `
      <div class="time">${r.res_time}</div>
      <div class="info">
        <div class="name">${escapeHtml(r.customer_name)} · ${r.guests} nəfər</div>
        <div class="meta">${table ? escapeHtml(table.name) : "?"} ${r.phone ? "· " + escapeHtml(r.phone) : ""} ${r.note ? "· " + escapeHtml(r.note) : ""} ${r.created_by ? "· qəbul edən: " + escapeHtml(r.created_by) : ""}</div>
      </div>
    `;
    item.addEventListener("click", () => openModal(r));
    list.appendChild(item);
  });
}

// ---------- Modal ----------
function populateTableSelect() {
  const select = $("f_table");
  select.innerHTML = "";
  tables.forEach((t) => {
    const opt = document.createElement("option");
    opt.value = t.id;
    opt.textContent = `${t.name} (${t.capacity_label || t.capacity + " nəfər"})`;
    select.appendChild(opt);
  });
}

function openModal(reservation = null, presetTableId = null, presetTime = null) {
  editingId = reservation ? reservation.id : null;

  $("modalTitle").textContent = reservation ? "Rezervasiyaya bax" : "Yeni rezervasiya";
  $("modalSub").textContent = reservation
    ? (reservation.created_by ? `Qəbul edən: ${reservation.created_by}` : "Məlumatı düzəliş edin və ya ləğv edin")
    : "Məlumatları doldurun";
  $("cancelResBtn").classList.toggle("hidden", !reservation);

  $("f_name").value = reservation ? reservation.customer_name : "";
  $("f_phone").value = reservation ? reservation.phone || "" : "";
  $("f_date").value = reservation ? reservation.res_date : $("datePicker").value;
  $("f_time").value = reservation ? reservation.res_time : (presetTime || "19:00");
  $("f_guests").value = reservation ? reservation.guests : 2;
  $("f_table").value = reservation ? reservation.table_id : (presetTableId || (tables[0] && tables[0].id));
  $("f_note").value = reservation ? reservation.note || "" : "";

  $("modalOverlay").classList.remove("hidden");
}

function closeModal() {
  $("modalOverlay").classList.add("hidden");
  editingId = null;
}

async function saveReservation() {
  const payload = {
    customer_name: $("f_name").value.trim(),
    phone: $("f_phone").value.trim(),
    res_date: $("f_date").value,
    res_time: $("f_time").value,
    guests: parseInt($("f_guests").value, 10),
    table_id: parseInt($("f_table").value, 10),
    note: $("f_note").value.trim(),
    created_by: localStorage.getItem("vista_staff_name") || "Staff",
  };

  if (!payload.customer_name || !payload.res_date || !payload.res_time || !payload.guests || !payload.table_id) {
    showToast("Bütün vacib xanaları doldurun");
    return;
  }

  const url = editingId ? `/api/reservations/${editingId}` : "/api/reservations";
  const method = editingId ? "PUT" : "POST";

  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!handleAuth(res)) return;

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    showToast(data.error || "Xəta baş verdi");
    return;
  }

  closeModal();
  showToast(editingId ? "Rezervasiya yeniləndi" : "Rezervasiya əlavə olundu");
  loadReservations();
}

async function cancelReservation() {
  if (!editingId) return;
  if (!confirm("Bu rezervasiyanı ləğv etmək istədiyinizə əminsiniz?")) return;

  const res = await fetch(`/api/reservations/${editingId}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!handleAuth(res)) return;

  closeModal();
  showToast("Rezervasiya ləğv olundu");
  loadReservations();
}

async function logout() {
  await fetch("/api/auth", { method: "DELETE", credentials: "include" });
  localStorage.removeItem("vista_staff_name");
  window.location.href = "/index.html";
}

// ---------- Utils ----------
function showToast(msg) {
  const toast = $("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2200);
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str ?? "";
  return div.innerHTML;
}
