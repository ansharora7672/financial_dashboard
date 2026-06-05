import { NextResponse } from 'next/server'
import amexData from '../../../../../../data/transactions/amex.json'

// returns raw American Express transaction data exactly as is from the source file
export async function GET() {
  try {
    return NextResponse.json(amexData, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load Amex transactions' }, { status: 500 })
  }
}
