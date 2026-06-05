'use client'

import useSWR from 'swr'
import { NormalizedTransaction } from '@/types'
import { toUSD, CurrencyCode } from '@/lib/currency'
import StatKPICard from '@/components/StatKPICard'
import BankBalanceChart from '@/components/Charts/BankBalanceChart'
import MoneyInOutChart from '@/components/Charts/MoneyInOutChart'

const fetcher = (url: string) => fetch(url).then(res => res.json())

// one color per spender in the top spender bar
const SPENDER_COLORS = ['#3b82f6', '#ef4444', '#14b8a6', '#f59e0b', '#8b5cf6', '#ec4899']

function formatUSD(amount: number): string {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(2)}M`
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(1)}K`
  return `$${amount.toFixed(2)}`
}

// "2024-09-12" -> "Sep 12, 2024"
function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// builds a running net balance array for one bank month by month
function computeBalanceData(
  transactions: NormalizedTransaction[],
  bank: 'chase' | 'boa' | 'amex',
  inUSD: (tx: NormalizedTransaction) => number
) {
  const monthlyNet = new Map<string, number>()
  transactions
    .filter(tx => tx.bank === bank)
    .forEach(tx => {
      const month = tx.date.slice(0, 7)
      const change = tx.type === 'credit' ? inUSD(tx) : -inUSD(tx)
      monthlyNet.set(month, (monthlyNet.get(month) ?? 0) + change)
    })

  let running = 0
  return Array.from(monthlyNet.keys())
    .sort()
    .map(month => {
      running += monthlyNet.get(month) ?? 0
      return { month, balance: Math.round(running) }
    })
}

