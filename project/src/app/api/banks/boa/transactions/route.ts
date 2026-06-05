import { NextResponse } from 'next/server'
import boaData from '../../../../../../data/transactions/boa.json'

// returns raw Bank of America transaction data exactly as is from the source file
export async function GET() {
  try {
    return NextResponse.json(boaData, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load Bank of America transactions' }, { status: 500 })
  }
}
