document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const password = document.getElementById("password").value;
  const name = document.getElementById("staffName").value.trim();
  const errorMsg = document.getElementById("errorMsg");
  errorMsg.textContent = "";

  try {
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ password, name }),
    });
    const data = await res.json();
    if (!res.ok) {
      errorMsg.textContent = data.error || "Xəta baş verdi";
      return;
    }
    if (name) localStorage.setItem("vista_staff_name", name);
    window.location.href = "/dashboard.html";
  } catch (err) {
    errorMsg.textContent = "Serverə qoşulmaq mümkün olmadı";
  }
});
