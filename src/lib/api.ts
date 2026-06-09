const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

function getToken() {
  return localStorage.getItem('@saude:token')
}

function getAdminToken() {
  return localStorage.getItem('@saude:admin-token')
}

async function request(path: string, init: RequestInit = {}, tokenFn: () => string | null = getToken) {
  const token = tokenFn()
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  })

  if (res.status === 204) return null

  const body = await res.json()
  if (!res.ok) throw new Error(body.error ?? `Erro ${res.status}`)
  return body
}

export const api = {
  get:    (path: string)                => request(path),
  post:   (path: string, data: unknown) => request(path, { method: 'POST',   body: JSON.stringify(data) }),
  put:    (path: string, data: unknown) => request(path, { method: 'PUT',    body: JSON.stringify(data) }),
  delete: (path: string)                => request(path, { method: 'DELETE' }),
}

export const adminApi = {
  get:    (path: string)                => request(path, {}, getAdminToken),
  post:   (path: string, data: unknown) => request(path, { method: 'POST',   body: JSON.stringify(data) }, getAdminToken),
  put:    (path: string, data: unknown) => request(path, { method: 'PUT',    body: JSON.stringify(data) }, getAdminToken),
  delete: (path: string)                => request(path, { method: 'DELETE' }, getAdminToken),
}
