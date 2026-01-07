export const apiBase = "/api";

export function authHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}` } : {};
}

export async function apiGet(path) {
  const res = await fetch(`${apiBase}${path}`, { headers: { "Content-Type": "application/json", ...authHeader() } });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function apiPost(path, body) {
  const res = await fetch(`${apiBase}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeader() },
    body: JSON.stringify(body || {})
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
