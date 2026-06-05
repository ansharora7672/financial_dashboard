
// shared domain types
export type UserRole = 'admin' | 'finance_lead' | 'analyst' | 'viewer'

export type Tab = 'transactions' | 'stats' | 'custom'


// user interface for the application from user.json
export interface User {
  id: string
  email: string
  password: string 
  name: string
  title: string
  role: UserRole
  allowedTabs: Tab[]
  department: string
  active: boolean
  createdAt: string
}

// user interface for the authenticated user in the application. 
// stored in local storage after login.
export interface AuthUser {
  id: string
  name: string
  role: UserRole       
  allowedTabs: Tab[]
}