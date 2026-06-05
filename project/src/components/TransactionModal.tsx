'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import { NormalizedTransaction } from '@/types'
import { formatCurrency, CurrencyCode } from '@/lib/currency'

interface TransactionModalProps {
  transaction: NormalizedTransaction
  onClose: () => void
}

function formatBank(bank: string): string {
  const map: Record<string, string> = {
    chase: 'Chase',
    boa: 'Bank of America',
    amex: 'American Express',
  }
  return map[bank] ?? bank
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function TransactionModal({ transaction: tx, onClose }: TransactionModalProps) {
  // close modal when user presses Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  // get initials from name e.g. "Alex Rivera" becomes "AR"
  const initials = tx.authorizedBy
    ? tx.authorizedBy.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : null

  // cast source to a plain object so we can loop over raw bank fields
  const rawFields = Object.entries(tx.source as Record<string, unknown>)

  return (
    // overlay - clicking the dark background closes the modal
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* card - stopPropagation prevents clicks inside the card from closing the modal */}
      <div
        className="bg-[#0d1117] border border-white/10 rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >

        {/* header */}
        <div className="flex items-start justify-between p-6 border-b border-white/10">
          <div>
            <p className="text-white/40 text-xs uppercase tracking-wider mb-1">{formatBank(tx.bank)}</p>
            <h2 className="text-white text-lg font-semibold">{tx.description}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white transition-colors ml-4 shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">

          {/* amount - large and prominent with debit/credit label */}
          <div className="bg-[#0d0f14] border border-white/10 rounded-lg p-4 text-center">
            <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Amount</p>
            <p className="text-white text-2xl font-semibold">
              {formatCurrency(tx.amount, tx.currency as CurrencyCode)}
            </p>
            <span className={`text-xs uppercase tracking-wider mt-1 inline-block ${
              tx.type === 'debit' ? 'text-red-400' : 'text-green-400'
            }`}>
              {tx.type}
            </span>
          </div>

          {/* core fields in a 2-column grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Date</p>
              <p className="text-white text-sm">{formatDate(tx.date)}</p>
            </div>
            <div>
              <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Category</p>
              <p className="text-white text-sm">{tx.category}</p>
            </div>
            <div>
              <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Vendor</p>
              <p className="text-white text-sm">{tx.vendor}</p>
            </div>
            <div>
              <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Bank</p>
              <p className="text-white text-sm">{formatBank(tx.bank)}</p>
            </div>
          </div>

          {/* authorized by card */}
          {tx.authorizedBy && (
            <div>
              <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Authorized By</p>
              <div className="flex items-center gap-3 bg-[#0d0f14] border border-white/10 rounded-lg p-3">
                <div className="w-9 h-9 rounded-full bg-[#2563eb]/20 border border-[#2563eb]/40 flex items-center justify-center shrink-0">
                  <span className="text-[#2563eb] text-xs font-semibold">{initials}</span>
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{tx.authorizedBy.name}</p>
                  <p className="text-white/40 text-xs">{tx.authorizedBy.title}</p>
                  <p className="text-white/40 text-xs">{tx.authorizedBy.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* raw source data from the bank */}
          <div>
            <p className="text-white/40 text-xs uppercase tracking-wider mb-2">Raw Bank Data</p>
            <div className="bg-[#0d0f14] border border-white/10 rounded-lg p-3 flex flex-col gap-2">
              {rawFields.map(([key, value]) => (
                <div key={key} className="flex justify-between gap-4 text-xs">
                  <span className="text-white/40 shrink-0">{key}</span>
                  <span className="text-white/70 text-right break-all">
                    {typeof value === 'object' ? JSON.stringify(value) : String(value ?? '')}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
