
// shared domain types
export type UserRole = 'admin' | 'finance_lead' | 'analyst' | 'viewer'

export type Tab = 'transactions' | 'stats' | 'custom'

export type Bank = 'chase' | 'boa' | 'amex'

export type TransactionType = 'debit' | 'credit'


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

// the unified transaction shape returned by /api/transactions
// all three banks are mapped into this shape by lib/normalize.ts
export interface NormalizedTransaction {
  id: string
  date: string            // YYYY-MM-DD
  description: string
  amount: number          // always positive - direction is in type field (credit or debit)
  currency: string        // original currency code example: "USD", "EUR", "GBP", "CAD"
  type: TransactionType
  category: string
  vendor: string
  bank: Bank
  authorizedBy: {
    id: string
    name: string
    email: string
    role: UserRole
    title: string
    department: string
  } | null                // null if the name in bank data doesn't match any user
  source: unknown         // original raw object from the bank - used in transaction detail
}