import { NextRequest, NextResponse } from 'next/server'
import { normalizeTransactions } from '@/lib/normalize'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const transactions = normalizeTransactions()

    // find the transaction by ID across all banks
    const transaction = transactions.find(tx => tx.id === id)

    if (!transaction) {
      return NextResponse.json({ error: `Transaction with id '${id}' not found` }, { status: 404 })
    }

    return NextResponse.json(transaction, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load transaction' }, { status: 500 })
  }
}
