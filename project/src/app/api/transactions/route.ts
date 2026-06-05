import { NextRequest, NextResponse } from 'next/server'
import { normalizeTransactions } from '@/lib/normalize'
import { Bank } from '@/types'

// valid bank values used to reject invalid bank query params early
const VALID_BANKS: Bank[] = ['chase', 'boa', 'amex']

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl

    const bank = searchParams.get('bank') as Bank | null
    const authorizedBy = searchParams.get('authorizedBy')  // user ID
    const amount = searchParams.get('amount')
    const fromDate = searchParams.get('fromDate')

    // validate bank param
    if (bank && !VALID_BANKS.includes(bank)) {
      return NextResponse.json({ error: `Invalid bank. Must be one of: ${VALID_BANKS.join(', ')}` }, { status: 400 })
    }

    // validate amount param must be a number
    if (amount && isNaN(parseFloat(amount))) {
      return NextResponse.json({ error: 'amount must be a valid number' }, { status: 400 })
    }

    // validate fromDate param must be a parseable date
    if (fromDate && isNaN(new Date(fromDate).getTime())) {
      return NextResponse.json({ error: 'fromDate must be a valid date e.g. 2024-01-01' }, { status: 400 })
    }

    let transactions = normalizeTransactions()

    // filter by bank
    if (bank) {
      transactions = transactions.filter(tx => tx.bank === bank)
    }

    // filter by authorizedBy user ID
    if (authorizedBy) {
      transactions = transactions.filter(tx => tx.authorizedBy?.id === authorizedBy)
    }

    // filter by minimum amount
    if (amount) {
      const minAmount = parseFloat(amount)
      if (!isNaN(minAmount)) {
        transactions = transactions.filter(tx => tx.amount >= minAmount)
      }
    }

    // filter by fromDate only return transactions on or after this date
    if (fromDate) {
      transactions = transactions.filter(tx => tx.date >= fromDate)
    }

    return NextResponse.json(transactions, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load transactions' }, { status: 500 })
  }
}
