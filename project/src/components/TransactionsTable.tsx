'use client'

import { Star } from 'lucide-react'
import { NormalizedTransaction } from '@/types'
import { convertCurrency, formatCurrency, CurrencyCode } from '@/lib/currency'
import AuthorizedByTooltip from './AuthorizedByTooltip'

interface TransactionsTableProps {
  transactions: NormalizedTransaction[]
  // if set, convert all amounts to this currency for display
  displayCurrency: CurrencyCode | ''
  // set of IDs the user has starred - comes from parent page
  starredIds: Set<string>
  // called when star icon is clicked for a row
  onToggleStar: (id: string) => void
  onRowClick: (transaction: NormalizedTransaction) => void
}

// column headers matching the Figma exactly
const COLUMNS = ['Transaction', 'Amount', 'Date', 'Category', 'Bank Acc.', 'Authorized By', 'Vendor']

// formats the date from YYYY-MM-DD to "Sep 12, 2024"
// parse as local date to avoid UTC midnight shifting the day backwards
function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}


// formats bank name for display
function formatBank(bank: string): string {
  const map: Record<string, string> = {
    chase: 'Chase',
    boa: 'BoA',
    amex: 'Amex',
  }
  return map[bank] ?? bank
}

export default function TransactionsTable({
  transactions,
  displayCurrency,
  starredIds,
  onToggleStar,
  onRowClick,
}: TransactionsTableProps) {
  return (
    <div className="bg-[#0d1117] border border-white/10 rounded-lg overflow-hidden">
      <table className="w-full">

        {/* column headers */}
        <thead>
          <tr className="border-b border-white/10">
            {/* empty column for star icon */}
            <th className="w-10 py-4 px-4" />
            {COLUMNS.map(col => (
              <th
                key={col}
                className="py-4 px-3 text-left text-xs text-white/50 uppercase tracking-wider font-semibold"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {transactions.map((tx, index) => {
            // is this specific row starred?
            const isStarred = starredIds.has(tx.id)

            // calculate display amount - convert if currency selected, otherwise show original
            const displayAmount = displayCurrency
              ? formatCurrency(convertCurrency(tx.amount, tx.currency as CurrencyCode, displayCurrency), displayCurrency)
              : formatCurrency(tx.amount, tx.currency as CurrencyCode)

            return (
              <tr
                key={tx.id}
                onClick={() => onRowClick(tx)}
                className={`
                  cursor-pointer hover:bg-white/5 transition-colors
                  ${index < transactions.length - 1 ? 'border-b border-dashed border-white/10' : ''}
                `}
              >
                {/* star toggle - stopPropagation prevents the row click from also firing */}
                <td
                  className="py-4 px-4"
                  onClick={e => {
                    e.stopPropagation()
                    onToggleStar(tx.id)
                  }}
                >
                  <Star
                    size={16}
                    fill={isStarred ? '#f59e0b' : 'none'}
                    className={`transition-colors cursor-pointer ${
                      isStarred ? 'text-amber-400' : 'text-white/30 hover:text-white/60'
                    }`}
                  />
                </td>

                {/* transaction description */}
                <td className="py-4 px-3 text-white text-sm max-w-[200px] truncate">
                  {tx.description}
                </td>

                {/* amount with currency */}
                <td className="py-4 px-3 text-white text-sm whitespace-nowrap">
                  {displayAmount}
                </td>

                {/* date */}
                <td className="py-4 px-3 text-white/70 text-sm whitespace-nowrap">
                  {formatDate(tx.date)}
                </td>

                {/* category */}
                <td className="py-4 px-3 text-white/70 text-sm">
                  {tx.category}
                </td>

                {/* bank account */}
                <td className="py-4 px-3 text-white/70 text-sm">
                  {formatBank(tx.bank)}
                </td>

                {/* authorized by - shows tooltip on hover */}
                <td className="py-4 px-3 text-white/70 text-sm">
                  {tx.authorizedBy ? (
                    <AuthorizedByTooltip user={tx.authorizedBy} />
                  ) : (
                    <span className="text-white/30">—</span>
                  )}
                </td>

                {/* vendor */}
                <td className="py-4 px-3 text-white/70 text-sm">
                  {tx.vendor}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
