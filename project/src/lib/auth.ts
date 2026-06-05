// client side authentication logic and helper funcs

import { AuthUser, UserRole, Tab } from '@/types'

const AUTH_USER_KEY = 'financial_dashboard_auth_user'

const VALID_ROLES: UserRole[] = ['admin', 'finance_lead', 'analyst', 'viewer']
const VALID_TABS: Tab[] = ['transactions', 'stats', 'custom']

// runtime validation
function isValidAuthUser(obj: unknown): obj is AuthUser {
  if (typeof obj !== 'object' || obj === null) return false
  const user = obj as AuthUser
  return (
    typeof user.id === 'string' &&
    typeof user.name === 'string' &&
    VALID_ROLES.includes(user.role) &&
    Array.isArray(user.allowedTabs) &&
    user.allowedTabs.every(tab => VALID_TABS.includes(tab))
  )
}

// SET auth user in local storage after login
export function setUser(user: AuthUser): void {
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
}

// CLEAR auth user from local storage on logout or invalid data
export function clearUser(): void {
  localStorage.removeItem(AUTH_USER_KEY)
}

// GET auth user from local storage
export function getUser(): AuthUser | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(AUTH_USER_KEY)
  if (!raw) return null
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!isValidAuthUser(parsed)) { clearUser(); return null }
    return parsed
  } catch {
    clearUser()
    return null
  }
}

// LOGIN function - gets the user data and calls the api route to validate the credentials.
// On success, it stores the user data in local storage and returns it. 
// On failure, it throws an error.
export async function login(email: string, password: string): Promise<AuthUser> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) {
    const { error } = await res.json()
    throw new Error(error || 'Invalid credentials')
  }
  const user: AuthUser = await res.json()
  setUser(user)
  return user
}