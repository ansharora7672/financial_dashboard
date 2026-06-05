'use client'

import { ChevronDown } from 'lucide-react'
import { CurrencyCode } from '@/lib/currency'
import { Bank } from '@/types'

interface FilterBarProps {
  bank: string
  authorizedBy: string
  currency: string
  fromDate: string
  onBankChange: (val: string) => void
  onAuthorizedByChange: (val: string) => void
  onCurrencyChange: (val: string) => void
  onFromDateChange: (val: string) => void
  onExportCSV: () => void
  authorizedByOptions: { id: string; name: string }[]
}

const BANKS: { value: Bank | ''; label: string }[] = [
  { value: '', label: 'All Banks' },
  { value: 'chase', label: 'Chase' },
  { value: 'boa', label: 'Bank of America' },
  { value: 'amex', label: 'American Express' },
]

const CURRENCIES: { value: CurrencyCode | ''; label: string }[] = [
  { value: '', label: 'Original Currency' },
  { value: 'USD', label: 'USD' },
  { value: 'EUR', label: 'EUR' },
  { value: 'GBP', label: 'GBP' },
  { value: 'CAD', label: 'CAD' },
]

const selectClass = `
  w-full bg-transparent text-white text-sm uppercase
  tracking-wider focus:outline-none cursor-pointer appearance-none pr-6
`
const optionStyle = { backgroundColor: '#0d0f14', color: 'white' }

function SelectWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex items-center bg-[#0d0f14] border border-white/20 rounded h-10 px-3 hover:border-white/40 transition-colors">
      {children}
      <ChevronDown size={14} className="absolute right-2 text-white/50 pointer-events-none" />
    </div>
  )
}

export default function FilterBar({
  bank, authorizedBy, currency, fromDate,
  onBankChange, onAuthorizedByChange, onCurrencyChange, onFromDateChange,
  onExportCSV, authorizedByOptions
}: FilterBarProps) {
  return (
    <div className="flex items-center gap-3 flex-wrap">

      {/* filter by who authorized the transaction */}
      <SelectWrapper>
        <select
          value={authorizedBy}
          onChange={e => onAuthorizedByChange(e.target.value)}
          className={selectClass}
        >
          <option value="" style={optionStyle}>Auth. By</option>
          {authorizedByOptions.map(u => (
            <option key={u.id} value={u.id} style={optionStyle}>{u.name}</option>
          ))}
        </select>
      </SelectWrapper>

      {/* convert all amounts to a single currency for display */}
      <SelectWrapper>
        <select
          value={currency}
          onChange={e => onCurrencyChange(e.target.value)}
          className={selectClass}
        >
          {CURRENCIES.map(c => (
            <option key={c.value} value={c.value} style={optionStyle}>{c.label}</option>
          ))}
        </select>
      </SelectWrapper>

      {/* filter by bank */}
      <SelectWrapper>
        <select
          value={bank}
          onChange={e => onBankChange(e.target.value)}
          className={selectClass}
        >
          {BANKS.map(b => (
            <option key={b.value} value={b.value} style={optionStyle}>{b.label}</option>
          ))}
        </select>
      </SelectWrapper>

      {/* exports currently filtered transactions as a CSV file */}
      <button
        onClick={onExportCSV}
        className="h-10 px-4 border border-white/20 rounded text-white text-sm uppercase tracking-wider hover:border-[#2563eb] hover:text-[#2563eb] transition-colors flex items-center gap-2"
      >
        <span>↓</span> CSV
      </button>

      {/* show only transactions on or after this date */}
      <input
        type="date"
        value={fromDate}
        onChange={e => onFromDateChange(e.target.value)}
        className="bg-[#0d0f14] text-white border border-white/20 rounded px-3 h-10 text-sm focus:outline-none focus:border-[#2563eb] cursor-pointer hover:border-white/40 transition-colors"
      />

    </div>
  )
}
