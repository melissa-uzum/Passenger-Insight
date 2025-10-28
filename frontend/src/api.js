const BASE = import.meta.env.VITE_API_BASE || "";

async function http(path, options = {}) {
  const token = localStorage.getItem("pi_token");
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const msg = await res.text().catch(() => res.statusText);
    throw new Error(msg || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  health: () => http("/api/health"),
  flowsLatest: () => http("/api/flows/latest"),
  flowsHistory: (hours = 24, stationId) =>
    http(`/api/flows/history?hours=${hours}${stationId ? `&station_id=${stationId}` : ""}`),
  incidents: () => http("/api/incidents"),
  login: (email, password) =>
    http("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  postFlow: (payload) =>
    http("/api/flows", { method: "POST", body: JSON.stringify(payload) }),
};
