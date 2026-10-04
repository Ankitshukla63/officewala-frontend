import { api } from './api'

export interface AuthResponse { token: string; userId: string; email: string; displayName: string }

export async function signIn(email: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post('/api/auth/signin', { email, password })
  return data
}

export async function signUp(email: string, password: string, displayName?: string): Promise<AuthResponse> {
  const { data } = await api.post('/api/auth/signup', { email, password, displayName })
  return data
}

export function signOut(): void {
  localStorage.removeItem('ow_token')
  window.location.href = '/auth'
}

export function getToken(): string | null {
  return localStorage.getItem('ow_token')
}

export function saveToken(token: string): void {
  localStorage.setItem('ow_token', token)
}
