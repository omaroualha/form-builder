import { api } from '@/api';

const TOKEN_KEY = 'token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
  api.setAccessToken(token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
  api.setAccessToken(null);
}
