import { NormalizedTransaction, User, TransactionType} from '@/types'
import chaseData from '../../data/transactions/chase.json'
import boaData from '../../data/transactions/boa.json'
import amexData from '../../data/transactions/amex.json'
import usersData from '../../data/users/user.json'

// Each bank returns a completely different shape. These types capture exactly
// what we receive so TypeScript can help us map them correctly.

interface ChaseTransaction {
  transactionId: string
  transactionDate: string
  description: string
  amount: number          // signed: negative = debit, positive = credit
  transactionType: string // "DEBIT" | "CREDIT"
  categoryName: string
  merchantName: string
  initiatedBy: { name: string; department: string }
  currency: string
}


interface BoaTransaction {
  id: string
  transactionDate: string
  payee: string
  description: string
  amount: number          // always positive - direction determined by debitCreditMemo
  debitCreditMemo: string // "DEBIT" | "CREDIT"
  spendingCategory: string
  originator: { name: string; department: string }
  currencyCode: string
}

interface AmexCharge {
  chargeId: string
  transactionDate: string
  memo: string
  merchant: { name: string; category: string }
  amountInCents: number   // stored in cents - must divide by 100 for dollars
  type: string            // "charge" = debit | "payment" = credit
  employee: { name: string; department: string }
  billingCurrency: string
}

//user lookup
const users = usersData.users as unknown as User[]

// matches a name from bank data against user.json
// returns safe user object without password
function findUser(name: string): NormalizedTransaction['authorizedBy'] {
  const match = users.find(u => u.name.toLowerCase() === name.toLowerCase())
  if (!match) return null
  return {
    id: match.id,
    name: match.name,
    email: match.email,
    role: match.role,
    title: match.title,
    department: match.department,
  }
}

// normalizes direction strings from any bank into our TransactionType
function toType(val: string): TransactionType {
  return val.toLowerCase() === 'debit' ? 'debit' : 'credit'
}


// function to normalize each bank's unique transaction shape ]
// into our unified NormalizedTransaction shape

//CHASE
function normalizeChase(): NormalizedTransaction[] {
  return (chaseData.transactions as unknown as ChaseTransaction[]).map(tx => ({
    id: tx.transactionId,
    date: tx.transactionDate,
    description: tx.description,
    // Chase uses negative numbers for debits so Math.abs gives us a clean positive amount
    amount: Math.abs(tx.amount),
    currency: tx.currency,
    type: toType(tx.transactionType),
    category: tx.categoryName,
    vendor: tx.merchantName,
    bank: 'chase',
    authorizedBy: findUser(tx.initiatedBy.name),
    source: tx,
  }))
}

//BOA
function normalizeBoa(): NormalizedTransaction[] {
  return (boaData.transactionList as unknown as BoaTransaction[]).map(tx => ({
    id: tx.id,
    date: tx.transactionDate,
    description: tx.description,
    // BoA always sends positive amounts so no transformation needed
    amount: tx.amount,
    currency: tx.currencyCode,
    type: toType(tx.debitCreditMemo),
    category: tx.spendingCategory,
    vendor: tx.payee,
    bank: 'boa',
    authorizedBy: findUser(tx.originator.name),
    source: tx,
  }))
}

//AMEX
function normalizeAmex(): NormalizedTransaction[] {
  return (amexData.data.charges as unknown as AmexCharge[]).map(tx => ({
    id: tx.chargeId,
    date: tx.transactionDate,
    description: tx.memo,
    // Amex stores amounts in cents - divide by 100, then abs to always get positive
    amount: Math.abs(tx.amountInCents / 100),
    currency: tx.billingCurrency,
    // Amex uses "charge"/"payment" instead of "DEBIT"/"CREDIT"
    type: tx.type === 'charge' ? 'debit' : 'credit',
    category: tx.merchant.category,
    vendor: tx.merchant.name,
    bank: 'amex',
    authorizedBy: findUser(tx.employee.name),
    source: tx,
  }))
}

// merging all three banks into one unified list sorted by date
export function normalizeTransactions(): NormalizedTransaction[] {
  const all = [
    ...normalizeChase(),
    ...normalizeBoa(),
    ...normalizeAmex(),
  ]
  return all.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}