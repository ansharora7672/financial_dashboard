import { NextResponse } from 'next/server'
import chaseData from '../../../../../../data/transactions/chase.json'

// returns raw Chase transaction data exactly as is from the source file
export async function GET() {
  try {
    return NextResponse.json(chaseData, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load Chase transactions' }, { status: 500 })
  }
}