export default function StatsPage() {
  const { data, isLoading, error } = useSWR<NormalizedTransaction[]>('/api/transactions', fetcher)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-white/50 text-sm uppercase tracking-widest">Loading stats...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-400 text-sm">Failed to load stats. Please try again.</p>
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-white/50 text-sm uppercase tracking-widest">No data available</p>
      </div>
    )
  }

  const inUSD = (tx: NormalizedTransaction) => toUSD(tx.amount, tx.currency as CurrencyCode)

  // total credits and debits across all banks in USD
  const totalCashIn = data
    .filter(tx => tx.type === 'credit')
    .reduce((sum, tx) => sum + inUSD(tx), 0)

  const totalCashOut = data
    .filter(tx => tx.type === 'debit')
    .reduce((sum, tx) => sum + inUSD(tx), 0)

  const netCashFlow = totalCashIn - totalCashOut

  // pre-compute all three banks so switching in the chart is instant
  const balanceData = {
    chase: computeBalanceData(data, 'chase', inUSD),
    boa: computeBalanceData(data, 'boa', inUSD),
    amex: computeBalanceData(data, 'amex', inUSD),
  }

  // monthly in vs out across all banks for the bar chart
  const monthlyInOut = (() => {
    const map = new Map<string, { month: string; in: number; out: number }>()
    data.forEach(tx => {
      const month = tx.date.slice(0, 7)
      const entry = map.get(month) ?? { month, in: 0, out: 0 }
      if (tx.type === 'credit') entry.in += inUSD(tx)
      else entry.out += inUSD(tx)
      map.set(month, entry)
    })
    return Array.from(map.values())
      .sort((a, b) => a.month.localeCompare(b.month))
      .map(d => ({ ...d, in: Math.round(d.in), out: Math.round(d.out) }))
  })()

  // top 5 spending categories from debit transactions
  const categoryBreakdown = (() => {
    const map = new Map<string, number>()
    data.filter(tx => tx.type === 'debit').forEach(tx => {
      const cat = tx.category || 'Other'
      map.set(cat, (map.get(cat) ?? 0) + inUSD(tx))
    })
    return Array.from(map.entries())
      .map(([category, total]) => ({ category, total: Math.round(total) }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
  })()

  const maxCategory = categoryBreakdown[0]?.total ?? 1

  // top 4 vendors by total debit spend, with their most recent transaction date
  const topVendors = (() => {
    const map = new Map<string, { total: number; lastDate: string }>()
    data.filter(tx => tx.type === 'debit').forEach(tx => {
      const vendor = tx.vendor || 'Unknown'
      const existing = map.get(vendor) ?? { total: 0, lastDate: '' }
      map.set(vendor, {
        total: existing.total + inUSD(tx),
        lastDate: tx.date > existing.lastDate ? tx.date : existing.lastDate,
      })
    })
    return Array.from(map.entries())
      .map(([vendor, d]) => ({ vendor, total: Math.round(d.total), lastDate: d.lastDate }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 4)
  })()

  // rank employees by how much they authorized in debits
  const topSpenders = (() => {
    const map = new Map<string, number>()
    data.filter(tx => tx.type === 'debit' && tx.authorizedBy).forEach(tx => {
      const name = tx.authorizedBy!.name
      map.set(name, (map.get(name) ?? 0) + inUSD(tx))
    })
    return Array.from(map.entries())
      .map(([name, total]) => ({ name, total: Math.round(total) }))
      .sort((a, b) => b.total - a.total)
  })()

  const totalSpend = topSpenders.reduce((sum, s) => sum + s.total, 0) || 1

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-[#c2c2c2] text-4xl uppercase tracking-wider">Stats</h1>

      <div className="grid grid-cols-[3fr_2fr] gap-4 items-start">

        {/* left column */}
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-4">
            <StatKPICard label="Total Cash In" value={formatUSD(totalCashIn)} color="green" />
            <StatKPICard label="Total Cash Out" value={formatUSD(totalCashOut)} color="red" />
            <StatKPICard
              label="Net Cash Flow"
              value={formatUSD(Math.abs(netCashFlow))}
              color={netCashFlow >= 0 ? 'green' : 'red'}
            />
          </div>
          <BankBalanceChart data={balanceData} />
          <MoneyInOutChart data={monthlyInOut} />
        </div>

        {/* right column */}
        <div className="flex flex-col gap-4">

          {/* category breakdown */}
          <div className="bg-[#0d1117] border border-white/10 rounded-lg p-6">
            <p className="text-white/70 text-xs uppercase tracking-widest mb-4">Where Does Your Money Go?</p>
            <div className="flex flex-col gap-3">
              {categoryBreakdown.map(({ category, total }) => (
                <div key={category}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-white/60 text-xs">{category}</span>
                    <span className="text-white/60 text-xs">{total.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-400 rounded-full"
                      style={{ width: `${(total / maxCategory) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* top 4 vendors table */}
          <div className="bg-[#0d1117] border border-white/10 rounded-lg p-6">
            <p className="text-white/70 text-xs uppercase tracking-widest mb-4">Top 4 Paid Vendors</p>
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-white/40 text-xs uppercase tracking-wider text-left pb-3">Vendor</th>
                  <th className="text-white/40 text-xs uppercase tracking-wider text-left pb-3">Last Transaction</th>
                  <th className="text-white/40 text-xs uppercase tracking-wider text-right pb-3">Total</th>
                </tr>
              </thead>
              <tbody>
                {topVendors.map(({ vendor, total, lastDate }) => (
                  <tr key={vendor} className="border-t border-white/5">
                    <td className="text-white/80 text-sm py-3">{vendor}</td>
                    <td className="text-white/50 text-xs py-3">{formatDate(lastDate)}</td>
                    <td className="text-white/80 text-sm py-3 text-right">
                      USD ${total.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* top spender - each segment is one person, width = their share of total spend */}
          <div className="bg-[#0d1117] border border-white/10 rounded-lg p-6">
            <p className="text-white/70 text-xs uppercase tracking-widest mb-4">Top Spender</p>
            <div className="flex h-5 rounded overflow-hidden gap-0.5">
              {topSpenders.map((s, i) => (
                <div
                  key={s.name}
                  style={{
                    width: `${(s.total / totalSpend) * 100}%`,
                    backgroundColor: SPENDER_COLORS[i % SPENDER_COLORS.length],
                  }}
                  title={`${s.name}: ${formatUSD(s.total)}`}
                />
              ))}
            </div>
            <div className="flex flex-wrap gap-3 mt-3">
              {topSpenders.map((s, i) => (
                <div key={s.name} className="flex items-center gap-1.5">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: SPENDER_COLORS[i % SPENDER_COLORS.length] }}
                  />
                  <span className="text-white/50 text-xs uppercase">{s.name}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
