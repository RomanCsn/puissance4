export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

export async function apiFetch(path: string, init?: RequestInit) {
    const res = await fetch(`${API_URL}${path}`, init)
    return res
}
