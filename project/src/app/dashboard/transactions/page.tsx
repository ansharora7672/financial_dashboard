'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { NormalizedTransaction } from '@/types'
import { CurrencyCode } from '@/lib/currency'
import FilterBar from '@/components/FilterBar'
import TransactionsTable from '@/components/TransactionsTable'
import TransactionModal from '@/components/TransactionModal'

// SWR - fetcher function that takes a URL and returns parsed JSON
const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function TransactionsPage() {
  // filter state - when any of these change, SWR automatically re-fetches
  const [bank, setBank] = useState('')
  const [authorizedBy, setAuthorizedBy] = useState('')
  const [currency, setCurrency] = useState('')
  const [fromDate, setFromDate] = useState('')

  // which tab is active: show all rows or only starred rows
  const [activeTab, setActiveTab] = useState<'all' | 'starred'>('all')

  // starred IDs loaded from localStorage so they survive page refreshes
  const [starredIds, setStarredIds] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set()
    try {
      const stored = localStorage.getItem('starred_transactions')
      return stored ? new Set(JSON.parse(stored)) : new Set()
    } catch {
      return new Set()
    }
  })

  // save to localStorage whenever starred IDs change
  useEffect(() => {
    localStorage.setItem('starred_transactions', JSON.stringify(Array.from(starredIds)))
  }, [starredIds])

  // selected transaction for the modal
  const [selectedTx, setSelectedTx] = useState<NormalizedTransaction | null>(null)

  // build API URL from active filters
  const params = new URLSearchParams()
  if (bank) params.set('bank', bank)
  if (authorizedBy) params.set('authorizedBy', authorizedBy)
  if (fromDate) params.set('fromDate', fromDate)

  // dynamic URL build
  const url = `/api/transactions?${params.toString()}`

  // SWR watches the URL - any filter change triggers a re-fetch automatically
  // isValidating is true whenever a fetch is in-flight, including filter changes
  const { data, isLoading, error, isValidating } = useSWR<NormalizedTransaction[]>(url, fetcher)

  // cap at 30 rows per spec
  const transactions = data?.slice(0, 30) ?? []

  // when starred tab is active, filter down to only starred rows
  const displayedTransactions = activeTab === 'starred'
    ? transactions.filter(tx => starredIds.has(tx.id))
    : transactions

  // count how many of the current 30 rows are starred - shown in the tab label
  const starredCount = transactions.filter(tx => starredIds.has(tx.id)).length

  // toggle star on or off for a given transaction ID
  function toggleStar(id: string) {
    setStarredIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  // build authorized by dropdown options from fetched data
  const authorizedByOptions = Array.from(
    new Map(
      (data ?? [])
        .filter(tx => tx.authorizedBy !== null)
        .map(tx => [
          tx.authorizedBy!.id,
          { id: tx.authorizedBy!.id, name: tx.authorizedBy!.name }
        ])
    ).values()
  )

  // CSV export - uses data (all filtered results) not transactions (30-row cap) so export is complete
  function handleExportCSV() {
    const headers = ['Transaction', 'Amount', 'Currency', 'Date', 'Category', 'Bank', 'Authorized By', 'Vendor']
    const rows = (data ?? []).map(tx => [
      `"${tx.description}"`,
      tx.amount,
      tx.currency,
      tx.date,
      tx.category,
      tx.bank,
      tx.authorizedBy?.name ?? '',
      `"${tx.vendor}"`,
    ])
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'transactions.csv'
    link.click()
    URL.revokeObjectURL(link.href)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-white/50 text-sm uppercase tracking-widest">Loading transactions...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-400 text-sm">Failed to load transactions. Please try again.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">

      {/* top row */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-[#c2c2c2] text-4xl uppercase tracking-wider">Transactions</h1>
        <FilterBar
          bank={bank}
          authorizedBy={authorizedBy}
          currency={currency}
          fromDate={fromDate}
          onBankChange={setBank}
          onAuthorizedByChange={setAuthorizedBy}
          onCurrencyChange={setCurrency}
          onFromDateChange={setFromDate}
          onExportCSV={handleExportCSV}
          authorizedByOptions={authorizedByOptions}
        />
      </div>

      {/* ALL / STARRED tabs */}
      <div className="flex gap-6 border-b border-white/10">
        <button
          onClick={() => setActiveTab('all')}
          className={`pb-3 text-sm uppercase tracking-wider transition-colors ${
            activeTab === 'all'
              ? 'text-white border-b-2 border-[#2563eb]'
              : 'text-white/40 hover:text-white/70'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setActiveTab('starred')}
          className={`pb-3 text-sm uppercase tracking-wider transition-colors ${
            activeTab === 'starred'
              ? 'text-white border-b-2 border-[#2563eb]'
              : 'text-white/40 hover:text-white/70'
          }`}
        >
          Starred {starredCount > 0 && `(${starredCount})`}
        </button>
      </div>

      {/* dim the table while a filter change fetch is going */}
      <div className={`transition-opacity ${isValidating ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>

        {/* empty state */}
        {displayedTransactions.length === 0 && (
          <div className="flex items-center justify-center h-64">
            <p className="text-white/50 text-sm uppercase tracking-widest">
              {activeTab === 'starred' ? 'No starred transactions' : 'No transactions match your filters'}
            </p>
          </div>
        )}

        {/* transactions table */}
        {displayedTransactions.length > 0 && (
          <TransactionsTable
            transactions={displayedTransactions}
            displayCurrency={currency as CurrencyCode | ''}
            starredIds={starredIds}
            onToggleStar={toggleStar}
            onRowClick={setSelectedTx}
          />
        )}

      </div>

      {/* modal - opens when a row is clicked, closes when onClose is called */}
      {selectedTx && (
        <TransactionModal
          transaction={selectedTx}
          onClose={() => setSelectedTx(null)}
        />
      )}

    </div>
  )
}
